const axios = require('axios');
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');

const API_URL = 'http://localhost:3001';
const DEVNET_RPC = 'https://api.devnet.solana.com';

async function checkBrandWallet(loginWallet) {
    try {
        console.log('====================================');
        console.log('  Brand Wallet Diagnostic');
        console.log('====================================\n');

        console.log(`Login Wallet: ${loginWallet}\n`);

        // Fetch user data from backend
        console.log('Fetching user data from backend...');
        const response = await axios.get(`${API_URL}/api/user/${loginWallet}`);

        if (!response.data.success) {
            console.log('❌ User not found in database');
            console.log('   Have you registered on the site?\n');
            return;
        }

        const userData = response.data.data;
        console.log(`✅ User found!`);
        console.log(`   Role: ${userData.role}`);
        console.log(`   X Connected: ${userData.xConnected ? 'Yes' : 'No'}`);

        if (userData.role !== 'brand') {
            console.log('\n⚠️  You are registered as a CREATOR, not a BRAND');
            console.log('   Only brands have campaign wallets.\n');
            return;
        }

        console.log(`   Brand Wallet Address: ${userData.brandWalletAddress || 'NOT GENERATED'}\n`);

        if (!userData.brandWalletAddress) {
            console.log('❌ No brand wallet generated!');
            console.log('   This is a bug. The wallet should have been created during registration.\n');
            return;
        }

        // Check balance of brand wallet
        console.log('Checking brand wallet balance on blockchain...');
        const connection = new Connection(DEVNET_RPC, 'confirmed');
        const brandPublicKey = new PublicKey(userData.brandWalletAddress);
        const balance = await connection.getBalance(brandPublicKey);
        const solBalance = balance / LAMPORTS_PER_SOL;

        console.log(`\n📊 Brand Wallet Balance: ${solBalance.toFixed(9)} SOL`);
        console.log(`   (${balance} lamports)\n`);

        if (solBalance === 0) {
            console.log('❌ PROBLEM FOUND: Brand wallet has ZERO balance!\n');
            console.log('📝 SOLUTION:');
            console.log('   1. Copy this address: ' + userData.brandWalletAddress);
            console.log('   2. Send SOL from your login wallet to this address');
            console.log('   3. You can use Phantom wallet or any Solana wallet\n');
            console.log('   Quick Command (if you have solana CLI):');
            console.log(`   solana transfer ${userData.brandWalletAddress} 1 --allow-unfunded-recipient --url devnet\n`);
        } else {
            console.log('✅ Brand wallet has funds!');
            console.log('   The balance should now be visible on your dashboard.\n');
        }

        console.log('====================================\n');

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ Cannot connect to backend server');
            console.log('   Make sure the backend is running on port 3001\n');
            console.log('   Start it with: cd reachpay-solana/backend && node server.js\n');
        } else {
            console.error('❌ Error:', error.message);
        }
    }
}

const loginWallet = process.argv[2] || '75nFkgoBybsGJqegAuNX92vY17NBoDjyqvZG3pch33m3';
checkBrandWallet(loginWallet);
