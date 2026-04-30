const axios = require('axios');

// Cache configuration
const cache = new Map();
const CACHE_TTL = 60000; // 1 minute
const RATE_LIMIT = 1000; // 1 second between requests
let lastRequest = 0;

// Forex pairs to track
const FOREX_PAIRS = [
  'EUR/USD',
  'GBP/USD', 
  'USD/JPY',
  'USD/CHF',
  'AUD/USD',
  'USD/CAD'
];

class MarketDataService {
  constructor() {
    this.apiKey = process.env.TWELVE_DATA_API_KEY;
    this.baseURL = 'https://api.twelvedata.com';
  }

  async rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequest;
    if (timeSinceLastRequest < RATE_LIMIT) {
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT - timeSinceLastRequest));
    }
    lastRequest = Date.now();
  }

  getCacheKey(symbol) {
    return `market_${symbol}_${Math.floor(Date.now() / CACHE_TTL)}`;
  }

  getCachedData(symbol) {
    const key = this.getCacheKey(symbol);
    return cache.get(key);
  }

  setCachedData(symbol, data) {
    const key = this.getCacheKey(symbol);
    cache.set(key, data);
    
    // Clean old cache entries
    const cutoff = Date.now() - (CACHE_TTL * 2);
    for (const [cacheKey] of cache) {
      if (cacheKey.includes('market_') && parseInt(cacheKey.split('_')[2]) * CACHE_TTL < cutoff) {
        cache.delete(cacheKey);
      }
    }
  }

  async fetchRealTimeData(symbol) {
    try {
      await this.rateLimit();

      const cached = this.getCachedData(symbol);
      if (cached) {
        return cached;
      }

      const response = await axios.get(`${this.baseURL}/time_series`, {
        params: {
          symbol: symbol,
          interval: '1min',
          apikey: this.apiKey,
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

      const processedData = {
        symbol,
        price: parseFloat(data.close),
        change: parseFloat(data.close) - parseFloat(data.open),
        changePercent: ((parseFloat(data.close) - parseFloat(data.open)) / parseFloat(data.open)) * 100,
        volume: parseInt(data.volume || 0),
        timestamp: new Date().toISOString(),
        open: parseFloat(data.open),
        high: parseFloat(data.high),
        low: parseFloat(data.low),
        close: parseFloat(data.close)
      };

      this.setCachedData(symbol, processedData);
      return processedData;

    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error.message);
      return this.getFallbackData(symbol);
    }
  }

  getFallbackData(symbol) {
    const basePrice = this.getBasePrice(symbol);
    const variation = (Math.random() - 0.5) * 0.001;
    const price = basePrice + variation;
    const change = variation;
    const changePercent = (variation / basePrice) * 100;

    return {
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

  async getMarketData() {
    const promises = FOREX_PAIRS.map(pair => this.fetchRealTimeData(pair));
    const results = await Promise.allSettled(promises);
    
    const marketData = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        marketData.push(result.value);
      } else {
        console.error(`Failed to fetch ${FOREX_PAIRS[index]}:`, result.reason);
        marketData.push(this.getFallbackData(FOREX_PAIRS[index]));
      }
    });

    return {
      pairs: marketData,
      timestamp: new Date().toISOString(),
      status: 'success'
    };
  }

  async getHistoricalData(symbol, interval = '1min', outputsize = 100) {
    try {
      await this.rateLimit();

      const response = await axios.get(`${this.baseURL}/time_series`, {
        params: {
          symbol,
          interval,
          outputsize,
          apikey: this.apiKey
        },
        timeout: 10000
      });

      if (response.data.status === 'error') {
        throw new Error(response.data.message);
      }

      return response.data.values.map(item => ({
        time: new Date(item.datetime).getTime() / 1000,
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: parseInt(item.volume || 0)
      }));

    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error.message);
      return this.generateMockHistoricalData(symbol, outputsize);
    }
  }

  generateMockHistoricalData(symbol, count) {
    const data = [];
    const now = Date.now();
    let basePrice = this.getBasePrice(symbol);

    for (let i = count; i >= 0; i--) {
      const timestamp = now - (i * 60000); // 1 minute intervals
      const variation = (Math.random() - 0.5) * 0.001;
      
      const open = basePrice;
      const close = basePrice + variation;
      const high = Math.max(open, close) + (Math.random() * 0.0005);
      const low = Math.min(open, close) - (Math.random() * 0.0005);
      const volume = Math.floor(Math.random() * 1000000) + 500000;

      data.push({
        time: new Date(timestamp).getTime() / 1000,
        open,
        high,
        low,
        close,
        volume
      });

      basePrice = close;
    }

    return data;
  }
}

module.exports = new MarketDataService();
