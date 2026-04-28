# Pocket Signals Bot

AI-powered trading signals bot for Pocket Option with Telegram integration and ID verification.

## Features

- ✅ **ID Verification**: Automatic verification of Pocket Option IDs against partner statistics
- ✅ **Real-time Signals**: AI-powered trading signals with asset analysis
- ✅ **Automated Trading**: Direct execution of trades via Pocket Option API
- ✅ **User Management**: SQLite database with user verification status
- ✅ **Web Interface**: Modern responsive web app for mobile trading
- ✅ **Referral Sync**: Automated synchronization of referral data

## Commands

- `/start` - Start the bot and check verification status
- `/sync` - Manually sync referral data (admin only)

## How It Works

1. **User Registration**: User sends Pocket Option ID to bot
2. **ID Verification**: Bot checks ID against partner statistics using Playwright
3. **Access Granted**: Verified users get access to AI Signal Terminal
4. **Trading**: Users can execute trades directly from Telegram WebApp
5. **Real Signals**: AI generates trading signals based on market analysis

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

## Web App Deployment

The web app is ready for GitHub Pages deployment in the `docs/` folder.

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
