# Karunya Hostel Delivery - Frontend

A React.js + Tailwind CSS frontend for a student-to-student parcel and food delivery system inside a hostel.

## Features

- **Three User Roles**: Customer, Delivery Student, Admin
- **Pages**: Landing, Auth, Dashboards, Order Creation/Tracking, Reports, Profile, Leaderboard, Admin Panel
- **Components**: Reusable Button, Card, Modal, InputField, Navbar, Sidebar, Loader
- **Routing**: Protected routes based on user role
- **State Management**: React Context with localStorage persistence
- **Dummy Data**: Sample users, orders, reports for testing UI

## Tech Stack

- React 18 with Vite
- Tailwind CSS for styling
- React Router for navigation
- Zustand (ready for advanced state management)
- Clsx for conditional styling

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open browser:**
   Navigate to `http://localhost:5173`

## Test Users (Dummy Auth)

| Email | Role | Password |
|-------|------|----------|
| alice@example.com | customer | any |
| bob@example.com | delivery | any |
| admin@khd | admin | any |

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components
├── context/        # AuthContext for state management
├── router/         # React Router setup
├── App.jsx         # Main app component
└── main.jsx        # Entry point
```

## Pages Overview

- **Landing**: Project intro and auth links
- **Login/Register**: Authentication with role selection
- **Customer Dashboard**: View orders, create requests
- **Delivery Dashboard**: Accept orders, manage deliveries
- **Create Request**: Form to place delivery orders
- **Order Tracking**: Live status and timeline (mocked)
- **Report Page**: Submit complaints/feedback
- **Profile**: Update user information
- **Leaderboard**: Top delivery students
- **Admin Panel**: View reports and system stats (UI only)


## Future Backend Integration

The frontend is structured to easily integrate with APIs:

1. **AuthContext functions** (`login`, `register`, `createOrder`, etc.) can be replaced with API calls
2. **Dummy data** in `AuthContext` can be replaced with API responses
3. **localStorage** persistence can be replaced with token-based auth
4. **Real-time features** can be added with WebSockets

## Build for Production

```bash
npm run build
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Notes

- All interactions currently use local state and dummy data
- No backend APIs are called
- Authentication is mocked (any password works for test users)
- Order status updates and notifications are static for now
- Responsive design works on mobile and desktop