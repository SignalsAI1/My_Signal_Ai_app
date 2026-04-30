import React from 'react';
import { MarketData } from '../types/market';
import { Signal } from '../types/signal';
import './Dashboard.css';

interface DashboardProps {
  marketData: MarketData[];
  isLoading: boolean;
  currentSignal: Signal | null;
}

const Dashboard: React.FC<DashboardProps> = ({ marketData, isLoading, currentSignal }) => {
  if (isLoading) {
    return (
      <div className="dashboard">
        <div className="loading-spinner"></div>
        <p>Loading market data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="market-grid">
        {marketData.map((pair) => (
          <div key={pair.symbol} className="market-card">
            <div className="pair-header">
              <h3 className="pair-symbol">{pair.symbol}</h3>
              <span className={`change ${pair.change >= 0 ? 'positive' : 'negative'}`}>
                {pair.change >= 0 ? '+' : ''}{pair.changePercent.toFixed(2)}%
              </span>
            </div>
            <div className="price-info">
              <span className="current-price">${pair.price.toFixed(5)}</span>
              <div className="price-range">
                <span>H: ${pair.high.toFixed(5)}</span>
                <span>L: ${pair.low.toFixed(5)}</span>
              </div>
            </div>
            {currentSignal && currentSignal.symbol === pair.symbol && (
              <div className={`signal-badge ${currentSignal.action.toLowerCase()}`}>
                {currentSignal.action}
                <span className="confidence">{currentSignal.confidence}%</span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="chart-container">
        <div className="chart-placeholder">
          <h3>Live Chart</h3>
          <p>Chart will be implemented with Lightweight Charts</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
