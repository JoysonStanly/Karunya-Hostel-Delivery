import React, { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from '../pages/Landing'
import Login from '../pages/Login'
import Register from '../pages/Register'
import DashboardCustomer from '../pages/DashboardCustomer'
import DashboardDelivery from '../pages/DashboardDelivery'
import CreateRequest from '../pages/CreateRequest'
import OrderTracking from '../pages/OrderTracking'
import Profile from '../pages/Profile'
import Leaderboard from '../pages/Leaderboard'
import LoadingSpinner from '../components/LoadingSpinner'
import { AuthContext } from '../context/AuthContext'

function AuthRoute({ children }){
  const { user, initializing } = useContext(AuthContext)
  
  // Show loading while initializing
  if (initializing) {
    return <LoadingSpinner message="Checking authentication..." />
  }
  
  // Redirect to appropriate dashboard if already logged in
  if (user) {
    if (user.role === 'customer') return <Navigate to="/customer" replace />
    if (user.role === 'delivery') return <Navigate to="/delivery" replace />
    return <Navigate to="/" replace />
  }
  
  return children
}

function Protected({ children, roles }){
  const { user, initializing } = useContext(AuthContext)
  
  // Show loading while initializing authentication
  if (initializing) {
    return <LoadingSpinner message="Verifying access..." />
  }
  
  // Redirect to login if not authenticated
  if (!user) return <Navigate to="/login" replace />
  
  // Redirect if user doesn't have required role
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  
  return children
}

export default function AppRouter(){
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
      <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />

      <Route path="/customer" element={<Protected roles={["customer"]}><DashboardCustomer/></Protected>} />
      <Route path="/delivery" element={<Protected roles={["delivery"]}><DashboardDelivery/></Protected>} />

      <Route path="/create-request" element={<Protected roles={["customer"]}><CreateRequest/></Protected>} />
      <Route path="/order/:id" element={<Protected><OrderTracking/></Protected>} />
      <Route path="/profile" element={<Protected><Profile/></Protected>} />
      <Route path="/leaderboard" element={<Protected><Leaderboard/></Protected>} />

      <Route path="*" element={<Navigate to='/' replace />} />
    </Routes>
  )
}
