#!/bin/bash

# Manual verification script for Sepolia contracts
# Run these commands individually if automated verification fails

NETWORK="sepolia"
ETHERSCAN_API_KEY="${ETHERSCAN_API_KEY:-GMEVNFUEFWI9ZT1KGJD8Q7ABQSJ3YDTMAK}"

echo "Verifying contracts on Sepolia..."
echo "Using Etherscan API Key: ${ETHERSCAN_API_KEY:0:10}..."
echo ""

# MockERC20
echo "1. Verifying MockERC20..."
npx hardhat verify --network $NETWORK \
  --constructor-args scripts/verify-args/mockERC20.js \
  0xA6b5682Bb10ED3E59b834102639B80FDf7b449AD || echo "Failed"

# AgentRegistry  
echo "2. Verifying AgentRegistry..."
npx hardhat verify --network $NETWORK \
  --constructor-args scripts/verify-args/agentRegistry.js \
  0xe56124b9F8FF7c38Ce922149be22Efe227A7b5B0 || echo "Failed"

# PaymentEscrow
echo "3. Verifying PaymentEscrow..."
npx hardhat verify --network $NETWORK \
  --constructor-args scripts/verify-args/paymentEscrow.js \
  0x78f4EF05bbb3104583c440eA60a77608358463e0 || echo "Failed"

# IntentManager
echo "4. Verifying IntentManager..."
npx hardhat verify --network $NETWORK \
  --constructor-args scripts/verify-args/intentManager.js \
  0xCBe713F7Bca59b2AEb473981195bb119596DFBbA || echo "Failed"

# ExecutionProxy
echo "5. Verifying ExecutionProxy..."
npx hardhat verify --network $NETWORK \
  --constructor-args scripts/verify-args/executionProxy.js \
  0x8cD5f0B422062DF481664CD462eA56D01DF15E69 || echo "Failed"

# ChainlinkOracleAdapter
echo "6. Verifying ChainlinkOracleAdapter..."
npx hardhat verify --network $NETWORK \
  --constructor-args scripts/verify-args/oracleAdapter.js \
  0xdF42386772C73DdcA678067CE9b84bCCE7AfB273 || echo "Failed"

echo ""
echo "Verification complete!"
echo ""
echo "View contracts on Etherscan:"
echo "IntentManager: https://sepolia.etherscan.io/address/0xCBe713F7Bca59b2AEb473981195bb119596DFBbA"
echo "AgentRegistry: https://sepolia.etherscan.io/address/0xe56124b9F8FF7c38Ce922149be22Efe227A7b5B0"

