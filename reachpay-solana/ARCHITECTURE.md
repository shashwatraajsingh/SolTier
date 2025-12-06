# ReachPay System Architecture and Implementation

## Complete Deliverables

### 1. Anchor Smart Contract (programs/reachpay-solana/src/lib.rs)

Core Features:
- Campaign creation with escrow
- Creator acceptance
- Oracle metrics updates (monotonic)
- Automatic payout settlement
- Campaign closure with refunds

Security:
- PDA-controlled escrow accounts
- Role-based access control (brand, creator, oracle)
- Overflow protection with checked arithmetic
- Monotonic metrics enforcement

### 2. Oracle Service (backend/oracle.js)

Features:
- Automatic campaign monitoring
- Metrics fetching (mock for MVP, Twitter API ready)
- On-chain state updates
- Payout settlement triggers
- CLI interface

Usage:
```bash
node oracle.js monitor           # Start monitoring
node oracle.js update <id> <views> <likes>
node oracle.js settle <id> <token_account>
node oracle.js status <id>
```

### 3. REST API Server (backend/server.js)

Endpoints:
- GET /health - Health check
- GET /campaign/:id/status - Campaign details
- POST /metrics/update - Update metrics
- POST /campaign/:id/settle - Settle payout
- POST /wallet/verify - Wallet verification

Usage:
```bash
npm start  # Starts on port 3001
```

### 4. Test Flow Script (backend/test-flow.js)

Demonstrates:
1. Creating mock USDC token
2. Brand creating campaign
3. Creator accepting campaign
4. Oracle updating metrics
5. Automatic payout calculation and transfer

### 5. Deployment Script (deploy.sh)

Automated:
- Prerequisites check
- Network configuration
- Program build
- Program ID extraction and update
- Deployment to testnet
- Post-deployment instructions

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Future)                        │
│                  React + Solana Wallet Adapter               │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Web3 Calls
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                    REST API Server                           │
│                  (Express + Oracle Client)                   │
│                                                              │
│  GET  /campaign/:id/status                                  │
│  POST /metrics/update                                       │
│  POST /campaign/:id/settle                                  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Anchor SDK
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                  Solana Blockchain (Testnet)                 │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │        ReachPay Anchor Program                        │ │
│  │                                                        │ │
│  │  Instructions:                                        │ │
│  │  • create_campaign(cpm, like_weight, max_budget)     │ │
│  │  • accept_campaign()                                 │ │
│  │  • update_metrics(views, likes)                      │ │
│  │  • settle_payout()                                   │ │
│  │  • close_campaign()                                  │ │
│  │                                                        │ │
│  │  State:                                               │ │
│  │  • Campaign PDA (metadata + metrics)                 │ │
│  │  • Escrow PDA (USDC token account)                   │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │           SPL Token Program (Mock USDC)               │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                        ↑
                        │
                        │ Metrics Fetching
                        │
┌─────────────────────────────────────────────────────────────┐
│                   X/Twitter API (Future)                     │
│                   Post Views + Likes                         │
└─────────────────────────────────────────────────────────────┘
```

## Payment Flow

### Campaign Lifecycle

```
1. BRAND CREATES CAMPAIGN
   ├─ Deposits max_budget into escrow PDA
   ├─ Sets CPM rate and like weight
   └─ Assigns creator

2. CREATOR ACCEPTS
   └─ Campaign becomes active

3. ORACLE MONITORS AND UPDATES
   ├─ Fetches X post metrics every N seconds
   ├─ Validates monotonic increase
   └─ Updates on-chain state

4. AUTOMATIC SETTLEMENT
   ├─ Calculates: effective_views = views + (likes × weight)
   ├─ Computes: payout = (effective_views / 1000) × CPM
   ├─ Transfers due amount from escrow to creator
   └─ Stops when budget exhausted or time expired

5. CAMPAIGN CLOSURE
   └─ Refunds remaining escrow to brand
```

### Payout Formula

```
Effective Views = Views + (20 × Likes)
Payout = (Effective Views ÷ 1000) × CPM

