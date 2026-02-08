@echo off
echo ================================
echo Coin Insights - Service Diagnostics
echo ================================
echo.

echo [1/5] Checking Data Files...
echo.
if exist "data\watchlist.json" (
    echo ✅ watchlist.json exists
) else (
    echo ❌ watchlist.json MISSING
)

if exist "data\discovered_onchain.json" (
    echo ✅ discovered_onchain.json exists
) else (
    echo ❌ discovered_onchain.json MISSING - CoinGecko poller may not be running
)

if exist "data\discovered_dexscreener.json" (
    echo ✅ discovered_dexscreener.json exists
) else (
    echo ❌ discovered_dexscreener.json MISSING
)

if exist "data\new_binance_listings.json" (
    echo ✅ new_binance_listings.json exists
) else (
    echo ❌ new_binance_listings.json MISSING - Binance listings detector may not be running
)

echo.
echo [2/5] Testing REST API (port 3003)...
curl -s http://localhost:3003/api/watchlist >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ REST API is responding
) else (
    echo ❌ REST API NOT responding - Node gateway may not be running
)

echo.
echo [3/5] Testing WebSocket (port 3001)...
echo    Check your Node Gateway terminal for "✅ UI WebSocket server"

echo.
echo [4/5] Testing Python Backend (port 3002)...
curl -s http://localhost:3002/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Python backend is responding
) else (
    echo ❌ Python backend NOT responding - May not be running
)

echo.
echo [5/5] Checking Frontend (port 5173)...
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend is serving
) else (
    echo ❌ Frontend NOT serving - May not be running
)

echo.
echo ================================
echo Recommendations:
echo ================================
echo.
echo If services are missing:
echo   1. Close all terminals
echo   2. Run: start-all.bat
echo   3. Wait 2-3 minutes for all services to start
echo.
echo If data files are missing:
echo   - CoinGecko onchain: Wait 60 seconds after starting pollers
echo   - DexScreener: Wait 20 seconds after starting pollers
echo   - Binance listings: Wait 5 minutes after starting detector
echo.
echo If no alerts appearing:
echo   - Wait 5-10 minutes for data accumulation
echo   - Check Python backend terminal for "📊 Received X ticks"
echo   - Check for "🔥 EXPLOSIVE" or "⚡ HOT" messages
echo.
echo Open browser console (F12) and check for:
echo   - "✅ WebSocket connected to Node gateway"
echo   - "🚨 Received alerts:" when alerts trigger
echo.
pause
