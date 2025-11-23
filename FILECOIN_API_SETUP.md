# Filecoin API Setup Guide

This guide explains how to get and configure Filecoin storage for the Omnichain Intent Settlement Layer project.

## Overview

The project uses the **@filoz/synapse-sdk** npm package for Filecoin Onchain Cloud storage. This is a TypeScript SDK that interacts directly with Filecoin smart contracts - **no API key needed, only a private key and RPC URL**.

---

## Option 1: Filecoin Synapse SDK (Onchain Cloud) - Recommended ✅

The project uses the **@filoz/synapse-sdk** npm package - a TypeScript SDK that only requires a **private key** and **RPC URL**.

### Getting Started with Synapse SDK

1. **Install the Package** (already in package.json)
   ```bash
   cd backend
   npm install @filoz/synapse-sdk ethers
   ```

2. **Get a Private Key**
   - Use an existing wallet private key
   - Or create a new wallet specifically for Filecoin storage
   - **Important**: This wallet needs USDFC tokens for storage payments

3. **Choose RPC URL**
   - **Testnet (Calibration)**: `RPC_URLS.calibration.http` (default)
   - **Mainnet**: `RPC_URLS.mainnet.http`
   - **Custom**: Any Filecoin RPC endpoint URL

### Configuration

Add to your `backend/.env` file:

```env
# Filecoin Synapse SDK Configuration
FILECOIN_PRIVATE_KEY=0x...your_private_key_here
FILECOIN_RPC_URL=https://api.calibration.node.glif.io/rpc/v1  # Calibration testnet (default)
```

**That's it!** No API key needed - the SDK uses your private key to interact with Filecoin smart contracts directly.

### First-Time Setup: Fund Wallet

