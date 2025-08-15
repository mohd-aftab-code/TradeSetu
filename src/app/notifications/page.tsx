'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../components/Layout/Sidebar';
import NotificationsPage from '../components/Notifications/page';

const Notifications = () => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('userToken')
    const userData = localStorage.getItem('userData')
    if (!token || !userData) {
      router.push('/auth/login')
      return
    }
    try {
      setUser(JSON.parse(userData))
    } catch (error) {
      router.push('/auth/login')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white text-xl">Loading...</div>;
  }
  if (!user) return null;

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      <div className="fixed left-0 top-0 h-full z-10">
        <Sidebar activeTab="notifications" onTabChange={() => {}} />
      </div>
      <div className="flex-1 flex min-w-0 md:ml-64">
        <main className="flex-1 p-6 space-y-6 md:ml-0 overflow-x-hidden">
          <NotificationsPage />
        </main>
      </div>
    </div>
  );
};

export default Notifications; 