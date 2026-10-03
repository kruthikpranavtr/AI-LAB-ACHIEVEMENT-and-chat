const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to authenticate requests via Bearer JWT
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Read Authorization header
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      // 2. Extract Bearer token
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No Bearer token provided.',
      });
    }

    // 3. Verify JWT
    const secret = process.env.JWT_SECRET || 'ai_club_siet_super_secret_jwt_key_2026_dev';
    let decoded;

    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Authentication failed. Token has expired.',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. Invalid token signature.',
      });
    }

    // 4. Find the user (exclude passwordHash)
    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.',
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This user account has been deactivated.',
      });
    }

    // 5. Attach user to req.user
    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during token verification.',
    });
  }
};

module.exports = { protect };
