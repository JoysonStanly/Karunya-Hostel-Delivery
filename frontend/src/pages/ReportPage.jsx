import React, { useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import InputField from '../components/InputField'
import Button from '../components/Button'
import toast from 'react-hot-toast'

export default function ReportPage(){
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const { user, submitReport } = useContext(AuthContext)

  function submit(e){
    e.preventDefault()
    submitReport({ reason, message, reportedBy: user.id })
    setSubmitted(true)
    toast.success('Report submitted successfully')
    setReason('')
    setMessage('')
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex pb-16 md:pb-0">
        <div className="hidden md:block"><Sidebar /></div>
        <div className="flex-1 p-4 md:p-6">
          <h1 className="text-2xl font-semibold mb-4">Submit Report</h1>
          
          {submitted && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-xl">Report submitted successfully!</div>
          )}
          
          <div className="max-w-md">
            <form onSubmit={submit} className="space-y-4 card p-5">
              <div>
                <label className="text-sm block mb-1">Reason</label>
                <select value={reason} onChange={e=> setReason(e.target.value)} className="input" required>
                  <option value="">Select reason</option>
                  <option value="late-delivery">Late Delivery</option>
                  <option value="damaged-item">Damaged Item</option>
                  <option value="rude-behavior">Rude Behavior</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm block mb-1">Message</label>
                <textarea value={message} onChange={e=> setMessage(e.target.value)} className="input h-24" placeholder="Describe the issue..." required />
              </div>
              <div className="pt-2">
                <Button type="submit" size="lg">Submit Report</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}