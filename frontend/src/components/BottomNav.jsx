import React, { useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Home, PlusSquare, Trophy, User, Flag, LayoutDashboard } from 'lucide-react'

export default function BottomNav(){
  const { user } = useContext(AuthContext)
  const location = useLocation()
  if(!user) return null

  const common = [
    { to: '/profile', label: 'Profile', icon: User },
  ]

  const customer = [
    { to: '/customer', label: 'Home', icon: Home },
    { to: '/create-request', label: 'Create', icon: PlusSquare },
    { to: '/leaderboard', label: 'Top', icon: Trophy },
  ]
  const delivery = [
    { to: '/delivery', label: 'Home', icon: Home },
    { to: '/leaderboard', label: 'Top', icon: Trophy },
    { to: '/report', label: 'Report', icon: Flag },
  ]
  const admin = [
    { to: '/admin', label: 'Admin', icon: LayoutDashboard },
    { to: '/report', label: 'Report', icon: Flag },
  ]

  let menu = []
  if(user.role === 'customer') menu = [...customer, ...common]
  if(user.role === 'delivery') menu = [...delivery, ...common]
  if(user.role === 'admin') menu = [...admin, ...common]

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur border-t border-gray-200 z-40">
      <nav className="max-w-3xl mx-auto grid grid-cols-4">
        {menu.slice(0,4).map(item=>{
          const active = location.pathname === item.to
          const Icon = item.icon
          return (
            <Link key={item.to} to={item.to} className="flex flex-col items-center justify-center py-2 gap-1">
              <Icon size={20} className={active ? 'text-blue-600' : 'text-gray-500'} />
              <span className={`text-xs ${active ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
