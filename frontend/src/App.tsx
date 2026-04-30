import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import SignalPanel from './components/SignalPanel';
import BrokerButton from './components/BrokerButton';
import VerificationPanel from './components/VerificationPanel';
import { MarketData } from './types/market';
import { Signal } from './types/signal';

function App() {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [currentSignal, setCurrentSignal] = useState<Signal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Initialize user session
    initializeUser();
  }, []);

  useEffect(() => {
    if (userId && token) {
      // Fetch initial data
      fetchMarketData();
      
      // Set up real-time updates
      const interval = setInterval(fetchMarketData, 2000);
      
      return () => clearInterval(interval);
    }
  }, [userId, token]);

  const initializeUser = async () => {
    try {
      // Try to get existing user session
      const storedUserId = localStorage.getItem('userId');
      const storedToken = localStorage.getItem('token');

      if (storedUserId && storedToken) {
        setUserId(storedUserId);
        setToken(storedToken);
        
        // Check verification status
        checkVerificationStatus(storedToken);
      } else {
        // Register new user (for web version)
        await registerUser();
      }
    } catch (error) {
      console.error('Error initializing user:', error);
    }
  };

  const registerUser = async () => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegramId: 'web_' + Math.random().toString(36).substr(2, 9),
          username: 'webuser',
          firstName: 'Web',
          lastName: 'User'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setUserId(data.userId);
        setToken(data.token);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('token', data.token);
      }
    } catch (error) {
      console.error('Error registering user:', error);
    }
  };

  const checkVerificationStatus = async (userToken: string) => {
    try {
      const response = await fetch('/api/verify-status', {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsVerified(data.status === 'approved');
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    }
  };

  const fetchMarketData = async () => {
    try {
      const response = await fetch('/api/market');
      const data = await response.json();
      setMarketData(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching market data:', error);
      setIsLoading(false);
    }
  };

  const fetchSignal = async () => {
    if (!token) {
      console.error('No token available');
      return;
    }

    try {
      const response = await fetch('/api/signal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ symbol: 'EUR/USD' })
      });

      if (response.ok) {
        const signal = await response.json();
        setCurrentSignal(signal);
      } else {
        const errorData = await response.json();
        console.error('Signal fetch error:', errorData);
        if (errorData.verificationRequired) {
          setIsVerified(false);
        }
      }
    } catch (error) {
      console.error('Error fetching signal:', error);
    }
  };

  const handleVerificationComplete = () => {
    setIsVerified(true);
  };

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        {!isVerified && userId && token && (
          <VerificationPanel 
            userId={userId} 
            token={token} 
            onVerificationComplete={handleVerificationComplete}
          />
        )}
        
        <div className="hero-section">
          <h1 className="hero-title">AI Trading Signals</h1>
          <p className="hero-subtitle">Real-time Forex analysis with AI-powered predictions</p>
          <button 
            className="live-signal-btn" 
            onClick={fetchSignal}
            disabled={!isVerified}
          >
            <span className="pulse-dot"></span>
            GET LIVE SIGNAL
          </button>
        </div>
        
        {isVerified && (
          <>
            <Dashboard 
              marketData={marketData} 
              isLoading={isLoading}
              currentSignal={currentSignal}
            />
            
            <SignalPanel signal={currentSignal} />
          </>
        )}
        
        <BrokerButton />
      </main>
    </div>
  );
}

export default App;
