import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import Button from '../components/Button'

export default function DashboardCustomer(){
  const { user, orders } = useContext(AuthContext)
  const myOrders = orders.filter(o=> o.customerId === user.id)

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex pb-16 md:pb-0">
        <div className="hidden md:block"><Sidebar /></div>
        <div className="flex-1 p-4 md:p-6">
          <h1 className="text-2xl font-semibold mb-4">Customer Dashboard</h1>
          <div className="mb-6">
            <Link to="/create-request">
              <Button size="lg">Create Order</Button>
            </Link>
          </div>
          <div className="grid gap-4">
            {myOrders.length === 0 ? (
              <div className="card p-10 text-center">
                <div className="text-lg font-medium mb-1">No orders yet</div>
                <p className="text-gray-500">Create your first request to get started.</p>
              </div>
            ) : (
              myOrders.map(order=> (
                <Card key={order.id}>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{order.title}</div>
                      <div className="text-sm text-gray-600">{order.from} → Room {order.room}</div>
                      <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className={`px-2 py-1 rounded-full text-xs inline-block ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : order.status === 'accepted' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                        {order.status}
                      </div>
                      <Link to={`/order/${order.id}`} className="text-indigo-600 text-xs">View</Link>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}