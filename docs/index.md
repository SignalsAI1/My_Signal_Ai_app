# My AI Signal Trading Platform

🚀 **AI-Powered Forex Trading Signals Platform**

## 📋 Overview

Complete trading signals platform with:
- **Real-time AI signals** for Forex markets
- **User verification system** with broker integration  
- **Admin panel** for user management
- **Telegram Mini App** for mobile access
- **Dark neon fintech design** with glassmorphism effects

## 🎯 Features

### 🤖 AI Signal Engine
- Technical indicators (SMA, EMA, RSI, MACD, Bollinger Bands)
- Real-time market data via Twelve Data API
- Confidence scoring and risk management
- Auto-refresh every 2 seconds

### 👥 User Management
- Broker ID verification system
- JWT authentication
- Access control for premium signals
- Admin panel for user approvals

### 📱 Frontend
- React + TypeScript
- Dark neon fintech theme
- Candlestick charts with Lightweight Charts
- Responsive design for all devices
- Telegram WebApp SDK integration

### 🔧 Backend
- Node.js + Express API
- Environment-based configuration
- Rate limiting and security
- Real-time WebSocket updates

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Twelve Data API key
- Telegram Bot Token (optional)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/SignalsAI1/My_Signal_Ai_app.git
cd My_Signal_Ai_app
```

2. **Install dependencies**
```bash
# Root dependencies
npm install

# Frontend dependencies
cd frontend && npm install

# Backend dependencies  
cd ../backend && npm install
```

3. **Configure environment**
```bash
# Copy environment template
cp .env.example .env

# Edit with your keys
TWELVE_DATA_API_KEY=your_api_key
ADMIN_TOKEN=your_admin_token
JWT_SECRET=your_jwt_secret
```

4. **Start development servers**
```bash
# Backend (port 3001)
cd backend && npm run dev

# Frontend (port 3000)
cd frontend && npm start
```

## 📁 Project Structure

```
My_Signal_Ai_app/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/          # Page components
│   │   └── types/          # TypeScript types
│   └── public/             # Static files
├── backend/                 # Node.js API
│   ├── __tests__/          # Backend tests
│   └── index.js            # Main server file
├── engine/                  # AI signal engine
├── market/                  # Market data module
├── telegram/                # Telegram Mini App
├── shared/                  # Shared utilities
└── docs/                    # Documentation
```

## 🔐 Environment Variables

```env
# API Keys
TWELVE_DATA_API_KEY=your_twelve_data_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Security
ADMIN_TOKEN=your_admin_token
JWT_SECRET=your_jwt_secret

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## 🌐 API Endpoints

### Market Data
- `GET /api/market` - Get all market data
- `POST /api/signal` - Get AI signal (requires auth)

### User Management
- `POST /api/register` - Register new user
- `POST /api/verify-id` - Submit broker ID for verification
- `GET /api/verify-status` - Check verification status

### Admin Panel
- `GET /api/admin/users` - List all users (admin only)
- `POST /api/admin/approve` - Approve user (admin only)
- `POST /api/admin/reject` - Reject user (admin only)

## 📱 Telegram Integration

### Mini App Features
- WebApp SDK integration
- Mobile-optimized interface
- Real-time signal updates
- Broker integration with promo codes

### Setup
1. Create Telegram Bot
2. Set Webhook to your backend
3. Configure Mini App in BotFather
4. Use provided Mini App URL

## 🔧 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy to Vercel
```

### Backend (Render)
```bash
cd backend
npm start
# Deploy to Render
```

### GitHub Actions
- **CI/CD pipeline** configured
- **Automated testing** on push
- **Auto-deployment** to production
- **Environment variables** in GitHub Secrets

## 🧪 Testing

```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test

# Coverage reports
npm test -- --coverage
```

## 📊 Supported Currency Pairs

- EUR/USD - Euro/US Dollar
- GBP/USD - British Pound/US Dollar  
- USD/JPY - US Dollar/Japanese Yen
- USD/CHF - US Dollar/Swiss Franc
- AUD/USD - Australian Dollar/US Dollar
- USD/CAD - US Dollar/Canadian Dollar

## 🎨 Design System

### Theme
- **Dark neon fintech** aesthetic
- **Glassmorphism** effects
- **Glowing buttons** and animations
- **Responsive** mobile-first design

### Colors
- Primary: `#00d4ff` (Cyan)
- Secondary: `#00ff88` (Green)  
- Accent: `#ffaa00` (Orange)
- Danger: `#ff4444` (Red)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make your changes
4. Add tests if applicable
5. Submit pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **Documentation**: [GitHub Wiki]
- **Issues**: [GitHub Issues]
- **Discord**: [Join our community]

## 📞 Support

- 📧 Email: support@aisignal.com
- 💬 Discord: [Community Server]
- 📱 Telegram: [@AI_Signal_Bot]

---

**Built with ❤️ by Signals AI Team**

*© 2024 My AI Signal Trading Platform. All rights reserved.*
