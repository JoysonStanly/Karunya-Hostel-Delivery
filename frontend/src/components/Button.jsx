import React from 'react'
import clsx from 'clsx'

export default function Button({ children, variant='primary', size='md', className='', ...props }){
  const base = 'btn select-none focus:ring-primary/30 active:scale-[.98] transition-all'
  const variants = {
    primary: 'bg-primary text-white hover:bg-blue-700 shadow-sm',
    secondary: 'bg-secondary text-gray-900 hover:brightness-95',
    outline: 'bg-transparent border border-gray-200 text-gray-900 hover:bg-gray-50',
    ghost: 'bg-transparent text-primary hover:bg-blue-50'
  }
  const sizes = {
    sm: 'px-3 py-1.5',
    md: 'px-4 py-2',
    lg: 'px-5 py-3 text-base'
  }
  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  )
}
