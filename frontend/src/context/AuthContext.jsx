import React, { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext()

const dummyUsers = [
  { id: 1, name: 'Alice', email: 'alice@example.com', role: 'customer', room: 'A101', phone: '9999999999' },
  { id: 2, name: 'Bob', email: 'bob@example.com', role: 'delivery', room: 'B202', phone: '8888888888' },
  { id: 3, name: 'Admin', email: 'admin@khd', role: 'admin', room: '', phone: '' }
]

const sampleOrders = [
  { id: 'ord-1', title: 'Parcel - Books', type: 'parcel', price: 0, from: 'Main Gate', room: 'A101', customerId: 1, status: 'pending', assignedTo: null, createdAt: Date.now() - 1000*60*60 },
  { id: 'ord-2', title: 'Food - Pizza', type: 'food', price: 50, from: 'Canteen', room: 'A101', customerId: 1, status: 'accepted', assignedTo: 2, createdAt: Date.now() - 1000*60*30 },
]

export function AuthProvider({ children }){
  const [user, setUser] = useState(()=> JSON.parse(localStorage.getItem('khd_user')) || null)
  const [users] = useState(dummyUsers)
  const [orders, setOrders] = useState(()=> JSON.parse(localStorage.getItem('khd_orders')) || sampleOrders)
  const [reports, setReports] = useState(()=> JSON.parse(localStorage.getItem('khd_reports')) || [])

  useEffect(()=>{
    localStorage.setItem('khd_user', JSON.stringify(user))
  }, [user])
  useEffect(()=>{
    localStorage.setItem('khd_orders', JSON.stringify(orders))
  }, [orders])
  useEffect(()=>{
    localStorage.setItem('khd_reports', JSON.stringify(reports))
  }, [reports])

  function login(email, password, role){
    const found = users.find(u=> u.email === email && u.role === role)
    if(found){
      setUser(found)
      return { ok: true }
    }
    return { ok: false, error: 'User not found (dummy auth)' }
  }

  function logout(){
    setUser(null)
  }

  function register({ name, email, password, role, room, phone }){
    const id = users.length + Math.floor(Math.random()*1000)
    const newUser = { id, name, email, role, room, phone }
    // in dummy mode we won't persist users list beyond session
    setUser(newUser)
    return { ok: true }
  }

  function createOrder(order){
    const newOrder = { ...order, id: 'ord-' + Date.now(), status: 'pending', assignedTo: null, createdAt: Date.now() }
    setOrders(prev=> [newOrder, ...prev])
    return newOrder
  }

  function acceptOrder(orderId, deliveryUserId){
    setOrders(prev=> prev.map(o=> o.id === orderId ? { ...o, status: 'accepted', assignedTo: deliveryUserId } : o))
  }

  function completeOrder(orderId){
    setOrders(prev=> prev.map(o=> o.id === orderId ? { ...o, status: 'delivered' } : o))
  }

  function submitReport(report){
    const r = { id: 'rep-'+Date.now(), ...report, createdAt: Date.now(), status: 'open' }
    setReports(prev=> [r, ...prev])
    return r
  }

  return (
    <AuthContext.Provider value={{ user, users, orders, reports, login, logout, register, createOrder, acceptOrder, completeOrder, submitReport, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}
