# Troubleshooting Guide

## Common Issues and Solutions

### Backend Connection Errors

#### Error: `ERR_CONNECTION_REFUSED` or `Failed to fetch`

**Symptoms:**
- Frontend cannot connect to backend API
- Error: "Cannot connect to backend at http://localhost:3001"

**Solution:**

1. **Check if backend is running:**
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Verify backend is on correct port:**
   - Backend defaults to port `3001`
   - Check console output: `Backend running on http://localhost:3001`

3. **Check environment variables:**
   - Frontend: `NEXT_PUBLIC_API_URL` or `NEXT_PUBLIC_BACKEND_URL`
   - Backend: `PORT` (defaults to 3001)

4. **Verify CORS is configured:**
   - Backend should allow requests from `http://localhost:3000`
   - Check `backend/src/main.ts` for CORS configuration

5. **Test backend directly:**
   ```bash
   curl http://localhost:3001/api/filecoin/pin/json \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
   ```

---

### Filecoin Integration Issues

#### Error: "Synapse SDK not initialized"

**Symptoms:**
- Filecoin operations return mock CIDs
- Warning: "FILECOIN_PRIVATE_KEY not set"

**Solution:**

1. **Set environment variable:**
   ```env
   # backend/.env
   FILECOIN_PRIVATE_KEY=0x...your_private_key
   FILECOIN_RPC_URL=https://api.calibration.node.glif.io/rpc/v1
   ```

2. **Install SDK package:**
   ```bash
   cd backend
   npm install @filoz/synapse-sdk
   ```

3. **Restart backend:**
   ```bash
   npm run start:dev
   ```

---

### Frontend Build Errors

#### Error: "Module not found" or "Cannot resolve module"

**Solution:**

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   npm run build
   ```

---

### Database Connection Issues

#### Error: "SQLite database locked" or "Cannot connect to database"

**Solution:**

1. **Check database file permissions:**
   ```bash
   ls -la backend/data/database.sqlite
   ```

2. **Delete and recreate database:**
   ```bash
   rm backend/data/database.sqlite
   # Restart backend - it will recreate the database
   ```

3. **Check if database directory exists:**
   ```bash
   mkdir -p backend/data
   ```

---

### Port Already in Use

#### Error: "Port 3000/3001 is already in use"

**Solution:**

1. **Find process using port:**
   ```bash
   # macOS/Linux
   lsof -i :3001
   # or
   lsof -i :3000
   ```

2. **Kill the process:**
   ```bash
   kill -9 <PID>
   ```

3. **Or use different ports:**
   ```env
   # backend/.env
   PORT=3002
   
   # frontend/.env.local
   NEXT_PUBLIC_API_URL=http://localhost:3002
   ```

---

### LayerZero/Chainlink Contract Errors

#### Error: "Contract not deployed" or "Invalid contract address"

**Solution:**

1. **Deploy contracts:**
   ```bash
   cd contracts
   npm run deploy:sepolia
   ```

2. **Update backend environment:**
   ```env
   # backend/.env
   INTENT_MANAGER_ADDRESS=0x...
   EXECUTION_PROXY_ADDRESS=0x...
   ```

3. **Verify contract addresses in deployment file:**
   ```bash
   cat contracts/deployments/sepolia.json
   ```

---

### Environment Variable Issues

#### Error: "Environment variable not found"

**Solution:**

1. **Check .env file exists:**
   ```bash
   # Backend
   ls backend/.env
   
   # Frontend
   ls frontend/.env.local
   ```

2. **Verify variable names:**
   - Backend: `FILECOIN_PRIVATE_KEY`, `PORT`, etc.
   - Frontend: `NEXT_PUBLIC_API_URL` (must start with `NEXT_PUBLIC_`)

3. **Restart services after changing .env:**
   - Backend: Restart NestJS server
   - Frontend: Restart Next.js dev server

---

## Quick Health Check

Run these commands to verify everything is set up:

```bash
# 1. Check backend is running
curl http://localhost:3001/health || echo "Backend not running"

# 2. Check frontend is running
curl http://localhost:3000 || echo "Frontend not running"

# 3. Check Filecoin endpoint
curl -X POST http://localhost:3001/api/filecoin/pin/json \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}' || echo "Filecoin endpoint not working"

# 4. Check database exists
ls backend/data/database.sqlite || echo "Database not found"
```

---

## Getting Help

If you're still experiencing issues:

1. **Check logs:**
   - Backend: Console output from `npm run start:dev`
   - Frontend: Browser console and terminal output

2. **Verify versions:**
   ```bash
   node --version
   npm --version
   ```

3. **Check documentation:**
   - [FILECOIN_API_SETUP.md](./FILECOIN_API_SETUP.md)
   - [LAYERZERO_ROUTES.md](./LAYERZERO_ROUTES.md)
   - [CHAINLINK_ROUTES.md](./CHAINLINK_ROUTES.md)

4. **Common fixes:**
   - Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
   - Clear all caches: `.next`, `dist`, `node_modules/.cache`
   - Restart all services


