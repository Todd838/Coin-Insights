import { WebSocketServer } from "ws";
import WebSocket from "ws";
import http from "http";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRONTEND_PORT = 3001;     // frontend connects here
const HTTP_PORT = 3003;         // REST API server
const PYTHON_PORT = 3002;       // python service listens here
const COINBASE_URL = "wss://advanced-trade-ws.coinbase.com";
const DATA_DIR = path.join(__dirname, "..", "data"); // ../data from this script's location

// ALL 368 Coinbase Advanced Trade USD pairs (maximum available)
const WATCH = new Set([
  "00-USD", "1INCH-USD", "2Z-USD", "A8-USD", "AAVE-USD", "ABT-USD", "ACH-USD", "ACS-USD",
  "ACX-USD", "ADA-USD", "AERGO-USD", "AERO-USD", "AGLD-USD", "AIOZ-USD", "AKT-USD", "ALCX-USD",
  "ALEO-USD", "ALEPH-USD", "ALGO-USD", "ALICE-USD", "ALLO-USD", "ALT-USD", "AMP-USD", "ANKR-USD",
  "APE-USD", "API3-USD", "APR-USD", "APT-USD", "ARB-USD", "ARKM-USD", "ARPA-USD", "ASM-USD",
  "AST-USD", "ASTER-USD", "ATH-USD", "ATOM-USD", "AUCTION-USD", "AUDIO-USD", "AURORA-USD", "AVAX-USD",
  "AVNT-USD", "AVT-USD", "AWE-USD", "AXL-USD", "AXS-USD", "B3-USD", "BADGER-USD", "BAL-USD",
  "BAND-USD", "BARD-USD", "BAT-USD", "BCH-USD", "BEAM-USD", "BERA-USD", "BICO-USD", "BIGTIME-USD",
  "BIO-USD", "BIRB-USD", "BLAST-USD", "BLUR-USD", "BLZ-USD", "BNB-USD", "BNKR-USD", "BNT-USD",
  "BOBA-USD", "BOBBOB-USD", "BONK-USD", "BREV-USD", "BTC-USD", "BTRST-USD", "C98-USD", "CAKE-USD",
  "CBETH-USD", "CELR-USD", "CFG-USD", "CGLD-USD", "CHZ-USD", "CLANKER-USD", "COMP-USD", "COOKIE-USD",
  "CORECHAIN-USD", "COSMOSDYDX-USD", "COTI-USD", "COW-USD", "CRO-USD", "CRV-USD", "CTSI-USD", "CTX-USD",
  "CVC-USD", "CVX-USD", "DAI-USD", "DASH-USD", "DBR-USD", "DEGEN-USD", "DEXT-USD", "DIA-USD",
  "DIMO-USD", "DNT-USD", "DOGE-USD", "DOGINME-USD", "DOLO-USD", "DOOD-USD", "DOT-USD", "DRIFT-USD",
  "EDGE-USD", "EGLD-USD", "EIGEN-USD", "ELA-USD", "ELSA-USD", "ENA-USD", "ENS-USD", "ERA-USD",
  "ETC-USD", "ETH-USD", "ETHFI-USD", "EUL-USD", "FAI-USD", "FARM-USD", "FARTCOIN-USD", "FET-USD",
  "FIDA-USD", "FIGHT-USD", "FIL-USD", "FIS-USD", "FLOCK-USD", "FLOKI-USD", "FLOW-USD", "FLR-USD",
  "FLUID-USD", "FORT-USD", "FORTH-USD", "FOX-USD", "FUN1-USD", "G-USD", "GFI-USD", "GHST-USD",
  "GIGA-USD", "GLM-USD", "GMT-USD", "GNO-USD", "GODS-USD", "GRT-USD", "GST-USD", "GTC-USD",
  "HBAR-USD", "HFT-USD", "HIGH-USD", "HNT-USD", "HOME-USD", "HONEY-USD", "HOPR-USD", "HYPE-USD",
  "HYPER-USD", "ICP-USD", "IDEX-USD", "ILV-USD", "IMU-USD", "IMX-USD", "INDEX-USD", "INJ-USD",
  "INV-USD", "INX-USD", "IO-USD", "IOTX-USD", "IP-USD", "IRYS-USD", "JASMY-USD", "JITOSOL-USD",
  "JTO-USD", "JUPITER-USD", "KAITO-USD", "KARRAT-USD", "KAVA-USD", "KERNEL-USD", "KEYCAT-USD", "KITE-USD",
  "KMNO-USD", "KNC-USD", "KRL-USD", "KSM-USD", "KTA-USD", "L3-USD", "LA-USD", "LAYER-USD",
  "LCX-USD", "LDO-USD", "LIGHTER-USD", "LINEA-USD", "LINK-USD", "LPT-USD", "LQTY-USD", "LRC-USD",
  "LRDS-USD", "LSETH-USD", "LTC-USD", "MAGIC-USD", "MAMO-USD", "MANA-USD", "MANTLE-USD", "MASK-USD",
  "MATH-USD", "MDT-USD", "ME-USD", "MET-USD", "METIS-USD", "MINA-USD", "MLN-USD", "MNDE-USD",
  "MOG-USD", "MON-USD", "MOODENG-USD", "MORPHO-USD", "MPLX-USD", "MSOL-USD", "NCT-USD", "NEAR-USD",
  "NEON-USD", "NEWT-USD", "NKN-USD", "NMR-USD", "NOICE-USD", "NOM-USD", "OCEAN-USD", "OGN-USD",
  "OMNI-USD", "ONDO-USD", "OP-USD", "ORCA-USD", "OSMO-USD", "OXT-USD", "PAX-USD", "PAXG-USD",
  "PENDLE-USD", "PENGU-USD", "PEPE-USD", "PERP-USD", "PIRATE-USD", "PLU-USD", "PLUME-USD", "PNG-USD",
  "PNUT-USD", "POL-USD", "POLS-USD", "POND-USD", "POPCAT-USD", "POWR-USD", "PRCL-USD", "PRIME-USD",
  "PRO-USD", "PROMPT-USD", "PROVE-USD", "PUMP-USD", "PUNDIX-USD", "PYR-USD", "PYTH-USD", "QI-USD",
  "QNT-USD", "RAD-USD", "RARE-USD", "RARI-USD", "RAY-USD", "RECALL-USD", "RED-USD", "RENDER-USD",
  "REQ-USD", "REZ-USD", "RLC-USD", "RLS-USD", "RNBW-USD", "RONIN-USD", "ROSE-USD", "RPL-USD",
  "RSC-USD", "RSR-USD", "S-USD", "SAFE-USD", "SAND-USD", "SAPIEN-USD", "SD-USD", "SEAM-USD",
  "SEI-USD", "SENT-USD", "SHDW-USD", "SHIB-USD", "SHPING-USD", "SKL-USD", "SKR-USD", "SKY-USD",
  "SNX-USD", "SOL-USD", "SPA-USD", "SPELL-USD", "SPK-USD", "SPX-USD", "SQD-USD", "STG-USD",
  "STORJ-USD", "STRK-USD", "STX-USD", "SUI-USD", "SUKU-USD", "SUP-USD", "SUPER-USD", "SUSHI-USD",
  "SWELL-USD", "SWFTC-USD", "SXT-USD", "SYND-USD", "SYRUP-USD", "T-USD", "TAO-USD", "THQ-USD",
  "TIA-USD", "TIME-USD", "TNSR-USD", "TON-USD", "TOSHI-USD", "TOWNS-USD", "TRAC-USD", "TRB-USD",
  "TREE-USD", "TRIA-USD", "TROLL-USD", "TRU-USD", "TRUMP-USD", "TRUST-USD", "TURBO-USD", "UMA-USD",
  "UNI-USD", "USD1-USD", "USDS-USD", "USDT-USD", "USELESS-USD", "VARA-USD", "VELO-USD", "VET-USD",
  "VOXEL-USD", "VTHO-USD", "VVV-USD", "W-USD", "WAXL-USD", "WCT-USD", "WELL-USD", "WET-USD",
  "WIF-USD", "WLD-USD", "WLFI-USD", "WMTX-USD", "XAN-USD", "XCN-USD", "XLM-USD", "XPL-USD",
  "XRP-USD", "XTZ-USD", "XYO-USD", "YB-USD", "YFI-USD", "ZAMA-USD", "ZEC-USD", "ZEN-USD",
  "ZETA-USD", "ZETACHAIN-USD", "ZK-USD", "ZKC-USD", "ZKP-USD", "ZORA-USD", "ZRO-USD", "ZRX-USD"
]);

