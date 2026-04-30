import React from 'react';
import { Signal } from '../types/signal';

interface SignalPanelProps {
  signal: Signal | null;
}

const SignalPanel: React.FC<SignalPanelProps> = ({ signal }) => {
  if (!signal) {
    return (
      <div className="signal-panel">
        <h3>Current Signal</h3>
        <p>No active signal. Click "GET LIVE SIGNAL" to generate a new trading signal.</p>
      </div>
    );
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY': return '#00ff88';
      case 'SELL': return '#ff4444';
      default: return '#ffaa00';
    }
  };

  return (
    <div className="signal-panel">
      <h3>Current Signal</h3>
      <div className="signal-content">
        <div className="signal-main">
          <span 
            className="signal-action" 
            style={{ color: getActionColor(signal.action) }}
          >
            {signal.action}
          </span>
          <span className="signal-symbol">{signal.symbol}</span>
          <span className="signal-confidence">{signal.confidence}% confidence</span>
        </div>
        
        <div className="signal-details">
          <div className="signal-price">
            <span>Entry Price:</span>
            <span>${signal.price.toFixed(5)}</span>
          </div>
          
          {signal.takeProfit && (
            <div className="signal-target">
              <span>Take Profit:</span>
              <span>${signal.takeProfit.toFixed(5)}</span>
            </div>
          )}
          
          {signal.stopLoss && (
            <div className="signal-stop">
              <span>Stop Loss:</span>
              <span>${signal.stopLoss.toFixed(5)}</span>
            </div>
          )}
          
          <div className="signal-timeframe">
            <span>Timeframe:</span>
            <span>{signal.timeFrame}</span>
          </div>
        </div>
        
        <div className="signal-reason">
          <h4>Analysis Reason:</h4>
          <p>{signal.reason}</p>
        </div>
        
        <div className="signal-timestamp">
          Generated: {new Date(signal.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default SignalPanel;
