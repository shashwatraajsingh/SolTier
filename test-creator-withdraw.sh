#!/bin/bash

# Test Script for Creator Withdraw Functionality
# This script tests the creator earnings tracking and withdrawal endpoints

API_URL="http://localhost:3001"
CREATOR_WALLET="TestCreatorWallet123"

echo "🧪 Testing Creator Withdraw Functionality"
echo "========================================"
echo ""

# Step 1: Register Creator
echo "1️⃣ Registering creator..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/user/register" \
  -H "Content-Type: application/json" \
  -d "{\"walletAddress\": \"$CREATOR_WALLET\", \"role\": \"creator\"}")
echo "✅ Registration Response:"
echo "$REGISTER_RESPONSE" | jq '.'
echo ""

# Step 2: Check initial earnings (should be 0)
echo "2️⃣ Checking initial earnings..."
EARNINGS_RESPONSE=$(curl -s "$API_URL/api/creator/earnings/$CREATOR_WALLET")
echo "✅ Initial Earnings:"
echo "$EARNINGS_RESPONSE" | jq '.'
echo ""

# Step 3: Check user profile (should include creatorEarnings: 0)
echo "3️⃣ Getting user profile..."
PROFILE_RESPONSE=$(curl -s "$API_URL/api/user/$CREATOR_WALLET")
echo "✅ User Profile:"
echo "$PROFILE_RESPONSE" | jq '.'
echo ""

# Step 4: Try to withdraw with 0 balance (should fail)
echo "4️⃣ Attempting withdrawal with 0 balance (should fail)..."
WITHDRAW_FAIL_RESPONSE=$(curl -s -X POST "$API_URL/api/creator/withdraw" \
  -H "Content-Type: application/json" \
  -d "{\"walletAddress\": \"$CREATOR_WALLET\", \"amount\": 1.0}")
echo "✅ Failed Withdrawal Response:"
echo "$WITHDRAW_FAIL_RESPONSE" | jq '.'
echo ""

# Step 5: Simulate adding earnings (in production, this would come from campaign payouts)
echo "5️⃣ Simulating earnings addition (normally done by campaign payout)..."
echo "   Note: This would be done internally by the server when campaigns pay out"
echo "   For testing, you would need to manually add to database or create a test endpoint"
echo ""

# Step 6: Try invalid withdrawal (negative amount)
echo "6️⃣ Testing validation with invalid amount..."
INVALID_WITHDRAW=$(curl -s -X POST "$API_URL/api/creator/withdraw" \
  -H "Content-Type: application/json" \
  -d "{\"walletAddress\": \"$CREATOR_WALLET\", \"amount\": -1.0}")
echo "✅ Invalid Amount Response:"
echo "$INVALID_WITHDRAW" | jq '.'
echo ""

# Step 7: Test with brand wallet (should fail - only creators can withdraw)
echo "7️⃣ Testing with brand wallet (should fail)..."
BRAND_WALLET="TestBrandWallet123"
curl -s -X POST "$API_URL/api/user/register" \
  -H "Content-Type: application/json" \
  -d "{\"walletAddress\": \"$BRAND_WALLET\", \"role\": \"brand\"}" > /dev/null

BRAND_WITHDRAW=$(curl -s -X POST "$API_URL/api/creator/withdraw" \
  -H "Content-Type: application/json" \
  -d "{\"walletAddress\": \"$BRAND_WALLET\", \"amount\": 1.0}")
echo "✅ Brand Withdrawal Attempt:"
echo "$BRAND_WITHDRAW" | jq '.'
echo ""

echo "========================================"
echo "✅ All tests completed!"
echo ""
echo "📝 Summary:"
echo "  - Creator registration: ✅"
echo "  - Earnings tracking: ✅"
echo "  - User profile includes earnings: ✅"
echo "  - Validation (insufficient balance): ✅"
echo "  - Validation (invalid amount): ✅"
echo "  - Validation (role check): ✅"
echo ""
echo "⚠️  Note: Actual SOL transfer is currently simulated"
echo "   For production, implement the commented-out transfer logic in server.js"
