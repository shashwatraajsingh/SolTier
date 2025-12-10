const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { PublicKey } = require('@solana/web3.js');
const SolTierOracle = require('./oracle');
const config = require('./config');
const logger = require('./utils/logger');
const { validateRequest, schemas } = require('./utils/validation');
const { GracefulShutdown } = require('./utils/helpers');
const db = require('./database');
const TwitterAuthService = require('./twitterAuth');

const app = express();
const PORT = config.port;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.http(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
    });
    next();
});

// Rate limiting
const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: { success: false, error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Initialize oracle (optional for development)
let oracle = null;
try {
    if (process.env.PROGRAM_ID && process.env.PROGRAM_ID.trim() !== '') {
        oracle = new SolTierOracle();
        logger.info('Oracle initialized successfully');
    } else {
        logger.warn('Oracle not initialized - PROGRAM_ID not configured');
    }
} catch (error) {
    logger.error(`Failed to initialize oracle: ${error.message}`);
    logger.warn('Server will run without oracle functionality');
}

// Initialize Solana connection for balance checking (even without oracle)
const { Connection } = require('@solana/web3.js');
const solanaConnection = new Connection(
    process.env.SOLANA_NETWORK === 'mainnet'
        ? 'https://api.mainnet-beta.solana.com'
        : 'https://api.testnet.solana.com',
    'confirmed'
);
logger.info(`Solana connection initialized: ${process.env.SOLANA_NETWORK || 'testnet'}`);

// Initialize Twitter OAuth service
const twitterService = new TwitterAuthService();

// Error handling middleware
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Health check endpoint
app.get('/health', (req, res) => {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.env,
        network: config.solana.network,
        oracleEnabled: !!oracle,
    };

    res.json(health);
});

// Readiness check endpoint
app.get('/ready', asyncHandler(async (req, res) => {
    try {
        if (oracle) {
            const balance = await oracle.connection.getBalance(oracle.oracleKeypair.publicKey);
            return res.json({
                status: 'ready',
                oracle: oracle.oracleKeypair.publicKey.toString(),
                balance: balance / 1e9,
            });
        }

        res.json({
            status: 'ready',
            oracle: 'disabled',
            message: 'Server is ready (oracle disabled)',
        });
    } catch (error) {
        res.status(503).json({
            status: 'not ready',
            error: error.message,
        });
    }
}));

// ============= USER ENDPOINTS =============

// Register or get user
app.post('/api/user/register', asyncHandler(async (req, res) => {
    const { walletAddress, role } = req.body;

    if (!walletAddress || !role) {
        return res.status(400).json({
            success: false,
            error: 'Wallet address and role are required',
        });
    }

    if (!['creator', 'brand'].includes(role)) {
        return res.status(400).json({
            success: false,
            error: 'Role must be either "creator" or "brand"',
        });
    }

    let user = db.getUser(walletAddress);

    if (!user) {
        user = db.createUser(walletAddress, role);
        logger.info(`New user registered: ${walletAddress} as ${role}`);
    }

    res.json({
        success: true,
        data: user,
    });
}));

// Get user profile
app.get('/api/user/:walletAddress', asyncHandler(async (req, res) => {
    const { walletAddress } = req.params;
    const user = db.getUser(walletAddress);

    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found',
        });
    }

    const xConnection = db.getXConnection(walletAddress);
    let brandBalance = 0;
    let brandWalletAddress = null;
    let creatorEarnings = 0;

    // If user is a brand, get their generated wallet and check real balance
    if (user.role === 'brand') {
        const brandWallet = db.getBrandWallet(walletAddress);
        if (brandWallet) {
            brandWalletAddress = brandWallet.publicKey;

            // Fetch real SOL balance from blockchain
            try {
                const { PublicKey } = require('@solana/web3.js');
                // Add timeout to prevent long waits
                const balancePromise = solanaConnection.getBalance(
                    new PublicKey(brandWallet.publicKey)
                );
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Balance fetch timeout')), 5000)
                );

                const balance = await Promise.race([balancePromise, timeoutPromise]);
                brandBalance = balance / 1e9; // Convert lamports to SOL
            } catch (error) {
                // Log warning but continue with 0 balance (doesn't block user)
                logger.warn(`Failed to fetch brand wallet balance: ${error.message}`);
                brandBalance = 0; // Default to 0 if fetch fails
            }
        }
    }

    // If user is a creator, get their earnings balance
    if (user.role === 'creator') {
        creatorEarnings = db.getCreatorEarnings(walletAddress);
    }

    res.json({
        success: true,
        data: {
            ...user,
            xConnected: !!xConnection,
            xUsername: xConnection?.xUsername,
            brandWalletAddress,
            brandBalance, // Real SOL balance from blockchain
            creatorEarnings: creatorEarnings / 1e9, // Convert lamports to SOL
        },
    });
}));

