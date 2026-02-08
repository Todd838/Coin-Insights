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

// Top 250 crypto symbols (Coinbase format: BTC-USD, ETH-USD, etc.)
const WATCH = new Set([
  "BTC-USD", "ETH-USD", "BNB-USD", "SOL-USD", "XRP-USD", "ADA-USD", "DOGE-USD", "MATIC-USD",
  "DOT-USD", "LTC-USD", "LINK-USD", "TRX-USD", "AVAX-USD", "UNI-USD", "ATOM-USD", "XLM-USD",
  "ETC-USD", "FIL-USD", "APT-USD", "NEAR-USD", "ARB-USD", "OP-USD", "STX-USD", "INJ-USD",
  "HBAR-USD", "VET-USD", "ICP-USD", "MKR-USD", "RNDR-USD", "LDO-USD", "ALGO-USD", "QNT-USD",
  "MANA-USD", "GRT-USD", "SAND-USD", "FTM-USD", "AAVE-USD", "EGLD-USD", "XTZ-USD", "AXS-USD",
  "APE-USD", "CFX-USD", "EOS-USD", "CHZ-USD", "GALA-USD", "FLR-USD", "FLOW-USD",
  "MINA-USD", "THETA-USD", "XMR-USD", "RUNE-USD", "NEO-USD", "KLAY-USD", "IMX-USD",
  "HNT-USD", "DYDX-USD", "AR-USD", "SNX-USD", "ZEC-USD", "ROSE-USD", "WLD-USD", "PERP-USD",
  "DASH-USD", "COMP-USD", "KNC-USD", "ENS-USD", "ZIL-USD", "CRV-USD", "OMG-USD", "GMX-USD",
  "IOST-USD", "ZRX-USD", "BAT-USD", "LRC-USD", "ONE-USD", "YGG-USD", "CELO-USD", "SPELL-USD",
  "COTI-USD", "JASMY-USD", "MASK-USD", "BSV-USD", "RVN-USD", "KAVA-USD", "ENJ-USD", "DGB-USD",
  "WAVES-USD", "SKL-USD", "ANKR-USD", "IOTX-USD", "ONT-USD", "SUSHI-USD", "SC-USD", "ZEN-USD",
  "LSK-USD", "NMR-USD", "CHR-USD", "LTO-USD", "BAND-USD", "ICX-USD", "REN-USD", "OGN-USD",
  "SFP-USD", "OCEAN-USD", "CTK-USD", "BAL-USD", "SRM-USD", "REEF-USD", "RLC-USD", "ALICE-USD",
  "BNX-USD", "C98-USD", "ALPHA-USD", "STMX-USD", "FET-USD", "PUNDIX-USD", "RSR-USD", "CELR-USD",
  "CKB-USD", "1INCH-USD", "BAKE-USD", "GTC-USD", "ACH-USD", "ANT-USD", "TOMO-USD",
  "BEL-USD", "AUDIO-USD", "VIDT-USD", "BLZ-USD", "DENT-USD", "CTSI-USD", "ATA-USD", "TRU-USD",
  "CVX-USD", "HOOK-USD", "AMB-USD", "GLM-USD", "AGIX-USD", "PHB-USD",
  "RAD-USD", "EDU-USD", "ID-USD", "BICO-USD", "COMBO-USD", "MAV-USD", "PENDLE-USD", "ARKM-USD",
  "SUI-USD", "IDEX-USD", "SEI-USD", "CYBER-USD", "NTRN-USD", "TIA-USD", "BEAMX-USD",
  "PIXEL-USD", "STRK-USD", "PORTAL-USD", "AXL-USD", "WIF-USD", "METIS-USD", "AEVO-USD",
  "ENA-USD", "W-USD", "TAO-USD", "OMNI-USD", "REZ-USD", "BB-USD", "NOT-USD", "IO-USD",
  "ZK-USD", "ZRO-USD", "G-USD", "LISTA-USD", "BANANA-USD", "RENDER-USD", "TON-USD", "MEME-USD",
  "POL-USD", "SCR-USD", "SAFE-USD", "TURBO-USD", "MOM-USD", "CATI-USD", "HMSTR-USD", "EIGEN-USD",
  "SCRT-USD", "LUMA-USD", "NEIRO-USD", "BTCST-USD", "QUICK-USD", "GRASS-USD"
]);

