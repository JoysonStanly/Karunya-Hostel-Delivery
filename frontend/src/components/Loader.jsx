import React from 'react'

export default function Loader({ size=8 }){
  return (
    <div className="flex items-center justify-center">
      <div className={`w-${size} h-${size} border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin`} />
    </div>
  )
}
