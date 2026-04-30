// Shared utilities for My Ai Signal

const utils = {
  // Generate unique ID
  generateId() {
    return Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
  },

  // Format currency
  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 5
    }).format(amount);
  },

  // Format percentage
  formatPercentage(value, decimals = 2) {
    return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
  },

  // Format time
  formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  },

  // Format date
  formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  // Calculate percentage change
  calculatePercentageChange(oldValue, newValue) {
    if (!oldValue || oldValue === 0) return 0;
    return ((newValue - oldValue) / oldValue) * 100;
  },

  // Validate email
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  // Validate promo code
  validatePromoCode(code) {
    const validCodes = ['LRQ740', 'SIGNAL2024', 'AI2024', 'TRADE60'];
    return validCodes.includes(code.toUpperCase());
  },

  // Sanitize input
  sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input.trim().replace(/[<>]/g, '');
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
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Local storage helpers
  storage: {
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.error('Storage set error:', error);
        return false;
      }
    },

    get(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (error) {
        console.error('Storage get error:', error);
        return defaultValue;
      }
    },

    remove(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error('Storage remove error:', error);
        return false;
      }
    },

    clear() {
      try {
        localStorage.clear();
        return true;
      } catch (error) {
        console.error('Storage clear error:', error);
        return false;
      }
    }
  },

  // WebSocket helpers
  websocket: {
    create(url, options = {}) {
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        options.onOpen?.();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          options.onMessage?.(data);
        } catch (error) {
          console.error('WebSocket message parse error:', error);
          options.onError?.(error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        options.onClose?.();
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        options.onError?.(error);
      };

      return ws;
    },

    send(ws, data) {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
        return true;
      }
      return false;
    },

    close(ws) {
      if (ws) {
        ws.close();
      }
    }
  },

  // API helpers
  api: {
    async request(url, options = {}) {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      };

      try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error('API request error:', error);
        throw error;
      }
    },

    get(url, options = {}) {
      return this.request(url, { ...options, method: 'GET' });
    },

    post(url, data, options = {}) {
      return this.request(url, {
        ...options,
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    put(url, data, options = {}) {
      return this.request(url, {
        ...options,
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },

    delete(url, options = {}) {
      return this.request(url, { ...options, method: 'DELETE' });
    }
  },

  // Signal calculation helpers
  signals: {
    calculateConfidence(indicators) {
      let confidence = 0;
      let count = 0;

      Object.values(indicators).forEach(indicator => {
        if (indicator !== null && indicator !== undefined) {
          confidence += this.getIndicatorStrength(indicator);
          count++;
        }
      });

      return count > 0 ? Math.round((confidence / count) * 100) : 0;
    },

    getIndicatorStrength(indicator) {
      // Simple strength calculation based on indicator values
      if (typeof indicator === 'object' && indicator.macd !== undefined) {
        // MACD indicator
        return Math.abs(indicator.macd) > 0.001 ? 0.8 : 0.4;
      } else if (typeof indicator === 'number') {
        // RSI or Volatility
        if (indicator < 30 || indicator > 70) return 0.9;
        if (indicator < 40 || indicator > 60) return 0.6;
        return 0.3;
      }
      return 0.5;
    },

    getSignalColor(signal) {
      switch (signal.toLowerCase()) {
        case 'buy': return '#00ff88';
        case 'sell': return '#ff4444';
        default: return '#ffaa00';
      }
    },

    getSignalIcon(signal) {
      switch (signal.toLowerCase()) {
        case 'buy': return '📈';
        case 'sell': return '📉';
        default: return '⏸️';
      }
    }
  },

  // Market data helpers
  market: {
    formatPrice(price, decimals = 5) {
      return parseFloat(price).toFixed(decimals);
    },

    formatVolume(volume) {
      if (volume >= 1000000) {
        return (volume / 1000000).toFixed(2) + 'M';
      } else if (volume >= 1000) {
        return (volume / 1000).toFixed(2) + 'K';
      }
      return volume.toString();
    },

    getPriceChange(current, previous) {
      const change = current - previous;
      const changePercent = this.calculatePercentageChange(previous, current);
      
      return {
        change,
        changePercent,
        direction: change >= 0 ? 'up' : 'down'
      };
    },

    isMarketOpen() {
      const now = new Date();
      const day = now.getDay();
      const hour = now.getHours();
      
      // Simple market hours check (weekdays, 9 AM - 5 PM UTC)
      return day >= 1 && day <= 5 && hour >= 9 && hour <= 17;
    }
  },

  // Validation helpers
  validation: {
    isRequired(value) {
      return value !== null && value !== undefined && value.toString().trim() !== '';
    },

    isNumber(value) {
      return !isNaN(parseFloat(value)) && isFinite(value);
    },

    isPositiveNumber(value) {
      return this.isNumber(value) && parseFloat(value) > 0;
    },

    isInRange(value, min, max) {
      const num = parseFloat(value);
      return this.isNumber(num) && num >= min && num <= max;
    },

    minLength(value, min) {
      return value && value.toString().length >= min;
    },

    maxLength(value, max) {
      return !value || value.toString().length <= max;
    }
  },

  // Error handling
  error: {
    create(message, code = null, details = null) {
      const error = new Error(message);
      error.code = code;
      error.details = details;
      error.timestamp = new Date().toISOString();
      return error;
    },

    log(error, context = {}) {
      console.error('Error:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString()
      });
    },

    isNetworkError(error) {
      return error.code === 'NETWORK_ERROR' || 
             error.message.includes('fetch') || 
             error.message.includes('network');
    },

    isValidationError(error) {
      return error.code === 'VALIDATION_ERROR' || 
             error.message.includes('validation');
    }
  }
};

// Export for Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = utils;
} else {
  window.utils = utils;
}
