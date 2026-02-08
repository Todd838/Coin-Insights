/**
 * discovery/coinbase-listings.js
 * Detects new Coinbase Advanced Trade listings by polling /products API
 *
 * Writes: data/new_coinbase_listings.json
 */

import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const LISTINGS_FILE = path.join(DATA_DIR, "new_coinbase_listings.json");
const WATCHLIST_FILE = path.join(DATA_DIR, "watchlist.json");

const CONFIG = {
  POLL_MS: 5 * 60 * 1000, // Poll every 5 minutes
  AUTO_ADD_TO_WATCHLIST: false, // Set true to auto-promote new listings
  COINBASE_API: "https://api.coinbase.com/api/v3/brokerage/market/products", // Public Advanced Trade API (no auth)
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
    if (it.product_id) state.seen.add(it.product_id);
  }
}

async function pollCoinbaseProducts() {
  const url = CONFIG.COINBASE_API;
  
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Coinbase API ${res.status}`);
    }
    
    const json = await res.json();
    const products = json.products || [];

    let newCount = 0;

    for (const product of products) {
      // Only track USD spot pairs that are active
      if (!product.product_id?.endsWith("-USD")) continue;
      if (product.status !== "online") continue;
      if (product.product_type && product.product_type !== "SPOT") continue;
      if (state.seen.has(product.product_id)) continue;

      const item = {
        product_id: product.product_id,
        base_currency: product.base_currency_id || product.base_currency,
        quote_currency: product.quote_currency_id || product.quote_currency,
        display_name: product.display_name,
        base_name: product.base_name,
        seenAt: new Date().toISOString(),
        status: product.status,
        trading_enabled: product.trading_disabled === false,
      };

      state.seen.add(product.product_id);
      state.items.unshift(item);
      newCount++;

      console.log(`🆕 New Coinbase listing: ${product.product_id} (${product.display_name || product.base_name})`);

      // Auto-add to watchlist if enabled
      if (CONFIG.AUTO_ADD_TO_WATCHLIST) {
        const watchlist = await readJson(WATCHLIST_FILE, { symbols: [] });
        // Convert to legacy format: BTC-USD -> BTCUSDT
        const legacySymbol = product.product_id.replace("-USD", "USDT").replace("-", "");
        if (!watchlist.symbols.includes(legacySymbol)) {
          watchlist.symbols.push(legacySymbol);
          watchlist.updatedAt = new Date().toISOString();
          await writeJsonAtomic(WATCHLIST_FILE, watchlist);
          console.log(`  ✅ Auto-added ${legacySymbol} to watchlist`);
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

    console.log(`[Coinbase Listings] total=${products.length} new=${newCount} tracked=${state.items.length}`);
  } catch (e) {
    console.error(`[Coinbase Listings] error: ${e.message}`);
  }
}

async function main() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await loadState();

  console.log("✅ Coinbase listings detector starting...");
  console.log(`- Poll every ${CONFIG.POLL_MS / 1000}s`);
  console.log(`- Auto-add to watchlist: ${CONFIG.AUTO_ADD_TO_WATCHLIST}`);

  // Run once immediately
  await pollCoinbaseProducts();

  // Schedule
  setInterval(() => pollCoinbaseProducts(), CONFIG.POLL_MS);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
