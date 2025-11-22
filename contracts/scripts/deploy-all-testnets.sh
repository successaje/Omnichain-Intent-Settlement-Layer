#!/bin/bash

# Deploy to all testnets
# Make sure you have .env configured with RPC URLs and PRIVATE_KEY

set -e

echo "🚀 Deploying Omnichain Intent Settlement Layer to all testnets..."
echo ""

NETWORKS=(
  "sepolia"
  "arbitrumSepolia"
  "optimismSepolia"
  "baseSepolia"
)

for network in "${NETWORKS[@]}"; do
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📡 Deploying to $network..."
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  npx hardhat run scripts/deploy.ts --network "$network" || {
    echo "❌ Failed to deploy to $network"
    continue
  }
  
  echo "✅ Successfully deployed to $network"
  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Multi-chain deployment complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "1. Run: npx hardhat run scripts/setup-cross-chain.ts"
echo "2. Verify contracts on block explorers"
echo "3. Test cross-chain functionality"

