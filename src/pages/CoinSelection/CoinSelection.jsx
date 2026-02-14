import React, { useState } from 'react';
import './CoinSelection.css';
import { useNavigate } from 'react-router-dom';

const CoinSelection = () => {
  const navigate = useNavigate();
  const [hoveredSection, setHoveredSection] = useState(null);

  const sections = [
    { id: 'watchlist', name: 'My Watchlist', path: '/home' },
    { id: 'discoveries', name: 'New Discoveries', path: '/discovered' },
    { id: 'coinbase', name: 'Coinbase Listings', path: '/coinbase' },
    { id: 'live-alerts', name: 'Live Alerts', path: '/live-alerts' }
  ];

  return (
    <div className="coin-selection">
      <h1 className="selection-title">Select Your Crypto View</h1>
      <div className="selection-grid">
        {sections.map(section => (
          <div
            key={section.id}
            className={`selection-card ${hoveredSection === section.id ? 'hovered' : ''}`}
            onMouseEnter={() => setHoveredSection(section.id)}
            onMouseLeave={() => setHoveredSection(null)}
            onClick={() => navigate(section.path)}
          >
            <h2>{section.name}</h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoinSelection;
