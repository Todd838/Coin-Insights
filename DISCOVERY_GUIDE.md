# 🔍 Discovery System - Complete Guide

## Overview

The discovery system finds new tradable tokens across multiple sources:

1. **CoinGecko Onchain** - Recently updated tokens across all chains
2. **DexScreener** - New DEX pairs and promoted tokens
3. **Binance Listings** - New USDT pairs on Binance

## Architecture

```
Discovery Pollers → data/*.json → REST API → React Frontend
                                      ↓
                               Promotion Logic
                                      ↓
                               watchlist.json → Node Gateway → Binance WS → Volatility Alerts
```

## Setup

### 1. Dependencies Already Installed

The Node gateway and frontend dependencies are already installed. Discovery pollers use built-in Node 24 `fetch`.

### 2. File Structure

```
Crypto/
├── discovery/
│   ├── pollers.js              # CoinGecko + DexScreener
│   └── binance-listings.js      # Binance new listings
├── data/
│   ├── watchlist.json           # Your tracked symbols (alerts)
│   ├── discovered_onchain.json  # CoinGecko onchain tokens
│   ├── discovered_dexscreener.json  # DEX pairs
│   └── new_binance_listings.json    # Binance new listings
├── node-gateway/
│   └── server.js                # Now includes REST API (port 3003)
└── src/pages/
    ├── Discovered/              # Discovery UI
    └── BinanceListings/         # Listings UI
```

## Running the System

### Option 1: All-in-One (Recommended)

```bash
start-all.bat
```

This starts:
- Node Gateway (WS port 3001, REST port 3003)
- Python Analytics (port 3002)
- Discovery Pollers
- Binance Listings Detector
- React Frontend (port 5173)

### Option 2: Manual Start

```bash
# Terminal 1: Node Gateway
cd node-gateway
node server.js

# Terminal 2: Python Analytics
cd python-signal
uvicorn main:app --host 0.0.0.0 --port 3002

# Terminal 3: Discovery Pollers
node discovery/pollers.js

# Terminal 4: Binance Listings
node discovery/binance-listings.js

# Terminal 5: Frontend
npm run dev
```

## REST API Endpoints

The Node gateway now serves REST API on **http://localhost:3003**:

### Discovery Endpoints

```
GET /api/discovered/onchain
  → Returns CoinGecko onchain tokens

GET /api/discovered/dex
  → Returns DexScreener pairs

GET /api/discovered/all
  → Returns merged list (onchain + dex)

GET /api/listings/binance
  → Returns new Binance USDT pairs

GET /api/watchlist
  → Returns current watchlist symbols

POST /api/watchlist/add
  Body: { "symbol": "BTCUSDT" }
  → Adds symbol to watchlist (enables alerts)
```

## Frontend Pages

### 1. Home (`/`)
- Live coin table with real-time prices
- Volatility alerts feed
- Search functionality

### 2. Discovered (`/discovered`)
- Tabs: All / Onchain / DEX
- Chain filter dropdown
- Search by symbol/name/address
- "Add to Watchlist" button for each token

### 3. New Listings (`/binance-listings`)
- Table of recently detected Binance USDT pairs
- "Add to Watchlist" button
- Auto-promotion logic (configurable)

## Configuration

### Discovery Pollers (`discovery/pollers.js`)

```javascript
const CONFIG = {
  COINGECKO_DEMO_KEY: process.env.COINGECKO_DEMO_KEY || "",
  ONCHAIN_POLL_MS: 60_000,      // 60s
  DEX_POLL_MS: 20_000,          // 20s
  MIN_LIQ_USD: 5_000,           // Minimum liquidity filter
  MIN_VOL24H_USD: 2_000,        // Minimum volume filter
};
```

### Binance Listings (`discovery/binance-listings.js`)

```javascript
const CONFIG = {
  POLL_MS: 5 * 60 * 1000,       // 5 minutes
  AUTO_ADD_TO_WATCHLIST: false, // Set true for auto-promotion
};
```

## Data Flows

### Discovery → Alerts Flow

```
1. Poller finds new token
   ↓
2. Saved to data/*.json
   ↓
3. Shown in frontend "Discovered" page
   ↓
4. User clicks "Add to Watchlist" (or auto-promotion if enabled)
   ↓
5. Added to data/watchlist.json
   ↓
6. Node gateway watches symbol via Binance WS
   ↓
7. Python backend analyzes volatility
   ↓
8. Alerts appear in frontend "Live Alerts"
```

### Binance Listings → Alerts (Fast Path)

```
1. binance-listings.js detects new USDT pair
   ↓
2. If AUTO_ADD_TO_WATCHLIST = true:
   → Instantly added to watchlist.json
   → Alerts start within seconds
```

## Promotion Logic

### Manual Promotion
1. Go to `/discovered` or `/binance-listings`
2. Click "Add to Watchlist" button
3. Symbol added to `data/watchlist.json`
4. Binance WS stream picks it up automatically
5. Volatility alerts start immediately

