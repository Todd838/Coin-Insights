import React, { useState, useEffect } from 'react';
import './CoinBase.css';
import { auth } from '../../firebase';

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
      const userId = auth.currentUser?.uid;
      if (!userId) return;
      
      const res = await fetch(`http://localhost:3003/api/watchlist?userId=${userId}`);
      const data = await res.json();
      // Flatten all categories into one set for checking
      const allSymbols = new Set();
      if (data.categories) {
        Object.values(data.categories).forEach(catSymbols => {
          catSymbols.forEach(s => allSymbols.add(s));
        });
      } else if (data.symbols) {
        // Old format compatibility
        data.symbols.forEach(s => allSymbols.add(s));
      }
      setWatchlist(allSymbols);
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
    const userId = auth.currentUser?.uid;
    if (!userId) {
      alert('Please sign in to manage your watchlist');
      return;
    }
    
    try {
      const res = await fetch('http://localhost:3003/api/watchlist/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, category: 'CoinBase', userId }),
      });
      const data = await res.json();
      if (data.success) {
        setWatchlist(prev => new Set([...prev, symbol]));
      }
    } catch (e) {
      console.error('Failed to add to watchlist:', e);
    }
  };

  const removeFromWatchlist = async (symbol) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    
    try {
      const res = await fetch('http://localhost:3003/api/watchlist/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, userId }),
      });
      const data = await res.json();
      if (data.success) {
        setWatchlist(prev => {
          const updated = new Set(prev);
          updated.delete(symbol);
          return updated;
        });
      }
    } catch (e) {
      console.error('Failed to remove from watchlist:', e);
    }
  };

  const addAllToWatchlist = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      alert('Please sign in to manage your watchlist');
      return;
    }
    
    const confirmAdd = window.confirm(`Add all ${listings.length} listings to CoinBase watchlist?`);
    if (!confirmAdd) return;
    
    try {
      const symbols = listings.map(listing => listing.product_id);
      console.log('Adding', symbols.length, 'CoinBase listings to watchlist');
      
      const response = await fetch('http://localhost:3003/api/watchlist/bulk-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols, category: 'CoinBase', userId })
      });
      
      const data = await response.json();
      console.log('Bulk add response:', data);
      
      if (response.ok && data.success) {
        alert(`✅ Successfully added ${data.added} new listings to watchlist!\n(${symbols.length - data.added} were already in watchlist)`);
        fetchWatchlist();
      } else {
        console.error('Bulk add failed:', data);
        alert(`❌ Failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error bulk adding to watchlist:', error);
      alert('❌ Failed to add listings to watchlist. Make sure the backend server is running on port 3003.');
    }
  };

  return (
    <div className="binance-listings-page">
      <h1>🆕 CoinBase Listings</h1>
      <p>Recently detected USD pairs on Coinbase Advanced Trade</p>

      <div className="listings-header">
        <button onClick={fetchListings}>🔄 Refresh</button>
        <button onClick={addAllToWatchlist} className="add-all-btn">⭐ Add All to Watchlist</button>
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
                    <button
                      className={`watchlist-btn ${watchlist.has(listing.product_id) ? 'in-watchlist' : ''}`}
                      onClick={() => watchlist.has(listing.product_id) ? removeFromWatchlist(listing.product_id) : addToWatchlist(listing.product_id)}
                      title={watchlist.has(listing.product_id) ? 'Remove from watchlist' : 'Add to watchlist'}
                    >
                      {watchlist.has(listing.product_id) ? '✓' : '+'}
                    </button>
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
