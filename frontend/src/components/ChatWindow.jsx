import React, { useState, useContext, useRef, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext'
import MessageBubble from './MessageBubble'
import { Send, Image, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { uploadAPI } from '../services/api'

export default function ChatWindow({ orderId }) {
  const { user, getMessages, addMessage, canAccessChat, orders, fetchMessages } = useContext(AuthContext)
  const [newMessage, setNewMessage] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  const messages = getMessages(orderId)
  const order = orders.find(o => o._id === orderId || o.id === orderId)
  
  // Determine the other user (customer or delivery person)
  let otherUser = null
  if (order) {
    const isCustomer = order.customer?._id === user?._id || order.customer === user?._id
    if (isCustomer && order.assignedTo) {
      // Current user is customer, show delivery person
      otherUser = typeof order.assignedTo === 'object' ? order.assignedTo : null
    } else if (!isCustomer && order.customer) {
      // Current user is delivery person, show customer
      otherUser = typeof order.customer === 'object' ? order.customer : null
    }
  }

  // Fetch messages when component mounts
  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true)
      await fetchMessages(orderId)
      setLoading(false)
    }
    loadMessages()
  }, [orderId])

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Check access permission
  if (!canAccessChat(orderId, user?._id)) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        You don't have permission to access this chat.
      </div>
    )
  }

  if (!order || !order.assignedTo) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
        Chat will be available once the order is assigned to a delivery person.
      </div>
    )
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedImage) return

    try {
      if (selectedImage) {
        // Upload image first
        setUploading(true)
        try {
          const uploadResult = await uploadAPI.uploadAttachment(selectedImage)
          if (uploadResult.success) {
            // Send image message with the uploaded image URL as content
            // Backend expects content field to be present (1-1000 chars)
            await addMessage(orderId, uploadResult.data.url || uploadResult.data.path || 'Image', 'image')
            setSelectedImage(null)
            setImagePreview(null)
            if (fileInputRef.current) {
              fileInputRef.current.value = ''
            }
            toast.success('Image sent!')
          }
        } catch (error) {
          console.error('Image upload error:', error)
          toast.error(error.message || 'Failed to upload image')
        } finally {
          setUploading(false)
        }
      }

      if (newMessage.trim()) {
        // Send text message
        await addMessage(orderId, newMessage.trim(), 'text')
        setNewMessage('')
      }
    } catch (error) {
      console.error('Send message error:', error)
      toast.error('Failed to send message')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }

      setSelectedImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const removeImagePreview = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-sm">
      {/* Chat Header */}
      <div className="bg-gray-50 dark:bg-slate-800 px-4 py-3 border-b border-gray-200 dark:border-slate-700 rounded-t-lg">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-500 dark:bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
            {otherUser?.name.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="ml-3">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">{otherUser?.name || 'Unknown User'}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{otherUser?.role || 'User'}</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="h-96 overflow-y-auto p-4 bg-gray-50 dark:bg-slate-950">
        {loading ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message._id || message.id}
                message={message}
                isOwnMessage={message.sender === user?._id || message.senderId === user?._id || message.sender?._id === user?._id}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="border-t border-gray-200 dark:border-slate-700 p-4 bg-gray-50 dark:bg-slate-800">
          <div className="relative inline-block">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="h-20 w-20 object-cover rounded border dark:border-slate-700"
            />
            <button
              onClick={removeImagePreview}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
            >
              <X size={12} />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">Ready to send image</p>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-b-lg">
        <div className="flex items-end space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            title="Attach image"
          >
            <Image size={20} />
          </button>

          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              rows="1"
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() && !selectedImage || uploading}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}