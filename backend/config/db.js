// config/db.js — MongoDB connection
const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set. Check your .env file.');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('[db] MongoDB connected');
}

module.exports = connectDB;
