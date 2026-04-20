// controllers/auth.controller.js
// TODO (Step 3): Implement register, login. Use bcrypt + JWT.

exports.register = async (req, res, next) => {
  try {
    // TODO: validate body with Zod, hash password, create user, return JWT
    res.status(501).json({ success: false, error: 'Not implemented' });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    // TODO: validate body, look up user, compare password, return JWT
    res.status(501).json({ success: false, error: 'Not implemented' });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    // Returns the currently authenticated user (from req.user set by auth middleware)
    res.status(501).json({ success: false, error: 'Not implemented' });
  } catch (err) {
    next(err);
  }
};
