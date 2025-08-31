const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const requireSuperadmin = require("../middleware/requireSuperadmin");
const auth = require('../middleware/auth')

router.use(auth)
// Get all roles
router.get("/", requireSuperadmin, async (req, res) => {
  try {
    const roles = await prisma.role.findMany();
    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new role
router.post("/", requireSuperadmin, async (req, res) => {
  const { name, permissions } = req.body;
  try {
    const role = await prisma.role.create({ data: { name, permissions } });
    res.json(role);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a role
router.put("/:id", requireSuperadmin, async (req, res) => {
  const { id } = req.params;
  const { name, permissions } = req.body;
  try {
    const role = await prisma.role.update({
      where: { id: parseInt(id) },
      data: { name, permissions },
    });
    res.json(role);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Assign role to user
router.post("/assign-role", requireSuperadmin, async (req, res) => {
  const { userId, roleId } = req.body;
  try {
    const userRole = await prisma.userRole.upsert({
      where: { userId_roleId: { userId: parseInt(userId), roleId: parseInt(roleId) } },
      update: {},
      create: { userId: parseInt(userId), roleId: parseInt(roleId) },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: req.user.id,
        action: "ROLE_ASSIGN",
        targetType: "USER",
        targetId: userId.toString(),
        details: { roleId },
      },
    });

    res.json({ message: "Role assigned successfully", userRole });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
