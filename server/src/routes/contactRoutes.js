const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { createContactMessage } = require('../controllers/contactController');

// Rate limiting for contact form: max 20 submissions per 15 minutes per IP
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many contact messages submitted from this IP address. Please try again after 15 minutes.',
  },
});

// Route: POST /api/v1/contact
router.post('/', contactLimiter, createContactMessage);

module.exports = router;
