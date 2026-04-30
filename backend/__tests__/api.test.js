const request = require('supertest');
const app = require('../index');

describe('API Endpoints', () => {
  test('GET /api/market should return market data', async () => {
    const response = await request(app)
      .get('/api/market')
      .expect(200);
    
    expect(response.body).toBeInstanceOf(Array);
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
});
