const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

// General rate limiter for project queries (100 requests per 15 minutes)
const projectQueryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many project requests from this IP. Please try again after 15 minutes.',
  },
});

// Admin write limiter
const adminActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

// Public Routes
router.get('/', projectQueryLimiter, getProjects);
router.get('/:id', projectQueryLimiter, getProjectById);

// Admin-Only Protected Routes (JWT required + admin role required)
router.post('/', adminActionLimiter, protect, requireAdmin, createProject);
router.put('/:id', adminActionLimiter, protect, requireAdmin, updateProject);
router.delete('/:id', adminActionLimiter, protect, requireAdmin, deleteProject);

module.exports = router;