// ============= X (TWITTER) ENDPOINTS =============

// Get X OAuth authorization URL
app.post('/api/x/connect', asyncHandler(async (req, res) => {
    const { walletAddress } = req.body;

    if (!walletAddress) {
        return res.status(400).json({
            success: false,
            error: 'Wallet address is required',
        });
    }

    const user = db.getUser(walletAddress);
    if (!user || user.role !== 'creator') {
        return res.status(403).json({
            success: false,
            error: 'Only creators can connect X accounts',
        });
    }

    try {
        if (!twitterService.enabled) {
            // Fallback to mock mode for development
            logger.warn('Twitter OAuth not configured, using mock mode');
            const mockUsername = req.body.username || `user_${Date.now()}`;
            const xData = {
                username: mockUsername,
                userId: `x_${Date.now()}`,
                accessToken: 'mock_access_token',
                refreshToken: 'mock_refresh_token',
            };

            const connection = db.connectX(walletAddress, xData);
            logger.info(`X account connected (mock): ${walletAddress} -> @${mockUsername}`);

            return res.json({
                success: true,
                mock: true,
                data: {
                    connected: true,
                    username: connection.xUsername,
                },
            });
        }

        // Generate real OAuth URL
        const { url, state } = twitterService.generateAuthUrl(walletAddress);

        logger.info(`Generated Twitter OAuth URL for wallet: ${walletAddress}`);

        res.json({
            success: true,
            data: {
                authUrl: url,
                state,
            },
        });
    } catch (error) {
        logger.error(`Failed to initiate Twitter OAuth: ${error.message}`);
        res.status(500).json({
            success: false,
            error: 'Failed to initiate Twitter authentication',
        });
    }
}));

// OAuth callback endpoint
app.get('/api/x/callback', asyncHandler(async (req, res) => {
    const { code, state } = req.query;

    if (!code || !state) {
        return res.status(400).send('Missing OAuth parameters');
    }

    try {
        const result = await twitterService.handleCallback(code, state);

        // Store connection in database
        const xData = {
            username: result.username,
            userId: result.userId,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            followersCount: result.followersCount,
        };

        db.connectX(result.walletAddress, xData);
        logger.info(`X account connected: ${result.walletAddress} -> @${result.username}`);

        // Redirect to frontend with success
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/?x_connected=true&username=${result.username}`);
    } catch (error) {
        logger.error(`Twitter OAuth callback error: ${error.message}`);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/?x_connected=false&error=${encodeURIComponent(error.message)}`);
    }
}));

// Disconnect X account
app.post('/api/x/disconnect', asyncHandler(async (req, res) => {
    const { walletAddress } = req.body;

    if (!walletAddress) {
        return res.status(400).json({
            success: false,
            error: 'Wallet address is required',
        });
    }

    // Disconnect from both database and Twitter service
    db.disconnectX(walletAddress);
    twitterService.disconnectUser(walletAddress);
    logger.info(`X account disconnected: ${walletAddress}`);

    res.json({
        success: true,
        message: 'X account disconnected',
    });
}));

// Check X connection status
app.get('/api/x/status/:walletAddress', asyncHandler(async (req, res) => {
    const { walletAddress } = req.params;
    const connection = db.getXConnection(walletAddress);

    res.json({
        success: true,
        data: {
            connected: !!connection,
            username: connection?.xUsername || null,
        },
    });
}));

