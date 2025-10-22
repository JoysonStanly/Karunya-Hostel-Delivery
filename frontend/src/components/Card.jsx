import React from 'react'
import clsx from 'clsx'

export default function Card({ children, className='', header, action }){
  return (
    <div className={clsx('card overflow-hidden group transition-transform hover:shadow-lg hover:-translate-y-0.5', className)}>
      {header && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold">{header}</div>
            {action}
          </div>
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}
