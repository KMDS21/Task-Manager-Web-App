const request = require('supertest');
const app = require('../server');
const { generateToken, verifyToken } = require('../src/utils/jwt');
const bcrypt = require('bcryptjs');

describe('🧪 1. UNIT TESTING: Cryptography, Auth & Date Utilities', () => {
  test('Should sign and verify a valid JWT token payload', () => {
    const payload = { userId: 'e3b0c442-98fc-4c14-963b-940465a00001', role: 'admin' };
    const token = generateToken(payload);

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.role).toBe(payload.role);
  });

  test('Should securely hash and compare passwords using Bcrypt', async () => {
    const rawPassword = 'SecretAdminPassword123!';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPassword, salt);

    expect(hash).not.toBe(rawPassword);

    const isMatch = await bcrypt.compare(rawPassword, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await bcrypt.compare('InvalidPassword', hash);
    expect(isWrongMatch).toBe(false);
  });
});

describe('🌐 2. API INTEGRATION & SECURITY TESTING', () => {
  test('GET /api/health — Should return HTTP 200 OK health status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'OK');
  });

  test('POST /api/auth/login — Should return HTTP 400 Bad Request when email or password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com' }); // Missing password

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('GET /api/tasks — Should return HTTP 401 Unauthorized when request lacks JWT Authorization header', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'No token provided. Authorization denied.');
  });

  test('GET /api/tasks — Should return HTTP 401 Unauthorized when provided an expired or malformed JWT token', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', 'Bearer malformed.fake.jwt.token');

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'Invalid or expired token.');
  });

  test('GET /api/admin/stats — Should block unauthenticated access with HTTP 401 Unauthorized', async () => {
    const res = await request(app).get('/api/admin/stats');
    expect(res.statusCode).toBe(401);
  });
});

