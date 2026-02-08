import React, { useState, useEffect } from 'react';
import './Discovered.css';

const Discovered = () => {
  const [activeTab, setActiveTab] = useState('all'); // all, onchain, dex
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [chainFilter, setChainFilter] = useState('all');
  const [watchlist, setWatchlist] = useState(new Set());

  useEffect(() => {
    fetchDiscovered();
    fetchWatchlist();
  }, [activeTab]);

  const fetchWatchlist = async () => {
    try {
      const res = await fetch('http://localhost:3003/api/watchlist');
      const data = await res.json();
      setWatchlist(new Set(data.symbols || []));
    } catch (e) {
      console.error('Failed to fetch watchlist:', e);
    }
  };

  const fetchDiscovered = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      if (activeTab === 'all') endpoint = 'http://localhost:3003/api/discovered/all';
      else if (activeTab === 'onchain') endpoint = 'http://localhost:3003/api/discovered/onchain';
      else if (activeTab === 'dex') endpoint = 'http://localhost:3003/api/discovered/dex';

      const res = await fetch(endpoint);
      const data = await res.json();
      setItems(data.items || []);
    } catch (e) {
      console.error('Failed to fetch discovered tokens:', e);
    }
    setLoading(false);
  };

  const promoteToWatchlist = async (item) => {
    // For now, we can only promote if we have a Binance symbol
    // In reality, you'd check if this token is on Binance first
    const symbol = item.symbol?.toUpperCase() + 'USDT';
    
    try {
      const res = await fetch('http://localhost:3003/api/watchlist/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol }),
      });
      const data = await res.json();
      if (data.success) {
        setWatchlist(prev => new Set([...prev, symbol]));
        alert(`✅ ${symbol} added to watchlist!`);
      }
    } catch (e) {
      console.error('Failed to add to watchlist:', e);
      alert('❌ Failed to add to watchlist. Check console.');
    }
  };

  const removeFromWatchlist = async (item) => {
    const symbol = item.symbol?.toUpperCase() + 'USDT';
    
    try {
      const res = await fetch('http://localhost:3003/api/watchlist/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol }),
      });
      const data = await res.json();
      if (data.success) {
        setWatchlist(prev => {
          const updated = new Set(prev);
          updated.delete(symbol);
          return updated;
        });
        alert(`🗑️ ${symbol} removed from watchlist`);
      }
    } catch (e) {
      console.error('Failed to remove from watchlist:', e);
      alert('❌ Failed to remove from watchlist');
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !filter ||
      item.symbol?.toLowerCase().includes(filter.toLowerCase()) ||
      item.name?.toLowerCase().includes(filter.toLowerCase()) ||
      item.contractAddress?.toLowerCase().includes(filter.toLowerCase());

    const matchesChain =
      chainFilter === 'all' ||
      item.networkId?.toLowerCase() === chainFilter.toLowerCase() ||
      item.chainId?.toLowerCase() === chainFilter.toLowerCase();

    return matchesSearch && matchesChain;
  });

  const chains = [...new Set(items.map((i) => i.networkId || i.chainId).filter(Boolean))];

  return (
    <div className="discovered-page">
      <h1>🔍 Discovered Tokens</h1>
      <p>New tokens from onchain feeds (CoinGecko) and DEX pairs (DexScreener)</p>

      <div className="tabs">
        <button
          className={activeTab === 'all' ? 'active' : ''}
          onClick={() => setActiveTab('all')}
        >
          All ({items.length})
        </button>
        <button
          className={activeTab === 'onchain' ? 'active' : ''}
          onClick={() => setActiveTab('onchain')}
        >
          Onchain
        </button>
        <button
          className={activeTab === 'dex' ? 'active' : ''}
          onClick={() => setActiveTab('dex')}
        >
          DEX Pairs
        </button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search symbol, name, address..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <select value={chainFilter} onChange={(e) => setChainFilter(e.target.value)}>
          <option value="all">All Chains</option>
          {chains.map((chain) => (
            <option key={chain} value={chain}>
              {chain}
            </option>
          ))}
        </select>
        <button onClick={fetchDiscovered}>🔄 Refresh</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="tokens-grid">
          {filteredItems.slice(0, 100).map((item, idx) => (
            <div key={item.key || idx} className="token-card">
              <div className="token-header">
                {item.icon && <img src={item.icon} alt="" className="token-icon" />}
                <div>
                  <h3>{item.symbol || 'Unknown'}</h3>
                  <p className="token-name">{item.name || 'No name'}</p>
                </div>
              </div>
              <div className="token-info">
                <p>
                  <strong>Chain:</strong> {item.networkId || item.chainId || 'Unknown'}
                </p>
                <p>
                  <strong>Source:</strong> {item.source}
                </p>
                {item.priceUsd && (
                  <p>
                    <strong>Price:</strong> ${Number(item.priceUsd).toFixed(6)}
                  </p>
                )}
                {item.liquidityUsd && (
                  <p>
                    <strong>Liquidity:</strong> ${Number(item.liquidityUsd).toLocaleString()}
                  </p>
                )}
                {item.volume24hUsd && (
                  <p>
                    <strong>24h Vol:</strong> ${Number(item.volume24hUsd).toLocaleString()}
                  </p>
                )}
                <p className="seen-at">
                  <strong>Seen:</strong> {new Date(item.seenAt).toLocaleString()}
                </p>
              </div>
              <div className="token-actions">
                {item.url && (
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    View
                  </a>
                )}
                {watchlist.has(item.symbol?.toUpperCase() + 'USDT') ? (
                  <button 
                    className="in-watchlist"
                    onClick={() => removeFromWatchlist(item)}
                    title="Remove from watchlist"
                  >
                    ✓ In Watchlist
                  </button>
                ) : (
                  <button onClick={() => promoteToWatchlist(item)}>
                    + Add to Watchlist
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredItems.length === 0 && (
        <p>No tokens found. Make sure discovery pollers are running.</p>
      )}
    </div>
  );
};

export default Discovered;
