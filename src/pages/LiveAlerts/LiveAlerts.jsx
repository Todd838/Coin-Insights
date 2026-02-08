import React, { useState, useEffect } from 'react';
import './LiveAlerts.css';

const LiveAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [ws, setWs] = useState(null);
  const [activeAnimation, setActiveAnimation] = useState(null);

  useEffect(() => {
    let socket = null;
    let reconnectTimeout = null;

    const connectWebSocket = () => {
      console.log('🔌 Attempting to connect to ws://localhost:3001...');
      socket = new WebSocket('ws://localhost:3001');
      
      socket.onopen = () => {
        console.log('✅ WebSocket connected to Node gateway');
        setWs(socket);
      };
      
      socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        
        if (msg.type === 'alerts' && msg.alerts) {
          console.log('🚨 Received alerts:', msg.alerts);
          
          // Add timestamps and merge with existing alerts
          const newAlerts = msg.alerts.map(alert => ({
            ...alert,
            timestamp: Date.now(),
            id: `${alert.symbol}-${Date.now()}-${Math.random()}`
          }));
          
          // Trigger animation for the first new alert
          if (newAlerts.length > 0) {
            const firstAlert = newAlerts[0];
            setActiveAnimation(firstAlert.level);
            setTimeout(() => setActiveAnimation(null), 3000); // Clear after 3 seconds
          }
          
          setAlerts(prev => {
            // Keep last 200 alerts
            const combined = [...newAlerts, ...prev].slice(0, 200);
            return combined;
          });
        }
      };
      
      socket.onclose = (event) => {
        console.log('⚠️ WebSocket closed. Code:', event.code, 'Reason:', event.reason);
        setWs(null);
        reconnectTimeout = setTimeout(() => {
          console.log('🔄 Attempting to reconnect...');
          connectWebSocket();
        }, 2000);
      };
      
      socket.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setWs(null);
      };
    };

    connectWebSocket();
    
    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  const explosiveAlerts = alerts.filter(a => a.level === 'EXPLOSIVE').slice(0, 50);
  const hotAlerts = alerts.filter(a => a.level === 'HOT').slice(0, 50);
  const lowAlerts = alerts.filter(a => a.level === 'LOW').slice(0, 50);
  const stagnantAlerts = alerts.filter(a => a.level === 'STAGNANT').slice(0, 50);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="live-alerts">
      {/* Full-screen animations */}
      {activeAnimation === 'EXPLOSIVE' && (
        <div className="animation-overlay fire-animation">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="fire-particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random()}s`
            }}>🔥</div>
          ))}
        </div>
      )}
      
      {activeAnimation === 'HOT' && (
        <div className="animation-overlay thunder-animation">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="lightning-bolt" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 0.5}s`
            }}>⚡</div>
          ))}
        </div>
      )}
      
      {activeAnimation === 'LOW' && (
        <div className="animation-overlay arrows-animation">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="falling-arrow" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 1}s`,
              animationDuration: `${2 + Math.random()}s`
            }}>🔻</div>
          ))}
        </div>
      )}
      
      {activeAnimation === 'STAGNANT' && (
        <div className="animation-overlay zs-animation">
          {[...Array(25)].map((_, i) => (
            <div key={i} className="floating-z" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
              fontSize: `${20 + Math.random() * 30}px`
            }}>💤</div>
          ))}
        </div>
      )}

      <div className="alerts-header">
        <h1>🚨 Live Volatility Alerts</h1>
        <p className="subtitle">Real-time alerts organized by type - Animations trigger on new alerts!</p>
        <div className="connection-status">
          <span>WebSocket: {ws && ws.readyState === WebSocket.OPEN ? '✅ Connected' : '⚠️ Disconnected'}</span>
          <span>Total Alerts: {alerts.length}</span>
        </div>
      </div>

      <div className="alerts-sections">
          {/* Explosive Section */}
          <div className="alert-section explosive-section">
            <div className="section-header explosive">
              <h2>🔥 EXPLOSIVE</h2>
              <span className="count">{explosiveAlerts.length}</span>
              <p>≥0.8% volatility - Expected to go UP</p>
            </div>
            <div className="section-alerts">
              {explosiveAlerts.map(alert => (
                <div key={alert.id} className="alert-item explosive">
                  <div className="alert-symbol">{alert.symbol}</div>
                  <div className="alert-details">
                    <span className="vol">{alert.vol5m}%</span>
                    <span className="time">{formatTime(alert.timestamp)}</span>
                  </div>
                </div>
              ))}
              {explosiveAlerts.length === 0 && (
                <div className="empty-section">No explosive alerts yet</div>
              )}
            </div>
          </div>

          {/* Hot Section */}
          <div className="alert-section hot-section">
            <div className="section-header hot">
              <h2>⚡ HOT</h2>
              <span className="count">{hotAlerts.length}</span>
              <p>≥0.3% volatility - Expected to go UP</p>
            </div>
            <div className="section-alerts">
              {hotAlerts.map(alert => (
                <div key={alert.id} className="alert-item hot">
                  <div className="alert-symbol">{alert.symbol}</div>
                  <div className="alert-details">
                    <span className="vol">{alert.vol5m}%</span>
                    <span className="time">{formatTime(alert.timestamp)}</span>
                  </div>
                </div>
              ))}
              {hotAlerts.length === 0 && (
                <div className="empty-section">No hot alerts yet</div>
              )}
            </div>
          </div>

          {/* Low Section */}
          <div className="alert-section low-section">
            <div className="section-header low">
              <h2>📉 LOW</h2>
              <span className="count">{lowAlerts.length}</span>
              <p>&lt;0.1% volatility - Stable/Going DOWN</p>
            </div>
            <div className="section-alerts">
              {lowAlerts.map(alert => (
                <div key={alert.id} className="alert-item low">
                  <div className="alert-symbol">{alert.symbol}</div>
                  <div className="alert-details">
                    <span className="vol">{alert.vol5m}%</span>
                    <span className="time">{formatTime(alert.timestamp)}</span>
                  </div>
                </div>
              ))}
              {lowAlerts.length === 0 && (
                <div className="empty-section">No low alerts yet</div>
              )}
            </div>
          </div>

          {/* Stagnant Section */}
          <div className="alert-section stagnant-section">
            <div className="section-header stagnant">
              <h2>💤 STAGNANT</h2>
              <span className="count">{stagnantAlerts.length}</span>
              <p>&lt;0.05% range - No movement</p>
            </div>
            <div className="section-alerts">
              {stagnantAlerts.map(alert => (
                <div key={alert.id} className="alert-item stagnant">
                  <div className="alert-symbol">{alert.symbol}</div>
                  <div className="alert-details">
                    <span className="vol">{alert.vol5m}%</span>
                    <span className="time">{formatTime(alert.timestamp)}</span>
                  </div>
                </div>
              ))}
              {stagnantAlerts.length === 0 && (
                <div className="empty-section">No stagnant alerts yet</div>
              )}
            </div>
          </div>
        </div>

      {alerts.length === 0 && (
        <div className="no-alerts">
          <h2>No alerts yet...</h2>
          <p>Waiting for volatile price movements. This can take 5-10 minutes after startup.</p>
          <div className="waiting-animation">
            <div className="pulse"></div>
            <span>Monitoring {ws && ws.readyState === WebSocket.OPEN ? '✅' : '⚠️'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveAlerts;
