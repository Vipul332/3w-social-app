const jwt = require('jsonwebtoken');

/**
 * Signs a JWT containing only the user's id and username.
 * The token is the sole source of truth for identifying the authenticated
 * user on subsequent requests — the frontend never needs to send userId.
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = generateToken;
