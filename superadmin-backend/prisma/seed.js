const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  
  const superRole = await prisma.role.upsert({
    where: { name: 'superadmin' },
    update: {},
    create: {
      name: 'superadmin',
      permissions: [
        'users:read','users:create','users:update','users:delete',
        'roles:read','roles:create','roles:update','roles:assign',
        'audit:read','analytics:read','settings:read','settings:update'
      ]
    }
  });

  const staffRole = await prisma.role.upsert({
    where: { name: 'staff' },
    update: {},
    create: {
      name: 'staff',
      permissions: ['users:read']
    }
  });

  // Superadmin user
  const password = 'Test1234!';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const superUser = await prisma.user.upsert({
    where: { email: 'superadmin@example.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'superadmin@example.com',
      hashedPassword
    }
  });

  // Link role
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: superUser.id, roleId: superRole.id } },
    update: {},
    create: { userId: superUser.id, roleId: superRole.id }
  });

  // Audit log for seed
  await prisma.auditLog.create({
    data: {
      actorUserId: superUser.id,
      action: 'SYSTEM_SEED',
      targetType: 'SYSTEM',
      targetId: 'INIT',
      details: { note: 'Database seeded with superadmin + base roles' }
    }
  });

  console.log('Seed complete.');
  console.log('Login email: superadmin@example.com');
  console.log('Password   : Test1234!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
