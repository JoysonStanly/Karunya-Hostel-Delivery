import React, { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import Button from '../components/Button'

export default function AdminPanel(){
  const { reports, users } = useContext(AuthContext)

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-4">
          <h1 className="text-2xl font-semibold mb-4">Admin Panel</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div>
              <h2 className="text-lg font-medium mb-3">Reports ({reports.length})</h2>
              {reports.length === 0 ? (
                <p className="text-gray-500">No reports submitted.</p>
              ) : (
                <div className="space-y-3">
                  {reports.map(report=>{
                    const reporter = users.find(u=> u.id === report.reportedBy)
                    return (
                      <Card key={report.id}>
                        <div className="font-semibold">{report.reason}</div>
                        <div className="text-sm text-gray-600 mb-2">{report.message}</div>
                        <div className="text-xs text-gray-500 mb-2">
                          By: {reporter?.name || 'Unknown'} | {new Date(report.createdAt).toLocaleString()}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="secondary">Mark Solved</Button>
                          <Button variant="ghost">Warning</Button>
                          <Button variant="ghost" className="text-red-600">Block User</Button>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-medium mb-3">System Stats (Mock)</h2>
              <Card>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-indigo-600">23</div>
                    <div className="text-sm text-gray-600">Total Users</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">89</div>
                    <div className="text-sm text-gray-600">Completed Orders</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">5</div>
                    <div className="text-sm text-gray-600">Pending Orders</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">2</div>
                    <div className="text-sm text-gray-600">Open Reports</div>
                  </div>
                </div>
              </Card>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  )
}