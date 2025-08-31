// tests/setup.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

let jwtToken;

async function seedSuperAdmin(app) {
  // Create superadmin user if not exists
  let user = await prisma.user.findUnique({ where: { email: 'superadmin@example.com' } });
  if (!user) {
    const hashedPassword = await bcrypt.hash('Test1234!', 10);
    user = await prisma.user.create({
      data: { name: 'Super Admin2', email: 'superadmin@example.com', hashedPassword }
    });
  }

  // Login and get JWT
  const request = require('supertest');
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'superadmin@example.com', password: 'Test1234!' });

  jwtToken = res.body.token;
  return { user, jwtToken };
}

async function cleanupTestUser(email) {
  await prisma.user.deleteMany({ where: { email } });
}

module.exports = { prisma, seedSuperAdmin, cleanupTestUser, jwtToken };
