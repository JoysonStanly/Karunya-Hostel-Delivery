const express = require('express');
const {
  getLeaderboard,
  getSystemStats,
  getUserEarnings,
  getTrendingData
} = require('../controllers/analytics');

const { protect, authorize, ownerOrAdmin } = require('../middleware/auth');
const { validationHandler } = require('../middleware/error');
const { param, query } = require('express-validator');

const router = express.Router();

// Validation rules
const timeframeValidation = [
  query('timeframe')
    .optional()
    .isIn(['all', 'today', 'week', 'month', 'quarter'])
    .withMessage('Invalid timeframe')
];

const userIdValidation = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID')
];

const leaderboardValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  ...timeframeValidation
];

const trendingValidation = [
  query('days')
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage('Days must be between 1 and 30')
];

// Routes
router.route('/leaderboard')
  .get(leaderboardValidation, validationHandler, getLeaderboard);

router.route('/stats')
  .get(protect, authorize('admin'), timeframeValidation, validationHandler, getSystemStats);

router.route('/earnings/:userId')
  .get(protect, userIdValidation, timeframeValidation, validationHandler, getUserEarnings);

router.route('/trending')
  .get(protect, authorize('admin'), trendingValidation, validationHandler, getTrendingData);

module.exports = router;