const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const rateLimit = require('express-rate-limit');

const prisma = new PrismaClient();
const router = express.Router();
const { ipKeyGenerator } = require('express-rate-limit');


//simaple Rate Limiter 
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 login attempts
  message: { error: 'Too many login attempts. Try again later after 15 mins.' },

  keyGenerator: (req) => {
    const email = req.body.email || '';
    const ip = ipKeyGenerator(req); 
    return `${email}:${ip}`;
  }
});


router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    
    const roles = user.roles.map(r => r.role.name);

    //Only SuperAdmin Can Login
    if (!roles.includes('superadmin')) {
      return res.status(403).json({ error: 'You need to be superadmin to login.' });
    }

    // Create JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, roles },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Audit log (errors do not block login)
    try {
      await prisma.auditLog.create({
        data: {
          actorUserId: user.id,
          action: 'AUTH_LOGIN',
          targetType: 'User',
          targetId: String(user.id),
          details: { email: user.email }
        }
      });
    } catch (auditErr) {
      console.error('Audit log failed:', auditErr);
    }

    res.json({ token, user: { id: user.id, email: user.email, roles } });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
