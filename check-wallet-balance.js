const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');

const DEVNET_RPC = 'https://api.devnet.solana.com';

async function checkBalance(address) {
    try {
        console.log('====================================');
        console.log('  Solana Wallet Balance Checker');
        console.log('====================================\n');

        const connection = new Connection(DEVNET_RPC, 'confirmed');
        const publicKey = new PublicKey(address);

        console.log(`Wallet Address: ${address}`);
        console.log(`Network: Devnet\n`);

        // Fetch balance
        const balance = await connection.getBalance(publicKey);
        const solBalance = balance / LAMPORTS_PER_SOL;

        console.log(`Balance: ${solBalance.toFixed(9)} SOL`);
        console.log(`Balance (lamports): ${balance}\n`);

        if (solBalance === 0) {
            console.log('⚠️  This wallet has ZERO balance!');
            console.log('   You need to send SOL to this address.\n');
        } else {
            console.log('✅ Wallet has funds!\n');
        }

        console.log('====================================\n');

    } catch (error) {
        console.error('❌ Error checking balance:', error.message);
    }
}

// Check the wallet from command line argument
const walletAddress = process.argv[2] || '75nFkgoBybsGJqegAuNX92vY17NBoDjyqvZG3pch33m3';

checkBalance(walletAddress);
