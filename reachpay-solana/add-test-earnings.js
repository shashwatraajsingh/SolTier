/**
 * Database Helper Script
 * Use this to manually add creator earnings for testing
 * 
 * Usage:
 * node add-test-earnings.js <creatorWalletAddress> <amountInSOL>
 * 
 * Example:
 * node add-test-earnings.js TestCreatorWallet123 5.0
 */

const db = require('./backend/database');

const args = process.argv.slice(2);

if (args.length < 2) {
    console.error('❌ Usage: node add-test-earnings.js <walletAddress> <amountInSOL>');
    console.error('   Example: node add-test-earnings.js TestCreator123 5.0');
    process.exit(1);
}

const walletAddress = args[0];
const amountInSOL = parseFloat(args[1]);

if (isNaN(amountInSOL) || amountInSOL <= 0) {
    console.error('❌ Amount must be a positive number');
    process.exit(1);
}

// Check if user exists and is a creator
const user = db.getUser(walletAddress);
if (!user) {
    console.error(`❌ User not found: ${walletAddress}`);
    console.error('   Create user first: curl -X POST http://localhost:3001/api/user/register -H "Content-Type: application/json" -d \'{"walletAddress":"' + walletAddress + '","role":"creator"}\'');
    process.exit(1);
}

if (user.role !== 'creator') {
    console.error(`❌ User ${walletAddress} is not a creator (role: ${user.role})`);
    process.exit(1);
}

// Add earnings
const amountInLamports = Math.floor(amountInSOL * 1e9);
const newBalance = db.addCreatorEarnings(walletAddress, amountInLamports);

console.log('✅ Earnings added successfully!');
console.log('');
console.log(`👤 Creator: ${walletAddress}`);
console.log(`💰 Added: ${amountInSOL} SOL`);
console.log(`📊 New Balance: ${(newBalance / 1e9).toFixed(4)} SOL`);
console.log('');
console.log('🧪 Test withdrawal with:');
console.log(`   curl -X POST http://localhost:3001/api/creator/withdraw -H "Content-Type: application/json" -d '{"walletAddress":"${walletAddress}","amount":${amountInSOL}}'`);
console.log('');
