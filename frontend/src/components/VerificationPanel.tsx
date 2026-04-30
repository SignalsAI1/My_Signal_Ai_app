import React, { useState, useEffect } from 'react';
import './VerificationPanel.css';

interface VerificationPanelProps {
  userId: string;
  token: string;
  onVerificationComplete?: () => void;
}

const VerificationPanel: React.FC<VerificationPanelProps> = ({ 
  userId, 
  token, 
  onVerificationComplete 
}) => {
  const [brokerId, setBrokerId] = useState('');
  const [status, setStatus] = useState<'not_found' | 'pending' | 'approved' | 'rejected'>('not_found');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [showBrokerLink, setShowBrokerLink] = useState(true);

  // Check verification status on component mount
  useEffect(() => {
    checkVerificationStatus();
  }, []);

  // Set up periodic status check
  useEffect(() => {
    if (status === 'pending') {
      const interval = setInterval(checkVerificationStatus, 5000); // Check every 5 seconds
      return () => clearInterval(interval);
    }
  }, [status]);

  const checkVerificationStatus = async () => {
    try {
      const response = await fetch('/api/verify-status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data.status);
        setStatusMessage(data.message);
        
        if (data.status === 'approved' && onVerificationComplete) {
          onVerificationComplete();
        }
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    }
  };

  const handleSubmitVerification = async () => {
    if (!brokerId.trim()) {
      setError('Please enter your broker ID');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/verify-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ brokerId: brokerId.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus(data.status);
        setStatusMessage(data.message);
        setShowBrokerLink(false);
        
        if (data.status === 'approved' && onVerificationComplete) {
          onVerificationComplete();
        }
      } else {
        setError(data.error || data.message || 'Failed to submit verification');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrokerClick = () => {
    window.open('https://poaffiliate.onelink.me/t5P7/ktpknhar', '_blank');
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'approved':
        return '✅';
      case 'rejected':
        return '❌';
      default:
        return '🔐';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return '#ffaa00';
      case 'approved':
        return '#00ff88';
      case 'rejected':
        return '#ff4444';
      default:
        return '#00d4ff';
    }
  };

  if (status === 'approved') {
    return (
      <div className="verification-panel approved">
        <div className="verification-header">
          <h3>✅ Access Activated</h3>
          <p>Your account has been verified and you now have full access to trading signals.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="verification-panel">
      <div className="verification-header">
        <h3>🔐 Access Verification</h3>
        <p>Verify your broker account to unlock trading signals</p>
      </div>

      {showBrokerLink && (
        <div className="broker-step">
          <h4>Step 1: Register with Broker</h4>
          <div className="broker-info">
            <div className="promo-section">
              <div className="promo-code">
                <span className="promo-label">🎁 Promocode:</span>
                <span className="promo-value">LRQ740</span>
              </div>
              <div className="bonus-info">
                <span className="bonus-icon">💸</span>
                <span className="bonus-text">Bonus +60% to deposit</span>
              </div>
            </div>
            <button 
              className="broker-link-btn" 
              onClick={handleBrokerClick}
            >
              Go to Broker
            </button>
          </div>
        </div>
      )}

      <div className="verification-step">
        <h4>Step 2: Enter Your Broker ID</h4>
        <div className="input-section">
          <input
            type="text"
            value={brokerId}
            onChange={(e) => setBrokerId(e.target.value)}
            placeholder="Enter your broker ID"
            className="broker-id-input"
            disabled={status === 'pending' || isLoading}
          />
          <button
            className="submit-btn"
            onClick={handleSubmitVerification}
            disabled={status === 'pending' || isLoading || !brokerId.trim()}
          >
            {isLoading ? 'Submitting...' : 'Verify'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {status !== 'not_found' && (
        <div className="status-section">
          <h4>Verification Status</h4>
          <div 
            className="status-display"
            style={{ color: getStatusColor() }}
          >
            <span className="status-icon">{getStatusIcon()}</span>
            <span className="status-text">{statusMessage}</span>
          </div>
          {status === 'pending' && (
            <p className="status-note">
              Your verification is being reviewed. This usually takes a few minutes.
            </p>
          )}
        </div>
      )}

      <div className="help-section">
        <h4>Need Help?</h4>
        <ul>
          <li>Your broker ID can be found in your broker account dashboard</li>
          <li>Typical formats: ABC123456 or 12345678</li>
          <li>Contact support if you need assistance with verification</li>
        </ul>
      </div>
    </div>
  );
};

export default VerificationPanel;
