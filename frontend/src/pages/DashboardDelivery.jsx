import React, { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import Button from '../components/Button'

export default function DashboardDelivery(){
  const { user, orders, users, acceptOrder, completeOrder } = useContext(AuthContext)
  const availableOrders = orders.filter(o=> o.status === 'pending')
  const acceptedOrders = orders.filter(o=> o.assignedTo === user.id && o.status === 'accepted')

  function accept(id){
    acceptOrder(id, user.id)
  }

  function complete(id){
    completeOrder(id)
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex pb-16 md:pb-0">
        <div className="hidden md:block"><Sidebar /></div>
        <div className="flex-1 p-4 md:p-6">
          <h1 className="text-2xl font-semibold mb-4">Delivery Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div>
              <h2 className="text-lg font-medium mb-3">Available Orders</h2>
              {availableOrders.length === 0 ? (
                <div className="card p-6 text-gray-500">No available orders right now.</div>
              ) : (
                <div className="space-y-3">
                  {availableOrders.map(order=>{
                    const customer = users.find(u=> u.id === order.customerId)
                    return (
                      <Card key={order.id}>
                        <div className="font-semibold">{order.title}</div>
                        <div className="text-sm text-gray-600">{order.from} → Room {order.room}</div>
                        <div className="text-xs text-gray-500">Customer: {customer?.name || 'Unknown'}</div>
                        <div className="mt-3">
                          <Button onClick={()=> accept(order.id)} size="md">Accept</Button>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-medium mb-3">My Deliveries</h2>
              {acceptedOrders.length === 0 ? (
                <div className="card p-6 text-gray-500">No active deliveries.</div>
              ) : (
                <div className="space-y-3">
                  {acceptedOrders.map(order=>{
                    const customer = users.find(u=> u.id === order.customerId)
                    return (
                      <Card key={order.id}>
                        <div className="font-semibold">{order.title}</div>
                        <div className="text-sm text-gray-600">{order.from} → Room {order.room}</div>
                        <div className="text-xs text-gray-500">Customer: {customer?.name || 'Unknown'}</div>
                        <div className="mt-3">
                          <Button onClick={()=> complete(order.id)} size="md">Mark Delivered</Button>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          
          </div>
        </div>
      </div>
    </div>
  )
}