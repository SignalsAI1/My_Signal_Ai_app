// Shared utilities for frontend and backend

// Utility functions
const utils = {
  // Format currency price
  formatPrice(price, decimals = 5) {
    if (typeof price !== 'number') return '0.00000';
    return price.toFixed(decimals);
  },

  // Format percentage
  formatPercent(value, decimals = 2) {
    if (typeof value !== 'number') return '0.00%';
    return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
  },

  // Format date/time
  formatDateTime(dateString, locale = 'en-US') {
    const date = new Date(dateString);
    return date.toLocaleString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  },

  // Format time only
  formatTime(dateString, locale = 'en-US') {
    const date = new Date(dateString);
    return date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  },

  // Generate unique ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Debounce function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Deep clone object
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    if (typeof obj === 'object') {
      const clonedObj = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = this.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
  },

  // Calculate moving average
  calculateMovingAverage(data, period) {
    if (data.length < period) return null;
    const sum = data.slice(-period).reduce((acc, val) => acc + val, 0);
    return sum / period;
  },

  // Calculate percentage change
  calculatePercentageChange(oldValue, newValue) {
    if (oldValue === 0) return 0;
    return ((newValue - oldValue) / oldValue) * 100;
  },

  // Validate currency pair
  isValidCurrencyPair(symbol) {
    const validPairs = [
      'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 
      'AUD/USD', 'USD/CAD', 'NZD/USD', 'USD/PLN',
      'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'EUR/CHF'
    ];
    return validPairs.includes(symbol);
  },

  // Sanitize user input
  sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input.replace(/[^a-zA-Z0-9\s\-_.,@]/g, '').trim();
  },

  // Check if value is number
  isNumber(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  },

  // Round to specified decimals
  roundToDecimals(value, decimals) {
    const multiplier = Math.pow(10, decimals);
    return Math.round(value * multiplier) / multiplier;
  },

  // Get color based on value
  getColorForValue(value, positiveColor = '#00ff88', negativeColor = '#ff4444', neutralColor = '#ffaa00') {
    if (value > 0) return positiveColor;
    if (value < 0) return negativeColor;
    return neutralColor;
  },

  // Get signal action color
  getSignalActionColor(action) {
    const colors = {
      'BUY': '#00ff88',
      'SELL': '#ff4444',
      'WAIT': '#ffaa00'
    };
    return colors[action] || neutralColor;
  },

  // Validate email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Format large numbers
  formatLargeNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  },

  // Get time ago string
  getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)} days ago`;
    return `${Math.floor(seconds / 2592000)} months ago`;
  },

  // Calculate risk/reward ratio
  calculateRiskRewardRatio(entryPrice, stopLoss, takeProfit) {
    const risk = Math.abs(entryPrice - stopLoss);
    const reward = Math.abs(takeProfit - entryPrice);
    if (risk === 0) return 0;
    return reward / risk;
  },

  // Get market session
  getMarketSession() {
    const now = new Date();
    const hour = now.getUTCHours();
    
    // Major forex market sessions
    if (hour >= 0 && hour < 6) return 'Sydney';
    if (hour >= 6 && hour < 13) return 'Tokyo';
    if (hour >= 13 && hour < 17) return 'London';
    if (hour >= 17 && hour < 22) return 'New York';
    return 'Weekend';
  },

  // Check if market is open
  isMarketOpen() {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getUTCHours();
    
    // Weekend check
    if (day === 0 || day === 6) return false;
    
    // Market hours (simplified)
    return hour >= 0 && hour < 24;
  },

  // Generate random ID for testing
  generateTestId() {
    return 'test_' + Math.random().toString(36).substr(2, 9);
  },

  // Sleep function for async operations
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Retry function with exponential backoff
  async retry(fn, maxAttempts = 3, delay = 1000) {
    let lastError;
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (i < maxAttempts - 1) {
          await this.sleep(delay * Math.pow(2, i));
        }
      }
    }
    
    throw lastError;
  },

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Check if object is empty
  isEmpty(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  },

  // Get URL parameters
  getUrlParams() {
    const params = {};
    const urlParams = new URLSearchParams(window.location.search);
    for (const [key, value] of urlParams) {
      params[key] = value;
    }
    return params;
  },

  // Set URL parameter
  setUrlParam(key, value) {
    const url = new URL(window.location);
    url.searchParams.set(key, value);
    window.history.replaceState({}, '', url);
  },

  // Remove URL parameter
  removeUrlParam(key) {
    const url = new URL(window.location);
    url.searchParams.delete(key);
    window.history.replaceState({}, '', url);
  }
};

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = utils;
} else {
  window.utils = utils;
}
