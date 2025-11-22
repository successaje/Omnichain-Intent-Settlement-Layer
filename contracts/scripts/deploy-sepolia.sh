#!/bin/bash

# Deploy to Sepolia testnet
# Make sure PRIVATE_KEY is set in .env

set -e

echo "🚀 Deploying to Sepolia Testnet..."
echo ""

cd "$(dirname "$0")/.."

# Check if PRIVATE_KEY is set
if ! grep -q "^PRIVATE_KEY=" .env 2>/dev/null; then
  echo "❌ ERROR: PRIVATE_KEY not found in .env file"
  echo "Please add your private key to contracts/.env:"
  echo "PRIVATE_KEY=your_private_key_here"
  exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📡 Deploying Omnichain Intent Settlement Layer to Sepolia"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npx hardhat run scripts/deploy.ts --network sepolia

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deployment complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "1. Check deployments/sepolia.json for contract addresses"
echo "2. Verify contracts: npx hardhat verify --network sepolia <ADDRESS> <ARGS>"
echo "3. Deploy to other testnets: ./scripts/deploy-all-testnets.sh"

