# Coin Insights - Full Stack Integration Guide

This guide explains how to run the complete crypto tracker application with real-time streaming and analytics.

## Architecture Overview

The application consists of three main components:

1. **React Frontend** (Vite) - UI for searching, tracking, and displaying crypto data
2. **Node Gateway** (WebSocket server) - Connects Binance stream to frontend and Python backend
3. **Python Analytics** (FastAPI) - Processes price data and generates volatility alerts

## Setup Instructions

### 1. Install Frontend Dependencies
```bash
npm install
```

### 2. Setup Node Gateway
```bash
cd node-gateway
npm install
```

### 3. Setup Python Analytics
```bash
cd python-signal
pip install -r requirements.txt
```

### 4. Configure Firebase Authentication
- Update `src/firebase.js` with your Firebase config
- Ensure Web API Key is used (not restricted key)

## Running the Application

You need to run three processes simultaneously:

### Terminal 1: React Frontend
```bash
npm run dev
# Default: http://localhost:5173
```

### Terminal 2: Node Gateway
```bash
cd node-gateway
node server.js
# WebSocket server on ws://localhost:3001
```

### Terminal 3: Python Analytics
```bash
cd python-signal
uvicorn main:app --host 0.0.0.0 --port 3002
# WebSocket on ws://localhost:3002/ws
```

## Features

### Real-Time Price Updates
- Live prices from Binance stream for 200+ cryptocurrencies
- WebSocket connection updates coin table instantly
- Fallback to CoinGecko API data if WebSocket unavailable

### Volatility Alerts
- Python backend analyzes 5-minute rolling windows
- Alerts triggered for:
  - 🔥 HOT: 1.5%+ volatility
  - 💥 EXPLOSIVE: 3.0%+ volatility
- Alert feed displayed on Home page

### Authentication
- Google Sign In via Firebase
- Email/Password authentication
- Custom display name selection
- Persistent auth state across sessions
- Conditional UI (Sign Up button hidden when logged in)

### Coin Search & Details
- Search from 250+ cryptocurrencies
- Real-time price charts (Chart.js)
- Market data from CoinGecko
- 24h change, market cap, volume

## Data Flow

```
Binance Stream → Node Gateway → React Frontend (live prices)
                      ↓
                Python Analytics → Volatility Alerts → React Frontend
```

## Port Configuration

- Frontend: 5173 (Vite default)
- Node Gateway: 3001 (WebSocket)
- Python Backend: 3002 (FastAPI + WebSocket)
- Binance: wss://stream.binance.com:9443

## Troubleshooting

### WebSocket Connection Failed
- Ensure Node gateway is running on port 3001
- Check browser console for connection errors
- Verify no firewall blocking WebSocket connections

### No Live Prices Showing
- Confirm Binance stream is connected (check Node gateway console)
- Verify symbol mapping (CoinGecko symbol vs Binance symbol)
- Frontend will fallback to CoinGecko API prices

### No Alerts Appearing
- Python backend needs ~5 minutes of data before generating alerts
- Check Python console for WebSocket connection status
- Ensure volatility thresholds are appropriate for current market

### Authentication Errors
- Verify Firebase config in `src/firebase.js`
- Check Firebase Console for authentication errors
- Ensure correct API key (Web API Key, not restricted)

## Future Enhancements

- [ ] Add more alert types (volume spikes, price breakouts)
- [ ] Historical alert log with timestamps
- [ ] User-configurable alert thresholds
- [ ] Portfolio tracking with alerts for owned coins
- [ ] Mobile-responsive design improvements
- [ ] Redis cache for price history
- [ ] Database persistence for user preferences
