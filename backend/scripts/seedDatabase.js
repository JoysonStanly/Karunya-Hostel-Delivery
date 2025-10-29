const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Order = require('../models/Order');
const Report = require('../models/Report');
const Message = require('../models/Message');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected for seeding');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

// Sample users data
const sampleUsers = [
  {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'password123',
    role: 'customer',
    room: 'A101',
    phone: '9999999999',
    gender: 'girls',
    year: 2,
    hostel: 'Durga Girls Hostel'
  },
  {
    name: 'Bob Smith',
    email: 'bob@example.com',
    password: 'password123',
    role: 'delivery',
    room: 'B202',
    phone: '8888888888',
    gender: 'boys',
    year: 3,
    hostel: 'Indra Boys Hostel',
    deliveryStats: {
      totalDeliveries: 15,
      completedDeliveries: 14,
      totalEarnings: 250,
      averageRating: 4.5,
      ratingCount: 10,
      isAvailable: true
    }
  },
  {
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    password: 'password123',
    role: 'delivery',
    room: 'C303',
    phone: '7777777777',
    gender: 'boys',
    year: 4,
    hostel: 'Indra Boys Hostel',
    deliveryStats: {
      totalDeliveries: 22,
      completedDeliveries: 21,
      totalEarnings: 350,
      averageRating: 4.7,
      ratingCount: 15,
      isAvailable: true
    }
  },
  {
    name: 'Diana Prince',
    email: 'diana@example.com',
    password: 'password123',
    role: 'delivery',
    room: 'D404',
    phone: '6666666666',
    gender: 'girls',
    year: 3,
    hostel: 'Durga Girls Hostel',
    deliveryStats: {
      totalDeliveries: 18,
      completedDeliveries: 17,
      totalEarnings: 280,
      averageRating: 4.3,
      ratingCount: 12,
      isAvailable: false
    }
  },
  {
    name: 'Admin User',
    email: 'admin@khd',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'Eva Green',
    email: 'eva@example.com',
    password: 'password123',
    role: 'customer',
    room: 'E505',
    phone: '5555555555',
    gender: 'girls',
    year: 1,
    hostel: 'Durga Girls Hostel'
  },
  {
    name: 'Frank Miller',
    email: 'frank@example.com',
    password: 'password123',
    role: 'customer',
    room: 'F606',
    phone: '4444444444',
    gender: 'boys',
    year: 2,
    hostel: 'Indra Boys Hostel'
  }
];

// Sample orders data (will be created with actual user IDs)
const createSampleOrders = (users) => {
  const customer1 = users.find(u => u.email === 'alice@example.com');
  const customer2 = users.find(u => u.email === 'eva@example.com');
  const customer3 = users.find(u => u.email === 'frank@example.com');
  const delivery1 = users.find(u => u.email === 'bob@example.com');
  const delivery2 = users.find(u => u.email === 'charlie@example.com');

  return [
    {
      title: 'Parcel - Books from Amazon',
      type: 'parcel',
      price: 0,
      from: 'Main Gate',
      room: 'A101',
      customer: customer1._id,
      status: 'pending',
      description: 'Engineering textbooks delivery',
      deliveryFee: 15,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
      title: 'Food - Pizza from Dominos',
      type: 'food',
      price: 50,
      from: 'Canteen',
      room: 'A101',
      customer: customer1._id,
      assignedTo: delivery1._id,
      status: 'delivered',
      description: 'Large pepperoni pizza',
      deliveryFee: 25,
      acceptedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      deliveredAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
      customerRating: {
        rating: 5,
        comment: 'Quick delivery, food was still hot!',
        ratedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
    },
    {
      title: 'Parcel - Medicine',
      type: 'parcel',
      price: 0,
      from: 'Medical Store',
      room: 'E505',
      customer: customer2._id,
      assignedTo: delivery2._id,
      status: 'in-transit',
      description: 'Prescription medicines',
      deliveryFee: 20,
      acceptedAt: new Date(Date.now() - 30 * 60 * 1000),
      pickedUpAt: new Date(Date.now() - 15 * 60 * 1000),
      createdAt: new Date(Date.now() - 45 * 60 * 1000)
    },
    {
      title: 'Food - Burger and Fries',
      type: 'food',
      price: 35,
      from: 'Food Court',
      room: 'F606',
      customer: customer3._id,
      status: 'pending',
      description: 'Chicken burger with large fries',
      deliveryFee: 20,
      isUrgent: true,
      createdAt: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
    },
    {
      title: 'Parcel - Laptop Charger',
      type: 'parcel',
      price: 0,
      from: 'Electronics Shop',
      room: 'E505',
      customer: customer2._id,
      assignedTo: delivery1._id,
      status: 'delivered',
      description: 'Dell laptop charger replacement',
      deliveryFee: 15,
      acceptedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      deliveredAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
      customerRating: {
        rating: 4,
        comment: 'Good service',
        ratedAt: new Date(Date.now() - 22 * 60 * 60 * 1000)
      },
      createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000)
    }
  ];
};

