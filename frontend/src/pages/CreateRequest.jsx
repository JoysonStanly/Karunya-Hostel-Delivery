import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import InputField from '../components/InputField'
import Button from '../components/Button'

export default function CreateRequest(){
  const [title, setTitle] = useState('')
  const [type, setType] = useState('parcel')
  const [price, setPrice] = useState('')
  const [from, setFrom] = useState('')
  const [room, setRoom] = useState('')
  const { user, createOrder } = useContext(AuthContext)
  const navigate = useNavigate()

  function submit(e){
    e.preventDefault()
    createOrder({
      title, 
      type, 
      price: parseFloat(price) || 0, 
      from, 
      room: room || user.room
    })
    navigate('/customer')
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex pb-16 md:pb-0">
        <div className="hidden md:block"><Sidebar /></div>
        <div className="flex-1 p-4 md:p-6">
          <h1 className="text-2xl font-semibold mb-6 text-center">Create Delivery Request</h1>
          <div className="flex justify-center items-start min-h-[calc(100vh-200px)]">
            <div className="w-full max-w-md">
              <form onSubmit={submit} className="space-y-4 card p-6 shadow-lg">
                <InputField label="Title (e.g., Parcel - Books)" value={title} onChange={e=> setTitle(e.target.value)} required />
                <div>
                  <label className="text-sm block mb-1">Type</label>
                  <select value={type} onChange={e=> setType(e.target.value)} className="input">
                    <option value="parcel">Parcel</option>
                    <option value="food">Food</option>
                  </select>
                </div>
                <InputField label="Price (optional)" type="number" value={price} onChange={e=> setPrice(e.target.value)} placeholder="0" />
                <InputField label="Pickup Location" value={from} onChange={e=> setFrom(e.target.value)} placeholder="e.g., Main Gate, Canteen" required />
                <InputField label="Delivery Room" value={room} onChange={e=> setRoom(e.target.value)} placeholder={user.room || 'Room no.'} />
                <div className="pt-2">
                  <Button type="submit" size="lg">Create Request</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}