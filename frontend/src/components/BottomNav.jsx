import React, { useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Home, PlusSquare, Trophy, User, LayoutDashboard } from 'lucide-react'

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
  ]
  const admin = [
    { to: '/admin', label: 'Admin', icon: LayoutDashboard },
  ]

  let menu = []
  if(user.role === 'customer') menu = [...customer, ...common]
  if(user.role === 'delivery') menu = [...delivery, ...common]
  if(user.role === 'admin') menu = [...admin, ...common]

  const displayMenu = menu.slice(0, 4)
  const gridCols = displayMenu.length === 3 ? 'grid-cols-3' : 'grid-cols-4'

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-t border-gray-200 dark:border-slate-800 z-40">
      <nav className={`max-w-3xl mx-auto grid ${gridCols}`}>
        {displayMenu.map(item=>{
          const active = location.pathname === item.to
          const Icon = item.icon
          return (
            <Link key={item.to} to={item.to} className="flex flex-col items-center justify-center py-3 gap-1 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/50">
              <Icon size={22} className={active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'} />
              <span className={`text-xs ${active ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