// Map Coinbase symbols back to Binance format for compatibility with Python/UI
// Example: "BTC-USD" -> "BTCUSDT"
function coinbaseToLegacy(symbol) {
  return symbol.replace("-USD", "USDT").replace("-", "");
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
async function loadWatchlist() {
  try {
    const filePath = path.join(DATA_DIR, "watchlist.json");
    const raw = await fs.readFile(filePath, "utf8");
    const watchlist = JSON.parse(raw);
    
    for (const symbol of watchlist.symbols || []) {
      // Convert legacy format to Coinbase format if needed
      const coinbaseSymbol = legacyToCoinbase(symbol);
      WATCH.add(coinbaseSymbol);
    }
    
    console.log(`✅ Loaded ${watchlist.symbols?.length || 0} symbols from watchlist`);
  } catch (e) {
    console.log("⚠️ No watchlist.json found, using default symbols");
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

// --- REST API Server for Discovery Data ---
async function readJsonFile(filename) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

const httpServer = http.createServer(async (req, res) => {
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
    if (req.url === "/api/watchlist" && req.method === "GET") {
      const data = await readJsonFile("watchlist.json");
      res.writeHead(200);
      res.end(JSON.stringify(data || { symbols: [] }));
      return;
    }

    // POST /api/watchlist/add
    if (req.url === "/api/watchlist/add" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", async () => {
        try {
          const { symbol } = JSON.parse(body);
          if (!symbol) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Missing symbol" }));
            return;
          }

          // Normalize: accept both formats, store in legacy format for compatibility
          const legacySymbol = symbol.includes("-") ? coinbaseToLegacy(symbol) : symbol;
          const coinbaseSymbol = legacyToCoinbase(legacySymbol);

          const watchlist = await readJsonFile("watchlist.json") || { symbols: [] };
          if (!watchlist.symbols.includes(legacySymbol)) {
            watchlist.symbols.push(legacySymbol);
            watchlist.updatedAt = new Date().toISOString();
            
            const filePath = path.join(DATA_DIR, "watchlist.json");
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

    // POST /api/watchlist/remove
    if (req.url === "/api/watchlist/remove" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", async () => {
        try {
          const { symbol } = JSON.parse(body);
          if (!symbol) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Missing symbol" }));
            return;
          }

          // Normalize: accept both formats
          const legacySymbol = symbol.includes("-") ? coinbaseToLegacy(symbol) : symbol;
          const coinbaseSymbol = legacyToCoinbase(legacySymbol);

          const watchlist = await readJsonFile("watchlist.json") || { symbols: [] };
          const initialLength = watchlist.symbols.length;
          watchlist.symbols = watchlist.symbols.filter(s => s !== legacySymbol);
          
          if (watchlist.symbols.length < initialLength) {
            watchlist.updatedAt = new Date().toISOString();
            
            const filePath = path.join(DATA_DIR, "watchlist.json");
            await fs.writeFile(filePath, JSON.stringify(watchlist, null, 2), "utf8");
            
            // Remove from WATCH set
            WATCH.delete(coinbaseSymbol);
            
            // Resubscribe to Coinbase with updated list (if connected)
            if (coinbaseWS && coinbaseWS.readyState === WebSocket.OPEN) {
              const productIds = Array.from(WATCH);
              coinbaseWS.send(JSON.stringify({
                type: "unsubscribe",
                channel: "ticker",
                product_ids: [coinbaseSymbol],
              }));
              console.log(`✅ Unsubscribed from: ${coinbaseSymbol}`);
            }
            
            res.writeHead(200);
            res.end(JSON.stringify({ success: true, symbol: legacySymbol, removed: true }));
          } else {
            res.writeHead(200);
            res.end(JSON.stringify({ success: false, message: "Symbol not in watchlist" }));
          }
        } catch (e) {
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

