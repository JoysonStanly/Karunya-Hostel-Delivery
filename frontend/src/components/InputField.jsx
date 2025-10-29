import React from 'react'

export default function InputField({ label, type='text', leftIcon, className='', placeholder, ...props }){
  return (
    <label className="block text-sm">
      {label && <div className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{label}</div>}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-3 flex items-center text-gray-400 dark:text-gray-500">{leftIcon}</div>
        )}
        <input 
          type={type} 
          placeholder={placeholder}
          className={`input ${leftIcon ? 'pl-9' : ''} ${className} border-2 border-gray-300 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 py-3 hover:border-gray-400 dark:hover:border-slate-600 transition-colors`} 
          {...props} 
        />
      </div>
    </label>
  )
}
