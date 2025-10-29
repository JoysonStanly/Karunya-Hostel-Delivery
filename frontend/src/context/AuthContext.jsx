import React, { createContext, useState, useEffect } from 'react'
import { authAPI, ordersAPI, messagesAPI, connectSocket, disconnectSocket, getSocket } from '../services/api'
import toast from 'react-hot-toast'

export const AuthContext = createContext()

export function AuthProvider({ children }){
  const [user, setUser] = useState(()=> {
    const storedUser = localStorage.getItem('khd_user')
    if (!storedUser || storedUser === 'undefined' || storedUser === 'null') {
      return null
    }
    try {
      return JSON.parse(storedUser)
    } catch (error) {
      console.error('Error parsing user from localStorage:', error)
      localStorage.removeItem('khd_user')
      return null
    }
  })
  const [orders, setOrders] = useState([])
  const [messages, setMessages] = useState({})
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('khd_token')
      const storedUserData = localStorage.getItem('khd_user')
      
      let storedUser = null
      if (storedUserData && storedUserData !== 'undefined' && storedUserData !== 'null') {
        try {
          storedUser = JSON.parse(storedUserData)
        } catch (error) {
          console.error('Error parsing stored user data:', error)
          localStorage.removeItem('khd_user')
        }
      }
      
      if (token && storedUser) {
        // Set user immediately from localStorage for faster load
        setUser(storedUser)
        // Set initializing to false immediately so UI doesn't redirect
        setInitializing(false)
        
        try {
          // Verify token is still valid by getting current user (in background)
          const response = await authAPI.getCurrentUser()
          if (response.success) {
            // Backend returns 'data' field, not 'user'
            const userData = response.data || response.user
            if (userData) {
              setUser(userData)
              // Update stored user data in case it changed
              localStorage.setItem('khd_user', JSON.stringify(userData))
            }
          } else {
            // Token is invalid, clear everything
            localStorage.removeItem('khd_token')
            localStorage.removeItem('khd_user')
            setUser(null)
          }
        } catch (error) {
          // Network error or backend down - keep user logged in from localStorage
          console.log('Could not verify token (backend may be down), using cached user data:', error.message)
          // Only clear if it's a 401 (unauthorized) error
          if (error.status === 401 || error.message?.includes('401')) {
            localStorage.removeItem('khd_token')
            localStorage.removeItem('khd_user')
            setUser(null)
          }
          // For other errors (network, 500, etc.), keep the user logged in
        }
      } else {
        setUser(null)
        setInitializing(false)
      }
    }

    initializeAuth()
  }, [])

  // Connect socket when user is logged in
  useEffect(() => {
    if (user) {
      connectSocket()
      fetchOrders()
    } else {
      disconnectSocket()
    }
  }, [user])

  // Socket event listeners
  useEffect(() => {
    const socket = getSocket()
    if (socket) {
      // Listen for new messages
      socket.on('newMessage', (message) => {
        setMessages(prev => ({
          ...prev,
          [message.orderId]: [...(prev[message.orderId] || []), message]
        }))
      })

      // Listen for order updates
      socket.on('orderStatusUpdate', (orderUpdate) => {
        setOrders(prev => prev.map(order => 
          order._id === orderUpdate.orderId 
            ? { ...order, ...orderUpdate.data }
            : order
        ))
        toast.success(`Order status updated: ${orderUpdate.data.status}`)
      })

      // Listen for new orders (for delivery students)
      socket.on('newOrder', (order) => {
        if (user?.role === 'delivery') {
          setOrders(prev => [order, ...prev])
          toast.success('New order available!')
        }
      })

      return () => {
        socket.off('newMessage')
        socket.off('orderStatusUpdate')
        socket.off('newOrder')
      }
    }
  }, [user])

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getOrders()
      if (response.success) {
        setOrders(response.data || response.orders || [])
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    }
  }

  // Login function
  async function login(email, password, role){
    setLoading(true)
    try {
      const response = await authAPI.login(email, password, role)
      if (response.success) {
        setUser(response.user)
        toast.success('Login successful!')
        return { ok: true }
      }
      return { ok: false, error: response.message }
    } catch (error) {
      const errorMessage = error.message || 'Login failed'
      toast.error(errorMessage)
      return { ok: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  async function logout(){
    setLoading(true)
    try {
      await authAPI.logout()
      setUser(null)
      setOrders([])
      setMessages({})
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Register function
  async function register(userData){
    setLoading(true)
    try {
      const response = await authAPI.register(userData)
      if (response.success) {
        setUser(response.user)
        toast.success('Registration successful!')
        return { ok: true }
      }
      return { ok: false, error: response.message }
    } catch (error) {
      const errorMessage = error.message || 'Registration failed'
      toast.error(errorMessage)
      return { ok: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Create order function
  async function createOrder(orderData){
    setLoading(true)
    try {
      const response = await ordersAPI.createOrder(orderData)
      if (response.success) {
        await fetchOrders() // Refresh orders list
        toast.success('Order created successfully!')
        return response.order
      }
      throw new Error(response.message)
    } catch (error) {
      const errorMessage = error.message || 'Failed to create order'
      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Accept order function
  async function acceptOrder(orderId){
    setLoading(true)
    try {
      const response = await ordersAPI.acceptOrder(orderId)
      if (response.success) {
        await fetchOrders() // Refresh orders list
        toast.success('Order accepted successfully!')
        return response.order
      }
      throw new Error(response.message)
    } catch (error) {
      const errorMessage = error.message || 'Failed to accept order'
      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Complete order function
  async function completeOrder(orderId, otp){
    setLoading(true)
    try {
      console.log('CompleteOrder called with:', { orderId, otp: otp ? '****' : 'null' })
      const response = await ordersAPI.updateOrderStatus(orderId, 'delivered', null, otp)
      console.log('Complete order response:', response)
      if (response.success) {
        await fetchOrders() // Refresh orders list
        toast.success('Order marked as delivered!')
        return response.order
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('Complete order error:', error)
      const errorMessage = error.message || error.data?.message || 'Failed to complete order'
      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Add message function
  async function addMessage(orderId, content, type = 'text'){
    try {
      const response = await messagesAPI.sendMessage(orderId, content, type)
      if (response.success) {
        // Socket will handle real-time update, but also update local state
        const newMessage = response.data || response.message
        setMessages(prev => ({
          ...prev,
          [orderId]: [...(prev[orderId] || []), newMessage]
        }))
        return newMessage
      }
      throw new Error(response.message)
    } catch (error) {
      const errorMessage = error.message || 'Failed to send message'
      toast.error(errorMessage)
      throw error
    }
  }

  // Get messages function
  function getMessages(orderId){
    return messages[orderId] || []
  }

  // Fetch messages for an order
  async function fetchMessages(orderId){
    try {
      const response = await messagesAPI.getMessages(orderId)
      if (response.success) {
        setMessages(prev => ({
          ...prev,
          [orderId]: response.data || response.messages || []
        }))
        return response.data || response.messages || []
      }
      return []
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      return []
    }
  }

  // Check if user can access chat
  function canAccessChat(orderId, userId){
    const order = orders.find(o => o._id === orderId || o.id === orderId)
    if (!order) return false
    
    // Customer can access if they created the order
    if (order.customer && (order.customer._id === userId || order.customer === userId)) return true
    
    // Delivery student can access if assigned to order
    if (order.assignedTo && (order.assignedTo._id === userId || order.assignedTo === userId)) return true
    
    // Admin can access all chats
    if (user?.role === 'admin') return true
    
    return false
  }

  return (
    <AuthContext.Provider value={{ 
      user, orders, messages, loading, initializing,
      login, logout, register, createOrder, acceptOrder, completeOrder, 
      setUser, addMessage, getMessages, fetchMessages, canAccessChat,
      fetchOrders
    }}>
      {children}
    </AuthContext.Provider>
  )
}
