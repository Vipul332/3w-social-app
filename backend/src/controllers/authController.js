const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');
const { isValidEmail, isValidPassword, isValidUsername } = require('../utils/validators');

const SALT_ROUNDS = 10;

/**
 * Strips sensitive/internal fields before sending a user back to the client.
 */
const toSafeUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  createdAt: user.createdAt,
});

// @route  POST /api/auth/signup
// @access Public
const signup = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!isValidUsername(username)) {
    throw new ApiError(400, 'Username must be between 2 and 30 characters.');
  }
  if (!isValidEmail(email)) {
    throw new ApiError(400, 'Please provide a valid email address.');
  }
  if (!isValidPassword(password)) {
    throw new ApiError(400, 'Password must be at least 6 characters long.');
  }

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    throw new ApiError(409, 'Email is already registered.');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    username: username.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
  });

  const token = generateToken(user);

  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    token,
    user: toSafeUser(user),
  });
});

// @route  POST /api/auth/login
// @access Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!isValidEmail(email) || typeof password !== 'string' || password.length === 0) {
    throw new ApiError(400, 'Please provide a valid email and password.');
  }

  // password has `select: false` on the schema, so it must be explicitly requested
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const token = generateToken(user);

  res.status(200).json({
    success: true,
    message: 'Logged in successfully.',
    token,
    user: toSafeUser(user),
  });
});

// @route  GET /api/auth/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }
  res.status(200).json({ success: true, user: toSafeUser(user) });
});

module.exports = { signup, login, getMe };
