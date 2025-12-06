const express = require("express");
const { PublicKey } = require("@solana/web3.js");
const ReachPayOracle = require("./oracle");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Initialize oracle
const oracle = new ReachPayOracle();

/**
 * Health check
 */
app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "ReachPay Oracle API" });
});

/**
 * Get campaign status
 */
app.get("/campaign/:id/status", async (req, res) => {
    try {
        const campaignId = new PublicKey(req.params.id);
        const status = await oracle.getCampaignStatus(campaignId);
        res.json({ success: true, data: status });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

/**
 * Manual metrics update
 */
app.post("/metrics/update", async (req, res) => {
    try {
        const { campaignId, views, likes } = req.body;

        if (!campaignId || views === undefined || likes === undefined) {
            return res.status(400).json({
                success: false,
                error: "Missing required fields: campaignId, views, likes",
            });
        }

        const result = await oracle.updateCampaignMetrics(
            new PublicKey(campaignId),
            views,
            likes
        );

        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Settle payout
 */
app.post("/campaign/:id/settle", async (req, res) => {
    try {
        const campaignId = new PublicKey(req.params.id);
        const { creatorTokenAccount } = req.body;

        if (!creatorTokenAccount) {
            return res.status(400).json({
                success: false,
                error: "Missing required field: creatorTokenAccount",
            });
        }

        const result = await oracle.settlePayout(campaignId, creatorTokenAccount);

        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Verify wallet ownership (simple challenge-response)
 */
app.post("/wallet/verify", async (req, res) => {
    try {
        const { publicKey, signature, message } = req.body;

        if (!publicKey || !signature || !message) {
            return res.status(400).json({
                success: false,
                error: "Missing required fields: publicKey, signature, message",
            });
        }

        // In production, verify the signature
        // For now, just acknowledge
        res.json({
            success: true,
            message: "Wallet verification endpoint (implement signature verification)",
            publicKey,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 ReachPay Oracle API running on port ${PORT}`);
    console.log(`   Network: ${process.env.SOLANA_NETWORK || "testnet"}`);
    console.log(`   Oracle: ${oracle.oracleKeypair.publicKey.toString()}`);
});
