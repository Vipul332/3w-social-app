const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

/**
 * Verifies the "Authorization: Bearer <token>" header, and attaches
 * the authenticated user (id + username) to req.user.
 *
 * Downstream controllers must always derive identity from req.user,
 * never from a userId/username sent in the request body — this is
 * what prevents a client from impersonating another user.
 */
const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication required.');
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired token.');
  }

  // Confirm the user still exists (in case the account was deleted).
  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError(401, 'User belonging to this token no longer exists.');
  }

  req.user = { id: user._id.toString(), username: user.username };
  next();
});

module.exports = protect;
