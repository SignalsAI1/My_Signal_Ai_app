// Backend API Server for My AI Signal
// Node.js + Express with real-time market data and AI signals

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const cron = require('node-cron');

// Import modules
const { marketDataService } = require('../market/data');
const { signalEngine } = require('../engine/signal');
const { verificationSystem } = require('./verify');
const { adminPanel } = require('./admin');

const app = express();
const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET;

// Validate required environment variables
if (!PORT) {
  throw new Error('PORT not configured in .env file');
}
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET not configured in .env file');
}

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://telegram.org"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://www.alphavantage.co", "https://api.twelvedata.com"],
    },
  },
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

app.use('/api/', limiter);

// In-memory storage (in production, use Redis or database)
const users = new Map();
const signalHistory = new Map();
const userSessions = new Map();

// Helper functions
const generateUserId = () => uuidv4();
const generateToken = (userId) => jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  req.userId = decoded.userId;
  next();
};

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// User registration
app.post('/api/register', async (req, res) => {
  try {
    const { telegramId, username, firstName, lastName } = req.body;
    
    if (!telegramId) {
      return res.status(400).json({ error: 'Telegram ID is required' });
    }

    // Check if user already exists
    const existingUser = Array.from(users.values()).find(u => u.telegramId === telegramId);
    if (existingUser) {
      const token = generateToken(existingUser.userId);
      return res.json({
        userId: existingUser.userId,
        token,
        message: 'User already exists'
      });
    }

    // Create new user
    const userId = generateUserId();
    const user = {
      userId,
      telegramId,
      username: username || `user_${userId.slice(0, 8)}`,
      firstName: firstName || '',
      lastName: lastName || '',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      signalCount: 0,
      winRate: 0
    };

    users.set(userId, user);
    const token = generateToken(userId);

    res.json({
      userId,
      token,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile
app.get('/api/user/profile', authenticateToken, (req, res) => {
  try {
    const user = users.get(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update last active
    user.lastActive = new Date().toISOString();
    users.set(req.userId, user);

    res.json({
      userId: user.userId,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
      signalCount: user.signalCount,
      winRate: user.winRate
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get market data
app.get('/api/market', async (req, res) => {
  try {
    const marketData = await marketDataService.fetchAllMarketData();
    res.json(marketData);
  } catch (error) {
    console.error('Market data error:', error);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});

// Get market data for specific symbol
app.get('/api/market/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const marketData = await marketDataService.fetchMarketData(symbol);
    res.json(marketData);
  } catch (error) {
    console.error('Symbol market data error:', error);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});

// Get AI signal
app.post('/api/signal', authenticateToken, async (req, res) => {
  try {
    const { symbol, timeframe = '15m' } = req.body;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    // Check if user has approved verification
    if (!verificationSystem.isUserApproved(req.userId)) {
      return res.status(403).json({ 
        error: 'NO ACCESS',
        message: 'Access denied. Please complete verification process.',
        verificationRequired: true
      });
    }

    // Get current market data
    const marketData = await marketDataService.fetchMarketData(symbol);
    
    // Update signal engine with price history
    signalEngine.updatePriceHistory(symbol, marketData.price);
    
    // Generate signal
    const signal = signalEngine.generateSignal(symbol, marketData.price, timeframe);
    
    // Store signal in history
    if (!signalHistory.has(req.userId)) {
      signalHistory.set(req.userId, []);
    }
    
    const userSignals = signalHistory.get(req.userId);
    userSignals.push({
      ...signal,
      id: uuidv4(),
      userId: req.userId,
      result: 'PENDING'
    });
    
    // Keep only last 100 signals
    if (userSignals.length > 100) {
      userSignals.shift();
    }
    
    // Update user signal count
    const user = users.get(req.userId);
    if (user) {
      user.signalCount += 1;
      users.set(req.userId, user);
    }
    
    res.json(signal);
  } catch (error) {
    console.error('Signal generation error:', error);
    res.status(500).json({ error: 'Failed to generate signal' });
  }
});

// Get signal history
app.get('/api/signals/history', authenticateToken, (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const userSignals = signalHistory.get(req.userId) || [];
    
    const limitedSignals = userSignals
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, parseInt(limit));
    
    res.json(limitedSignals);
  } catch (error) {
    console.error('Signal history error:', error);
    res.status(500).json({ error: 'Failed to fetch signal history' });
  }
});

// Update signal result
app.put('/api/signals/:signalId/result', authenticateToken, (req, res) => {
  try {
    const { signalId } = req.params;
    const { result, closePrice, closeTimestamp } = req.body;
    
    if (!['WIN', 'LOSS'].includes(result)) {
      return res.status(400).json({ error: 'Invalid result' });
    }
    
    const userSignals = signalHistory.get(req.userId) || [];
    const signal = userSignals.find(s => s.id === signalId);
    
    if (!signal) {
      return res.status(404).json({ error: 'Signal not found' });
    }
    
    signal.result = result;
    signal.closePrice = closePrice;
    signal.closeTimestamp = closeTimestamp || new Date().toISOString();
    
    // Update user win rate
    const user = users.get(req.userId);
    if (user) {
      const completedSignals = userSignals.filter(s => s.result !== 'PENDING');
      const wins = completedSignals.filter(s => s.result === 'WIN').length;
      user.winRate = completedSignals.length > 0 ? (wins / completedSignals.length) * 100 : 0;
      users.set(req.userId, user);
    }
    
    res.json({ message: 'Signal result updated successfully' });
  } catch (error) {
    console.error('Signal result update error:', error);
    res.status(500).json({ error: 'Failed to update signal result' });
  }
});

// Get supported currency pairs
app.get('/api/pairs', (req, res) => {
  try {
    const pairs = marketDataService.getCurrencyPairs();
    res.json(pairs);
  } catch (error) {
    console.error('Pairs error:', error);
    res.status(500).json({ error: 'Failed to fetch currency pairs' });
  }
});

// Create verification request
app.post('/api/verify-id', authenticateToken, (req, res) => {
  try {
    const { brokerId } = req.body;
    
    if (!brokerId) {
      return res.status(400).json({ error: 'Broker ID is required' });
    }

    // Validate broker ID format
    if (!verificationSystem.validateBrokerId(brokerId)) {
      return res.status(400).json({ 
        error: 'Invalid broker ID format',
        message: 'Please enter a valid broker ID'
      });
    }

    // Check if user already has a verification
    const existingVerification = verificationSystem.getVerificationByUserId(req.userId);
    if (existingVerification) {
      return res.json({
        verificationId: existingVerification.id,
        status: existingVerification.status,
        message: 'Verification request already exists'
      });
    }

    // Create new verification
    const verification = verificationSystem.createVerification(req.userId, brokerId);
    
    res.json({
      verificationId: verification.id,
      status: verification.status,
      message: 'Verification request submitted successfully'
    });
  } catch (error) {
    console.error('Verification creation error:', error);
    res.status(500).json({ error: 'Failed to create verification request' });
  }
});

// Get verification status
app.get('/api/verify-status', authenticateToken, (req, res) => {
  try {
    const status = verificationSystem.getUserVerificationStatus(req.userId);
    res.json(status);
  } catch (error) {
    console.error('Verification status error:', error);
    res.status(500).json({ error: 'Failed to get verification status' });
  }
});

// Admin: Get all verifications
app.get('/api/admin/verifications', authenticateToken, (req, res) => {
  try {
    // Simple admin check - in production, use proper role-based access
    const user = users.get(req.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const verifications = verificationSystem.getAllVerifications();
    res.json(verifications);
  } catch (error) {
    console.error('Admin verifications error:', error);
    res.status(500).json({ error: 'Failed to fetch verifications' });
  }
});

// Admin: Update verification status
app.put('/api/admin/verifications/:verificationId/status', authenticateToken, (req, res) => {
  try {
    const { verificationId } = req.params;
    const { status, notes } = req.body;
    
    // Simple admin check
    const user = users.get(req.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const verification = verificationSystem.updateVerificationStatus(
      verificationId, 
      status, 
      user.userId, 
      notes
    );
    
    res.json({
      message: 'Verification status updated successfully',
      verification
    });
  } catch (error) {
    console.error('Admin verification update error:', error);
    res.status(500).json({ error: 'Failed to update verification status' });
  }
});

// Admin Panel Routes

// GET /api/admin/users - Get all users with verification status
app.get('/api/admin/users', adminPanel.authenticateAdmin, (req, res) => {
  try {
    const users = adminPanel.getUsers();
    res.json(users);
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST /api/admin/approve - Approve user verification
app.post('/api/admin/approve', adminPanel.authenticateAdmin, (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const result = adminPanel.approveUser(userId);
    res.json(result);
  } catch (error) {
    console.error('Admin approve error:', error);
    res.status(500).json({ error: 'Failed to approve user' });
  }
});

// POST /api/admin/reject - Reject user verification
app.post('/api/admin/reject', adminPanel.authenticateAdmin, (req, res) => {
  try {
    const { userId, reason } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const result = adminPanel.rejectUser(userId, reason);
    res.json(result);
  } catch (error) {
    console.error('Admin reject error:', error);
    res.status(500).json({ error: 'Failed to reject user' });
  }
});

// GET /api/admin/statistics - Get user statistics
app.get('/api/admin/statistics', adminPanel.authenticateAdmin, (req, res) => {
  try {
    const stats = adminPanel.getStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Admin statistics error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET /api/admin/pending - Get pending users only
app.get('/api/admin/pending', adminPanel.authenticateAdmin, (req, res) => {
  try {
    const pendingUsers = adminPanel.getPendingUsers();
    res.json(pendingUsers);
  } catch (error) {
    console.error('Admin pending users error:', error);
    res.status(500).json({ error: 'Failed to fetch pending users' });
  }
});

// GET /api/admin/search - Search users by broker ID
app.get('/api/admin/search', adminPanel.authenticateAdmin, (req, res) => {
  try {
    const { brokerId } = req.query;
    
    if (!brokerId) {
      return res.status(400).json({ error: 'Broker ID is required for search' });
    }

    const users = adminPanel.searchUsersByBrokerId(brokerId);
    res.json(users);
  } catch (error) {
    console.error('Admin search error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// GET /api/admin/user/:userId - Get user details
app.get('/api/admin/user/:userId', adminPanel.authenticateAdmin, (req, res) => {
  try {
    const { userId } = req.params;
    const userDetails = adminPanel.getUserDetails(userId);
    res.json(userDetails);
  } catch (error) {
    console.error('Admin user details error:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// POST /api/admin/bulk-approve - Bulk approve users
app.post('/api/admin/bulk-approve', adminPanel.authenticateAdmin, (req, res) => {
  try {
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ error: 'User IDs array is required' });
    }

    const results = adminPanel.bulkApprove(userIds);
    res.json(results);
  } catch (error) {
    console.error('Admin bulk approve error:', error);
    res.status(500).json({ error: 'Failed to bulk approve users' });
  }
});

// POST /api/admin/bulk-reject - Bulk reject users
app.post('/api/admin/bulk-reject', adminPanel.authenticateAdmin, (req, res) => {
  try {
    const { userIds, reason } = req.body;
    
    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ error: 'User IDs array is required' });
    }

    const results = adminPanel.bulkReject(userIds, reason);
    res.json(results);
  } catch (error) {
    console.error('Admin bulk reject error:', error);
    res.status(500).json({ error: 'Failed to bulk reject users' });
  }
});

// WebSocket-like endpoint for real-time updates
app.get('/api/updates', authenticateToken, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  const sendUpdate = async () => {
    try {
      const marketData = await marketDataService.fetchAllMarketData();
      const data = `data: ${JSON.stringify(marketData)}\n\n`;
      res.write(data);
    } catch (error) {
      console.error('Real-time update error:', error);
    }
  };

  // Send initial data
  sendUpdate();

  // Set up interval for updates
  const interval = setInterval(sendUpdate, 2000);

  // Clean up on disconnect
  req.on('close', () => {
    clearInterval(interval);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start market data service
marketDataService.startRealTimeUpdates(2000);

// Cron job to clean up old data
cron.schedule('0 */6 * * *', () => {
  console.log('Cleaning up old data...');
  // Clean up old signals (older than 30 days)
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30);
  
  signalHistory.forEach((signals, userId) => {
    const filteredSignals = signals.filter(s => new Date(s.timestamp) > cutoffDate);
    signalHistory.set(userId, filteredSignals);
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  marketDataService.stopRealTimeUpdates();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  marketDataService.stopRealTimeUpdates();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;
