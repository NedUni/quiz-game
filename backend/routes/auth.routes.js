// routes/auth.routes.js
const express = require('express');
const rateLimit = require('express-rate-limit');

const auth = require('../controllers/auth.controller');
const requireAuth = require('../middleware/auth.middleware');

const router = express.Router();

// Login is rate-limited per the spec (Step 13 will tune limits).
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many login attempts. Try again later.' },
});

router.post('/register', auth.register);
router.post('/login', loginLimiter, auth.login);
router.get('/me', requireAuth, auth.me);

module.exports = router;
