# 💰 Creator Withdraw - Quick Reference

## API Endpoints Added

### 1. Get Creator Earnings
```bash
GET /api/creator/earnings/:walletAddress
```

**Example:**
```bash
curl http://localhost:3001/api/creator/earnings/YourWalletAddress
```

**Response:**
```json
{
  "success": true,
  "data": {
    "earnings": 2.5,          // in SOL
    "earningsLamports": 2500000000
  }
}
```

---

### 2. Withdraw Earnings
```bash
POST /api/creator/withdraw
```

**Request Body:**
```json
{
  "walletAddress": "CreatorWalletAddress",
  "amount": 1.5  // SOL amount to withdraw
}
```

**Example:**
```bash
curl -X POST http://localhost:3001/api/creator/withdraw \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "YourWallet", "amount": 1.5}'
```

**Success Response:**
```json
{
  "success": true,
  "message": "Withdrawal successful",
  "data": {
    "withdrawn": 1.5,
    "remainingBalance": 1.0
  }
}
```

**Error Response (Insufficient Balance):**
```json
{
  "success": false,
  "error": "Insufficient earnings balance",
  "available": 0.5,
  "requested": 1.5
}
```

---

### 3. User Profile (Updated)
```bash
GET /api/user/:walletAddress
```

**Now includes `creatorEarnings` field for creators:**
```json
{
  "success": true,
  "data": {
    "walletAddress": "...",
    "role": "creator",
    "xConnected": true,
    "xUsername": "creator123",
    "creatorEarnings": 2.5  // ← NEW FIELD
  }
}
```

---

## Frontend Usage

### TypeScript/React
```typescript
import { getCreatorEarnings, withdrawCreatorEarnings, getUser } from '@/lib/api';

// Get earnings
const { earnings } = await getCreatorEarnings(walletAddress);
console.log(`Available: ${earnings} SOL`);

// Withdraw
try {
  const result = await withdrawCreatorEarnings(walletAddress, 1.5);
  alert(`Successfully withdrew ${result.data.withdrawn} SOL`);
} catch (error) {
  alert('Withdrawal failed');
}

// Or check via user profile
const user = await getUser(walletAddress);
if (user.role === 'creator') {
  console.log(`Earnings: ${user.creatorEarnings} SOL`);
}
```

---

## Testing

Run the test script:
```bash
cd /home/shashwat/SolTier
./test-creator-withdraw.sh
```

---

## Implementation Notes

### ✅ What Works Now
- ✅ Earnings are tracked per creator wallet
- ✅ API endpoints validate creator role
- ✅ Balance checks prevent over-withdrawal
- ✅ User profile shows earnings
- ✅ Frontend API functions ready to use

### 🚧 Production TODO
- ⚠️ **Actual SOL transfer** - Currently only database update
- ⚠️ Set up escrow wallet (ESCROW_WALLET_SECRET_KEY in .env)
- ⚠️ Integrate with campaign payout logic
- ⚠️ Add transaction history
- ⚠️ Build UI components (withdraw button, balance display)

---

## How Money Flows

```
┌─────────────────┐
│  Brand Wallet   │ (Solana Wallet - generated on registration)
│   (Holds SOL)   │
└────────┬────────┘
         │
         │ Campaign runs, metrics tracked
         │
         ▼
┌─────────────────┐
│ Creator Earns   │ db.addCreatorEarnings(creator, amount)
│  (DB Tracking)  │
└────────┬────────┘
         │
         │ Creator requests withdrawal
         │
         ▼
┌─────────────────┐
│  Withdraw API   │ db.deductCreatorEarnings(creator, amount)
│                 │ + SOL transfer to login wallet
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Creator Wallet  │ (Their login wallet - receives SOL)
│  (Login Wallet) │
└─────────────────┘
```

---

## File Changes

### Backend
- `reachpay-solana/backend/database.js` - Added earnings storage & methods
- `reachpay-solana/backend/server.js` - Added withdraw endpoints

### Frontend
- `reach-pay/src/lib/api.ts` - Added withdraw API functions

### Documentation
- `CREATOR_WITHDRAW_IMPLEMENTATION.md` - Full implementation guide
- `CREATOR_WITHDRAW_QUICKREF.md` - This file
- `test-creator-withdraw.sh` - Test script

---

**Last Updated**: 2025-12-10
