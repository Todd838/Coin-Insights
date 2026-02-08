# 🚀 Quick Start Guide - Discovery System

## Start Everything (One Command)

```bash
start-all.bat
```

This opens 5 terminals:
1. **Node Gateway** - Binance WS stream + REST API
2. **Python Analytics** - Volatility engine
3. **Discovery Pollers** - CoinGecko + DexScreener
4. **Binance Listings** - New coin detector
5. **React Frontend** - Your UI

Then go to: **http://localhost:5173**

---

## Manual Start (If Needed)

```bash
# Terminal 1
cd node-gateway && node server.js

# Terminal 2
cd python-signal && uvicorn main:app --host 0.0.0.0 --port 3002

# Terminal 3
node discovery/pollers.js

# Terminal 4
node discovery/binance-listings.js

# Terminal 5
npm run dev
```

---

## Frontend Pages

| Page | URL | What You See |
|------|-----|-------------|
| Home | http://localhost:5173 | Live prices + alerts feed |
| Discovered | http://localhost:5173/discovered | New tokens from onchain + DEX |
| New Listings | http://localhost:5173/binance-listings | New Binance USDT pairs |

---

## REST API (http://localhost:3003)

```bash
# Get all discovered tokens (merged)
curl http://localhost:3003/api/discovered/all

# Get onchain only
curl http://localhost:3003/api/discovered/onchain

# Get DEX pairs only
curl http://localhost:3003/api/discovered/dex

# Get new Binance listings
curl http://localhost:3003/api/listings/binance

# Get current watchlist
curl http://localhost:3003/api/watchlist

# Add to watchlist (enables alerts)
curl -X POST http://localhost:3003/api/watchlist/add \
  -H "Content-Type: application/json" \
  -d '{"symbol":"BTCUSDT"}'
```

---

## Data Files Location

```
c:\Users\thisb\Crypto\data\
├── discovered_onchain.json       # CoinGecko tokens
├── discovered_dexscreener.json   # DEX pairs
├── new_binance_listings.json     # New Binance listings
└── watchlist.json                # Your tracked symbols (alerts enabled)
```

---

## Key Features

### ✅ Real-Time Price Updates
- Binance WebSocket streams live prices
- Updates coin table instantly
- No API rate limits

### ✅ Volatility Alerts
- Python analyzes 5-minute rolling windows
- Triggers on 0.8%+ (EXPLOSIVE) or 0.3%+ (HOT) volatility
- Shows in "Live Alerts" feed on Home page

### ✅ Token Discovery
- **CoinGecko Onchain**: Recently active tokens (all chains)
- **DexScreener**: New DEX pairs + promoted tokens
- Poll intervals: 60s (onchain), 20s (DEX)

### ✅ New Listings Detection
- Polls Binance every 5 minutes
- Detects new USDT pairs
- Optional auto-add to watchlist

### ✅ Promotion to Watchlist
- Click "Add to Watchlist" button
- Symbol immediately tracked via Binance WS
- Volatility alerts start within minutes

---

## Configuration Quick Reference

### Enable Auto-Promotion for Binance Listings

Edit `discovery/binance-listings.js`:
```javascript
AUTO_ADD_TO_WATCHLIST: true  // Was false
```

### Adjust Discovery Filters

Edit `discovery/pollers.js`:
```javascript
MIN_LIQ_USD: 50_000,     // Was 5,000 (higher = less noise)
MIN_VOL24H_USD: 20_000,  // Was 2,000 (higher = more active)
```

### Lower Alert Thresholds (Testing)

Already lowered in `python-signal/main.py`:
```python
if vol5m >= 0.8:  # EXPLOSIVE
if vol5m >= 0.3:  # HOT
```

---

## Troubleshooting Quick Fixes

### No discovered tokens showing
```bash
# Restart pollers
node discovery/pollers.js
```

### Alerts not appearing
```bash
# Check all services running
# Wait 5-10 minutes for data accumulation
# Lower thresholds in python-signal/main.py
```

### WebSocket connection failed
```bash
# Restart Node gateway
cd node-gateway && node server.js
```

### "Add to Watchlist" button not working
```bash
# Restart Node gateway (includes REST API)
cd node-gateway && node server.js
```

---

## Testing Checklist

1. ✅ Open http://localhost:5173
2. ✅ See live prices updating in coin table
3. ✅ Navigate to `/discovered` - see tokens
4. ✅ Navigate to `/binance-listings` - see listings
5. ✅ Click "Add to Watchlist" - confirms success
6. ✅ Wait 5-10 minutes - see alerts in feed
7. ✅ Check browser console - no errors

---

## What Each Service Does

| Service | Port | Purpose |
|---------|------|---------|
| Node Gateway | 3001 (WS) | Binance stream to frontend |
| REST API | 3003 (HTTP) | Discovery data endpoints |
| Python Analytics | 3002 (WS) | Volatility calculations |
| Discovery Pollers | - | Finds new tokens |
| Binance Listings | - | Detects new Binance pairs |
| React Frontend | 5173 | Your UI |

---

## Expected Console Output

**Node Gateway:**
```
✅ UI WebSocket server on ws://localhost:3001
✅ REST API server on http://localhost:3003
✅ Connected to Python signal engine
✅ Connected to Binance stream
```

**Discovery Pollers:**
```
✅ Discovery pollers starting...
[Onchain] fetched=50 new=3 saved=156
[Dex] fetched=150 new=12 saved=423
```

**Binance Listings:**
```
✅ Binance listings detector starting...
[Binance Listings] total=1847 new=0 tracked=37
```

**Python Analytics:**
```
✅ Node gateway connected to Python analytics
📊 Received 247 ticks from Node gateway
🔥 EXPLOSIVE: BTCUSDT - 0.95% volatility
📤 Sending 1 alerts to frontend
```

---

## Success Criteria

✅ All 5 services start without errors  
✅ Browser shows live prices updating  
✅ `/discovered` page shows tokens  
✅ `/binance-listings` page shows listings  
✅ "Add to Watchlist" button works  
✅ Alerts appear in feed after 5-10 min  
✅ No console errors in browser or terminals  

---

**You're ready!** Open http://localhost:5173 and explore. 🎉
