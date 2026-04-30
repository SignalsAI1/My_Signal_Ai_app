import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Header from './components/Header';
import Hero from './components/Hero';
import Dashboard from './components/Dashboard';
import VerifyUI from './components/VerifyUI';
import './styles/App.css';

function App() {
  const [userStatus, setUserStatus] = useState('pending');
  const [userId, setUserId] = useState('');
  const [marketData, setMarketData] = useState(null);
  const [signals, setSignals] = useState(null);
  const [ws, setWs] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showVerify, setShowVerify] = useState(false);

  // WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    const websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
      console.log('WebSocket connected');
      setWs(websocket);
    };
    
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'market_update') {
        setMarketData(data.data);
        setSignals(data.signals);
        setIsLoading(false);
      }
    };
    
    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      setTimeout(() => {
        // Attempt to reconnect
        const newWs = new WebSocket(wsUrl);
        setWs(newWs);
      }, 3000);
    };
    
    return () => {
      websocket.close();
    };
  }, []);

  // Check user verification status
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const storedStatus = localStorage.getItem('userStatus');
    
    if (storedUserId) {
      setUserId(storedUserId);
      setUserStatus(storedStatus || 'pending');
      
      // Check verification status
      if (storedStatus !== 'approved') {
        checkVerificationStatus(storedUserId);
      }
    } else {
      // Generate new user ID
      const newUserId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      setUserId(newUserId);
      localStorage.setItem('userId', newUserId);
      localStorage.setItem('userStatus', 'pending');
    }
  }, []);

  const checkVerificationStatus = async (uid) => {
    try {
      const response = await axios.get(`/api/verify-status/${uid}`);
      const status = response.data.status;
      setUserStatus(status);
      localStorage.setItem('userStatus', status);
      
      if (status === 'approved') {
        setShowVerify(false);
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    }
  };

  const handleVerification = async (promoCode) => {
    try {
      const response = await axios.post('/api/verify-id', {
        userId,
        promoCode
      });
      
      if (response.data.id) {
        // Start polling for status
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await axios.get(`/api/verify-status/${response.data.id}`);
            const status = statusResponse.data.status;
            setUserStatus(status);
            localStorage.setItem('userStatus', status);
            
            if (status === 'approved') {
              clearInterval(pollInterval);
              setShowVerify(false);
            }
          } catch (error) {
            console.error('Error polling status:', error);
          }
        }, 5000);
        
        // Stop polling after 5 minutes
        setTimeout(() => clearInterval(pollInterval), 300000);
      }
    } catch (error) {
      console.error('Error submitting verification:', error);
    }
  };

  return (
    <div className="app">
      <Header marketStatus={marketData ? 'online' : 'offline'} />
      
      {userStatus !== 'approved' ? (
        <VerifyUI 
          onVerify={handleVerification}
          status={userStatus}
          userId={userId}
        />
      ) : (
        <>
          <Hero />
          <Dashboard 
            marketData={marketData}
            signals={signals}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
}

export default App;
