import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders AI Signal Trading Platform', () => {
  render(<App />);
  const titleElement = screen.getByText(/AI Trading Signals/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders main navigation elements', () => {
  render(<App />);
  expect(screen.getByText(/Live Signal/i)).toBeInTheDocument();
});

test('renders broker button with promo code', () => {
  render(<App />);
  expect(screen.getByText(/LRQ740/i)).toBeInTheDocument();
});
