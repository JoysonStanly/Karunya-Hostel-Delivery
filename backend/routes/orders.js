const express = require('express');
const {
  getOrders,
  getOrder,
  createOrder,
  acceptOrder,
  updateOrderStatus,
  cancelOrder,
  rateOrder,
  getOrderTimeline,
  updateOrderLocation
} = require('../controllers/orders');

const { protect, authorize, canAccessOrder } = require('../middleware/auth');
const { validationHandler } = require('../middleware/error');
const { body, param } = require('express-validator');

const router = express.Router();

// Validation rules
const createOrderValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  
  body('type')
    .isIn(['parcel', 'food'])
    .withMessage('Type must be parcel or food'),
  
  body('from')
    .trim()
    .notEmpty()
    .withMessage('Pickup location is required'),
  
  body('room')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Room cannot be empty'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('specialInstructions')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Special instructions cannot exceed 300 characters')
];

const updateStatusValidation = [
  body('status')
    .isIn(['accepted', 'picked-up', 'in-transit', 'delivered', 'cancelled'])
    .withMessage('Invalid status'),
  
  body('otp')
    .optional()
    .isNumeric()
    .isLength({ min: 4, max: 4 })
    .withMessage('OTP must be a 4-digit number')
];

const rateOrderValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
];

const locationValidation = [
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters')
];

const orderIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid order ID')
];

// Routes
router.route('/')
  .get(protect, getOrders)
  .post(protect, authorize('customer'), createOrderValidation, validationHandler, createOrder);

router.route('/:id')
  .get(protect, orderIdValidation, validationHandler, canAccessOrder, getOrder);

router.route('/:id/accept')
  .put(protect, authorize('delivery'), orderIdValidation, validationHandler, acceptOrder);

router.route('/:id/status')
  .put(protect, authorize('delivery'), orderIdValidation, updateStatusValidation, validationHandler, updateOrderStatus);

router.route('/:id/cancel')
  .put(protect, authorize('customer'), orderIdValidation, validationHandler, cancelOrder);

router.route('/:id/rate')
  .put(protect, orderIdValidation, rateOrderValidation, validationHandler, rateOrder);

router.route('/:id/timeline')
  .get(protect, orderIdValidation, validationHandler, canAccessOrder, getOrderTimeline);

router.route('/:id/location')
  .put(protect, authorize('delivery'), orderIdValidation, locationValidation, validationHandler, updateOrderLocation);

module.exports = router;