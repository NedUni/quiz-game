// models/Score.js
// Stores a completed quiz attempt. Spec requirement: store full list of
// answers (questionId + selectedAnswer + isCorrect) so users can review
// past attempts.
const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    selectedAnswer: {
      type: Number,
      required: true,
      min: [0, 'selectedAnswer must be between 0 and 3'],
      max: [3, 'selectedAnswer must be between 0 and 3'],
      validate: {
        validator: Number.isInteger,
        message: 'selectedAnswer must be an integer',
      },
    },
    isCorrect: { type: Boolean, required: true },
  },
  { _id: false } // these are subdocuments — no need for their own _id
);

const scoreSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    answers: {
      type: [answerSchema],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 6 && arr.length <= 10,
        message: 'A quiz attempt must have between 6 and 10 answers',
      },
    },
  },
  { timestamps: true }
);

// ----- Indexes -----
// Leaderboard: highest score first, ties broken by most recent. Compound
// index supports `find().sort({ score: -1, createdAt: -1 })` directly.
scoreSchema.index({ score: -1, createdAt: -1 });

// User's own history page: their attempts, newest first.
scoreSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Score', scoreSchema);