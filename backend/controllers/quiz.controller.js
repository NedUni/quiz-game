// controllers/quiz.controller.js
// TODO (Step 6): Implement start, submit, history, leaderboard.

exports.start = async (req, res, next) => {
  try {
    // TODO: fetch active questions, shuffle, pick 6-10, STRIP correctIndex before sending
    res.status(501).json({ success: false, error: 'Not implemented' });
  } catch (err) {
    next(err);
  }
};

exports.submit = async (req, res, next) => {
  try {
    // TODO: validate body, score server-side against DB, save Score doc, return result
    res.status(501).json({ success: false, error: 'Not implemented' });
  } catch (err) {
    next(err);
  }
};

exports.history = async (req, res, next) => {
  try {
    // TODO: return current user's past attempts
    res.status(501).json({ success: false, error: 'Not implemented' });
  } catch (err) {
    next(err);
  }
};

exports.leaderboard = async (req, res, next) => {
  try {
    // TODO: aggregate top scores with usernames (Mongoose populate)
    res.status(501).json({ success: false, error: 'Not implemented' });
  } catch (err) {
    next(err);
  }
};
