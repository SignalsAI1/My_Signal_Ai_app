import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts';

interface ChartProps {
  symbol: string;
  data: any[];
  height?: number;
}

const Chart: React.FC<ChartProps> = ({ symbol, data, height = 400 }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) {
      return;
    }

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#ffffff',
        fontSize: 12,
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.1)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          width: 1,
          color: 'rgba(255, 255, 255, 0.2)',
          style: 0,
        },
        horzLine: {
          width: 1,
          color: 'rgba(255, 255, 255, 0.2)',
          style: 0,
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textColor: '#ffffff',
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textColor: '#ffffff',
        timeVisible: true,
        secondsVisible: true,
      },
      overlayPriceScales: {
        ticksVisible: false,
        borderVisible: false,
      },
      localization: {
        priceFormatter: (price: number) => price.toFixed(5),
      },
    });

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#00ff88',
      downColor: '#ff4444',
      borderDownColor: '#ff4444',
      borderUpColor: '#00ff88',
      wickDownColor: '#ff4444',
      wickUpColor: '#00ff88',
    });

    // Add volume series
    const volumeSeries = chart.addHistogramSeries({
      color: 'rgba(0, 212, 255, 0.4)',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      scaleMargins: {
        top: 0.85,
        bottom: 0,
      },
    });

    // Convert data to chart format
    const candlestickData = data.map(item => ({
      time: new Date(item.timestamp).getTime() / 1000,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    }));

    const volumeData = data.map(item => ({
      time: new Date(item.timestamp).getTime() / 1000,
      value: item.volume,
      color: item.close >= item.open ? 'rgba(0, 255, 136, 0.4)' : 'rgba(255, 68, 68, 0.4)',
    }));

    // Set data
    candlestickSeries.setData(candlestickData);
    volumeSeries.setData(volumeData);

    // Fit content
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Store chart reference
    chartRef.current = chart;
    setIsLoading(false);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, height]);

  // Generate mock data for demonstration
  const generateMockData = () => {
    const mockData = [];
    const now = Date.now();
    let basePrice = 1.0850;

    for (let i = 100; i >= 0; i--) {
      const timestamp = now - (i * 60000); // 1 minute intervals
      const variation = (Math.random() - 0.5) * 0.001;
      
      const open = basePrice;
      const close = basePrice + variation;
      const high = Math.max(open, close) + (Math.random() * 0.0005);
      const low = Math.min(open, close) - (Math.random() * 0.0005);
      const volume = Math.floor(Math.random() * 1000000) + 500000;

      mockData.push({
        timestamp: new Date(timestamp).toISOString(),
        open,
        high,
        low,
        close,
        volume,
      });

      basePrice = close;
    }

    return mockData;
  };

  // Use mock data if no real data provided
  const chartData = data && data.length > 0 ? data : generateMockData();

  return (
    <div className="chart-container">
      {isLoading && (
        <div className="chart-loading">
          <div className="loading-spinner"></div>
          <p>Loading chart data...</p>
        </div>
      )}
      <div ref={chartContainerRef} className="chart" />
    </div>
  );
};

export default Chart;
