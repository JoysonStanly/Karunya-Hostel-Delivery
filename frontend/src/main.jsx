import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { ThemeProvider } from './context/ThemeContext'

// Clean up any corrupted localStorage data
try {
  const storedUser = localStorage.getItem('khd_user')
  const storedToken = localStorage.getItem('khd_token')
  
  // Remove if they contain 'undefined' or 'null' strings
  if (storedUser === 'undefined' || storedUser === 'null') {
    localStorage.removeItem('khd_user')
  }
  if (storedToken === 'undefined' || storedToken === 'null') {
    localStorage.removeItem('khd_token')
  }
  
  // Test parse the user data if it exists
  if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
    try {
      JSON.parse(storedUser)
    } catch (e) {
      console.warn('Corrupted user data in localStorage, cleaning up...')
      localStorage.removeItem('khd_user')
    }
  }
} catch (error) {
  console.error('Error cleaning localStorage:', error)
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
)