Example:
  Views: 50,000
  Likes: 2,500
  Like Weight: 20
  CPM: $10

  Effective Views = 50,000 + (20 × 2,500) = 100,000
  Payout = (100,000 ÷ 1,000) × $10 = $1,000
```

## Deployment Guide

### Quick Start

```bash
# Step 1: Setup environment
./deploy.sh

# Step 2: Get testnet SOL
solana airdrop 2

# Step 3: Update program IDs in backend files
# (deploy.sh shows the program ID)

# Step 4: Test the flow
cd backend
npm test

# Step 5: Start oracle service
npm run oracle

# Step 6: Start API server (separate terminal)
npm start
```

### Manual Deployment

```bash
# Build
export PATH="$HOME/.cargo/bin:$HOME/.local/share/solana/install/active_release/bin:$PATH"
cargo build-sbf

# Get program ID
solana address -k target/deploy/reachpay_solana-keypair.json

# Update declare_id!() in lib.rs
# Update PROGRAM_ID in backend files

# Rebuild
cargo build-sbf

# Deploy
solana program deploy target/deploy/reachpay_solana.so
```

## Testing

### Testnet Explorer Links

After deployment, check these URLs:
- Program: https://explorer.solana.com/address/PROGRAM_ID?cluster=testnet
- Transaction: https://explorer.solana.com/tx/TX_SIGNATURE?cluster=testnet

### API Testing

```bash
# Health check
curl http://localhost:3001/health

# Get campaign status
curl http://localhost:3001/campaign/CAMPAIGN_ID/status

# Update metrics
curl -X POST http://localhost:3001/metrics/update \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "CAMPAIGN_ID",
    "views": 50000,
    "likes": 2500
  }'
```

## Campaign Data Structure

```rust
pub struct Campaign {
    pub campaign_id: Pubkey,      // Unique identifier
    pub brand: Pubkey,             // Brand wallet
    pub creator: Pubkey,           // Creator wallet
    pub cpm: u64,                  // Cost per 1K views (USDC)
    pub like_weight: u64,          // Multiplier for likes
    pub max_budget: u64,           // Total budget (USDC)
    pub escrow_balance: u64,       // Remaining funds
    pub views: u64,                // Current views
    pub likes: u64,                // Current likes
    pub start_time: i64,           // Campaign start
    pub end_time: i64,             // Campaign end
    pub is_active: bool,           // Active status
    pub total_paid: u64,           // Total paid to creator
}
```

## Security Model

### Access Control Matrix

| Action              | Brand | Creator | Oracle | Anyone |
|---------------------|-------|---------|--------|--------|
| create_campaign     | Yes   | No      | No     | No     |
| accept_campaign     | No    | Yes     | No     | No     |
| update_metrics      | No    | No      | Yes    | No     |
| settle_payout       | No    | No      | No     | Yes    |
| close_campaign      | Yes   | No      | No     | No     |

### Safety Guarantees

1. Escrow Safety: Funds in PDA, controlled by program
2. Monotonic Metrics: Views/likes can only increase
3. Budget Cap: Payouts stopped when escrow depleted
4. Time Bounds: Campaign auto-expires
5. Role Enforcement: Instruction-level access control

## Future Enhancements

- Multi-sig oracle consensus
- Real-time Twitter API integration
- Campaign analytics dashboard
- Automated dispute resolution
- Multi-token support (USDC, USDT, SOL)
- Campaign templates
- Bulk campaign management
- Webhook notifications
- GraphQL API

## Resources

- Solana Testnet: https://api.testnet.solana.com
- Explorer: https://explorer.solana.com/?cluster=testnet
- Anchor Documentation: https://www.anchor-lang.com
- SPL Token: https://spl.solana.com/token

## Support

For issues or questions:
1. Check deployment-info.txt for program ID
2. View logs with ANCHOR_LOG=true
3. Monitor transactions on explorer
4. Check oracle service logs

---

Built with Anchor 0.32, Solana Testnet, Node.js 16+
