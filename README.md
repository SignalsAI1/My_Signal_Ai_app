# My AI Signal

AI-powered Forex trading signals Telegram Mini App + Web Platform

## Features

- Real-time Forex market data
- AI-powered trading signals
- Telegram Mini App integration
- Live candlestick charts
- Dark neon fintech design
- Mobile-first responsive design

## Project Structure

```
/project-root
|
|-- frontend/          # React application
|-- backend/           # Node.js + Express API
|-- engine/            # AI signal engine
|-- market/            # Market data module
|-- telegram/          # Telegram Mini App
|-- shared/            # Shared utilities
```

## Quick Start

1. Clone the repository
2. Install dependencies: `npm run install:all`
3. Set up environment variables from `.env.example`
4. Start development: `npm run dev`

## Environment Variables

Copy `.env.example` to `.env` and fill in your API keys:

- `ALPHA_VANTAGE_API_KEY` - Alpha Vantage API key
- `TWELVE_DATA_API_KEY` - Twelve Data API key
- `DATABASE_URL` - Database connection string
- `JWT_SECRET` - JWT secret key
- `TELEGRAM_BOT_TOKEN` - Telegram bot token

## API Endpoints

- `GET /api/market` - Get market data
- `GET /api/signal` - Get AI signals
- `POST /api/register` - User registration

## Supported Currency Pairs

- EUR/USD
- GBP/USD
- USD/JPY
- USD/CHF
- AUD/USD
- USD/CAD

## Deployment

- Frontend: Vercel
- Backend: Render

## License

MIT
