/**
 * Admin Authorization Middleware
 * Verifies that the authenticated user possesses the 'admin' role.
 * Must be executed AFTER authMiddleware.protect.
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required before verifying administrator privileges.',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges required.',
    });
  }

  next();
};

module.exports = { requireAdmin };
