const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Storage
const storagePath = path.join(__dirname, '../storage/db.json');
let storage = { users: [], requests: [] };

// Load storage
if (fs.existsSync(storagePath)) {
  storage = JSON.parse(fs.readFileSync(storagePath, 'utf8'));
} else {
  fs.writeFileSync(storagePath, JSON.stringify(storage, null, 2));
}

// WebSocket clients
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('Client connected');
  
  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected');
  });
});

// Broadcast to all clients
function broadcast(data) {
  const message = JSON.stringify(data);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// API Routes
app.get('/api/market', async (req, res) => {
  try {
    const marketData = require('../market/data.js');
    const result = await marketData.getMarketData();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});

app.get('/api/signal', async (req, res) => {
  try {
    const signalEngine = require('../engine/signal.js');
    const marketData = require('../market/data.js');
    const marketResult = await marketData.getMarketData();
    const signals = signalEngine.generateSignals(marketResult.data);
    res.json(signals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate signals' });
  }
});

app.post('/api/verify-id', (req, res) => {
  const { userId, promoCode } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID required' });
  }

  const request = {
    id: Date.now().toString(),
    userId,
    promoCode: promoCode || 'LRQ740',
    status: 'pending',
    timestamp: new Date().toISOString()
  };

  storage.requests.push(request);
  fs.writeFileSync(storagePath, JSON.stringify(storage, null, 2));

  res.json({ id: request.id, status: 'pending' });
});

app.get('/api/verify-status/:id', (req, res) => {
  const request = storage.requests.find(r => r.id === req.params.id);
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }
  res.json({ status: request.status });
});

// Admin API
app.get('/api/admin/users', (req, res) => {
  if (req.query.token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json(storage);
});

app.post('/api/admin/approve', (req, res) => {
  if (req.query.token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { requestId } = req.body;
  const request = storage.requests.find(r => r.id === requestId);
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }

  request.status = 'approved';
  storage.users.push({
    id: request.userId,
    status: 'approved',
    timestamp: new Date().toISOString()
  });

  fs.writeFileSync(storagePath, JSON.stringify(storage, null, 2));
  res.json({ success: true });
});

app.post('/api/admin/reject', (req, res) => {
  if (req.query.token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { requestId } = req.body;
  const request = storage.requests.find(r => r.id === requestId);
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }

  request.status = 'rejected';
  fs.writeFileSync(storagePath, JSON.stringify(storage, null, 2));
  res.json({ success: true });
});

// Hidden admin route
app.get('/secret-admin', (req, res) => {
  if (req.query.token !== process.env.ADMIN_TOKEN) {
    return res.status(401).send('Unauthorized');
  }
  res.sendFile(path.join(__dirname, '../frontend/public/app.html'));
});

// Real-time data broadcasting
setInterval(async () => {
  try {
    const marketData = require('../market/data.js');
    const signalEngine = require('../engine/signal.js');
    const marketResult = await marketData.getMarketData();
    const signals = signalEngine.generateSignals(marketResult.data);
    
    broadcast({
      type: 'market_update',
      data: marketResult.data,
      source: marketResult.source,
      signals,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Broadcast error:', error);
  }
}, 2000);

// Serve React app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/simple.html'));
});

// Serve React app (catch-all)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/simple.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 My Ai Signal Server running on port ${PORT}`);
  console.log(`📡 WebSocket ready for connections`);
  console.log(`🔐 Admin panel: /secret-admin?token=${process.env.ADMIN_TOKEN}`);
});
