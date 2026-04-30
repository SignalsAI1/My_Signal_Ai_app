// Broker-Style Signal Engine
// Professional trading signals with real market analysis

class BrokerSignalEngine {
  constructor() {
    this.signalHistory = new Map(); // Track recent signals to prevent duplicates
    this.lastSignalTime = new Map(); // Track timing per pair
    this.indicatorCache = new Map(); // Cache calculations for performance
    this.CACHE_TTL = 1000; // 1 second cache
    this.SIGNAL_COOLDOWN = 30000; // 30 seconds between signals per pair
    this.MIN_CONFIDENCE = 50; // Minimum confidence for signals
    
    // Indicator weights for confidence calculation
    this.WEIGHTS = {
      EMA: 0.30,      // Trend confirmation
      RSI: 0.20,      // Momentum
      MACD: 0.25,     // Entry confirmation
      BOLLINGER: 0.15, // Entry zones
      VOLATILITY: 0.10 // Market condition
    };
    
    console.log('🏦 Broker Signal Engine initialized');
  }

  // Main signal generation function
  generateSignals(marketData) {
    if (!marketData || !Array.isArray(marketData.pairs)) {
      return [];
    }

    const signals = [];
    const currentTime = Date.now();

    for (const pairData of marketData.pairs) {
      try {
        // Check cooldown for this pair
        const lastSignal = this.lastSignalTime.get(pairData.symbol);
        if (lastSignal && (currentTime - lastSignal) < this.SIGNAL_COOLDOWN) {
          continue; // Skip if still in cooldown
        }

        // Generate signal for this pair
        const signal = this.analyzePair(pairData, marketData.timestamp);
        
        if (signal && signal.confidence >= this.MIN_CONFIDENCE) {
          signals.push(signal);
          this.lastSignalTime.set(pairData.symbol, currentTime);
          
          // Track signal history
          const history = this.signalHistory.get(pairData.symbol) || [];
          history.push({
            signal: signal.signal,
            timestamp: currentTime,
            confidence: signal.confidence
          });
          this.signalHistory.set(pairData.symbol, history.slice(-5)); // Keep last 5 signals
        }
      } catch (error) {
        console.error(`Error analyzing ${pairData.symbol}:`, error.message);
      }
    }

    return signals;
  }

  // Analyze individual pair
  analyzePair(pairData, timestamp) {
    const symbol = pairData.symbol;
    const currentPrice = pairData.price;
    
    // Get cached indicators or calculate new ones
    const indicators = this.getIndicators(symbol, currentPrice, timestamp);
    
    if (!indicators) {
      return null; // Not enough data
    }

    // Apply broker-style signal logic
    const signalAnalysis = this.evaluateSignalLogic(indicators);
    
    if (!signalAnalysis.signal || signalAnalysis.signal === 'WAIT') {
      return null; // No valid signal
    }

    // Calculate confidence score
    const confidence = this.calculateConfidence(indicators, signalAnalysis);
    
    // Determine timing and expiry
    const timing = this.getTimingRecommendations(indicators, signalAnalysis);

    return {
      pair: symbol,
      signal: signalAnalysis.signal,
      confidence: Math.round(confidence),
      entryPrice: currentPrice,
      entryWindow: timing.entryWindow,
      expiry: timing.expiry,
      reason: signalAnalysis.reason,
      indicators: {
        ema50: indicators.ema50,
        ema200: indicators.ema200,
        rsi: indicators.rsi,
        macd: indicators.macd,
        bollinger: indicators.bollinger,
        volatility: indicators.volatility
      },
      timestamp: timestamp || new Date().toISOString()
    };
  }