// Get X user metrics (followers, etc.)
app.get('/api/x/metrics/:walletAddress', asyncHandler(async (req, res) => {
    const { walletAddress } = req.params;

    if (!twitterService.enabled) {
        // Return mock data if Twitter not configured
        return res.json({
            success: true,
            mock: true,
            data: {
                followersCount: Math.floor(Math.random() * 100000) + 1000,
                followingCount: Math.floor(Math.random() * 1000) + 100,
                tweetCount: Math.floor(Math.random() * 10000) + 500,
            },
        });
    }

    try {
        const metrics = await twitterService.getUserMetrics(walletAddress);
        res.json({
            success: true,
            data: metrics,
        });
    } catch (error) {
        logger.error(`Failed to get Twitter metrics: ${error.message}`);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch Twitter metrics',
        });
    }
}));

// Get tweet metrics for a specific tweet
app.get('/api/x/tweet/:walletAddress/:tweetId', asyncHandler(async (req, res) => {
    const { walletAddress, tweetId } = req.params;

    if (!twitterService.enabled) {
        // Return mock data if Twitter not configured
        return res.json({
            success: true,
            mock: true,
            data: {
                impressions: Math.floor(Math.random() * 10000) + 1000,
                likes: Math.floor(Math.random() * 500) + 50,
                retweets: Math.floor(Math.random() * 100) + 10,
                replies: Math.floor(Math.random() * 50) + 5,
            },
        });
    }

    try {
        const metrics = await twitterService.getTweetMetrics(walletAddress, tweetId);
        res.json({
            success: true,
            data: metrics,
        });
    } catch (error) {
        logger.error(`Failed to get tweet metrics: ${error.message}`);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tweet metrics',
        });
    }
}));

// ============= CAMPAIGN ENDPOINTS =============

// Create campaign
app.post('/api/campaign/create', asyncHandler(async (req, res) => {
    const { walletAddress, cpm, likeWeight, maxBudget, durationDays, title, description } = req.body;

    if (!walletAddress) {
        return res.status(400).json({
            success: false,
            error: 'Wallet address is required',
        });
    }

    const user = db.getUser(walletAddress);
    if (!user || user.role !== 'brand') {
        return res.status(403).json({
            success: false,
            error: 'Only brands can create campaigns',
        });
    }

    // Check if brand has sufficient funds
    const balance = db.getBalance(walletAddress);
    const requiredFunds = maxBudget * 1e6; // Convert to lamports

    if (balance < requiredFunds) {
        return res.status(400).json({
            success: false,
            error: 'Insufficient funds. Please add funds first.',
            required: maxBudget,
            available: balance / 1e6,
        });
    }

    const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Math.floor(Date.now() / 1000);
    const endTime = now + (durationDays * 86400);

    const campaign = db.createCampaign({
        campaignId,
        brand: walletAddress,
        title: title || 'Untitled Campaign',
        description: description || '',
        cpm: cpm * 1e6,
        likeWeight,
        maxBudget: maxBudget * 1e6,
        escrowBalance: maxBudget * 1e6,
        views: 0,
        likes: 0,
        effectiveViews: 0,
        totalPaid: 0,
        remainingPayout: maxBudget * 1e6,
        isActive: true,
        startTime: now.toString(),
        endTime: endTime.toString(),
    });

    // Deduct funds from brand balance
    db.deductFunds(walletAddress, requiredFunds);

    logger.info(`Campaign created: ${campaignId} by ${walletAddress}`);

    res.json({
        success: true,
        data: {
            ...campaign,
            cpm: campaign.cpm / 1e6,
            maxBudget: campaign.maxBudget / 1e6,
            escrowBalance: campaign.escrowBalance / 1e6,
            totalPaid: campaign.totalPaid / 1e6,
            remainingPayout: campaign.remainingPayout / 1e6,
        },
    });
}));

