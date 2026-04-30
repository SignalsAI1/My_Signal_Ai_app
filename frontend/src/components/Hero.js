import React, { useState, useEffect } from 'react';
import './Hero.css';

const Hero = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-text text-center fade-in">
          <h2 className="hero-title neon-text">
            AI-Powered Trading Signals
          </h2>
          <p className="hero-subtitle">
            Real-time Forex market analysis with advanced technical indicators
          </p>
          <div className="hero-features">
            <div className="feature">
              <span className="feature-icon">🤖</span>
              <span>AI Analysis</span>
            </div>
            <div className="feature">
              <span className="feature-icon">📊</span>
              <span>Real-time Data</span>
            </div>
            <div className="feature">
              <span className="feature-icon">⚡</span>
              <span>Instant Signals</span>
            </div>
          </div>
        </div>
        
        <div className="hero-cta text-center">
          <button className="btn btn-primary pulse-glow hero-btn">
            Get Trading Signal
          </button>
        </div>
      </div>
      
      <div 
        className="glow-orb" 
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`
        }}
      />
    </section>
  );
};

export default Hero;
