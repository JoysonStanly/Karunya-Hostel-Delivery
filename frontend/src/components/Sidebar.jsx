import React, { useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Home, PlusSquare, Trophy, User, LayoutDashboard } from 'lucide-react'

const NavItem = ({ to, label, icon: Icon }) => {
  const location = useLocation()
  const active = location.pathname === to
  return (
    <Link to={to} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition hover:bg-gray-50 dark:hover:bg-slate-800 ${active ? 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  )
}

export default function Sidebar(){
  const { user } = useContext(AuthContext)
  if(!user) return null

  const common = [
    { to: '/profile', label: 'Profile', icon: User },
  ]

  const customer = [
    { to: '/customer', label: 'Dashboard', icon: Home },
    { to: '/create-request', label: 'Create Request', icon: PlusSquare },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ]
  const delivery = [
    { to: '/delivery', label: 'Dashboard', icon: Home },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ]
  const admin = [
    { to: '/admin', label: 'Admin Panel', icon: LayoutDashboard }
  ]

  let menu = []
  if(user.role === 'customer') menu = [...customer, ...common]
  if(user.role === 'delivery') menu = [...delivery, ...common]
  if(user.role === 'admin') menu = [...admin, ...common]

  return (
    <div className="sticky top-0 h-screen p-4 overflow-y-auto bg-white border-r-2 border-gray-300 dark:bg-slate-900 dark:border-slate-800 w-60">

      <nav className="flex flex-col gap-2">
        {menu.map(item => (
          <NavItem key={item.to} to={item.to} label={item.label} icon={item.icon} />
        ))}
      </nav>
      
    </div>
  )
}
