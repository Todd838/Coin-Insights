/**
 * discovery/binance-listings.js
 * Detects new Binance spot listings by polling /exchangeInfo
 *
 * Writes: data/new_binance_listings.json
 */

import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const LISTINGS_FILE = path.join(DATA_DIR, "new_binance_listings.json");
const WATCHLIST_FILE = path.join(DATA_DIR, "watchlist.json");

const CONFIG = {
  POLL_MS: 5 * 60 * 1000, // Poll every 5 minutes
  AUTO_ADD_TO_WATCHLIST: false, // Set true to auto-promote new listings
};

async function readJson(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function writeJsonAtomic(filePath, obj) {
  const tmp = `${filePath}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(obj, null, 2), "utf8");
  await fs.rename(tmp, filePath);
}

const state = {
  seen: new Set(),
  items: [],
};

async function loadState() {
  const data = await readJson(LISTINGS_FILE, { items: [] });
  for (const it of data.items || []) {
    state.items.push(it);
    if (it.symbol) state.seen.add(it.symbol);
  }
}

async function pollBinanceExchangeInfo() {
  const url = "https://api.binance.com/api/v3/exchangeInfo";
  const res = await fetch(url);
  
  // Handle regional blocks and other errors
  if (!res.ok) {
    if (res.status === 451) {
      throw new Error("Binance blocked in your region (HTTP 451) - Use VPN or disable this poller");
    }
    throw new Error(`Binance API ${res.status}`);
  }
  
  const json = await res.json();
  
  // Validate response structure
  if (!json.symbols || !Array.isArray(json.symbols)) {
    throw new Error("Binance returned unexpected data format (no symbols array)");
  }
  
  const symbols = json.symbols;

  let newCount = 0;

  for (const sym of symbols) {
    // Only track USDT spot pairs that are trading
    if (!sym.symbol?.endsWith("USDT")) continue;
    if (sym.status !== "TRADING") continue;
    if (state.seen.has(sym.symbol)) continue;

    const item = {
      symbol: sym.symbol,
      baseAsset: sym.baseAsset,
      quoteAsset: sym.quoteAsset,
      seenAt: new Date().toISOString(),
      status: sym.status,
    };

    state.seen.add(sym.symbol);
    state.items.unshift(item);
    newCount++;

    console.log(`🆕 New Binance listing: ${sym.symbol}`);

    // Auto-add to watchlist if enabled
    if (CONFIG.AUTO_ADD_TO_WATCHLIST) {
      const watchlist = await readJson(WATCHLIST_FILE, { symbols: [] });
      if (!watchlist.symbols.includes(sym.symbol)) {
        watchlist.symbols.push(sym.symbol);
        watchlist.updatedAt = new Date().toISOString();
        await writeJsonAtomic(WATCHLIST_FILE, watchlist);
        console.log(`  ✅ Auto-added ${sym.symbol} to watchlist`);
      }
    }
  }

  state.items = state.items.slice(0, 500);

  if (newCount > 0) {
    await writeJsonAtomic(LISTINGS_FILE, {
      updatedAt: new Date().toISOString(),
      items: state.items,
    });
  }

  console.log(`[Binance Listings] total=${symbols.length} new=${newCount} tracked=${state.items.length}`);
}

async function main() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await loadState();

  console.log("✅ Binance listings detector starting...");
  console.log(`- Poll every ${CONFIG.POLL_MS / 1000}s`);
  console.log(`- Auto-add to watchlist: ${CONFIG.AUTO_ADD_TO_WATCHLIST}`);

  // Run once immediately
  await pollBinanceExchangeInfo().catch((e) => {
    console.error("[Binance Listings] error:", e.message);
    if (e.message.includes("451") || e.message.includes("region")) {
      console.error("\u274c Binance API is blocked in your region");
      console.error("   Option 1: Use VPN to bypass region block");
      console.error("   Option 2: Disable this poller (just use DexScreener)");
      console.error("   This poller will NOT work without VPN or using a different network");
      process.exit(0); // Exit gracefully since Binance won't work
    }
  });

  // Schedule
  setInterval(
    () =>
      pollBinanceExchangeInfo().catch((e) =>
        console.error("[Binance Listings] error:", e.message)
      ),
    CONFIG.POLL_MS
  );
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