// Get campaign status
app.get('/api/campaign/:id/status', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const campaign = db.getCampaign(id);

    if (!campaign) {
        return res.status(404).json({
            success: false,
            error: 'Campaign not found',
        });
    }

    res.json({
        success: true,
        data: {
            ...campaign,
            cpm: campaign.cpm / 1e6,
            maxBudget: campaign.maxBudget / 1e6,
            escrowBalance: campaign.escrowBalance / 1e6,
            totalPaid: campaign.totalPaid / 1e6,
            remainingPayout: campaign.remainingPayout / 1e6,
        },
    });
}));

// Get all active campaigns (for creators)
app.get('/api/campaigns/active', asyncHandler(async (req, res) => {
    const campaigns = db.getActiveCampaigns();

    const formatted = campaigns.map(c => ({
        ...c,
        cpm: c.cpm / 1e6,
        maxBudget: c.maxBudget / 1e6,
        escrowBalance: c.escrowBalance / 1e6,
        totalPaid: c.totalPaid / 1e6,
        remainingPayout: c.remainingPayout / 1e6,
    }));

    res.json({
        success: true,
        data: formatted,
    });
}));

// Get brand's campaigns
app.get('/api/campaigns/brand/:walletAddress', asyncHandler(async (req, res) => {
    const { walletAddress } = req.params;
    const campaigns = db.getBrandCampaigns(walletAddress);

    const formatted = campaigns.map(c => ({
        ...c,
        cpm: c.cpm / 1e6,
        maxBudget: c.maxBudget / 1e6,
        escrowBalance: c.escrowBalance / 1e6,
        totalPaid: c.totalPaid / 1e6,
        remainingPayout: c.remainingPayout / 1e6,
    }));

    res.json({
        success: true,
        data: formatted,
    });
}));

// Apply to campaign (creator)
app.post('/api/campaign/:id/apply', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { walletAddress, proposedContent } = req.body;

    if (!walletAddress) {
        return res.status(400).json({
            success: false,
            error: 'Wallet address is required',
        });
    }

    const user = db.getUser(walletAddress);
    if (!user || user.role !== 'creator') {
        return res.status(403).json({
            success: false,
            error: 'Only creators can apply to campaigns',
        });
    }

    // Check X connection
    const xConnection = db.getXConnection(walletAddress);
    if (!xConnection) {
        return res.status(403).json({
            success: false,
            error: 'You must connect your X account to apply to campaigns',
        });
    }

    const campaign = db.getCampaign(id);
    if (!campaign) {
        return res.status(404).json({
            success: false,
            error: 'Campaign not found',
        });
    }

    if (!campaign.isActive) {
        return res.status(400).json({
            success: false,
            error: 'Campaign is not active',
        });
    }

    const application = db.createApplication({
        campaignId: id,
        creatorAddress: walletAddress,
        proposedContent: proposedContent || '',
    });

    logger.info(`Application created: ${application.applicationId} for campaign ${id}`);

    res.json({
        success: true,
        data: application,
    });
}));

// Get campaign applications (brand)
app.get('/api/campaign/:id/applications', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const applications = db.getCampaignApplications(id);

    res.json({
        success: true,
        data: applications,
    });
}));

// Update application status (brand)
app.put('/api/application/:id/status', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, walletAddress } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid status',
        });
    }

    const application = db.getApplication(id);
    if (!application) {
        return res.status(404).json({
            success: false,
            error: 'Application not found',
        });
    }

    // Verify requester is the campaign brand
    const campaign = db.getCampaign(application.campaignId);
    if (campaign.brand !== walletAddress) {
        return res.status(403).json({
            success: false,
            error: 'Only the campaign brand can update application status',
        });
    }

    const updated = db.updateApplication(id, { status });

    res.json({
        success: true,
        data: updated,
    });
}));

// ============= CREATOR ENDPOINTS =============

// Get top creators (for brands)
app.get('/api/creators/top', asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const creators = db.getTopCreators(limit);

    // Add mock stats for demo
    const withStats = creators.map(c => ({
        walletAddress: c.walletAddress,
        xUsername: c.xUsername,
        reach: Math.floor(Math.random() * 500000) + 50000,
        engagement: (Math.random() * 10 + 2).toFixed(2) + '%',
        completedCampaigns: Math.floor(Math.random() * 50),
    }));

    res.json({
        success: true,
        data: withStats,
    });
}));

