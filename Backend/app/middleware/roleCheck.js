const roleCheck = (...roles) => {
  return async (req, res, next) => {
    try {
      // user role from auth middleware
      const userRole = req.user.role || '';

      const normalizedRoles = roles.map(r => r.toLowerCase().replace(/-/g, ''));
      const normalizedUserRole = userRole.toLowerCase().replace(/-/g, '');

      // check role
      if (!normalizedRoles.includes(normalizedUserRole)) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
};

module.exports = roleCheck;