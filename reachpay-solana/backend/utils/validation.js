const Joi = require('joi');

// Environment validation schema
const envSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    PORT: Joi.number().default(3001),
    SOLANA_NETWORK: Joi.string().valid('mainnet', 'testnet', 'devnet', 'localnet').default('devnet'),
    ORACLE_KEYPAIR_PATH: Joi.string().optional(),
    PROGRAM_ID: Joi.string().optional().allow(''),
    MAX_RETRIES: Joi.number().default(3),
    RETRY_DELAY: Joi.number().default(1000),
    MONITORING_INTERVAL: Joi.number().default(60000),
    RATE_LIMIT_WINDOW: Joi.number().default(900000),
    RATE_LIMIT_MAX: Joi.number().default(100),
    LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'http', 'debug').default('info'),
}).unknown();

// Campaign ID validation
const campaignIdSchema = Joi.string().length(44).required();

// Metrics update validation
const metricsUpdateSchema = Joi.object({
    campaignId: campaignIdSchema,
    views: Joi.number().integer().min(0).required(),
    likes: Joi.number().integer().min(0).required(),
});

// Payout settlement validation
const payoutSettlementSchema = Joi.object({
    creatorTokenAccount: Joi.string().length(44).required(),
});

// Wallet verification validation
const walletVerificationSchema = Joi.object({
    publicKey: Joi.string().length(44).required(),
    signature: Joi.string().required(),
    message: Joi.string().required(),
});

/**
 * Validate environment variables
 * @param {object} env - Environment variables
 * @returns {object} Validated environment
 */
function validateEnv(env) {
    const { error, value } = envSchema.validate(env, { abortEarly: false });

    if (error) {
        throw new Error(`Environment validation error: ${error.message}`);
    }

    return value;
}

/**
 * Validate request data against schema
 * @param {object} data - Data to validate
 * @param {object} schema - Joi schema
 * @returns {object} Validation result
 */
function validateRequest(data, schema) {
    const { error, value } = schema.validate(data, { abortEarly: false });

    if (error) {
        const errors = error.details.map(detail => detail.message);
        return { valid: false, errors };
    }

    return { valid: true, value };
}

module.exports = {
    validateEnv,
    validateRequest,
    schemas: {
        campaignId: campaignIdSchema,
        metricsUpdate: metricsUpdateSchema,
        payoutSettlement: payoutSettlementSchema,
        walletVerification: walletVerificationSchema,
    },
};
