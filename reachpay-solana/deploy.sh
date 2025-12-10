#!/bin/bash

# ReachPay Deployment Script for Solana Devnet

set -e

echo "[DEPLOY] SolTier Solana Deployment Script"
echo "======================================"
echo ""

# Setup paths
export PATH="$HOME/.cargo/bin:$HOME/.local/share/solana/install/active_release/bin:$PATH"

# Check prerequisites
echo "[CHECK] Checking prerequisites..."

if ! command -v solana &> /dev/null; then
    echo "[ERROR] Solana CLI not found. Please install it first."
    exit 1
fi

if ! command -v anchor &> /dev/null; then
    echo "[ERROR] Anchor not found. Please install it first."
    exit 1
fi

echo "[OK] Prerequisites OK"
echo ""

# Configure network
echo "[NETWORK] Configuring Solana devnet..."
solana config set --url https://api.devnet.solana.com
echo ""

# Check balance
echo "[BALANCE] Checking wallet balance..."
BALANCE=$(solana balance | awk '{print $1}')
echo "   Balance: $BALANCE SOL"

if (( $(echo "$BALANCE < 2" | bc -l) )); then
    echo "[WARNING]  Low balance. Requesting airdrop..."
    solana airdrop 2 || echo "[WARNING]  Airdrop failed (devnet might be congested). You may need to get SOL from a faucet."
fi
echo ""

# Build program
echo "[BUILD] Building program..."
cargo build-sbf
echo "[OK] Build complete"
echo ""

# Get program ID
PROGRAM_KEYPAIR="target/deploy/soltier_solana-keypair.json"
if [ ! -f "$PROGRAM_KEYPAIR" ]; then
    echo "[ERROR] Program keypair not found at $PROGRAM_KEYPAIR"
    exit 1
fi

PROGRAM_ID=$(solana address -k $PROGRAM_KEYPAIR)
echo "[INFO] Program ID: $PROGRAM_ID"
echo ""

# Update lib.rs with program ID
echo "[UPDATE] Updating program ID in source code..."
sed -i "s/declare_id!(\".*\");/declare_id!(\"$PROGRAM_ID\");/" programs/soltier-solana/src/lib.rs
echo "[OK] Updated lib.rs"
echo ""

# Rebuild with new program ID
echo "[BUILD] Rebuilding with updated program ID..."
cargo build-sbf
echo "[OK] Rebuild complete"
echo ""

# Deploy
echo "[DEPLOY] Deploying to devnet..."
solana program deploy target/deploy/soltier_solana.so

if [ $? -eq 0 ]; then
    echo ""
    echo "[OK] DEPLOYMENT SUCCESSFUL!"
    echo "========================="
    echo ""
    echo "[CHECK] Deployment Info:"
    echo "   Program ID: $PROGRAM_ID"
    echo "   Network: Devnet"
    echo "   Explorer: https://explorer.solana.com/address/$PROGRAM_ID?cluster=devnet"
    echo ""
    echo "[NEXT] Next Steps:"
    echo "   1. Update PROGRAM_ID in backend/oracle.js"
    echo "   2. Update PROGRAM_ID in backend/test-flow.js"
    echo "   3. Run: cd backend && node test-flow.js"
    echo ""
    echo "[SAVE] Save this info:"
    echo "   Program ID: $PROGRAM_ID" > deployment-info.txt
    echo "   Network: Devnet" >> deployment-info.txt
    echo "   Date: $(date)" >> deployment-info.txt
    echo "   Deployment info saved to deployment-info.txt"
else
    echo "[ERROR] Deployment failed"
    exit 1
fi