// Sample reports data
const createSampleReports = (users, orders) => {
  const customer1 = users.find(u => u.email === 'alice@example.com');
  const delivery1 = users.find(u => u.email === 'bob@example.com');
  const deliveredOrder = orders.find(o => o.status === 'delivered');

  return [
    {
      reason: 'late-delivery',
      message: 'The delivery took much longer than expected. It was supposed to be delivered in 30 minutes but took 2 hours.',
      reportedBy: customer1._id,
      reportedPersonId: delivery1._id,
      relatedOrderId: deliveredOrder._id,
      status: 'open',
      priority: 'medium',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
    },
    {
      reason: 'other',
      message: 'The app is very slow when loading the order tracking page. Please fix this technical issue.',
      reportedBy: customer1._id,
      status: 'resolved',
      priority: 'low',
      category: 'technical',
      resolvedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      adminNotes: 'Fixed server performance issues',
      actionTaken: 'no-action',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  ];
};

// Clear existing data
const clearData = async () => {
  try {
    await User.deleteMany({});
    await Order.deleteMany({});
    await Report.deleteMany({});
    await Message.deleteMany({});
    console.log('Existing data cleared');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

// Seed users
const seedUsers = async () => {
  try {
    // Hash passwords
    for (let user of sampleUsers) {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }

    const users = await User.create(sampleUsers);
    console.log(`${users.length} users created`);
    return users;
  } catch (error) {
    console.error('Error seeding users:', error);
    return [];
  }
};

// Seed orders
const seedOrders = async (users) => {
  try {
    const sampleOrders = createSampleOrders(users);
    const orders = await Order.create(sampleOrders);
    console.log(`${orders.length} orders created`);
    return orders;
  } catch (error) {
    console.error('Error seeding orders:', error);
    return [];
  }
};

// Seed reports
const seedReports = async (users, orders) => {
  try {
    const sampleReports = createSampleReports(users, orders);
    const reports = await Report.create(sampleReports);
    console.log(`${reports.length} reports created`);
    return reports;
  } catch (error) {
    console.error('Error seeding reports:', error);
    return [];
  }
};

// Seed messages
const seedMessages = async (orders) => {
  try {
    const messages = [];
    
    // Add some sample messages for orders that have assigned delivery students
    const activeOrders = orders.filter(o => o.assignedTo);
    
    for (const order of activeOrders.slice(0, 2)) {
      messages.push(
        {
          order: order._id,
          sender: order.customer,
          content: 'Hi! When will you pick up my order?',
          type: 'text',
          createdAt: new Date(Date.now() - 30 * 60 * 1000)
        },
        {
          order: order._id,
          sender: order.assignedTo,
          content: 'Hello! I\'ll be there in 10 minutes.',
          type: 'text',
          createdAt: new Date(Date.now() - 25 * 60 * 1000)
        },
        {
          order: order._id,
          sender: order.customer,
          content: 'Thank you!',
          type: 'text',
          createdAt: new Date(Date.now() - 20 * 60 * 1000)
        }
      );
    }
    
    if (messages.length > 0) {
      const createdMessages = await Message.create(messages);
      console.log(`${createdMessages.length} messages created`);
    }
    
    return messages;
  } catch (error) {
    console.error('Error seeding messages:', error);
    return [];
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    await connectDB();
    await clearData();
    
    const users = await seedUsers();
    const orders = await seedOrders(users);
    const reports = await seedReports(users, orders);
    const messages = await seedMessages(orders);
    
    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📋 Seeded data summary:');
    console.log(`👥 Users: ${users.length}`);
    console.log(`📦 Orders: ${orders.length}`);
    console.log(`📊 Reports: ${reports.length}`);
    console.log(`💬 Messages: ${messages.length}`);
    
    console.log('\n🔐 Test user credentials:');
    console.log('Customer: alice@example.com / password123');
    console.log('Delivery: bob@example.com / password123');
    console.log('Admin: admin@khd / admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;