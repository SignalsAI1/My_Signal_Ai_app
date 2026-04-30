// Jest setup file for backend tests

// Mock environment variables
process.env.TWELVE_DATA_API_KEY = 'test-key';
process.env.ADMIN_TOKEN = 'test-admin-token';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.PORT = '3001';
process.env.NODE_ENV = 'test';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Setup and teardown hooks
beforeAll(() => {
  // Global test setup
});

afterAll(() => {
  // Global test cleanup
});

beforeEach(() => {
  // Reset modules before each test
  jest.clearAllMocks();
});
