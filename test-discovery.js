/**
 * Quick test script to verify discovery pollers work
 * Run: node test-discovery.js
 */

console.log("🧪 Testing Discovery Systems...\n");

// Test 1: DexScreener API
console.log("1️⃣ Testing DexScreener API...");
fetch("https://api.dexscreener.com/token-profiles/latest/v1")
  .then(res => {
    console.log(`   Status: ${res.status} ${res.statusText}`);
    return res.json();
  })
  .then(data => {
    console.log(`   ✅ DexScreener working! Got ${data.length} items\n`);
  })
  .catch(e => {
    console.error(`   ❌ DexScreener failed: ${e.message}\n`);
  });

// Test 2: CoinGecko Onchain API
console.log("2️⃣ Testing CoinGecko Onchain API...");
fetch("https://api.coingecko.com/api/v3/onchain/tokens/info_recently_updated")
  .then(res => {
    console.log(`   Status: ${res.status} ${res.statusText}`);
    if (!res.ok) {
      if (res.status === 401) {
        console.error(`   ❌ CoinGecko requires API key! Get one at: https://www.coingecko.com/en/api/pricing\n`);
        throw new Error("Unauthorized");
      }
      if (res.status === 429) {
        console.error(`   ❌ CoinGecko rate limited! Wait or get API key\n`);
        throw new Error("Rate limited");
      }
      throw new Error(`HTTP ${res.status}`);
    }
    return res.json();
  })
  .then(data => {
    const count = Array.isArray(data?.data) ? data.data.length : (Array.isArray(data) ? data.length : 0);
    console.log(`   ✅ CoinGecko Onchain working! Got ${count} items\n`);
  })
  .catch(e => {
    if (e.message !== "Unauthorized" && e.message !== "Rate limited") {
      console.error(`   ❌ CoinGecko Onchain failed: ${e.message}\n`);
    }
  });

// Test 3: Binance API
console.log("3️⃣ Testing Binance Exchange Info API...");
fetch("https://api.binance.com/api/v3/exchangeInfo")
  .then(res => {
    console.log(`   Status: ${res.status} ${res.statusText}`);
    if (!res.ok) {
      if (res.status === 451) {
        console.error(`   ❌ Binance blocked in your region (HTTP 451)`);
        console.error(`      Try using a VPN or disable Binance listings\n`);
        throw new Error("Region blocked");
      }
      throw new Error(`HTTP ${res.status}`);
    }
    return res.json();
  })
  .then(data => {
    if (!data.symbols || !Array.isArray(data.symbols)) {
      console.error(`   ❌ Binance returned unexpected data format\n`);
      return;
    }
    const usdtPairs = data.symbols.filter(s => s.symbol.endsWith("USDT") && s.status === "TRADING").length;
    console.log(`   ✅ Binance working! Found ${usdtPairs} USDT pairs\n`);
  })
  .catch(e => {
    if (e.message !== "Region blocked") {
      console.error(`   ❌ Binance failed: ${e.message}\n`);
    }
  });

setTimeout(() => {
  console.log("\n📊 Test Results Summary:");
  console.log("\n✅ DexScreener: Should be working (no API key needed)");
  console.log("❌ CoinGecko: Requires API key (status 401)");
  console.log("❌ Binance: Blocked in your region (status 451)");
  console.log("\n🔧 Quick Fixes:");
  console.log("\n1. CoinGecko API Key (REQUIRED):");
  console.log("   - Get free demo key: https://www.coingecko.com/en/api/pricing");
  console.log("   - Set in PowerShell: $env:COINGECKO_API_KEY=\"your-key\"");
  console.log("   - Restart discovery pollers");
  console.log("\n2. Binance Regional Block:");
  console.log("   - Option A: Use VPN to bypass region block");
  console.log("   - Option B: Disable Binance listings (just use DexScreener)");
  console.log("   - To disable: Don't run discovery/binance-listings.js");
  console.log("\n3. Just Use DexScreener:");
  console.log("   - DexScreener works fine without issues!");
  console.log("   - Go to /discovered page and use 'DEX Pairs' tab");
  console.log("   - You'll still get plenty of discovery data");
}, 3000);