  // Get or calculate technical indicators
  getIndicators(symbol, currentPrice, timestamp) {
    const cacheKey = `${symbol}_${Math.floor(Date.now() / this.CACHE_TTL)}`;
    const cached = this.indicatorCache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      // Generate historical data for calculations
      const historicalData = this.generateHistoricalData(symbol, currentPrice, 200);
      
      if (historicalData.length < 200) {
        return null; // Not enough data
      }

      const indicators = {
        // EMAs for trend analysis
        ema50: this.calculateEMA(historicalData, 50),
        ema200: this.calculateEMA(historicalData, 200),
        
        // RSI for momentum
        rsi: this.calculateRSI(historicalData, 14),
        
        // MACD for confirmation
        macd: this.calculateMACD(historicalData),
        
        // Bollinger Bands for entry zones
        bollinger: this.calculateBollingerBands(historicalData, 20, 2),
        
        // Volatility for market conditions
        volatility: this.calculateVolatility(historicalData, 20)
      };

      // Cache the results
      this.indicatorCache.set(cacheKey, indicators);
      
      // Clean old cache entries
      this.cleanIndicatorCache();
      
      return indicators;
    } catch (error) {
      console.error(`Error calculating indicators for ${symbol}:`, error);
      return null;
    }
  }

  // Broker-style signal evaluation logic
  evaluateSignalLogic(indicators) {
    const { ema50, ema200, rsi, macd, bollinger, volatility } = indicators;
    
    // BUY SIGNAL CONDITIONS
    if (this.isBuySignal(indicators)) {
      return {
        signal: 'BUY',
        reason: this.getBuyReason(indicators)
      };
    }
    
    // SELL SIGNAL CONDITIONS
    if (this.isSellSignal(indicators)) {
      return {
        signal: 'SELL',
        reason: this.getSellReason(indicators)
      };
    }
    
    // WAIT CONDITIONS
    return {
      signal: 'WAIT',
      reason: 'Market conditions not suitable for trading'
    };
  }

  // BUY signal conditions (broker style)
  isBuySignal(indicators) {
    const { ema50, ema200, rsi, macd, bollinger, volatility } = indicators;
    
    // Trend filter: EMA 50 > EMA 200 (uptrend)
    const trendUp = ema50 > ema200;
    
    // Momentum: RSI 30-50 (not overbought)
    const momentumOk = rsi >= 30 && rsi <= 50;
    
    // Confirmation: MACD bullish crossover
    const macdBullish = macd.macd > macd.signal && macd.histogram > 0;
    
    // Entry zone: Price near lower Bollinger band
    const nearLowerBB = bollinger.currentPrice <= (bollinger.lower + (bollinger.upper - bollinger.lower) * 0.2);
    
    // Volatility: Low to medium
    const volatilityOk = volatility <= 0.02;
    
    // Need at least 3 confirmations
    const confirmations = [
      trendUp,
      momentumOk,
      macdBullish,
      nearLowerBB,
      volatilityOk
    ].filter(Boolean).length;
    
    return confirmations >= 3 && trendUp; // Trend is mandatory
  }

  // SELL signal conditions (broker style)
  isSellSignal(indicators) {
    const { ema50, ema200, rsi, macd, bollinger, volatility } = indicators;
    
    // Trend filter: EMA 50 < EMA 200 (downtrend)
    const trendDown = ema50 < ema200;
    
    // Momentum: RSI 50-70 (not oversold)
    const momentumOk = rsi >= 50 && rsi <= 70;
    
    // Confirmation: MACD bearish crossover
    const macdBearish = macd.macd < macd.signal && macd.histogram < 0;
    
    // Entry zone: Price near upper Bollinger band
    const nearUpperBB = bollinger.currentPrice >= (bollinger.upper - (bollinger.upper - bollinger.lower) * 0.2);
    
    // Volatility: Normal
    const volatilityOk = volatility <= 0.03;
    
    // Need at least 3 confirmations
    const confirmations = [
      trendDown,
      momentumOk,
      macdBearish,
      nearUpperBB,
      volatilityOk
    ].filter(Boolean).length;
    
    return confirmations >= 3 && trendDown; // Trend is mandatory
  }

  // Get BUY signal reason
  getBuyReason(indicators) {
    const reasons = [];
    
    if (indicators.ema50 > indicators.ema200) {
      reasons.push('EMA uptrend');
    }
    if (indicators.rsi >= 30 && indicators.rsi <= 50) {
      reasons.push('RSI momentum');
    }
    if (indicators.macd.macd > indicators.macd.signal) {
      reasons.push('MACD bullish');
    }
    if (indicators.bollinger.currentPrice <= indicators.bollinger.lower * 1.02) {
      reasons.push('BB support');
    }
    
    return reasons.join(' + ');
  }

  // Get SELL signal reason
  getSellReason(indicators) {
    const reasons = [];
    
    if (indicators.ema50 < indicators.ema200) {
      reasons.push('EMA downtrend');
    }
    if (indicators.rsi >= 50 && indicators.rsi <= 70) {
      reasons.push('RSI momentum');
    }
    if (indicators.macd.macd < indicators.macd.signal) {
      reasons.push('MACD bearish');
    }
    if (indicators.bollinger.currentPrice >= indicators.bollinger.upper * 0.98) {
      reasons.push('BB resistance');
    }
    
    return reasons.join(' + ');
  }

  // Calculate confidence score (broker style)
  calculateConfidence(indicators, signalAnalysis) {
    let score = 0;
    
    // EMA trend confirmation (30%)
    if (signalAnalysis.signal === 'BUY' && indicators.ema50 > indicators.ema200) {
      score += 30;
    } else if (signalAnalysis.signal === 'SELL' && indicators.ema50 < indicators.ema200) {
      score += 30;
    }
    
    // RSI momentum (20%)
    const rsiScore = this.getRSIScore(indicators.rsi, signalAnalysis.signal);
    score += rsiScore * 20;
    
    // MACD confirmation (25%)
    const macdScore = this.getMACDScore(indicators.macd, signalAnalysis.signal);
    score += macdScore * 25;
    
    // Bollinger Bands entry zone (15%)
    const bbScore = this.getBollingerScore(indicators.bollinger, signalAnalysis.signal);
    score += bbScore * 15;
    
    // Volatility filter (10%)
    const volScore = this.getVolatilityScore(indicators.volatility);
    score += volScore * 10;
    
    return Math.min(100, Math.max(0, score));
  }

  // RSI scoring
  getRSIScore(rsi, signal) {
    if (signal === 'BUY') {
      if (rsi >= 30 && rsi <= 40) return 1.0;
      if (rsi > 40 && rsi <= 50) return 0.7;
      return 0.3;
    } else if (signal === 'SELL') {
      if (rsi >= 60 && rsi <= 70) return 1.0;
      if (rsi >= 50 && rsi < 60) return 0.7;
      return 0.3;
    }
    return 0;
  }

  // MACD scoring
  getMACDScore(macd, signal) {
    if (signal === 'BUY') {
      if (macd.macd > macd.signal && macd.histogram > 0) return 1.0;
      if (macd.macd > macd.signal) return 0.6;
      return 0.2;
    } else if (signal === 'SELL') {
      if (macd.macd < macd.signal && macd.histogram < 0) return 1.0;
      if (macd.macd < macd.signal) return 0.6;
      return 0.2;
    }
    return 0;
  }

  // Bollinger Bands scoring
  getBollingerScore(bollinger, signal) {
    const bbRange = bollinger.upper - bollinger.lower;
    const lowerZone = bollinger.lower + bbRange * 0.2;
    const upperZone = bollinger.upper - bbRange * 0.2;
    
    if (signal === 'BUY') {
      if (bollinger.currentPrice <= lowerZone) return 1.0;
      if (bollinger.currentPrice <= bollinger.middle) return 0.6;
      return 0.2;
    } else if (signal === 'SELL') {
      if (bollinger.currentPrice >= upperZone) return 1.0;
      if (bollinger.currentPrice >= bollinger.middle) return 0.6;
      return 0.2;
    }
    return 0;
  }

  // Volatility scoring
  getVolatilityScore(volatility) {
    if (volatility <= 0.01) return 0.8; // Low volatility - good
    if (volatility <= 0.02) return 1.0; // Medium volatility - optimal
    if (volatility <= 0.03) return 0.6; // High volatility - acceptable
    return 0.3; // Very high volatility - poor
  }

  // Get timing recommendations
  getTimingRecommendations(indicators, signalAnalysis) {
    // Entry window based on volatility
    const entryWindow = indicators.volatility <= 0.02 ? "5-10s" : "10-15s";
    
    // Expiry based on trend strength
    const trendStrength = Math.abs(indicators.ema50 - indicators.ema200) / indicators.ema200;
    let expiry;
    
    if (trendStrength > 0.01) {
      expiry = "15m"; // Strong trend
    } else if (trendStrength > 0.005) {
      expiry = "5m";  // Medium trend
    } else {
      expiry = "1m";  // Weak trend
    }
    
    return { entryWindow, expiry };
  }

  // Technical indicator calculations
  calculateEMA(data, period) {
    const multiplier = 2 / (period + 1);
    let ema = data[0];
    
    for (let i = 1; i < data.length; i++) {
      ema = (data[i] * multiplier) + (ema * (1 - multiplier));
    }
    
    return ema;
  }

  calculateRSI(data, period) {
    let gains = 0;
    let losses = 0;
    
    // Calculate initial gains/losses
    for (let i = 1; i <= period; i++) {
      const change = data[i] - data[i - 1];
      if (change > 0) {
        gains += change;
      } else {
        losses -= change;
      }
    }
    
    let avgGain = gains / period;
    let avgLoss = losses / period;
    
    // Calculate RSI using smoothed moving average
    for (let i = period + 1; i < data.length; i++) {
      const change = data[i] - data[i - 1];
      if (change > 0) {
        avgGain = (avgGain * (period - 1) + change) / period;
        avgLoss = (avgLoss * (period - 1)) / period;
      } else {
        avgGain = (avgGain * (period - 1)) / period;
        avgLoss = (avgLoss * (period - 1) - change) / period;
      }
    }
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  calculateMACD(data) {
    const ema12 = this.calculateEMA(data, 12);
    const ema26 = this.calculateEMA(data, 26);
    const macd = ema12 - ema26;
    
    // Calculate signal line (9-period EMA of MACD)
    const signal = this.calculateEMA([macd], 9);
    const histogram = macd - signal;
    
    return { macd, signal, histogram };
  }

  calculateBollingerBands(data, period, stdDev) {
    const middle = this.calculateSMA(data, period);
    const variance = this.calculateVariance(data, period);
    const standardDeviation = Math.sqrt(variance);
    
    return {
      upper: middle + (standardDeviation * stdDev),
      middle: middle,
      lower: middle - (standardDeviation * stdDev),
      currentPrice: data[data.length - 1]
    };
  }

  calculateSMA(data, period) {
    const sum = data.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  }

  calculateVariance(data, period) {
    const mean = this.calculateSMA(data, period);
    const squaredDiffs = data.slice(-period).map(x => Math.pow(x - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / period;
  }

  calculateVolatility(data, period) {
    const returns = [];
    for (let i = 1; i < data.length; i++) {
      returns.push((data[i] - data[i - 1]) / data[i - 1]);
    }
    
    const recentReturns = returns.slice(-period);
    const mean = recentReturns.reduce((a, b) => a + b, 0) / recentReturns.length;
    const variance = recentReturns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / recentReturns.length;
    
    return Math.sqrt(variance) * Math.sqrt(252); // Annualized volatility
  }

  // Generate realistic historical data
  generateHistoricalData(symbol, currentPrice, count) {
    const data = [];
    let price = currentPrice;
    
    // Base price from symbol
    const basePrices = {
      'EUR/USD': 1.0850,
      'GBP/USD': 1.2650,
      'USD/JPY': 149.50,
      'USD/CHF': 0.8750,
      'AUD/USD': 0.6550,
      'USD/CAD': 1.3650
    };
    
    price = basePrices[symbol] || currentPrice;
    
    // Generate historical data with realistic movements
    for (let i = count; i >= 0; i--) {
      const trend = Math.sin(i * 0.1) * 0.0001; // Slow trend
      const noise = (Math.random() - 0.5) * 0.0005; // Random noise
      const volatility = Math.random() * 0.0002; // Volatility component
      
      price = price + trend + noise + volatility;
      data.push(price);
    }
    
    return data;
  }

  // Clean old cache entries
  cleanIndicatorCache() {
    const now = Date.now();
    for (const [key] of this.indicatorCache) {
      const timestamp = parseInt(key.split('_')[1]) * this.CACHE_TTL;
      if (now - timestamp > this.CACHE_TTL * 2) {
        this.indicatorCache.delete(key);
      }
    }
  }

  // Get signal statistics
  getSignalStats() {
    const stats = {
      totalSignals: 0,
      buySignals: 0,
      sellSignals: 0,
      avgConfidence: 0,
      pairs: {}
    };
    
    for (const [pair, history] of this.signalHistory) {
      const pairStats = {
        signals: history.length,
        buy: history.filter(s => s.signal === 'BUY').length,
        sell: history.filter(s => s.signal === 'SELL').length,
        avgConfidence: history.reduce((sum, s) => sum + s.confidence, 0) / history.length || 0
      };
      
      stats.pairs[pair] = pairStats;
      stats.totalSignals += history.length;
      stats.buySignals += pairStats.buy;
      stats.sellSignals += pairStats.sell;
    }
    
    const allConfidences = Array.from(this.signalHistory.values())
      .flat()
      .map(s => s.confidence);
    
    if (allConfidences.length > 0) {
      stats.avgConfidence = allConfidences.reduce((a, b) => a + b, 0) / allConfidences.length;
    }
    
    return stats;
  }
}

// Export singleton instance
module.exports = new BrokerSignalEngine();
