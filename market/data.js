const axios = require('axios');
const WebSocket = require('ws');

// Forex pairs to track
const FOREX_PAIRS = [
  'EUR/USD',
  'GBP/USD', 
  'USD/JPY',
  'USD/CHF',
  'AUD/USD',
  'USD/CAD'
];

class MultiSourceMarketData {
  constructor() {
    // System state
    this.source = "pocket"; // pocket | api | ws | cache
    this.cache = new Map();
    this.lastUpdate = 0;
    this.wsConnection = null;
    this.wsReconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    
    // API keys
    this.pocketApiKey = process.env.POCKET_API_KEY;
    this.twelveDataApiKey = process.env.TWELVE_DATA_API_KEY;
    
    // Cache configuration
    this.CACHE_TTL = 30000; // 30 seconds
    this.RECOVERY_INTERVAL = 30000; // 30 seconds
    
    // WebSocket configuration
    this.wsUrl = 'wss://ws.finnhub.io?token=demo';
    
    // Initialize
    this.init();
  }

  init() {
    // Start auto-recovery
    this.startAutoRecovery();
    
    // Initialize WebSocket
    this.initWebSocket();
    
    console.log('🔄 Multi-Source Market Data Engine initialized');
    console.log(`📊 Current source: ${this.source}`);
  }

  // Auto-recovery logic
  startAutoRecovery() {
    setInterval(async () => {
      if (this.source !== "pocket") {
        console.log('🔄 Attempting to recover to Pocket API...');
        try {
          const testData = await this.fetchFromPocket('EUR/USD');
          if (testData) {
            this.source = "pocket";
            this.lastUpdate = Date.now();
            console.log('✅ Recovered to Pocket API');
          }
        } catch (error) {
          console.log('❌ Pocket API still unavailable, staying on:', this.source);
        }
      }
    }, this.RECOVERY_INTERVAL);
  }

