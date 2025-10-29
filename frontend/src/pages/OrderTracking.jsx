import React, { useContext, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { ordersAPI } from '../services/api'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import ChatWindow from '../components/ChatWindow'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

export default function OrderTracking(){
  const { id } = useParams()
  const { orders, user, loading, fetchOrders } = useContext(AuthContext)
  const [localLoading, setLocalLoading] = useState(true)
  const [fetchedOrder, setFetchedOrder] = useState(null)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [review, setReview] = useState('')
  const [submittingRating, setSubmittingRating] = useState(false)
  
  let order = orders.find(o => o._id === id || o.id === id)
  
  // Use fetched order if available
  if (!order && fetchedOrder) {
    order = fetchedOrder
  }

  // Fetch orders if not already loaded, or fetch specific order
  useEffect(() => {
    const loadOrder = async () => {
      setLocalLoading(true)
      
      // First try to load from orders list
      if (orders.length === 0) {
        await fetchOrders()
      }
      
      // If still not found, try to fetch the specific order
      const foundOrder = orders.find(o => o._id === id || o.id === id)
      if (!foundOrder) {
        try {
          const response = await ordersAPI.getOrder(id)
          if (response.success) {
            setFetchedOrder(response.data)
          }
        } catch (error) {
          console.error('Failed to fetch order:', error)
          toast.error('Failed to load order details')
        }
      }
      
      setLocalLoading(false)
    }
    loadOrder()
  }, [id])

  // Show loading state
  if (localLoading || loading) {
    return <LoadingSpinner message="Loading order details..." />
  }

  if(!order) {
    console.log('Order not found. Looking for ID:', id)
    console.log('Available orders:', orders.map(o => ({ id: o._id || o.id, title: o.title })))
    
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 p-4">
            <h1 className="text-2xl font-semibold mb-4">Order not found</h1>
            <p className="text-gray-600 mb-4">
              The order with ID <code className="bg-gray-100 px-2 py-1 rounded">{id}</code> could not be found.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              This could happen if:
              <ul className="list-disc ml-6 mt-2">
                <li>The order was deleted</li>
                <li>You don't have permission to view this order</li>
                <li>The order ID is incorrect</li>
              </ul>
            </p>
            <Link to={user?.role === 'customer' ? '/customer' : user?.role === 'delivery' ? '/delivery' : '/'} className="text-indigo-600 hover:underline">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Extract customer and delivery user from populated fields
  const customer = typeof order.customer === 'object' ? order.customer : null
  const deliveryUser = order.assignedTo && typeof order.assignedTo === 'object' ? order.assignedTo : null
  
  // Determine if current user is the customer
  const isCustomer = order.customer?._id === user?._id || order.customer === user?._id

  // Check if order is delivered and not yet rated by customer
  const canRate = isCustomer && order.status === 'delivered' && !order.customerRating?.rating

  // Handle rating submission
  const handleRatingSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a star rating')
      return
    }

    setSubmittingRating(true)
    try {
      const response = await ordersAPI.rateOrder(id, rating, review)
      if (response.success) {
        toast.success('Thank you for rating! 🌟')
        setShowRatingModal(false)
        // Refresh order data
        const updatedOrder = await ordersAPI.getOrder(id)
        if (updatedOrder.success) {
          setFetchedOrder(updatedOrder.data)
        }
        // Refresh orders list
        await fetchOrders()
      }
    } catch (error) {
      console.error('Rating error:', error)
      toast.error(error.message || 'Failed to submit rating')
    } finally {
      setSubmittingRating(false)
    }
  }

  // Render star rating (for display and input)
  const renderStars = (currentRating, interactive = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoveredRating(star)}
            onMouseLeave={() => interactive && setHoveredRating(0)}
            className={`text-3xl transition-transform ${
              interactive ? 'hover:scale-110 cursor-pointer' : 'cursor-default'
            } ${
              star <= (interactive ? (hoveredRating || rating) : currentRating)
                ? 'text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          >
            {star <= (interactive ? (hoveredRating || rating) : currentRating) ? '⭐' : '☆'}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex pb-16 md:pb-0">
        <div className="hidden md:block"><Sidebar /></div>
        <div className="flex-1 p-4 md:p-6">
          <h1 className="text-2xl font-semibold mb-4">Order Tracking</h1>
          
          <Card className="max-w-lg mb-4">
            <div className="font-semibold mb-2">{order.title}</div>
            <div className="text-sm text-gray-600 mb-2">{order.from} → Room {order.room}</div>
            <div className="text-xs text-gray-500 mb-3">Created: {new Date(order.createdAt).toLocaleString()}</div>
            
            <div className="mb-3">
              <div className="text-sm font-medium">Status</div>
              <div className={`inline-block px-2 py-1 rounded-full text-xs ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : order.status === 'accepted' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                {order.status}
              </div>
            </div>

            {/* Show OTP to Customer */}
            {isCustomer && order.deliveryOTP && order.status !== 'delivered' && order.status !== 'cancelled' && (
              <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-blue-900">Delivery OTP</div>
                  <div className="text-xs text-blue-600">Share with delivery person</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 tracking-widest mb-1">
                    {order.deliveryOTP}
                  </div>
                  <div className="text-xs text-blue-600">
                    Show this code to confirm delivery
                  </div>
                </div>
              </div>
            )}
            
            {customer && (
              <div className="mb-2">
                <div className="text-sm font-medium">Customer</div>
                <div className="text-sm text-gray-600">{customer.name} - Room {customer.room}</div>
              </div>
            )}
            
            {deliveryUser && (
              <div className="mb-2">
                <div className="text-sm font-medium">Delivery Student</div>
                <div className="text-sm text-gray-600">{deliveryUser.name} - Room {deliveryUser.room}</div>
              </div>
            )}

            {/* Show Rating Button for Customer after Delivery */}
            {canRate && (
              <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-300 dark:border-yellow-600 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⭐</span>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">Rate Your Delivery Experience</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Help us improve our service</div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowRatingModal(true)}
                  className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
                >
                  Rate Delivery Student
                </button>
              </div>
            )}

            {/* Show Existing Rating */}
            {isCustomer && order.customerRating?.rating && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-600 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">✅</span>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">Your Rating</div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(order.customerRating.rating, false)}
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {order.customerRating.rating}.0
                  </span>
                </div>
                {order.customerRating.comment && (
                  <div className="text-sm text-gray-700 dark:text-gray-300 italic">
                    "{order.customerRating.comment}"
                  </div>
                )}
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Rated on {new Date(order.customerRating.ratedAt).toLocaleDateString()}
                </div>
              </div>
            )}
          </Card>

          <div className="mb-4">
            <h3 className="font-medium mb-2">Timeline (Static)</h3>
            <div className="space-y-2">
              <div className="flex gap-3 items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Order created</span>
              </div>
              {order.status !== 'pending' && (
                <div className="flex gap-3 items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Accepted by delivery student</span>
                </div>
              )}
              {order.status === 'delivered' && (
                <div className="flex gap-3 items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Delivered successfully</span>
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-medium mb-4">Chat with {deliveryUser ? (isCustomer ? 'Delivery Student' : 'Customer') : 'Delivery Student'}</h3>
            <ChatWindow orderId={id} />
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl">
                  ⭐
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Rate Delivery</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">How was your experience?</p>
                </div>
              </div>
              <button
                onClick={() => setShowRatingModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Delivery Person Info */}
            {deliveryUser && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                    {deliveryUser.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{deliveryUser.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Delivery Student</div>
                  </div>
                </div>
              </div>
            )}

            {/* Star Rating */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Your Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex justify-center mb-2">
                {renderStars(rating, true)}
              </div>
              <div className="text-center">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {rating === 0 && 'Select a rating'}
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </span>
              </div>
            </div>

            {/* Review Text */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Review (Optional)
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience..."
                rows={4}
                maxLength={500}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent dark:bg-slate-800 dark:text-white resize-none"
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">
                {review.length}/500
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowRatingModal(false)}
                disabled={submittingRating}
                className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRatingSubmit}
                disabled={submittingRating || rating === 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {submittingRating ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <span>Submit Rating</span>
                    <span>⭐</span>
                  </>
                )}
              </button>
            </div>

            {/* Info Text */}
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
              Your rating helps delivery students improve and earn recognition on the leaderboard
            </p>
          </div>
        </div>
      )}
    </div>
  )
}