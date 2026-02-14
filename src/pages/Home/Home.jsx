import React, { useContext, useEffect, useState } from 'react'
import './Home.css'
import { CoinContext } from '../../context/CoinContext'
import { Link } from 'react-router-dom'
import { auth } from '../../firebase'

const Home = () => {

const {allCoin, currency} = useContext(CoinContext);
const [displayCoin, setDisplayCoin] = useState([]);
const [input, setInput] = useState('');
const [livePrices, setLivePrices] = useState({});
const [buildings, setBuildings] = useState([]);
const [cars, setCars] = useState([]);
const [stars, setStars] = useState([]);
const [currentPage, setCurrentPage] = useState(1);
const [watchlistCoins, setWatchlistCoins] = useState([]);
const itemsPerPage = 25;

// Generate buildings, cars, and stars on mount
useEffect(() => {
    // Generate Buildings
    const buildingCount = 30;
    const newBuildings = [];
    for (let i = 0; i < buildingCount; i++) {
        newBuildings.push({
            id: i,
            height: Math.random() * 400 + 200,
            width: Math.random() * 80 + 60,
            left: (i * 150) + Math.random() * 50,
            duration: Math.random() * 30 + 40,
            delay: -(Math.random() * 20)
        });
    }
    setBuildings(newBuildings);

    // Generate Flying Cars
    const carCount = 8;
    const newCars = [];
    const colors = [
        'linear-gradient(45deg, #ff00ff, #00ffff)',
        'linear-gradient(45deg, #00ff00, #ffff00)',
        'linear-gradient(45deg, #ff0000, #ff00ff)',
        'linear-gradient(45deg, #0088ff, #00ffff)'
    ];
    for (let i = 0; i < carCount; i++) {
        newCars.push({
            id: i,
            duration: Math.random() * 10 + 10,
            delay: -(Math.random() * 15),
            top: Math.random() * 60 + 10,
            background: colors[Math.floor(Math.random() * colors.length)]
        });
    }
    setCars(newCars);

    // Generate Stars
    const starCount = 100;
    const newStars = [];
    for (let i = 0; i < starCount; i++) {
        newStars.push({
            id: i,
            left: Math.random() * 100,
            top: Math.random() * 70,
            animationDelay: Math.random() * 3,
            animationDuration: Math.random() * 3 + 2
        });
    }
    setStars(newStars);
}, []);

// Fetch watchlist on mount
useEffect(() => {
    fetchWatchlist();
}, []);

const fetchWatchlist = async () => {
    try {
        const userId = auth.currentUser?.uid;
        if (!userId) {
            console.log('⚠️ User not signed in, skipping watchlist fetch');
            setWatchlistCoins([]);
            return;
        }
        
        const response = await fetch(`http://localhost:3003/api/watchlist?userId=${userId}`);
        const data = await response.json();
        // Extract all coin symbols from CoinGecko category
        const coinsInWatchlist = data.categories?.CoinGecko || [];
        setWatchlistCoins(coinsInWatchlist);
        console.log('✅ Watchlist loaded:', coinsInWatchlist.length, 'coins');
    } catch (error) {
        console.error('❌ Error fetching watchlist:', error);
        setWatchlistCoins([]);
    }
};

const toggleWatchlist = async (coin, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    const userId = auth.currentUser?.uid;
    if (!userId) {
        alert('Please sign in to manage your watchlist');
        return;
    }
    
    const symbol = `${coin.symbol.toUpperCase()}USDT`;
    const isInWatchlist = watchlistCoins.includes(symbol);
    
    try {
        if (isInWatchlist) {
            // Remove from watchlist
            const response = await fetch('http://localhost:3003/api/watchlist/remove', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbol, category: 'CoinGecko', userId })
            });
            if (response.ok) {
                setWatchlistCoins(prev => prev.filter(s => s !== symbol));
            }
        } else {
            // Add to watchlist
            const response = await fetch('http://localhost:3003/api/watchlist/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbol, category: 'CoinGecko', userId })
            });
            if (response.ok) {
                setWatchlistCoins(prev => [...prev, symbol]);
            }
        }
    } catch (error) {
        console.error('Error updating watchlist:', error);
    }
};

