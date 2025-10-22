import React from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import Navbar from '../components/Navbar'
import { Package2 } from 'lucide-react'

export default function Landing(){
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50/40">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md card p-8 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 text-white grid place-items-center shadow">
            <Package2 size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Karunya Hostel Delivery</h1>
          <p className="text-sm text-gray-500 mb-8">Login or create an account to continue</p>
          <div className="grid gap-3">
            <Link to="/login"><Button size="lg">Login</Button></Link>
            <Link to="/register"><Button variant="outline" size="lg">Create account</Button></Link>
          </div>
        </div>
      </div>
    </div>
  )
}
