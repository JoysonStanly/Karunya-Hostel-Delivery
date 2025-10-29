import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import { analyticsAPI } from '../services/api'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import BottomNav from '../components/BottomNav'

export default function Leaderboard(){
  const { user } = useContext(AuthContext)
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const response = await analyticsAPI.getLeaderboard()
      if (response.success && response.data) {
        setLeaderboard(response.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
      setLeaderboard([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const topThree = leaderboard.slice(0, 3)
  const others = leaderboard.slice(3)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Navbar />
      <div className="flex pb-16 md:pb-0">
        <div className="hidden md:block"><Sidebar /></div>
        <div className="flex-1 p-4 md:p-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">🏆 Delivery Leaderboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Celebrating our top-performing delivery students</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-gray-200 rounded-full dark:border-slate-700 border-t-blue-600 dark:border-t-blue-400 animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Desktop Layout */}
              <div className="hidden md:block">
                {/* Top 3 Podium */}
                {topThree.length > 0 && (
                  <div className="mb-12">
                    <h2 className="mb-8 text-2xl font-semibold text-center text-gray-900 dark:text-white">🎯 Top Performers</h2>
                    <div className="flex items-end justify-center max-w-6xl gap-8 mx-auto">
                      {/* Second Place */}
                      {topThree[1] && (
                        <div className="text-center">
                          <div className="relative mb-4">
                            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-3 rounded-full shadow-lg bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700">
                              <span className="text-2xl font-bold text-white">2</span>
                            </div>
                            <div className="flex items-center justify-center w-16 mx-auto rounded-t-lg h-28 bg-gradient-to-t from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-500">
                              <span className="text-3xl">🥈</span>
                            </div>
                          </div>
                          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-xl border-2 border-gray-300 dark:border-gray-600 min-w-[260px] transition-all hover:scale-105">
                            <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white">{topThree[1].name}</h3>
                            <p className="mb-4 text-sm text-center text-gray-600 dark:text-gray-400">Room {topThree[1].room || 'N/A'}</p>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 text-center border border-gray-200 rounded-lg dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                                <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{topThree[1].stats?.totalDeliveries || 0}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">deliveries</div>
                              </div>
                              <div className="p-3 text-center border border-gray-200 rounded-lg dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                                <div className="text-lg font-semibold text-green-600 dark:text-green-400">₹{topThree[1].stats?.totalEarnings || 0}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">earnings</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* First Place */}
                      {topThree[0] && (
                        <div className="text-center">
                          <div className="relative mb-4">
                            <div className="flex items-center justify-center w-24 h-24 mx-auto mb-3 rounded-full shadow-2xl bg-gradient-to-br from-yellow-400 to-yellow-500 dark:from-yellow-500 dark:to-yellow-600 animate-pulse">
                              <span className="text-3xl font-bold text-white">1</span>
                            </div>
                            <div className="flex items-center justify-center w-20 mx-auto rounded-t-lg h-36 bg-gradient-to-t from-yellow-400 to-yellow-300 dark:from-yellow-500 dark:to-yellow-400">
                              <span className="text-5xl">🏆</span>
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 dark:bg-slate-900 rounded-xl p-6 shadow-2xl border-2 border-yellow-400 dark:border-yellow-500 min-w-[300px] transition-all hover:scale-105">
                            <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white">{topThree[0].name}</h3>
                            <p className="mb-4 text-sm text-center text-gray-600 dark:text-gray-400">Room {topThree[0].room || 'N/A'}</p>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 text-center border-2 border-yellow-300 rounded-lg dark:border-yellow-600 bg-white/70 dark:bg-slate-800/50">
                                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{topThree[0].stats?.totalDeliveries || 0}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">deliveries</div>
                              </div>
                              <div className="p-3 text-center border-2 border-yellow-300 rounded-lg dark:border-yellow-600 bg-white/70 dark:bg-slate-800/50">
                                <div className="text-xl font-semibold text-green-600 dark:text-green-400">₹{topThree[0].stats?.totalEarnings || 0}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">earnings</div>
                              </div>
                            </div>
                            <div className="mt-3 text-center">
                              <div className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-200 border border-yellow-400 rounded-full dark:bg-yellow-900/50 dark:border-yellow-600">
                                <span className="text-yellow-600 dark:text-yellow-400">👑</span>
                                <span className="text-xs font-semibold text-yellow-800 dark:text-yellow-300">CHAMPION</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Third Place */}
                      {topThree[2] && (
                        <div className="text-center">
                          <div className="relative mb-4">
                            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-3 rounded-full shadow-lg bg-gradient-to-br from-amber-600 to-amber-700 dark:from-amber-700 dark:to-amber-800">
                              <span className="text-2xl font-bold text-white">3</span>
                            </div>
                            <div className="flex items-center justify-center w-16 h-24 mx-auto rounded-t-lg bg-gradient-to-t from-amber-600 to-amber-500 dark:from-amber-700 dark:to-amber-600">
                              <span className="text-3xl">🥉</span>
                            </div>
                          </div>
                          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-xl border-2 border-amber-400 dark:border-amber-600 min-w-[260px] transition-all hover:scale-105">
                            <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white">{topThree[2].name}</h3>
                            <p className="mb-4 text-sm text-center text-gray-600 dark:text-gray-400">Room {topThree[2].room || 'N/A'}</p>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 text-center border rounded-lg bg-amber-50 dark:bg-slate-800 border-amber-300 dark:border-amber-700">
                                <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{topThree[2].stats?.totalDeliveries || 0}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">deliveries</div>
                              </div>
                              <div className="p-3 text-center border rounded-lg bg-amber-50 dark:bg-slate-800 border-amber-300 dark:border-amber-700">
                                <div className="text-lg font-semibold text-green-600 dark:text-green-400">₹{topThree[2].stats?.totalEarnings || 0}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">earnings</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Complete Rankings */}
                <div className="mx-auto max-w-7xl">
                  <h2 className="mb-6 text-2xl font-semibold text-center text-gray-900 dark:text-white">📊 Complete Rankings</h2>
                  
                  <div className="space-y-3">
                    {leaderboard.map((student, index) => (
                      <div key={student._id || index} className={`relative bg-white dark:bg-slate-900 rounded-xl p-4 shadow-md border-2 transition-all hover:shadow-lg ${
                        index === 0 ? 'border-yellow-400 dark:border-yellow-500 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20' :
                        index === 1 ? 'border-gray-400 dark:border-gray-600 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/20 dark:to-slate-800/20' :
                        index === 2 ? 'border-amber-600 dark:border-amber-700 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20' :
                        'border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                      }`}>
                        
                        <div className="flex items-center gap-4">
                          {/* Rank Badge */}
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0 ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 dark:from-yellow-500 dark:to-yellow-600' :
                            index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700' :
                            index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 dark:from-amber-700 dark:to-amber-800' :
                            'bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700'
                          }`}>
                            #{index + 1}
                          </div>

                          {/* Trophy for top 3 */}
                          {index < 3 && (
                            <div className="absolute text-2xl top-2 left-14">
                              {index === 0 ? '🏆' : index === 1 ? '🥈' : '🥉'}
                            </div>
                          )}

                          {/* User Info */}
                          <div className="flex items-center flex-1 min-w-0 gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-gray-900 truncate dark:text-white">
                                {student.name}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <span>Room {student.room || 'N/A'}</span>
                                <span className="text-gray-400 dark:text-gray-600">•</span>
                                <span>{student.hostel || 'N/A'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Stats - Horizontal Layout */}
                          <div className="flex items-center gap-4">
                            {/* Deliveries */}
                            <div className="p-3 text-center border-2 border-gray-200 rounded-lg dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 min-w-[90px]">
                              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{student.stats?.totalDeliveries || 0}</div>
                              <div className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">Deliveries</div>
                            </div>
                            
                            {/* Earnings */}
                            <div className="p-3 text-center border-2 border-gray-200 rounded-lg dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 min-w-[90px]">
                              <div className="text-xl font-bold text-green-600 dark:text-green-400">₹{student.stats?.totalEarnings || 0}</div>
                              <div className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">Earnings</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {leaderboard.length === 0 && (
                  <div className="py-12 text-center">
                    <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full dark:bg-slate-800">
                      <svg className="w-12 h-12 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">No Delivery Students Found</h3>
                    <p className="text-gray-600 dark:text-gray-400">Be the first to start delivering and claim the top spot!</p>
                  </div>
                )}
              </div>

              {/* Mobile Layout */}
              <div className="md:hidden">
                <div className="grid gap-3">
                  {leaderboard.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-gray-500 dark:text-gray-400">No delivery students found.</p>
                    </div>
                  ) : (
                    leaderboard.map((student, index)=> (
                      <div key={student._id || index} className="p-4 transition-all bg-white border border-gray-200 shadow-md dark:bg-slate-900 dark:border-slate-700 rounded-xl hover:shadow-lg">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 grid place-items-center rounded-full text-sm font-bold shadow-md ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white' :
                            index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 text-white' :
                            index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white' : 
                            'bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 text-white'
                          }`}>
                            #{index+1}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 dark:text-white">{student.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Room {student.room || 'N/A'}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{student.hostel || 'N/A'}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{student.stats?.totalDeliveries || 0}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">deliveries</div>
                            <div className="text-sm font-semibold text-green-600 dark:text-green-400">₹{student.stats?.totalEarnings || 0}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}