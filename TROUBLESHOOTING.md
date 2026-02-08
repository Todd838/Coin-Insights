# 🔧 Troubleshooting Guide - No Data or Alerts

## Quick Diagnosis

Run these commands in order:

```bash
# Test if APIs are reachable
node test-discovery.js

# Check service status
diagnose.bat
```

---

## Problem 1: No Discovered Tokens (DexScreener/Onchain)

### Symptoms
- `/discovered` page shows "No tokens found"
- `data/discovered_onchain.json` missing
- `data/new_binance_listings.json` missing

### Causes & Fixes

#### Cause 1: Services Not Running
**Check:** Are all 5 terminal windows open from `start-all.bat`?

**Fix:**
1. Close ALL terminals
2. Run `start-all.bat` again
3. Wait 2-3 minutes
4. Look for these messages in each terminal:
   - **Terminal 1 (Node Gateway)**: `✅ Connected to Binance stream`
   - **Terminal 2 (Python)**: `INFO: Uvicorn running`
   - **Terminal 3 (Discovery Pollers)**: `[Onchain] Fetching from CoinGecko...`
   - **Terminal 4 (Binance Listings)**: `[Binance Listings] total=...`
   - **Terminal 5 (Frontend)**: `VITE ... ready`

#### Cause 2: CoinGecko Rate Limited
**Check:** Discovery Pollers terminal shows "429" or "rate limited"

**Fix Option A - Get Free API Key:**
1. Go to https://www.coingecko.com/en/api
2. Sign up for free demo key
3. In PowerShell:
   ```powershell
   $env:COINGECKO_DEMO_KEY="your-key-here"
   ```
4. Restart pollers terminal

**Fix Option B - Just Use DexScreener:**
- DexScreener works without API key
- You'll still see discovered tokens (just no CoinGecko onchain data)
- Check `/discovered` page and switch to "DEX Pairs" tab

#### Cause 3: Just Need to Wait
**Check:** How long have services been running?

**Wait times:**
- **DexScreener**: 20-30 seconds
- **CoinGecko**: 60-90 seconds  
- **Binance Listings**: 5-10 minutes (polls every 5 min)

**What to do:** Just wait! Check Discovery Pollers terminal for:
```
[Dex] fetched=150 new=12 saved=423
[Onchain] fetched=50 new=3 saved=156
```

---

## Problem 2: No Volatility Alerts

### Symptoms
- "Live Alerts" section on Home page is empty
- No alerts even after 10+ minutes

### Causes & Fixes

#### Cause 1: Python Backend Not Connected
**Check:** Node Gateway terminal should show:
```
✅ Connected to Python signal engine
```

**Fix:** If you see "⚠️ Python connection closed":
1. Check Python terminal is running
2. Look for: `INFO: Uvicorn running on http://0.0.0.0:3002`
3. If not running, restart: 
   ```bash
   cd python-signal
   uvicorn main:app --host 0.0.0.0 --port 3002
   ```

#### Cause 2: No Data Accumulated Yet
**Check:** Python terminal should show:
```
📊 Received 247 ticks from Node gateway
```

**Wait:** Alerts need 5-10 minutes of price data before triggering.

**What you should see:**
- First 5 minutes: `📊 Received X ticks` (data accumulating)
- After 5+ minutes: `🔥 EXPLOSIVE: BTCUSDT - 0.95% volatility`
- Then: `📤 Sending 1 alerts to frontend`

#### Cause 3: Market Too Calm (No Volatility)
**Check:** Is crypto market volatile right now?

**Test with lower thresholds:**
Already lowered to 0.3% HOT / 0.8% EXPLOSIVE in `python-signal/main.py`

**Test even lower (for testing only):**
Edit `python-signal/main.py`:
```python
if vol5m >= 0.15:  # Was 0.8 (test mode - very sensitive!)
    alerts.append({"symbol": symbol, "level": "EXPLOSIVE", "vol5m": round(vol5m, 3)})
if vol5m >= 0.05:  # Was 0.3 (test mode - very sensitive!)
    alerts.append({"symbol": symbol, "level": "HOT", "vol5m": round(vol5m, 3)})
```
Then restart Python backend.

