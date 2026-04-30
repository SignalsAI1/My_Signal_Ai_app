# 🚀 My Ai Signal - AI-Powered Forex Trading Platform

A complete full-stack web platform for AI-powered Forex trading signals with Telegram Mini App integration.

## 🌟 Features

- **🏦 Broker-Style Signal Engine**: Professional-grade signals with EMA 50/200, RSI, MACD, Bollinger Bands
- **🔄 Multi-Source Data Engine**: Pocket API → Twelve Data → WebSocket → Cache with automatic failover
- **📊 Real-time Market Data**: Live Forex prices with intelligent source switching
- **🎯 Precise Entry Points**: Broker-style timing with entry windows and expiry suggestions
- **🔐 User Verification System**: Secure approval workflow with affiliate integration
- **👤 Hidden Admin Panel**: User management and approval system
- **📱 Telegram Mini App**: Mobile-first trading experience
- **🌐 WebSocket Real-time**: Live data streaming with source status indicators
- **🎨 Dark Neon UI**: Modern glassmorphism design with animations
- **📱 Mobile Responsive**: Optimized for all devices
- **⚡ Instant Loading**: Simple HTML interface for immediate functionality

## 📋 Project Structure

```
My_Signal_Ai_app/
├── backend/
│   └── index.js              # Express server with WebSocket
├── frontend/
│   ├── public/
│   │   ├── simple.html       # Main working interface
│   │   ├── app.html          # Advanced React interface
│   │   └── index.html        # Basic HTML template
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js     # Live status header
│   │   │   ├── Hero.js       # Landing section
│   │   │   ├── Dashboard.js  # Trading dashboard
│   │   │   └── VerifyUI.js   # User verification
│   │   ├── styles/
│   │   │   └── App.css       # Dark neon styling
│   │   ├── App.js            # Main React app
│   │   └── index.js          # React bootstrap
│   └── package.json          # Frontend dependencies
├── engine/
│   ├── signal.js             # Broker-style signal engine
│   └── signal-old.js         # Previous signal engine
├── market/
│   ├── data.js               # Multi-source data engine
│   └── data-old.js           # Previous market data
├── storage/
│   └── db.json               # JSON database
├── shared/
│   └── utils.js              # Shared utilities
├── telegram/
│   └── app.js                # Telegram Mini App SDK
├── .env.example              # Environment variables template
└── package.json              # Main project dependencies
```

## 🛠️ Technology Stack

### Backend
- **Node.js** + **Express** - Server framework
- **WebSocket** - Real-time communication
- **Axios** - HTTP client for API calls
- **JSON Storage** - Simple file-based database

### Frontend
- **React 18** - UI framework
- **CSS3** - Dark neon animations
- **WebSocket Client** - Real-time data
- **LocalStorage** - User session management

### APIs & Services
- **Twelve Data** - Real-time Forex data
- **Telegram WebApp SDK** - Mini App integration

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install main dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your API keys
TWELVE_DATA_API_KEY=your_twelve_data_api_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
ADMIN_TOKEN=your_admin_token
JWT_SECRET=your_jwt_secret
PORT=3001
```

### 3. Start Development Server

```bash
# Start the application
npm run dev

