# SolTier

**Performance-Based Influencer Marketing on Solana**

SolTier is a decentralized platform that connects brands with creators through transparent, performance-based compensation. Pay for real engagement. Get paid instantly. No intermediaries, no fraud, no delays.

---

## Why SolTier?

The influencer marketing industry loses billions annually to fake metrics, payment disputes, and platform fees. SolTier solves this by putting everything on-chain.

| Traditional Platforms | SolTier |
|----------------------|---------|
| 20-40% platform fees | Zero commission |
| 30-90 day payment cycles | Instant payouts |
| Self-reported metrics | Twitter API verification |
| Trust-based agreements | Smart contract enforcement |
| Manual dispute resolution | Automated settlements |N

---

## How It Works

### For Brands

**1. Fund Your Campaign**  
Deposit SOL into your campaign wallet. Funds are held in blockchain escrow until performance milestones are met.

**2. Set Your Terms**  
Define your CPM rate, budget cap, and engagement multipliers. Every parameter is transparent and on-chain.

**3. Approve Creators**  
Review applications from verified creators. See their real Twitter metrics before approving.

**4. Pay for Results**  
Creators are compensated automatically based on verified views and engagement. No manual processing required.

### For Creators

**1. Connect Your Accounts**  
Link your Solana wallet and authenticate with Twitter. Your real metrics are verified instantly.

**2. Find Campaigns**  
Browse active campaigns from brands. See exactly how much you can earn based on your reach.

**3. Create Content**  
Post your content and submit the tweet URL. The system tracks performance automatically.

**4. Get Paid Instantly**  
Earnings are calculated in real-time and transferred directly to your wallet. No invoices, no waiting.

---

## The Payout Formula

SolTier uses a transparent, performance-based calculation:

```
Effective Views = Views + (Likes × Like Weight)
Payout = (Effective Views ÷ 1,000) × CPM Rate
```

**Example Calculation:**
- CPM Rate: 0.01 SOL
- Like Weight: 20x
- Post Performance: 50,000 views, 2,500 likes
- Effective Views: 50,000 + (2,500 × 20) = 100,000
- Creator Earnings: 100 × 0.01 = 1.0 SOL

All calculations are verifiable on-chain.

---

## Platform Features

### Campaign Management
- Create campaigns with custom CPM, duration, and budget
- Real-time performance dashboards
- Application review and creator approval workflow
- Campaign cancellation with automatic refund

### Creator Tools
- Twitter OAuth for verified metrics
- Campaign discovery and application
- Tweet submission and tracking
- Instant withdrawal to any Solana wallet

### Security and Trust
- Smart contract escrow for all campaign funds
- Rate limiting and input validation
- Twitter API verification for all metrics
- Transparent transaction history

---

## Technology

| Component | Stack |
|-----------|-------|
| Blockchain | Solana (Devnet/Mainnet) |
| Smart Contracts | Anchor Framework, Rust |
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Backend | Node.js, Express |
| Authentication | Solana Wallet Adapter, Twitter OAuth 2.0 |
| Wallets Supported | Phantom, Solflare |

---

## Quick Start

### Requirements
- Node.js 20 or higher
- Phantom or Solflare browser extension

### Installation

```bash
# Clone the repository
git clone https://github.com/shashwatraajsingh/SolTier.git
cd SolTier

# Install and run frontend
cd reach-pay
npm install
npm run dev

# Install and run backend (separate terminal)
cd reachpay-solana/backend
npm install
cp .env.example .env
npm run dev
```

Access the platform at `http://localhost:3000`

---

## Configuration

### Backend Environment

```bash
NODE_ENV=development
PORT=3001
SOLANA_NETWORK=devnet

# Twitter OAuth (required for creator verification)
TWITTER_CLIENT_ID=your_client_id
TWITTER_CLIENT_SECRET=your_client_secret
TWITTER_CALLBACK_URL=http://localhost:3001/api/x/callback
FRONTEND_URL=http://localhost:3000

# Escrow wallet (required for real withdrawals)
ESCROW_WALLET_SECRET_KEY=your_base58_encoded_key
```

### Frontend Environment

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## API Endpoints

### Campaigns
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/campaign/create` | POST | Create new campaign |
| `/api/campaign/:id/status` | GET | Get campaign details |
| `/api/campaigns/active` | GET | List all active campaigns |
| `/api/campaign/:id/apply` | POST | Apply to campaign |
| `/api/campaign/:id/cancel` | POST | Cancel campaign |
| `/api/campaign/:id/submit-tweet` | POST | Submit tweet for tracking |
| `/api/campaign/:id/process-payout` | POST | Process creator payout |

### Creators
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/creator/applications/:wallet` | GET | Get creator's applications |
| `/api/creator/earnings/:wallet` | GET | Get earnings balance |
| `/api/creator/withdraw` | POST | Withdraw to wallet |

### Twitter Integration
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/x/connect` | POST | Start OAuth flow |
| `/api/x/callback` | GET | OAuth callback |
| `/api/x/metrics/:wallet` | GET | Get verified metrics |

---

## Deployment

### Frontend
Deploy to Vercel, Netlify, or any static hosting:
```bash
cd reach-pay
npm run build
```

### Backend
Deploy to Render, Railway, or any Node.js host:
```bash
cd reachpay-solana/backend
npm start
```

### Production Checklist
- Set `SOLANA_NETWORK=mainnet-beta` for production
- Configure production Twitter OAuth callback URLs
- Set up escrow wallet with sufficient SOL for withdrawals
- Configure CORS for production domains

---

## Project Structure

```
SolTier/
├── reach-pay/                    # Frontend Application
│   ├── src/app/                  # Next.js pages
│   ├── src/components/           # React components
│   ├── src/lib/api.ts           # API client
│   └── src/context/             # State management
│
├── reachpay-solana/
│   ├── backend/                  # API Server
│   │   ├── server.js            # Express application
│   │   ├── persistentDatabase.js # Data persistence
│   │   ├── twitterAuth.js       # OAuth service
│   │   └── oracle.js            # Blockchain interface
│   │
│   └── programs/                 # Solana Programs
│       └── soltier-solana/      # Smart contracts
│
└── .github/workflows/           # CI/CD pipeline
```

---

## Support

For technical issues, open an issue on GitHub.

For partnership and business inquiries, contact through the repository.

---

## License

MIT License

---

*SolTier - Transparent influencer marketing, powered by Solana.*
