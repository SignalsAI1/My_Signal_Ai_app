// AI Signal Engine
// Real trading signal analysis using technical indicators

class SignalEngine {
  constructor() {
    this.priceHistory = new Map(); // Store price history for each pair
    this.indicators = {
      sma: [],
      ema: [],
      rsi: [],
      macd: [],
      bb: []
    };
    this.timeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];
  }

  // Calculate Simple Moving Average
  calculateSMA(prices, period) {
    if (prices.length < period) return null;
    
    const sum = prices.slice(-period).reduce((acc, price) => acc + price, 0);
    return sum / period;
  }

  // Calculate Exponential Moving Average
  calculateEMA(prices, period) {
    if (prices.length < period) return null;
    
    const multiplier = 2 / (period + 1);
    let ema = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }
    
    return ema;
  }

  // Calculate RSI (Relative Strength Index)
  calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return null;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = prices.length - period; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) {
        gains += change;
      } else {
        losses -= change;
      }
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  // Calculate MACD (Moving Average Convergence Divergence)
  calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    if (prices.length < slowPeriod) return null;
    
    const emaFast = this.calculateEMA(prices, fastPeriod);
    const emaSlow = this.calculateEMA(prices, slowPeriod);
    
    if (!emaFast || !emaSlow) return null;
    
    const macdLine = emaFast - emaSlow;
    
    // For simplicity, we'll use a basic signal line calculation
    const signalLine = macdLine * 0.8; // Simplified signal line
    
    const histogram = macdLine - signalLine;
    
    return {
      macd: macdLine,
      signal: signalLine,
      histogram: histogram
    };
  }

  // Calculate Bollinger Bands
  calculateBollingerBands(prices, period = 20, stdDev = 2) {
    if (prices.length < period) return null;
    
    const sma = this.calculateSMA(prices, period);
    if (!sma) return null;
    
    const recentPrices = prices.slice(-period);
    const variance = recentPrices.reduce((acc, price) => {
      return acc + Math.pow(price - sma, 2);
    }, 0) / period;
    
    const standardDeviation = Math.sqrt(variance);
    
    return {
      upper: sma + (standardDeviation * stdDev),
      middle: sma,
      lower: sma - (standardDeviation * stdDev)
    };
  }

  // Calculate momentum
  calculateMomentum(prices, period = 10) {
    if (prices.length < period + 1) return 0;
    
    const currentPrice = prices[prices.length - 1];
    const pastPrice = prices[prices.length - 1 - period];
    
    return ((currentPrice - pastPrice) / pastPrice) * 100;
  }

  // Calculate volatility
  calculateVolatility(prices, period = 20) {
    if (prices.length < period) return 0;
    
    const recentPrices = prices.slice(-period);
    const returns = [];
    
    for (let i = 1; i < recentPrices.length; i++) {
      returns.push((recentPrices[i] - recentPrices[i - 1]) / recentPrices[i - 1]);
    }
    
    const avgReturn = returns.reduce((acc, ret) => acc + ret, 0) / returns.length;
    const variance = returns.reduce((acc, ret) => acc + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    
    return Math.sqrt(variance) * Math.sqrt(252); // Annualized volatility
  }

  // Update price history for a symbol
  updatePriceHistory(symbol, price) {
    if (!this.priceHistory.has(symbol)) {
      this.priceHistory.set(symbol, []);
    }
    
    const history = this.priceHistory.get(symbol);
    history.push(price);
    
    // Keep only last 200 data points
    if (history.length > 200) {
      history.shift();
    }
  }

  // Generate trading signal for a symbol
  generateSignal(symbol, currentPrice, timeframe = '15m') {
    const history = this.priceHistory.get(symbol) || [];
    
    if (history.length < 20) {
      return {
        symbol,
        action: 'WAIT',
        confidence: 0,
        reason: 'Insufficient data for analysis',
        timestamp: new Date().toISOString(),
        price: currentPrice,
        timeFrame: timeframe
      };
    }

    const prices = history.map(item => typeof item === 'number' ? item : item.price);
    const indicators = this.calculateAllIndicators(prices);
    
    // Signal generation logic
    const signals = [];
    let totalConfidence = 0;
    let signalCount = 0;

    // SMA crossover signals
    if (indicators.sma.short && indicators.sma.long) {
      const smaSignal = this.analyzeSMACrossover(indicators.sma);
      if (smaSignal.action !== 'WAIT') {
        signals.push(smaSignal);
        totalConfidence += smaSignal.confidence;
        signalCount++;
      }
    }

    // RSI signals
    if (indicators.rsi) {
      const rsiSignal = this.analyzeRSI(indicators.rsi);
      if (rsiSignal.action !== 'WAIT') {
        signals.push(rsiSignal);
        totalConfidence += rsiSignal.confidence;
        signalCount++;
      }
    }

    // MACD signals
    if (indicators.macd) {
      const macdSignal = this.analyzeMACD(indicators.macd);
      if (macdSignal.action !== 'WAIT') {
        signals.push(macdSignal);
        totalConfidence += macdSignal.confidence;
        signalCount++;
      }
    }

    // Bollinger Bands signals
    if (indicators.bb) {
      const bbSignal = this.analyzeBollingerBands(indicators.bb, currentPrice);
      if (bbSignal.action !== 'WAIT') {
        signals.push(bbSignal);
        totalConfidence += bbSignal.confidence;
        signalCount++;
      }
    }

    // Momentum signals
    if (indicators.momentum !== 0) {
      const momentumSignal = this.analyzeMomentum(indicators.momentum);
      if (momentumSignal.action !== 'WAIT') {
        signals.push(momentumSignal);
        totalConfidence += momentumSignal.confidence;
        signalCount++;
      }
    }

    // Volatility filter
    const volatilitySignal = this.analyzeVolatility(indicators.volatility);
    
    // Combine signals
    const finalSignal = this.combineSignals(signals, volatilitySignal);
    
    // Calculate confidence
    const avgConfidence = signalCount > 0 ? totalConfidence / signalCount : 0;
    finalSignal.confidence = Math.min(Math.round(avgConfidence), 95);
    
    // Calculate take profit and stop loss
    if (finalSignal.action !== 'WAIT') {
      finalSignal.takeProfit = this.calculateTakeProfit(currentPrice, finalSignal.action, indicators.volatility);
      finalSignal.stopLoss = this.calculateStopLoss(currentPrice, finalSignal.action, indicators.volatility);
    }

    return {
      ...finalSignal,
      symbol,
      timestamp: new Date().toISOString(),
      price: currentPrice,
      timeFrame: timeframe
    };
  }

  // Calculate all indicators
  calculateAllIndicators(prices) {
    return {
      sma: {
        short: this.calculateSMA(prices, 10),
        long: this.calculateSMA(prices, 20)
      },
      ema: {
        short: this.calculateEMA(prices, 12),
        long: this.calculateEMA(prices, 26)
      },
      rsi: this.calculateRSI(prices),
      macd: this.calculateMACD(prices),
      bb: this.calculateBollingerBands(prices),
      momentum: this.calculateMomentum(prices),
      volatility: this.calculateVolatility(prices)
    };
  }

  // Analyze SMA crossover
  analyzeSMACrossover(sma) {
    if (!sma.short || !sma.long) return { action: 'WAIT', confidence: 0 };
    
    const crossover = sma.short - sma.long;
    const crossoverPercent = (crossover / sma.long) * 100;
    
    if (crossoverPercent > 0.5) {
      return {
        action: 'BUY',
        confidence: Math.min(Math.abs(crossoverPercent) * 10, 70),
        reason: `SMA crossover: Short SMA (${sma.short.toFixed(5)}) above Long SMA (${sma.long.toFixed(5)})`
      };
    } else if (crossoverPercent < -0.5) {
      return {
        action: 'SELL',
        confidence: Math.min(Math.abs(crossoverPercent) * 10, 70),
        reason: `SMA crossover: Short SMA (${sma.short.toFixed(5)}) below Long SMA (${sma.long.toFixed(5)})`
      };
    }
    
    return { action: 'WAIT', confidence: 0 };
  }

  // Analyze RSI
  analyzeRSI(rsi) {
    if (!rsi) return { action: 'WAIT', confidence: 0 };
    
    if (rsi < 30) {
      return {
        action: 'BUY',
        confidence: Math.min((30 - rsi) * 2, 80),
        reason: `RSI oversold at ${rsi.toFixed(2)}`
      };
    } else if (rsi > 70) {
      return {
        action: 'SELL',
        confidence: Math.min((rsi - 70) * 2, 80),
        reason: `RSI overbought at ${rsi.toFixed(2)}`
      };
    }
    
    return { action: 'WAIT', confidence: 0 };
  }

  // Analyze MACD
  analyzeMACD(macd) {
    if (!macd) return { action: 'WAIT', confidence: 0 };
    
    if (macd.histogram > 0.0001) {
      return {
        action: 'BUY',
        confidence: Math.min(macd.histogram * 10000, 75),
        reason: `MACD bullish crossover (histogram: ${macd.histogram.toFixed(6)})`
      };
    } else if (macd.histogram < -0.0001) {
      return {
        action: 'SELL',
        confidence: Math.min(Math.abs(macd.histogram) * 10000, 75),
        reason: `MACD bearish crossover (histogram: ${macd.histogram.toFixed(6)})`
      };
    }
    
    return { action: 'WAIT', confidence: 0 };
  }

  // Analyze Bollinger Bands
  analyzeBollingerBands(bb, currentPrice) {
    if (!bb) return { action: 'WAIT', confidence: 0 };
    
    if (currentPrice < bb.lower) {
      return {
        action: 'BUY',
        confidence: 60,
        reason: `Price below lower Bollinger Band (${bb.lower.toFixed(5)})`
      };
    } else if (currentPrice > bb.upper) {
      return {
        action: 'SELL',
        confidence: 60,
        reason: `Price above upper Bollinger Band (${bb.upper.toFixed(5)})`
      };
    }
    
    return { action: 'WAIT', confidence: 0 };
  }

  // Analyze momentum
  analyzeMomentum(momentum) {
    const threshold = 0.5; // 0.5% momentum threshold
    
    if (momentum > threshold) {
      return {
        action: 'BUY',
        confidence: Math.min(momentum * 20, 65),
        reason: `Positive momentum: ${momentum.toFixed(2)}%`
      };
    } else if (momentum < -threshold) {
      return {
        action: 'SELL',
        confidence: Math.min(Math.abs(momentum) * 20, 65),
        reason: `Negative momentum: ${momentum.toFixed(2)}%`
      };
    }
    
    return { action: 'WAIT', confidence: 0 };
  }

  // Analyze volatility
  analyzeVolatility(volatility) {
    // Low volatility = less confidence
    // High volatility = less confidence (too risky)
    const optimalVolatility = 0.15; // 15% annualized
    const volatilityScore = Math.max(0, 1 - Math.abs(volatility - optimalVolatility) / optimalVolatility);
    
    return {
      volatilityScore,
      reason: `Volatility: ${(volatility * 100).toFixed(1)}%`
    };
  }

  // Combine multiple signals
  combineSignals(signals, volatilitySignal) {
    const buySignals = signals.filter(s => s.action === 'BUY');
    const sellSignals = signals.filter(s => s.action === 'SELL');
    
    let action = 'WAIT';
    let reasons = [];
    
    if (buySignals.length > sellSignals.length) {
      action = 'BUY';
      reasons = buySignals.map(s => s.reason);
    } else if (sellSignals.length > buySignals.length) {
      action = 'SELL';
      reasons = sellSignals.map(s => s.reason);
    }
    
    // Apply volatility filter
    const volatilityAdjustedConfidence = signals.length > 0 
      ? (signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length) * volatilitySignal.volatilityScore
      : 0;
    
    return {
      action,
      confidence: volatilityAdjustedConfidence,
      reason: reasons.join('; ') || 'No clear signal detected'
    };
  }

  // Calculate take profit level
  calculateTakeProfit(currentPrice, action, volatility) {
    const riskRewardRatio = 2; // 1:2 risk/reward ratio
    const volatilityAdjustment = 1 + (volatility * 2); // Adjust for volatility
    
    if (action === 'BUY') {
      return currentPrice * (1 + (0.01 * riskRewardRatio * volatilityAdjustment));
    } else if (action === 'SELL') {
      return currentPrice * (1 - (0.01 * riskRewardRatio * volatilityAdjustment));
    }
    
    return undefined;
  }

  // Calculate stop loss level
  calculateStopLoss(currentPrice, action, volatility) {
    const riskPercent = 0.01; // 1% risk
    const volatilityAdjustment = 1 + (volatility * 2); // Adjust for volatility
    
    if (action === 'BUY') {
      return currentPrice * (1 - (riskPercent * volatilityAdjustment));
    } else if (action === 'SELL') {
      return currentPrice * (1 + (riskPercent * volatilityAdjustment));
    }
    
    return undefined;
  }

  // Get signal statistics
  getSignalStats(symbol) {
    const history = this.priceHistory.get(symbol) || [];
    
    return {
      dataPoints: history.length,
      lastUpdate: history.length > 0 ? new Date().toISOString() : null,
      volatility: history.length > 20 ? this.calculateVolatility(history.map(item => typeof item === 'number' ? item : item.price)) : 0,
      trend: history.length > 10 ? this.calculateTrend(history.slice(-10).map(item => typeof item === 'number' ? item : item.price)) : 'NEUTRAL'
    };
  }

  // Calculate trend direction
  calculateTrend(prices) {
    if (prices.length < 2) return 'NEUTRAL';
    
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const change = (lastPrice - firstPrice) / firstPrice;
    
    if (change > 0.005) return 'UP';
    if (change < -0.005) return 'DOWN';
    return 'NEUTRAL';
  }
}

// Export singleton instance
const signalEngine = new SignalEngine();

module.exports = {
  signalEngine
};
