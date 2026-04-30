class SignalEngine {
  constructor() {
    this.indicators = {
      ema: this.calculateEMA.bind(this),
      rsi: this.calculateRSI.bind(this),
      macd: this.calculateMACD.bind(this),
      volatility: this.calculateVolatility.bind(this)
    };
  }

  // EMA (Exponential Moving Average)
  calculateEMA(data, period) {
    if (!data || data.length < period) return null;
    
    const prices = data.map(d => d.close);
    const ema = [];
    
    // Start with SMA
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += prices[i];
    }
    ema[period - 1] = sum / period;
    
    // Calculate EMA
    const multiplier = 2 / (period + 1);
    for (let i = period; i < prices.length; i++) {
      ema[i] = (prices[i] * multiplier) + (ema[i - 1] * (1 - multiplier));
    }
    
    return ema[ema.length - 1];
  }

  // RSI (Relative Strength Index)
  calculateRSI(data, period = 14) {
    if (!data || data.length < period + 1) return null;
    
    const prices = data.map(d => d.close);
    const gains = [];
    const losses = [];
    
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;
    
    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    
    return rsi;
  }

  // MACD (Moving Average Convergence Divergence)
  calculateMACD(data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    if (!data || data.length < slowPeriod) return null;
    
    const prices = data.map(d => d.close);
    
    // Calculate EMAs
    const fastEMA = this.calculateEMA(data, fastPeriod);
    const slowEMA = this.calculateEMA(data, slowPeriod);
    
    if (!fastEMA || !slowEMA) return null;
    
    const macdLine = fastEMA - slowEMA;
    
    // For simplicity, return MACD line
    return {
      macd: macdLine,
      signal: macdLine * 0.9, // Simplified signal calculation
      histogram: macdLine * 0.1 // Simplified histogram
    };
  }

  // Volatility
  calculateVolatility(data, period = 20) {
    if (!data || data.length < period) return null;
    
    const prices = data.slice(-period).map(d => d.close);
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    
    const variance = prices.reduce((sum, price) => {
      return sum + Math.pow(price - mean, 2);
    }, 0) / prices.length;
    
    const volatility = Math.sqrt(variance);
    return (volatility / mean) * 100; // Percentage
  }

  // Analyze single pair
  analyzePair(pairData) {
    if (!pairData || !pairData.historical || pairData.historical.length < 50) {
      return {
        symbol: pairData.symbol,
        signal: 'WAIT',
        confidence: 0,
        reason: 'Insufficient data',
        price: pairData.price || 0,
        change: pairData.change || 0,
        changePercent: pairData.changePercent || 0
      };
    }

    const historical = pairData.historical;
    
    // Calculate indicators
    const emaFast = this.calculateEMA(historical, 12);
    const emaSlow = this.calculateEMA(historical, 26);
    const rsi = this.calculateRSI(historical, 14);
    const macd = this.calculateMACD(historical);
    const volatility = this.calculateVolatility(historical, 20);

    // Signal logic
    const signals = [];
    let confidence = 0;

    // EMA Crossover
    if (emaFast && emaSlow) {
      if (emaFast > emaSlow) {
        signals.push('BUY');
        confidence += 25;
      } else {
        signals.push('SELL');
        confidence += 25;
      }
    }

    // RSI
    if (rsi) {
      if (rsi < 30) {
        signals.push('BUY');
        confidence += 25;
      } else if (rsi > 70) {
        signals.push('SELL');
        confidence += 25;
      } else {
        signals.push('WAIT');
      }
    }

    // MACD
    if (macd) {
      if (macd.macd > macd.signal && macd.histogram > 0) {
        signals.push('BUY');
        confidence += 25;
      } else if (macd.macd < macd.signal && macd.histogram < 0) {
        signals.push('SELL');
        confidence += 25;
      } else {
        signals.push('WAIT');
      }
    }

    // Volatility filter
    if (volatility && volatility > 2) {
      confidence = Math.max(confidence - 10, 0);
    }

    // Determine final signal
    const buySignals = signals.filter(s => s === 'BUY').length;
    const sellSignals = signals.filter(s => s === 'SELL').length;
    const waitSignals = signals.filter(s => s === 'WAIT').length;

    let finalSignal = 'WAIT';
    if (buySignals >= 3) {
      finalSignal = 'BUY';
    } else if (sellSignals >= 3) {
      finalSignal = 'SELL';
    }

    // Adjust confidence based on signal strength
    if (finalSignal === 'BUY' || finalSignal === 'SELL') {
      if (confidence >= 75) {
        confidence = Math.min(confidence + 15, 95);
      } else if (confidence >= 50) {
        confidence = Math.min(confidence + 10, 85);
      }
    } else {
      confidence = Math.max(confidence - 20, 0);
    }

    // Generate reason
    let reason = '';
    if (finalSignal === 'BUY') {
      reason = 'Strong bullish indicators detected';
      if (rsi < 30) reason += ' (RSI oversold)';
      if (emaFast > emaSlow) reason += ' (EMA crossover)';
      if (macd.macd > macd.signal) reason += ' (MACD bullish)';
    } else if (finalSignal === 'SELL') {
      reason = 'Strong bearish indicators detected';
      if (rsi > 70) reason += ' (RSI overbought)';
      if (emaFast < emaSlow) reason += ' (EMA crossover)';
      if (macd.macd < macd.signal) reason += ' (MACD bearish)';
    } else {
      reason = 'Mixed signals - waiting for confirmation';
    }

    return {
      symbol: pairData.symbol,
      signal: finalSignal,
      confidence: Math.round(confidence),
      reason,
      price: pairData.price || 0,
      change: pairData.change || 0,
      changePercent: pairData.changePercent || 0,
      indicators: {
        emaFast: emaFast ? parseFloat(emaFast.toFixed(5)) : null,
        emaSlow: emaSlow ? parseFloat(emaSlow.toFixed(5)) : null,
        rsi: rsi ? parseFloat(rsi.toFixed(2)) : null,
        macd: macd ? {
          macd: parseFloat(macd.macd.toFixed(5)),
          signal: parseFloat(macd.signal.toFixed(5)),
          histogram: parseFloat(macd.histogram.toFixed(5))
        } : null,
        volatility: volatility ? parseFloat(volatility.toFixed(2)) : null
      }
    };
  }

  // Generate signals for all pairs
  async generateSignals(marketData) {
    if (!marketData || !marketData.pairs) {
      return { signals: [], timestamp: new Date().toISOString(), status: 'error' };
    }

    const signals = [];
    
    // Get historical data for each pair
    for (const pair of marketData.pairs) {
      try {
        const historicalData = await this.getHistoricalData(pair.symbol);
        const pairData = {
          ...pair,
          historical: historicalData
        };
        
        const signal = this.analyzePair(pairData);
        signals.push(signal);
      } catch (error) {
        console.error(`Error generating signal for ${pair.symbol}:`, error);
        signals.push({
          symbol: pair.symbol,
          signal: 'WAIT',
          confidence: 0,
          reason: 'Data unavailable',
          price: pair.price || 0,
          change: pair.change || 0,
          changePercent: pair.changePercent || 0
        });
      }
    }

    // Sort by confidence
    signals.sort((a, b) => b.confidence - a.confidence);

    return {
      signals,
      timestamp: new Date().toISOString(),
      status: 'success',
      summary: {
        total: signals.length,
        buy: signals.filter(s => s.signal === 'BUY').length,
        sell: signals.filter(s => s.signal === 'SELL').length,
        wait: signals.filter(s => s.signal === 'WAIT').length
      }
    };
  }

  // Get historical data (simplified version)
  async getHistoricalData(symbol) {
    // This would typically fetch from market data service
    // For now, generate mock data
    const data = [];
    const now = Date.now();
    let basePrice = 1.0850; // Default base price

    // Adjust base price based on symbol
    const basePrices = {
      'EUR/USD': 1.0850,
      'GBP/USD': 1.2650,
      'USD/JPY': 149.50,
      'USD/CHF': 0.8750,
      'AUD/USD': 0.6550,
      'USD/CAD': 1.3650
    };
    basePrice = basePrices[symbol] || 1.0850;

    for (let i = 100; i >= 0; i--) {
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

module.exports = new SignalEngine();
