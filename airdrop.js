const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');

const DEVNET_RPC = 'https://api.devnet.solana.com';

async function requestAirdrop(address, amount = 2) {
    try {
        console.log('====================================');
        console.log('  Requesting Devnet Airdrop');
        console.log('====================================\n');

        const connection = new Connection(DEVNET_RPC, 'confirmed');
        const publicKey = new PublicKey(address);

        console.log(`Address: ${address}`);
        console.log(`Requesting: ${amount} SOL\n`);

        // Request airdrop
        console.log('Requesting airdrop...');
        const signature = await connection.requestAirdrop(
            publicKey,
            amount * LAMPORTS_PER_SOL
        );

        console.log(`Transaction signature: ${signature}`);
        console.log('Waiting for confirmation...\n');

        // Wait for confirmation
        await connection.confirmTransaction(signature);

        console.log(' Airdrop confirmed!\n');

        // Check new balance
        const balance = await connection.getBalance(publicKey);
        const solBalance = balance / LAMPORTS_PER_SOL;

        console.log(`New balance: ${solBalance.toFixed(9)} SOL\n`);
        console.log('====================================\n');
        console.log('SUCCESS! Your brand wallet now has funds!');
        console.log('   Refresh your dashboard to see the balance.\n');

    } catch (error) {
        console.error(' Airdrop failed:', error.message);
        console.log('\n Alternative: Send SOL manually from your login wallet');
        console.log(`   From: 75nFkgoBybsGJqegAuNX92vY17NBoDjyqvZG3pch33m3`);
        console.log(`   To:   ${address}`);
        console.log('   Amount: 1-2 SOL\n');
    }
}

const address = process.argv[2] || 'CFzR4e6zrXLj2cvJKjGtvwLQP2is7swMYmCMPQTBbE6B';
const amount = parseFloat(process.argv[3]) || 2;

requestAirdrop(address, amount);
