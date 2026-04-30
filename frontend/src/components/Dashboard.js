import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = ({ marketData, signals, isLoading }) => {
  const [selectedPair, setSelectedPair] = useState(null);

  if (isLoading) {
    return (
      <section className="dashboard">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading market data...</p>
          </div>
        </div>
      </section>
    );
  }

  const handlePairClick = (pair) => {
    setSelectedPair(selectedPair?.symbol === pair.symbol ? null : pair);
  };

  return (
    <section className="dashboard">
      <div className="container">
        <h2 className="dashboard-title text-center neon-text mb-3">Trading Dashboard</h2>
        
        {/* Market Overview */}
        <div className="market-overview mb-3">
          <h3 className="section-title">Market Overview</h3>
          <div className="market-grid grid-3">
            {marketData?.pairs?.map((pair, index) => (
              <div 
                key={pair.symbol}
                className={`market-card card ${selectedPair?.symbol === pair.symbol ? 'selected' : ''}`}
                onClick={() => handlePairClick(pair)}
              >
                <div className="pair-header">
                  <h4 className="pair-symbol">{pair.symbol}</h4>
                  <div className={`pair-change ${pair.change >= 0 ? 'positive' : 'negative'}`}>
                    {pair.change >= 0 ? '+' : ''}{pair.changePercent.toFixed(2)}%
                  </div>
                </div>
                
                <div className="pair-price">
                  <span className="current-price">{pair.price.toFixed(5)}</span>
                  <span className="price-change">{pair.change >= 0 ? '▲' : '▼'} {Math.abs(pair.change).toFixed(5)}</span>
                </div>
                
                <div className="pair-details">
                  <div className="detail-row">
                    <span>Volume:</span>
                    <span>{(pair.volume / 1000000).toFixed(2)}M</span>
                  </div>
                  <div className="detail-row">
                    <span>High:</span>
                    <span>{pair.high.toFixed(5)}</span>
                  </div>
                  <div className="detail-row">
                    <span>Low:</span>
                    <span>{pair.low.toFixed(5)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trading Signals */}
        <div className="signals-section mb-3">
          <h3 className="section-title">AI Trading Signals</h3>
          <div className="signals-grid grid-2">
            {signals?.signals?.map((signal, index) => (
              <div key={signal.symbol} className={`signal-card card signal-${signal.signal.toLowerCase()}`}>
                <div className="signal-header">
                  <h4 className="signal-symbol">{signal.symbol}</h4>
                  <div className={`signal-badge signal-${signal.signal.toLowerCase()}`}>
                    {signal.signal}
                  </div>
                </div>
                
                <div className="signal-confidence">
                  <div className="confidence-bar">
                    <div 
                      className="confidence-fill" 
                      style={{ width: `${signal.confidence}%` }}
                    ></div>
                  </div>
                  <span className="confidence-text">Confidence: {signal.confidence}%</span>
                </div>
                
                <div className="signal-details">
                  <p className="signal-reason">{signal.reason}</p>
                  <div className="signal-indicators">
                    {signal.indicators?.rsi && (
                      <div className="indicator">
                        <span className="indicator-label">RSI:</span>
                        <span className="indicator-value">{signal.indicators.rsi}</span>
                      </div>
                    )}
                    {signal.indicators?.volatility && (
                      <div className="indicator">
                        <span className="indicator-label">Vol:</span>
                        <span className="indicator-value">{signal.indicators.volatility}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Pair View */}
        {selectedPair && (
          <div className="pair-detail card">
            <h3 className="detail-title">{selectedPair.symbol} - Detailed Analysis</h3>
            <div className="detail-grid grid-4">
              <div className="detail-item">
                <span className="detail-label">Current Price</span>
                <span className="detail-value">{selectedPair.price.toFixed(5)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">24h Change</span>
                <span className={`detail-value ${selectedPair.change >= 0 ? 'positive' : 'negative'}`}>
                  {selectedPair.change >= 0 ? '+' : ''}{selectedPair.changePercent.toFixed(2)}%
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Volume</span>
                <span className="detail-value">{(selectedPair.volume / 1000000).toFixed(2)}M</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Signal</span>
                <span className={`detail-value signal-${signals?.signals?.find(s => s.symbol === selectedPair.symbol)?.signal?.toLowerCase() || 'wait'}`}>
                  {signals?.signals?.find(s => s.symbol === selectedPair.symbol)?.signal || 'WAIT'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="summary-section">
          <div className="summary-grid grid-3">
            <div className="summary-card card">
              <h4>Market Status</h4>
              <div className="summary-value status-online">Active</div>
              <p>All systems operational</p>
            </div>
            <div className="summary-card card">
              <h4>Active Signals</h4>
              <div className="summary-value">
                {signals?.summary?.buy || 0} BUY / {signals?.summary?.sell || 0} SELL
              </div>
              <p>{signals?.summary?.wait || 0} pairs waiting</p>
            </div>
            <div className="summary-card card">
              <h4>Last Update</h4>
              <div className="summary-value">
                {new Date(signals?.timestamp || Date.now()).toLocaleTimeString()}
              </div>
              <p>Real-time data</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
