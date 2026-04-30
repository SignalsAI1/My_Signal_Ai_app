import React, { useState, useEffect } from 'react';
import './Header.css';

const Header = ({ marketStatus }) => {
  const [liveIndicator, setLiveIndicator] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveIndicator(prev => !prev);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="header glass neon-glow">
      <div className="container">
        <div className="header-content flex-between">
          <div className="logo-section">
            <h1 className="logo neon-text">My Ai Signal</h1>
          </div>
          
          <div className="status-section flex">
            <div className="status-indicator">
              <div className={`live-dot ${liveIndicator ? 'live' : ''}`}></div>
              <span className="live-text">LIVE</span>
            </div>
            
            <div className="status-indicator">
              <div className={`market-dot ${marketStatus}`}></div>
              <span className={`market-text status-${marketStatus}`}>
                Market {marketStatus === 'online' ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
