'use client';

import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, DollarSign, Activity, Shield, LogOut, Settings, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import UserManagement from '../UserManagement/page';
import AdminStats from '../AdminStats/page';
import SystemSettings from '../SystemSettings/page';
import AnalyticsPage from '../Analytics/page';
import { removeUserAuth, getUserToken, getUserData } from '@/lib/cookies';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check authentication and role
  useEffect(() => {
    const token = getUserToken();
    const userData = getUserData();

    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    // Check if user has ADMIN role
    if (userData.role !== 'ADMIN') {
      // Redirect to appropriate dashboard based on role
      if (userData.role === 'SALES_EXECUTIVE') {
        router.push('/sales/sales-dashboard');
      } else {
        router.push('/user/dashboard');
      }
      return;
    }

    setIsLoading(false);
  }, [router]);

  // Check for tab parameter in URL
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam && ['overview', 'users', 'analytics', 'settings', 'notifications'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const handleLogout = () => {
    // Clear user session/tokens
    removeUserAuth();
    router.push('/');
  };

  const menuItems = [
    { id: 'overview', icon: Activity, label: 'Overview' },
    { id: 'users', icon: Users, label: 'User Management' },
    { id: 'analytics', icon: TrendingUp, label: 'Strategy Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'notifications', icon: Bell, label: 'Notifications' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminStats />;
      case 'users':
        return <UserManagement />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'settings':
        return <SystemSettings />;
      case 'notifications':
        return <div className="p-6 text-white">Notification Management Coming Soon...</div>;
      default:
        return <AdminStats />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

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
              // All tabs as buttons again
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-all duration-200 ${
                    activeTab === item.id
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

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;