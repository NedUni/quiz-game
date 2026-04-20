// scripts/seedQuestions.js
// Seed the questions collection with a known set of sample questions.
//
// Run with:  npm run seed:questions
//
// IMPORTANT: this WIPES the existing questions collection before inserting.
// Don't run against production data.

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Question = require('../models/Question');

// ----- Sample question pool -----
// Variation requirement: at least 50% must include an imageUrl.
// 12 questions total, 8 with images = 66.6%. Comfortably above the threshold.
const QUESTIONS = [
  {
    text: 'What is the capital of Australia?',
    options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'],
    correctIndex: 2,
    imageUrl: 'https://picsum.photos/seed/canberra/600/400',
  },
  {
    text: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correctIndex: 1,
    imageUrl: 'https://picsum.photos/seed/mars/600/400',
  },
  {
    text: 'Who painted the Mona Lisa?',
    options: ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Claude Monet'],
    correctIndex: 2,
    imageUrl: 'https://picsum.photos/seed/monalisa/600/400',
  },
  {
    text: 'What is the largest ocean on Earth?',
    options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
    correctIndex: 3,
    imageUrl: 'https://picsum.photos/seed/ocean/600/400',
  },
  {
    text: 'Which animal is shown here?',
    options: ['Lion', 'Tiger', 'Cheetah', 'Leopard'],
    correctIndex: 1,
    imageUrl: 'https://picsum.photos/seed/tiger/600/400',
  },
  {
    text: 'What landmark is pictured?',
    options: ['Big Ben', 'Eiffel Tower', 'Statue of Liberty', 'Sydney Opera House'],
    correctIndex: 3,
    imageUrl: 'https://picsum.photos/seed/sydney/600/400',
  },
  {
    text: 'Which fruit is shown?',
    options: ['Apple', 'Pear', 'Mango', 'Peach'],
    correctIndex: 2,
    imageUrl: 'https://picsum.photos/seed/mango/600/400',
  },
  {
    text: 'Identify this country flag.',
    options: ['Japan', 'South Korea', 'China', 'Vietnam'],
    correctIndex: 0,
    imageUrl: 'https://picsum.photos/seed/japan/600/400',
  },
  // ----- Image-less questions (4 of 12 = 33.3%) -----
  {
    text: 'What is 7 × 8?',
    options: ['54', '56', '64', '48'],
    correctIndex: 1,
    imageUrl: null,
  },
  {
    text: 'Who wrote "Romeo and Juliet"?',
    options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
    correctIndex: 1,
    imageUrl: null,
  },
  {
    text: 'Which programming language was created by Brendan Eich?',
    options: ['Python', 'Ruby', 'JavaScript', 'Java'],
    correctIndex: 2,
    imageUrl: null,
  },
  {
    text: 'How many continents are there?',
    options: ['5', '6', '7', '8'],
    correctIndex: 2,
    imageUrl: null,
  },
];

async function seed() {
  try {
    await connectDB();

    console.log('[seed] Wiping existing questions…');
    const wipeResult = await Question.deleteMany({});
    console.log(`[seed] Removed ${wipeResult.deletedCount} existing question(s).`);

    console.log(`[seed] Inserting ${QUESTIONS.length} sample questions…`);
    const inserted = await Question.insertMany(QUESTIONS);

    const withImages = inserted.filter((q) => q.imageUrl).length;
    const pct = ((withImages / inserted.length) * 100).toFixed(1);

    console.log(`[seed] Inserted ${inserted.length} question(s).`);
    console.log(`[seed] ${withImages} of ${inserted.length} include an image (${pct}%).`);

    if (withImages / inserted.length < 0.5) {
      console.warn('[seed] WARNING: less than 50% have images. Variation requirement not met.');
    } else {
      console.log('[seed] OK: variation requirement met (≥ 50% with images).');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[seed] Failed:', err);
    process.exit(1);
  }
}

seed();