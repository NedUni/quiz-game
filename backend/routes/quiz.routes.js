// routes/quiz.routes.js
const express = require('express');
const rateLimit = require('express-rate-limit');

const quiz = require('../controllers/quiz.controller');
const requireAuth = require('../middleware/auth.middleware');

const router = express.Router();

// Submission is rate-limited per the spec.
const submitLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many quiz submissions. Slow down.' },
});

router.get('/start', requireAuth, quiz.start);
router.post('/submit', requireAuth, submitLimiter, quiz.submit);
router.get('/history', requireAuth, quiz.history);
router.get('/leaderboard', requireAuth, quiz.leaderboard);

module.exports = router;
