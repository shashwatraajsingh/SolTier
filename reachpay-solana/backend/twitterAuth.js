const { TwitterApi } = require('twitter-api-v2');
const logger = require('./utils/logger');

class TwitterAuthService {
    constructor() {
        this.clientId = process.env.TWITTER_CLIENT_ID;
        this.clientSecret = process.env.TWITTER_CLIENT_SECRET;
        this.callbackUrl = process.env.TWITTER_CALLBACK_URL || 'http://localhost:3001/api/x/callback';

        // Store for OAuth states and tokens (in production, use Redis or database)
        this.oauthStates = new Map();
        this.userTokens = new Map();

        if (!this.clientId || !this.clientSecret) {
            logger.warn('Twitter OAuth credentials not configured. Twitter integration will use mock mode.');
            this.enabled = false;
        } else {
            this.enabled = true;
            logger.info('Twitter OAuth service initialized');
        }
    }

    /**
     * Generate OAuth 2.0 authorization URL
     */
    generateAuthUrl(walletAddress) {
        if (!this.enabled) {
            return null;
        }

        try {
            const client = new TwitterApi({
                clientId: this.clientId,
                clientSecret: this.clientSecret,
            });

            const { url, codeVerifier, state } = client.generateOAuth2AuthLink(this.callbackUrl, {
                scope: ['tweet.read', 'users.read', 'offline.access'],
            });

            // Store state and code verifier for this wallet
            this.oauthStates.set(state, {
                walletAddress,
                codeVerifier,
                timestamp: Date.now(),
            });

            // Clean up old states (older than 10 minutes)
            this.cleanupOldStates();

            return { url, state };
        } catch (error) {
            logger.error(`Failed to generate Twitter auth URL: ${error.message}`);
            throw error;
        }
    }

    /**
     * Handle OAuth callback and exchange code for tokens
     */
    async handleCallback(code, state) {
        if (!this.enabled) {
            throw new Error('Twitter OAuth is not enabled');
        }

        const stateData = this.oauthStates.get(state);
        if (!stateData) {
            throw new Error('Invalid or expired OAuth state');
        }

        try {
            const client = new TwitterApi({
                clientId: this.clientId,
                clientSecret: this.clientSecret,
            });

            // Exchange code for tokens
            const { client: loggedClient, accessToken, refreshToken } = await client.loginWithOAuth2({
                code,
                codeVerifier: stateData.codeVerifier,
                redirectUri: this.callbackUrl,
            });

            // Get user information
            const { data: user } = await loggedClient.v2.me({
                'user.fields': ['public_metrics', 'username'],
            });

            // Store tokens for this user
            this.userTokens.set(stateData.walletAddress, {
                accessToken,
                refreshToken,
                username: user.username,
                userId: user.id,
                publicMetrics: user.public_metrics,
                timestamp: Date.now(),
            });

            // Clean up state
            this.oauthStates.delete(state);

            return {
                walletAddress: stateData.walletAddress,
                username: user.username,
                userId: user.id,
                followersCount: user.public_metrics?.followers_count || 0,
                accessToken,
                refreshToken,
            };
        } catch (error) {
            logger.error(`Failed to handle Twitter callback: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get user's Twitter client
     */
    getUserClient(walletAddress) {
        const tokenData = this.userTokens.get(walletAddress);
        if (!tokenData) {
            return null;
        }

        return new TwitterApi(tokenData.accessToken);
    }

    /**
     * Refresh user's access token
     */
    async refreshUserToken(walletAddress) {
        if (!this.enabled) {
            throw new Error('Twitter OAuth is not enabled');
        }

        const tokenData = this.userTokens.get(walletAddress);
        if (!tokenData || !tokenData.refreshToken) {
            throw new Error('No refresh token available for this user');
        }

        try {
            const client = new TwitterApi({
                clientId: this.clientId,
                clientSecret: this.clientSecret,
            });

            const { accessToken, refreshToken } = await client.refreshOAuth2Token(tokenData.refreshToken);

            // Update stored tokens
            this.userTokens.set(walletAddress, {
                ...tokenData,
                accessToken,
                refreshToken: refreshToken || tokenData.refreshToken,
                timestamp: Date.now(),
            });

            return accessToken;
        } catch (error) {
            logger.error(`Failed to refresh Twitter token: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get user's Twitter metrics (followers, etc.)
     */
    async getUserMetrics(walletAddress) {
        if (!this.enabled) {
            throw new Error('Twitter OAuth is not enabled');
        }

        const client = this.getUserClient(walletAddress);
        if (!client) {
            throw new Error('User not authenticated with Twitter');
        }

        try {
            const { data: user } = await client.v2.me({
                'user.fields': ['public_metrics'],
            });

            return {
                followersCount: user.public_metrics?.followers_count || 0,
                followingCount: user.public_metrics?.following_count || 0,
                tweetCount: user.public_metrics?.tweet_count || 0,
                listedCount: user.public_metrics?.listed_count || 0,
            };
        } catch (error) {
            logger.error(`Failed to get user metrics: ${error.message}`);

            // Try to refresh token if unauthorized
            if (error.code === 401) {
                logger.info('Attempting to refresh token...');
                await this.refreshUserToken(walletAddress);
                return this.getUserMetrics(walletAddress); // Retry
            }

            throw error;
        }
    }

    /**
     * Get tweet metrics (for tracking campaign performance)
     */
    async getTweetMetrics(walletAddress, tweetId) {
        if (!this.enabled) {
            throw new Error('Twitter OAuth is not enabled');
        }

        const client = this.getUserClient(walletAddress);
        if (!client) {
            throw new Error('User not authenticated with Twitter');
        }

        try {
            const { data: tweet } = await client.v2.singleTweet(tweetId, {
                'tweet.fields': ['public_metrics'],
            });

            return {
                impressions: tweet.public_metrics?.impression_count || 0,
                likes: tweet.public_metrics?.like_count || 0,
                retweets: tweet.public_metrics?.retweet_count || 0,
                replies: tweet.public_metrics?.reply_count || 0,
                views: tweet.public_metrics?.impression_count || 0,
            };
        } catch (error) {
            logger.error(`Failed to get tweet metrics: ${error.message}`);

            // Try to refresh token if unauthorized
            if (error.code === 401) {
                logger.info('Attempting to refresh token...');
                await this.refreshUserToken(walletAddress);
                return this.getTweetMetrics(walletAddress, tweetId); // Retry
            }

            throw error;
        }
    }

    /**
     * Disconnect user's Twitter account
     */
    disconnectUser(walletAddress) {
        this.userTokens.delete(walletAddress);
        logger.info(`Twitter account disconnected for wallet: ${walletAddress}`);
    }

    /**
     * Check if user is connected
     */
    isUserConnected(walletAddress) {
        return this.userTokens.has(walletAddress);
    }

    /**
     * Get user's stored Twitter data
     */
    getUserData(walletAddress) {
        return this.userTokens.get(walletAddress);
    }

    /**
     * Clean up old OAuth states
     */
    cleanupOldStates() {
        const now = Date.now();
        const maxAge = 10 * 60 * 1000; // 10 minutes

        for (const [state, data] of this.oauthStates.entries()) {
            if (now - data.timestamp > maxAge) {
                this.oauthStates.delete(state);
            }
        }
    }
}

module.exports = TwitterAuthService;
