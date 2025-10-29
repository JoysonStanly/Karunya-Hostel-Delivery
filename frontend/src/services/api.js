import axios from 'axios'
import { io } from 'socket.io-client'

// API Configuration - Use environment variable or fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('khd_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Attach status to error for better handling
    if (error.response) {
      error.status = error.response.status
      error.data = error.response.data
    }
    
    // Don't auto-redirect on 401 - let the auth context handle it
    // This prevents unwanted redirects during page refresh
    
    return Promise.reject(error)
  }
)

// Socket.io connection
let socket = null

export const connectSocket = () => {
  const token = localStorage.getItem('khd_token')
  if (token && !socket) {
    socket = io(SOCKET_URL, {
      auth: {
        token: token
      }
    })
    
    socket.on('connect', () => {
      console.log('Connected to server')
    })
    
    socket.on('disconnect', () => {
      console.log('Disconnected from server')
    })
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const getSocket = () => socket

// Authentication API
export const authAPI = {
  // Login user
  login: async (email, password, role) => {
    try {
      const response = await api.post('/auth/login', { email, password, role })
      if (response.data.success) {
        localStorage.setItem('khd_token', response.data.token)
        localStorage.setItem('khd_user', JSON.stringify(response.data.user))
        connectSocket()
      }
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' }
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      if (response.data.success) {
        localStorage.setItem('khd_token', response.data.token)
        localStorage.setItem('khd_user', JSON.stringify(response.data.user))
        connectSocket()
      }
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' }
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/auth/logout')
      localStorage.removeItem('khd_token')
      localStorage.removeItem('khd_user')
      disconnectSocket()
      return { success: true }
    } catch (error) {
      // Even if API call fails, clear local storage
      localStorage.removeItem('khd_token')
      localStorage.removeItem('khd_user')
      disconnectSocket()
      return { success: true }
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get user data' }
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/auth/updatedetails', userData)
      if (response.data.success) {
        localStorage.setItem('khd_user', JSON.stringify(response.data.user))
      }
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update profile' }
    }
  },

  // Toggle delivery availability
  toggleAvailability: async () => {
    try {
      const response = await api.put('/auth/toggle-availability')
      if (response.data.success) {
        localStorage.setItem('khd_user', JSON.stringify(response.data.user))
      }
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to toggle availability' }
    }
  }
}

// Orders API
export const ordersAPI = {
  // Get all orders (filtered by user role)
  getOrders: async () => {
    try {
      const response = await api.get('/orders')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch orders' }
    }
  },

  // Create new order
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create order' }
    }
  },

  // Get order by ID
  getOrder: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch order' }
    }
  },

  // Accept order (delivery students only)
  acceptOrder: async (orderId) => {
    try {
      const response = await api.put(`/orders/${orderId}/accept`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to accept order' }
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status, location = null, otp = null) => {
    try {
      const updateData = { status }
      if (location) {
        updateData.location = location
      }
      if (otp) {
        updateData.otp = otp
      }
      console.log('API updateOrderStatus:', { orderId, updateData })
      const response = await api.put(`/orders/${orderId}/status`, updateData)
      return response.data
    } catch (error) {
      console.error('API updateOrderStatus error:', error.response?.data)
      throw error.response?.data || { message: 'Failed to update order status' }
    }
  },

  // Cancel order
  cancelOrder: async (orderId, reason = '') => {
    try {
      const response = await api.put(`/orders/${orderId}/cancel`, { reason })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to cancel order' }
    }
  },

  // Rate order
  rateOrder: async (orderId, rating, review = '') => {
    try {
      const response = await api.put(`/orders/${orderId}/rate`, { rating, review })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to rate order' }
    }
  },

  // Get order timeline
  getOrderTimeline: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}/timeline`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch order timeline' }
    }
  }
}

// Messages API
export const messagesAPI = {
  // Get messages for an order
  getMessages: async (orderId) => {
    try {
      const response = await api.get(`/messages/${orderId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch messages' }
    }
  },

  // Send message
  sendMessage: async (orderId, content, type = 'text') => {
    try {
      const response = await api.post(`/messages/${orderId}`, { content, type })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to send message' }
    }
  },

  // Get conversations list
  getConversations: async () => {
    try {
      const response = await api.get('/messages/conversations')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch conversations' }
    }
  },

  // Get unread message count
  getUnreadCount: async () => {
    try {
      const response = await api.get('/messages/unread-count')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch unread count' }
    }
  },

  // Mark message as read
  markAsRead: async (messageId) => {
    try {
      const response = await api.put(`/messages/${messageId}/read`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to mark message as read' }
    }
  }
}

// Analytics API
export const analyticsAPI = {
  // Get leaderboard
  getLeaderboard: async () => {
    try {
      const response = await api.get('/analytics/leaderboard')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch leaderboard' }
    }
  },

  // Get system stats (admin only)
  getStats: async () => {
    try {
      const response = await api.get('/analytics/stats')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch stats' }
    }
  },

  // Get user earnings
  getEarnings: async (userId) => {
    try {
      const response = await api.get(`/analytics/earnings/${userId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch earnings' }
    }
  },

  // Get trending data
  getTrending: async () => {
    try {
      const response = await api.get('/analytics/trending')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch trending data' }
    }
  }
}

// File Upload API
export const uploadAPI = {
  // Upload avatar
  uploadAvatar: async (file) => {
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      
      const response = await api.post('/uploads/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to upload avatar' }
    }
  },

  // Upload attachment
  uploadAttachment: async (file) => {
    try {
      const formData = new FormData()
      formData.append('attachment', file)
      
      const response = await api.post('/uploads/attachment', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      // Backend returns array of attachments, we want the first one
      if (response.data.success && response.data.data.attachments && response.data.data.attachments.length > 0) {
        return {
          success: true,
          data: response.data.data.attachments[0]
        }
      }
      
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to upload attachment' }
    }
  }
}

export default api