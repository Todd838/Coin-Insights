# Coin Insights 🚀

A modern, full-stack cryptocurrency tracker with **real-time price updates**, **volatility alerts**, **token discovery system**, and **Firebase authentication**.

## 🌟 Features

### Core Trading Features
- 🔍 **Search & Track** 250+ cryptocurrencies from CoinGecko
- 📊 **Live Price Updates** via Binance WebSocket stream
- ⚡ **Volatility Alerts** from Python analytics engine (0.3%+ triggers)
- 🎯 **Watchlist System** with instant alert activation

### Discovery System (NEW!)
- 🔥 **Token Discovery** - Find new tokens across multiple sources:
  - CoinGecko Onchain (all chains)
  - DexScreener (new DEX pairs)
  - Binance new listings detector
- 🚀 **Promotion Logic** - One-click to add discovered tokens to watchlist
- 📈 **Auto-Tracking** - Optional auto-promotion for new Binance listings

### Authentication & UI
- 🔐 **Authentication** with Google Sign In and Email/Password
- 📈 **Interactive Charts** with Chart.js
- 🎨 **Dynamic UI** with time-based background gradients
- 💱 **Multi-Currency Support** (USD, EUR, INR)

## Tech Stack

- **Frontend**: React + Vite
- **Backend Gateway**: Node.js + WebSocket (ws) + HTTP REST API
- **Analytics Engine**: Python + FastAPI + WebSocket
- **Discovery System**: Node.js pollers (CoinGecko, DexScreener, Binance)
- **Authentication**: Firebase Auth
- **Data Sources**: CoinGecko API, Binance WebSocket Stream, DexScreener API
- **Charts**: react-google-charts
- **Storage**: JSON files (data persistence)

## Quick Start

### 1. Install Dependencies

```bash
# Frontend
npm install

# Node Gateway (already installed)
cd node-gateway
npm install
cd ..

# Python Analytics
cd python-signal
pip install -r requirements.txt
cd ..
```

### 2. Configure Firebase

Update `src/firebase.js` with your Firebase project credentials.

### 3. Run Everything at Once

```bash
start-all.bat
```

This starts 5 services:
1. Node Gateway (WS port 3001, REST port 3003)
2. Python Analytics (port 3002)
3. Discovery Pollers (CoinGecko + DexScreener)
4. Binance Listings Detector
5. React Frontend (port 5173)

### 4. Open the App

Navigate to **http://localhost:5173**

## Pages

- **Home** (`/`) - Live coin prices + volatility alerts feed
- **Discovered** (`/discovered`) - New tokens from all discovery sources
- **New Listings** (`/binance-listings`) - Recently detected Binance USDT pairs
- **Coin Details** (`/coin/:id`) - Individual coin charts and data

## Architecture

```
Binance Stream → Node Gateway (WS + REST) → React Frontend (live prices)
                      ↓
                Python Analytics (volatility) → Alerts → React Frontend

CoinGecko Onchain → Node Poller → data/*.json → REST API → React Discovery Page
DexScreener APIs → Node Poller → data/*.json → REST API → React Discovery Page
Binance REST API → Node Poller → data/*.json → REST API → React Listings Page

User clicks "Add to Watchlist" → watchlist.json → Binance WS tracking → Alerts
```

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── NavBar/         # Navigation with auth state + new pages
│   │   ├── Footer/         # Footer component
│   │   └── LineChart/      # Chart component
│   ├── pages/
│   │   ├── Home/           # Main dashboard with live prices + alerts
│   │   ├── Coin/           # Individual coin details
│   │   ├── Discovered/     # Token discovery UI (NEW!)
│   │   ├── BinanceListings/# New Binance listings UI (NEW!)
│   │   └── SignUp/         # Authentication pages
│   ├── context/
│   │   └── CoinContext.jsx # Global state management
│   ├── firebase.js         # Firebase configuration
│   └── App.jsx             # Main app component + routing
├── discovery/              # Discovery system (NEW!)
│   ├── pollers.js          # CoinGecko + DexScreener pollers
│   └── binance-listings.js # Binance new listings detector
├── data/                   # Data persistence (NEW!)
│   ├── watchlist.json      # Tracked symbols (alerts enabled)
│   ├── discovered_onchain.json
│   ├── discovered_dexscreener.json
│   └── new_binance_listings.json
├── node-gateway/
│   └── server.js           # WebSocket gateway + REST API
├── python-signal/
│   ├── main.py             # FastAPI analytics service
│   └── requirements.txt
├── public/                 # Static assets
├── QUICK_START.md          # Quick reference guide (NEW!)
├── DISCOVERY_GUIDE.md      # Complete discovery documentation (NEW!)
└── start-all.bat           # One-click startup (updated)
```

## Documentation

- **[QUICK_START.md](QUICK_START.md)** - Fast reference for commands and endpoints
- **[DISCOVERY_GUIDE.md](DISCOVERY_GUIDE.md)** - Complete discovery system documentation
- **[INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)** - Detailed setup and architecture
- **[VALIDATION_CHECKLIST.md](VALIDATION_CHECKLIST.md)** - Testing steps and troubleshooting

## Discovery System Features

### 1. Multi-Source Token Discovery
- **CoinGecko Onchain**: Recently active tokens across all chains (ETH, Base, Solana, etc.)
- **DexScreener**: New DEX pairs, promoted tokens, trending launches
- **Binance Listings**: Auto-detect new USDT spot pairs on Binance

### 2. Promotion to Watchlist
Click "Add to Watchlist" on any discovered token to:
- Add symbol to `data/watchlist.json`
- Enable Binance WebSocket tracking (if available)
- Start volatility alerts within minutes

### 3. Auto-Promotion (Optional)
Enable in `discovery/binance-listings.js`:
```javascript
AUTO_ADD_TO_WATCHLIST: true
```
Now all new Binance listings are automatically tracked with alerts.

### 4. Filtering & Search
- Chain filter (Ethereum, Solana, Base, etc.)
- Minimum liquidity/volume thresholds
- Search by symbol, name, or contract address

## REST API

Node gateway now serves REST API on **http://localhost:3003**:

```bash
GET  /api/discovered/onchain      # CoinGecko tokens
GET  /api/discovered/dex          # DexScreener pairs
GET  /api/discovered/all          # Merged list
GET  /api/listings/binance        # New Binance listings
GET  /api/watchlist               # Current watchlist
POST /api/watchlist/add           # Add symbol to watchlist
     Body: { "symbol": "BTCUSDT" }
```

## License

MIT
