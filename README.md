# SolTier

Performance-based influencer marketing platform built on Solana blockchain. Transparent, automated, and trustless creator compensation system.

## What is SolTier?

SolTier revolutionizes influencer marketing by eliminating intermediaries and fraud. Brands pay only for verified performance, and creators get paid instantly for real engagement. All transactions are automated through smart contracts on the Solana blockchain, with metrics verified through Twitter's official API.

## The Problem We Solve

Traditional influencer marketing suffers from:
- **Fraud and Fake Metrics**: 15-25% of budgets lost to fake followers and inflated numbers
- **Payment Delays**: Creators wait 30-90 days for payment
- **High Fees**: Platforms charge 20-40% of campaign budgets
- **Lack of Transparency**: Brands cannot verify actual ROI
- **Trust Issues**: No guarantees for either party

## How SolTier Works

### For Brands

1. **Create a Campaign**
   - Set your CPM rate (cost per 1,000 effective views)
   - Define budget and duration
   - Funds are locked in blockchain escrow

2. **Discover Verified Creators**
   - Browse creators with real Twitter-verified metrics
   - See actual follower counts and engagement rates
   - No fake accounts or inflated numbers

3. **Track Performance in Real-Time**
   - Watch views and likes accumulate live
   - See exact payout calculations transparently
   - Monitor ROI with precision

4. **Automatic Payment**
   - Creators paid automatically as metrics hit milestones
   - No invoices, no manual approvals
   - Funds released from escrow based on performance

### For Creators

1. **Connect Your Accounts**
   - Link Solana wallet for payments
   - Authenticate Twitter via OAuth
   - Your real reach is verified automatically

2. **Browse and Apply to Campaigns**
   - View available brand campaigns
   - See payment terms upfront
   - Apply with proposed content

3. **Create Content**
   - Post on Twitter as agreed
   - System tracks views and engagement automatically
   - Real-time performance visibility

4. **Get Paid Instantly**
   - Earnings calculated every view and like
   - Automatic payment in seconds
   - No waiting, no invoices, no disputes

## Payment Formula

SolTier uses a transparent, performance-based formula:

```
Effective Views = Views + (Likes × Like Weight)
Payout = (Effective Views / 1,000) × CPM Rate
```

**Example:**
- Campaign CPM: $15
- Like Weight: 20 (configurable by brand)
- Your post gets: 10,000 views and 500 likes
- Effective Views: 10,000 + (500 × 20) = 20,000
- Your Payout: (20,000 / 1,000) × $15 = $300

All calculations happen on-chain and are fully transparent.

## Key Features

### Blockchain-Powered Trust
- Smart contract escrow holds campaign funds
- Automatic payout execution based on verified metrics
- No central authority controls payments
- Fully auditable transaction history

### Real Verification
- OAuth 2.0 integration with Twitter API
- Actual follower counts, not self-reported
- Real-time metric tracking
- Impossible to fake blockchain-recorded data

### Instant Payments
- Payouts settle in seconds via Solana
- Standard SOL transfers
- No international wire fees
- Transaction costs under $0.01

### Zero Platform Fees
- No commission on campaigns
- Only blockchain gas fees (fractions of a cent)
- Brands get maximum ROI
- Creators keep 100% of earnings

### Complete Transparency
- See exactly how payouts are calculated
- Real-time campaign performance dashboards
- All metrics verified and on-chain
- No hidden fees or surprise deductions

## Why Choose SolTier?

### vs Traditional Platforms
- **Save 20-40%** on platform commission fees
- **Instant payments** instead of 30-90 day waits
- **Verified metrics** instead of self-reported numbers
- **No disputes** - smart contracts enforce agreements

### vs Direct Creator Deals
- **Performance guaranteed** by blockchain code
- **No trust required** between parties
- **Automated tracking** eliminates manual work
- **Standardized terms** via smart contracts

### vs Other Crypto Solutions
- **Real social integration** with Twitter API
- **Purpose-built** for influencer marketing
- **Simple UX** - feels like Web2, powered by Web3
- **Zero platform fees** - not just "lower" fees

## Technology Stack

Built with modern, scalable technology:

**Blockchain:**
- Solana for sub-second finality and low costs
- Anchor framework for secure smart contracts
- SPL Token standard for payments

**Frontend:**
- Next.js 16 with Turbopack for optimal performance
- Solana Wallet Adapter for seamless Web3 integration
- Real-time updates and responsive design

**Backend:**
- Node.js REST API for business logic
- Twitter API v2 with OAuth 2.0
- Real-time metrics synchronization

## API Documentation

SolTier provides a comprehensive REST API for integration:

### Authentication Endpoints
- User registration and wallet verification
- Twitter OAuth connection
- Session management

### Campaign Management
- Create and configure campaigns
- Browse active opportunities
- Track performance metrics
- Manage applications

### Metrics & Analytics
- Real-time engagement tracking
- Historical performance data
- Payout calculations
- Twitter metrics verification

### Payment Operations
- Escrow funding
- Automatic settlement
- Transaction history
- Balance queries

Full API documentation available for developers building on SolTier.

## Security & Trust

### Smart Contract Security
- PDA-based escrow prevents unauthorized access
- Monotonic metrics prevent manipulation
- Automatic budget limits
- Audited contract code

### Data Protection
- OAuth 2.0 for secure Twitter authentication
- Wallet signatures for authorization
- No sensitive data stored on servers
- Environment variables encrypted

### Payment Safety
- Funds locked in blockchain escrow
- Cannot be withdrawn by platform
- Automatic release only on verified performance
- Transparent on-chain verification

## Use Cases

### Perfect For Brands Who Want To:
- Launch performance-based campaigns
- Work with micro-influencers efficiently
- Track ROI with precision
- Eliminate payment fraud
- Scale influencer marketing globally

### Perfect For Creators Who Want To:
- Get paid for actual performance
- Access brand deals without minimums
- Receive instant payment
- Build verifiable reputation
- Work with international brands easily

### Ideal Campaign Types:
- Product launches and awareness
- App downloads and signups
- Event promotions
- Brand advocacy programs
- Affiliate marketing with engagement focus

## Market Impact

SolTier transforms a $21 billion industry by:
- Reducing fraud by 90%+ through verification
- Eliminating 20-40% platform fees
- Cutting payment time from weeks to seconds
- Enabling global micro-influencer economy
- Creating transparent, fair marketplace

## Getting Started

### For Brands
Visit the platform and connect your Solana wallet. Add funds to your campaign wallet and create your first performance-based campaign in minutes.

### For Creators
Connect your Solana wallet and authenticate your Twitter account. Browse available campaigns and start earning based on your real reach.

## Support & Resources

For questions, integration support, or partnership inquiries, reference the PITCH.md document for detailed platform information and market positioning.

## Open Source

SolTier is built with transparency in mind. The smart contracts, API, and platform logic are designed to be auditable and trustworthy.

## Future Roadmap

Expanding beyond Twitter to create a comprehensive decentralized influencer marketing ecosystem:
- Instagram and TikTok integration
- YouTube campaign support
- Advanced analytics and AI-powered matching
- Creator reputation NFTs
- Multi-campaign automation
- Mobile applications

## License

MIT License - See LICENSE file for details.

---

Built on Solana. Powered by real data. Designed for creators and brands who value transparency.
