import React from 'react'
import clsx from 'clsx'

export default function Button({ children, variant='primary', size='md', className='', ...props }){
  const base = 'btn select-none focus:ring-primary/30 active:scale-[.98] transition-all border-2'
  const variants = {
    primary: 'bg-primary text-white hover:bg-blue-700 dark:hover:bg-blue-600 shadow-sm border-blue-600 hover:border-blue-700 dark:border-blue-500 dark:hover:border-blue-600',
    secondary: 'bg-secondary text-gray-900 dark:text-gray-100 hover:brightness-95 border-gray-300 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-600',
    outline: 'bg-transparent dark:bg-transparent border-gray-300 dark:border-slate-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-gray-400 dark:hover:border-slate-600',
    ghost: 'bg-transparent text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 border-transparent hover:border-blue-200 dark:hover:border-blue-800'
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
