const request = require('supertest');

// Mock environment variables
process.env.TWELVE_DATA_API_KEY = 'test-key';
process.env.ADMIN_TOKEN = 'test-admin-token';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.PORT = '3001';

describe('API Endpoints', () => {
  let app;
  
  beforeAll(async () => {
    // Start the server for testing
    app = require('../index');
  });

  test('GET /api/market should return market data', async () => {
    const response = await request(app)
      .get('/api/market')
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('POST /api/register should create user', async () => {
    const userData = {
      telegramId: 'test123',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User'
    };

    const response = await request(app)
      .post('/api/register')
      .send(userData)
      .expect(200);

    expect(response.body).toHaveProperty('userId');
    expect(response.body).toHaveProperty('token');
  });

  test('POST /api/verify-id should require authentication', async () => {
    const response = await request(app)
      .post('/api/verify-id')
      .send({ brokerId: '123456' })
      .expect(401);

    expect(response.body.error).toBe('No token provided');
  });

  test('GET /api/admin/users should require admin token', async () => {
    const response = await request(app)
      .get('/api/admin/users')
      .expect(403);

    expect(response.body.error).toBe('Forbidden');
  });

  test('POST /api/signal should require authentication', async () => {
    const response = await request(app)
      .post('/api/signal')
      .send({ symbol: 'EUR/USD' })
      .expect(401);

    expect(response.body.error).toBe('No token provided');
  });
});
