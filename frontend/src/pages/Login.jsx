import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import InputField from '../components/InputField'
import Button from '../components/Button'
import Navbar from '../components/Navbar'

export default function Login(){
  const [email, setEmail] = useState('alice@example.com')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('customer')
  const [error, setError] = useState(null)
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  function submit(e){
    e.preventDefault()
    const res = login(email, password, role)
    if(res.ok){
      if(role === 'customer') navigate('/customer')
      else if(role === 'delivery') navigate('/delivery')
      else navigate('/')
    } else setError(res.error)
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-md mx-auto p-4 mt-12">
        <h2 className="text-2xl font-semibold mb-4">Login</h2>
        <form onSubmit={submit} className="space-y-3 bg-white p-4 rounded shadow">
          <InputField label="Email" value={email} onChange={e=> setEmail(e.target.value)} />
          <InputField label="Password" type="password" value={password} onChange={e=> setPassword(e.target.value)} />
          <div>
            <label className="text-sm block mb-1">Role</label>
            <select value={role} onChange={e=> setRole(e.target.value)} className="w-full px-3 py-2 border rounded">
              <option value="customer">Customer</option>
              <option value="delivery">Delivery</option>
            </select>
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="pt-2">
            <Button type="submit">Login</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
