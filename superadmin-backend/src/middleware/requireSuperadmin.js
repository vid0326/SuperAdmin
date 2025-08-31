function requireSuperadmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (Array.isArray(req.user.roles)) {
    const hasSuperadmin =
      req.user.roles.includes("superadmin") ||
      req.user.roles.some(r => r?.name === "superadmin");

    if (!hasSuperadmin) {
      return res.status(403).json({ error: "Superadmin role required" });
    }

    return next();
  }

  return res.status(403).json({ error: "Superadmin role required" });
}

module.exports = requireSuperadmin;
