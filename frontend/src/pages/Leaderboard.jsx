import React, { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import Avatar from '../components/Avatar'

export default function Leaderboard(){
  const { orders, users } = useContext(AuthContext)
  
  // Calculate delivery counts for each delivery user
  const deliveryStats = users
    .filter(u=> u.role === 'delivery')
    .map(user=> ({
      ...user,
      deliveryCount: orders.filter(o=> o.assignedTo === user.id && o.status === 'delivered').length
    }))
    .sort((a, b)=> b.deliveryCount - a.deliveryCount)

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex pb-16 md:pb-0">
        <div className="hidden md:block"><Sidebar /></div>
        <div className="flex-1 p-4">
          <h1 className="text-2xl font-semibold mb-4">Leaderboard</h1>
          <p className="text-gray-600 mb-4">Top delivery students by completed orders</p>
          
          <div className="grid gap-3 max-w-lg">
            {deliveryStats.length === 0 ? (
              <p className="text-gray-500">No delivery students found.</p>
            ) : (
              deliveryStats.map((student, index)=> (
                <Card key={student.id}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 grid place-items-center rounded-full text-sm font-bold ${index < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>#{index+1}</div>
                    <Avatar name={student.name} />
                    <div className="flex-1">
                      <div className="font-semibold">{student.name}</div>
                      <div className="text-sm text-gray-600">Room {student.room}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-indigo-600">{student.deliveryCount}</div>
                      <div className="text-xs text-gray-500">deliveries</div>
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