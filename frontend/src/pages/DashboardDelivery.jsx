import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { analyticsAPI } from '../services/api'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import Button from '../components/Button'
import BottomNav from '../components/BottomNav'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'

export default function DashboardDelivery(){
  const { user, orders, acceptOrder, completeOrder, loading } = useContext(AuthContext)
  const [leaderboard, setLeaderboard] = useState([])
  const [stats, setStats] = useState({ totalEarnings: 0, totalDeliveries: 0, rating: 4.8 })
  const [loadingStats, setLoadingStats] = useState(false)
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [otp, setOtp] = useState('')

  // Filter orders based on user role and ID - safely handle undefined/null orders
  const availableOrders = (orders || []).filter(o => o.status === 'pending')
  const acceptedOrders = (orders || []).filter(o => {
    const isAssignedToMe = o.assignedTo && (
      o.assignedTo._id === user?._id || 
      o.assignedTo === user?._id ||
      (typeof o.assignedTo === 'string' && o.assignedTo === user?._id)
    )
    const isActiveStatus = o.status === 'accepted' || o.status === 'picked_up' || o.status === 'in_transit'
    return isAssignedToMe && isActiveStatus
  })
  const completedOrders = (orders || []).filter(o => {
    const isAssignedToMe = o.assignedTo && (
      o.assignedTo._id === user?._id || 
      o.assignedTo === user?._id ||
      (typeof o.assignedTo === 'string' && o.assignedTo === user?._id)
    )
    return isAssignedToMe && o.status === 'delivered'
  })

  // Debug logging
  useEffect(() => {
    console.log('=== Dashboard Delivery Debug ===')
    console.log('Total orders:', orders.length)
    console.log('Available orders:', availableOrders.length)
    console.log('Accepted orders:', acceptedOrders.length)
    console.log('User ID:', user?._id)
    console.log('Sample order assignedTo:', orders[0]?.assignedTo)
    console.log('================================')
  }, [orders, acceptedOrders])

  useEffect(() => {
    if (user) {
      fetchLeaderboard()
      fetchUserStats()
    }
  }, [user])

  const fetchLeaderboard = async () => {
    try {
      const response = await analyticsAPI.getLeaderboard()
      if (response.success && response.data) {
        setLeaderboard(response.data.slice(0, 3))
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    }
  }

  const fetchUserStats = async () => {
    setLoadingStats(true)
    try {
      const response = await analyticsAPI.getEarnings(user._id)
      if (response.success) {
        setStats({
          totalEarnings: response.earnings.totalEarnings || 0,
          totalDeliveries: completedOrders.length,
          rating: response.earnings.averageRating || 4.8
        })
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error)
      // Use local data as fallback
      setStats({
        totalEarnings: completedOrders.reduce((sum, order) => sum + (order.deliveryFee || order.price || 15), 0),
        totalDeliveries: completedOrders.length,
        rating: 4.8
      })
    } finally {
      setLoadingStats(false)
    }
  }

  async function accept(orderId){
    try {
      await acceptOrder(orderId)
    } catch (error) {
      console.error('Failed to accept order:', error)
    }
  }

  async function complete(orderId){
    setSelectedOrderId(orderId)
    setShowOTPModal(true)
  }

  async function handleOTPSubmit(){
    if (!otp || otp.length !== 4) {
      toast.error('Please enter a valid 4-digit OTP')
      return
    }
    
    try {
      console.log('Submitting OTP:', otp, 'for order:', selectedOrderId)
      await completeOrder(selectedOrderId, otp)
      setShowOTPModal(false)
      setOtp('')
      setSelectedOrderId(null)
      fetchUserStats() // Refresh stats after completion
    } catch (error) {
      console.error('Failed to complete order:', error)
      // Error message is already shown by completeOrder via toast
      // Keep modal open so user can try again
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Desktop Layout */}
      <div className="hidden md:block">
        <Navbar />
        <div className="flex pb-16 md:pb-0">
          <div className="hidden md:block"><Sidebar /></div>
          <div className="flex-1 p-4 md:p-6">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Delivery Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400">Welcome back, {user?.name}!</p>
              </div>
              
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
              <div className="p-6 bg-white border border-gray-100 shadow-sm dark:bg-slate-900 dark:border-slate-700 rounded-xl">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg dark:bg-blue-900/30">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalDeliveries}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Deliveries</div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white border border-gray-100 shadow-sm dark:bg-slate-900 dark:border-slate-700 rounded-xl">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg dark:bg-yellow-900/30">
                    <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{acceptedOrders.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Active Orders</div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white border border-gray-100 shadow-sm dark:bg-slate-900 dark:border-slate-700 rounded-xl">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg dark:bg-green-900/30">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.rating}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Rating</div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white border border-gray-100 shadow-sm dark:bg-slate-900 dark:border-slate-700 rounded-xl">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg dark:bg-purple-900/30">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">₹{stats.totalEarnings}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
              {/* Available Orders - Takes 2 columns on xl screens */}
              <div className="xl:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Available Delivery Requests</h2>
                  <span className="px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full dark:text-blue-200 dark:bg-blue-900/50">
                    {availableOrders.length} Available
                  </span>
                </div>
                
                {availableOrders.length === 0 ? (
                  <div className="p-8 text-center bg-white border border-gray-100 shadow-sm dark:bg-slate-900 dark:border-slate-700 rounded-xl">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full dark:bg-slate-800">
                      <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7" />
                      </svg>
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">No Available Requests</h3>
                    <p className="text-gray-500 dark:text-gray-400">Check back later for new delivery opportunities!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availableOrders.map(order=>{
                      const customer = order.customer || { name: 'Unknown Customer' }
                      return (
                        <div key={order._id || order.id} className="p-6 transition-shadow bg-white border border-gray-100 shadow-sm dark:bg-slate-900 dark:border-slate-700 rounded-xl hover:shadow-md">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{order.title}</h3>
                                <span className="px-2 py-1 ml-3 text-xs text-green-800 bg-green-100 rounded-full dark:text-green-200 dark:bg-green-900/50">
                                  {order.type === 'food' ? 'Food' : 'Parcel'}
                                </span>
                              </div>
                              <div className="flex items-center mb-1 text-sm text-gray-600 dark:text-gray-400">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="font-medium">{order.from}</span>
                                <span className="mx-2">→</span>
                                <span className="font-medium">Room {order.toRoom || order.room}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Customer: {customer.name}
                              </div>
                              {(order.deliveryFee || order.price) > 0 && (
                                <div className="mt-2 text-lg font-semibold text-green-600 dark:text-green-400">
                                  Delivery Fee: ₹{order.deliveryFee || order.price}
                                </div>
                              )}
                            </div>
                            <div className="ml-6">
                              <Button 
                                onClick={()=> accept(order._id || order.id)} 
                                size="lg"
                                className="px-6 py-3 text-white bg-blue-600 hover:bg-blue-700"
                                disabled={loading}
                              >
                                {loading ? 'Accepting...' : 'Accept Request'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Sidebar with Active Orders and Leaderboard */}
              <div className="space-y-8">
                {/* Active Deliveries */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Active Deliveries</h2>
                    {acceptedOrders.length > 0 && (
                      <span className="px-3 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full dark:text-yellow-200 dark:bg-yellow-900/50">
                        {acceptedOrders.length} In Progress
                      </span>
                    )}
                  </div>
                  
                  {acceptedOrders.length === 0 ? (
                    <div className="p-6 text-center bg-white border border-gray-100 shadow-sm dark:bg-slate-900 dark:border-slate-700 rounded-xl">
                      <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full dark:bg-slate-800">
                        <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">No active deliveries</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {acceptedOrders.map(order=>{
                        const customer = order.customer || { name: 'Unknown Customer' }
                        return (
                          <div key={order._id || order.id} className="p-4 bg-white border border-gray-100 shadow-sm dark:bg-slate-900 dark:border-slate-700 rounded-xl">
                            <div className="mb-3">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{order.title}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{order.from} → Room {order.toRoom || order.room}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-500">Customer: {customer.name}</p>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full dark:text-yellow-200 dark:bg-yellow-900/50">
                                {order.status.replace('_', ' ')}
                              </span>
                              <div className="flex gap-2">
                                <Link 
                                  to={`/order/${order._id || order.id}`}
                                  className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                >
                                  View & Chat
                                </Link>
                                <Button 
                                  onClick={()=> complete(order._id || order.id)} 
                                  size="sm"
                                  className="text-white bg-green-600 hover:bg-green-700"
                                  disabled={loading}
                                >
                                  {loading ? 'Updating...' : 'Mark Delivered'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Leaderboard */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Top Performers</h2>
                    <a href="/leaderboard" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                      View All
                    </a>
                  </div>
                  
                  <div className="overflow-hidden bg-white border border-gray-100 shadow-sm dark:bg-slate-900 dark:border-slate-700 rounded-xl">
                    {leaderboard.length > 0 ? (
                      leaderboard.map((person, index) => (
                        <div key={person._id || index} className={`flex items-center p-4 ${index !== leaderboard.length - 1 ? 'border-b border-gray-100 dark:border-slate-700' : ''}`}>
                          <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                            <span className="text-sm font-medium text-white">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white">{person.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{person.totalDeliveries || 0} deliveries</div>
                          </div>
                          <div className="text-sm font-semibold text-green-600 dark:text-green-400">₹{person.totalEarnings || 0}</div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        <div className="text-sm">No leaderboard data available</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Header */}
        <div className="p-4 bg-white shadow-sm dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold dark:text-white">Delivery Dashboard</h1>
            <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full">
              <span className="text-sm font-medium text-white">{user?.name?.charAt(0) || 'D'}</span>
            </div>
          </div>
        </div>

        <div className="p-4 pb-20 space-y-6 dark:bg-slate-950">
          {/* Available Delivery Requests */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold dark:text-white">Available Delivery Requests</h2>
            </div>
            
            {availableOrders.length === 0 ? (
              <div className="p-6 text-center text-gray-500 bg-white rounded-lg dark:text-gray-400 dark:bg-slate-900">
                No available requests right now.
              </div>
            ) : (
              <div className="space-y-3">
                {availableOrders.map(order=>{
                  const customer = order.customer || { name: 'Unknown Customer' }
                  return (
                    <div key={order._id || order.id} className="p-4 bg-white border rounded-lg shadow-sm dark:bg-slate-900 dark:border-slate-700">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">{order.title}</h3>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{order.from} → Room {order.toRoom || order.room}</p>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">Customer: {customer.name}</p>
                        </div>
                        <button 
                          onClick={()=> accept(order._id || order.id)}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                          disabled={loading}
                        >
                          {loading ? 'Accepting...' : 'Accept Request'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Accepted Orders */}
          <div>
            <h2 className="mb-3 text-lg font-semibold dark:text-white">Accepted Orders</h2>
            
            {acceptedOrders.length === 0 ? (
              <div className="p-6 text-center text-gray-500 bg-white rounded-lg dark:text-gray-400 dark:bg-slate-900">
                No active deliveries.
              </div>
            ) : (
              <div className="space-y-3">
                {acceptedOrders.map(order=>{
                  const customer = order.customer || { name: 'Unknown Customer' }
                  return (
                    <div key={order._id || order.id} className="p-4 bg-white border rounded-lg shadow-sm dark:bg-slate-900 dark:border-slate-700">
                      <div className="mb-3">
                        <h3 className="font-medium text-gray-900 dark:text-white">{order.title}</h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{order.from} → Room {order.toRoom || order.room}</p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">Customer: {customer.name}</p>
                        <span className="inline-block px-2 py-1 mt-2 text-xs text-yellow-800 bg-yellow-100 rounded-full dark:text-yellow-200 dark:bg-yellow-900/50">
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Link 
                          to={`/order/${order._id || order.id}`}
                          className="flex-1 px-4 py-2 text-sm font-medium text-center text-blue-600 rounded-lg dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                        >
                          View & Chat
                        </Link>
                        <button 
                          onClick={()=> complete(order._id || order.id)}
                          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 disabled:opacity-50"
                          disabled={loading}
                        >
                          {loading ? 'Updating...' : 'Mark Delivered'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Your Stats */}
          <div>
            <h2 className="mb-3 text-lg font-semibold dark:text-white">Your Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 text-center bg-white rounded-lg shadow-sm dark:bg-slate-900">
                <div className="text-2xl font-bold text-blue-500 dark:text-blue-400">{stats.totalDeliveries}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Deliveries</div>
              </div>
              <div className="p-4 text-center bg-white rounded-lg shadow-sm dark:bg-slate-900">
                <div className="text-2xl font-bold text-yellow-500 dark:text-yellow-400">{stats.rating}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Rating</div>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold dark:text-white">Leaderboard</h2>
              <span className="text-sm text-blue-500 cursor-pointer dark:text-blue-400">View Leaderboard</span>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm dark:bg-slate-900">
              {leaderboard.length > 0 ? (
                leaderboard.map((person, index) => (
                  <div key={person._id || index} className={`flex items-center p-4 ${index !== leaderboard.length - 1 ? 'border-b border-gray-100 dark:border-slate-700' : ''}`}>
                    <div className="flex items-center justify-center w-8 h-8 mr-3 bg-blue-500 rounded-full">
                      <span className="text-sm font-medium text-white">{person.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">{person.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{person.totalDeliveries || 0} deliveries</div>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">₹{person.totalEarnings || 0}</div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  <div className="text-sm">No leaderboard data available</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <BottomNav />
      </div>

      {/* OTP Verification Modal */}
      <Modal open={showOTPModal} onClose={() => {setShowOTPModal(false); setOtp('');}} title="Enter Delivery OTP">
        <div>
          <p className="mb-4 text-sm text-gray-600">
            Please ask the customer for the 4-digit OTP to confirm delivery
          </p>
          
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Delivery OTP
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="4"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 4-digit OTP"
              className="w-full px-4 py-3 text-2xl font-bold tracking-widest text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => {setShowOTPModal(false); setOtp('');}}
              className="flex-1 px-4 py-2 font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleOTPSubmit}
              className="flex-1 px-4 py-2 font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
              disabled={loading || otp.length !== 4}
            >
              {loading ? 'Verifying...' : 'Confirm Delivery'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}