import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { analyticsAPI } from '../services/api'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import Button from '../components/Button'
import Avatar from '../components/Avatar'

export default function DashboardCustomer(){
  const { user, orders, loading } = useContext(AuthContext)
  const [leaderboard, setLeaderboard] = useState([])
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false)

  // Filter orders for current user - safely handle undefined/null orders
  const myOrders = (orders || []).filter(o => 
    (o.customer && o.customer._id === user?._id) || 
    (o.customer === user?._id) ||
    (o.customerId === user?.id) // fallback for any remaining dummy data
  )
  const activeOrders = myOrders.filter(order => 
    order.status !== 'delivered' && order.status !== 'cancelled'
  )
  const recentOrders = myOrders.slice(0, 3)

  // Fetch leaderboard for preview
  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true)
    try {
      const response = await analyticsAPI.getLeaderboard()
      if (response.success && response.data) {
        setLeaderboard(response.data.slice(0, 3)) // Top 3 for preview
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoadingLeaderboard(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Navbar />
      <div className="flex pb-16 md:pb-0">
        <div className="hidden md:block"><Sidebar /></div>
        <div className="flex-1 border-l-2 border-gray-200 dark:border-slate-800">
          
          {/* Desktop Layout */}
          <div className="hidden md:block p-6">
            <div className="border-b-2 border-gray-200 dark:border-slate-800 pb-4 mb-6">
              <h1 className="text-2xl font-semibold mb-4 dark:text-white">Customer Dashboard</h1>
              <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-gray-200 dark:border-slate-700 p-4 inline-block">
                <Link to="/create-request">
                  <Button size="lg">Create Order</Button>
                </Link>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-gray-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-semibold mb-4 border-b border-gray-200 dark:border-slate-700 pb-2 dark:text-white">My Orders</h2>
              <div className="grid gap-4">
                {myOrders.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center">
                    <div className="text-lg font-medium mb-1">No orders yet</div>
                    <p className="text-gray-500">Create your first request to get started.</p>
                  </div>
                ) : (
                  myOrders.map(order=> (
                    <Card key={order._id || order.id}>
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="font-semibold">{order.title}</div>
                          <div className="text-sm text-gray-600">{order.from} → Room {order.toRoom || order.room}</div>
                          <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</div>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <div className={`px-2 py-1 rounded-full text-xs inline-block border ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : order.status === 'accepted' || order.status === 'picked_up' || order.status === 'in_transit' ? 'bg-blue-100 text-blue-800 border-blue-300' : order.status === 'delivered' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}`}>
                            {order.status.replace('_', ' ')}
                          </div>
                          <Link 
                            to={`/order/${order._id || order.id}`} 
                            className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 border border-blue-200"
                          >
                            {order.status === 'pending' || order.status === 'cancelled' ? 'View Details' : 'View & Chat'}
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
            </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="block md:hidden border-t-2 border-gray-200 dark:border-slate-800">
            {/* Header with Customer Info */}
            <div className="bg-white dark:bg-slate-900 p-4 border-b-2 border-gray-200 dark:border-slate-800">
              <h1 className="text-xl font-semibold mb-4 text-center dark:text-white">Customer Dashboard</h1>
              <div className="flex items-center space-x-3 mb-4 border border-gray-200 dark:border-slate-700 rounded-xl p-3">
                <Avatar name={user.name} size={48} />
                <div className="flex-1">
                  <div className="font-semibold text-lg dark:text-white">{user.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Room {user.room || 'A-101'}</div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Link to="/profile">
                  <Button className="w-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 border-2 border-gray-300 dark:border-slate-600">
                    View Profile
                  </Button>
                </Link>
                <Link to="/create-request">
                  <Button className="w-full border-2 border-blue-300 dark:border-blue-600">
                    Create New Request
                  </Button>
                </Link>
              </div>
            </div>

            {/* Active Orders Section */}
            <div className="bg-white dark:bg-slate-900 border-b-2 border-gray-200 dark:border-slate-800 px-4 py-4">
              <div className="flex items-center justify-between mb-3 border-b border-gray-200 dark:border-slate-700 pb-2">
                <h2 className="font-semibold text-gray-900 dark:text-white">Active Orders</h2>
                {activeOrders.length > 0 && (
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-full border border-green-300 dark:border-green-600">
                    {activeOrders.length} Active
                  </span>
                )}
              </div>
              
              {activeOrders.length > 0 ? (
                <div className="space-y-3">
                  {activeOrders.slice(0, 1).map(order => (
                    <div key={order._id || order.id} className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 border-2 border-gray-300 dark:border-slate-600">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium dark:text-white">Order #{order._id ? order._id.slice(-6) : order.id}</div>
                        <span className={`px-2 py-1 rounded-full text-xs border ${
                          order.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border-yellow-300 dark:border-yellow-600' : 
                          order.status === 'accepted' || order.status === 'picked_up' || order.status === 'in_transit' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-600' : 
                          order.status === 'delivered' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-300 dark:border-green-600' :
                          'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-300 dark:border-red-600'
                        }`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 border-l-2 border-blue-300 dark:border-blue-600 pl-3">
                        {order.from} → Room {order.toRoom || order.room}
                      </div>
                      <Link to={`/order/${order._id || order.id}`}>
                        <Button size="sm" className="w-full border-2 border-blue-300 dark:border-blue-600">
                          {order.status === 'pending' ? 'View Details' : 'View & Chat'}
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl">
                  <div className="text-sm">No active orders</div>
                </div>
              )}
            </div>

            {/* Recent Order History */}
            <div className="bg-white dark:bg-slate-900 border-b-2 border-gray-200 dark:border-slate-800 px-4 py-4">
              <div className="flex items-center justify-between mb-3 border-b border-gray-200 dark:border-slate-700 pb-2">
                <h2 className="font-semibold text-gray-900 dark:text-white">Recent Order History</h2>
                <Link to="/customer" className="text-xs text-blue-600 dark:text-blue-400 border-b border-blue-600 dark:border-blue-400">View All</Link>
              </div>
              
              <div className="space-y-2">
                {recentOrders.length > 0 ? (
                  recentOrders.map(order => (
                    <div key={order._id || order.id} className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border-2 border-gray-200 dark:border-slate-700">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <div className="font-medium text-sm dark:text-white">{order.title}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                          <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs border ${
                            order.status === 'delivered' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-300 dark:border-green-600' : 
                            order.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-300 dark:border-red-600' : 
                            'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border-yellow-300 dark:border-yellow-600'
                          }`}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </div>
                        {order.status !== 'pending' && order.status !== 'cancelled' && (
                          <Link 
                            to={`/order/${order._id || order.id}`}
                            className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 whitespace-nowrap"
                          >
                            View & Chat
                          </Link>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl">
                    <div className="text-sm">No recent orders</div>
                  </div>
                )}
              </div>
            </div>

            {/* Leaderboard Preview */}
            <div className="bg-white dark:bg-slate-900 px-4 py-4 mb-4 border-2 border-gray-200 dark:border-slate-700 rounded-xl mx-4">
              <div className="flex items-center justify-between mb-3 border-b border-gray-200 dark:border-slate-700 pb-2">
                <h2 className="font-semibold text-gray-900 dark:text-white">Leaderboard Preview</h2>
                <Link to="/leaderboard" className="text-xs text-blue-600 dark:text-blue-400 border-b border-blue-600 dark:border-blue-400">See Leaderboard</Link>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border-2 border-gray-200 dark:border-slate-700">
                {loadingLeaderboard ? (
                  <div className="text-center py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Loading leaderboard...</div>
                  </div>
                ) : leaderboard.length > 0 ? (
                  <div className="space-y-2">
                    {leaderboard.map((student, index) => (
                      <div key={student._id || index} className="flex items-center justify-between text-sm border-b border-gray-100 dark:border-slate-700 pb-2 last:border-b-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-yellow-500 dark:text-yellow-400">
                            {index === 0 ? '🏆' : index === 1 ? '🥈' : '🥉'}
                          </span>
                          <span className="font-medium dark:text-white">{student.name}</span>
                        </div>
                        <span className="font-semibold dark:text-white">₹{student.totalEarnings || 0}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">No leaderboard data available</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}