// Map Coinbase symbols back to Binance format for compatibility with Python/UI
// Example: "BTC-USD" -> "BTCUSDT"
function coinbaseToLegacy(symbol) {
  return symbol.replace("-USD", "USDT").replace("-", "");
}

// Initialize watchlist with categories
// Helper function to get user-specific watchlist file path
function getUserWatchlistPath(userId) {
  if (!userId || userId === 'undefined') {
    return path.join(DATA_DIR, "watchlist.json");
  }
  return path.join(DATA_DIR, `watchlist_${userId}.json`);
}

async function ensureWatchlistStructure(userId = null) {
  const watchlistPath = getUserWatchlistPath(userId);
  try {
    const data = await fs.readFile(watchlistPath, "utf8");
    const watchlist = JSON.parse(data);
    
    // If old format (flat array), migrate to new format
    if (Array.isArray(watchlist.symbols) && !watchlist.categories) {
      const migrated = {
        categories: {
          "CoinGecko": watchlist.symbols || [],
          "Dex/OnChain": [],
          "CoinBase": []
        },
        updatedAt: new Date().toISOString()
      };
      await fs.writeFile(watchlistPath, JSON.stringify(migrated, null, 2), "utf8");
      return migrated;
    }
    return watchlist;
  } catch (e) {
    // Create new structure
    const initial = {
      categories: {
        "CoinGecko": [],
        "Dex/OnChain": [],
        "CoinBase": []
      },
      updatedAt: new Date().toISOString()
    };
    await fs.writeFile(watchlistPath, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
}

// Map legacy Binance symbols to Coinbase format
// Example: "BTCUSDT" -> "BTC-USD"
function legacyToCoinbase(symbol) {
  if (symbol.endsWith("USDT")) {
    const base = symbol.slice(0, -4);
    return `${base}-USD`;
  }
  return symbol; // already in correct format or unknown
}

// Load watchlist from file and add to WATCH set
// Note: WATCH is already pre-populated with all 368 Coinbase pairs
// This function is kept for backward compatibility but no longer loads user-specific watchlists
async function loadWatchlist() {
  try {
    // WATCH already contains all Coinbase pairs
    // No need to load user-specific watchlists at startup
    const totalSymbols = Array.from(WATCH).length;
    console.log(`✅ WATCH initialized with ${totalSymbols} Coinbase pairs`);
  } catch (e) {
    console.log("⚠️ Error in loadWatchlist:", e.message);
  }
}

// Initialize watchlist on startup
await loadWatchlist();

// --- WebSocket server for frontend clients (React) ---
const uiWss = new WebSocketServer({ port: FRONTEND_PORT });
console.log(`✅ UI WebSocket server on ws://localhost:${FRONTEND_PORT}`);

// Keep latest state (optional)
function broadcastToUI(obj) {
  const msg = JSON.stringify(obj);
  for (const client of uiWss.clients) {
    if (client.readyState === WebSocket.OPEN) client.send(msg);
  }
}

// --- WebSocket client connection to Python analytics ---
let pyWS = null;

function connectPython() {
  pyWS = new WebSocket(`ws://localhost:${PYTHON_PORT}/ws`);
  pyWS.on("open", () => console.log("✅ Connected to Python signal engine"));
  pyWS.on("message", async (raw) => {
    // Alerts from Python -> forward to UI
    const msg = JSON.parse(raw.toString());
    if (msg.type === "alerts") {
      console.log(`📢 Forwarding ${msg.alerts.length} alerts to frontend:`, msg.alerts.map(a => `${a.symbol}(${a.vol5m}%)`).join(', '));
      
      // Auto-add EXPLOSIVE and HOT alerts to watchlist (expected to go up)
      for (const alert of msg.alerts) {
        if (alert.level === 'EXPLOSIVE' || alert.level === 'HOT') {
          const coinbaseSymbol = legacyToCoinbase(alert.symbol);
          if (!WATCH.has(coinbaseSymbol)) {
            // Add to watchlist
            try {
              const filePath = path.join(DATA_DIR, "watchlist.json");
              let watchlist = { symbols: [] };
              try {
                const raw = await fs.readFile(filePath, "utf8");
                watchlist = JSON.parse(raw);
              } catch (e) {
                // File doesn't exist yet
              }
              
              if (!watchlist.symbols.includes(alert.symbol)) {
                watchlist.symbols.push(alert.symbol);
                watchlist.updatedAt = new Date().toISOString();
                await fs.writeFile(filePath, JSON.stringify(watchlist, null, 2), "utf8");
                WATCH.add(coinbaseSymbol);
                console.log(`🔥 Auto-added ${alert.symbol} to watchlist (${alert.level} - ${alert.vol5m}%)`);
                
                // Resubscribe to Coinbase with new symbol
                if (coinbaseWS && coinbaseWS.readyState === WebSocket.OPEN) {
                  coinbaseWS.send(JSON.stringify({
                    type: "subscribe",
                    channel: "ticker",
                    product_ids: [coinbaseSymbol],
                  }));
                }
              }
            } catch (e) {
              console.error(`Failed to auto-add ${alert.symbol}:`, e.message);
            }
          }
        }
      }
      
      broadcastToUI(msg);
    }
  });
  pyWS.on("close", () => {
    console.log("⚠️ Python connection closed. Reconnecting in 2s...");
    setTimeout(connectPython, 2000);
  });
  pyWS.on("error", () => {}); // avoid spam; reconnect handles
}
connectPython();

// --- Coinbase Advanced Trade WebSocket (market data) ---
let coinbaseWS = null;
let reconnectTimeout = null;

function connectCoinbase() {
  if (reconnectTimeout) clearTimeout(reconnectTimeout);
  
  coinbaseWS = new WebSocket(COINBASE_URL);
  
  coinbaseWS.on("open", () => {
    console.log("✅ Connected to Coinbase Advanced Trade market data WS");
    
    // Must subscribe within 5 seconds or Coinbase disconnects
    const productIds = Array.from(WATCH);
    
    // 1) Subscribe to ticker for live prices
    coinbaseWS.send(JSON.stringify({
      type: "subscribe",
      channel: "ticker",
      product_ids: productIds,
    }));
    
    // 2) Subscribe to heartbeats to keep connection alive
    coinbaseWS.send(JSON.stringify({
      type: "subscribe",
      channel: "heartbeats",
      product_ids: productIds,
    }));
    
    console.log(`✅ Subscribed to ticker + heartbeats for ${productIds.length} products`);
  });
  
  coinbaseWS.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      
      // Handle heartbeats (keep connection alive)
      if (msg.channel === "heartbeats" || msg.type === "heartbeat") {
        // Silent - just keeps connection alive
        return;
      }
      
      // Handle ticker updates
      if (msg.channel === "ticker" && msg.events) {
        const updates = [];
        const ticksForPython = [];
        
        for (const event of msg.events) {
          if (event.type === "ticker" && event.tickers) {
            for (const ticker of event.tickers) {
              const coinbaseSymbol = ticker.product_id;
              if (!WATCH.has(coinbaseSymbol)) continue;
              
              const price = Number(ticker.price);
              if (!price || isNaN(price)) continue;
              
              const ts = Date.now();
              
              // Convert to legacy format for compatibility (BTC-USD -> BTCUSDT)
              const legacySymbol = coinbaseToLegacy(coinbaseSymbol);
              
              updates.push({ symbol: legacySymbol, price, ts });
              ticksForPython.push({ symbol: legacySymbol, price, ts });
            }
          }
        }
        
        // 1) Push prices to UI (fast)
        if (updates.length) broadcastToUI({ type: "prices", updates });
        
        // 2) Send tick batch to Python (signals)
        if (pyWS && pyWS.readyState === WebSocket.OPEN && ticksForPython.length) {
          pyWS.send(JSON.stringify({ type: "ticks", ticks: ticksForPython }));
        }
      }
    } catch (e) {
      console.error("Coinbase message parse error:", e.message);
    }
  });
  
  coinbaseWS.on("close", () => {
    console.log("⚠️ Coinbase WS closed. Reconnecting in 5s...");
    reconnectTimeout = setTimeout(connectCoinbase, 5000);
  });
  
  coinbaseWS.on("error", (e) => {
    console.error("Coinbase WS error:", e.message);
  });
}

