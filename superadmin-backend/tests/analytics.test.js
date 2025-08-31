// tests/analytics.test.js
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

describe('Analytics API', () => {
  it('should get summary analytics', async () => {
    const res = await request(app)
      .get('/api/v1/superadmin/analytics/summary')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('totalUsers');
    expect(res.body).toHaveProperty('totalRoles');
  });
});
