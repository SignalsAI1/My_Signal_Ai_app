# Pocket Signals Bot

AI-powered trading signals bot for Pocket Option with Telegram integration and real-time currency quotes.

## Features

- ✅ **ID Verification**: Automatic verification of Pocket Option IDs against partner statistics
- ✅ **Real-time Currency Quotes**: Live exchange rates for all major currency pairs
- ✅ **All Pocket Option Assets**: EUR/USD, GBP/USD, USD/JPY, USD/CHF, AUD/USD, USD/CAD, NZD/USD, and cross pairs
- ✅ **All Expiration Times**: 1min, 2min, 3min, 5min, 10min, 15min, 30min, 1h, 2h, 4h, 8h, 1day
- ✅ **Automated Trading**: Direct execution of trades via Pocket Option API
- ✅ **User Management**: SQLite database with user verification status
- ✅ **Web Interface**: Modern responsive web app with real-time signals
- ✅ **Referral Sync**: Automated synchronization of referral data

## Trading Assets

**Major Currency Pairs:**
- EUR/USD, GBP/USD, USD/JPY, USD/CHF, AUD/USD, USD/CAD, NZD/USD

**Cross Currency Pairs:**
- EUR/JPY, GBP/JPY, EUR/GBP, AUD/JPY, CAD/JPY, CHF/JPY, NZD/JPY

## Expiration Times

- 1 хвилина, 2 хвилини, 3 хвилини
- 5 хвилин, 10 хвилин, 15 хвилин, 30 хвилин
- 1 година, 2 години, 4 години, 8 годин
- 1 день

## Commands

- `/start` - Start the bot and check verification status
- `/sync` - Manually sync referral data (admin only)

## How It Works

1. **User Registration**: User sends Pocket Option ID to bot
2. **ID Verification**: Bot checks ID against partner statistics using Playwright
3. **Access Granted**: Verified users get access to AI Signal Terminal
4. **Real-time Quotes**: Web app displays live currency exchange rates
5. **Trading**: Users can execute trades with all Pocket Option assets and expiration times
6. **AI Signals**: Real-time trading signals with current market prices

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Configure environment variables in `.env` file:
   - BOT_TOKEN
   - PARTNER_LOGIN
   - PARTNER_PASSWORD
   - PARTNER_STATS_URL
   - ADMIN_SSID

3. Run the bot:
   ```bash
   cd src
   python bot.py
   ```

## Web App Features

- **Real Exchange Rates**: Fetched from exchangerate-api.com every minute
- **All Currency Pairs**: Complete list of Pocket Option trading assets
- **All Expiration Times**: Full range of trading timeframes
- **AI Signals**: Intelligent trading recommendations with price data
- **Modern UI**: Pocket Option-style interface with animations

## Database Schema

```sql
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY,
    pocket_id TEXT,
    is_active INTEGER DEFAULT 0
);
```
```bash
cd src
python bot.py
```

## Deployment

1. **GitHub Pages**: Files in `docs/` are ready for GitHub Pages deployment
2. **Bot**: Deploy to your server with environment variables configured
3. **Domain**: Update `web_app_url` in `bot.py` with your deployed URL

## Features

- **AI Signals**: Simulated AI trading signals with random updates
- **Trade Execution**: Integration with Pocket Option API via WebSocket
- **User Management**: SQLite database for user Pocket IDs
- **Referral Sync**: Automated referral data synchronization
- **Web Interface**: Modern responsive web app for mobile trading