#### Cause 4: Browser Not Connected
**Check:** Open browser console (F12), look for:
```
✅ WebSocket connected to Node gateway
```

**Fix:** If you see connection errors:
1. Refresh the page
2. Check Node Gateway terminal is running
3. Make sure port 3001 is not blocked

---

## Problem 3: Alerts Appearing But Not Displaying

### Check Browser Console
Open DevTools (F12) → Console tab

**Look for:**
```javascript
✅ WebSocket connected to Node gateway
🚨 Received alerts: [{symbol: "BTCUSDT", ...}]
```

**If you see alerts in console but not on page:**
- Try refreshing page
- Check Home.jsx is rendering the alert feed
- Look for DOM element with className="alert-feed"

---

## Verification Checklist

Run through this list:

### Services Running (All 5)
- [ ] Node Gateway (Terminal 1) - `✅ Connected to Binance stream`
- [ ] Python Backend (Terminal 2) - `INFO: Uvicorn running`
- [ ] Discovery Pollers (Terminal 3) - `[Dex] fetched=...`
- [ ] Binance Listings (Terminal 4) - `[Binance Listings] total=...`
- [ ] React Frontend (Terminal 5) - `ready in XXX ms`

### Data Files Exist
- [ ] `data/watchlist.json`
- [ ] `data/discovered_dexscreener.json` (wait 30s)
- [ ] `data/discovered_onchain.json` (wait 90s, may fail if rate limited)
- [ ] `data/new_binance_listings.json` (wait 5-10 min)

### Browser Checks
- [ ] Open http://localhost:5173
- [ ] Console shows: `✅ WebSocket connected`
- [ ] No red errors in console
- [ ] Can navigate to `/discovered` page

### Discovery Working
- [ ] Go to http://localhost:5173/discovered
- [ ] See tokens in "DEX Pairs" tab (should work)
- [ ] See tokens in "Onchain" tab (may fail if CoinGecko rate limited)
- [ ] Can filter and search

### Alerts Working (Wait 5-10 Minutes)
- [ ] Python terminal shows: `📊 Received X ticks`
- [ ] Python terminal shows: `🔥 EXPLOSIVE` or `⚡ HOT` (when market moves)
- [ ] Node terminal shows: `📢 Forwarding X alerts`
- [ ] Browser console shows: `🚨 Received alerts`
- [ ] Alerts appear in "Live Alerts" section on Home page

---

## Still Not Working?

### Last Resort Steps

**1. Complete Fresh Start:**
```bash
# Close ALL terminals
# Then:
start-all.bat
```

**2. Check Ports in Use:**
```bash
netstat -an | findstr "3001 3002 3003 5173"
```
Should show all 4 ports in LISTENING state.

**3. Reduce Alert Thresholds to MINIMUM (Testing):**
Edit `python-signal/main.py`:
```python
if vol5m >= 0.01:  # SUPER SENSITIVE - just for testing
    alerts.append({"symbol": symbol, "level": "TEST", "vol5m": round(vol5m, 3)})
```

**4. Manual Test Discovery API:**
```bash
curl http://localhost:3003/api/discovered/dex
```
Should return JSON with discovered tokens.

**5. Check Firewall:**
- Make sure Windows Firewall isn't blocking Node.js or Python
- Allow Node.js and Python through firewall

---

## Expected Timeline

| Time | What You Should See |
|------|---------------------|
| 0:00 | Run `start-all.bat` |
| 0:30 | All 5 terminals open and starting |
| 1:00 | DexScreener data appears |
| 1:30 | CoinGecko data appears (or rate limit error) |
| 2:00 | Live prices updating on Home page |
| 5:00 | First Binance listings check completes |
| 5-10:00 | **First alerts appear** (if market is volatile) |
| 10:00+ | Regular alerts as volatility occurs |

---

**Remember:** Alerts only trigger when the market is actually volatile. If crypto prices are stable, you won't see many alerts even with low thresholds!
