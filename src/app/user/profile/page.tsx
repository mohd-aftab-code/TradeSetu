'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, MapPin, CreditCard, Settings, Save, Loader2 } from 'lucide-react';
import { User as UserType } from '@/types/database';
import { getUserToken, getUserData } from '@/lib/cookies';
import Sidebar from '../components/Layout/Sidebar';

const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    pincode: ''
  });

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = getUserToken();
      const userData = getUserData();
      
    if (!token || !userData) {
        router.push('/auth/login');
        return;
      }
      
      setIsAuthenticated(true);
      
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      
      if (result.success) {
        setUser(result.data);
        const formDataToSet = {
          name: result.data.name,
          email: result.data.email,
          phone: result.data.phone,
          city: result.data.city,
          state: result.data.state,
          pincode: result.data.pincode
        };
        
        setFormData(formDataToSet);
      } else {
        setError(result.error || 'Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsUpdating(true);
      setError(null);
      setSuccessMessage(null);
      
      const token = getUserToken();
      if (!token) {
        setError('Authentication token not found');
        return;
      }
      
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setUser(result.data);
        setSuccessMessage(result.message || 'Profile updated successfully');
        setIsEditing(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getSubscriptionColor = (plan: string) => {
    switch (plan) {
      case 'FREE': return 'text-gray-400 bg-gray-500/20';
      case 'BASIC': return 'text-blue-400 bg-blue-500/20';
      case 'PREMIUM': return 'text-purple-400 bg-purple-500/20';
      case 'ENTERPRISE': return 'text-gold-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white text-xl">
        <div className="flex items-center space-x-3">
          <Loader2 className="animate-spin" size={24} />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400">
          {error || 'Failed to load profile'}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      <div className="hidden md:block fixed left-0 top-0 h-full z-10">
        <Sidebar activeTab="profile" onTabChange={() => {}} />
      </div>
      <div className="flex-1 flex min-w-0 md:ml-64">
        <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 space-y-6 md:ml-0 overflow-x-hidden">
            <div className="p-6 space-y-6">
              {/* Success Message */}
              {successMessage && (
                <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-green-400">
                  {successMessage}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Profile</h1>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={isUpdating}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Settings size={20} />
                  <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Overview */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User size={40} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                    <p className="text-blue-200">{user.email}</p>
                    
                    <div className="mt-4">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getSubscriptionColor(user.subscription_plan)}`}>
                        {user.subscription_plan} Plan
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200">Account Balance</span>
                      <span className="text-white font-semibold">₹{user.balance.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200">KYC Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.kyc_status === 'APPROVED' ? 'bg-green-500/20 text-green-400' : 
                        user.kyc_status === 'REJECTED' ? 'bg-red-500/20 text-red-400' : 
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {user.kyc_status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200">Member Since</span>
                      <span className="text-white font-semibold">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="lg:col-span-2 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <h2 className="text-xl font-semibold text-white mb-6">Personal Information</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-blue-200 text-sm mb-2">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          disabled={!isEditing || isUpdating}
                          className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-blue-200 text-sm mb-2">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={!isEditing || isUpdating}
                          className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-blue-200 text-sm mb-2">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!isEditing || isUpdating}
                        className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-blue-200 text-sm mb-2">City</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          disabled={!isEditing || isUpdating}
                          className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-blue-200 text-sm mb-2">State</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          disabled={!isEditing || isUpdating}
                          className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-blue-200 text-sm mb-2">Pincode</label>
                        <input
                          type="text"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleChange}
                          disabled={!isEditing || isUpdating}
                          className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex items-center space-x-4 pt-4">
                        <button
                          type="submit"
                          disabled={isUpdating}
                          className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUpdating ? (
                            <Loader2 className="animate-spin" size={20} />
                          ) : (
                            <Save size={20} />
                          )}
                          <span>{isUpdating ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          disabled={isUpdating}
                          className="bg-white/10 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
        </main>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;