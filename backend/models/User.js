const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['customer', 'delivery', 'admin'],
    default: 'customer'
  },
  room: {
    type: String,
    required: function() {
      return this.role !== 'admin';
    },
    trim: true
  },
  phone: {
    type: String,
    required: function() {
      return this.role !== 'admin';
    },
    match: [/^\d{10}$/, 'Phone number must be 10 digits']
  },
  gender: {
    type: String,
    enum: ['boys', 'girls'],
    required: function() {
      return this.role !== 'admin';
    }
  },
  year: {
    type: Number,
    min: 1,
    max: 4,
    required: function() {
      return this.role !== 'admin';
    }
  },
  hostel: {
    type: String,
    required: function() {
      return this.role !== 'admin';
    },
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Delivery-specific fields
  deliveryStats: {
    totalDeliveries: {
      type: Number,
      default: 0
    },
    completedDeliveries: {
      type: Number,
      default: 0
    },
    totalEarnings: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    ratingCount: {
      type: Number,
      default: 0
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  // Admin-specific fields
  adminNotes: {
    type: String,
    default: ''
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'banned'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update delivery stats
userSchema.methods.updateDeliveryStats = function(earnings, rating) {
  if (this.role !== 'delivery') return;
  
  this.deliveryStats.totalDeliveries += 1;
  this.deliveryStats.completedDeliveries += 1;
  this.deliveryStats.totalEarnings += earnings;
  
  if (rating) {
    const currentTotal = this.deliveryStats.averageRating * this.deliveryStats.ratingCount;
    this.deliveryStats.ratingCount += 1;
    this.deliveryStats.averageRating = (currentTotal + rating) / this.deliveryStats.ratingCount;
  }
};

// Get user profile (excluding sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.adminNotes;
  return userObject;
};

// Create indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ hostel: 1, gender: 1 });
userSchema.index({ 'deliveryStats.totalDeliveries': -1 });

module.exports = mongoose.model('User', userSchema);