const anchor = require("@coral-xyz/anchor");
const { Connection, Keypair, PublicKey, clusterApiUrl } = require("@solana/web3.js");
const { TOKEN_PROGRAM_ID } = require("@solana/spl-token");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Configuration
const NETWORK = process.env.SOLANA_NETWORK || "devnet";
const PROGRAM_ID = new PublicKey("11111111111111111111111111111111"); // Replace with deployed program ID
const ORACLE_KEYPAIR_PATH = process.env.ORACLE_KEYPAIR_PATH || path.join(process.env.HOME, ".config/solana/id.json");

class SolTierOracle {
    constructor() {
        // Initialize Solana connection with proper network selection
        const rpcUrl = NETWORK === "mainnet"
            ? clusterApiUrl("mainnet-beta")
            : NETWORK === "testnet"
                ? "https://api.testnet.solana.com"
                : "https://api.devnet.solana.com"; // devnet as default

        this.connection = new Connection(rpcUrl, "confirmed");

        // Load oracle keypair
        const oracleKeypairData = JSON.parse(fs.readFileSync(ORACLE_KEYPAIR_PATH, "utf-8"));
        this.oracleKeypair = Keypair.fromSecretKey(new Uint8Array(oracleKeypairData));

        console.log(`Oracle Public Key: ${this.oracleKeypair.publicKey.toString()}`);
        console.log(`Network: ${NETWORK}`);

        // Load IDL
        const idlPath = path.join(__dirname, "../target/idl/reachpay_solana.json");
        this.idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));

        // Create provider
        const wallet = new anchor.Wallet(this.oracleKeypair);
        this.provider = new anchor.AnchorProvider(this.connection, wallet, {
            commitment: "confirmed",
        });

        // Create program instance
        this.program = new anchor.Program(this.idl, PROGRAM_ID, this.provider);
    }

    /**
     * Derive campaign PDA
     */
    async getCampaignPDA(campaignId) {
        const [campaignPDA] = await PublicKey.findProgramAddress(
            [Buffer.from("campaign"), campaignId.toBuffer()],
            this.program.programId
        );
        return campaignPDA;
    }

    /**
     * Fetch metrics from X/Twitter (mock implementation for MVP)
     * In production, this would call Twitter API
     */
    async fetchXMetrics(tweetUrl) {
        console.log(`[MOCK] Fetching metrics for: ${tweetUrl}`);

        // For MVP: return mock data or read from config
        // In production: call Twitter API
        const mockMetrics = {
            views: Math.floor(Math.random() * 1000000) + 100000,
            likes: Math.floor(Math.random() * 50000) + 5000,
        };

        console.log(`  Views: ${mockMetrics.views}`);
        console.log(`  Likes: ${mockMetrics.likes}`);

        return mockMetrics;
    }

    /**
     * Update campaign metrics on-chain
     */
    async updateCampaignMetrics(campaignId, newViews, newLikes) {
        try {
            const campaignPDA = await this.getCampaignPDA(campaignId);

            // Fetch current campaign data
            const campaign = await this.program.account.campaign.fetch(campaignPDA);

            // Ensure monotonic increase
            if (newViews < campaign.views.toNumber() || newLikes < campaign.likes.toNumber()) {
                throw new Error("Metrics cannot decrease (monotonic constraint)");
            }

            console.log(`Updating metrics for campaign: ${campaignId.toString()}`);
            console.log(`  Current: Views=${campaign.views.toNumber()}, Likes=${campaign.likes.toNumber()}`);
            console.log(`  New: Views=${newViews}, Likes=${newLikes}`);

            // Send update_metrics transaction
            const tx = await this.program.methods
                .updateMetrics(
                    new anchor.BN(newViews),
                    new anchor.BN(newLikes)
                )
                .accounts({
                    campaign: campaignPDA,
                    oracle: this.oracleKeypair.publicKey,
                })
                .rpc();

            console.log(`[SUCCESS] Metrics updated. Transaction: ${tx}`);

            return { success: true, tx };
        } catch (error) {
            console.error(`[ERROR] Error updating metrics: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * Settle payout for a campaign
     */
    async settlePayout(campaignId, creatorTokenAccount) {
        try {
            const campaignPDA = await this.getCampaignPDA(campaignId);

            const [escrowPDA] = await PublicKey.findProgramAddress(
                [Buffer.from("escrow"), campaignId.toBuffer()],
                this.program.programId
            );

            console.log(`Settling payout for campaign: ${campaignId.toString()}`);

            const tx = await this.program.methods
                .settlePayout()
                .accounts({
                    campaign: campaignPDA,
                    escrowTokenAccount: escrowPDA,
                    creatorTokenAccount: new PublicKey(creatorTokenAccount),
                    tokenProgram: TOKEN_PROGRAM_ID,
                })
                .rpc();

            console.log(`[SUCCESS] Payout settled. Transaction: ${tx}`);

            return { success: true, tx };
        } catch (error) {
            console.error(`[ERROR] Error settling payout: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * Monitor campaigns and auto-update metrics
     */
    async monitorCampaigns(interval = 60000) {
        console.log(`Starting campaign monitoring (interval: ${interval}ms)...`);

        setInterval(async () => {
            try {
                // Fetch all active campaigns
                const campaigns = await this.program.account.campaign.all([
                    {
                        memcmp: {
                            offset: 8 + 32 + 32 + 32 + 8 + 8 + 8 + 8 + 8 + 8 + 8 + 8,
                            bytes: anchor.utils.bytes.bs58.encode([1]), // is_active = true
                        },
                    },
                ]);

                console.log(`Found ${campaigns.length} active campaigns`);

                for (const { publicKey, account } of campaigns) {
                    // For MVP: use mock metrics
                    const metrics = await this.fetchXMetrics("mock_tweet_url");

                    // Update metrics if changed
                    if (metrics.views > account.views.toNumber() || metrics.likes > account.likes.toNumber()) {
                        await this.updateCampaignMetrics(account.campaignId, metrics.views, metrics.likes);

                        // Auto-settle payout after updating metrics
                        // Note: Creator token account should be tracked separately
                        // await this.settlePayout(account.campaignId, creatorTokenAccount);
                    }
                }
            } catch (error) {
                console.error(`Monitoring error: ${error.message}`);
            }
        }, interval);
    }

    /**
     * Get campaign status
     */
    async getCampaignStatus(campaignId) {
        try {
            const campaignPDA = await this.getCampaignPDA(campaignId);
            const campaign = await this.program.account.campaign.fetch(campaignPDA);

            const effectiveViews = campaign.views.toNumber() + (campaign.likes.toNumber() * campaign.likeWeight.toNumber());
            const totalDue = Math.floor(effectiveViews / 1000) * campaign.cpm.toNumber();
            const remainingPayout = totalDue - campaign.totalPaid.toNumber();

            return {
                campaignId: campaign.campaignId.toString(),
                brand: campaign.brand.toString(),
                creator: campaign.creator.toString(),
                cpm: campaign.cpm.toNumber(),
                likeWeight: campaign.likeWeight.toNumber(),
                maxBudget: campaign.maxBudget.toNumber(),
                escrowBalance: campaign.escrowBalance.toNumber(),
                views: campaign.views.toNumber(),
                likes: campaign.likes.toNumber(),
                effectiveViews,
                totalPaid: campaign.totalPaid.toNumber(),
                remainingPayout: Math.min(remainingPayout, campaign.escrowBalance.toNumber()),
                isActive: campaign.isActive,
                startTime: new Date(campaign.startTime.toNumber() * 1000),
                endTime: new Date(campaign.endTime.toNumber() * 1000),
            };
        } catch (error) {
            console.error(`Error fetching campaign: ${error.message}`);
            throw error;
        }
    }
}

// CLI interface
if (require.main === module) {
    const oracle = new SolTierOracle();

    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
        case "monitor":
            console.log("Starting oracle monitoring service...");
            oracle.monitorCampaigns(parseInt(args[1]) || 60000);
            break;

        case "update":
            if (args.length < 4) {
                console.error("Usage: node oracle.js update <campaignId> <views> <likes>");
                process.exit(1);
            }
            const campaignId = new PublicKey(args[1]);
            const views = parseInt(args[2]);
            const likes = parseInt(args[3]);
            oracle.updateCampaignMetrics(campaignId, views, likes);
            break;

        case "settle":
            if (args.length < 3) {
                console.error("Usage: node oracle.js settle <campaignId> <creatorTokenAccount>");
                process.exit(1);
            }
            oracle.settlePayout(new PublicKey(args[1]), args[2]);
            break;

        case "status":
            if (args.length < 2) {
                console.error("Usage: node oracle.js status <campaignId>");
                process.exit(1);
            }
            oracle.getCampaignStatus(new PublicKey(args[1])).then(status => {
                console.log(JSON.stringify(status, null, 2));
                process.exit(0);
            });
            break;

        default:
            console.log("ReachPay Oracle Service");
            console.log("\nUsage:");
            console.log("  node oracle.js monitor [interval_ms]           - Start monitoring service");
            console.log("  node oracle.js update <campaignId> <views> <likes> - Manual metrics update");
            console.log("  node oracle.js settle <campaignId> <creatorTokenAccount> - Settle payout");
            console.log("  node oracle.js status <campaignId>             - Get campaign status");
            process.exit(0);
    }
}

module.exports = SolTierOracle;
