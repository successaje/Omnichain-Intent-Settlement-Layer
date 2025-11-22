#!/bin/bash

# CLI-based verification script for Sepolia contracts
# This uses hardhat verify command directly

NETWORK="sepolia"

echo "============================================================"
echo "Verifying contracts on SEPOLIA using CLI"
echo "============================================================"
echo ""

cd "$(dirname "$0")/.."

# MockERC20
echo "1. Verifying MockERC20..."
npx hardhat verify --network $NETWORK \
  0xc7024823429a8224d32e076e637413CC4eF4E26B \
  "Reputation Token" "REP" || echo "  Failed or already verified"
echo ""

# AgentRegistry
echo "2. Verifying AgentRegistry..."
npx hardhat verify --network $NETWORK \
  0x3500C12Fbc16CB9beC23362b7524306ccac5018B \
  0xc7024823429a8224d32e076e637413CC4eF4E26B \
  1000000000000000000 \
  0x60eF148485C2a5119fa52CA13c52E9fd98F28e87 \
  11155111 || echo "  Failed or already verified"
echo ""

# PaymentEscrow
echo "3. Verifying PaymentEscrow..."
npx hardhat verify --network $NETWORK \
  0x6b27B5864cEF6DC12159cD1DC5b335d6abcFC1a5 \
  0x60eF148485C2a5119fa52CA13c52E9fd98F28e87 || echo "  Failed or already verified"
echo ""

# IntentManager
echo "4. Verifying IntentManager..."
npx hardhat verify --network $NETWORK \
  0xd0fC2c0271d8215EcB7Eeb0bdaFf8B1bef7c04A3 \
  0x6EDCE65403992e310A62460808c4b910D972f10f \
  0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59 \
  0x60eF148485C2a5119fa52CA13c52E9fd98F28e87 \
  11155111 || echo "  Failed or already verified"
echo ""

# ExecutionProxy
echo "5. Verifying ExecutionProxy..."
npx hardhat verify --network $NETWORK \
  0xcA834417fb31B46Db5544e0ddF000b3a822aD9dA \
  0x6EDCE65403992e310A62460808c4b910D972f10f \
  0x60eF148485C2a5119fa52CA13c52E9fd98F28e87 \
  0xd0fC2c0271d8215EcB7Eeb0bdaFf8B1bef7c04A3 \
  0x6b27B5864cEF6DC12159cD1DC5b335d6abcFC1a5 || echo "  Failed or already verified"
echo ""

# ChainlinkOracleAdapter
echo "6. Verifying ChainlinkOracleAdapter..."
npx hardhat verify --network $NETWORK \
  0x857a55F93d14a348003356A373D2fCc926b18A7E \
  0x60eF148485C2a5119fa52CA13c52E9fd98F28e87 || echo "  Failed or already verified"
echo ""

echo "============================================================"
echo "Verification complete!"
echo "============================================================"
echo ""
echo "View contracts on Etherscan:"
echo "IntentManager: https://sepolia.etherscan.io/address/0xd0fC2c0271d8215EcB7Eeb0bdaFf8B1bef7c04A3"
echo "AgentRegistry: https://sepolia.etherscan.io/address/0x3500C12Fbc16CB9beC23362b7524306ccac5018B"
echo "PaymentEscrow: https://sepolia.etherscan.io/address/0x6b27B5864cEF6DC12159cD1DC5b335d6abcFC1a5"
echo "ExecutionProxy: https://sepolia.etherscan.io/address/0xcA834417fb31B46Db5544e0ddF000b3a822aD9dA"
echo "ChainlinkOracleAdapter: https://sepolia.etherscan.io/address/0x857a55F93d14a348003356A373D2fCc926b18A7E"
echo "ReputationToken: https://sepolia.etherscan.io/address/0xc7024823429a8224d32e076e637413CC4eF4E26B"
