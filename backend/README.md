# Backend API - Omnichain Intent Settlement Layer

NestJS-based backend API providing intent management, agent orchestration, and integration with Chainlink, LayerZero, and Filecoin.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [API Endpoints](#api-endpoints)
- [Modules](#modules)
- [Configuration](#configuration)
- [Development](#development)
- [Testing](#testing)

## 🌟 Overview

The backend provides a RESTful API for:
- **Intent Management** - Create, track, and manage user intents
- **Agent Orchestration** - Coordinate AI agent competition and selection
- **Chainlink Integration** - Price feeds, CCIP, and CRE workflows
- **LayerZero Integration** - Cross-chain message tracking
- **Filecoin Integration** - Metadata and proof storage

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         NestJS Application              │
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────┐ │
│  │ Intents  │  │  Agents  │  │Filecoin││
│  │  Module  │  │  Module  │  │ Module ││
│  └────┬─────┘  └────┬─────┘  └───┬────┘│
│       │             │             │     │
│  ┌────▼─────────────▼─────────────▼──┐ │
│  │     Chainlink Module              │ │
│  │     LayerZero Module              │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │      Llama Service                 │ │
│  │      (AI Agent Reasoning)          │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Ollama with Llama 3.2 (for AI agents)
- SQLite (included) or PostgreSQL (optional)

### Installation

```bash
cd backend
npm install
```

### Environment Setup

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Filecoin Configuration
FILECOIN_PRIVATE_KEY=0x...your_private_key_here
FILECOIN_RPC_URL=https://api.calibration.node.glif.io/rpc/v1

# Llama API Configuration
LLAMA_API_URL=http://localhost:11434

# Chainlink Configuration (optional)
CHAINLINK_API_KEY=your_api_key
CHAINLINK_NETWORK=sepolia

# LayerZero Configuration (optional)
LAYERZERO_ENDPOINT_ID_SEPOLIA=40161
LAYERZERO_ENDPOINT_ID_BASE_SEPOLIA=40245

# Database (SQLite by default)
DATABASE_PATH=./data/database.sqlite
```

### Running the Server

```bash
# Development mode (with hot reload)
npm run start:dev

# Production build
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

The server will start on `http://localhost:3001` by default.

## 📡 API Endpoints

### Intent Management

#### Create Intent
```http
POST /api/intents
Content-Type: application/json

{
  "intentSpec": "Get me 5% yield on stablecoins",
  "amount": "1000",
  "tokenAddress": "0x...",
  "deadline": "2024-12-31T23:59:59Z"
}
```

#### Get All Intents
```http
GET /api/intents
GET /api/intents?userAddress=0x...
```

#### Get Intent by ID
```http
GET /api/intents/:id
```

### Agent Management

#### Generate Agent Proposal
```http
POST /api/agents/proposals
Content-Type: application/json

{
  "intentId": "intent-123",
  "intentSpec": "Get me 5% yield on stablecoins",
  "agentId": "agent-1"
}
```

#### Get Agent Proposals
```http
GET /api/agents/:intentId/proposals
```

### Filecoin Integration

#### Pin JSON to Filecoin
```http
POST /api/filecoin/pin/json
Content-Type: application/json

{
  "data": { "key": "value" }
}
```

#### Pin File to Filecoin
```http
POST /api/filecoin/pin/file
Content-Type: multipart/form-data

file: [binary]
```

#### Get Data by CID
```http
GET /api/filecoin/cat/:cid
```

#### Verify CID
```http
GET /api/filecoin/verify/:cid
```

#### Check Service Status
```http
GET /api/filecoin/status
```

### Chainlink Integration

#### Get Price Feed
```http
GET /api/chainlink/price/:pair
GET /api/chainlink/price/ETH/USD
```

#### Get Account Info
```http
GET /api/chainlink/account/:address
```

### LayerZero Integration

#### Get Cross-Chain Quote
```http
POST /api/layerzero/quote
Content-Type: application/json

{
  "dstEid": 40245,
  "payload": "0x...",
  "options": "0x..."
}
```

## 🧩 Modules

### Intents Module

Manages intent lifecycle and storage.

**Service**: `IntentsService`
- `create()` - Create new intent
- `findAll()` - Get all intents
- `findOne()` - Get intent by ID
- `update()` - Update intent status

**Controller**: `IntentsController`
- `POST /api/intents` - Create intent
- `GET /api/intents` - List intents
- `GET /api/intents/:id` - Get intent

### Agents Module

Orchestrates AI agent competition and proposal generation.

**Service**: `AgentsService`
- `generateProposal()` - Generate agent proposal
- `generateProposalsForAuction()` - Generate multiple proposals
- `evaluateProposal()` - Evaluate proposal quality
- `selectWinner()` - Select winning agent

**Controller**: `AgentsController`
- `POST /api/agents/proposals` - Generate proposal
- `GET /api/agents/:intentId/proposals` - Get proposals
- `POST /api/agents/auction/:intentId/proposals` - Start auction

### Filecoin Module

Handles decentralized storage via Synapse SDK.

**Service**: `FilecoinService`
- `pinJson()` - Store JSON data
- `pinFile()` - Store file/blob
- `getByCid()` - Retrieve data by CID
- `verifyCid()` - Verify CID exists
- `ensureFundedAndApproved()` - Setup wallet funding

**Controller**: `FilecoinController`
- `POST /api/filecoin/pin/json` - Pin JSON
- `POST /api/filecoin/pin/file` - Pin file
- `GET /api/filecoin/cat/:cid` - Get data
- `GET /api/filecoin/verify/:cid` - Verify CID
- `GET /api/filecoin/status` - Service status

### Chainlink Module

Integrates with Chainlink services.

**Service**: `ChainlinkService`
- `getPriceFeed()` - Get price feed data
- `getAccountInfo()` - Get account information
- `validatePrice()` - Validate price data

### LayerZero Module

Manages cross-chain messaging.

**Service**: `LayerzeroService`
- `quote()` - Get cross-chain quote
- `sendMessage()` - Send cross-chain message
- `trackMessage()` - Track message status

### Llama Module

Integrates with local Ollama API for AI reasoning.

**Service**: `LlamaService`
- `generateStrategy()` - Generate execution strategy
- `parseIntent()` - Parse user intent
- `evaluateRoute()` - Evaluate execution route

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `FILECOIN_PRIVATE_KEY` | Filecoin wallet private key | - |
| `FILECOIN_RPC_URL` | Filecoin RPC endpoint | Calibration testnet |
| `LLAMA_API_URL` | Ollama API URL | `http://localhost:11434` |

### Database

By default, the backend uses SQLite stored in `backend/data/database.sqlite`.

To use PostgreSQL:
```env
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=ois_layer
```

## 🛠️ Development

### Project Structure

```
backend/
├── src/
│   ├── modules/          # Feature modules
│   │   ├── intents/      # Intent management
│   │   ├── agents/       # Agent orchestration
│   │   ├── filecoin/     # Filecoin integration
│   │   ├── chainlink/    # Chainlink integration
│   │   ├── layerzero/    # LayerZero integration
│   │   └── llama/        # Llama AI integration
│   ├── common/           # Shared utilities
│   │   ├── filters/      # Exception filters
│   │   ├── guards/       # Auth guards
│   │   └── interceptors/ # Interceptors
│   ├── config/           # Configuration
│   ├── app.module.ts     # Root module
│   └── main.ts           # Entry point
├── data/                 # Database files
├── dist/                 # Compiled output
└── package.json
```

### Code Generation

```bash
# Generate a new module
nest generate module modules/feature-name
nest generate service modules/feature-name
nest generate controller modules/feature-name
```

### Linting

```bash
npm run lint
npm run lint:fix
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## 📚 API Documentation

### Request/Response Examples

See individual route documentation:
- [Chainlink Routes](../CHAINLINK_ROUTES.md)
- [LayerZero Routes](../LAYERZERO_ROUTES.md)
- [Filecoin Routes](../FILECOIN_ROUTES.md)

## 🔧 Troubleshooting

### Backend won't start

1. Check if port 3001 is available:
```bash
lsof -ti:3001
```

2. Verify environment variables:
```bash
cat .env
```

3. Check database path exists:
```bash
mkdir -p data
```

### Filecoin service not initializing

1. Verify `FILECOIN_PRIVATE_KEY` is set
2. Check private key format (should start with `0x`)
3. Ensure RPC URL is accessible
4. Check logs for ESM/CommonJS errors (known issue)

### Llama API connection errors

1. Verify Ollama is running:
```bash
curl http://localhost:11434/api/tags
```

2. Check `LLAMA_API_URL` in `.env`
3. Ensure Llama 3.2 model is installed

## 📝 Notes

- The backend uses **CommonJS** (NestJS default), which may cause issues with ESM-only packages like `@filoz/synapse-sdk`
- Filecoin integration currently uses mock CIDs in development mode
- For production, ensure all environment variables are properly configured

## 🔗 Related Documentation

- [Main README](../README.md)
- [Contracts README](../contracts/README.md)
- [Troubleshooting Guide](../TROUBLESHOOTING.md)

