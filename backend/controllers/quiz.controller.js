// controllers/quiz.controller.js
const { z } = require('zod');
const mongoose = require('mongoose');
const Question = require('../models/Question');
const Score = require('../models/Score');
const { signQuizSession, verifyQuizSession } = require('../utils/jwt');

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

// ----- Zod schema for submit payload -----
const submitSchema = z.object({
  // The signed session token issued by /start. Required.
  sessionToken: z.string().min(1, 'sessionToken is required'),
  answers: z
    .array(
      z.object({
        questionId: z.string().refine((v) => mongoose.isValidObjectId(v), {
          message: 'questionId must be a valid ObjectId',
        }),
        selectedAnswer: z.number().int().min(0).max(3),
      })
    )
    .min(MIN_QUESTIONS, `Must submit at least ${MIN_QUESTIONS} answers`)
    .max(MAX_QUESTIONS, `Must submit at most ${MAX_QUESTIONS} answers`)
    .refine(
      (arr) => new Set(arr.map((a) => a.questionId)).size === arr.length,
      { message: 'Duplicate questionIds in submission' }
    ),
});

// ----- GET /api/quiz/start -----
exports.start = async (req, res, next) => {
  try {
    const all = await Question.find({ isActive: true }).select('-correctIndex');

    if (all.length < MIN_QUESTIONS) {
      return res.status(503).json({
        success: false,
        error: `Not enough active questions to start a quiz (need at least ${MIN_QUESTIONS}, have ${all.length})`,
      });
    }

    const shuffled = shuffle(all);
    const targetCount = Math.min(
      all.length,
      MIN_QUESTIONS + Math.floor(Math.random() * (MAX_QUESTIONS - MIN_QUESTIONS + 1))
    );
    const selected = shuffled.slice(0, targetCount);

    const questions = selected.map((q) => ({
      _id: q._id,
      text: q.text,
      options: q.options,
      imageUrl: q.imageUrl,
    }));

    // Sign a quiz session token recording which questions were dealt.
    // The client must return this verbatim with their submission.
    const sessionToken = signQuizSession({
      userId: req.user.id,
      questionIds: questions.map((q) => q._id.toString()),
    });

    return res.json({
      success: true,
      data: {
        sessionToken,
        count: questions.length,
        questions,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ----- POST /api/quiz/submit -----
exports.submit = async (req, res, next) => {
  try {
    // 1. Validate shape
    const parsed = submitSchema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues.map((i) => i.message).join('; ');
      return res.status(400).json({ success: false, error: message });
    }
    const { sessionToken, answers: submitted } = parsed.data;

    // 2. Verify the session token. Confirms:
    //    - the token is genuine (signature)
    //    - it hasn't expired
    //    - it belongs to THIS user (not stolen from someone else)
    let session;
    try {
      session = verifyQuizSession(sessionToken, req.user.id);
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: `Invalid quiz session: ${err.message}`,
      });
    }

    const issuedIds = new Set(session.qids);

    // 3. Submission must contain exactly the questions that were issued —
    //    no fewer, no extras, no swaps.
    if (submitted.length !== issuedIds.size) {
      return res.status(400).json({
        success: false,
        error: `Expected ${issuedIds.size} answers, received ${submitted.length}`,
      });
    }
    const submittedIds = new Set(submitted.map((a) => a.questionId));
    for (const id of issuedIds) {
      if (!submittedIds.has(id)) {
        return res.status(400).json({
          success: false,
          error: 'Submission does not match the questions issued for this quiz',
        });
      }
    }

    // 4. Fetch the real questions from DB by their IDs
    const questions = await Question.find({ _id: { $in: [...issuedIds] } });
    const byId = new Map(questions.map((q) => [q._id.toString(), q]));

    // Edge case: a question in the session got deleted after /start.
    if (questions.length !== issuedIds.size) {
      return res.status(400).json({
        success: false,
        error: 'One or more issued questions no longer exist',
      });
    }

    // 5. Score it server-side
    let score = 0;
    const scoredAnswers = submitted.map((a) => {
      const q = byId.get(a.questionId);
      const isCorrect = q.correctIndex === a.selectedAnswer;
      if (isCorrect) score += 1;
      return {
        questionId: q._id,
        selectedAnswer: a.selectedAnswer,
        isCorrect,
      };
    });

    // 6. Persist the attempt
    const saved = await Score.create({
      userId: req.user.id,
      score,
      answers: scoredAnswers,
    });

    // 7. Return result
    return res.status(201).json({
      success: true,
      data: {
        scoreId: saved._id,
        score,
        total: scoredAnswers.length,
        answers: scoredAnswers,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ----- Stubs for substeps 6c, 6d -----

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