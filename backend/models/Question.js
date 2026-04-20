// models/Question.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
      minlength: [3, 'Question text must be at least 3 characters'],
      maxlength: [500, 'Question text must be at most 500 characters'],
    },
    options: {
      type: [String],
      required: true,
      validate: [
        {
          validator: (arr) => Array.isArray(arr) && arr.length === 4,
          message: 'A question must have exactly 4 options',
        },
        {
          validator: (arr) => arr.every((o) => typeof o === 'string' && o.trim().length > 0),
          message: 'Options must be non-empty strings',
        },
        {
          validator: (arr) => arr.every((o) => o.length <= 200),
          message: 'Each option must be at most 200 characters',
        },
      ],
    },
    correctIndex: {
      type: Number,
      required: [true, 'correctIndex is required'],
      min: [0, 'correctIndex must be between 0 and 3'],
      max: [3, 'correctIndex must be between 0 and 3'],
      validate: {
        validator: Number.isInteger,
        message: 'correctIndex must be an integer',
      },
    },
    // Variation: image-based questions. Optional at the schema level — the
    // ">= 50% with image" rule is enforced at the application/seed level.
    imageUrl: {
      type: String,
      default: null,
      trim: true,
      validate: {
        validator: function validateUrl(v) {
          if (v === null || v === '') return true; // optional field
          try {
            const u = new URL(v);
            return u.protocol === 'http:' || u.protocol === 'https:';
          } catch {
            return false;
          }
        },
        message: 'imageUrl must be a valid http(s) URL',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true, // we'll filter by isActive every time we start a quiz
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);