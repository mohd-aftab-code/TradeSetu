import React, { useState } from 'react';
import { Users, Search, Filter, Edit, Trash2, Eye, Crown, Shield, Ban } from 'lucide-react';

const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterKyc, setFilterKyc] = useState('ALL');
  const [filterTradesMin, setFilterTradesMin] = useState('');

  // Mock user data for admin panel
  const mockUsers = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+91 9876543210',
      subscription_plan: 'PREMIUM',
      kyc_status: 'APPROVED',
      balance: 250000,
      created_at: new Date('2024-01-15'),
      last_login: new Date('2024-03-10'),
      is_active: true,
      total_trades: 156,
      total_pnl: 45000,
      emailVerified: true,
      status: 'Active',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+91 9876543211',
      subscription_plan: 'BASIC',
      kyc_status: 'PENDING',
      balance: 50000,
      created_at: new Date('2024-02-20'),
      last_login: new Date('2024-03-09'),
      is_active: true,
      total_trades: 23,
      total_pnl: 12000,
      emailVerified: false,
      status: 'Inactive',
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      phone: '+91 9876543212',
      subscription_plan: 'ENTERPRISE',
      kyc_status: 'APPROVED',
      balance: 1000000,
      created_at: new Date('2024-01-05'),
      last_login: new Date('2024-03-10'),
      is_active: true,
      total_trades: 445,
      total_pnl: 125000,
      emailVerified: true,
      status: 'Suspended',
    },
    {
      id: '4',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@example.com',
      phone: '+91 9876543213',
      subscription_plan: 'FREE',
      kyc_status: 'REJECTED',
      balance: 0,
      created_at: new Date('2024-03-01'),
      last_login: new Date('2024-03-08'),
      is_active: false,
      total_trades: 0,
      total_pnl: 0,
      emailVerified: false,
      status: 'Deleted',
    }
  ];

  const getSubscriptionColor = (plan: string) => {
    switch (plan) {
      case 'FREE': return 'text-gray-400 bg-gray-500/20';
      case 'BASIC': return 'text-blue-400 bg-blue-500/20';
      case 'PREMIUM': return 'text-purple-400 bg-purple-500/20';
      case 'ENTERPRISE': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'text-green-400 bg-green-500/20';
      case 'PENDING': return 'text-yellow-400 bg-yellow-500/20';
      case 'REJECTED': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  // Add helper for status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-400 bg-green-500/20';
      case 'Suspended': return 'text-yellow-400 bg-yellow-500/20';
      case 'Deleted': return 'text-red-400 bg-red-500/20';
      case 'Inactive': return 'text-gray-400 bg-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === 'ALL' || user.subscription_plan === filterPlan;
    const matchesStatus = filterStatus === 'ALL' || 
                         (filterStatus === 'ACTIVE' && user.is_active) ||
                         (filterStatus === 'INACTIVE' && !user.is_active);
    const matchesKyc = filterKyc === 'ALL' || user.kyc_status === filterKyc;
    const matchesTrades = !filterTradesMin || user.total_trades >= parseInt(filterTradesMin);
    return matchesSearch && matchesPlan && matchesStatus && matchesKyc && matchesTrades;
  });

  const handleUserAction = (action: string, userId: string) => {
    console.log(`${action} user:`, userId);
    // Implement user actions here
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Users size={32} className="text-purple-400" />
          <h1 className="text-3xl font-bold text-white">User Management</h1>
        </div>
        <div className="text-right">
          <p className="text-purple-200">Total Users</p>
          <p className="text-2xl font-bold text-white">{mockUsers.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-purple-200 text-sm mb-2">Search Users</label>
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Search by name or email"
              />
            </div>
          </div>

          <div>
            <label className="block text-purple-200 text-sm mb-2">Subscription Plan</label>
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">All Plans</option>
              <option value="FREE">Free</option>
              <option value="BASIC">Basic</option>
              <option value="PREMIUM">Premium</option>
              <option value="ENTERPRISE">Enterprise</option>
            </select>
          </div>

          <div>
            <label className="block text-purple-200 text-sm mb-2">Account Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-purple-200 text-sm mb-2">KYC Status</label>
            <select
              value={filterKyc}
              onChange={(e) => setFilterKyc(e.target.value)}
              className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">All KYC</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-purple-200 text-sm mb-2">Trades &gt;=</label>
            <input
              type="number"
              min="0"
              value={filterTradesMin}
              onChange={(e) => setFilterTradesMin(e.target.value)}
              className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Min trades"
            />
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
        <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left p-4 text-purple-200 font-semibold">User</th>
                <th className="text-left p-4 text-purple-200 font-semibold">Plan</th>
                <th className="text-left p-4 text-purple-200 font-semibold">KYC Status</th>
                <th className="text-left p-4 text-purple-200 font-semibold">Account Status</th>
                <th className="text-left p-4 text-purple-200 font-semibold">Registered On</th>
                <th className="text-left p-4 text-purple-200 font-semibold">Balance</th>
                <th className="text-left p-4 text-purple-200 font-semibold">Trades</th>
                <th className="text-left p-4 text-purple-200 font-semibold">Last Login</th>
                <th className="text-left p-4 text-purple-200 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="p-4">
                    <div>
                      <p className="text-white font-semibold">{user.name}</p>
                      <p className="text-purple-200 text-sm">{user.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSubscriptionColor(user.subscription_plan)}`}>
                      {user.subscription_plan}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getKycStatusColor(user.kyc_status)}`}>
                      {user.kyc_status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-purple-200 text-sm">
                      {user.created_at.toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="text-white font-semibold">₹{user.balance.toLocaleString()}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-white">{user.total_trades}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-purple-200 text-sm">{user.last_login.toLocaleDateString()}</p>
                  </td>
                  <td className="p-4">
                    {/* Actions as before */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUserAction('view', user.id)}
                        className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all duration-200"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleUserAction('edit', user.id)}
                        className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all duration-200"
                        title="Edit User"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleUserAction('toggle', user.id)}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          user.is_active 
                            ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' 
                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        }`}
                        title={user.is_active ? 'Suspend User' : 'Activate User'}
                      >
                        {user.is_active ? <Ban size={16} /> : <Shield size={16} />}
                      </button>
                      <button
                        onClick={() => handleUserAction('delete', user.id)}
                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-200"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8">
          <Users size={48} className="text-purple-400 mx-auto mb-4" />
          <p className="text-purple-200">No users found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default UserManagement;