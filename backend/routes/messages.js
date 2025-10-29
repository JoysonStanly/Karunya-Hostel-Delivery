const express = require('express');
const {
  getMessages,
  sendMessage,
  markMessageAsRead,
  getUnreadCount,
  getConversations,
  flagMessage
} = require('../controllers/messages');

const { protect, canAccessChat } = require('../middleware/auth');
const { validationHandler } = require('../middleware/error');
const { messageLimiter } = require('../middleware/rateLimiting');
const { body, param } = require('express-validator');

const router = express.Router();

// Validation rules
const sendMessageValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message content must be between 1 and 1000 characters'),
  
  body('type')
    .optional()
    .isIn(['text', 'image', 'file', 'location'])
    .withMessage('Invalid message type')
];

const flagMessageValidation = [
  body('reason')
    .isIn(['spam', 'inappropriate', 'harassment', 'other'])
    .withMessage('Invalid flag reason')
];

const orderIdValidation = [
  param('orderId')
    .isMongoId()
    .withMessage('Invalid order ID')
];

const messageIdValidation = [
  param('messageId')
    .isMongoId()
    .withMessage('Invalid message ID')
];

// Routes
router.route('/unread-count')
  .get(protect, getUnreadCount);

router.route('/conversations')
  .get(protect, getConversations);

router.route('/:orderId')
  .get(protect, orderIdValidation, validationHandler, canAccessChat, getMessages)
  .post(protect, messageLimiter, orderIdValidation, sendMessageValidation, validationHandler, canAccessChat, sendMessage);

router.route('/:messageId/read')
  .put(protect, messageIdValidation, validationHandler, markMessageAsRead);

router.route('/:messageId/flag')
  .put(protect, messageIdValidation, flagMessageValidation, validationHandler, flagMessage);

module.exports = router;