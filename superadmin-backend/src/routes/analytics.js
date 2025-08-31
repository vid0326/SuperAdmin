const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const requireSuperadmin = require("../middleware/requireSuperadmin");
const auth = require('../middleware/auth')

router.use(auth)
router.use(requireSuperadmin)

router.get("/summary",  async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalRoles = await prisma.role.count();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeUsers = await prisma.user.count({
      where: { lastLogin: { gte: sevenDaysAgo } },
    });

    const inactiveUsers = totalUsers - activeUsers;

   
    // New users in last 7 days
    const newUsers = await prisma.user.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    });

    // Users by role
    const usersByRoleRaw = await prisma.userRole.groupBy({
      by: ["roleId"],
      _count: { userId: true },
    });

    const usersByRole = {};
    for (const item of usersByRoleRaw) {
      const role = await prisma.role.findUnique({ where: { id: item.roleId } });
      usersByRole[role.name] = item._count.userId;
    }

    // Audit logs count
    const totalAuditLogs = await prisma.auditLog.count();

    res.json({
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalRoles,
      newUsers,
      usersByRole,
      totalAuditLogs
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;
