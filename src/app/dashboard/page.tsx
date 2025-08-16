'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Dashboard from '@/app/components/Dashboard/page'
import { getUserToken, getUserData } from '@/lib/cookies'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated and has correct role
    const token = getUserToken()
    const userData = getUserData()

    if (!token || !userData) {
      router.push('/auth/login')
      return
    }

    // Check if user has USER role (regular user)
    if (userData.role !== 'USER') {
      // Redirect to appropriate dashboard based on role
      if (userData.role === 'ADMIN') {
        router.push('/admin')
      } else if (userData.role === 'SALES_EXECUTIVE') {
        router.push('/sales-dashboard')
      }
      return
    }

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

  return <Dashboard />
} 