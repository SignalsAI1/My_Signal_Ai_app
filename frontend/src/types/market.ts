export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
  high: number;
  low: number;
  volume: number;
}

export interface CurrencyPair {
  symbol: string;
  name: string;
  base: string;
  quote: string;
}
