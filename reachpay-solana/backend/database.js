/**
 * In-memory database for development
 * Replace with MongoDB/PostgreSQL for production
 */

const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58');

class Database {
    constructor() {
        // Users storage
        this.users = new Map(); // walletAddress -> user data

        // Campaigns storage
        this.campaigns = new Map(); // campaignId -> campaign data

        // Campaign applications
        this.applications = new Map(); // applicationId -> application data

        // X account connections
        this.xConnections = new Map(); // walletAddress -> X account data

        // Wallet balances (kept for backwards compatibility)
        this.balances = new Map(); // walletAddress -> balance in lamports

        // Brand wallets (generated keypairs)
        this.brandWallets = new Map(); // userWalletAddress -> { publicKey, secretKey }

        // Creator earnings (accumulated from campaigns)
        this.creatorEarnings = new Map(); // creatorWalletAddress -> earnings in lamports
    }

    // User methods
    createUser(walletAddress, role) {
        const user = {
            walletAddress,
            role, // 'creator' or 'brand'
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Generate a brand wallet if user is a brand
        if (role === 'brand') {
            try {
                const brandKeypair = Keypair.generate();
                // bs58 v6.0.0 uses direct export, not .default
                const secretKeyEncoded = typeof bs58.encode === 'function'
                    ? bs58.encode(brandKeypair.secretKey)
                    : bs58.default.encode(brandKeypair.secretKey);

                this.brandWallets.set(walletAddress, {
                    publicKey: brandKeypair.publicKey.toString(),
                    secretKey: secretKeyEncoded,
                });
                user.brandWalletAddress = brandKeypair.publicKey.toString();
                console.log(`✅ Brand wallet generated for ${walletAddress}: ${brandKeypair.publicKey.toString()}`);
            } catch (error) {
                console.error(`❌ Failed to generate brand wallet for ${walletAddress}:`, error);
                throw new Error(`Brand wallet generation failed: ${error.message}`);
            }
        }

        this.users.set(walletAddress, user);
        return user;
    }

    getUser(walletAddress) {
        return this.users.get(walletAddress);
    }

    updateUser(walletAddress, updates) {
        const user = this.users.get(walletAddress);
        if (!user) return null;

        const updated = {
            ...user,
            ...updates,
            updatedAt: new Date().toISOString(),
        };
        this.users.set(walletAddress, updated);
        return updated;
    }

    getBrandWallet(walletAddress) {
        return this.brandWallets.get(walletAddress);
    }

    // Campaign methods
    createCampaign(campaignData) {
        const campaign = {
            ...campaignData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.campaigns.set(campaignData.campaignId, campaign);
        return campaign;
    }

    getCampaign(campaignId) {
        return this.campaigns.get(campaignId);
    }

    updateCampaign(campaignId, updates) {
        const campaign = this.campaigns.get(campaignId);
        if (!campaign) return null;

        const updated = {
            ...campaign,
            ...updates,
            updatedAt: new Date().toISOString(),
        };
        this.campaigns.set(campaignId, updated);
        return updated;
    }

    getAllCampaigns() {
        return Array.from(this.campaigns.values());
    }

    getBrandCampaigns(brandAddress) {
        return Array.from(this.campaigns.values()).filter(
            c => c.brand === brandAddress
        );
    }

    getActiveCampaigns() {
        const now = Date.now() / 1000;
        return Array.from(this.campaigns.values()).filter(
            c => c.isActive && parseInt(c.endTime) > now
        );
    }

    // X Connection methods
    connectX(walletAddress, xData) {
        const connection = {
            walletAddress,
            xUsername: xData.username,
            xUserId: xData.userId,
            accessToken: xData.accessToken,
            refreshToken: xData.refreshToken,
            connectedAt: new Date().toISOString(),
        };
        this.xConnections.set(walletAddress, connection);
        return connection;
    }

    getXConnection(walletAddress) {
        return this.xConnections.get(walletAddress);
    }

    disconnectX(walletAddress) {
        return this.xConnections.delete(walletAddress);
    }

    // Application methods
    createApplication(applicationData) {
        const applicationId = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const application = {
            applicationId,
            ...applicationData,
            status: 'pending', // pending, approved, rejected
            createdAt: new Date().toISOString(),
        };
        this.applications.set(applicationId, application);
        return application;
    }

    getApplication(applicationId) {
        return this.applications.get(applicationId);
    }

    getCampaignApplications(campaignId) {
        return Array.from(this.applications.values()).filter(
            a => a.campaignId === campaignId
        );
    }

    getCreatorApplications(creatorAddress) {
        return Array.from(this.applications.values()).filter(
            a => a.creatorAddress === creatorAddress
        );
    }

    updateApplication(applicationId, updates) {
        const application = this.applications.get(applicationId);
        if (!application) return null;

        const updated = {
            ...application,
            ...updates,
            updatedAt: new Date().toISOString(),
        };
        this.applications.set(applicationId, updated);
        return updated;
    }

    // Balance methods (kept for backwards compatibility)
    getBalance(walletAddress) {
        return this.balances.get(walletAddress) || 0;
    }

    addFunds(walletAddress, amount) {
        const current = this.getBalance(walletAddress);
        const newBalance = current + amount;
        this.balances.set(walletAddress, newBalance);
        return newBalance;
    }

    deductFunds(walletAddress, amount) {
        const current = this.getBalance(walletAddress);
        if (current < amount) {
            throw new Error('Insufficient funds');
        }
        const newBalance = current - amount;
        this.balances.set(walletAddress, newBalance);
        return newBalance;
    }

    // Creator earnings methods
    getCreatorEarnings(walletAddress) {
        return this.creatorEarnings.get(walletAddress) || 0;
    }

    addCreatorEarnings(walletAddress, amount) {
        const current = this.getCreatorEarnings(walletAddress);
        const newBalance = current + amount;
        this.creatorEarnings.set(walletAddress, newBalance);
        return newBalance;
    }

    deductCreatorEarnings(walletAddress, amount) {
        const current = this.getCreatorEarnings(walletAddress);
        if (current < amount) {
            throw new Error('Insufficient earnings balance');
        }
        const newBalance = current - amount;
        this.creatorEarnings.set(walletAddress, newBalance);
        return newBalance;
    }

    // Creator discovery methods
    getTopCreators(limit = 10) {
        // Get creators with X connections
        const creators = Array.from(this.users.values())
            .filter(u => u.role === 'creator')
            .map(creator => {
                const xConnection = this.xConnections.get(creator.walletAddress);
                return {
                    ...creator,
                    xConnected: !!xConnection,
                    xUsername: xConnection?.xUsername,
                };
            })
            .filter(c => c.xConnected);

        // For now, return all creators with X connected
        // In production, add ranking logic based on reach, engagement, etc.
        return creators.slice(0, limit);
    }
}

module.exports = new Database();