Before uploading data, you need to:
1. **Fund your wallet with USDFC tokens** (Filecoin's payment token)
2. **Approve the Warm Storage operator**

The SDK provides a helper method for this:

```typescript
// In FilecoinService, call ensureFundedAndApproved() before first upload
await filecoinService.ensureFundedAndApproved();
```

Or manually:
```typescript
const depositAmount = ethers.parseUnits("2.5", 18); // 2.5 USDFC covers 1TiB for 30 days
const tx = await synapse.payments.depositWithPermitAndApproveOperator(
  depositAmount,
  synapse.getWarmStorageAddress(),
  ethers.MaxUint256,
  ethers.MaxUint256,
  1, // epochs
);
await tx.wait();
```

---

## Option 2: Estuary API (Alternative)

[Estuary](https://estuary.tech/) is an open-source project that simplifies storing data on Filecoin.

### Getting Started with Estuary

1. **Visit Estuary**
   - Website: https://estuary.tech/
   - API Docs: https://docs.estuary.tech/

2. **Get API Key**
   - Sign up at https://estuary.tech/
   - Create an API key from your dashboard
   - Use the Estuary API endpoint

### Configuration

```env
# Estuary API Configuration
FILECOIN_SYNAPSE_URL=https://api.estuary.tech
FILECOIN_API_KEY=your_estuary_api_key
```

**Note**: You may need to adjust the API endpoints in `FilecoinService` to match Estuary's API structure:
- Estuary uses `/content/add` instead of `/api/v1/pin/file`
- Estuary uses `/content/get/{cid}` instead of `/api/v1/cat/{cid}`

---

## Option 3: Infura Filecoin API

[Infura](https://www.infura.io/) offers a managed Filecoin API service.

### Getting Started with Infura

1. **Sign Up on Infura**
   - Visit https://www.infura.io/
   - Create an account
   - Request Filecoin API access

2. **Get API Credentials**
   - Create a new project in Infura dashboard
   - Select Filecoin network
   - Copy your API key and endpoint URL

### Configuration

```env
# Infura Filecoin API Configuration
FILECOIN_SYNAPSE_URL=https://filecoin.infura.io/v3/YOUR_PROJECT_ID
FILECOIN_API_KEY=your_infura_api_key
```

**Note**: Infura's Filecoin API may have different endpoints. You may need to modify `FilecoinService` to match Infura's API structure.

---

## Option 4: Local Development (Mock/Emulator)

For local development and testing, you can use a mock service or local Filecoin node.

### Option 4a: Mock Service (Default)

The service already includes fallback mock CIDs for development. No setup required - just use:

```env
# Local Development (Mock)
FILECOIN_SYNAPSE_URL=http://localhost:8080
# FILECOIN_API_KEY is optional for local dev
```

The service will return mock CIDs if the endpoint is unavailable.

### Option 4b: Local Filecoin Node

1. **Install Lotus** (Filecoin reference implementation)
   - Follow: https://lotus.filecoin.io/
   - Start a local Lotus node
   - Enable API access

2. **Configuration**

```env
# Local Lotus Node
FILECOIN_SYNAPSE_URL=http://localhost:1234/rpc/v0  # Lotus API endpoint
# FILECOIN_API_KEY not required for local node
```

**Note**: Lotus API structure differs from Synapse SDK. You'll need to create an adapter or modify `FilecoinService`.

### Option 4c: IPFS Node with Filecoin Integration

1. **Run IPFS Node**
   ```bash
   ipfs daemon
   ```

2. **Use IPFS HTTP API**
   ```env
   FILECOIN_SYNAPSE_URL=http://localhost:5001
   ```

**Note**: IPFS API differs from Synapse SDK. Requires adapter modifications.

---

## Option 5: Web3.Storage (Simple Alternative)

[Web3.Storage](https://web3.storage/) provides a simple API for storing data on IPFS and Filecoin.

### Getting Started with Web3.Storage

1. **Sign Up**
   - Visit https://web3.storage/
   - Create an account
   - Get your API token

2. **Configuration**

You'll need to modify `FilecoinService` to use Web3.Storage's API:

```typescript
// Example Web3.Storage integration
const response = await fetch('https://api.web3.storage/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
});
```

---

## Current Implementation

The `FilecoinService` uses the **@filoz/synapse-sdk** package with these methods:

- `synapse.storage.upload(data)` - Upload data (returns `pieceCid`)
- `synapse.storage.download(pieceCid)` - Download data by PieceCID
- `synapse.payments.depositWithPermitAndApproveOperator()` - Fund and approve storage

### SDK Methods Used

```typescript
// From filecoin.service.ts
const { pieceCid, size } = await synapse.storage.upload(dataBytes);  // Upload
const bytes = await synapse.storage.download(pieceCid);                // Download
await synapse.payments.depositWithPermitAndApproveOperator(...);      // Fund
```

---

## Quick Setup Steps

### 1. Install Dependencies

```bash
cd backend
npm install @filoz/synapse-sdk ethers
```

### 2. Get Private Key

- Use an existing wallet private key
- Or create a new wallet for Filecoin operations
- **Important**: Wallet needs USDFC tokens for storage payments

### 3. Configure Environment

Add to `backend/.env`:

```env
FILECOIN_PRIVATE_KEY=0x...your_private_key
FILECOIN_RPC_URL=https://api.calibration.node.glif.io/rpc/v1  # Optional, defaults to Calibration
```

### 4. Fund Wallet (First Time Only)

Before first upload, fund your wallet with USDFC and approve the storage operator.

### 4. Test the Integration

```bash
# Start backend
cd backend
npm run start:dev

# Test Filecoin endpoint
curl -X POST http://localhost:3001/api/filecoin/pin/json \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

---

## Troubleshooting

### "Error pinning to Filecoin"

**Possible Causes:**
1. Missing or invalid private key
2. Wallet not funded with USDFC
3. Storage operator not approved
4. Network connectivity issues
5. Insufficient USDFC balance

**Solutions:**
- Verify `FILECOIN_PRIVATE_KEY` is set correctly
- Check wallet has USDFC tokens (for Calibration testnet, get testnet USDFC)
- Call `ensureFundedAndApproved()` before first upload
- Verify RPC URL is accessible
- Check service logs for detailed error messages

### "Synapse SDK not initialized"

**Solution:**
- Ensure `FILECOIN_PRIVATE_KEY` is set in environment variables
- Check private key format (should start with `0x`)
- Verify RPC URL is correct and accessible
- Check network connectivity

### "Mock CIDs being returned"

**This is normal for:**
- Local development without a Filecoin service
- When the API endpoint is unavailable
- When testing without API credentials

Mock CIDs are in format: `mock-cid-{timestamp}-{random}`

---

## Recommended Setup by Use Case

| Use Case | Network | RPC URL | Setup Difficulty |
|----------|---------|--------|------------------|
| **Testing** | Calibration Testnet | `RPC_URLS.calibration.http` | Easy |
| **Production** | Filecoin Mainnet | `RPC_URLS.mainnet.http` | Easy |
| **Local Development** | Mock (no private key) | N/A | None |

**Note**: All use cases use the same `@filoz/synapse-sdk` package - just change the RPC URL and network!

---

## Additional Resources

- [Filecoin Onchain Cloud Docs](https://docs.filecoin.cloud/)
- [Synapse SDK GitHub](https://github.com/FilOzone/synapse-sdk)
- [Synapse SDK NPM](https://www.npmjs.com/package/@filoz/synapse-sdk)
- [Filecoin Calibration Testnet](https://docs.filecoin.io/networks/calibration/)
- [Filecoin Mainnet](https://docs.filecoin.io/networks/mainnet/)

---

## Next Steps

1. Choose your Filecoin API provider
2. Sign up and get API credentials
3. Configure environment variables
4. Test the integration
5. Deploy to production

For questions or issues, check the [FILECOIN_ROUTES.md](./FILECOIN_ROUTES.md) documentation.

