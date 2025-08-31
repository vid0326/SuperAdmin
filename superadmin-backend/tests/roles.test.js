// tests/roles.test.js
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

describe('Roles API', () => {
  it('should list roles', async () => {
    const res = await request(app)
      .get('/api/v1/superadmin/roles')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
