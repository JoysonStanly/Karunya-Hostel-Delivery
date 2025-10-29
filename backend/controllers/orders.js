const Order = require('../models/Order');
const User = require('../models/User');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/error');

// @desc    Get orders
// @route   GET /api/orders
// @access  Private
const getOrders = asyncHandler(async (req, res, next) => {
  let query = {};
  let sortOptions = { createdAt: -1 };

  // Filter based on user role
  if (req.user.role === 'customer') {
    query.customer = req.user.id;
  } else if (req.user.role === 'delivery') {
    // For delivery students, show available orders (pending) AND their assigned orders
    query.$or = [
      { status: 'pending' },
      { assignedTo: req.user.id }
    ];
  }
  // Admin can see all orders (no additional filtering)

  // Additional filters
  if (req.query.status) {
    query.status = req.query.status;
  }
  if (req.query.type) {
    query.type = req.query.type;
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;

  const orders = await Order.find(query)
    .populate('customer', 'name room phone hostel')
    .populate('assignedTo', 'name room phone deliveryStats')
    .sort(sortOptions)
    .limit(limit)
    .skip(startIndex);

  const total = await Order.countDocuments(query);

  // Pagination result
  const pagination = {};

  if (startIndex + limit < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: orders.length,
    pagination,
    data: orders
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('customer', 'name room phone hostel')
    .populate('assignedTo', 'name room phone deliveryStats');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (customer only)
const createOrder = asyncHandler(async (req, res, next) => {
  // Add customer to req.body
  req.body.customer = req.user.id;

  // Set default room to user's room if not provided
  if (!req.body.room) {
    req.body.room = req.user.room;
  }

  const order = await Order.create(req.body);

  // Populate the created order
  await order.populate('customer', 'name room phone hostel');

  // Create notification for available delivery students
  const deliveryStudents = await User.find({
    role: 'delivery',
    isActive: true,
    'deliveryStats.isAvailable': true
  });

  // Send notifications to available delivery students
  const notifications = deliveryStudents.map(student => ({
    recipient: student._id,
    title: 'New Delivery Request',
    message: `New ${order.type} delivery from ${order.from} to room ${order.room}`,
    type: 'order-created',
    relatedOrder: order._id
  }));

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }

  res.status(201).json({
    success: true,
    data: order
  });
});

// @desc    Accept order
// @route   PUT /api/orders/:id/accept
// @access  Private (delivery only)
const acceptOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  if (!order.canBeAccepted()) {
    return res.status(400).json({
      success: false,
      message: 'Order cannot be accepted'
    });
  }

  // Check if delivery student is available
  if (!req.user.deliveryStats.isAvailable) {
    return res.status(400).json({
      success: false,
      message: 'You are currently unavailable for deliveries'
    });
  }

  // Update order status
  order.updateStatus('accepted', req.user.id);
  await order.save();
  
  console.log('Order accepted. OTP generated:', order.deliveryOTP)

  // Create system message
  await Message.createSystemMessage(
    order._id,
    req.user.id,
    'order-accepted',
    `Order accepted by ${req.user.name}`
  );

  // Create notification for customer
  await Notification.createOrderNotification(
    'order-accepted',
    order.customer,
    order._id,
    `Your order has been accepted by ${req.user.name}`
  );

  // Populate the updated order
  await order.populate('customer', 'name room phone hostel');
  await order.populate('assignedTo', 'name room phone deliveryStats');

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (delivery or admin)
const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status, otp } = req.body;
  
  console.log('Update Order Status Request:', {
    orderId: req.params.id,
    requestedStatus: status,
    otp: otp ? '****' : 'not provided',
    userId: req.user.id,
    userRole: req.user.role
  });
  
  const order = await Order.findById(req.params.id);

  if (!order) {
    console.log('Order not found:', req.params.id);
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Check permissions
  const isAssignedDelivery = order.assignedTo && order.assignedTo.toString() === req.user.id.toString();
  const isAdmin = req.user.role === 'admin';
  
  console.log('Permission Check:', {
    orderAssignedTo: order.assignedTo,
    isAssignedDelivery,
    isAdmin
  });

  if (!isAssignedDelivery && !isAdmin) {
    console.log('User not authorized to update this order');
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this order'
    });
  }

  // If marking as delivered, verify OTP
  if (status === 'delivered') {
    console.log('Attempting to mark as delivered. Order OTP:', order.deliveryOTP ? '****' : 'null', 'Received OTP:', otp ? '****' : 'null')
    
    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'OTP is required to mark order as delivered'
      });
    }

    const otpVerification = order.verifyOTP(otp);
    console.log('OTP Verification result:', otpVerification)
    
    if (!otpVerification.valid) {
      return res.status(400).json({
        success: false,
        message: otpVerification.message
      });
    }
  }

  // Update status
  order.updateStatus(status);
  await order.save();

  // Create system message for status update
  const statusMessages = {
    'picked-up': { text: 'Order has been picked up', type: 'order-picked-up' },
    'in-transit': { text: 'Order is on the way', type: 'order-in-transit' },
    'delivered': { text: 'Order has been delivered successfully', type: 'order-delivered' }
  };

  if (statusMessages[status]) {
    await Message.createSystemMessage(
      order._id,
      req.user.id,
      statusMessages[status].type,
      statusMessages[status].text
    );

    // Create notification for customer
    await Notification.createOrderNotification(
      statusMessages[status].type,
      order.customer,
      order._id,
      statusMessages[status].text
    );
  }

  // If order is delivered, update delivery student stats
  if (status === 'delivered' && order.assignedTo) {
    const deliveryStudent = await User.findById(order.assignedTo);
    if (deliveryStudent) {
      deliveryStudent.updateDeliveryStats(order.deliveryFee || 15);
      await deliveryStudent.save();
    }
  }

  // Populate the updated order
  await order.populate('customer', 'name room phone hostel');
  await order.populate('assignedTo', 'name room phone deliveryStats');

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private (customer or admin)
const cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Check permissions
  const isCustomer = order.customer.toString() === req.user.id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isCustomer && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to cancel this order'
    });
  }

  if (!order.canBeCancelled()) {
    return res.status(400).json({
      success: false,
      message: 'Order cannot be cancelled at this stage'
    });
  }

  // Update order
  order.updateStatus('cancelled');
  order.cancelReason = req.body.reason || 'Cancelled by customer';
  await order.save();

  // Create system message
  await Message.createSystemMessage(
    order._id,
    req.user.id,
    'order-cancelled',
    `Order cancelled: ${order.cancelReason}`
  );

  // Notify delivery student if assigned
  if (order.assignedTo) {
    await Notification.createOrderNotification(
      'order-cancelled',
      order.assignedTo,
      order._id,
      `Order has been cancelled: ${order.cancelReason}`
    );
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Rate order (customer rates delivery, delivery rates customer)
// @route   PUT /api/orders/:id/rate
// @access  Private
const rateOrder = asyncHandler(async (req, res, next) => {
  const { rating, comment } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  if (order.status !== 'delivered') {
    return res.status(400).json({
      success: false,
      message: 'Can only rate completed orders'
    });
  }

  const isCustomer = order.customer.toString() === req.user.id.toString();
  const isDeliveryStudent = order.assignedTo && order.assignedTo.toString() === req.user.id.toString();

  if (!isCustomer && !isDeliveryStudent) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to rate this order'
    });
  }

  // Update rating
  if (isCustomer) {
    order.customerRating = {
      rating: rating,
      comment: comment || '',
      ratedAt: new Date()
    };

    // Update delivery student's average rating
    if (order.assignedTo) {
      const deliveryStudent = await User.findById(order.assignedTo);
      if (deliveryStudent) {
        deliveryStudent.updateDeliveryStats(0, rating);
        await deliveryStudent.save();
      }
    }
  } else {
    order.deliveryRating = {
      rating: rating,
      comment: comment || '',
      ratedAt: new Date()
    };
  }

  await order.save();

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Get order timeline
// @route   GET /api/orders/:id/timeline
// @access  Private
const getOrderTimeline = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  const timeline = order.getTimeline();

  res.status(200).json({
    success: true,
    data: timeline
  });
});

// @desc    Update order location (for delivery tracking)
// @route   PUT /api/orders/:id/location
// @access  Private (delivery only)
const updateOrderLocation = asyncHandler(async (req, res, next) => {
  const { latitude, longitude, address } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Check if user is assigned delivery student
  if (!order.assignedTo || order.assignedTo.toString() !== req.user.id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update location for this order'
    });
  }

  // Update location (this could be pickup or delivery location based on status)
  const locationUpdate = {
    type: 'Point',
    coordinates: [longitude, latitude],
    address: address || ''
  };

  if (order.status === 'accepted' || order.status === 'picked-up') {
    order.pickupLocation = locationUpdate;
  } else if (order.status === 'in-transit') {
    order.deliveryLocation = locationUpdate;
  }

  await order.save();

  // Create location update message
  await Message.createSystemMessage(
    order._id,
    req.user.id,
    'location-update',
    `Location updated: ${address || 'Current location'}`
  );

  res.status(200).json({
    success: true,
    data: order
  });
});

module.exports = {
  getOrders,
  getOrder,
  createOrder,
  acceptOrder,
  updateOrderStatus,
  cancelOrder,
  rateOrder,
  getOrderTimeline,
  updateOrderLocation
};