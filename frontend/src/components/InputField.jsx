import React from 'react'

export default function InputField({ label, type='text', leftIcon, className='', ...props }){
  return (
    <label className="block text-sm">
      {label && <div className="text-sm font-medium mb-1 text-gray-800">{label}</div>}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-3 flex items-center text-gray-400">{leftIcon}</div>
        )}
        <input type={type} className={`input ${leftIcon ? 'pl-9' : ''} ${className}`} {...props} />
      </div>
    </label>
  )
}