connectCoinbase();

// --- Helper function for reading JSON files ---
async function readJsonFile(filename) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

// --- CoinGecko Price Polling (for CoinGecko coins) ---
// Note: Using CoinGecko /coins/markets API which provides symbol+price directly
let coinGeckoPollingInterval = null;
let lastCoinGeckoPrices = new Map(); // symbol -> { price, lastUpdate }
const COINGECKO_API_KEY = 'CG-dGjsqM8SUfwusmz3fyf74kTc';

async function pollCoinGeckoPrices() {
  try {
    // Get all user watchlists and extract CoinGecko symbols
    const files = await fs.readdir(DATA_DIR);
    const watchlistFiles = files.filter(f => f.startsWith('watchlist_') && f.endsWith('.json'));

    const coinGeckoSymbols = new Set();

    // Read all user watchlists
    for (const file of watchlistFiles) {
      try {
        const data = await readJsonFile(file);
        if (data.categories && data.categories['CoinGecko']) {
          data.categories['CoinGecko'].forEach(symbol => {
            coinGeckoSymbols.add(symbol);
          });
        }
      } catch (e) {
        console.error(`Error reading ${file}:`, e.message);
      }
    }

    if (coinGeckoSymbols.size === 0) {
      return;
    }

    console.log(`🔄 Polling CoinGecko for ${coinGeckoSymbols.size} coins...`);

    // Use /coins/markets endpoint to get top 1000 coins with real-time prices
    // This returns symbol + price directly, no need for mapping
    const pages = 4; // 4 pages * 250 = 1000 coins
    let processedCount = 0;

    for (let page = 1; page <= pages; page++) {
      try {
        const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=${page}&sparkline=false`;
        const response = await fetch(url, {
          headers: {
            'x-cg-demo-api-key': COINGECKO_API_KEY
          }
        });

        if (!response.ok) {
          console.warn(`⚠️ CoinGecko API error on page ${page}: ${response.status}`);
          continue;
        }

        const coins = await response.json();

        // Process each coin
        for (const coin of coins) {
          const symbol = `${coin.symbol.toUpperCase()}USDT`;

          // Only process if it's in user's watchlist
          if (coinGeckoSymbols.has(symbol) && coin.current_price) {
            const price = coin.current_price;
            const ts = Date.now();

            // Check if price changed significantly (>0.01%)
            const lastPrice = lastCoinGeckoPrices.get(symbol);
            const priceChangePct = lastPrice ? Math.abs((price - lastPrice.price) / lastPrice.price * 100) : 100;

            if (priceChangePct > 0.01 || !lastPrice) {
              lastCoinGeckoPrices.set(symbol, { price, lastUpdate: ts });

              // Send to Python analytics
              const ticksForPython = [{ symbol, price, ts }];
              if (pyWS && pyWS.readyState === WebSocket.OPEN) {
                pyWS.send(JSON.stringify({ type: "ticks", ticks: ticksForPython }));
              }

              // Broadcast to UI
              broadcastToUI({ type: "prices", updates: [{ symbol, price, ts }] });
              processedCount++;
            }
          }
        }

        console.log(`✅ CoinGecko page ${page}/${pages}: processed ${processedCount} watchlist coins so far`);

        // Rate limiting: 1 second between pages (CoinGecko free tier: 10-30 calls/min)
        if (page < pages) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (e) {
        console.error(`Error polling CoinGecko page ${page}:`, e.message);
      }
    }

    if (processedCount > 0) {
      console.log(`📊 Sent ${processedCount} price updates to Python for volatility analysis`);
    }
  } catch (e) {
    console.error('Error in CoinGecko polling:', e.message);
  }
}

// Start CoinGecko polling (every 30 seconds for near real-time updates)
coinGeckoPollingInterval = setInterval(pollCoinGeckoPrices, 30000);
pollCoinGeckoPrices(); // Initial poll

console.log('✅ CoinGecko price polling initialized for CoinGecko coins');

// --- DexScreener Polling for DEX-only tokens ---
let dexPollingInterval = null;
let lastDexPrices = new Map(); // symbol -> { price, lastUpdate }

async function pollDexScreenerPrices() {
  try {
    // Get all user watchlists and extract Dex/OnChain symbols
    const files = await fs.readdir(DATA_DIR);
    const watchlistFiles = files.filter(f => f.startsWith('watchlist_') && f.endsWith('.json'));

    const dexSymbols = new Set();

    // Read all user watchlists
    for (const file of watchlistFiles) {
      try {
        const data = await readJsonFile(file);
        if (data.categories && data.categories['Dex/OnChain']) {
          data.categories['Dex/OnChain'].forEach(symbol => {
            // Skip if already on Binance (those get WebSocket feeds)
            if (!symbol.endsWith('USDT')) {
              dexSymbols.add(symbol);
            }
          });
        }
      } catch (e) {
        console.error(`Error reading ${file}:`, e.message);
      }
    }

    if (dexSymbols.size === 0) {
      return;
    }

    // Poll DexScreener for each symbol
    // Note: DexScreener API rate limits apply, so we batch this carefully
    const symbolArray = Array.from(dexSymbols);
    console.log(`🔄 Polling DexScreener for ${symbolArray.length} DEX-only tokens...`);

    for (const symbol of symbolArray) {
      try {
        // DexScreener search API (free tier)
        const searchUrl = `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(symbol)}`;
        const response = await fetch(searchUrl);

        if (!response.ok) {
          console.warn(`⚠️ DexScreener API error for ${symbol}: ${response.status}`);
          continue;
        }

        const data = await response.json();

        // Get the first matching pair with highest liquidity
        if (data.pairs && data.pairs.length > 0) {
          const bestPair = data.pairs
            .filter(p => p.liquidity?.usd > 1000) // Min $1k liquidity
            .sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];

          if (bestPair && bestPair.priceUsd) {
            const price = parseFloat(bestPair.priceUsd);
            const ts = Date.now();

            // Check if price changed significantly (>0.01%) to avoid spam
            const lastPrice = lastDexPrices.get(symbol);
            const priceChangePct = lastPrice ? Math.abs((price - lastPrice.price) / lastPrice.price * 100) : 100;

            if (priceChangePct > 0.01 || !lastPrice) {
              lastDexPrices.set(symbol, { price, lastUpdate: ts });

              // Send to Python analytics
              const ticksForPython = [{ symbol, price, ts }];
              if (pyWS && pyWS.readyState === WebSocket.OPEN) {
                pyWS.send(JSON.stringify({ type: "ticks", ticks: ticksForPython }));
              }

              // Broadcast to UI
              broadcastToUI({ type: "prices", updates: [{ symbol, price, ts }] });

              console.log(`📊 DEX price: ${symbol} = $${price.toFixed(6)} (via ${bestPair.dexId})`);
            }
          }
        }

        // Rate limiting: 300ms between requests (max ~3 req/sec per DexScreener limits)
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (e) {
        console.error(`Error polling ${symbol}:`, e.message);
      }
    }
  } catch (e) {
    console.error('Error in DEX polling:', e.message);
  }
}

// Start DEX polling (every 30 seconds for near real-time updates)
dexPollingInterval = setInterval(pollDexScreenerPrices, 30000);
pollDexScreenerPrices(); // Initial poll

console.log('✅ DexScreener polling initialized for DEX-only tokens');

// --- REST API Server for Discovery Data ---
const httpServer = http.createServer(async (req, res) => {
  // Log all incoming requests
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  res.setHeader("Content-Type", "application/json");

  try {
    // GET /api/discovered/onchain
    if (req.url === "/api/discovered/onchain" && req.method === "GET") {
      const data = await readJsonFile("discovered_onchain.json");
      res.writeHead(200);
      res.end(JSON.stringify(data || { items: [] }));
      return;
    }

    // GET /api/discovered/dex
    if (req.url === "/api/discovered/dex" && req.method === "GET") {
      const data = await readJsonFile("discovered_dexscreener.json");
      res.writeHead(200);
      res.end(JSON.stringify(data || { items: [] }));
      return;
    }

    // GET /api/discovered/all (merged)
    if (req.url === "/api/discovered/all" && req.method === "GET") {
      const onchain = await readJsonFile("discovered_onchain.json");
      const dex = await readJsonFile("discovered_dexscreener.json");
      const merged = [
        ...(onchain?.items || []),
        ...(dex?.items || []),
      ].sort((a, b) => new Date(b.seenAt) - new Date(a.seenAt));
      res.writeHead(200);
      res.end(JSON.stringify({ items: merged }));
      return;
    }

    // GET /api/listings/binance
    if (req.url === "/api/listings/binance" && req.method === "GET") {
      const data = await readJsonFile("new_binance_listings.json");
      res.writeHead(200);
      res.end(JSON.stringify(data || { items: [] }));
      return;
    }

    // GET /api/listings/coinbase
    if (req.url === "/api/listings/coinbase" && req.method === "GET") {
      const data = await readJsonFile("new_coinbase_listings.json");
      res.writeHead(200);
      res.end(JSON.stringify(data || { items: [] }));
      return;
    }

    // GET /api/watchlist
    if (req.url.startsWith("/api/watchlist") && req.method === "GET") {
      // Parse query params for userId
      const url = new URL(req.url, `http://${req.headers.host}`);
      const userId = url.searchParams.get('userId');
      
      const data = await ensureWatchlistStructure(userId);
      res.writeHead(200);
      res.end(JSON.stringify(data));
      return;
    }

    // POST /api/watchlist/add
    if (req.url === "/api/watchlist/add" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", async () => {
        try {
          const { symbol, category, userId } = JSON.parse(body);
          if (!symbol) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Missing symbol" }));
            return;
          }

          // Normalize: accept both formats, store in legacy format for compatibility
          const legacySymbol = symbol.includes("-") ? coinbaseToLegacy(symbol) : symbol;
          const coinbaseSymbol = legacyToCoinbase(legacySymbol);
          const targetCategory = category || "CoinGecko";

          const watchlist = await ensureWatchlistStructure(userId);
          
          if (!watchlist.categories[targetCategory]) {
            watchlist.categories[targetCategory] = [];
          }
          
          // Check if symbol already exists in the SAME category (not all categories)
          const alreadyExists = watchlist.categories[targetCategory].includes(legacySymbol);
          
          if (!alreadyExists) {
            watchlist.categories[targetCategory].push(legacySymbol);
            watchlist.updatedAt = new Date().toISOString();
            
            const filePath = getUserWatchlistPath(userId);
            await fs.writeFile(filePath, JSON.stringify(watchlist, null, 2), "utf8");
            
            // Add to WATCH set in Coinbase format for live tracking
            WATCH.add(coinbaseSymbol);
            
            // Resubscribe to Coinbase with updated list (if connected)
            if (coinbaseWS && coinbaseWS.readyState === WebSocket.OPEN) {
              const productIds = Array.from(WATCH);
              coinbaseWS.send(JSON.stringify({
                type: "subscribe",
                channel: "ticker",
                product_ids: productIds,
              }));
              console.log(`✅ Resubscribed with new symbol: ${coinbaseSymbol}`);
            }
            
            res.writeHead(200);
            res.end(JSON.stringify({ success: true, symbol: legacySymbol, coinbaseSymbol }));
          } else {
            res.writeHead(200);
            res.end(JSON.stringify({ success: true, message: "Already in watchlist" }));
          }
        } catch (e) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }

    // POST /api/watchlist/bulk-add
    if (req.url === "/api/watchlist/bulk-add" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", async () => {
        try {
          const { symbols, category, userId } = JSON.parse(body);
          if (!symbols || !Array.isArray(symbols)) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Missing or invalid symbols array" }));
            return;
          }

          const targetCategory = category || "CoinGecko";
          const watchlist = await ensureWatchlistStructure(userId);
          
          if (!watchlist.categories[targetCategory]) {
            watchlist.categories[targetCategory] = [];
          }

          let addedCount = 0;
          const existingInCategory = new Set(watchlist.categories[targetCategory] || []);
          
          // Add new symbols
          for (const symbol of symbols) {
            const legacySymbol = symbol.includes("-") ? coinbaseToLegacy(symbol) : symbol;
            const coinbaseSymbol = legacyToCoinbase(legacySymbol);
            
            // Only check if symbol exists in the SAME category, not all categories
            if (!existingInCategory.has(legacySymbol)) {
              watchlist.categories[targetCategory].push(legacySymbol);
              existingInCategory.add(legacySymbol);
              WATCH.add(coinbaseSymbol);
              addedCount++;
            }
          }

          if (addedCount > 0) {
            watchlist.updatedAt = new Date().toISOString();
            
            const filePath = getUserWatchlistPath(userId);
            await fs.writeFile(filePath, JSON.stringify(watchlist, null, 2), "utf8");
            
            // Resubscribe to Coinbase with updated list (if connected)
            if (coinbaseWS && coinbaseWS.readyState === WebSocket.OPEN) {
              const productIds = Array.from(WATCH);
              coinbaseWS.send(JSON.stringify({
                type: "subscribe",
                channel: "ticker",
                product_ids: productIds,
              }));
              console.log(`✅ Bulk added ${addedCount} symbols to ${targetCategory} watchlist`);
            }
          }

          res.writeHead(200);
          res.end(JSON.stringify({ 
            success: true, 
            added: addedCount,
            total: symbols.length,
            message: `Added ${addedCount} of ${symbols.length} symbols`
          }));
        } catch (e) {
          console.error("Error in bulk-add:", e);
          res.writeHead(500);
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }

    // POST /api/watchlist/remove
    if (req.url === "/api/watchlist/remove" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", async () => {
        try {
          const { symbol, userId } = JSON.parse(body);
          if (!symbol) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Missing symbol" }));
            return;
          }

          // Normalize: accept both formats
          const legacySymbol = symbol.includes("-") ? coinbaseToLegacy(symbol) : symbol;

          const watchlist = await ensureWatchlistStructure(userId);
          let removed = false;

          // Remove from all categories
          for (const cat in watchlist.categories) {
            const initialLength = watchlist.categories[cat].length;
            watchlist.categories[cat] = watchlist.categories[cat].filter(s => s !== legacySymbol);
            if (watchlist.categories[cat].length < initialLength) {
              removed = true;
            }
          }

          if (removed) {
            watchlist.updatedAt = new Date().toISOString();

            const filePath = getUserWatchlistPath(userId);
            await fs.writeFile(filePath, JSON.stringify(watchlist, null, 2), "utf8");

            console.log(`✅ Removed ${legacySymbol} from watchlist for user ${userId}`);

            res.writeHead(200);
            res.end(JSON.stringify({ success: true, symbol: legacySymbol, removed: true }));
          } else {
            res.writeHead(200);
            res.end(JSON.stringify({ success: false, message: "Symbol not in watchlist" }));
          }
        } catch (e) {
          console.error(`Error in remove: ${e.message}`);
          res.writeHead(500);
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }

    // POST /api/watchlist/remove-all
    if (req.url === "/api/watchlist/remove-all" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", async () => {
        try {
          const { category, userId } = JSON.parse(body);
          if (!category) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Missing category" }));
            return;
          }

          const watchlist = await ensureWatchlistStructure(userId);

          if (!watchlist.categories[category]) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Invalid category" }));
            return;
          }

          const removedCount = watchlist.categories[category]?.length || 0;

          // Clear the category
          watchlist.categories[category] = [];
          watchlist.updatedAt = new Date().toISOString();

          const filePath = getUserWatchlistPath(userId);
          await fs.writeFile(filePath, JSON.stringify(watchlist, null, 2), "utf8");

          console.log(`✅ Removed all ${removedCount} coins from ${category} category for user ${userId}`);

          res.writeHead(200);
          res.end(JSON.stringify({ success: true, category, removedCount }));
        } catch (e) {
          console.error(`Error in remove-all: ${e.message}`);
          res.writeHead(500);
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }

    // POST /api/watchlist/sync-coinbase
    if (req.url === "/api/watchlist/sync-coinbase" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", async () => {
        try {
          const { userId } = JSON.parse(body);

          // Convert Coinbase pairs to legacy format (BTC-USD -> BTCUSDT)
          const allCoinbaseSymbols = Array.from(WATCH).map(pair => coinbaseToLegacy(pair));

          const watchlist = await ensureWatchlistStructure(userId);

          // Replace CoinBase category with all 368 official Coinbase coins
          watchlist.categories['CoinBase'] = allCoinbaseSymbols;
          watchlist.updatedAt = new Date().toISOString();

          const filePath = getUserWatchlistPath(userId);
          await fs.writeFile(filePath, JSON.stringify(watchlist, null, 2), "utf8");

          console.log(`✅ Synced ${allCoinbaseSymbols.length} Coinbase coins for user ${userId}`);

          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            count: allCoinbaseSymbols.length,
            message: `Synced all ${allCoinbaseSymbols.length} Coinbase coins`
          }));
        } catch (e) {
          console.error(`Error in sync-coinbase: ${e.message}`);
          res.writeHead(500);
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }

    // Not found
    res.writeHead(404);
    res.end(JSON.stringify({ error: "Not found" }));
  } catch (e) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: e.message }));
  }
});

httpServer.listen(HTTP_PORT, () => {
  console.log(`✅ REST API server on http://localhost:${HTTP_PORT}`);
});

