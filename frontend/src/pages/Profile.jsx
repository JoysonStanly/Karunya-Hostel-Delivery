import React, { useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import InputField from '../components/InputField'
import Button from '../components/Button'

export default function Profile(){
  const { user, setUser } = useContext(AuthContext)
  const [name, setName] = useState(user.name)
  const [room, setRoom] = useState(user.room)
  const [phone, setPhone] = useState(user.phone)
  const [saved, setSaved] = useState(false)

  function save(e){
    e.preventDefault()
    setUser({ ...user, name, room, phone })
    setSaved(true)
    setTimeout(()=> setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex pb-16 md:pb-0">
        <div className="hidden md:block"><Sidebar /></div>
        <div className="flex-1 p-4 md:p-6">
          <h1 className="text-2xl font-semibold mb-4">Profile</h1>
          
          {saved && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-xl max-w-md">Profile updated!</div>
          )}
          
          <div className="max-w-md">
            <form onSubmit={save} className="space-y-4 card p-5">
              <InputField label="Name" value={name} onChange={e=> setName(e.target.value)} />
              <InputField label="Email" value={user.email} disabled className="bg-gray-100" />
              <InputField label="Role" value={user.role} disabled className="bg-gray-100" />
              <InputField label="Room No." value={room} onChange={e=> setRoom(e.target.value)} />
              <InputField label="Phone" value={phone} onChange={e=> setPhone(e.target.value)} />
              <div className="pt-2">
                <Button type="submit" size="lg">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}