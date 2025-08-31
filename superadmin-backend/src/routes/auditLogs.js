const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const requireSuperadmin = require("../middleware/requireSuperadmin");
const auth = require("../middleware/auth");

router.use(auth);

router.get("/", requireSuperadmin, async (req, res) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const take = parseInt(req.query.take) || 20;
    const { searchTerm } = req.query;

    const where = {};
    if (searchTerm) {
      where.OR = [
        { targetType: { contains: searchTerm } },
        { targetId: { contains: searchTerm } },
        { actor: { name: { contains: searchTerm } } },
        { actor: { email: { contains: searchTerm } } },
      ];
    }

    const [logs, totalCount] = await prisma.$transaction([
      prisma.auditLog.findMany({
        skip,
        take,
        where, 
        orderBy: { timestamp: "desc" },
        include: {
          actor: {
            select: { name: true, email: true }
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);
    
    res.json({ logs, totalCount });

  } catch (err) {
    console.error("Failed to fetch audit logs:", err);
    res.status(500).json({ message: "An error occurred while fetching audit logs." });
  }
});

module.exports = router;