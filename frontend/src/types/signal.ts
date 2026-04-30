export interface Signal {
  symbol: string;
  action: 'BUY' | 'SELL' | 'WAIT';
  confidence: number;
  reason: string;
  timestamp: string;
  price: number;
  takeProfit?: number;
  stopLoss?: number;
  timeFrame: string;
}

export interface SignalHistory {
  id: string;
  signal: Signal;
  result: 'WIN' | 'LOSS' | 'PENDING';
  profit?: number;
  closePrice?: number;
  closeTimestamp?: string;
}
