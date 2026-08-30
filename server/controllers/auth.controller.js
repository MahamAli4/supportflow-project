const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

// Helper to generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'supportflow_super_secret_jwt_key_phase1',
    { expiresIn: '7d' }
  );
};

/**
 * @desc    Register a new customer account (Public registration forces customer role)
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    // 1. Zod input validation (rejects role='agent' if passed)
    const validationResult = registerSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.errors.map((e) => e.message).join(', ');
      return res.status(400).json({ success: false, error: errorMsg });
    }

    const { name, email, password } = validationResult.data;

    // 2. Check duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'User with this email already exists' });
    }

    // 3. Hash password & create Customer user
    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'customer', // Hardcoded customer role for public registration
    });

    // 4. Generate JWT token
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    // 1. Zod input validation
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.errors.map((e) => e.message).join(', ');
      return res.status(400).json({ success: false, error: errorMsg });
    }

    const { email, password } = validationResult.data;

    // 2. Check user exists (explicitly select passwordHash)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // 3. Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // 4. Generate JWT token
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
