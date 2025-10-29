import React from 'react'

export default function Avatar({ name = '', size = 36 }){
  const initials = name.split(' ').map(n=> n[0]).join('').slice(0,2).toUpperCase()
  
  // Handle both numeric and string sizes
  const getSize = () => {
    if (typeof size === 'number') return size
    switch(size) {
      case 'sm': return 32
      case 'md': return 40
      case 'lg': return 48
      case 'xl': return 56
      case '2xl': return 64
      default: return 36
    }
  }
  
  const avatarSize = getSize()
  const fontSize = avatarSize < 40 ? 'text-xs' : avatarSize < 50 ? 'text-sm' : 'text-base'
  
  return (
    <div
      className={`rounded-full bg-blue-600/10 text-blue-700 grid place-items-center border border-blue-600/20 ${fontSize}`}
      style={{ width: avatarSize, height: avatarSize }}
      aria-label={`Avatar for ${name}`}
    >
      <span className="font-semibold">{initials}</span>
    </div>
  )
}
