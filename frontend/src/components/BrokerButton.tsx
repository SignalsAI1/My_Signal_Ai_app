import React from 'react';

const BrokerButton: React.FC = () => {
  const handleBrokerClick = () => {
    window.open('https://poaffiliate.onelink.me/t5P7/ktpknhar', '_blank');
  };

  return (
    <div className="broker-section">
      <h3>Start Trading</h3>
      <div className="broker-info">
        <div className="promo-code">
          <span className="promo-label">Promo Code:</span>
          <span className="promo-value">LRQ740</span>
        </div>
        <div className="bonus-info">
          <span className="bonus-icon">+</span>
          <span className="bonus-text">60% bonus to deposit</span>
        </div>
      </div>
      <button className="broker-btn" onClick={handleBrokerClick}>
        <span className="btn-icon">broker</span>
        <span className="btn-text">Go to Broker</span>
      </button>
    </div>
  );
};

export default BrokerButton;
