import React from 'react';
import { Users, TrendingUp, DollarSign, Activity, Crown, Shield, AlertTriangle } from 'lucide-react';
import { mockUser, mockStrategies } from '../../../data/mockData';

const AdminStats: React.FC = () => {
  // Mock admin statistics
  const stats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalStrategies: 3456,
    activeStrategies: 2134,
    totalRevenue: 2450000,
    monthlyRevenue: 345000,
    totalTrades: 45678,
    successfulTrades: 32456
  };

  const subscriptionStats = [
    { plan: 'FREE', count: 623, color: 'text-gray-400 bg-gray-500/20' },
    { plan: 'BASIC', count: 312, color: 'text-blue-400 bg-blue-500/20' },
    { plan: 'PREMIUM', count: 267, color: 'text-purple-400 bg-purple-500/20' },
    { plan: 'ENTERPRISE', count: 45, color: 'text-yellow-400 bg-yellow-500/20' }
  ];

  const recentActivities = [
    { type: 'user_signup', message: 'New user registered: john.doe@example.com', time: '2 minutes ago' },
    { type: 'strategy_created', message: 'Strategy "Momentum Trading" created by user #1234', time: '5 minutes ago' },
    { type: 'payment_received', message: 'Payment of ₹2,999 received from Premium user', time: '10 minutes ago' },
    { type: 'trade_executed', message: 'High volume trading activity detected', time: '15 minutes ago' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Admin Overview</h1>
        <div className="text-right">
          <p className="text-purple-200">Last updated</p>
          <p className="text-xl font-semibold text-white">{new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</p>
              <p className="text-green-400 text-sm">+12% this month</p>
            </div>
            <div className="bg-blue-500/20 p-3 rounded-full">
              <Users className="text-blue-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm">Active Strategies</p>
              <p className="text-2xl font-bold text-white">{stats.activeStrategies.toLocaleString()}</p>
              <p className="text-green-400 text-sm">+8% this week</p>
            </div>
            <div className="bg-green-500/20 p-3 rounded-full">
              <TrendingUp className="text-green-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm">Monthly Revenue</p>
              <p className="text-2xl font-bold text-white">₹{stats.monthlyRevenue.toLocaleString()}</p>
              <p className="text-green-400 text-sm">+15% vs last month</p>
            </div>
            <div className="bg-yellow-500/20 p-3 rounded-full">
              <DollarSign className="text-yellow-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm">Total Trades</p>
              <p className="text-2xl font-bold text-white">{stats.totalTrades.toLocaleString()}</p>
              <p className="text-green-400 text-sm">71% success rate</p>
            </div>
            <div className="bg-purple-500/20 p-3 rounded-full">
              <Activity className="text-purple-400" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Distribution */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-4">Subscription Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {subscriptionStats.map((sub) => (
            <div key={sub.plan} className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${sub.color}`}>
                  {sub.plan}
                </span>
                <Crown size={16} className="text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">{sub.count}</p>
              <p className="text-purple-200 text-sm">
                {((sub.count / stats.totalUsers) * 100).toFixed(1)}% of users
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-4">Recent System Activity</h2>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="bg-purple-500/20 p-2 rounded-full">
                  {activity.type === 'user_signup' && <Users size={16} className="text-blue-400" />}
                  {activity.type === 'strategy_created' && <TrendingUp size={16} className="text-green-400" />}
                  {activity.type === 'payment_received' && <DollarSign size={16} className="text-yellow-400" />}
                  {activity.type === 'trade_executed' && <Activity size={16} className="text-purple-400" />}
                </div>
                <div className="flex-1">
                  <p className="text-white">{activity.message}</p>
                  <p className="text-purple-200 text-sm">{activity.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center space-x-3 mb-4">
            <Shield size={24} className="text-green-400" />
            <h3 className="text-lg font-semibold text-white">System Status</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-purple-200">API Server</span>
              <span className="text-green-400">Online</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-200">Database</span>
              <span className="text-green-400">Healthy</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-200">Trading Engine</span>
              <span className="text-green-400">Active</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center space-x-3 mb-4">
            <Activity size={24} className="text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Performance</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-purple-200">Response Time</span>
              <span className="text-white">45ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-200">Uptime</span>
              <span className="text-white">99.9%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-200">CPU Usage</span>
              <span className="text-white">23%</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle size={24} className="text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Alerts</h3>
          </div>
          <div className="space-y-2">
            <div className="text-yellow-400 text-sm">2 pending KYC approvals</div>
            <div className="text-blue-400 text-sm">5 new support tickets</div>
            <div className="text-green-400 text-sm">All systems operational</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;