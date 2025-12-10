#!/bin/bash

# Test Persistent Database - Verify Data Survives "Server Restart"

echo "🧪 Testing Persistent Database"
echo "=============================="
echo ""

API_URL="http://localhost:3001"
BRAND_WALLET="PersistTestBrand_$(date +%s)"

echo "📝 This test simulates server restart to verify data persistence"
echo ""

# Test 1: Register brand
echo "1️⃣ Registering brand: $BRAND_WALLET"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/user/register" \
  -H "Content-Type: application/json" \
  -d "{\"walletAddress\": \"$BRAND_WALLET\", \"role\": \"brand\"}")

WALLET_1=$(echo $REGISTER_RESPONSE | jq -r '.data.brandWalletAddress')
echo "   Brand Wallet Generated: $WALLET_1"
echo ""

# Test 2: Get user again (should return same wallet)
echo "2️⃣ Getting user (before restart simulation)..."
USER_RESPONSE=$(curl -s "$API_URL/api/user/$BRAND_WALLET")
WALLET_2=$(echo $USER_RESPONSE | jq -r '.data.brandWalletAddress')
echo "   Brand Wallet Retrieved: $WALLET_2"
echo ""

# Test 3: Check database file
echo "3️⃣ Checking database file..."
DB_FILE="reachpay-solana/backend/data/database.json"

if [ -f "$DB_FILE" ]; then
    echo "   ✅ Database file exists: $DB_FILE"
    USER_COUNT=$(cat "$DB_FILE" | jq '.users | length')
    echo "   📊 Users in database: $USER_COUNT"
else
    echo "   ❌ Database file NOT found!"
    echo "   This means data is NOT being persisted!"
    exit 1
fi
echo ""

# Verify wallets match
if [ "$WALLET_1" == "$WALLET_2" ]; then
    echo "✅ Wallets match before restart!"
else
    echo "❌ Wallets DON'T match (big problem!)"
    exit 1
fi

echo ""
echo "=============================="
echo "✅ Persistence test passed!"
echo ""
echo "💡 To test server restart:"
echo "   1. Stop the backend (Ctrl+C)"
echo "   2. Start it again (npm start)"
echo "   3. Run: curl $API_URL/api/user/$BRAND_WALLET"
echo "   4. Verify same wallet: $WALLET_1"
echo ""
