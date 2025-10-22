import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import Modal from './Modal'
import { Bike, Package2 } from 'lucide-react'

export default function Navbar(){
  const { user, logout } = useContext(AuthContext)
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white/90 backdrop-blur border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-500 text-white grid place-items-center shadow">
            <Package2 size={20} />
          </div>
          <span>Karunya Hostel Delivery</span>
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <button onClick={()=> setOpen(true)} className="btn outline px-3 py-1.5 rounded-xl border bg-white hover:bg-gray-50 text-sm">
              {user.name}
            </button>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="btn ghost">Login</Link>
              <Link to="/register" className="btn outline">Register</Link>
            </div>
          )}
        </div>
      </div>
      <Modal open={open} onClose={()=> setOpen(false)} title="Profile">
        {user && (
          <div className="space-y-2">
            <div className="text-sm">{user.name}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
            <div className="pt-2 flex gap-2">
              <Link to="/profile" className="text-primary" onClick={()=> setOpen(false)}>Profile</Link>
              <button className="text-red-600" onClick={()=>{ logout(); setOpen(false) }}>Logout</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
