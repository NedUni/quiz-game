// routes/admin.routes.js
const express = require('express');

const admin = require('../controllers/admin.controller');
const requireAuth = require('../middleware/auth.middleware');
const requireAdmin = require('../middleware/admin.middleware');

const router = express.Router();

// Every admin route requires both an authenticated user AND the admin role.
router.use(requireAuth, requireAdmin);

router.get('/questions', admin.listQuestions);
router.post('/questions', admin.createQuestion);
router.put('/questions/:id', admin.updateQuestion);
router.delete('/questions/:id', admin.deleteQuestion);
router.patch('/questions/:id/toggle', admin.toggleActive);
router.post('/questions/bulk', admin.bulkImport);

module.exports = router;
