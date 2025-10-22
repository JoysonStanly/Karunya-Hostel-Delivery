import React, { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from '../pages/Landing'
import Login from '../pages/Login'
import Register from '../pages/Register'
import DashboardCustomer from '../pages/DashboardCustomer'
import DashboardDelivery from '../pages/DashboardDelivery'
import CreateRequest from '../pages/CreateRequest'
import OrderTracking from '../pages/OrderTracking'
import ReportPage from '../pages/ReportPage'
import Profile from '../pages/Profile'
import Leaderboard from '../pages/Leaderboard'
import AdminPanel from '../pages/AdminPanel'
import { AuthContext } from '../context/AuthContext'

function Protected({ children, roles }){
  const { user } = useContext(AuthContext)
  if(!user) return <Navigate to="/login" replace />
  if(roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default function AppRouter(){
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/customer" element={<Protected roles={["customer"]}><DashboardCustomer/></Protected>} />
      <Route path="/delivery" element={<Protected roles={["delivery"]}><DashboardDelivery/></Protected>} />

      <Route path="/create-request" element={<Protected roles={["customer"]}><CreateRequest/></Protected>} />
      <Route path="/order/:id" element={<Protected><OrderTracking/></Protected>} />
      <Route path="/report" element={<Protected><ReportPage/></Protected>} />
      <Route path="/profile" element={<Protected><Profile/></Protected>} />
      <Route path="/leaderboard" element={<Protected><Leaderboard/></Protected>} />
      <Route path="/admin" element={<Protected roles={["admin"]}><AdminPanel/></Protected>} />

      <Route path="*" element={<Navigate to='/' replace />} />
    </Routes>
  )
}
