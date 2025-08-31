const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const Joi = require('joi');

const prisma = new PrismaClient();


//craeted this only to handle the update and assign roles correclty 
const userUpdateValidationSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .allow('') 
    .optional()
    .messages({
      'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character.',
      'string.min': 'Password must be at least 8 characters long.'
    }),
  roleIds: Joi.array().items(Joi.number().positive()).optional()
});


// This schema remains the same, used only for creating new users
const userCreateValidationSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .required(), // Password is required for creation
  roleIds: Joi.array().items(Joi.number().positive()).optional()
});

// Helper: validate role IDs
async function validateRoles(roleIds) {
  if (!roleIds || roleIds.length === 0) return;
  const existingRoles = await prisma.role.findMany({
    where: { id: { in: roleIds } }
  });
  if (existingRoles.length !== roleIds.length) {
    throw { status: 400, message: 'Some roles do not exist' };
  }
}

// CREATE user 
async function createUser({ name, email, password, roleIds = [], actorUserId }) {
  const { error } = userCreateValidationSchema.validate({ name, email, password, roleIds });
  if (error) throw { status: 400, message: error.message };

  await validateRoles(roleIds);
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({ data: { name, email, hashedPassword } });
      if (roleIds.length > 0) {
        await tx.userRole.createMany({ data: roleIds.map(roleId => ({ userId: newUser.id, roleId })) });
      }
      await tx.auditLog.create({
        data: {
          actorUserId,
          action: 'USER_CREATE',
          targetType: 'User',
          targetId: String(newUser.id),
          details: { name, email, roles: roleIds }
        }
      });
      return newUser;
    });
    return prisma.user.findUnique({ where: { id: user.id }, include: { roles: { include: { role: true } } } });
  } catch (err) {
    if (err.code === 'P2002' && err.meta?.target?.includes('email')) {
      throw { status: 400, message: 'Email already exists' };
    }
    throw { status: 500, message: 'Internal server error' };
  }
}

// GET all users
async function getUsers({ skip = 0, take = 20 }) {
  return prisma.user.findMany({
    skip: parseInt(skip) || 0,
    take: parseInt(take) || 20,
    orderBy: { createdAt: 'desc' },
    include: { roles: { include: { role: true } } }
  });
}

// GET user by ID
async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
    include: { roles: { include: { role: true } } }
  });
  if (!user) throw { status: 404, message: 'User not found' };
  return user;
}


// Update user
async function updateUser(id, userData, actorUserId) {
  
  const { error } = userUpdateValidationSchema.validate(userData);
  if (error) throw { status: 400, message: error.message };

  const { name, email, password, roleIds } = userData;

  
  if (roleIds) {
    await validateRoles(roleIds);
  }

  
  const dataToUpdate = {};
  if (name) dataToUpdate.name = name;
  if (email) dataToUpdate.email = email;
  if (password) dataToUpdate.hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.$transaction(async (tx) => {
      //if no update no run
      if (Object.keys(dataToUpdate).length > 0) {
        await tx.user.update({
          where: { id: Number(id) },
          data: dataToUpdate
        });
      }

      // Only update roles if the roleIds array was provided in the request
      if (roleIds !== undefined) {
        await tx.userRole.deleteMany({ where: { userId: Number(id) } });
        if (roleIds.length > 0) {
          await tx.userRole.createMany({
            data: roleIds.map(roleId => ({ userId: Number(id), roleId }))
          });
        }
      }
      
      await tx.auditLog.create({
        data: {
          actorUserId,
          action: 'USER_UPDATE',
          targetType: 'User',
          targetId: String(id),
          details: userData
        }
      });
    });

    
    return prisma.user.findUnique({
      where: { id: Number(id) },
      include: { roles: { include: { role: true } } }
    });
  } catch (err) {
    if (err.code === 'P2002' && err.meta?.target?.includes('email')) {
      throw { status: 400, message: 'Email already exists' };
    }
    if (err.code === 'P2025') {
       throw { status: 404, message: 'User not found' };
    }
    if (err.status) throw err;
    throw { status: 500, message: 'Internal server error' };
  }
}

// DELETE user
async function deleteUser(id, actorUserId) {
  try {
    const user = await prisma.user.delete({ where: { id: Number(id) } });

    await prisma.auditLog.create({
      data: {
        actorUserId,
        action: 'USER_DELETE',
        targetType: 'User',
        targetId: String(id),
        details: { name: user.name, email: user.email }
      }
    });
    
    return user;
  } catch (err) {
    if (err.code === 'P2025') {
      throw { status: 404, message: 'User not found' };
    }
    throw { status: 500, message: 'Internal server error' };
  }
}

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};