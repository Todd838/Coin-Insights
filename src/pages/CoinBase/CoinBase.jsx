import React, { useState, useEffect } from 'react';
import './CoinBase.css';

const CoinBase = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState(new Set());

  useEffect(() => {
    fetchListings();
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const res = await fetch('http://localhost:3003/api/watchlist');
      const data = await res.json();
      setWatchlist(new Set(data.symbols || []));
    } catch (e) {
      console.error('Failed to fetch watchlist:', e);
    }
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3003/api/listings/coinbase');
      const data = await res.json();
      setListings(data.items || []);
    } catch (e) {
      console.error('Failed to fetch Coinbase listings:', e);
    }
    setLoading(false);
  };

  const addToWatchlist = async (symbol) => {
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
      alert('❌ Failed to add to watchlist');
    }
  };

  const removeFromWatchlist = async (symbol) => {
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

  return (
    <div className="binance-listings-page">
      <h1>🆕 New Coinbase Listings</h1>
      <p>Recently detected USD pairs on Coinbase Advanced Trade</p>

      <div className="listings-header">
        <button onClick={fetchListings}>🔄 Refresh</button>
        <p>{listings.length} listings tracked</p>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="listings-table">
          <table>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Name</th>
                <th>Base / Quote</th>
                <th>Status</th>
                <th>First Seen</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing.product_id}>
                  <td className="symbol">{listing.product_id}</td>
                  <td className="name">{listing.display_name || listing.base_name || 'N/A'}</td>
                  <td>{listing.base_currency} / {listing.quote_currency}</td>
                  <td>
                    <span className={`status ${listing.status.toLowerCase()}`}>
                      {listing.status} {listing.trading_enabled ? '✅' : '⏸️'}
                    </span>
                  </td>
                  <td>{new Date(listing.seenAt).toLocaleString()}</td>
                  <td>
                    {watchlist.has(listing.product_id) ? (
                      <button
                        className="remove-btn"
                        onClick={() => removeFromWatchlist(listing.product_id)}
                        title="Remove from watchlist"
                      >
                        ✓ In Watchlist
                      </button>
                    ) : (
                      <button
                        className="add-btn"
                        onClick={() => addToWatchlist(listing.product_id)}
                      >
                        + Add to Watchlist
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && listings.length === 0 && (
        <p>
          No new listings detected yet. Make sure coinbase-listings.js is running.
        </p>
      )}
    </div>
  );
};

export default CoinBase;
