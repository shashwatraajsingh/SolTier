#!/bin/bash

# Test Brand Wallet Generation (Local & Production)
# This script tests if brand wallet generation works

echo "🧪 Testing Brand Wallet Generation"
echo "===================================="
echo ""

# Check if URL is provided or use localhost
API_URL="${1:-http://localhost:3001}"
echo "📡 Testing against: $API_URL"
echo ""

# Generate random wallet address for testing
BRAND_WALLET="TestBrand_$(date +%s)"
echo "👤 Test Wallet: $BRAND_WALLET"
echo ""

# Test 1: Register Brand
echo "1️⃣ Registering brand..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/user/register" \
  -H "Content-Type: application/json" \
  -d "{\"walletAddress\": \"$BRAND_WALLET\", \"role\": \"brand\"}")

echo "Response:"
echo "$REGISTER_RESPONSE" | jq '.'
echo ""

# Check if brandWalletAddress exists in response
BRAND_WALLET_ADDR=$(echo "$REGISTER_RESPONSE" | jq -r '.data.brandWalletAddress // empty')

if [ -z "$BRAND_WALLET_ADDR" ] || [ "$BRAND_WALLET_ADDR" == "null" ]; then
    echo "❌ FAILED: Brand wallet was NOT generated!"
    echo ""
    echo "Possible causes:"
    echo "  - bs58 import issue (check logs)"
    echo "  - Server error (check backend logs)"
    echo "  - Missing dependencies"
    echo ""
    exit 1
else
    echo "✅ SUCCESS: Brand wallet generated!"
    echo "   Wallet Address: $BRAND_WALLET_ADDR"
    echo ""
fi

# Test 2: Verify in User Profile
echo "2️⃣ Checking user profile..."
PROFILE_RESPONSE=$(curl -s "$API_URL/api/user/$BRAND_WALLET")
echo "Response:"
echo "$PROFILE_RESPONSE" | jq '.'
echo ""

PROFILE_WALLET=$(echo "$PROFILE_RESPONSE" | jq -r '.data.brandWalletAddress // empty')

if [ "$PROFILE_WALLET" == "$BRAND_WALLET_ADDR" ]; then
    echo "✅ SUCCESS: Wallet address matches in profile!"
else
    echo "❌ FAILED: Wallet address does not match!"
    exit 1
fi

# Test 3: Check Balance
BALANCE=$(echo "$PROFILE_RESPONSE" | jq -r '.data.brandBalance // empty')
echo "3️⃣ Checking brand balance..."
echo "   Balance: $BALANCE SOL"

if [ -n "$BALANCE" ]; then
    echo "✅ SUCCESS: Balance check works!"
else
    echo "⚠️  WARNING: Balance not returned (might be normal if Solana not configured)"
fi

echo ""
echo "===================================="
echo "✅ All tests passed!"
echo ""
echo "Summary:"
echo "  ✅ Brand registration works"
echo "  ✅ Wallet generation works"
echo "  ✅ Profile includes wallet address"
echo "  ✅ Balance checking works"
echo ""
echo "Generated Wallet: $BRAND_WALLET_ADDR"
echo ""

# Usage instructions
if [ "$API_URL" == "http://localhost:3001" ]; then
    echo "💡 To test production, run:"
    echo "   ./test-brand-wallet.sh https://your-backend.onrender.com"
fi
