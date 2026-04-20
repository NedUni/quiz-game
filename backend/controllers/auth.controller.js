// controllers/auth.controller.js
const { z } = require('zod');
const User = require('../models/User');
const { signToken } = require('../utils/jwt');

// ----- Zod schemas (also exported so frontend can share them later if you set up a shared package) -----

const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username may only contain letters, numbers, and underscores'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
});

const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

// ----- Handlers -----

exports.register = async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues.map((i) => i.message).join('; ');
      return res.status(400).json({ success: false, error: message });
    }
    const { username, password } = parsed.data;

    const existing = await User.findOne({ username: username.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Username is already taken' });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ username, passwordHash });

    const token = signToken(user);
    return res.status(201).json({
      success: true,
      data: { token, user: user.toJSON() },
    });
  } catch (err) {
    // Handle the unique-index race condition (two concurrent registers with same name)
    if (err && err.code === 11000) {
      return res.status(409).json({ success: false, error: 'Username is already taken' });
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Invalid credentials' });
    }
    const { username, password } = parsed.data;

    // Need to explicitly select passwordHash because the schema hides it by default.
    const user = await User.findOne({ username: username.toLowerCase() }).select('+passwordHash');
    if (!user) {
      // Same generic message as a wrong password — don't leak whether the user exists.
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = signToken(user);
    return res.json({
      success: true,
      data: { token, user: user.toJSON() },
    });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    // req.user populated by auth middleware
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    return res.json({ success: true, data: { user: user.toJSON() } });
  } catch (err) {
    next(err);
  }
};
