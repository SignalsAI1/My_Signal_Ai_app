// Market Data Module
// Handles real-time Forex market data fetching and processing

require('dotenv').config();

const CURRENCY_PAIRS = [
  { symbol: 'EUR/USD', name: 'Euro/US Dollar', base: 'EUR', quote: 'USD' },
  { symbol: 'GBP/USD', name: 'British Pound/US Dollar', base: 'GBP', quote: 'USD' },
  { symbol: 'USD/JPY', name: 'US Dollar/Japanese Yen', base: 'USD', quote: 'JPY' },
  { symbol: 'USD/CHF', name: 'US Dollar/Swiss Franc', base: 'USD', quote: 'CHF' },
  { symbol: 'AUD/USD', name: 'Australian Dollar/US Dollar', base: 'AUD', quote: 'USD' },
  { symbol: 'USD/CAD', name: 'US Dollar/Canadian Dollar', base: 'USD', quote: 'CAD' }
];

class MarketDataService {
  constructor() {
    this.cache = new Map();
    this.subscribers = new Set();
    this.isRunning = false;
    this.updateInterval = null;
  }

  // Fetch market data from API with fallback
  async fetchMarketData(symbol) {
    try {
      // Use Twelve Data API as primary source
      const data = await this.fetchFromTwelveData(symbol);
      return data;
    } catch (error) {
      console.warn(`Twelve Data failed for ${symbol}, using fallback...`);
      return this.generateFallbackData(symbol);
    }
  }

  // Alpha Vantage API integration
  async fetchFromAlphaVantage(symbol) {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      throw new Error('Alpha Vantage API key not configured');
    }

    const fromSymbol = symbol.split('/')[0];
    const toSymbol = symbol.split('/')[1];
    
    const response = await fetch(
      `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${fromSymbol}&to_currency=${toSymbol}&apikey=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }

    const rate = parseFloat(data['Realtime Currency Exchange Rate']['5. Exchange Rate']);
    const timestamp = data['Realtime Currency Exchange Rate']['6. Last Refreshed'];

    return {
      symbol,
      price: rate,
      change: this.calculateChange(symbol, rate),
      changePercent: this.calculateChangePercent(symbol, rate),
      timestamp: new Date(timestamp).toISOString(),
      high: rate * 1.002, // Simulated high
      low: rate * 0.998,  // Simulated low
      volume: Math.floor(Math.random() * 1000000) + 500000
    };
  }

  // Twelve Data API integration
  async fetchFromTwelveData(symbol) {
    const apiKey = process.env.TWELVE_DATA_API_KEY;
    if (!apiKey) {
      throw new Error('TWELVE_DATA_API_KEY not configured in .env file');
    }

    const response = await fetch(
      `https://api.twelvedata.com/time_series?symbol=${symbol.replace('/', '')}&interval=1min&apikey=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Twelve Data API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.code !== 200) {
      throw new Error(data.message || 'Twelve Data API error');
    }

    const latest = data.values[0];
    const price = parseFloat(latest.close);
    const high = parseFloat(latest.high);
    const low = parseFloat(latest.low);

    return {
      symbol,
      price,
      change: this.calculateChange(symbol, price),
      changePercent: this.calculateChangePercent(symbol, price),
      timestamp: latest.datetime,
      high,
      low,
      volume: parseInt(latest.volume || '0')
    };
  }

  // Fallback data generation when APIs fail
  generateFallbackData(symbol) {
    const basePrice = this.getBasePrice(symbol);
    const variation = (Math.random() - 0.5) * 0.002; // ±0.1% variation
    const price = basePrice * (1 + variation);
    const change = price - basePrice;
    const changePercent = (change / basePrice) * 100;

    return {
      symbol,
      price,
      change,
      changePercent,
      timestamp: new Date().toISOString(),
      high: price * 1.002,
      low: price * 0.998,
      volume: Math.floor(Math.random() * 1000000) + 500000
    };
  }

  // Get base price for fallback calculations
  getBasePrice(symbol) {
    const basePrices = {
      'EUR/USD': 1.0850,
      'GBP/USD': 1.2750,
      'USD/JPY': 149.50,
      'USD/CHF': 0.9050,
      'AUD/USD': 0.6650,
      'USD/CAD': 1.3650
    };
    
    return basePrices[symbol] || 1.0;
  }

  // Calculate price change
  calculateChange(symbol, currentPrice) {
    const previousPrice = this.cache.get(symbol)?.price || currentPrice;
    return currentPrice - previousPrice;
  }

  // Calculate percentage change
  calculateChangePercent(symbol, currentPrice) {
    const previousPrice = this.cache.get(symbol)?.price || currentPrice;
    return ((currentPrice - previousPrice) / previousPrice) * 100;
  }

  // Fetch all currency pairs data
  async fetchAllMarketData() {
    const promises = CURRENCY_PAIRS.map(pair => this.fetchMarketData(pair.symbol));
    const results = await Promise.allSettled(promises);
    
    const marketData = results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);

    // Update cache
    marketData.forEach(data => {
      this.cache.set(data.symbol, data);
    });

    return marketData;
  }

  // Subscribe to real-time updates
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  // Notify subscribers of new data
  notifySubscribers(data) {
    this.subscribers.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in subscriber callback:', error);
      }
    });
  }

  // Start real-time data streaming
  startRealTimeUpdates(intervalMs = 2000) {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    
    const updateData = async () => {
      try {
        const marketData = await this.fetchAllMarketData();
        this.notifySubscribers(marketData);
      } catch (error) {
        console.error('Error fetching market data:', error);
        // Send fallback data on error
        const fallbackData = CURRENCY_PAIRS.map(pair => this.generateFallbackData(pair.symbol));
        this.notifySubscribers(fallbackData);
      }
    };

    // Initial fetch
    updateData();

    // Set up interval
    this.updateInterval = setInterval(updateData, intervalMs);
  }

  // Stop real-time updates
  stopRealTimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.isRunning = false;
  }

  // Get cached data for a specific symbol
  getCachedData(symbol) {
    return this.cache.get(symbol);
  }

  // Get all cached data
  getAllCachedData() {
    return Array.from(this.cache.values());
  }

  // Get supported currency pairs
  getCurrencyPairs() {
    return CURRENCY_PAIRS;
  }
}

// Export singleton instance
const marketDataService = new MarketDataService();

module.exports = {
  marketDataService,
  CURRENCY_PAIRS
};
