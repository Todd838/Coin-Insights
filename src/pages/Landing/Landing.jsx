import React, { useEffect, useState } from 'react';
import './Landing.css';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Landing = () => {
  const navigate = useNavigate();
  const [buildings, setBuildings] = useState([]);
  const [cars, setCars] = useState([]);
  const [stars, setStars] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Generate animations on mount
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

  // Check if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = () => {
    navigate('/auth?mode=signin');
  };

  const handleSignUp = () => {
    navigate('/auth?mode=signup');
  };

  const handleExplorePrices = () => {
    if (isLoggedIn) {
      navigate('/coinbase-listings');
    } else {
      // Redirect to auth page if not logged in
      navigate('/auth?mode=signup');
    }
  };

  const handleLearnMore = () => {
    navigate('/blog');
  };

  return (
    <div className="landing">
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

      {/* Auth Buttons (Top Right) - Only show when not logged in */}
      {!isLoggedIn && (
        <div className="auth-buttons">
          <button className="sign-in-btn" onClick={handleSignIn}>
            Sign In
          </button>
          <button className="sign-up-btn" onClick={handleSignUp}>
            Sign Up
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="content">
        <div className="hero">
          <h1 className="logo">COIN INSIGHTS</h1>
          <p className="tagline">Navigate the Future of Cryptocurrency</p>
          <p className="description">
            Real-time price tracking, market analysis, and intelligent insights 
            powered by cutting-edge technology. Stay ahead in the crypto revolution 
            with live data from 100+ cryptocurrencies.
          </p>

          <div className="cta-container">
            <button onClick={handleExplorePrices} className="btn btn-primary">
              Explore Live Prices
            </button>
            <button onClick={handleLearnMore} className="btn btn-secondary">
              Learn More
            </button>
          </div>

          <div className="stats-preview">
            <div className="stat-card" style={{animationDelay: '0s'}}>
              <div className="stat-label">Cryptocurrencies</div>
              <div className="stat-value">100+</div>
            </div>
            <div className="stat-card" style={{animationDelay: '0.2s'}}>
              <div className="stat-label">Live Updates</div>
              <div className="stat-value">Real-Time</div>
            </div>
            <div className="stat-card" style={{animationDelay: '0.4s'}}>
              <div className="stat-label">Market Data</div>
              <div className="stat-value">24/7</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
