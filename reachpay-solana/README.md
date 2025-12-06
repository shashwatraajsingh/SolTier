# ReachPay Solana Backend

Performance-based payout system for X (Twitter) promotions built on Solana.

## 🏗️ Architecture

### Smart Contract (Anchor Program)
- **Campaign Management**: Brands create campaigns with CPM rates and budgets
- **Escrow System**: Funds locked in PDA-controlled token accounts
- **Metrics Tracking**: Oracle updates views + likes on-chain
- **Automatic Settlement**: Trustless payout calculation based on formula:
  ```
  Effective Views = Views + (Likes × Like Weight)
  Payout = (Effective Views / 1000) × CPM
  ```

### Oracle Service (Node.js)
- Fetches X post metrics (mock implementation for MVP)
- Updates campaign metrics on-chain
- Triggers automatic payouts
- REST API for frontend integration

## 📦 Project Structure

```
reachpay-solana/
├── programs/reachpay-solana/    # Anchor smart contract
│   └── src/lib.rs               # Main program logic
├── backend/                     # Oracle service
│   ├── oracle.js                # Oracle client
│   ├── server.js                # REST API server
│   ├── test-flow.js             # Test script
│   └── .env                     # Configuration
├── target/                      # Build artifacts
│   ├── deploy/                  # Compiled .so files
│   └── idl/                     # Interface definitions
└── Anchor.toml                  # Anchor configuration
```

## 🚀 Setup

### Prerequisites
- Rust 1.82+
- Solana CLI
- Anchor 0.32+
- Node.js 16+

### Installation

1. **Install Solana CLI**
   ```bash
   sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
   export PATH="/home/$USER/.local/share/solana/install/active_release/bin:$PATH"
   ```

2. **Install Anchor**
   ```bash
   cargo install --git https://github.com/coral-xyz/anchor avm --force
   avm install 0.32.1
   avm use 0.32.1
   ```

3. **Configure Solana for Testnet**
   ```bash
   solana config set --url https://api.testnet.solana.com
   solana-keygen new --no-bip39-passphrase
   ```

4. **Build the Program**
   ```bash
   anchor build
   # OR if IDL build fails:
   cargo build-sbf
   ```

5. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   ```

## 🧪 Testing

### Deploy to Testnet

1. **Get Program ID**
   ```bash
   solana address -k target/deploy/reachpay_solana-keypair.json
   ```

2. **Update Program ID**
   - Update `declare_id!()` in `programs/reachpay-solana/src/lib.rs`
   - Update `PROGRAM_ID` in `backend/oracle.js` and `backend/test-flow.js`

3. **Deploy**
   ```bash
   anchor deploy
   ```

4. **Run Test Flow**
   ```bash
   cd backend
   node test-flow.js
   ```

### Example Campaign Flow

```bash
# Terminal 1: Start Oracle Service
cd backend
node oracle.js monitor

# Terminal 2: Create and test campaign
node test-flow.js

# Terminal 3: Use API
curl http://localhost:3001/campaign/CAMPAIGN_ID/status
```

## 📡 API Endpoints

### GET `/health`
Health check

### GET `/campaign/:id/status`
Get campaign details and payout info

**Response:**
```json
{
  "success": true,
  "data": {
    "campaignId": "...",
    "views": 50000,
    "likes": 2500,
    "effectiveViews": 100000,
    "totalPaid": 1000000000,
    "remainingPayout": 0,
    "isActive": true
  }
}
```

### POST `/metrics/update`
Manual metrics update (oracle only)

**Request:**
```json
{
  "campaignId": "CAMPAIGN_PUBKEY",
  "views": 50000,
  "likes": 2500
}
```

### POST `/campaign/:id/settle`
Settle payout

**Request:**
```json
{
  "creatorTokenAccount": "TOKEN_ACCOUNT_PUBKEY"
}
```

## 🔐 Security Features

- ✅ Only brand can fund campaigns
- ✅ Only assigned creator receives payouts
- ✅ Only oracle can update metrics
- ✅ Monotonic metrics (can't decrease)
- ✅ Payout capped by escrow balance
- ✅ Auto-deactivation on budget exhaustion

## 🎯 Smart Contract Instructions

### `create_campaign`
Brand initializes campaign and deposits funds into escrow

**Accounts:**
- `campaign` - PDA for campaign state
- `escrow_token_account` - PDA for holding USDC
- `brand` - Brand's wallet (signer)
- `brand_token_account` - Brand's USDC account

### `accept_campaign`
Creator accepts the campaign

### `update_metrics`
Oracle updates views and likes (monotonic increase only)

### `settle_payout`
Calculate and transfer payout to creator

### `close_campaign`
Refund remaining funds to brand

## 📊 Campaign Parameters

- **CPM**: Cost per 1,000 effective views (USDC)
- **Like Weight**: Multiplier for likes (default: 20)
- **Max Budget**: Total USDC allocated
- **Start/End Time**: Campaign duration
- **Creator**: Assigned creator pubkey

## 🛠️ Development

### Run Oracle Monitoring
```bash
cd backend
node oracle.js monitor 60000  # Check every 60s
```

### Manual Metrics Update
```bash
node oracle.js update CAMPAIGN_ID 50000 2500
```

### Get Campaign Status
```bash
node oracle.js status CAMPAIGN_ID
```

## 📝 TODO / Production Enhancements

- [ ] Integrate real Twitter API for metrics
- [ ] Add signature verification for wallet auth
- [ ] Implement webhook notifications
- [ ] Add campaign analytics dashboard
- [ ] Multi-oracle consensus mechanism
- [ ] Rate limiting and caching
- [ ] Automated deployment scripts
- [ ] Monitoring and alerting

## 🔗 Useful Links

- [Solana Testnet Explorer](https://explorer.solana.com/?cluster=testnet)
- [Anchor Documentation](https://www.anchor-lang.com/)
- [SPL Token Program](https://spl.solana.com/token)

## 📄 License

MIT
