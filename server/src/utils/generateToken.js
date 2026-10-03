const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token containing userId and role
 * @param {Object} user - User document or object with _id and role
 * @returns {String} Signed JWT
 */
const generateToken = (user) => {
  const payload = {
    userId: user._id ? user._id.toString() : user.id,
    role: user.role || 'member',
  };

  const secret = process.env.JWT_SECRET || 'ai_club_siet_super_secret_jwt_key_2026_dev';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(payload, secret, { expiresIn });
};

module.exports = generateToken;
