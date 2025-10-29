const Message = require('../models/Message');
const Order = require('../models/Order');
const { asyncHandler } = require('../middleware/error');

// @desc    Get messages for an order
// @route   GET /api/messages/:orderId
// @access  Private (Customer or assigned delivery student)
const getMessages = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  // Check if order exists and user has access (handled by middleware)
  const order = req.order;

  const messages = await Message.getConversation(orderId, parseInt(limit), parseInt(page));

  // Mark messages as read for the current user
  await Message.markAllAsRead(orderId, req.user.id);

  res.status(200).json({
    success: true,
    count: messages.length,
    data: messages
  });
});

// @desc    Send a message
// @route   POST /api/messages/:orderId
// @access  Private (Customer or assigned delivery student)
const sendMessage = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const { content, type = 'text' } = req.body;

  // Check if order exists and user has access (handled by middleware)
  const order = req.order;

  // Create message
  const message = await Message.create({
    order: orderId,
    sender: req.user.id,
    content,
    type
  });

  // Populate sender info
  await message.populate('sender', 'name role avatar');

  // Emit socket event for real-time messaging (will be handled by socket.io)
  if (req.io) {
    req.io.to(`order_${orderId}`).emit('new_message', message);
  }

  res.status(201).json({
    success: true,
    data: message
  });
});

// @desc    Mark message as read
// @route   PUT /api/messages/:messageId/read
// @access  Private
const markMessageAsRead = asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.messageId);

  if (!message) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }

  // Only the recipient can mark as read
  if (message.sender.toString() === req.user.id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'Cannot mark your own message as read'
    });
  }

  message.markAsRead();
  await message.save();

  res.status(200).json({
    success: true,
    message: 'Message marked as read'
  });
});

// @desc    Get unread message count for user
// @route   GET /api/messages/unread-count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res, next) => {
  // Get all orders where user is involved
  let orderQuery = {};
  
  if (req.user.role === 'customer') {
    orderQuery.customer = req.user.id;
  } else if (req.user.role === 'delivery') {
    orderQuery.assignedTo = req.user.id;
  } else {
    // Admin can see all
    orderQuery = {};
  }

  const orders = await Order.find(orderQuery).select('_id');
  const orderIds = orders.map(order => order._id);

  // Count unread messages in these orders
  const unreadCount = await Message.countDocuments({
    order: { $in: orderIds },
    sender: { $ne: req.user.id },
    isRead: false
  });

  res.status(200).json({
    success: true,
    data: { unreadCount }
  });
});

// @desc    Get conversation list for user
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res, next) => {
  // Get all orders where user is involved
  let orderQuery = {};
  
  if (req.user.role === 'customer') {
    orderQuery.customer = req.user.id;
  } else if (req.user.role === 'delivery') {
    orderQuery.assignedTo = req.user.id;
  } else {
    // Admin can see all
    orderQuery = {};
  }

  const orders = await Order.find(orderQuery)
    .populate('customer', 'name room avatar')
    .populate('assignedTo', 'name room avatar')
    .sort({ updatedAt: -1 });

  const conversations = [];

  for (const order of orders) {
    // Get last message for this order
    const lastMessage = await Message.findOne({ order: order._id })
      .sort({ createdAt: -1 })
      .populate('sender', 'name');

    // Get unread count for this conversation
    const unreadCount = await Message.getUnreadCount(order._id, req.user.id);

    // Determine the other participant
    let otherParticipant = null;
    if (req.user.role === 'customer' && order.assignedTo) {
      otherParticipant = order.assignedTo;
    } else if (req.user.role === 'delivery') {
      otherParticipant = order.customer;
    }

    conversations.push({
      orderId: order._id,
      orderTitle: order.title,
      orderStatus: order.status,
      otherParticipant,
      lastMessage,
      unreadCount,
      updatedAt: order.updatedAt
    });
  }

  res.status(200).json({
    success: true,
    count: conversations.length,
    data: conversations
  });
});

// @desc    Flag message (for moderation)
// @route   PUT /api/messages/:messageId/flag
// @access  Private
const flagMessage = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;
  
  const message = await Message.findById(req.params.messageId);

  if (!message) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }

  // Cannot flag your own message
  if (message.sender.toString() === req.user.id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'Cannot flag your own message'
    });
  }

  message.flag(reason);
  await message.save();

  res.status(200).json({
    success: true,
    message: 'Message flagged for review'
  });
});

module.exports = {
  getMessages,
  sendMessage,
  markMessageAsRead,
  getUnreadCount,
  getConversations,
  flagMessage
};