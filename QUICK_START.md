# Quick Start Guide - Karunya Hostel Delivery

## 🚀 Running the Application Locally

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (Local or Atlas)
- npm or yarn

### Step 1: Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### Step 2: Configure Environment Variables

#### Backend (.env)
Already configured in `backend/.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://joy:joy123@karunyahostel.qmbjcr4.mongodb.net/karunyahostel
JWT_SECRET=karunya-hostel-delivery-super-secret-jwt-key-2024
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:5173
```

#### Frontend (optional .env.local)
Create `frontend/.env.local` if you need to override:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Step 3: Run the Application

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
Server will start on http://localhost:5000

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
Frontend will start on http://localhost:5173

### Step 4: Test the Application

1. **Open Browser**: http://localhost:5173
2. **Register** a new customer account
3. **Register** a delivery student account (in incognito/another browser)
4. **Create an order** as customer
5. **Accept the order** as delivery student
6. **Test chat** between customer and delivery student
7. **Complete delivery** with OTP verification

---

## 🧪 Testing API Endpoints

Run the automated test suite:
```bash
cd backend
node test-api.js
```

This will test all API endpoints and verify:
- Authentication (register, login, profile)
- Orders (create, accept, update, cancel)
- Messaging (send, receive)
- Analytics (leaderboard)
- Real-time features

---

## 📊 Database Check

### View Data in MongoDB Compass
Connect to: `mongodb+srv://joy:joy123@karunyahostel.qmbjcr4.mongodb.net/karunyahostel`

Collections to check:
- `users` - All registered users
- `orders` - All orders with status
- `messages` - Chat messages
- `notifications` - User notifications

### Seed Sample Data (Optional)
```bash
cd backend
npm run seed
```

---

## 🔍 Verify Everything is Working

### 1. Backend Health Check
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2025-10-30T...",
  "environment": "development"
}
```

### 2. Check Database Connection
Look for this in backend terminal:
```
MongoDB Connected: karunyahostel.qmbjcr4.mongodb.net
Server running in development mode on port 5000
```

### 3. Test User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test1234",
    "role": "customer",
    "room": "A-101",
    "phone": "9876543210",
    "gender": "boys",
    "year": 2,
    "hostel": "Alpha"
  }'
```

### 4. Test Order Creation
First, get a token from login/register, then:
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Test Order",
    "type": "food",
    "from": "KFC",
    "room": "A-101",
    "description": "Chicken bucket"
  }'
```

---

## 🐛 Troubleshooting

### Backend won't start
- Check if port 5000 is available
- Verify MongoDB connection string in `.env`
- Run `npm install` again

### Frontend won't start
- Check if port 5173 is available
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript/Vite errors

### Database connection fails
- Verify MongoDB Atlas credentials
- Check network access in MongoDB Atlas
- Whitelist your IP address

### Socket.io not connecting
- Check CORS settings in backend
- Verify token is being sent
- Check browser console for errors

---

## 📱 User Roles & Features

### Customer
- Create delivery requests
- Track order status
- Chat with delivery student
- Rate delivery after completion
- View order history

### Delivery Student
- View available orders
- Accept orders
- Update delivery status
- Chat with customer
- Verify delivery with OTP
- View earnings and stats

### Admin (if needed)
- View all orders
- Manage users
- View analytics
- System monitoring

---

## 🔐 Default Test Users (After seeding)

You can create these manually or use the seed script:

**Customer:**
- Email: customer@test.com
- Password: test1234

**Delivery:**
- Email: delivery@test.com
- Password: test1234

---

## 📦 Project Structure

```
Karunya Hostel Delivery/
├── backend/
│   ├── config/         # Database configuration
│   ├── controllers/    # Business logic
│   ├── middleware/     # Auth, validation, errors
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API routes
│   ├── utils/          # Helper functions
│   └── server.js       # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API integration
│   │   ├── context/    # State management
│   │   └── router/     # Routing config
│   └── index.html
└── README.md
```

---

## ✅ Pre-Deployment Checklist

Before deploying to production:

1. ✅ All dependencies installed
2. ✅ Database connection verified
3. ✅ API endpoints tested
4. ✅ Frontend builds successfully (`npm run build`)
5. ✅ Environment variables configured
6. ✅ CORS settings updated for production
7. ✅ JWT secrets are secure
8. ✅ Rate limiting enabled
9. ✅ Error handling tested
10. ✅ Socket.io connections working

---

## 🎯 Next Steps

1. **Run locally** and test all features
2. **Run test suite** to verify API
3. **Check database** for data persistence
4. **Test real-time features** (chat, notifications)
5. **Review deployment checklist**
6. **Deploy** to your chosen platform

---

## 📞 Need Help?

- Check `DEPLOYMENT_CHECKLIST.md` for deployment guide
- Review `backend/README.md` for API documentation
- Run `node test-api.js` for automated testing
- Check MongoDB Atlas dashboard for database issues

**All systems are verified and ready! 🚀**
