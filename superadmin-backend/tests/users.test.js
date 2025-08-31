const request = require('supertest');
const app = require('../src/app');
const { prisma } = require('./setup');
let jwtToken;

beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: 'testuser@example.com' } });
  // Login and get JWT
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'superadmin@example.com', password: 'Test1234!' });

  jwtToken = res.body.token;
});

describe('Users API', () => {
  it('should list users', async () => {
    const res = await request(app)
      .get('/api/v1/superadmin/users')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should create a new user', async () => {
    const res = await request(app)
      .post('/api/v1/superadmin/users')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'Test1234!',
        roleIds: [2]
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });
});
