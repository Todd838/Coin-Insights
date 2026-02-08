import React, { useEffect, useState } from 'react';
import NavBar from './components/NavBar/NavBar';
import {Routes, Route} from 'react-router-dom';
import Home from './pages/Home/Home';
import Coin from './pages/Coin/Coin';
import Footer from './components/Footer/Footer';
import SignUp from './pages/SignUp/SignUp';
import ChooseName from './pages/SignUp/ChooseName';
import Discovered from './pages/Discovered/Discovered';
import CoinBase from './pages/CoinBase/CoinBase';
import LiveAlerts from './pages/LiveAlerts/LiveAlerts';
import Profile from './pages/Profile/Profile';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

const App = () => {
  const [userName, setUserName] = useState('');

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
    const hour = new Date().getHours();
    let bg = '';
    if (hour >= 6 && hour < 12) {
      bg = 'linear-gradient(#87ceeb, #b3e0ff)';
    } else if (hour >= 12 && hour < 17) {
      bg = 'linear-gradient(#aef6f6, #e0ffff)';
    } else if (hour >= 17 && hour < 20) {
      bg = 'linear-gradient(#5f2c82, #49a09d)';
    } else {
      bg = 'linear-gradient(#0b0614, #141026 45%, #1e1a36 100%)';
    }
    document.body.style.background = bg;
  }, []);

  return (
    <div className='app'>
      <NavBar userName={userName}/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/coin/:coinId' element={<Coin/>}/>
        <Route path='/discovered' element={<Discovered/>}/>
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