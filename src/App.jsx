import React, { useEffect, useState } from 'react';
import NavBar from './components/NavBar/NavBar';
import {Routes, Route, useLocation} from 'react-router-dom';
import Landing from './pages/Landing/Landing';
import Home from './pages/Home/Home';
import Coin from './pages/Coin/Coin';
import Footer from './components/Footer/Footer';
import SignUp from './pages/SignUp/SignUp';
import ChooseName from './pages/SignUp/ChooseName';
import Discovered from './pages/Discovered/Discovered';
import CoinBase from './pages/CoinBase/CoinBase';
import LiveAlerts from './pages/LiveAlerts/LiveAlerts';
import Watchlist from './pages/Watchlist/Watchlist';
import Profile from './pages/Profile/Profile';
import CoinSelection from './pages/CoinSelection/CoinSelection';
import Blog from './pages/Blog/Blog';
import Auth from './pages/Auth/Auth';
import GoBack from './components/GoBack/GoBack';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

const App = () => {
  const [userName, setUserName] = useState('');
  const location = useLocation();
  
  // Check if we're on landing, auth, or coin-selection page (no navbar/goback)
  const hideNavbar = location.pathname === '/' || location.pathname === '/auth' || location.pathname === '/coin-selection';
  const showGoBack = !hideNavbar;

  // Persist authentication state across refreshes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || user.email.split('@')[0]);
      } else {
        setUserName('');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const updateBackground = () => {
      const hour = new Date().getHours();
      let bg = '';
      if (hour >= 6 && hour < 12) {
        // Morning: Bold pink-orange sunrise
        bg = 'linear-gradient(#fa709a, #fee140)';
      } else if (hour >= 12 && hour < 17) {
        // Afternoon: Cyan to deep blue
        bg = 'linear-gradient(#30cfd0, #330867)';
      } else if (hour >= 17 && hour < 20) {
        // Evening: Coral sunset to twilight
        bg = 'linear-gradient(#ff6e7f, #bfe9ff)';
      } else {
        // Night: Deep dark purple
        bg = 'linear-gradient(#0b0614, #141026 45%, #1e1a36 100%)';
      }
      document.body.style.background = bg;
    };

    // Update immediately on mount
    updateBackground();
    
    // Update every minute to catch time changes
    const interval = setInterval(updateBackground, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='app'>
      {!hideNavbar && <NavBar userName={userName}/>}
      {showGoBack && <GoBack />}
      <Routes>
        <Route path='/' element={<Landing/>}/>
        <Route path='/auth' element={<Auth/>}/>
        <Route path='/coin-selection' element={<CoinSelection/>}/>
        <Route path='/blog' element={<Blog/>}/>
        <Route path='/coingecko' element={<Home/>}/>
        <Route path='/coin/:coinId' element={<Coin/>}/>
        <Route path='/discovered' element={<Discovered/>}/>
        <Route path='/watchlist' element={<Watchlist/>}/>
        <Route path='/live-alerts' element={<LiveAlerts/>}/>
        <Route path='/coinbase-listings' element={<CoinBase/>}/>
        <Route path='/binance-listings' element={<CoinBase/>}/>
        <Route path='/profile' element={<Profile/>}/>
        <Route path='/signup' element={<SignUp setUserName={setUserName}/>}/>
        <Route path='/choose-name' element={<ChooseName setUserName={setUserName}/>}/>
      </Routes>
      <Footer/>
    </div>
  );
}

export default App;