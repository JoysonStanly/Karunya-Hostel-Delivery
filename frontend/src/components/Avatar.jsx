import React from 'react'

export default function Avatar({ name = '', size = 36 }){
  const initials = name.split(' ').map(n=> n[0]).join('').slice(0,2).toUpperCase()
  return (
    <div
      className="rounded-full bg-blue-600/10 text-blue-700 grid place-items-center border border-blue-600/20"
      style={{ width: size, height: size }}
      aria-label={`Avatar for ${name}`}
    >
      <span className="text-xs font-semibold">{initials}</span>
    </div>
  )
}
