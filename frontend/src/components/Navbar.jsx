import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { ThemeContext } from '../context/ThemeContext'
import Modal from './Modal'
import { Package2, Moon, Sun } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useContext(AuthContext)
  const { theme, toggleTheme } = useContext(ThemeContext)
  const [open, setOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleLogout = () => {
    logout()
    setShowLogoutModal(false)
  }

  return (
    <div className="sticky top-0 z-40 border-b-2 border-gray-300 shadow-sm dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
      {/* Removed max-w-6xl and mx-auto so it stretches full width */}
      <div className="flex items-center justify-between w-full px-4 py-3">
        {/* Logo and name aligned left */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
          <div className="grid text-white shadow h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-500 place-items-center">
            <Package2 size={20} />
          </div>
          <span className="hidden md:inline">Karunya Hostel Delivery</span>
        </Link>

        {/* Right side buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-700 transition-colors bg-gray-100 rounded-lg dark:bg-slate-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="px-4 py-2 text-sm font-medium text-white transition-colors bg-red-600 rounded-xl hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-700 transition-colors bg-gray-100 rounded-lg dark:bg-slate-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <Link to="/login" className="btn ghost">Login</Link>
              <Link to="/register" className="btn outline">Register</Link>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal open={showLogoutModal} onClose={() => setShowLogoutModal(false)} title="Confirm Logout">
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">Are you sure you want to logout?</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
