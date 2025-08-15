'use client'

import React, { useState } from 'react';
import { UserPlus, Eye, EyeOff, Users, Shield, LogOut, TrendingUp, Activity, Settings, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

const AdminUserCreate = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    city: '',
    state: '',
    pincode: '',
    role: 'USER' // Default role
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          role: formData.role
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: '',
          city: '',
          state: '',
          pincode: '',
          role: 'USER'
        });
      } else {
        setError(data.error || 'User creation failed');
      }
    } catch {
      setError('Network error');
    }
    setLoading(false);
  };

  const handleBackToUserManagement = () => {
    router.push('/admin?tab=users');
  };

  const handleLogout = () => {
    // Clear any admin session/tokens here
    localStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  const menuItems = [
    { id: 'overview', icon: Activity, label: 'Overview' },
    { id: 'users', icon: Users, label: 'User Management' },
    { id: 'analytics', icon: TrendingUp, label: 'Strategy Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'notifications', icon: Bell, label: 'Notifications' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="flex h-screen">
        {/* Admin Sidebar */}
        <div className="w-64 bg-white/10 backdrop-blur-lg border-r border-white/20 h-full">
          <div className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-2 rounded-lg">
                <Shield size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                <p className="text-purple-200 text-sm">TradeSetu</p>
              </div>
            </div>
          </div>
          
          <nav className="mt-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => router.push(`/admin?tab=${item.id}`)}
                  className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-all duration-200 ${
                    item.id === 'users'
                      ? 'bg-white/20 text-white border-r-4 border-purple-400'
                      : 'text-purple-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
          
          <div className="absolute bottom-4 left-4 right-4">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-300 hover:text-red-200 hover:bg-red-500/10 rounded-lg transition-all duration-200"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content - Registration Form */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Back Button */}
            <div className="mb-6">
              <button
                onClick={handleBackToUserManagement}
                className="flex items-center space-x-2 text-purple-200 hover:text-white transition-all duration-200"
              >
                <Users size={20} />
                <span>← Back to User Management</span>
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 w-full max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users size={32} className="text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Create New User</h1>
                <p className="text-purple-200">Admin can create users with different roles</p>
              </div>

              {success ? (
                <div className="text-center">
                  <div className="text-green-400 text-lg mb-4">User created successfully!</div>
                  <button
                    onClick={() => setSuccess(false)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                  >
                    Create Another User
                  </button>
                  <button
                    onClick={handleBackToUserManagement}
                    className="block w-full mt-3 text-purple-300 hover:text-white text-sm"
                  >
                    Back to User Management
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Two Column Layout for Input Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-purple-200 text-sm font-medium mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Enter full name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-purple-200 text-sm font-medium mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="user@example.com"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-purple-200 text-sm font-medium mb-2">
                          Phone (optional)
                        </label>
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Phone number"
                        />
                      </div>

                      <div>
                        <label className="block text-purple-200 text-sm font-medium mb-2">
                          City (optional)
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="City"
                        />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-purple-200 text-sm font-medium mb-2">
                          Role
                        </label>
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        >
                          <option value="USER">User</option>
                          <option value="SALES_EXECUTIVE">Sales Executive</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-purple-200 text-sm font-medium mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-12"
                            placeholder="Enter password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white"
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-purple-200 text-sm font-medium mb-2">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-12"
                            placeholder="Confirm password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white"
                          >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-purple-200 text-sm font-medium mb-2">
                          State (optional)
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="State"
                        />
                      </div>

                      <div>
                        <label className="block text-purple-200 text-sm font-medium mb-2">
                          Pincode (optional)
                        </label>
                        <input
                          type="text"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleChange}
                          className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Pincode"
                        />
                      </div>
                    </div>
                  </div>

                  {error && <div className="text-red-400 text-sm text-center">{error}</div>}

                  {/* Full Width Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Creating User...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={20} />
                        <span>Create User</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserCreate;