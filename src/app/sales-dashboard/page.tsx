'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUserToken, getUserData } from '@/lib/cookies'
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Target, 
  BarChart3, 
  UserPlus, 
  Activity,
  Calendar,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'

export default function SalesDashboardPage() {
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

    // Check if user has SALES_EXECUTIVE role
    if (userData.role !== 'SALES_EXECUTIVE') {
      // Redirect to appropriate dashboard based on role
      if (userData.role === 'ADMIN') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
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

  // Mock sales data
  const salesData = {
    totalLeads: 156,
    convertedLeads: 89,
    conversionRate: 57.1,
    monthlyRevenue: 125000,
    targetRevenue: 200000,
    activeDeals: 23,
    pendingFollowUps: 12,
    thisMonthSales: 15,
    lastMonthSales: 12
  }

  const recentLeads = [
    { id: 1, name: 'John Smith', email: 'john@example.com', status: 'Contacted', date: '2024-01-15' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', status: 'Qualified', date: '2024-01-14' },
    { id: 3, name: 'Mike Wilson', email: 'mike@example.com', status: 'Proposal Sent', date: '2024-01-13' },
    { id: 4, name: 'Lisa Brown', email: 'lisa@example.com', status: 'Negotiation', date: '2024-01-12' },
    { id: 5, name: 'David Lee', email: 'david@example.com', status: 'Closed', date: '2024-01-11' }
  ]

  const upcomingTasks = [
    { id: 1, title: 'Follow up with John Smith', priority: 'High', dueDate: '2024-01-16' },
    { id: 2, title: 'Send proposal to Sarah Johnson', priority: 'Medium', dueDate: '2024-01-17' },
    { id: 3, title: 'Call Mike Wilson', priority: 'High', dueDate: '2024-01-16' },
    { id: 4, title: 'Prepare demo for Lisa Brown', priority: 'Medium', dueDate: '2024-01-18' }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Contacted': return 'text-blue-500'
      case 'Qualified': return 'text-yellow-500'
      case 'Proposal Sent': return 'text-purple-500'
      case 'Negotiation': return 'text-orange-500'
      case 'Closed': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-500'
      case 'Medium': return 'text-yellow-500'
      case 'Low': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Sales Executive Dashboard</h1>
          <p className="text-gray-300">Welcome back, {user.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Total Leads</p>
                <p className="text-3xl font-bold">{salesData.totalLeads}</p>
              </div>
              <Users className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm">Converted Leads</p>
                <p className="text-3xl font-bold">{salesData.convertedLeads}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Conversion Rate</p>
                <p className="text-3xl font-bold">{salesData.conversionRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-200 text-sm">Monthly Revenue</p>
                <p className="text-3xl font-bold">₹{salesData.monthlyRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Revenue Progress */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Revenue Progress</h2>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300">Target: ₹{salesData.targetRevenue.toLocaleString()}</span>
            <span className="text-white font-semibold">₹{salesData.monthlyRevenue.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(salesData.monthlyRevenue / salesData.targetRevenue) * 100}%` }}
            ></div>
          </div>
          <p className="text-gray-400 text-sm mt-2">
            {((salesData.monthlyRevenue / salesData.targetRevenue) * 100).toFixed(1)}% of monthly target
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Leads */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Recent Leads</h2>
              <UserPlus className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{lead.name}</p>
                    <p className="text-gray-400 text-sm">{lead.email}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${getStatusColor(lead.status)}`}>{lead.status}</p>
                    <p className="text-gray-400 text-xs">{lead.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Upcoming Tasks</h2>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{task.title}</p>
                    <p className="text-gray-400 text-sm">Due: {task.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>{task.priority}</p>
                    <Clock className="w-4 h-4 text-gray-400 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center p-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors">
              <UserPlus className="w-5 h-5 mr-2" />
              Add New Lead
            </button>
            <button className="flex items-center justify-center p-4 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors">
              <BarChart3 className="w-5 h-5 mr-2" />
              View Reports
            </button>
            <button className="flex items-center justify-center p-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors">
              <Activity className="w-5 h-5 mr-2" />
              Schedule Follow-up
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