  // Main getMarketData function
  async getMarketData() {
    try {
      // Try Pocket API first
      const pocketData = await this.tryPocketAPI();
      if (pocketData) {
        this.source = "pocket";
        this.lastUpdate = Date.now();
        return {
          source: "pocket",
          data: pocketData,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.log('❌ Pocket API failed, switching to Twelve Data...');
    }

    try {
      // Try Twelve Data API
      const apiData = await this.tryTwelveDataAPI();
      if (apiData) {
        this.source = "api";
        this.lastUpdate = Date.now();
        return {
          source: "api",
          data: apiData,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.log('❌ Twelve Data API failed, switching to WebSocket...');
    }

    try {
      // Try WebSocket
      const wsData = await this.tryWebSocket();
      if (wsData) {
        this.source = "ws";
        this.lastUpdate = Date.now();
        return {
          source: "ws",
          data: wsData,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.log('❌ WebSocket failed, using cache...');
    }

    // Final fallback to cache
    this.source = "cache";
    const cacheData = this.getCacheData();
    return {
      source: "cache",
      data: cacheData,
      timestamp: new Date().toISOString()
    };
  }

  // 1. POCKET API (PRIMARY)
  async tryPocketAPI() {
    if (!this.pocketApiKey) {
      throw new Error('Pocket API key not configured');
    }

    const promises = FOREX_PAIRS.map(pair => this.fetchFromPocket(pair));
    const results = await Promise.allSettled(promises);
    
    const marketData = [];
    let hasErrors = false;

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        marketData.push(result.value);
      } else {
        console.error(`Pocket API failed for ${FOREX_PAIRS[index]}:`, result.reason);
        hasErrors = true;
        marketData.push(this.generateFallbackData(FOREX_PAIRS[index]));
      }
    });

    if (hasErrors) {
      throw new Error('Pocket API had errors');
    }

    return marketData;
  }

  async fetchFromPocket(symbol) {
    try {
      // Pocket API implementation (example)
      const response = await axios.get(`https://api.pocketoption.com/v1/quotes/${symbol}`, {
        headers: {
          'Authorization': `Bearer ${this.pocketApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      if (response.data && response.data.quote) {
        const quote = response.data.quote;
        return {
          symbol,
          price: parseFloat(quote.price),
          change: parseFloat(quote.change || 0),
          changePercent: parseFloat(quote.changePercent || 0),
          volume: parseInt(quote.volume || 1000000),
          timestamp: new Date().toISOString(),
          open: parseFloat(quote.open || quote.price),
          high: parseFloat(quote.high || quote.price),
          low: parseFloat(quote.low || quote.price),
          close: parseFloat(quote.price)
        };
      }

      throw new Error('Invalid Pocket API response');
    } catch (error) {
      console.error(`Pocket API error for ${symbol}:`, error.message);
      throw error;
    }
  }

  // 2. TWELVE DATA API (BACKUP)
  async tryTwelveDataAPI() {
    if (!this.twelveDataApiKey) {
      throw new Error('Twelve Data API key not configured');
    }

    const promises = FOREX_PAIRS.map(pair => this.fetchFromTwelveData(pair));
    const results = await Promise.allSettled(promises);
    
    const marketData = [];
    let hasErrors = false;

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        marketData.push(result.value);
      } else {
        console.error(`Twelve Data API failed for ${FOREX_PAIRS[index]}:`, result.reason);
        hasErrors = true;
        marketData.push(this.generateFallbackData(FOREX_PAIRS[index]));
      }
    });

    if (hasErrors) {
      throw new Error('Twelve Data API had errors');
    }

    return marketData;
  }

  async fetchFromTwelveData(symbol) {
    try {
      const response = await axios.get('https://api.twelvedata.com/time_series', {
        params: {
          symbol: symbol,
          interval: '1min',
          apikey: this.twelveDataApiKey,
          outputsize: 1
        },
        timeout: 5000
      });

      if (response.data.status === 'error') {
        throw new Error(response.data.message);
      }

      const data = response.data.values?.[0];
      if (!data) {
        throw new Error('No data received');
      }

      return {
        symbol,
        price: parseFloat(data.close),
        change: parseFloat(data.close) - parseFloat(data.open),
        changePercent: ((parseFloat(data.close) - parseFloat(data.open)) / parseFloat(data.open)) * 100,
        volume: parseInt(data.volume || 1000000),
        timestamp: new Date().toISOString(),
        open: parseFloat(data.open),
        high: parseFloat(data.high),
        low: parseFloat(data.low),
        close: parseFloat(data.close)
      };
    } catch (error) {
      // Check for rate limiting
      if (error.response?.status === 429 || error.message.includes('rate limit')) {
        throw new Error('Rate limit exceeded');
      }
      throw error;
    }
  }

  // 3. WEBSOCKET (LIVE FALLBACK)
  async tryWebSocket() {
    if (!this.wsConnection || this.wsConnection.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    // Get data from WebSocket cache
    const wsData = this.getWebSocketData();
    if (wsData.length === 0) {
      throw new Error('No WebSocket data available');
    }

    return wsData;
  }

  initWebSocket() {
    try {
      this.wsConnection = new WebSocket(this.wsUrl);

      this.wsConnection.onopen = () => {
        console.log('🔌 WebSocket connected');
        this.wsReconnectAttempts = 0;
        
        // Subscribe to forex pairs
        this.subscribeToPairs();
      };

      this.wsConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'trade') {
            this.updateWebSocketCache(data);
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      };

      this.wsConnection.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        this.wsConnection = null;
        
        // Attempt to reconnect
        if (this.wsReconnectAttempts < this.maxReconnectAttempts) {
          this.wsReconnectAttempts++;
          setTimeout(() => {
            console.log(`🔄 WebSocket reconnect attempt ${this.wsReconnectAttempts}`);
            this.initWebSocket();
          }, 5000 * this.wsReconnectAttempts);
        }
      };

      this.wsConnection.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }

  subscribeToPairs() {
    if (!this.wsConnection || this.wsConnection.readyState !== WebSocket.OPEN) {
      return;
    }

    // Subscribe to forex pairs (example format)
    const pairs = FOREX_PAIRS.map(pair => pair.replace('/', '')).join(',');
    this.wsConnection.send(JSON.stringify({
      type: 'subscribe',
      symbol: pairs
    }));
  }

  updateWebSocketCache(data) {
    const symbol = this.normalizeSymbol(data.s);
    if (FOREX_PAIRS.includes(symbol)) {
      const cacheKey = `ws_${symbol}`;
      this.cache.set(cacheKey, {
        symbol,
        price: parseFloat(data.p),
        change: 0, // Calculate from previous price
        changePercent: 0,
        volume: parseInt(data.v || 1000000),
        timestamp: new Date().toISOString(),
        open: parseFloat(data.p),
        high: parseFloat(data.p),
        low: parseFloat(data.p),
        close: parseFloat(data.p)
      });
    }
  }

  getWebSocketData() {
    const wsData = [];
    FOREX_PAIRS.forEach(pair => {
      const cacheKey = `ws_${pair}`;
      const data = this.cache.get(cacheKey);
      if (data) {
        wsData.push(data);
      }
    });
    return wsData;
  }

  // 4. CACHE (FINAL FALLBACK)
  getCacheData() {
    const cacheData = [];
    FOREX_PAIRS.forEach(pair => {
      const data = this.getCachedData(pair);
      if (data) {
        cacheData.push(data);
      } else {
        cacheData.push(this.generateFallbackData(pair));
      }
    });
    return cacheData;
  }

  getCachedData(symbol) {
    const cacheKey = `cache_${symbol}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      return cached;
    }
    
    return null;
  }

  setCachedData(symbol, data) {
    const cacheKey = `cache_${symbol}`;
    this.cache.set(cacheKey, {
      ...data,
      timestamp: Date.now()
    });
  }

  // Helper functions
  generateFallbackData(symbol) {
    const basePrice = this.getBasePrice(symbol);
    const variation = (Math.random() - 0.5) * 0.001;
    const price = basePrice + variation;
    const change = variation;
    const changePercent = (variation / basePrice) * 100;

    const data = {
      symbol,
      price: price,
      change: change,
      changePercent: changePercent,
      volume: Math.floor(Math.random() * 1000000) + 500000,
      timestamp: new Date().toISOString(),
      open: price - change,
      high: price + Math.abs(variation) * 0.5,
      low: price - Math.abs(variation) * 0.5,
      close: price
    };

    // Cache fallback data
    this.setCachedData(symbol, data);
    
    return data;
  }

  getBasePrice(symbol) {
    const basePrices = {
      'EUR/USD': 1.0850,
      'GBP/USD': 1.2650,
      'USD/JPY': 149.50,
      'USD/CHF': 0.8750,
      'AUD/USD': 0.6550,
      'USD/CAD': 1.3650
    };
    return basePrices[symbol] || 1.0000;
  }

  normalizeSymbol(symbol) {
    // Normalize WebSocket symbol format
    if (symbol.includes('USD')) {
      if (symbol.startsWith('USD')) {
        return symbol.replace('USD', 'USD/') + 'USD';
      } else {
        return symbol.replace('USD', '/USD');
      }
    }
    return symbol;
  }

  // Get current source status
  getSourceStatus() {
    return {
      source: this.source,
      lastUpdate: this.lastUpdate,
      wsConnected: this.wsConnection?.readyState === WebSocket.OPEN,
      cacheSize: this.cache.size
    };
  }

  // Clean old cache entries
  cleanCache() {
    const now = Date.now();
    for (const [key, value] of this.cache) {
      if (now - value.timestamp > this.CACHE_TTL * 2) {
        this.cache.delete(key);
      }
    }
  }
}

// Export singleton instance
module.exports = new MultiSourceMarketData();
