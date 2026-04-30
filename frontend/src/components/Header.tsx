import React from 'react';

const Header: React.FC = () => {
  const handleLiveSignal = () => {
    // Trigger signal generation from parent component
    window.dispatchEvent(new CustomEvent('requestLiveSignal'));
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-section">
          <h1 className="app-title">My AI Signal</h1>
          <div className="online-indicator">
            <div className="blinking-dot"></div>
            <span>Online</span>
          </div>
        </div>
        <button className="live-signal-btn" onClick={handleLiveSignal}>
          <span className="pulse-dot"></span>
          LIVE SIGNAL
        </button>
      </div>
    </header>
  );
};

export default Header;
