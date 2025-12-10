/**
 * Persistent File-Based Database
 * Saves data to disk to survive server restarts
 * This prevents wallet regeneration issues in production
 */

const fs = require('fs');
const path = require('path');
const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58');

const DB_FILE = path.join(__dirname, 'data', 'database.json');

class PersistentDatabase {
    constructor() {
        // Ensure data directory exists
        const dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // Load or initialize data
        this.load();
    }

    // Load data from file
    load() {
        try {
            if (fs.existsSync(DB_FILE)) {
                const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
                this.users = new Map(data.users || []);
                this.campaigns = new Map(data.campaigns || []);
                this.applications = new Map(data.applications || []);
                this.xConnections = new Map(data.xConnections || []);
                this.balances = new Map(data.balances || []);
                this.brandWallets = new Map(data.brandWallets || []);
                this.creatorEarnings = new Map(data.creatorEarnings || []);
                console.log(`✅ Loaded database from file: ${Object.keys(data.users || []).length} users`);
            } else {
                // Initialize empty
                this.users = new Map();
                this.campaigns = new Map();
                this.applications = new Map();
                this.xConnections = new Map();
                this.balances = new Map();
                this.brandWallets = new Map();
                this.creatorEarnings = new Map();
                console.log('📝 Initialized new database');
            }
        } catch (error) {
            console.error('❌ Error loading database:', error);
            // Initialize empty on error
            this.users = new Map();
            this.campaigns = new Map();
            this.applications = new Map();
            this.xConnections = new Map();
            this.balances = new Map();
            this.brandWallets = new Map();
            this.creatorEarnings = new Map();
        }
    }

    // Save data to file
    save() {
        try {
            const data = {
                users: Array.from(this.users.entries()),
                campaigns: Array.from(this.campaigns.entries()),
                applications: Array.from(this.applications.entries()),
                xConnections: Array.from(this.xConnections.entries()),
                balances: Array.from(this.balances.entries()),
                brandWallets: Array.from(this.brandWallets.entries()),
                creatorEarnings: Array.from(this.creatorEarnings.entries()),
            };
            fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
            console.log('💾 Database saved to file');
        } catch (error) {
            console.error('❌ Error saving database:', error);
        }
    }

    // User methods
    createUser(walletAddress, role) {
        const user = {
            walletAddress,
            role,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Generate a brand wallet if user is a brand
        if (role === 'brand') {
            try {
                const brandKeypair = Keypair.generate();
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
        this.save(); // Persist to disk
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
        this.save();
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
        this.save();
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
        this.save();
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
        this.save();
        return connection;
    }

    getXConnection(walletAddress) {
        return this.xConnections.get(walletAddress);
    }

    disconnectX(walletAddress) {
        const result = this.xConnections.delete(walletAddress);
        this.save();
        return result;
    }

    // Application methods
    createApplication(applicationData) {
        const applicationId = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const application = {
            applicationId,
            ...applicationData,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };
        this.applications.set(applicationId, application);
        this.save();
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
        this.save();
        return updated;
    }

    // Balance methods
    getBalance(walletAddress) {
        return this.balances.get(walletAddress) || 0;
    }

    addFunds(walletAddress, amount) {
        const current = this.getBalance(walletAddress);
        const newBalance = current + amount;
        this.balances.set(walletAddress, newBalance);
        this.save();
        return newBalance;
    }

    deductFunds(walletAddress, amount) {
        const current = this.getBalance(walletAddress);
        if (current < amount) {
            throw new Error('Insufficient funds');
        }
        const newBalance = current - amount;
        this.balances.set(walletAddress, newBalance);
        this.save();
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
        this.save();
        return newBalance;
    }

    deductCreatorEarnings(walletAddress, amount) {
        const current = this.getCreatorEarnings(walletAddress);
        if (current < amount) {
            throw new Error('Insufficient earnings balance');
        }
        const newBalance = current - amount;
        this.creatorEarnings.set(walletAddress, newBalance);
        this.save();
        return newBalance;
    }

    // Creator discovery methods
    getTopCreators(limit = 10) {
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

        return creators.slice(0, limit);
    }
}

module.exports = new PersistentDatabase();