### Auto-Promotion (Binance Only)
In `discovery/binance-listings.js`, set:
```javascript
AUTO_ADD_TO_WATCHLIST: true
```

Now all new Binance listings are automatically tracked with alerts.

## Monitoring

### Console Output

**Discovery Pollers:**
```
[Onchain] fetched=50 new=3 saved=156
[Dex] fetched=150 new=12 saved=423
```

**Binance Listings:**
```
🆕 New Binance listing: NEWCOINUSDT
[Binance Listings] total=1847 new=1 tracked=37
```

**Node Gateway:**
```
✅ UI WebSocket server on ws://localhost:3001
✅ REST API server on http://localhost:3003
✅ Connected to Python signal engine
✅ Connected to Binance stream
```

### File Sizes

- `discovered_onchain.json`: ~2000 items max (~2MB)
- `discovered_dexscreener.json`: ~3000 items max (~4MB)
- `new_binance_listings.json`: ~500 items max (~100KB)
- `watchlist.json`: Your symbols (~5KB)

## Troubleshooting

### No Discovered Tokens Showing

**Check:**
1. Discovery pollers are running
2. Files exist in `data/` folder
3. REST API is responding: `curl http://localhost:3003/api/discovered/all`
4. Check browser console for errors

**Fix:**
```bash
# Restart pollers
node discovery/pollers.js
node discovery/binance-listings.js
```

### "Add to Watchlist" Not Working

**Check:**
1. Node gateway REST API is running (port 3003)
2. CORS headers are set (already done)
3. `data/watchlist.json` exists and is writable
4. Browser console for network errors

**Fix:**
```bash
# Restart Node gateway
cd node-gateway
node server.js
```

### CoinGecko Rate Limiting

**Symptom:** CoinGecko onchain returns 429 errors

**Fix:**
1. Get a CoinGecko Demo API key (free)
2. Set environment variable:
   ```powershell
   $env:COINGECKO_DEMO_KEY="YOUR_KEY_HERE"
   node discovery/pollers.js
   ```

### Alerts Not Appearing for Promoted Coins

**Check:**
1. Symbol format is correct (`BTCUSDT`, not `BTC` or `btc`)
2. Symbol is on Binance (check `/binance-listings`)
3. Binance WS is connected (check Node gateway console)
4. Python backend is receiving ticks
5. Wait 5-10 minutes for data accumulation

## Performance & Limits

### Free Tier Limits

| Service | Rate Limit | Notes |
|---------|------------|-------|
| CoinGecko Onchain | ~30 calls/min | Use demo key for more |
| DexScreener | No published limit | Be respectful (~3 calls/min) |
| Binance REST | 1200/min | Only 1 call every 5 min for listings |
| Binance WS | No limit | Real-time stream |

### Resource Usage

- **CPU**: ~5% idle, ~10% during polls
- **Memory**: ~150MB total (Node + pollers)
- **Network**: ~10KB/s during active polling
- **Disk**: ~10MB total for all data files

## Advanced Features

### Custom Filters

Edit `discovery/pollers.js`:

```javascript
// Only track high-liquidity tokens
MIN_LIQ_USD: 50_000,  // Was 5,000

// Only track active tokens
MIN_VOL24H_USD: 20_000,  // Was 2,000
```

### Chain-Specific Discovery

Edit `discovery/pollers.js` to add network filter:

```javascript
// Only Ethereum mainnet
if (networkId !== 'eth' && networkId !== 'ethereum') continue;

// Only Solana
if (chainId !== 'solana') continue;
```

### Auto-Promotion Rules

Edit `discovery/binance-listings.js` to add custom logic:

```javascript
// Only promote coins with specific baseAsset patterns
if (sym.baseAsset.endsWith('UP') || sym.baseAsset.endsWith('DOWN')) {
  continue; // Skip leverage tokens
}

// Only promote if market cap > threshold (would need enrichment)
```

## Next Steps

1. ✅ **System is Running** - All 5 terminals open
2. ✅ **Data is Flowing** - Check console logs
3. ✅ **Frontend is Ready** - Open http://localhost:5173
4. **Manual Testing** - Click around `/discovered` and `/binance-listings`
5. **Wait for Alerts** - Give it 5-10 minutes
6. **Fine-Tune Filters** - Adjust thresholds based on your needs
7. **Enable Auto-Promotion** - Set `AUTO_ADD_TO_WATCHLIST: true` if desired

## Support

Check these in order:
1. Console output in all 5 terminals
2. Browser DevTools console (F12)
3. Data files in `data/` folder
4. REST API responses: http://localhost:3003/api/discovered/all
5. Review INTEGRATION_GUIDE.md and VALIDATION_CHECKLIST.md

---

**Status:** ✅ Discovery System Complete & Integrated  
**Date:** February 8, 2026
