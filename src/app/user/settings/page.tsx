'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../components/Layout/Sidebar';
import { getUserToken, getUserData } from '@/lib/cookies';

const SettingsPage = () => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = getUserToken()
    const userData = getUserData()
    if (!token || !userData) {
      router.push('/auth/login')
      return
    }
    setUser(userData)
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white text-xl">Loading...</div>;
  }
  if (!user) return null;

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      <div className="fixed left-0 top-0 h-full z-10">
        <Sidebar activeTab="settings" onTabChange={() => {}} />
      </div>
      <div className="flex-1 flex min-w-0 md:ml-64">
        <main className="flex-1 p-6 space-y-6 md:ml-0 overflow-x-hidden">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mt-6 text-blue-200">Settings feature coming soon.</div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage; 