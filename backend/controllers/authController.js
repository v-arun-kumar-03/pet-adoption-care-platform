// controllers/authController.js
// Handles registration, login and "who am I" requests.

const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');
const { isValidEmail, createError } = require('../utils/validators');

// POST /api/auth/register
// Anyone can register as an adopter or a shelter. Admin accounts are created
// by the seed script (in a real system an admin would create them).
const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    phone,
    address,
    shelterName,
    shelterDescription,
  } = req.body;

  // Basic input validation.
  if (!name || name.trim().length < 2) {
    throw createError(400, 'Please enter your full name.');
  }

  if (!email || !isValidEmail(email)) {
    throw createError(400, 'Please enter a valid email address.');
  }

  if (!password || password.length < 6) {
    throw createError(400, 'Password must be at least 6 characters long.');
  }

  if (role && !['adopter', 'shelter'].includes(role)) {
    throw createError(400, 'You can register as an adopter or a shelter.');
  }

  const chosenRole = role === 'shelter' ? 'shelter' : 'adopter';

  if (chosenRole === 'shelter' && (!shelterName || shelterName.trim().length < 2)) {
    throw createError(400, 'Please enter your shelter name.');
  }

  // Email must be unique.
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw createError(400, 'An account with this email already exists.');
  }

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    role: chosenRole,
    phone: phone || '',
    address: address || '',
    shelterName: chosenRole === 'shelter' ? shelterName.trim() : '',
    shelterDescription: chosenRole === 'shelter' ? shelterDescription || '' : '',
  });

  res.status(201).json({
    message: 'Registration successful.',
    token: generateToken(user._id),
    user,
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw createError(400, 'Please enter your email and password.');
  }

  // The password field is hidden by default, so we explicitly select it.
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    throw createError(401, 'Invalid email or password.');
  }

  res.json({
    message: 'Login successful.',
    token: generateToken(user._id),
    user,
  });
});

// GET /api/auth/me
// The frontend calls this on refresh to restore the logged-in user.
const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

module.exports = { register, login, getMe };