# Or production
npm start
```

### 4. Access the Application

- **Main App**: http://localhost:3001
- **Admin Panel**: http://localhost:3001/secret-admin?token=YOUR_ADMIN_TOKEN

## 📡 API Endpoints

### Market Data
- `GET /api/market` - Get current market data
- `GET /api/signal` - Get AI trading signals

### User Verification
- `POST /api/verify-id` - Submit verification request
- `GET /api/verify-status/:id` - Check verification status

### Admin Panel
- `GET /api/admin/users?token=ADMIN_TOKEN` - Get all users/requests
- `POST /api/admin/approve?token=ADMIN_TOKEN` - Approve user
- `POST /api/admin/reject?token=ADMIN_TOKEN` - Reject user

## 🔄 Multi-Source Data Engine

The platform uses a sophisticated failover system for maximum reliability:

### Data Sources Priority:
1. **Pocket API** (Primary) - Professional market data
2. **Twelve Data API** (Backup) - Real-time Forex data
3. **WebSocket** (Live) - Streaming market updates
4. **Cache** (Fallback) - Last known good data

### Automatic Failover Logic:
```
try pocket → if fail → try twelve → if fail → try websocket → if fail → cache
```

### Auto-Recovery:
- Every 30 seconds attempts to recover to primary source
- Seamless switching without service interruption
- Visual source indicators in the UI

## 🏦 Broker-Style Signal Engine

Professional-grade signal generation with real market analysis:

### Technical Indicators:
- **EMA 50/200** - Trend filter (mandatory for signals)
- **RSI** - Momentum confirmation (30-50 for BUY, 50-70 for SELL)
- **MACD** - Entry/exit confirmation
- **Bollinger Bands** - Entry zones (support/resistance)
- **Volatility** - Market condition filter

### Signal Logic:
- **BUY**: EMA50 > EMA200 + RSI 30-50 + MACD bullish + near lower BB + low volatility
- **SELL**: EMA50 < EMA200 + RSI 50-70 + MACD bearish + near upper BB + normal volatility
- **WAIT**: Flat market or conflicting indicators

### Confidence Scoring:
- EMA = 30%, RSI = 20%, MACD = 25%, Bollinger = 15%, Volatility = 10%
- 75-90% = Normal signals, 90%+ = Strong broker-grade signals

### Timing Features:
- Entry window: 5-15 seconds based on volatility
- Expiry suggestions: 1m/5m/15m based on trend strength
- 30-second cooldown between signals per pair

## 🧠 AI Signal Engine

### Technical Indicators
- **EMA (12/26)**: Exponential Moving Average crossover
- **RSI (14)**: Overbought/Oversold detection
- **MACD**: Momentum analysis
- **Volatility**: Market volatility filter

### Signal Logic
- **BUY**: EMA fast > slow + RSI < 30 + MACD bullish
- **SELL**: EMA fast < slow + RSI > 70 + MACD bearish
- **WAIT**: Mixed or weak signals

### Confidence Calculation
- **90%+**: 4 indicators aligned
- **60-80%**: 2-3 indicators aligned
- **0%**: Weak or conflicting signals

## 🎨 UI/UX Features

### Dark Neon Theme
- Black background with blue/purple gradients
- Glassmorphism effects
- Animated floating particles
- Pulsating glow effects
- Smooth transitions

### Components
- **Header**: Live status indicators
- **Hero**: Landing section with CTA
- **Dashboard**: Real-time trading data
- **Verify UI**: User verification workflow

## 📱 Telegram Mini App

### Features
- Mobile-optimized interface
- Haptic feedback
- Native sharing
- Keyboard handling
- Theme adaptation

### Integration
```javascript
// Access Telegram Mini App features
window.telegramApp.showMainButton('Get Signal');
window.telegramApp.hapticImpact('light');
window.telegramApp.showAlert('Signal generated!');
```

## 🔐 Security Features

- **Admin Token Protection**: Secure admin panel access
- **User Verification**: Approval workflow system
- **Input Sanitization**: XSS protection
- **Rate Limiting**: API request throttling
- **CORS Configuration**: Cross-origin protection

## 📊 Market Data

### Supported Pairs
- EUR/USD
- GBP/USD
- USD/JPY
- USD/CHF
- AUD/USD
- USD/CAD

### Data Features
- Real-time prices
- Volume data
- Historical data
- Fallback system
- Caching mechanism

## 🚀 Deployment

### Single Server Deployment
```bash
# Build frontend
cd frontend && npm run build

# Start server
cd .. && npm start
```

### Environment Variables
```bash
NODE_ENV=production
PORT=3001
TWELVE_DATA_API_KEY=your_key
TELEGRAM_BOT_TOKEN=your_token
ADMIN_TOKEN=secure_token
JWT_SECRET=jwt_secret
```

## 🧪 Testing

### Manual Testing
1. Visit http://localhost:3001
2. Complete user verification
3. View real-time signals
4. Test admin panel

### API Testing
```bash
# Test market data
curl http://localhost:3001/api/market

# Test signals
curl http://localhost:3001/api/signal

# Test verification
curl -X POST http://localhost:3001/api/verify-id \
  -H "Content-Type: application/json" \
  -d '{"userId":"test123","promoCode":"LRQ740"}'
```

## 🔄 Real-time Features

### WebSocket Events
- `market_update`: Live market data
- `signal_update`: AI signal changes
- `user_status`: Verification updates

### Update Frequency
- Market data: Every 2 seconds
- Signals: Every 2 seconds
- User status: On change

## 📈 Performance

### Optimization
- Data caching (1 minute TTL)
- WebSocket connection pooling
- Efficient signal calculation
- Minimal DOM updates
- Lazy loading components

### Monitoring
- Real-time connection status
- API response times
- Error tracking
- User activity logs

## 🛠️ Development

### Adding New Indicators
```javascript
// In engine/signal.js
calculateNewIndicator(data, period) {
  // Your indicator logic
  return value;
}
```

### Adding New Pairs
```javascript
// In market/data.js
const FOREX_PAIRS = [
  'EUR/USD',
  'GBP/USD',
  'USD/JPY',
  'USD/CHF',
  'AUD/USD',
  'USD/CAD',
  'NEW/PAIR'  // Add here
];
```

## 📞 Support

### Common Issues
1. **API Key Errors**: Check Twelve Data API key
2. **WebSocket Issues**: Verify port availability
3. **Permission Errors**: Check file permissions
4. **Build Errors**: Clear node_modules and reinstall

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev
```

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make your changes
4. Add tests
5. Submit pull request

---

**🎉 Congratulations! Your AI Signal Trading Platform is ready!**

For additional help, create an issue in the repository or contact support.
