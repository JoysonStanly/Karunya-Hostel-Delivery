import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import AppRouter from './router/AppRouter'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'
import BottomNav from './components/BottomNav'

export default function App(){
  return (
    <AuthProvider>
      <BrowserRouter>
  <AppRouter />
  <BottomNav />
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  )
}
