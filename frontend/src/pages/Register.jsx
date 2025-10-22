import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import InputField from '../components/InputField'
import Button from '../components/Button'
import Navbar from '../components/Navbar'

export default function Register(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('customer')
  const [room, setRoom] = useState('')
  const [phone, setPhone] = useState('')
  const { register } = useContext(AuthContext)
  const navigate = useNavigate()

  function submit(e){
    e.preventDefault()
    const res = register({ name, email, password, role, room, phone })
    if(res.ok){
      if(role === 'customer') navigate('/customer')
      else navigate('/delivery')
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-md mx-auto p-4 mt-12">
        <h2 className="text-2xl font-semibold mb-4">Register</h2>
        <form onSubmit={submit} className="space-y-3 bg-white p-4 rounded shadow">
          <InputField label="Name" value={name} onChange={e=> setName(e.target.value)} />
          <InputField label="Email" value={email} onChange={e=> setEmail(e.target.value)} />
          <InputField label="Password" type="password" value={password} onChange={e=> setPassword(e.target.value)} />
          <div>
            <label className="text-sm block mb-1">Role</label>
            <select value={role} onChange={e=> setRole(e.target.value)} className="w-full px-3 py-2 border rounded">
              <option value="customer">Customer</option>
              <option value="delivery">Delivery</option>
            </select>
          </div>
          <InputField label="Room No." value={room} onChange={e=> setRoom(e.target.value)} />
          <InputField label="Phone" value={phone} onChange={e=> setPhone(e.target.value)} />
          <div className="pt-2">
            <Button type="submit">Register</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
