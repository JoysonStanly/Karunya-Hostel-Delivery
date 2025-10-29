import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Register(){
  const navigate = useNavigate()
  
  useEffect(() => {
    // Redirect to login page which now handles both login and register
    navigate('/login')
  }, [navigate])

  return null
}