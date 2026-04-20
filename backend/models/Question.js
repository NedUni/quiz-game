// models/Question.js
// TODO (Step 5): Validate options length === 4, correctIndex in [0,3], etc.
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    options: {
      type: [String],
      required: true,
      validate: [(arr) => arr.length === 4, 'A question must have exactly 4 options'],
    },
    correctIndex: { type: Number, required: true, min: 0, max: 3 },
    // Variation: image-based questions. Optional at the schema level — the
    // ">= 50% with image" rule is enforced at the application level.
    imageUrl: { type: String, default: null, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);