// ============= BALANCE ENDPOINTS =============

// Add funds (brand)
app.post('/api/balance/add', asyncHandler(async (req, res) => {
    const { walletAddress, amount } = req.body;

    if (!walletAddress || !amount || amount <= 0) {
        return res.status(400).json({
            success: false,
            error: 'Valid wallet address and amount are required',
        });
    }

    const user = db.getUser(walletAddress);
    if (!user || user.role !== 'brand') {
        return res.status(403).json({
            success: false,
            error: 'Only brands can add funds',
        });
    }

    const amountInLamports = Math.floor(amount * 1e6);
    const newBalance = db.addFunds(walletAddress, amountInLamports);

    logger.info(`Funds added: ${walletAddress} +${amount} USDC`);

    res.json({
        success: true,
        data: {
            balance: newBalance / 1e6,
            added: amount,
        },
    });
}));

// Get balance
app.get('/api/balance/:walletAddress', asyncHandler(async (req, res) => {
    const { walletAddress } = req.params;
    const balance = db.getBalance(walletAddress);

    res.json({
        success: true,
        data: {
            balance: balance / 1e6,
        },
    });
}));

// ============= CREATOR EARNINGS ENDPOINTS =============

// Get creator earnings
app.get('/api/creator/earnings/:walletAddress', asyncHandler(async (req, res) => {
    const { walletAddress } = req.params;

    const user = db.getUser(walletAddress);
    if (!user || user.role !== 'creator') {
        return res.status(403).json({
            success: false,
            error: 'Only creators can check earnings',
        });
    }

    const earnings = db.getCreatorEarnings(walletAddress);

    res.json({
        success: true,
        data: {
            earnings: earnings / 1e9, // Convert lamports to SOL
            earningsLamports: earnings,
        },
    });
}));

// Withdraw creator earnings
app.post('/api/creator/withdraw', asyncHandler(async (req, res) => {
    const { walletAddress, amount } = req.body;

    if (!walletAddress || !amount || amount <= 0) {
        return res.status(400).json({
            success: false,
            error: 'Valid wallet address and amount are required',
        });
    }

    const user = db.getUser(walletAddress);
    if (!user || user.role !== 'creator') {
        return res.status(403).json({
            success: false,
            error: 'Only creators can withdraw earnings',
        });
    }

    const amountInLamports = Math.floor(amount * 1e9); // Convert SOL to lamports
    const currentEarnings = db.getCreatorEarnings(walletAddress);

    if (currentEarnings < amountInLamports) {
        return res.status(400).json({
            success: false,
            error: 'Insufficient earnings balance',
            available: currentEarnings / 1e9,
            requested: amount,
        });
    }

    try {
        // TODO: In production, implement actual SOL transfer from escrow to creator wallet
        // For now, we'll simulate the withdrawal by just updating the database

        // Note: In a real implementation, you would:
        // 1. Transfer SOL from a platform escrow wallet to creator's login wallet
        // 2. Use Solana web3.js to send the transaction
        // 3. Wait for transaction confirmation
        // 4. Then update the database

        // Example (commented out - requires proper escrow wallet setup):
        /*
        const { Connection, PublicKey, Transaction, SystemProgram, Keypair } = require('@solana/web3.js');
        const bs58 = require('bs58');
        
        // Get platform escrow wallet (you'd need to set this up)
        const escrowKeypair = Keypair.fromSecretKey(
            bs58.decode(process.env.ESCROW_WALLET_SECRET_KEY)
        );
        
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: escrowKeypair.publicKey,
                toPubkey: new PublicKey(walletAddress),
                lamports: amountInLamports,
            })
        );
        
        const signature = await solanaConnection.sendTransaction(transaction, [escrowKeypair]);
        await solanaConnection.confirmTransaction(signature);
        */

        // Deduct from creator earnings
        const newBalance = db.deductCreatorEarnings(walletAddress, amountInLamports);

        logger.info(`Creator withdrawal: ${walletAddress} withdrew ${amount} SOL`);

        res.json({
            success: true,
            message: 'Withdrawal successful',
            data: {
                withdrawn: amount,
                remainingBalance: newBalance / 1e9,
                // In production, include transaction signature
                // transactionSignature: signature,
            },
        });
    } catch (error) {
        logger.error(`Withdrawal failed for ${walletAddress}: ${error.message}`);
        res.status(500).json({
            success: false,
            error: 'Withdrawal failed. Please try again.',
        });
    }
}));

