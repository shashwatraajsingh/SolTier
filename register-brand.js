const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function registerBrandUser(loginWallet, brandWalletAddress) {
    try {
        console.log('====================================');
        console.log('  Manual Brand Registration');
        console.log('====================================\n');

        console.log(`Login Wallet: ${loginWallet}`);
        console.log(`Brand Wallet: ${brandWalletAddress}\n`);

        // Register the user as a brand
        console.log('Registering user as brand...');
        const response = await axios.post(`${API_URL}/api/user/register`, {
            walletAddress: loginWallet,
            role: 'brand'
        });

        if (response.data.success) {
            console.log('✅ User registered successfully!');
            console.log(`   Generated Brand Wallet: ${response.data.data.brandWalletAddress}\n`);

            if (response.data.data.brandWalletAddress === brandWalletAddress) {
                console.log('✅ PERFECT! The generated wallet matches the one with 5 SOL!');
            } else {
                console.log('⚠️  WARNING: Different wallet generated!');
                console.log(`   Expected: ${brandWalletAddress}`);
                console.log(`   Got: ${response.data.data.brandWalletAddress}`);
                console.log(`\n   This means the 5 SOL is in a different wallet.`);
                console.log(`   You'll need to send SOL to the new address instead.\n`);
            }

            // Fetch the user data to confirm
            console.log('Fetching user data to confirm...');
            const userData = await axios.get(`${API_URL}/api/user/${loginWallet}`);

            if (userData.data.success) {
                console.log('✅ User data confirmed:');
                console.log(`   Role: ${userData.data.data.role}`);
                console.log(`   Brand Wallet: ${userData.data.data.brandWalletAddress}`);
                console.log(`   Brand Balance: ${userData.data.data.brandBalance || 0} SOL\n`);
            }

        } else {
            console.log('❌ Registration failed:', response.data.error);
        }

        console.log('====================================\n');

    } catch (error) {
        if (error.response) {
            console.error('❌ Error:', error.response.data.error || error.message);
        } else if (error.code === 'ECONNREFUSED') {
            console.error('❌ Cannot connect to backend server');
            console.error('   Make sure it\'s running on port 3001\n');
        } else {
            console.error('❌ Error:', error.message);
        }
    }
}

const loginWallet = process.argv[2] || '75nFkgoBybsGJqegAuNX92vY17NBoDjyqvZG3pch33m3';
const brandWallet = process.argv[3] || '438Fvd6tYJwgvCNC2Sk43kd46rVagKF7N8tcN9biZ9dj';

registerBrandUser(loginWallet, brandWallet);
