import React, { useContext } from 'react'
import { useParams, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'

export default function OrderTracking(){
  const { id } = useParams()
  const { orders, users } = useContext(AuthContext)
  const order = orders.find(o=> o.id === id)

  if(!order) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-4">
          <h1 className="text-2xl font-semibold mb-4">Order not found</h1>
          <Link to="/customer" className="text-indigo-600">← Back to Dashboard</Link>
        </div>
      </div>
    </div>
  )

  const customer = users.find(u=> u.id === order.customerId)
  const deliveryUser = order.assignedTo ? users.find(u=> u.id === order.assignedTo) : null

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex pb-16 md:pb-0">
        <div className="hidden md:block"><Sidebar /></div>
        <div className="flex-1 p-4 md:p-6">
          <h1 className="text-2xl font-semibold mb-4">Order Tracking</h1>
          
          <Card className="max-w-lg mb-4">
            <div className="font-semibold mb-2">{order.title}</div>
            <div className="text-sm text-gray-600 mb-2">{order.from} → Room {order.room}</div>
            <div className="text-xs text-gray-500 mb-3">Created: {new Date(order.createdAt).toLocaleString()}</div>
            
            <div className="mb-3">
              <div className="text-sm font-medium">Status</div>
              <div className={`inline-block px-2 py-1 rounded-full text-xs ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : order.status === 'accepted' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                {order.status}
              </div>
            </div>
            
            {customer && (
              <div className="mb-2">
                <div className="text-sm font-medium">Customer</div>
                <div className="text-sm text-gray-600">{customer.name} - Room {customer.room}</div>
              </div>
            )}
            
            {deliveryUser && (
              <div className="mb-2">
                <div className="text-sm font-medium">Delivery Student</div>
                <div className="text-sm text-gray-600">{deliveryUser.name} - Room {deliveryUser.room}</div>
              </div>
            )}
          </Card>

          <div className="mb-4">
            <h3 className="font-medium mb-2">Timeline (Static)</h3>
            <div className="space-y-2">
              <div className="flex gap-3 items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Order created</span>
              </div>
              {order.status !== 'pending' && (
                <div className="flex gap-3 items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Accepted by delivery student</span>
                </div>
              )}
              {order.status === 'delivered' && (
                <div className="flex gap-3 items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Delivered successfully</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}