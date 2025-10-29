const User = require('../models/User');
const Order = require('../models/Order');
const { asyncHandler } = require('../middleware/error');

// @desc    Get delivery leaderboard
// @route   GET /api/analytics/leaderboard
// @access  Public (can be accessed by anyone)
const getLeaderboard = asyncHandler(async (req, res, next) => {
  const { limit = 50, timeframe = 'all' } = req.query;

  // Build time filter
  let timeFilter = {};
  if (timeframe !== 'all') {
    const now = new Date();
    let startDate;
    
    switch (timeframe) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = null;
    }
    
    if (startDate) {
      timeFilter.deliveredAt = { $gte: startDate };
    }
  }

  // Get delivery students with their stats
  const deliveryStudents = await User.find({
    role: 'delivery',
    isActive: true
  }).select('name room hostel deliveryStats avatar').lean();

  // Calculate real-time stats for each delivery student
  const leaderboard = [];

  for (const student of deliveryStudents) {
    // Get completed orders in timeframe
    const completedOrders = await Order.find({
      assignedTo: student._id,
      status: 'delivered',
      ...timeFilter
    });

    // Calculate stats
    const totalDeliveries = completedOrders.length;
    const totalEarnings = completedOrders.reduce((sum, order) => sum + (order.deliveryFee || 15), 0);
    
    // Calculate average delivery time (in minutes)
    const deliveryTimes = completedOrders
      .filter(order => order.acceptedAt && order.deliveredAt)
      .map(order => (order.deliveredAt - order.acceptedAt) / (1000 * 60));
    
    const avgDeliveryTime = deliveryTimes.length > 0 
      ? Math.round(deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length)
      : 0;

    // Calculate success rate (delivered vs accepted)
    const acceptedOrders = await Order.countDocuments({
      assignedTo: student._id,
      status: { $in: ['accepted', 'picked-up', 'in-transit', 'delivered', 'cancelled'] },
      ...timeFilter
    });
    
    const successRate = acceptedOrders > 0 ? (totalDeliveries / acceptedOrders * 100).toFixed(1) : 100;

    // Get average rating from completed orders
    const ratedOrders = completedOrders.filter(order => order.customerRating && order.customerRating.rating);
    const averageRating = ratedOrders.length > 0
      ? (ratedOrders.reduce((sum, order) => sum + order.customerRating.rating, 0) / ratedOrders.length).toFixed(1)
      : 0;

    leaderboard.push({
      _id: student._id,
      name: student.name,
      room: student.room,
      hostel: student.hostel,
      avatar: student.avatar,
      stats: {
        totalDeliveries,
        totalEarnings,
        averageRating: parseFloat(averageRating),
        successRate: parseFloat(successRate),
        avgDeliveryTime,
        ratingCount: ratedOrders.length
      }
    });
  }

  // Sort by total deliveries (descending), then by earnings
  leaderboard.sort((a, b) => {
    if (b.stats.totalDeliveries !== a.stats.totalDeliveries) {
      return b.stats.totalDeliveries - a.stats.totalDeliveries;
    }
    return b.stats.totalEarnings - a.stats.totalEarnings;
  });

  // Add ranking
  const rankedLeaderboard = leaderboard.slice(0, parseInt(limit)).map((student, index) => ({
    ...student,
    rank: index + 1
  }));

  res.status(200).json({
    success: true,
    count: rankedLeaderboard.length,
    timeframe,
    data: rankedLeaderboard
  });
});

// @desc    Get system statistics (admin only)
// @route   GET /api/analytics/stats
// @access  Private (Admin only)
const getSystemStats = asyncHandler(async (req, res, next) => {
  const { timeframe = 'all' } = req.query;

  // Build time filter
  let timeFilter = {};
  if (timeframe !== 'all') {
    const now = new Date();
    let startDate;
    
    switch (timeframe) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = null;
    }
    
    if (startDate) {
      timeFilter.createdAt = { $gte: startDate };
    }
  }

  // User statistics
  const totalUsers = await User.countDocuments({ isActive: true });
  const customerCount = await User.countDocuments({ role: 'customer', isActive: true });
  const deliveryCount = await User.countDocuments({ role: 'delivery', isActive: true });
  const adminCount = await User.countDocuments({ role: 'admin', isActive: true });

  // Order statistics
  const totalOrders = await Order.countDocuments(timeFilter);
  const pendingOrders = await Order.countDocuments({ status: 'pending', ...timeFilter });
  const activeOrders = await Order.countDocuments({ 
    status: { $in: ['accepted', 'picked-up', 'in-transit'] }, 
    ...timeFilter 
  });
  const completedOrders = await Order.countDocuments({ status: 'delivered', ...timeFilter });
  const cancelledOrders = await Order.countDocuments({ status: 'cancelled', ...timeFilter });

  // Revenue statistics
  const revenueStats = await Order.aggregate([
    {
      $match: { status: 'delivered', ...timeFilter }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$deliveryFee' },
        averageOrderValue: { $avg: '$deliveryFee' }
      }
    }
  ]);

  const totalRevenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;
  const averageOrderValue = revenueStats.length > 0 ? revenueStats[0].averageOrderValue : 0;

  // Performance metrics
  const performanceStats = await Order.aggregate([
    {
      $match: { 
        status: 'delivered', 
        acceptedAt: { $exists: true },
        deliveredAt: { $exists: true },
        ...timeFilter 
      }
    },
    {
      $project: {
        deliveryTime: {
          $divide: [
            { $subtract: ['$deliveredAt', '$acceptedAt'] },
            1000 * 60 // Convert to minutes
          ]
        }
      }
    },
    {
      $group: {
        _id: null,
        avgDeliveryTime: { $avg: '$deliveryTime' },
        minDeliveryTime: { $min: '$deliveryTime' },
        maxDeliveryTime: { $max: '$deliveryTime' }
      }
    }
  ]);

  const avgDeliveryTime = performanceStats.length > 0 ? Math.round(performanceStats[0].avgDeliveryTime) : 0;

  // Order type distribution
  const orderTypeStats = await Order.aggregate([
    { $match: timeFilter },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    timeframe,
    data: {
      users: {
        total: totalUsers,
        customers: customerCount,
        delivery: deliveryCount,
        admins: adminCount
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        active: activeOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
        completionRate: totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0
      },
      revenue: {
        total: totalRevenue,
        average: averageOrderValue ? averageOrderValue.toFixed(2) : 0
      },
      performance: {
        avgDeliveryTime: `${avgDeliveryTime} minutes`
      },
      orderTypes: orderTypeStats
    }
  });
});

