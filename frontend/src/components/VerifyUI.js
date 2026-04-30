import React, { useState } from 'react';
import './VerifyUI.css';

const VerifyUI = ({ onVerify, status, userId }) => {
  const [promoCode, setPromoCode] = useState('LRQ740');
  const [isLoading, setIsLoading] = useState(false);
  const [affiliateId, setAffiliateId] = useState('ktpknhar');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onVerify(promoCode);
    } catch (error) {
      console.error('Verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'pending':
        return 'Your verification is pending approval. Please wait.';
      case 'approved':
        return '✅ Verification approved! You now have access to trading signals.';
      case 'rejected':
        return '❌ Verification rejected. Please contact support.';
      default:
        return 'Complete verification to access AI trading signals.';
    }
  };

  const getStatusClass = () => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-default';
    }
  };

  return (
    <section className="verify-ui">
      <div className="container">
        <div className="verify-card card">
          <div className="verify-header">
            <h2 className="verify-title neon-text">Account Verification</h2>
            <p className="verify-subtitle">
              Verify your account to access AI-powered trading signals
            </p>
          </div>

          <div className={`verify-status ${getStatusClass()}`}>
            <div className="status-icon">
              {status === 'approved' && '✅'}
              {status === 'rejected' && '❌'}
              {status === 'pending' && '⏳'}
              {!status && '🔒'}
            </div>
            <p className="status-message">{getStatusMessage()}</p>
          </div>

          {status !== 'approved' && (
            <div className="verify-content">
              <div className="affiliate-section">
                <h3>🎁 Special Offer - Get Started!</h3>
                <div className="promo-details">
                  <div className="promo-code">
                    <span className="promo-label">Promo Code:</span>
                    <span className="promo-value">{promoCode}</span>
                  </div>
                  <div className="promo-bonus">
                    <span className="bonus-text">💸 Bonus +60%</span>
                  </div>
                </div>
              </div>

              <div className="verify-steps">
                <h4>How to Verify:</h4>
                <div className="step-list">
                  <div className="step">
                    <span className="step-number">1</span>
                    <span className="step-text">Click the affiliate link below</span>
                  </div>
                  <div className="step">
                    <span className="step-number">2</span>
                    <span className="step-text">Complete registration</span>
                  </div>
                  <div className="step">
                    <span className="step-number">3</span>
                    <span className="step-text">Return and submit your ID</span>
                  </div>
                </div>
              </div>

              <div className="affiliate-link">
                <a 
                  href={`https://poaffiliate.onelink.me/t5P7/${affiliateId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="affiliate-btn btn btn-primary pulse-glow"
                >
                  🔗 Open Registration Link
                </a>
              </div>

              <form onSubmit={handleSubmit} className="verify-form">
                <div className="form-group">
                  <label htmlFor="promoCode">Promo Code</label>
                  <input
                    type="text"
                    id="promoCode"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="form-input"
                    placeholder="Enter promo code"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="userId">Your User ID</label>
                  <input
                    type="text"
                    id="userId"
                    value={userId}
                    readOnly
                    className="form-input readonly"
                    placeholder="User ID"
                  />
                </div>

                <button
                  type="submit"
                  className="verify-btn btn btn-success"
                  disabled={isLoading || status === 'pending'}
                >
                  {isLoading ? 'Submitting...' : 'Submit Verification'}
                </button>
              </form>
            </div>
          )}

          {status === 'approved' && (
            <div className="success-content">
              <div className="success-message">
                <h3>🎉 Welcome to My Ai Signal!</h3>
                <p>You now have full access to our AI-powered trading signals.</p>
                <button 
                  className="continue-btn btn btn-primary pulse-glow"
                  onClick={() => window.location.reload()}
                >
                  Continue to Dashboard
                </button>
              </div>
            </div>
          )}

          <div className="verify-footer">
            <p className="footer-text">
              Need help? Contact support at support@myaisignal.com
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VerifyUI;
