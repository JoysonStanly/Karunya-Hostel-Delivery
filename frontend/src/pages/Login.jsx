import React, { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import InputField from '../components/InputField'
import Button from '../components/Button'

// Hostel data structure
const hostelData = {
  boys: {
    1: ['Father Duraisamy Residence', 'Edward George Residence'],
    2: ['Angelina Residence'],
    3: ['Jerry Manual Residence'],
    4: ['Bethany Residence']
  },
  girls: {
    1: ['Sundararaj Residence'],
    2: ['Sevugapandian Residence', 'Dhakshanmoorthy Residence'],
    3: ['Evangeline Residence'],
    4: ['Ophrah Residence']
  }
}

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('customer')
  const [error, setError] = useState(null)
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [room, setRoom] = useState('')
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState('')
  const [year, setYear] = useState('')
  const [hostel, setHostel] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login, register, loading } = useContext(AuthContext)
  const navigate = useNavigate()

  // Get available hostels based on gender and year
  const getAvailableHostels = () => {
    if (!gender || !year) return []
    return hostelData[gender]?.[year] || []
  }

  // Reset hostel when gender or year changes
  const handleGenderChange = (newGender) => {
    setGender(newGender)
    setHostel('')
  }

  const handleYearChange = (newYear) => {
    setYear(newYear)
    setHostel('')
  }

  async function handleSubmit(e){
    e.preventDefault()
    setError(null)
    
    if (isLogin) {
      try {
        const res = await login(email, password, role)
        if(res.ok){
          // Small delay to ensure state is updated
          setTimeout(() => {
            if(role === 'customer') navigate('/customer')
            else if(role === 'delivery') navigate('/delivery')
            else navigate('/')
          }, 100)
        } else {
          setError(res.error)
        }
      } catch (error) {
        console.error('Login error:', error)
        setError('Login failed. Please try again.')
      }
    } else {
      // Validation for registration
      if (!name.trim()) {
        setError('Please enter your full name')
        return
      }
      if (!email.trim()) {
        setError('Please enter your email')
        return
      }
      if (!password.trim()) {
        setError('Please enter a password')
        return
      }
      
      if (!gender) {
        setError('Please select hostel type (Boys/Girls)')
        return
      }
      if (!year) {
        setError('Please select your academic year')
        return
      }
      if (!hostel) {
        setError('Please select your hostel')
        return
      }
      if (!room.trim()) {
        setError('Please enter your room number')
        return
      }
      if (!phone.trim()) {
        setError('Please enter your phone number')
        return
      }

      try {
        const res = await register({ name, email, password, role, room, phone, gender, year, hostel })
        if(res.ok){
          // Small delay to ensure state is updated
          setTimeout(() => {
            if(role === 'customer') navigate('/customer')
            else if(role === 'delivery') navigate('/delivery')
            else navigate('/')
          }, 100)
        } else {
          setError(res.error)
        }
      } catch (error) {
        console.error('Registration error:', error)
        setError('Registration failed. Please try again.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Mobile-first design */}
      <div className="max-w-sm px-8 py-8 mx-auto mt-8 bg-white border-2 border-gray-400 shadow-lg dark:bg-slate-900 dark:border-slate-700 rounded-2xl">
        
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-600 dark:bg-blue-700 rounded-2xl">
            <span className="text-2xl font-bold text-white">K</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Karunya Hostel Delivery</h1>
        </div>

        {/* Login/Register Toggle */}
        <div className="flex p-1 mb-6 bg-gray-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all ${
              isLogin 
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all ${
              !isLogin 
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Register
          </button>
        </div>

        {/* Welcome Message */}
        <div className="mb-6 text-center">
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </h2>
        </div>

        {/* Role Selection */}
        <div className="mb-6">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`flex-1 py-3 px-4 text-sm font-medium rounded-xl border-2 transition-all ${
                role === 'customer'
                  ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-slate-600'
              }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setRole('delivery')}
              className={`flex-1 py-3 px-4 text-sm font-medium rounded-xl border-2 transition-all ${
                role === 'delivery'
                  ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-slate-600'
              }`}
            >
              Delivery
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <InputField 
                label="Full Name" 
                placeholder="Enter your full name"
                value={name} 
                onChange={e=> setName(e.target.value)} 
              />
              
              {/* Gender Selection */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Hostel Type</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleGenderChange('boys')}
                    className={`flex-1 py-3 px-4 text-sm font-medium rounded-xl border-2 transition-all ${
                      gender === 'boys'
                        ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-slate-600'
                    }`}
                  >
                    Boys Hostel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenderChange('girls')}
                    className={`flex-1 py-3 px-4 text-sm font-medium rounded-xl border-2 transition-all ${
                      gender === 'girls'
                        ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-slate-600'
                    }`}
                  >
                    Girls Hostel
                  </button>
                </div>
              </div>

              {/* Year Selection */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Academic Year</label>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map(yearOption => (
                    <button
                      key={yearOption}
                      type="button"
                      onClick={() => handleYearChange(yearOption)}
                      className={`py-3 px-4 text-sm font-medium rounded-xl border-2 transition-all ${
                        year === yearOption
                          ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-slate-600'
                      }`}
                    >
                      {yearOption === 1 ? '1st Year' : yearOption === 2 ? '2nd Year' : yearOption === 3 ? '3rd Year' : '4th Year'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hostel Selection */}
              {gender && year && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Select Hostel</label>
                  <select
                    value={hostel}
                    onChange={(e) => setHostel(e.target.value)}
                    className="w-full px-3 py-3 text-gray-900 bg-white border border-gray-300 dark:bg-slate-800 dark:border-slate-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose your hostel</option>
                    {getAvailableHostels().map(hostelName => (
                      <option key={hostelName} value={hostelName}>
                        {hostelName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <InputField 
                label="Room No." 
                placeholder="Enter your room number (e.g., A-101)"
                value={room} 
                onChange={e=> setRoom(e.target.value)} 
              />
              <InputField 
                label="Phone" 
                placeholder="Enter your phone number"
                value={phone} 
                onChange={e=> setPhone(e.target.value)} 
              />
            </>
          )}
          
          <InputField 
            label={isLogin ? "Email" : "Email"} 
            placeholder="Enter your email"
            value={email} 
            onChange={e=> setEmail(e.target.value)} 
          />
          
          {/* Password field with eye icon */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={e=> setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 text-gray-900 placeholder-gray-400 transition-all duration-200 bg-white border border-gray-300 dark:text-white dark:placeholder-gray-500 dark:border-slate-700 dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 rounded-lg dark:text-red-400 bg-red-50 dark:bg-red-900/30">
              {error}
            </div>
          )}

          {isLogin && (
            <div className="text-right">
              <Link to="#" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                Forgot Password?
              </Link>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full py-4 text-base font-semibold text-white shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 
              (isLogin ? 'Logging in...' : 'Creating Account...') : 
              (isLogin ? 'Login' : 'Create Account')
            }
          </Button>
        </form>
      </div>
    </div>
  )
}
