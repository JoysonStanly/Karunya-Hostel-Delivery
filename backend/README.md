# Karunya Hostel Delivery - Backend API

A comprehensive Node.js/Express.js backend for the Karunya Hostel Delivery System.

## Features

- **JWT Authentication** with role-based access control (Customer, Delivery, Admin)
- **MongoDB** with Mongoose ODM
- **Real-time Chat** with Socket.io
- **File Upload** support for profile pictures and order attachments
- **Email Notifications** with Nodemailer
- **Comprehensive API** for orders, reports, leaderboard, and analytics
- **Security** with Helmet, CORS, rate limiting, and input validation

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file with:
   ```
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/karunya-hostel-delivery
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=30d
   CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   CLOUDINARY_API_KEY=your-cloudinary-key
   CLOUDINARY_API_SECRET=your-cloudinary-secret
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

3. **Start MongoDB** (make sure MongoDB is running)

4. **Seed the database** (optional):
   ```bash
   npm run seed
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/upload-avatar` - Upload profile picture

### Orders
- `GET /api/orders` - Get orders (filtered by user role)
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/accept` - Accept order (delivery student)
- `PUT /api/orders/:id/complete` - Mark order as delivered
- `PUT /api/orders/:id/cancel` - Cancel order

### Reports
- `GET /api/reports` - Get reports (admin only)
- `POST /api/reports` - Submit new report
- `PUT /api/reports/:id/resolve` - Resolve report (admin only)

### Messages
- `GET /api/messages/:orderId` - Get chat messages for order
- `POST /api/messages/:orderId` - Send message (real-time with Socket.io)

### Analytics
- `GET /api/analytics/leaderboard` - Get delivery leaderboard
- `GET /api/analytics/stats` - Get system statistics
- `GET /api/analytics/earnings/:userId` - Get user earnings

## Database Models

### User
- name, email, password (hashed)
- role (customer, delivery, admin)
- room, phone, gender, year, hostel
- avatar, isActive, ratings

### Order
- title, type (parcel/food), price
- from (pickup location), room (delivery location)
- customer, assignedTo (delivery student)
- status (pending, accepted, in-transit, delivered, cancelled)
- timestamps, location updates

### Report
- reason, message, reportedBy, reportedPersonId
- relatedOrderId, status, resolvedBy, adminNotes

### Message
- order, sender, content, type (text/image)
- timestamp, isRead

## Real-time Features

- Live chat between customers and delivery students
- Order status updates
- New order notifications for delivery students
- Report notifications for admins

## Security Features

- Password hashing with bcryptjs
- JWT tokens with expiration
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Helmet for security headers

## File Structure

```
backend/
├── models/          # Mongoose models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── controllers/     # Route controllers
├── utils/           # Utility functions
├── config/          # Configuration files
├── uploads/         # File upload directory
├── scripts/         # Database seeding scripts
└── server.js        # Main server file
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| NODE_ENV | Environment (development/production) | Yes |
| PORT | Server port | Yes |
| MONGODB_URI | MongoDB connection string | Yes |
| JWT_SECRET | JWT signing secret | Yes |
| JWT_EXPIRE | JWT expiration time | Yes |
| CLOUDINARY_* | Cloudinary credentials for file upload | Optional |
| EMAIL_* | Email service credentials | Optional |

## Deployment

The backend is ready for deployment on platforms like:
- Heroku
- Railway
- Vercel
- AWS EC2
- Digital Ocean

Make sure to:
1. Set all environment variables
2. Use a cloud MongoDB service (MongoDB Atlas)
3. Configure CORS for your frontend domain
4. Set up file upload storage (Cloudinary or AWS S3)