const logger = require('./logger');

/**
 * Retry wrapper for async functions with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} delay - Initial delay in ms
 * @param {string} operationName - Name for logging
 * @returns {Promise} Result of function
 */
async function withRetry(fn, maxRetries = 3, delay = 1000, operationName = 'operation') {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            if (attempt === maxRetries) {
                logger.error(`${operationName} failed after ${maxRetries} attempts: ${error.message}`);
                throw error;
            }

            const backoffDelay = delay * Math.pow(2, attempt - 1);
            logger.warn(`${operationName} attempt ${attempt} failed. Retrying in ${backoffDelay}ms...`);

            await sleep(backoffDelay);
        }
    }

    throw lastError;
}

/**
 * Sleep utility
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Circuit breaker pattern implementation
 */
class CircuitBreaker {
    constructor(threshold = 5, timeout = 60000) {
        this.failureCount = 0;
        this.threshold = threshold;
        this.timeout = timeout;
        this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
        this.nextAttempt = Date.now();
    }

    async execute(fn, operationName = 'operation') {
        if (this.state === 'OPEN') {
            if (Date.now() < this.nextAttempt) {
                throw new Error(`Circuit breaker is OPEN for ${operationName}`);
            }
            this.state = 'HALF_OPEN';
        }

        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    onSuccess() {
        this.failureCount = 0;
        this.state = 'CLOSED';
    }

    onFailure() {
        this.failureCount++;
        if (this.failureCount >= this.threshold) {
            this.state = 'OPEN';
            this.nextAttempt = Date.now() + this.timeout;
            logger.error(`Circuit breaker opened. Next attempt at ${new Date(this.nextAttempt).toISOString()}`);
        }
    }

    getState() {
        return {
            state: this.state,
            failureCount: this.failureCount,
            nextAttempt: new Date(this.nextAttempt).toISOString(),
        };
    }
}

/**
 * Rate limiter for function calls
 */
class RateLimiter {
    constructor(maxCalls = 10, windowMs = 60000) {
        this.maxCalls = maxCalls;
        this.windowMs = windowMs;
        this.calls = [];
    }

    async execute(fn) {
        const now = Date.now();
        this.calls = this.calls.filter(time => now - time < this.windowMs);

        if (this.calls.length >= this.maxCalls) {
            const oldestCall = this.calls[0];
            const waitTime = this.windowMs - (now - oldestCall);
            throw new Error(`Rate limit exceeded. Try again in ${waitTime}ms`);
        }

        this.calls.push(now);
        return await fn();
    }

    getStatus() {
        const now = Date.now();
        const recentCalls = this.calls.filter(time => now - time < this.windowMs);
        return {
            callsInWindow: recentCalls.length,
            maxCalls: this.maxCalls,
            windowMs: this.windowMs,
            remaining: this.maxCalls - recentCalls.length,
        };
    }
}

/**
 * Graceful shutdown handler
 */
class GracefulShutdown {
    constructor() {
        this.shutdownHandlers = [];
        this.isShuttingDown = false;
    }

    registerHandler(handler) {
        this.shutdownHandlers.push(handler);
    }

    async shutdown(signal) {
        if (this.isShuttingDown) {
            return;
        }

        this.isShuttingDown = true;
        logger.info(`Received ${signal}. Starting graceful shutdown...`);

        for (const handler of this.shutdownHandlers) {
            try {
                await handler();
            } catch (error) {
                logger.error(`Error during shutdown: ${error.message}`);
            }
        }

        logger.info('Graceful shutdown completed');
        process.exit(0);
    }

    setup() {
        process.on('SIGTERM', () => this.shutdown('SIGTERM'));
        process.on('SIGINT', () => this.shutdown('SIGINT'));
    }
}

module.exports = {
    withRetry,
    sleep,
    CircuitBreaker,
    RateLimiter,
    GracefulShutdown,
};
