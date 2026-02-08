# 🚨 Quick Fix for Discovery Issues

## What's Happening

Your test revealed **2 API issues**:

### ❌ Issue 1: CoinGecko Requires API Key (Status 401)
- **Problem**: CoinGecko now requires authentication
- **Impact**: No onchain discoveries without API key
- **Solution**: Get free API key (required)

### ❌ Issue 2: Binance Blocked in Your Region (Status 451)
- **Problem**: Binance API returns HTTP 451 (region blocked)
- **Impact**: New listings detector won't work
- **Solution**: Use VPN or disable Binance poller

### ✅ DexScreener Working!
- No issues, no API key needed
- Already generating discoveries
- Check `/discovered` page → "DEX Pairs" tab

---

## 🔧 Fix #1: Get CoinGecko API Key (REQUIRED)

**Step 1 - Sign up for free demo key:**
1. Go to: https://www.coingecko.com/en/api/pricing
2. Click "Try Demo for Free" or "Get Demo API Key"
3. Sign up with email
4. Copy your API key

**Step 2 - Set environment variable:**

In PowerShell (before running pollers):
```powershell
$env:COINGECKO_API_KEY="your-key-here"
```

**Or make it permanent:**
```powershell
[System.Environment]::SetEnvironmentVariable('COINGECKO_API_KEY', 'your-key-here', 'User')
```

**Step 3 - Restart discovery pollers:**
- Close Terminal 3 (Discovery Pollers)
- Run again: `node discovery/pollers.js`
- Look for: `[Onchain] Fetching from CoinGecko...` (without 401 error)

---

## 🔧 Fix #2: Handle Binance Regional Block

### Option A: Use VPN (if you want Binance listings)
1. Connect to VPN (US, Singapore, or Europe work well)
2. Restart Terminal 4: `node discovery/binance-listings.js`
3. Should now see: `[Binance Listings] total=XXX`

### Option B: Disable Binance Poller (Recommended)
**Just use DexScreener** - you don't need Binance listings!

**Edit `start-all.bat`:**

Change this:
```batch
start "Node Gateway" powershell -NoExit -Command "cd '%ROOT%' ; node node-gateway/server.js"
start "Python Signal Engine" powershell -NoExit -Command "cd '%ROOT%/python-signal' ; ..\\.venv\\Scripts\\Activate.ps1 ; uvicorn main:app --host 0.0.0.0 --port 3002"
start "Discovery Pollers" powershell -NoExit -Command "cd '%ROOT%' ; node discovery/pollers.js"
start "Binance Listings" powershell -NoExit -Command "cd '%ROOT%' ; node discovery/binance-listings.js"
start "React Frontend" powershell -NoExit -Command "cd '%ROOT%' ; npm run dev"
```

To this (comment out Binance):
```batch
start "Node Gateway" powershell -NoExit -Command "cd '%ROOT%' ; node node-gateway/server.js"
start "Python Signal Engine" powershell -NoExit -Command "cd '%ROOT%/python-signal' ; ..\\.venv\\Scripts\\Activate.ps1 ; uvicorn main:app --host 0.0.0.0 --port 3002"
start "Discovery Pollers" powershell -NoExit -Command "cd '%ROOT%' ; node discovery/pollers.js"
REM start "Binance Listings" powershell -NoExit -Command "cd '%ROOT%' ; node discovery/binance-listings.js"
start "React Frontend" powershell -NoExit -Command "cd '%ROOT%' ; npm run dev"
```

---

## ⚡ Quick Start (After Fixes)

**1. Set CoinGecko API key:**
```powershell
$env:COINGECKO_API_KEY="your-key-here"
```

**2. Close all terminals**

**3. Run:**
```batch
start-all.bat
```

**4. Wait 2 minutes, then check:**
- Terminal 3 shows: `[Onchain] fetched=X new=Y`
- Terminal 3 shows: `[Dex] fetched=X new=Y`
- Go to http://localhost:5173/discovered
- You should see tokens in both "Onchain" and "DEX Pairs" tabs!

---

## 📋 Verification Checklist

After applying fixes:

### CoinGecko Working
- [ ] API key set: `echo $env:COINGECKO_API_KEY` (should show key)
- [ ] Terminal 3 shows: `[Onchain] fetched=50 new=3`
- [ ] File exists: `data/discovered_onchain.json`
- [ ] No 401 errors in Terminal 3
- [ ] `/discovered` page shows tokens in "Onchain" tab

### DexScreener Working
- [ ] Terminal 3 shows: `[Dex] fetched=150 new=12`
- [ ] File exists: `data/discovered_dexscreener.json`
- [ ] `/discovered` page shows tokens in "DEX Pairs" tab

### Binance (Optional)
- [ ] Either: VPN connected + Terminal 4 running
- [ ] Or: Terminal 4 disabled in start-all.bat
- [ ] No 451 errors anywhere

---

## 🎯 Expected Results

**After 2-3 minutes:**
- `/discovered` page shows **real tokens**
- Filter by chain (Ethereum, BSC, Solana, etc.)
- Search by symbol/name
- Click "Add to Watchlist" to track specific tokens

**After 5-10 minutes:**
- Live price updates on Home page
- **Volatility alerts** start appearing (when market moves)
- Alerts show: 🔥 EXPLOSIVE or ⚡ HOT with % change

---

## 🐛 Still Not Working?

**Check Terminal Logs:**

**Terminal 3 (Discovery Pollers):**
```
✅ Good: [Onchain] fetched=50 new=3
❌ Bad:  [Onchain] error: HTTP 401
```

**Browser Console (F12):**
```
✅ Good: WebSocket connected to Node gateway
❌ Bad:  WebSocket connection failed
```

**Data Files:**
```bash
dir data\*.json
```
Should see:
- `discovered_dexscreener.json` ✅
- `discovered_onchain.json` (after CoinGecko API key set)
- `watchlist.json` ✅

---

## 💡 Pro Tips

1. **Don't worry about Binance** - DexScreener + CoinGecko is plenty!
2. **Free API key is enough** - Demo tier works fine for this app
3. **Alerts take time** - Need 5-10 min of data before triggering
4. **Check console for errors** - F12 in browser shows WebSocket status
5. **Restart if stuck** - Close all terminals, run `start-all.bat` again

---

## 📞 Need Help?

1. Run diagnostics: `node test-discovery.js`
2. Check service health: `diagnose.bat`
3. Read full guide: `TROUBLESHOOTING.md`
4. Check terminal logs for specific errors
