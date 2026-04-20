// utils/jwt.js
const jwt = require('jsonwebtoken');

// ----- Auth tokens (login session) -----

function signToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign(
    {
      sub: user._id.toString(),
      username: user.username,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

// ----- Quiz session tokens -----
//
// A separate, short-lived token issued by /quiz/start that records which
// questions were dealt to which user. /quiz/submit verifies it before
// scoring. This makes the start->submit boundary tamper-resistant without
// stateful session storage.
//
// We use the `typ` claim to distinguish quiz session tokens from auth
// tokens so one can never be substituted for the other.

const QUIZ_TYP = 'quiz_session';
const QUIZ_TTL = '30m'; // a quiz must be submitted within 30 minutes of starting

function signQuizSession({ userId, questionIds }) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign(
    {
      typ: QUIZ_TYP,
      sub: userId,
      qids: questionIds,
    },
    process.env.JWT_SECRET,
    { expiresIn: QUIZ_TTL }
  );
}

function verifyQuizSession(token, expectedUserId) {
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  if (payload.typ !== QUIZ_TYP) {
    throw new Error('Token is not a quiz session token');
  }
  if (payload.sub !== expectedUserId) {
    throw new Error('Quiz session belongs to a different user');
  }
  if (!Array.isArray(payload.qids) || payload.qids.length === 0) {
    throw new Error('Quiz session is malformed');
  }
  return payload;
}

module.exports = { signToken, verifyToken, signQuizSession, verifyQuizSession };