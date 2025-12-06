const anchor = require("@coral-xyz/anchor");
const { Connection, Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } = require("@solana/web3.js");
const { TOKEN_PROGRAM_ID, createMint, getOrCreateAssociatedTokenAccount, mintTo } = require("@solana/spl-token");
const fs = require("fs");
const path = require("path");

const NETWORK = "https://api.testnet.solana.com";
const PROGRAM_ID = new PublicKey("11111111111111111111111111111111"); // Update after deployment

async function main() {
    console.log("🧪 ReachPay Campaign Flow Test\n");

    // Setup connection
    const connection = new Connection(NETWORK, "confirmed");

    // Load keypairs
    const payerKeypairData = JSON.parse(
        fs.readFileSync(path.join(process.env.HOME, ".config/solana/id.json"), "utf-8")
    );
    const payer = Keypair.fromSecretKey(new Uint8Array(payerKeypairData));

    console.log(`Payer: ${payer.publicKey.toString()}`);

    // Generate test keypairs
    const brand = Keypair.generate();
    const creator = Keypair.generate();
    const oracle = payer; // Use payer as oracle for testing

    console.log(`Brand: ${brand.publicKey.toString()}`);
    console.log(`Creator: ${creator.publicKey.toString()}`);
    console.log(`Oracle: ${oracle.publicKey.toString()}\n`);

    // Airdrop SOL for testing
    console.log("💰 Airdropping SOL to test accounts...");
    try {
        const brandAirdrop = await connection.requestAirdrop(brand.publicKey, 2 * 1e9);
        await connection.confirmTransaction(brandAirdrop);
        console.log(`  ✅ Brand airdrop confirmed`);

        const creatorAirdrop = await connection.requestAirdrop(creator.publicKey, 2 * 1e9);
        await connection.confirmTransaction(creatorAirdrop);
        console.log(`  ✅ Creator airdrop confirmed\n`);
    } catch (error) {
        console.error(`  ⚠️  Airdrop failed (testnet might be congested): ${error.message}\n`);
    }

    // Create mock USDC token (testnet)
    console.log("🪙 Creating mock USDC token...");
    const mintAuthority = payer;
    const mint = await createMint(
        connection,
        payer,
        mintAuthority.publicKey,
        null,
        6 // 6 decimals like USDC
    );
    console.log(`  Mock USDC Mint: ${mint.toString()}\n`);

    // Create token accounts
    console.log("📦 Creating token accounts...");
    const brandTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mint,
        brand.publicKey
    );
    console.log(`  Brand Token Account: ${brandTokenAccount.address.toString()}`);

    const creatorTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mint,
        creator.publicKey
    );
    console.log(`  Creator Token Account: ${creatorTokenAccount.address.toString()}\n`);

    // Mint tokens to brand (1,000,000 USDC = 1,000,000,000,000 lamports)
    console.log("💵 Minting tokens to brand...");
    await mintTo(
        connection,
        payer,
        mint,
        brandTokenAccount.address,
        mintAuthority,
        1000000 * 1e6 // 1M USDC
    );
    console.log(`  ✅ Minted 1,000,000 USDC to brand\n`);

    // Load program
    const idlPath = path.join(__dirname, "../target/idl/reachpay_solana.json");
    const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));

    const wallet = new anchor.Wallet(payer);
    const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
    const program = new anchor.Program(idl, PROGRAM_ID, provider);

    // Generate campaign ID
    const campaignId = Keypair.generate().publicKey;
    console.log(`📋 Campaign ID: ${campaignId.toString()}\n`);

    // Derive PDAs
    const [campaignPDA] = await PublicKey.findProgramAddress(
        [Buffer.from("campaign"), campaignId.toBuffer()],
        program.programId
    );

    const [escrowPDA] = await PublicKey.findProgramAddress(
        [Buffer.from("escrow"), campaignId.toBuffer()],
        program.programId
    );

    console.log(`  Campaign PDA: ${campaignPDA.toString()}`);
    console.log(`  Escrow PDA: ${escrowPDA.toString()}\n`);

    // Campaign parameters
    const cpm = new anchor.BN(10 * 1e6); // $10 CPM
    const likeWeight = new anchor.BN(20); // 1 like = 20 views
    const maxBudget = new anchor.BN(1000 * 1e6); // $1,000 budget
    const startTime = new anchor.BN(Math.floor(Date.now() / 1000));
    const endTime = new anchor.BN(Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60); // 30 days

    console.log("📝 Campaign Parameters:");
    console.log(`  CPM: $${cpm.toNumber() / 1e6}`);
    console.log(`  Like Weight: ${likeWeight.toString()}`);
    console.log(`  Max Budget: $${maxBudget.toNumber() / 1e6}`);
    console.log(`  Duration: 30 days\n`);

    console.log("═══════════════════════════════════════════════════════");
    console.log("Step 1: Brand Creates Campaign");
    console.log("═══════════════════════════════════════════════════════\n");

    try {
        const tx = await program.methods
            .createCampaign(
                campaignId,
                cpm,
                likeWeight,
                maxBudget,
                creator.publicKey,
                startTime,
                endTime
            )
            .accounts({
                campaign: campaignPDA,
                escrowTokenAccount: escrowPDA,
                brand: brand.publicKey,
                brandTokenAccount: brandTokenAccount.address,
                mint: mint,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                rent: SYSVAR_RENT_PUBKEY,
            })
            .signers([brand])
            .rpc();

        console.log(`✅ Campaign created! Transaction: ${tx}\n`);
    } catch (error) {
        console.error(`❌ Error creating campaign: ${error.message}`);
        console.error(`   This is expected if the program is not deployed yet.\n`);
    }

    console.log("═══════════════════════════════════════════════════════");
    console.log("Step 2: Creator Accepts Campaign");
    console.log("═══════════════════════════════════════════════════════\n");

    try {
        const tx = await program.methods
            .acceptCampaign()
            .accounts({
                campaign: campaignPDA,
                creator: creator.publicKey,
            })
            .signers([creator])
            .rpc();

        console.log(`✅ Campaign accepted! Transaction: ${tx}\n`);
    } catch (error) {
        console.error(`❌ Error accepting campaign: ${error.message}\n`);
    }

    console.log("═══════════════════════════════════════════════════════");
    console.log("Step 3: Oracle Updates Metrics");
    console.log("═══════════════════════════════════════════════════════\n");

    const views = new anchor.BN(50000);
    const likes = new anchor.BN(2500);

    console.log(`Simulated X Post Metrics:`);
    console.log(`  Views: ${views.toString()}`);
    console.log(`  Likes: ${likes.toString()}`);
    console.log(`  Effective Views: ${views.toNumber() + (likes.toNumber() * likeWeight.toNumber())}\n`);

    try {
        const tx = await program.methods
            .updateMetrics(views, likes)
            .accounts({
                campaign: campaignPDA,
                oracle: oracle.publicKey,
            })
            .signers([oracle])
            .rpc();

        console.log(`✅ Metrics updated! Transaction: ${tx}\n`);
    } catch (error) {
        console.error(`❌ Error updating metrics: ${error.message}\n`);
    }

    console.log("═══════════════════════════════════════════════════════");
    console.log("Step 4: Settle Payout");
    console.log("═══════════════════════════════════════════════════════\n");

    const effectiveViews = views.toNumber() + (likes.toNumber() * likeWeight.toNumber());
    const expectedPayout = Math.floor(effectiveViews / 1000) * (cpm.toNumber() / 1e6);
    console.log(`Expected Payout: $${expectedPayout}\n`);

    try {
        const tx = await program.methods
            .settlePayout()
            .accounts({
                campaign: campaignPDA,
                escrowTokenAccount: escrowPDA,
                creatorTokenAccount: creatorTokenAccount.address,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .rpc();

        console.log(`✅ Payout settled! Transaction: ${tx}\n`);
    } catch (error) {
        console.error(`❌ Error settling payout: ${error.message}\n`);
    }

    console.log("═══════════════════════════════════════════════════════");
    console.log("✅ Test Flow Complete!");
    console.log("═══════════════════════════════════════════════════════\n");

    console.log("📊 Summary:");
    console.log(`  Campaign ID: ${campaignId.toString()}`);
    console.log(`  Mock USDC Mint: ${mint.toString()}`);
    console.log(`  Brand: ${brand.publicKey.toString()}`);
    console.log(`  Creator: ${creator.publicKey.toString()}`);
    console.log(`\n💡 To continue testing:`);
    console.log(`  1. Deploy the program to testnet`);
    console.log(`  2. Update PROGRAM_ID in this script`);
    console.log(`  3. Run: node test-flow.js`);
}

main().catch(console.error);
