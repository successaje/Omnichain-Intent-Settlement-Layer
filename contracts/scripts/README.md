# Contract Interaction Scripts

This directory contains scripts to interact with deployed contracts, specifically for Chainlink and LayerZero integrations.

## Available Scripts

### 1. `call-chainlink.ts` - Chainlink OracleAdapter Functions

Calls Chainlink price feed functions on the deployed `ChainlinkOracleAdapter` contract.

**Functions Tested:**
- `getLatestPrice()` - Get latest price from Chainlink feed
- `getValidatedPrice()` - Get validated price (with price > 0 check)
- `comparePrices()` - Compare prices of two tokens

**Usage:**
```bash
# Test on Sepolia
npx hardhat run scripts/call-chainlink.ts --network sepolia

# Test on Base Sepolia
npx hardhat run scripts/call-chainlink.ts --network baseSepolia
```

**Prerequisites:**
- Contracts must be deployed (run `deploy.ts` first)
- Price feeds must be configured (run `setup-price-feeds.ts` first)

**Example Output:**
```
=== Chainlink OracleAdapter Interaction ===

Network: sepolia
OracleAdapter Address: 0x857a55F93d14a348003356A373D2fCc926b18A7E

--- Testing ETH Price Feed ---
Token Address: 0x0000000000000000000000000000000000000000
Feed Address: 0x694AA1769357215DE4FAC081bf1f309aDC325306
✓ Price feed configured: 0x694AA1769357215DE4FAC081bf1f309aDC325306
✓ Staleness threshold: 3600 seconds

1. Calling getLatestPrice()...
   ✓ Price: $3245.67
   ✓ Timestamp: 1700000000 (2023-11-14T12:00:00.000Z)

2. Calling getValidatedPrice()...
   ✓ Validated Price: $3245.67
   ✓ Timestamp: 1700000000 (2023-11-14T12:00:00.000Z)
```

---

### 2. `call-layerzero.ts` - LayerZero IntentManager Functions

Calls LayerZero cross-chain messaging functions on the deployed `IntentManager` contract.

**Functions Tested:**
- `quoteCrossChainFee()` - Quote messaging fee for cross-chain message
- `getIntent()` - Get intent details
- `sendIntentToChain()` - Send intent to another chain (commented out for safety)
- `getIntentCrossChainIds()` - Get cross-chain IDs for an intent
- `getCrossChainIntent()` - Get cross-chain intent data

**Usage:**
```bash
# Quote fee only
npx hardhat run scripts/call-layerzero.ts --network sepolia

# With intent ID
INTENT_ID=1 npx hardhat run scripts/call-layerzero.ts --network sepolia

# With custom destination
DST_EID=40245 INTENT_ID=1 npx hardhat run scripts/call-layerzero.ts --network sepolia
```

**Environment Variables:**
- `INTENT_ID` - Intent ID to use for operations (optional)
- `DST_EID` - Destination endpoint ID (optional, defaults to Base Sepolia: 40245)

**Prerequisites:**
- Contracts must be deployed
- LayerZero peers must be configured (run `setup-peers-*.ts` scripts)
- Intent must exist and be in "Executing" status for `sendIntentToChain()`

**Example Output:**
```
=== LayerZero IntentManager Interaction ===

Network: sepolia
Signer: 0x60eF148485C2a5119fa52CA13c52E9fd98F28e87
Balance: 0.5 ETH

IntentManager Address: 0xd0fC2c0271d8215EcB7Eeb0bdaFf8B1bef7c04A3
Current Endpoint ID (eid): 40161
Destination Endpoint ID (dstEid): 40245

--- Testing quoteCrossChainFee() ---
✓ Fee Quote:
  Native Fee: 0.001 ETH
  LZ Token Fee: 0.0 LZ
  Total Fee: 0.001 ETH
```

---

### 3. `call-execution-proxy.ts` - ExecutionProxy Functions (LayerZero + Chainlink)

Calls functions on the `ExecutionProxy` contract that combines LayerZero cross-chain messaging with Chainlink price validation.

**Functions Tested:**
- `getExpectedAmount()` - Calculate expected swap amount using Chainlink prices
- `initiateSwap()` - Initiate cross-chain swap (commented out for safety)
- `batchExecuteIntent()` - Batch execute multiple intents (commented out for safety)
- Price feed configuration checks

**Usage:**
```bash
# Get expected amount
npx hardhat run scripts/call-execution-proxy.ts --network sepolia

# With custom tokens
SRC_TOKEN=0x... DST_TOKEN=0x... npx hardhat run scripts/call-execution-proxy.ts --network sepolia

# Initiate swap
INTENT_ID=1 npx hardhat run scripts/call-execution-proxy.ts --network sepolia

# Batch execute
INTENT_IDS='1,2,3' npx hardhat run scripts/call-execution-proxy.ts --network sepolia
```

**Environment Variables:**
- `INTENT_ID` - Intent ID for swap operations (optional)
- `INTENT_IDS` - Comma-separated intent IDs for batch execution (optional)
- `SRC_TOKEN` - Source token address (optional, defaults to ETH)
- `DST_TOKEN` - Destination token address (optional, defaults to ETH)
- `DST_EID` - Destination endpoint ID (optional, defaults to Base Sepolia: 40245)

**Prerequisites:**
- Contracts must be deployed
- Price feeds must be configured in ExecutionProxy
- LayerZero peers must be configured

**Example Output:**
```
=== ExecutionProxy Interaction ===

Network: sepolia
ExecutionProxy Address: 0xcA834417fb31B46Db5544e0ddF000b3a822aD9dA

--- Testing getExpectedAmount() (Chainlink) ---
Source Amount: 1.0 tokens
✓ Expected Amount: 0.98 tokens
  (Based on Chainlink price feeds)
```

---

## Safety Notes

⚠️ **Important:** The scripts that send transactions (`sendIntentToChain()`, `initiateSwap()`, `batchExecuteIntent()`) are **commented out by default** to prevent accidental execution. 

To actually execute these functions:
1. Review the code carefully
2. Ensure you have sufficient balance for gas fees
3. Verify the parameters are correct
4. Uncomment the relevant code sections
5. Run the script

---

## Network Configuration

The scripts automatically detect the network from Hardhat config and load the appropriate deployment file from `deployments/` directory.

Supported networks:
- `sepolia` - Ethereum Sepolia testnet
- `baseSepolia` - Base Sepolia testnet
- `arbitrumSepolia` - Arbitrum Sepolia testnet
- `optimismSepolia` - Optimism Sepolia testnet

---

## Troubleshooting

### "Deployment file not found"
- Run `deploy.ts` first to deploy contracts
- Ensure you're using the correct network name

### "Price feed not configured"
- Run `setup-price-feeds.ts` to configure Chainlink price feeds
- Verify the price feed addresses are correct for your network

### "LayerZero peer not configured"
- Run the appropriate `setup-peers-*.ts` script for your network
- Ensure both source and destination chains have peers configured

### "Insufficient balance"
- Ensure your account has enough native tokens (ETH) for gas fees
- Cross-chain messages require additional fees for LayerZero messaging

### "Intent not in Executing status"
- Intent must be created and moved to "Executing" status before sending cross-chain
- Check intent status using `getIntent()` function

---

## Related Scripts

- `deploy.ts` - Deploy all contracts
- `setup-price-feeds.ts` - Configure Chainlink price feeds
- `setup-peers-sepolia.ts` - Configure LayerZero peers for Sepolia
- `setup-peers-base-sepolia.ts` - Configure LayerZero peers for Base Sepolia


