'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../components/Layout/Sidebar';
import StrategyList from '../components/Strategies/StrategyList/page';
import { getUserToken, getUserData } from '@/lib/cookies';

const StrategiesPage = () => {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const token = getUserToken()
    const userData = getUserData()
    
    console.log('Strategies page - Token:', token)
    console.log('Strategies page - User data:', userData)

    if (!token || !userData) {
      console.log('No token or user data found, redirecting to login')
      router.push('/auth/login')
      return
    }

    console.log('User authenticated, setting user data')
    setUser(userData)
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      <div className="fixed left-0 top-0 h-full z-10">
        <Sidebar activeTab="strategies" onTabChange={() => {}} />
      </div>
      <div className="flex-1 flex min-w-0 md:ml-64">
        <main className="flex-1 p-6 space-y-6 md:ml-0 overflow-x-hidden">
          <StrategyList />
        </main>
      </div>
    </div>
  );
};

export default StrategiesPage; 