// @desc    Get user earnings (delivery student only)
// @route   GET /api/analytics/earnings/:userId
// @access  Private (Own profile or admin)
const getUserEarnings = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId;

  // Check permission
  if (req.user.id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view these earnings'
    });
  }

  const user = await User.findById(userId);
  if (!user || user.role !== 'delivery') {
    return res.status(404).json({
      success: false,
      message: 'Delivery student not found'
    });
  }

  const { timeframe = 'all' } = req.query;

  // Build time filter
  let timeFilter = {};
  if (timeframe !== 'all') {
    const now = new Date();
    let startDate;
    
    switch (timeframe) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = null;
    }
    
    if (startDate) {
      timeFilter.deliveredAt = { $gte: startDate };
    }
  }

  // Get completed orders
  const completedOrders = await Order.find({
    assignedTo: userId,
    status: 'delivered',
    ...timeFilter
  }).sort({ deliveredAt: -1 });

  // Calculate earnings by day for chart data
  const earningsData = [];
  const dailyEarnings = {};

  completedOrders.forEach(order => {
    const date = order.deliveredAt.toISOString().split('T')[0];
    const earnings = order.deliveryFee || 15;
    
    if (!dailyEarnings[date]) {
      dailyEarnings[date] = { date, earnings: 0, orders: 0 };
    }
    dailyEarnings[date].earnings += earnings;
    dailyEarnings[date].orders += 1;
  });

  // Convert to array and sort by date
  const chartData = Object.values(dailyEarnings).sort((a, b) => new Date(a.date) - new Date(b.date));

  // Calculate totals
  const totalEarnings = completedOrders.reduce((sum, order) => sum + (order.deliveryFee || 15), 0);
  const totalOrders = completedOrders.length;
  const averageEarningsPerOrder = totalOrders > 0 ? (totalEarnings / totalOrders).toFixed(2) : 0;

  res.status(200).json({
    success: true,
    timeframe,
    data: {
      user: {
        name: user.name,
        room: user.room,
        avatar: user.avatar
      },
      summary: {
        totalEarnings,
        totalOrders,
        averageEarningsPerOrder: parseFloat(averageEarningsPerOrder)
      },
      chartData,
      recentOrders: completedOrders.slice(0, 10).map(order => ({
        _id: order._id,
        title: order.title,
        earnings: order.deliveryFee || 15,
        deliveredAt: order.deliveredAt,
        from: order.from,
        room: order.room
      }))
    }
  });
});

// @desc    Get trending data
// @route   GET /api/analytics/trending
// @access  Private (Admin only)
const getTrendingData = asyncHandler(async (req, res, next) => {
  const { days = 7 } = req.query;
  const daysNum = parseInt(days);

  // Generate date range
  const dates = [];
  for (let i = daysNum - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }

  // Get daily order counts
  const orderTrends = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(new Date().getTime() - daysNum * 24 * 60 * 60 * 1000)
        }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          status: "$status"
        },
        count: { $sum: 1 }
      }
    }
  ]);

  // Format trending data
  const trendingData = dates.map(date => {
    const dayData = {
      date,
      total: 0,
      pending: 0,
      completed: 0,
      cancelled: 0
    };

    orderTrends.forEach(trend => {
      if (trend._id.date === date) {
        dayData[trend._id.status] = trend.count;
        dayData.total += trend.count;
      }
    });

    return dayData;
  });

  res.status(200).json({
    success: true,
    data: trendingData
  });
});

module.exports = {
  getLeaderboard,
  getSystemStats,
  getUserEarnings,
  getTrendingData
};