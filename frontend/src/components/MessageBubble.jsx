import React from 'react'

function formatTime(timestamp) {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return ''
  }
  
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function MessageBubble({ message, isOwnMessage }) {
  // Get sender name from message object if available
  const senderName = message.sender?.name || message.senderName || 'Unknown'
  
  // Get timestamp from message - it could be 'timestamp', 'createdAt', or 'sentAt'
  const messageTime = message.timestamp || message.createdAt || message.sentAt

  return (
    <div className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isOwnMessage 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-200 text-gray-800'
      }`}>
        {!isOwnMessage && (
          <div className="mb-1 text-xs font-medium opacity-70">
            {senderName}
          </div>
        )}
        
        {message.type === 'text' && (
          <div className="text-sm">{message.content}</div>
        )}
        
        {message.type === 'image' && (
          <div>
            <img 
              src={message.content} 
              alt="Shared image" 
              className="h-auto max-w-full mb-1 rounded"
              style={{ maxHeight: '200px' }}
            />
          </div>
        )}
        
        <div className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
          {formatTime(messageTime)}
        </div>
      </div>
    </div>
  )
}