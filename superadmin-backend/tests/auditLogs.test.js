// tests/auditLogs.test.js
const request = require('supertest');
const app = require('../src/app');
const { prisma, seedSuperAdmin } = require('./setup');

let jwtToken;

beforeAll(async () => {
  const seed = await seedSuperAdmin(app);
  jwtToken = seed.jwtToken;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Audit Logs API', () => {
  it('should list audit logs in a paginated object structure', async () => {
    const res = await request(app)
      .get('/api/v1/superadmin/audit-logs')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(res.statusCode).toBe(200);
    
    // ✅ **CORRECTION:** Check for the new object structure.
    
    // 1. Check that the body is an object.
    expect(typeof res.body).toBe('object');
    
    // 2. Check that it has a 'logs' property which is an array.
    expect(res.body).toHaveProperty('logs');
    expect(Array.isArray(res.body.logs)).toBe(true);
    
    // 3. Check that it has a 'totalCount' property which is a number.
    expect(res.body).toHaveProperty('totalCount');
    expect(typeof res.body.totalCount).toBe('number');
  });
});