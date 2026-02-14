import React, { useState, useEffect, useContext } from 'react';
import { auth } from '../../firebase';
import { CoinContext } from '../../context/CoinContext';
import './Watchlist.css';

const Watchlist = () => {
  const [activeTab, setActiveTab] = useState('CoinGecko');
  const [viewMode, setViewMode] = useState('watchlist'); // 'watchlist' or 'available'
  const [watchlist, setWatchlist] = useState({ categories: { "CoinGecko": [], "Dex/OnChain": [], "CoinBase": [] } });
  const [currentPage, setCurrentPage] = useState({ "CoinGecko": 1, "Dex/OnChain": 1, "CoinBase": 1 });
  const [availablePage, setAvailablePage] = useState({ "CoinGecko": 1, "Dex/OnChain": 1, "CoinBase": 1 });
  const [discoveredCoins, setDiscoveredCoins] = useState([]);
  const ITEMS_PER_PAGE = 20;

  const { allCoin } = useContext(CoinContext);

  // All Coinbase pairs (from server.js WATCH)
  const COINBASE_PAIRS = [
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
  ];

  useEffect(() => {
    fetchWatchlist();
    fetchDiscoveredCoins();

    // Poll watchlist every 10 seconds
    const interval = setInterval(() => {
      fetchWatchlist();
      fetchDiscoveredCoins();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchWatchlist = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      const res = await fetch(`http://localhost:3003/api/watchlist?userId=${userId}`);
      const data = await res.json();
      if (data.categories) {
        setWatchlist(data);
      }
    } catch (e) {
      console.error('Failed to fetch watchlist:', e);
    }
  };

  const fetchDiscoveredCoins = async () => {
    try {
      const res = await fetch('http://localhost:3003/api/discovered/all');
      const data = await res.json();
      if (data && Array.isArray(data)) {
        // Extract symbols from discovered coins
        const symbols = data.map(coin => coin.symbol || coin.baseToken?.symbol).filter(Boolean);
        setDiscoveredCoins(symbols);
        console.log(`📡 Fetched ${symbols.length} discovered coins for Dex/OnChain`);
      }
    } catch (e) {
      console.error('Failed to fetch discovered coins:', e);
    }
  };

  // Convert Coinbase format to legacy format for comparison
  const coinbaseToLegacy = (symbol) => {
    return symbol.replace("-USD", "USDT").replace("-", "");
  };

  // Get available coins for the current category
  const getAvailableCoins = (category) => {
    const watchedCoins = new Set(watchlist.categories[category] || []);

    if (category === 'CoinGecko') {
      // Get coins from CoinContext that aren't in watchlist
      const allSymbols = allCoin.map(coin => coin.symbol.toUpperCase() + "USDT");

      // Check for duplicates
      const uniqueSymbols = [...new Set(allSymbols)];
      const duplicateCount = allSymbols.length - uniqueSymbols.length;

      if (duplicateCount > 0) {
        console.log(`⚠️ CoinGecko: allCoin has ${allCoin.length} coins, but ${duplicateCount} duplicate symbols`);
        console.log(`Unique symbols after deduplication: ${uniqueSymbols.length}`);

        // Find which symbols are duplicated
        const symbolCounts = {};
        allSymbols.forEach(symbol => {
          symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
        });
        const duplicates = Object.entries(symbolCounts)
          .filter(([_, count]) => count > 1)
          .map(([symbol, count]) => `${symbol} (${count}x)`);
        console.log(`Duplicate symbols: ${duplicates.join(', ')}`);
      }

      const availableCoins = uniqueSymbols.filter(symbol => !watchedCoins.has(symbol));
      console.log(`CoinGecko: ${allCoin.length} total coins → ${uniqueSymbols.length} unique → ${availableCoins.length} available (${watchedCoins.size} in watchlist)`);

      return availableCoins;
    } else if (category === 'CoinBase') {
      // Get Coinbase pairs that aren't in watchlist
      const allSymbols = COINBASE_PAIRS.map(pair => coinbaseToLegacy(pair));

      // Check for duplicates
      const uniqueSymbols = [...new Set(allSymbols)];
      const duplicateCount = allSymbols.length - uniqueSymbols.length;

      if (duplicateCount > 0) {
        console.log(`⚠️ CoinBase has ${duplicateCount} duplicate symbols`);
      }

      const availableCoins = uniqueSymbols.filter(symbol => !watchedCoins.has(symbol));
      console.log(`CoinBase: ${COINBASE_PAIRS.length} total → ${uniqueSymbols.length} unique → ${availableCoins.length} available (${watchedCoins.size} in watchlist)`);

      return availableCoins;
    } else if (category === 'Dex/OnChain') {
      // Get discovered coins that aren't in watchlist
      const uniqueSymbols = [...new Set(discoveredCoins)];
      const duplicateCount = discoveredCoins.length - uniqueSymbols.length;

      if (duplicateCount > 0) {
        console.log(`⚠️ Dex/OnChain has ${duplicateCount} duplicate symbols`);
      }

      const availableCoins = uniqueSymbols.filter(symbol => !watchedCoins.has(symbol));
      console.log(`Dex/OnChain: ${discoveredCoins.length} total → ${uniqueSymbols.length} unique → ${availableCoins.length} available (${watchedCoins.size} in watchlist)`);

      return availableCoins;
    } else {
      return [];
    }
  };

  const getPaginatedCoins = (category) => {
    const coins = watchlist.categories[category] || [];
    const page = currentPage[category] || 1;
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return coins.slice(startIndex, endIndex);
  };

  const getPaginatedAvailableCoins = (category) => {
    const coins = getAvailableCoins(category);
    const page = availablePage[category] || 1;
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return coins.slice(startIndex, endIndex);
  };

  const getTotalPages = (category) => {
    const coins = watchlist.categories[category] || [];
    return Math.ceil(coins.length / ITEMS_PER_PAGE);
  };

  const getTotalAvailablePages = (category) => {
    const coins = getAvailableCoins(category);
    return Math.ceil(coins.length / ITEMS_PER_PAGE);
  };

  const changePage = (category, newPage) => {
    setCurrentPage(prev => ({ ...prev, [category]: newPage }));
  };

  const changeAvailablePage = (category, newPage) => {
    setAvailablePage(prev => ({ ...prev, [category]: newPage }));
  };

  const removeFromWatchlist = async (symbol, category) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      const res = await fetch('http://localhost:3003/api/watchlist/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, category, userId }),
      });
      const data = await res.json();
      if (data.success) {
        fetchWatchlist();
      }
    } catch (e) {
      console.error('Failed to remove from watchlist:', e);
    }
  };

  const removeAllFromWatchlist = async (category) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      console.error('No user logged in');
      alert('You must be logged in to remove coins');
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to remove all coins from ${category}?`);
    if (!confirmed) return;

    try {
      console.log(`Removing all coins from ${category}...`);
      const res = await fetch('http://localhost:3003/api/watchlist/remove-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, userId }),
      });
      const data = await res.json();
      console.log('Remove all response:', data);
      if (data.success) {
        console.log(`✅ Removed ${data.removedCount} coins from ${category}`);
        await fetchWatchlist();
        alert(`Successfully removed ${data.removedCount} coins from ${category}`);
      } else {
        console.error('Remove all failed:', data);
        alert('Failed to remove coins: ' + (data.error || 'Unknown error'));
      }
    } catch (e) {
      console.error('Failed to remove all from watchlist:', e);
      alert('Error: ' + e.message);
    }
  };

  const addAllToWatchlist = async (category) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      console.error('No user logged in');
      alert('You must be logged in to add coins');
      return;
    }

    const availableCoins = getAvailableCoins(category);

    if (availableCoins.length === 0) {
      alert(`No coins available to add in ${category}`);
      return;
    }

    const confirmed = window.confirm(`Add all ${availableCoins.length} available coins to ${category}?`);
    if (!confirmed) return;

    try {
      console.log(`Adding all ${availableCoins.length} coins to ${category}...`);
      console.log('First 10 coins to add:', availableCoins.slice(0, 10));

      const res = await fetch('http://localhost:3003/api/watchlist/bulk-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols: availableCoins, category, userId }),
      });

      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Bulk add response:', data);

      if (data.success) {
        const addedCount = data.added || 0;
        const totalAttempted = data.total || availableCoins.length;
        const alreadyExisted = totalAttempted - addedCount;

        console.log(`✅ Added ${addedCount} coins to ${category}`);
        console.log(`Total attempted: ${totalAttempted}, Actually added: ${addedCount}, Already existed: ${alreadyExisted}`);

        await fetchWatchlist();

        let message = `Successfully added ${addedCount} coins to ${category}\n\n`;
        message += `Attempted to add: ${totalAttempted}\n`;
        message += `Actually added: ${addedCount}\n`;

        if (alreadyExisted > 0) {
          message += `Already in watchlist: ${alreadyExisted}\n`;
        }

        if (category === 'CoinGecko' && allCoin.length > totalAttempted) {
          const duplicateCount = allCoin.length - totalAttempted;
          message += `\nNote: CoinGecko has ${duplicateCount} duplicate symbols that were filtered out before adding.`;
        }

        alert(message);
      } else {
        console.error('Bulk add failed:', data);
        alert('Failed to add coins: ' + (data.error || data.message || 'Unknown error'));
      }
    } catch (e) {
      console.error('Failed to bulk add to watchlist:', e);
      console.error('Error details:', {
        message: e.message,
        name: e.name,
        stack: e.stack
      });
      alert('Network error: ' + e.message + '\n\nMake sure the server is running on port 3003');
    }
  };

  const addToWatchlist = async (symbol, category) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      console.error('No user logged in');
      alert('You must be logged in to add coins');
      return;
    }

    try {
      console.log(`Adding ${symbol} to ${category}...`);
      console.log('Request payload:', { symbol, category, userId });

      const res = await fetch('http://localhost:3003/api/watchlist/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, category, userId }),
      });

      console.log('Response status:', res.status);
      console.log('Response ok:', res.ok);

      const data = await res.json();
      console.log('Add response:', data);

      if (data.success) {
        console.log(`✅ Added ${symbol} to ${category}`);
        await fetchWatchlist();
      } else {
        console.error('Add failed:', data);
        alert('Failed to add coin: ' + (data.error || data.message || 'Unknown error'));
      }
    } catch (e) {
      console.error('Failed to add to watchlist:', e);
      console.error('Error details:', {
        message: e.message,
        name: e.name,
        stack: e.stack
      });
      alert('Network error: ' + e.message + '\n\nMake sure the server is running on port 3003');
    }
  };

  const currentPaginatedCoins = viewMode === 'watchlist'
    ? getPaginatedCoins(activeTab)
    : getPaginatedAvailableCoins(activeTab);

  const availableCount = getAvailableCoins(activeTab).length;

  return (
    <div className="watchlist-page">
      <div className="watchlist-page-header">
        <h1>⭐ My Watchlist</h1>
        <p className="subtitle">Monitor your favorite coins across all platforms</p>
      </div>

      {/* Watchlist Tabs */}
      <div className="watchlist-tabs">
        <button
          className={`tab ${activeTab === 'CoinGecko' ? 'active' : ''}`}
          onClick={() => setActiveTab('CoinGecko')}
        >
          💎 CoinGecko ({watchlist.categories['CoinGecko']?.length || 0})
        </button>
        <button
          className={`tab ${activeTab === 'Dex/OnChain' ? 'active' : ''}`}
          onClick={() => setActiveTab('Dex/OnChain')}
        >
          🔍 Dex/OnChain ({watchlist.categories['Dex/OnChain']?.length || 0})
        </button>
        <button
          className={`tab ${activeTab === 'CoinBase' ? 'active' : ''}`}
          onClick={() => setActiveTab('CoinBase')}
        >
          🆕 CoinBase ({watchlist.categories['CoinBase']?.length || 0})
        </button>
      </div>

      {/* View Mode Toggle */}
      <div className="view-mode-toggle">
        <button
          className={`mode-btn ${viewMode === 'watchlist' ? 'active' : ''}`}
          onClick={() => setViewMode('watchlist')}
        >
          📋 Watchlist ({watchlist.categories[activeTab]?.length || 0})
        </button>
        <button
          className={`mode-btn ${viewMode === 'available' ? 'active' : ''}`}
          onClick={() => setViewMode('available')}
        >
          ➕ Available ({availableCount})
        </button>
      </div>

      {/* Watchlist Display */}
      <div className="watchlist-section">
        <div className="watchlist-header">
          <h2>{viewMode === 'watchlist' ? `${activeTab} Watchlist` : `Available ${activeTab} Coins`}</h2>
          <div className="header-actions">
            {viewMode === 'watchlist' && watchlist.categories[activeTab]?.length > 0 && (
              <button
                className="remove-all-btn"
                onClick={() => removeAllFromWatchlist(activeTab)}
              >
                🗑️ Remove All
              </button>
            )}
            {viewMode === 'available' && availableCount > 0 && (
              <button
                className="add-all-btn"
                onClick={() => addAllToWatchlist(activeTab)}
              >
                ➕ Add All ({availableCount})
              </button>
            )}
            <div className="pagination">
              <button
                onClick={() => viewMode === 'watchlist'
                  ? changePage(activeTab, currentPage[activeTab] - 1)
                  : changeAvailablePage(activeTab, availablePage[activeTab] - 1)
                }
                disabled={viewMode === 'watchlist'
                  ? currentPage[activeTab] <= 1
                  : availablePage[activeTab] <= 1
                }
              >
                ← Previous
              </button>
              <span>
                Page {viewMode === 'watchlist' ? currentPage[activeTab] : availablePage[activeTab]} of {viewMode === 'watchlist' ? getTotalPages(activeTab) || 1 : getTotalAvailablePages(activeTab) || 1}
              </span>
              <button
                onClick={() => viewMode === 'watchlist'
                  ? changePage(activeTab, currentPage[activeTab] + 1)
                  : changeAvailablePage(activeTab, availablePage[activeTab] + 1)
                }
                disabled={viewMode === 'watchlist'
                  ? currentPage[activeTab] >= getTotalPages(activeTab)
                  : availablePage[activeTab] >= getTotalAvailablePages(activeTab)
                }
              >
                Next →
              </button>
            </div>
          </div>
        </div>
        <div className="watchlist-grid">
          {viewMode === 'watchlist' ? (
            <>
              {currentPaginatedCoins.map((coin, index) => (
                <div key={coin} className="watchlist-coin">
                  <span className="coin-number">{((currentPage[activeTab] - 1) * ITEMS_PER_PAGE) + index + 1}</span>
                  <span className="coin-symbol">{coin}</span>
                  <button
                    className="watchlist-btn in-watchlist"
                    onClick={() => removeFromWatchlist(coin, activeTab)}
                    title="Remove from watchlist"
                  >
                    ✓
                  </button>
                </div>
              ))}
              {currentPaginatedCoins.length === 0 && (
                <div className="empty-watchlist">
                  No coins in {activeTab} category yet. Switch to Available view to add coins.
                </div>
              )}
            </>
          ) : (
            <>
              {currentPaginatedCoins.map((coin, index) => (
                <div key={coin} className="watchlist-coin">
                  <span className="coin-number">{((availablePage[activeTab] - 1) * ITEMS_PER_PAGE) + index + 1}</span>
                  <span className="coin-symbol">{coin}</span>
                  <button
                    className="watchlist-btn not-in-watchlist"
                    onClick={() => addToWatchlist(coin, activeTab)}
                    title="Add to watchlist"
                  >
                    +
                  </button>
                </div>
              ))}
              {currentPaginatedCoins.length === 0 && (
                <div className="empty-watchlist">
                  {activeTab === 'Dex/OnChain'
                    ? 'No available coins to display. Dex/OnChain coins are discovered from external sources.'
                    : 'All available coins have been added to your watchlist!'
                  }
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Watchlist;
