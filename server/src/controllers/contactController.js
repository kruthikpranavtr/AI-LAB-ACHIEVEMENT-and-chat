const ContactMessage = require('../models/ContactMessage');

/**
 * @desc    Create a new contact message inquiry
 * @route   POST /api/v1/contact
 * @access  Public
 */
const createContactMessage = async (req, res) => {
  try {
    const { name, email, interest, message } = req.body;

    // 1. Validate name
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Your full name is required.',
      });
    }

    const cleanName = name.trim();
    if (cleanName.length < 2 || cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Name must be between 2 and 100 characters long.',
      });
    }

    // 2. Validate email
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = email.trim().toLowerCase();
    if (!emailRegex.test(cleanEmail) || cleanEmail.length > 150) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    // 3. Validate interest
    if (!interest || typeof interest !== 'string' || !interest.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Primary interest or inquiry category is required.',
      });
    }

    const cleanInterest = interest.trim();
    if (cleanInterest.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Interest category cannot exceed 100 characters.',
      });
    }

    // 4. Validate message
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required.',
      });
    }

    const cleanMessage = message.trim();
    if (cleanMessage.length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Message must be at least 5 characters long.',
      });
    }

    if (cleanMessage.length > 3000) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot exceed 3000 characters in length.',
      });
    }

    // 5. Save message to MongoDB
    const newMessage = await ContactMessage.create({
      name: cleanName,
      email: cleanEmail,
      interest: cleanInterest,
      message: cleanMessage,
      status: 'new',
    });

    // 6. Return success response (do not expose internal DB details)
    return res.status(201).json({
      success: true,
      message: 'Message received successfully',
      data: {
        id: newMessage._id.toString(),
      },
    });
  } catch (error) {
    console.error('[Contact Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to process your message at this time. Please try again later.',
    });
  }
};

module.exports = {
  createContactMessage,
};
