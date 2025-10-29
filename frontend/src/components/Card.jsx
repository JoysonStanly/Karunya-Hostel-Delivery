import React from 'react'
import clsx from 'clsx'

export default function Card({ children, className='', header, action }){
  return (
    <div className={clsx('card overflow-hidden group transition-transform hover:shadow-lg dark:hover:shadow-slate-900/50 hover:-translate-y-0.5 border-2 border-gray-200 dark:border-slate-800', className)}>
      {header && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white px-4 py-3 border-b-2 border-gray-300 dark:border-slate-700">
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
