#!/bin/bash

# ReachPay Deployment Script for Solana Testnet

set -e

echo "🚀 ReachPay Solana Deployment Script"
echo "======================================"
echo ""

# Setup paths
export PATH="$HOME/.cargo/bin:$HOME/.local/share/solana/install/active_release/bin:$PATH"

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v solana &> /dev/null; then
    echo "❌ Solana CLI not found. Please install it first."
    exit 1
fi

if ! command -v anchor &> /dev/null; then
    echo "❌ Anchor not found. Please install it first."
    exit 1
fi

echo "✅ Prerequisites OK"
echo ""

# Configure network
echo "🌐 Configuring Solana testnet..."
solana config set --url https://api.testnet.solana.com
echo ""

# Check balance
echo "💰 Checking wallet balance..."
BALANCE=$(solana balance | awk '{print $1}')
echo "   Balance: $BALANCE SOL"

if (( $(echo "$BALANCE < 2" | bc -l) )); then
    echo "⚠️  Low balance. Requesting airdrop..."
    solana airdrop 2 || echo "⚠️  Airdrop failed (testnet might be congested). You may need to get SOL from a faucet."
fi
echo ""

# Build program
echo "🔨 Building program..."
cargo build-sbf
echo "✅ Build complete"
echo ""

# Get program ID
PROGRAM_KEYPAIR="target/deploy/reachpay_solana-keypair.json"
if [ ! -f "$PROGRAM_KEYPAIR" ]; then
    echo "❌ Program keypair not found at $PROGRAM_KEYPAIR"
    exit 1
fi

PROGRAM_ID=$(solana address -k $PROGRAM_KEYPAIR)
echo "📝 Program ID: $PROGRAM_ID"
echo ""

# Update lib.rs with program ID
echo "🔄 Updating program ID in source code..."
sed -i "s/declare_id!(\".*\");/declare_id!(\"$PROGRAM_ID\");/" programs/reachpay-solana/src/lib.rs
echo "✅ Updated lib.rs"
echo ""

# Rebuild with new program ID
echo "🔨 Rebuilding with updated program ID..."
cargo build-sbf
echo "✅ Rebuild complete"
echo ""

# Deploy
echo "🚀 Deploying to testnet..."
solana program deploy target/deploy/reachpay_solana.so

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ DEPLOYMENT SUCCESSFUL!"
    echo "========================="
    echo ""
    echo "📋 Deployment Info:"
    echo "   Program ID: $PROGRAM_ID"
    echo "   Network: Testnet"
    echo "   Explorer: https://explorer.solana.com/address/$PROGRAM_ID?cluster=testnet"
    echo ""
    echo "🔧 Next Steps:"
    echo "   1. Update PROGRAM_ID in backend/oracle.js"
    echo "   2. Update PROGRAM_ID in backend/test-flow.js"
    echo "   3. Run: cd backend && node test-flow.js"
    echo ""
    echo "📄 Save this info:"
    echo "   Program ID: $PROGRAM_ID" > deployment-info.txt
    echo "   Network: Testnet" >> deployment-info.txt
    echo "   Date: $(date)" >> deployment-info.txt
    echo "   Deployment info saved to deployment-info.txt"
else
    echo "❌ Deployment failed"
    exit 1
fi
