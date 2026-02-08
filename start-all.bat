@echo off
echo ================================
echo Starting Full Coin Insights Stack
echo With Discovery System
echo ================================
echo.

REM Set CoinGecko API key for all child processes
set COINGECKO_API_KEY=CG-dGjsqM8SUfwusmz3fyf74kTc
set COINGECKO_DEMO_KEY=CG-dGjsqM8SUfwusmz3fyf74kTc

echo [1/4] Starting Node Gateway (port 3001)...
start "Node Gateway" cmd /k "cd node-gateway && node server.js"
timeout /t 2 >nul

echo [2/4] Starting Python Analytics (port 3002)...
start "Python Analytics" cmd /k "cd python-signal && call .venv\Scripts\activate.bat && uvicorn main:app --host 0.0.0.0 --port 3002"
timeout /t 2 >nul

echo [3/5] Starting Discovery Pollers...
start "Discovery Pollers" cmd /k "set COINGECKO_API_KEY=CG-dGjsqM8SUfwusmz3fyf74kTc && set COINGECKO_DEMO_KEY=CG-dGjsqM8SUfwusmz3fyf74kTc && node discovery/pollers.js"
timeout /t 1 >nul

echo [4/5] Starting Coinbase Listings Detector...
start "Coinbase Listings" cmd /k "node discovery/coinbase-listings.js"
timeout /t 1 >nul

REM echo [4/5] Starting Binance Listings Detector...
REM start "Binance Listings" cmd /k "node discovery/binance-listings.js"
REM timeout /t 1 >nul
REM NOTE: Binance disabled due to regional blocking (HTTP 451)

echo [5/5] Starting React Frontend (port 5173)...
start "React Frontend" cmd /k "npm run dev"

echo.
echo ================================
echo All services started!
echo ================================
echo Node Gateway:        ws://localhost:3001 (Coinbase Advanced Trade)
echo REST API:            http://localhost:3003
echo Python Analytics:    http://localhost:3002
echo React Frontend:      http://localhost:5173
echo Discovery Pollers:   Running (CoinGecko + DexScreener)
echo Coinbase Listings:   Running (checking every 5 minutes)
echo Market Data:         Coinbase Advanced Trade (250 products)
echo.
echo Five terminal windows have been opened.
echo Close this window when ready.
echo ================================
pause
