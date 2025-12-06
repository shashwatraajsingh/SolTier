const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { PublicKey } = require('@solana/web3.js');
const ReachPayOracle = require('./oracle');
const config = require('./config');
const logger = require('./utils/logger');
const { validateRequest, schemas } = require('./utils/validation');
const { GracefulShutdown } = require('./utils/helpers');

const app = express();
const PORT = config.port;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
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

// Initialize oracle
let oracle;
try {
    oracle = new ReachPayOracle();
    logger.info('Oracle initialized successfully');
} catch (error) {
    logger.error(`Failed to initialize oracle: ${error.message}`);
    process.exit(1);
}

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
    };

    res.json(health);
});

// Readiness check endpoint
app.get('/ready', asyncHandler(async (req, res) => {
    try {
        // Check Oracle connection
        const balance = await oracle.connection.getBalance(oracle.oracleKeypair.publicKey);

        res.json({
            status: 'ready',
            oracle: oracle.oracleKeypair.publicKey.toString(),
            balance: balance / 1e9,
        });
    } catch (error) {
        res.status(503).json({
            status: 'not ready',
            error: error.message,
        });
    }
}));

// Get campaign status
app.get('/api/campaign/:id/status', asyncHandler(async (req, res) => {
    const validation = validateRequest(
        { campaignId: req.params.id },
        schemas.campaignId.label('Campaign ID')
    );

    if (!validation.valid) {
        return res.status(400).json({
            success: false,
            errors: validation.errors,
        });
    }

    const campaignId = new PublicKey(req.params.id);
    const status = await oracle.getCampaignStatus(campaignId);

    res.json({ success: true, data: status });
}));

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

    const result = await oracle.updateCampaignMetrics(
        new PublicKey(campaignId),
        views,
        likes
    );

    if (!result.success) {
        return res.status(500).json(result);
    }

    res.json(result);
}));

// Settle payout
app.post('/api/campaign/:id/settle', asyncHandler(async (req, res) => {
    const campaignValidation = validateRequest(
        { campaignId: req.params.id },
        schemas.campaignId.label('Campaign ID')
    );

    if (!campaignValidation.valid) {
        return res.status(400).json({
            success: false,
            errors: campaignValidation.errors,
        });
    }

    const payoutValidation = validateRequest(req.body, schemas.payoutSettlement);

    if (!payoutValidation.valid) {
        return res.status(400).json({
            success: false,
            errors: payoutValidation.errors,
        });
    }

    const campaignId = new PublicKey(req.params.id);
    const { creatorTokenAccount } = payoutValidation.value;

    const result = await oracle.settlePayout(campaignId, creatorTokenAccount);

    if (!result.success) {
        return res.status(500).json(result);
    }

    res.json(result);
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

    const { publicKey, signature, message } = validation.value;

    // In production, implement actual signature verification
    // const nacl = require('tweetnacl');
    // const isValid = nacl.sign.detached.verify(
    //   Buffer.from(message),
    //   Buffer.from(signature, 'base64'),
    //   new PublicKey(publicKey).toBytes()
    // );

    res.json({
        success: true,
        message: 'Wallet verification endpoint',
        publicKey,
        verified: false, // Set to true after implementing verification
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
    logger.info(`ReachPay Oracle API running on port ${PORT}`);
    logger.info(`Network: ${config.solana.network}`);
    logger.info(`Oracle: ${oracle.oracleKeypair.publicKey.toString()}`);
    logger.info(`Environment: ${config.env}`);
});

// Handle server errors
server.on('error', (error) => {
    logger.error(`Server error: ${error.message}`);
    process.exit(1);
});

module.exports = app;
