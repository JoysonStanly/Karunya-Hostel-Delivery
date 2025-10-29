const path = require('path');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');

// Load env vars
require('dotenv').config();

// Connect to database
const connectDB = require('./config/database');
connectDB();

// Import middleware
const { errorHandler, notFound } = require('./middleware/error');
const { generalLimiter } = require('./middleware/rateLimiting');

// Import routes
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const messageRoutes = require('./routes/messages');
const analyticsRoutes = require('./routes/analytics');
const uploadRoutes = require('./routes/uploads');

const app = express();

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.io
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting - ONLY in production
if (process.env.NODE_ENV === 'production') {
  app.use('/api/', generalLimiter);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/uploads', uploadRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/dist/index.html'));
  });
}

// Socket.io connection handling
const Message = require('./models/Message');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

// Socket authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
};

io.use(authenticateSocket);

io.on('connection', (socket) => {
  console.log(`User ${socket.user.name} connected with socket ID: ${socket.id}`);

  // Join user to their personal room
  socket.join(`user_${socket.userId}`);

  // Handle joining order room for chat
  socket.on('join_order', (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`User ${socket.user.name} joined order ${orderId}`);
  });

  // Handle leaving order room
  socket.on('leave_order', (orderId) => {
    socket.leave(`order_${orderId}`);
    console.log(`User ${socket.user.name} left order ${orderId}`);
  });

  // Handle new message
  socket.on('send_message', async (data) => {
    try {
      const { orderId, content, type = 'text' } = data;

      // Create message in database
      const message = await Message.create({
        order: orderId,
        sender: socket.userId,
        content,
        type
      });

      await message.populate('sender', 'name role avatar');

      // Emit to all users in the order room
      io.to(`order_${orderId}`).emit('new_message', message);

      // Send acknowledgment to sender
      socket.emit('message_sent', { success: true, messageId: message._id });

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });

  // Handle typing indicator
  socket.on('typing_start', (data) => {
    socket.to(`order_${data.orderId}`).emit('user_typing', {
      userId: socket.userId,
      userName: socket.user.name
    });
  });

  socket.on('typing_stop', (data) => {
    socket.to(`order_${data.orderId}`).emit('user_stopped_typing', {
      userId: socket.userId
    });
  });

  // Handle order status updates
  socket.on('order_status_update', (data) => {
    const { orderId, status, message } = data;
    
    // Broadcast to all users in the order room
    io.to(`order_${orderId}`).emit('order_updated', {
      orderId,
      status,
      message,
      updatedBy: socket.user.name
    });
  });

  // Handle delivery location updates
  socket.on('location_update', (data) => {
    const { orderId, location } = data;
    
    // Broadcast to customer
    socket.to(`order_${orderId}`).emit('delivery_location_update', {
      orderId,
      location,
      deliveryStudent: socket.user.name
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User ${socket.user.name} disconnected`);
  });

  // Handle connection errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  console.log('Shutting down the server due to uncaught exception');
  process.exit(1);
});

module.exports = { app, server, io };