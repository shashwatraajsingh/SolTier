const { validateEnv } = require('./utils/validation');
const logger = require('./utils/logger');

// Load and validate environment variables
const env = validateEnv(process.env);

const config = {
    // Application
    env: env.NODE_ENV,
    port: env.PORT,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',

    // Solana
    solana: {
        network: env.SOLANA_NETWORK,
        rpcUrl: env.SOLANA_NETWORK === 'mainnet'
            ? 'https://api.mainnet-beta.solana.com'
            : env.SOLANA_NETWORK === 'devnet'
                ? 'https://api.devnet.solana.com'
                : 'https://api.testnet.solana.com',
        commitment: 'confirmed',
    },

    // Oracle
    oracle: {
        keypairPath: env.ORACLE_KEYPAIR_PATH,
        monitoringInterval: env.MONITORING_INTERVAL,
    },

    // Program
    program: {
        id: env.PROGRAM_ID,
    },

    // Retry configuration
    retry: {
        maxRetries: env.MAX_RETRIES,
        initialDelay: env.RETRY_DELAY,
    },

    // Rate limiting
    rateLimit: {
        windowMs: env.RATE_LIMIT_WINDOW,
        max: env.RATE_LIMIT_MAX,
    },

    // Logging
    logging: {
        level: env.LOG_LEVEL,
    },

    // Circuit breaker
    circuitBreaker: {
        threshold: 5,
        timeout: 60000,
    },
};

// Log configuration on startup (hide sensitive values)
logger.info('Application configuration loaded');
logger.debug(`Environment: ${config.env}`);
logger.debug(`Solana Network: ${config.solana.network}`);
logger.debug(`Oracle Monitoring Interval: ${config.oracle.monitoringInterval}ms`);

module.exports = config;