const addAllToWatchlist = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        alert('Please sign in to manage your watchlist');
        return;
    }
    
    // Use displayCoin to add ALL displayed coins (all pages)
    const confirmAdd = window.confirm(`Add all ${displayCoin.length} coins to watchlist?`);
    if (!confirmAdd) return;
    
    try {
        const symbols = displayCoin.map(coin => `${coin.symbol.toUpperCase()}USDT`);
        console.log('Adding', symbols.length, 'CoinGecko coins to watchlist');
        
        const response = await fetch('http://localhost:3003/api/watchlist/bulk-add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symbols, category: 'CoinGecko', userId })
        });
        
        const data = await response.json();
        console.log('Bulk add response:', data);
        
        if (response.ok && data.success) {
            setWatchlistCoins(prev => [...new Set([...prev, ...symbols])]);
            alert(`✅ Successfully added ${data.added} new coins to watchlist!\n(${symbols.length - data.added} were already in watchlist)`);
            fetchWatchlist();
        } else {
            console.error('Bulk add failed:', data);
            alert(`❌ Failed: ${data.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error bulk adding to watchlist:', error);
        alert('❌ Failed to add coins to watchlist. Make sure the backend server is running on port 3003.');
    }
};

const inputHandler = (event)=>{
    setInput(event.target.value);
    if (event.target.value === ''){
        setDisplayCoin(allCoin);
    }
}

const searchHandler = async (event)=>{
    event.preventDefault();
    const coins = await allCoin.filter((item)=>{
        return item.name.toLowerCase().includes(input.toLowerCase())
    })
    setDisplayCoin(coins);
    setCurrentPage(1);
}

useEffect(() => {
    console.log('📊 allCoin updated:', allCoin.length, 'coins');
    setDisplayCoin(allCoin);
    setCurrentPage(1);
}, [allCoin]);

// WebSocket integration for live prices and alerts
useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001'); // Node gateway
    
    ws.onopen = () => {
        console.log('✅ WebSocket connected to Node gateway');
    };
    
    ws.onmessage = (event) => {
        try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'prices') {
                // Batch update prices from Coinbase
                const newPrices = {};
                msg.updates.forEach(u => {
                    newPrices[u.symbol] = u.price;
                });
                setLivePrices(prev => ({ ...prev, ...newPrices }));
            }
        } catch (e) {
            // Ignore malformed messages
        }
    };
    
    ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
    };
    
    ws.onclose = () => {
        console.log('⚠️ WebSocket disconnected');
    };
    
    return () => ws.close();
}, []);

// Pagination logic
const totalPages = Math.ceil(displayCoin.length / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const currentCoins = displayCoin.slice(startIndex, endIndex);

// Debug logging
console.log('🔍 Rendering - displayCoin:', displayCoin.length, 'currentCoins:', currentCoins.length, 'page:', currentPage);
if (displayCoin.length === 0 && allCoin.length > 0) {
    console.log('⚠️ displayCoin is empty but allCoin has data:', allCoin.length);
}
if (currentCoins.length === 0 && displayCoin.length > 0) {
    console.log('⚠️ currentCoins is empty. displayCoin:', displayCoin.length, 'currentPage:', currentPage, 'itemsPerPage:', itemsPerPage);
}

const changePage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};




  return (
    <div className='home'>
      {/* Animated Background */}
      <div className="bg-container">
        <div className="city-layer">
          {buildings.map(building => (
            <div
              key={building.id}
              className="building"
              style={{
                height: `${building.height}px`,
                width: `${building.width}px`,
                left: `${building.left}px`,
                animationDuration: `${building.duration}s`,
                animationDelay: `${building.delay}s`
              }}
            />
          ))}
        </div>
        <div className="grid-overlay"></div>
        <div className="stars-container">
          {stars.map(star => (
            <div
              key={star.id}
              className="star"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                animationDelay: `${star.animationDelay}s`,
                animationDuration: `${star.animationDuration}s`
              }}
            />
          ))}
        </div>
        <div className="cars-container">
          {cars.map(car => (
            <div
              key={car.id}
              className="flying-car"
              style={{
                animationDuration: `${car.duration}s`,
                animationDelay: `${car.delay}s`,
                top: `${car.top}%`,
                background: car.background
              }}
            />
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <form onSubmit={searchHandler}>
          <input 
            onChange={inputHandler} 
            list='coinlist' 
            value={input} 
            type="text" 
            placeholder='Search crypto..' 
            required
          />
          <datalist id='coinlist'>
            {allCoin.map((item, index)=>(<option key={index} value={item.name}/>))}
          </datalist>
          <button type="submit">Search</button>
        </form>
        <button onClick={addAllToWatchlist} className="add-all-btn" title="Add all displayed coins to watchlist">
          ⭐ Add All to Watchlist
        </button>
      </div>

      <div className='crypto-table'>
        <div className="table-layout table-header">
          <p>#</p>
          <p>Coins</p>
          <p>Price</p>
          <p style={{textAlign:"center"}}>24H Change</p>
          <p className='market-cap'>Market Cap</p>
          <p className='watchlist-col'>Watchlist</p>
        </div> 
        {currentCoins.length === 0 && allCoin.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '18px',
            gridColumn: '1 / -1'
          }}>
            Loading coins...
          </div>
        )}
        {currentCoins.length === 0 && allCoin.length > 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '18px',
            gridColumn: '1 / -1'
          }}>
            No coins found. Try a different search.
          </div>
        )}
        {
          currentCoins.map((item, index)=>{
            const symbol = `${item.symbol.toUpperCase()}USDT`;
            const isInWatchlist = watchlistCoins.includes(symbol);
            
            return (
              <Link to={`/coin/${item.id}`} className="table-layout" key={index}>
                <p>{item.market_cap_rank}</p>
                <div>
                  <img src={item.image} alt="" />
                  <p>{item.name + " - " + item.symbol}</p>
                </div>
                <p>{currency.symbol}{
                  livePrices[item.symbol?.toUpperCase()] ?
                    Number(livePrices[item.symbol?.toUpperCase()]).toLocaleString() :
                    item.current_price.toLocaleString()
                }</p>
                <p className={item.price_change_percentage_24h > 0 ? "green" : "red"}>
                  {Math.floor(item.price_change_percentage_24h * 100) / 100}
                </p>
                <p className='market-cap'>{currency.symbol}{item.market_cap.toLocaleString()}</p>
                <div className='watchlist-col'>
                  <button 
                    onClick={(e) => toggleWatchlist(item, e)}
                    className={`watchlist-btn ${isInWatchlist ? 'in-watchlist' : ''}`}
                    title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                  >
                    {isInWatchlist ? '✓' : '+'}
                  </button>
                </div>
              </Link>
            );
          })
        }
      </div>

      {/* Pagination Controls */}
      {displayCoin.length > 0 && (
        <div className="pagination-container">
          <div className="page-controls">
            <button 
              onClick={() => changePage(currentPage - 1)} 
              disabled={currentPage === 1}
              className="page-btn"
            >
              Previous
            </button>
            
            <div className="page-numbers">
              {currentPage > 2 && (
                <>
                  <button onClick={() => changePage(1)} className="page-num">1</button>
                  {currentPage > 3 && <span className="ellipsis">...</span>}
                </>
              )}
              
              {currentPage > 1 && (
                <button onClick={() => changePage(currentPage - 1)} className="page-num">
                  {currentPage - 1}
                </button>
              )}
              
              <button className="page-num active">{currentPage}</button>
              
              {currentPage < totalPages && (
                <button onClick={() => changePage(currentPage + 1)} className="page-num">
                  {currentPage + 1}
                </button>
              )}
              
              {currentPage < totalPages - 1 && (
                <>
                  {currentPage < totalPages - 2 && <span className="ellipsis">...</span>}
                  <button onClick={() => changePage(totalPages)} className="page-num">
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            
            <button 
              onClick={() => changePage(currentPage + 1)} 
              disabled={currentPage === totalPages}
              className="page-btn"
            >
              Next
            </button>
          </div>
          
          <div className="page-info">
            Page {currentPage} of {totalPages} • Showing {startIndex + 1}-{Math.min(endIndex, displayCoin.length)} of {displayCoin.length} coins
          </div>
        </div>
      )}
    </div>
  )

}
export default Home