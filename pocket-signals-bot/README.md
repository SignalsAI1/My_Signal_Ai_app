# Pocket Signals Bot

AI-powered trading signals bot for Pocket Option with Telegram integration.

## Features

- Telegram bot for user interaction
- Web app interface for trading signals
- Pocket Option API integration for automated trading
- Referral system synchronization
- SQLite database for user management

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Configure environment variables in `.env` file

3. Run the bot:
   ```bash
   cd src
   python bot.py
   ```

## Web App Deployment

The web app is located in the `docs/` directory at the repository root and is configured for GitHub Pages.

1. Enable GitHub Pages in repository settings:
   - Go to Settings > Pages
   - Source: Deploy from a branch
   - Branch: main, folder: /docs

2. The web app will be available at: `https://signalsai1.github.io/My_Signal_Ai_app/`

3. Update the `web_app_url` in `bot.py` if needed.

## Local Testing

To test the web app locally:
```bash
cd docs
python -m http.server 8000
```
Then open http://localhost:8000 in browser.

To test the bot:
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
