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
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
          <AppRouter />
          <BottomNav />
          <Toaster 
            position="top-center"
            reverseOrder={false}
            gutter={8}
            containerStyle={{
              top: 20,
            }}
            toastOptions={{
              // Default duration: 5 seconds
              duration: 3000,
              
              // Custom close button
              className: '',
              
              // Styling for all toasts
              style: {
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                color: '#1f2937',
                padding: '16px 20px',
                paddingRight: '40px',
                borderRadius: '12px',
                border: '1px solid rgba(229, 231, 235, 0.8)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                maxWidth: '600px',
                minWidth: '350px',
                fontSize: '14px',
                fontWeight: '500',
              },
              
              // Success toast styling
              success: {
                duration: 3000,
                style: {
                  background: 'rgba(240, 253, 244, 0.95)',
                  backdropFilter: 'blur(10px)',
                  color: '#065f46',
                  border: '1px solid rgba(134, 239, 172, 0.5)',
                  boxShadow: '0 10px 25px -5px rgba(34, 197, 94, 0.15), 0 8px 10px -6px rgba(34, 197, 94, 0.1)',
                },
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#f0fdf4',
                },
              },
              
              // Error toast styling
              error: {
                duration: 3000,
                style: {
                  background: 'rgba(254, 242, 242, 0.95)',
                  backdropFilter: 'blur(10px)',
                  color: '#991b1b',
                  border: '1px solid rgba(252, 165, 165, 0.5)',
                  boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.15), 0 8px 10px -6px rgba(239, 68, 68, 0.1)',
                },
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fef2f2',
                },
              },
              
              // Loading toast styling
              loading: {
                duration: Infinity,
                style: {
                  background: 'rgba(239, 246, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  color: '#1e40af',
                  border: '1px solid rgba(147, 197, 253, 0.5)',
                  boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.15), 0 8px 10px -6px rgba(59, 130, 246, 0.1)',
                },
                iconTheme: {
                  primary: '#3b82f6',
                  secondary: '#eff6ff',
                },
              },
            }}
          />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
