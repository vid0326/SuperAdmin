// tests/auth.test.js
const request = require('supertest');
const app = require('../src/app');
const { prisma } = require('./setup');

describe('Auth API', () => {
  let superAdminUser;

  beforeAll(async () => {
    // Seed a super admin user for login test
    superAdminUser = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: 'superadmin@examp4le.com',
        hashedPassword: '$2a$10$O4s3/9tG2xE2bYjZlX.QfOG8fTzF3kJl4R1HvVR4DRaZcF0Q4dG/G', // bcrypt hash of Test1234!
      }
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.delete({ where: { id: superAdminUser.id } });
    await prisma.$disconnect();
  });

  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'superadmin@example.com',
        password: 'Test1234!'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should fail login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'superadmin@example.com',
        password: 'WrongPassword!'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error', 'Invalid credentials');
  });

  it('should fail login with non-existent user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'Test1234!'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error', 'Invalid credentials');
  });
});
