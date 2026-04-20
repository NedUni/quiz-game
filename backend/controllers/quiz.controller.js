// controllers/quiz.controller.js
const Question = require('../models/Question');

// Quiz length per spec: 6–10 questions per attempt.
const MIN_QUESTIONS = 6;
const MAX_QUESTIONS = 10;

// Fisher–Yates shuffle. In-place, O(n), unbiased.
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

exports.start = async (req, res, next) => {
  try {
    // Fetch only active questions. Crucially, we use .select() to EXCLUDE
    // correctIndex — it must never reach the client. Server-side scoring
    // (substep 6b) will look up the real correctIndex from the DB.
    const all = await Question.find({ isActive: true }).select('-correctIndex');

    if (all.length < MIN_QUESTIONS) {
      return res.status(503).json({
        success: false,
        error: `Not enough active questions to start a quiz (need at least ${MIN_QUESTIONS}, have ${all.length})`,
      });
    }

    // Shuffle, then take a random count between MIN and MAX (inclusive),
    // capped at how many we actually have.
    const shuffled = shuffle(all);
    const targetCount = Math.min(
      all.length,
      MIN_QUESTIONS + Math.floor(Math.random() * (MAX_QUESTIONS - MIN_QUESTIONS + 1))
    );
    const selected = shuffled.slice(0, targetCount);

    // Shape the response. Note: each question still has its _id so the
    // client can submit answers keyed back to the right question.
    const questions = selected.map((q) => ({
      _id: q._id,
      text: q.text,
      options: q.options,
      imageUrl: q.imageUrl,
    }));

    return res.json({
      success: true,
      data: {
        quizId: new Date().getTime().toString(36), // a lightweight client-side identifier
        count: questions.length,
        questions,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ----- Stubs for substeps 6b, 6c, 6d -----

exports.submit = async (req, res, next) => {
  try {
    res.status(501).json({ success: false, error: 'Not implemented' });
  } catch (err) {
    next(err);
  }
};

exports.history = async (req, res, next) => {
  try {
    res.status(501).json({ success: false, error: 'Not implemented' });
  } catch (err) {
    next(err);
  }
};

exports.leaderboard = async (req, res, next) => {
  try {
    res.status(501).json({ success: false, error: 'Not implemented' });
  } catch (err) {
    next(err);
  }
};