// ============= METRICS ENDPOINTS =============

// Manual metrics update
app.post('/api/metrics/update', asyncHandler(async (req, res) => {
    const validation = validateRequest(req.body, schemas.metricsUpdate);

    if (!validation.valid) {
        return res.status(400).json({
            success: false,
            errors: validation.errors,
        });
    }

    const { campaignId, views, likes } = validation.value;
    const campaign = db.getCampaign(campaignId);

    if (!campaign) {
        return res.status(404).json({
            success: false,
            error: 'Campaign not found',
        });
    }

    // Update metrics
    const effectiveViews = views + (likes * campaign.likeWeight);
    const payout = Math.floor((effectiveViews / 1000) * campaign.cpm);

    const updated = db.updateCampaign(campaignId, {
        views,
        likes,
        effectiveViews,
        totalPaid: campaign.totalPaid + payout,
        remainingPayout: campaign.maxBudget - (campaign.totalPaid + payout),
    });

    res.json({
        success: true,
        data: {
            ...updated,
            cpm: updated.cpm / 1e6,
            maxBudget: updated.maxBudget / 1e6,
            totalPaid: updated.totalPaid / 1e6,
            remainingPayout: updated.remainingPayout / 1e6,
        },
    });
}));

// Settle payout
app.post('/api/campaign/:id/settle', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { creatorTokenAccount } = req.body;

    const campaign = db.getCampaign(id);
    if (!campaign) {
        return res.status(404).json({
            success: false,
            error: 'Campaign not found',
        });
    }

    // Mock settlement - in production, interact with smart contract
    res.json({
        success: true,
        message: 'Payout settlement initiated',
        data: {
            campaignId: id,
            amount: campaign.totalPaid / 1e6,
            creatorTokenAccount,
        },
    });
}));

// Wallet verification
app.post('/api/wallet/verify', asyncHandler(async (req, res) => {
    const validation = validateRequest(req.body, schemas.walletVerification);

    if (!validation.valid) {
        return res.status(400).json({
            success: false,
            errors: validation.errors,
        });
    }

    const { publicKey } = validation.value;

    res.json({
        success: true,
        message: 'Wallet verification endpoint',
        publicKey,
        verified: true,
    });
}));

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        path: req.path,
    });
});

// Global error handler
app.use((error, req, res, next) => {
    logger.error(`Error handling ${req.method} ${req.path}: ${error.message}`, {
        stack: error.stack,
    });

    const statusCode = error.statusCode || 500;
    const message = config.isProduction ? 'Internal Server Error' : error.message;

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(config.isDevelopment && { stack: error.stack }),
    });
});

// Graceful shutdown
const shutdown = new GracefulShutdown();

shutdown.registerHandler(async () => {
    logger.info('Closing server...');
    return new Promise((resolve) => {
        server.close(() => {
            logger.info('Server closed');
            resolve();
        });
    });
});

shutdown.registerHandler(async () => {
    logger.info('Cleaning up oracle resources...');
    // Add any oracle cleanup if needed
});

shutdown.setup();

// Start server
const server = app.listen(PORT, () => {
    logger.info(`SolTier Oracle API running on port ${PORT}`);
    logger.info(`Network: ${config.solana.network}`);
    if (oracle) {
        logger.info(`Oracle: ${oracle.oracleKeypair.publicKey.toString()}`);
    } else {
        logger.info('Oracle: disabled');
    }
    logger.info(`Environment: ${config.env}`);
});

// Handle server errors
server.on('error', (error) => {
    logger.error(`Server error: ${error.message}`);
    process.exit(1);
});

module.exports = app;
