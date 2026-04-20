// middleware/admin.middleware.js
// Assumes requireAuth has already populated req.user.

module.exports = function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
};
