# ReachPay Quick Reference

## 🚀 Quick Start Commands

### First Time Setup
```bash
# 1. Deploy smart contract
./deploy.sh

# 2. Copy program ID from output and update:
#    - backend/oracle.js (line 9)
#    - backend/test-flow.js (line 8)

# 3. Run test flow
cd backend
npm test
```

### Daily Operations

#### Start Oracle Monitoring
```bash
cd backend
npm run oracle
# Monitors campaigns every 60 seconds
```

#### Start API Server
```bash
cd backend
npm start
# Server runs on http://localhost:3001
```

#### Manual Metrics Update
```bash
cd backend
node oracle.js update CAMPAIGN_ID 50000 2500
```

## 📋 Common Tasks

### Check Wallet Balance
```bash
solana balance
```

### Get Testnet SOL
```bash
solana airdrop 2
```

### View Program Logs
```bash
solana logs PROGRAM_ID
```

### Get Campaign Status
```bash
# Via CLI
cd backend
node oracle.js status CAMPAIGN_ID

# Via API
curl http://localhost:3001/campaign/CAMPAIGN_ID/status
```

### Rebuild Program
```bash
cargo build-sbf
```

### Redeploy Program
```bash
solana program deploy target/deploy/reachpay_solana.so
```

## 🔧 Troubleshooting

### Program Not Building
```bash
# Clean and rebuild
cargo clean
rustup override set 1.82
cargo build-sbf
```

### Airdrop Failing
```bash
# Try another testnet
solana config set --url https://api.devnet.solana.com
solana airdrop 2
```

### Oracle Can't Update
- Check oracle keypair path in .env
- Verify program ID matches deployed program
- Ensure campaign is active

### API Not Responding
```bash
# Check port availability
lsof -i :3001

# View logs
npm start
```

## 📊 Example Campaign

```javascript
// Campaign parameters
CPM: $10 (10000000 lamports)
Like Weight: 20
Max Budget: $1000 (1000000000 lamports)
Duration: 30 days

// Metrics
Views: 50,000
Likes: 2,500

// Calculation
Effective Views = 50,000 + (20 × 2,500) = 100,000
Payout = (100,000 / 1000) × $10 = $1,000
```

## 🌐 Important URLs

### Testnet
- RPC: https://api.testnet.solana.com
- Explorer: https://explorer.solana.com/?cluster=testnet
- Faucet: https://faucet.solana.com

### Local
- API: http://localhost:3001
- Health: http://localhost:3001/health

## 📁 Key Files

```
programs/reachpay-solana/src/lib.rs  # Smart contract
backend/oracle.js                     # Oracle service
backend/server.js                     # API server
backend/test-flow.js                  # Test script
backend/.env                          # Configuration
deploy.sh                             # Deployment script
```

## 💡 Tips

1. **Save Program ID**: After deployment, save the program ID
2. **Monitor Logs**: Use `solana logs` to debug transactions
3. **Test on Devnet First**: Less congested than testnet
4. **Keep Keypairs Safe**: Never commit id.json files
5. **Check Explorer**: Verify all transactions on explorer

## 🆘 Emergency Commands

### Stop Oracle
```bash
# Ctrl+C in oracle terminal
pkill -f "node oracle.js"
```

### Close All Campaigns
```bash
# Manual: Call close_campaign for each
# Opens refund flow for remaining funds
```

### Check Program Size
```bash
ls -lh target/deploy/reachpay_solana.so
# Should be under 10MB
```

### Verify Deployment
```bash
solana program show PROGRAM_ID
```

---

**Need Help?** Check ARCHITECTURE.md for detailed docs
