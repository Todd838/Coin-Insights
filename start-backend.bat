@echo off
echo ================================
echo Starting Coin Insights Backend
echo ================================
echo.

echo [1/2] Starting Node Gateway (port 3001)...
start "Node Gateway" cmd /k "cd node-gateway && node server.js"
timeout /t 2 >nul

echo [2/2] Starting Python Analytics (port 3002)...
start "Python Analytics" cmd /k "cd python-signal && uvicorn main:app --host 0.0.0.0 --port 3002"
timeout /t 2 >nul

echo.
echo ================================
echo Backend services started!
echo ================================
echo Node Gateway:     ws://localhost:3001
echo Python Analytics: http://localhost:3002
echo.
echo Press any key to exit (services will keep running)...
pause >nul
