#!/bin/bash

# SolTier Backend Test Script
# This script tests all the major API endpoints

API_URL="http://localhost:3001"

echo "🚀 Testing SolTier Backend API"
echo "================================"
echo ""

# Health Check
echo "1️⃣  Health Check:"
curl -s "$API_URL/health" | jq '.'
echo ""
echo ""

# Register a Brand
echo "2️⃣  Register Brand User:"
curl -s -X POST "$API_URL/api/user/register" \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "BrandWallet123456789012345678901234567890",
    "role": "brand"
  }' | jq '.'
echo ""
echo ""

# Register a Creator
echo "3️⃣  Register Creator User:"
curl -s -X POST "$API_URL/api/user/register" \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "CreatorWallet12345678901234567890123456789",
    "role": "creator"
  }' | jq '.'
echo ""
echo ""

# Connect X Account for Creator
echo "4️⃣  Connect X Account:"
curl -s -X POST "$API_URL/api/x/connect" \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "CreatorWallet12345678901234567890123456789",
    "username": "johndoe"
  }' | jq '.'
echo ""
echo ""

# Add Funds to Brand
echo "5️⃣  Add Funds to Brand:"
curl -s -X POST "$API_URL/api/balance/add" \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "BrandWallet123456789012345678901234567890",
    "amount": 10000
  }' | jq '.'
echo ""  
echo ""

# Create Campaign
echo "6️⃣  Create Campaign:"
curl -s -X POST "$API_URL/api/campaign/create" \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "BrandWallet123456789012345678901234567890",
    "cpm": 15,
    "likeWeight": 20,
    "maxBudget": 5000,
    "durationDays": 30,
    "title": "Summer Product Launch",
    "description": "Promote our exciting new summer collection to your audience!"
  }' | jq '.'
echo ""
echo ""

# Get Active Campaigns
echo "7️⃣  Get Active Campaigns:"
curl -s "$API_URL/api/campaigns/active" | jq '.'
echo ""
echo ""

# Get Top Creators
echo "8️⃣  Get Top Creators:"
curl -s "$API_URL/api/creators/top?limit=5" | jq '.'
echo ""
echo ""

# Get Brand's Campaigns
echo "9️⃣  Get Brand's Campaigns:"
curl -s "$API_URL/api/campaigns/brand/BrandWallet123456789012345678901234567890" | jq '.'
echo ""
echo ""

# Get User Profile
echo "🔟 Get User Profile:"
curl -s "$API_URL/api/user/BrandWallet123456789012345678901234567890" | jq '.'
echo ""
echo ""

echo "✅ All tests completed!"
echo ""
echo "Note: Install 'jq' for pretty JSON output:"
echo "  sudo apt-get install jq  (Ubuntu/Debian)"
echo "  brew install jq          (macOS)"
