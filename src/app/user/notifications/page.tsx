'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, X } from 'lucide-react';
import Sidebar from '../components/Layout/Sidebar';
import { getUserToken, getUserData } from '@/lib/cookies';

const NotificationsPage: React.FC = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getUserToken();
    const userData = getUserData();
    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }
    setUser(userData);
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white text-xl">Loading...</div>;
  }
  if (!user) return null;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'TRADE_ALERT': return '📈';
      case 'BILLING': return '💳';
      case 'SYSTEM': return '⚙️';
      case 'STRATEGY': return '🎯';
      default: return '📢';
    }
  };

  // Mock notifications data
  const mockNotifications = [
    {
      id: '1',
      type: 'TRADE_ALERT',
      title: 'Trade Executed Successfully',
      message: 'Your NIFTY 50 call option has been executed at ₹180.50',
      timestamp: '2024-03-15T10:30:00Z',
      is_read: false
    },
    {
      id: '2',
      type: 'BILLING',
      title: 'Payment Received',
      message: 'Your monthly subscription payment of ₹12,978.82 has been processed',
      timestamp: '2024-03-14T09:15:00Z',
      is_read: true
    },
    {
      id: '3',
      type: 'STRATEGY',
      title: 'Strategy Performance Update',
      message: 'Your "Momentum Breakout" strategy generated 15.2% returns this week',
      timestamp: '2024-03-13T16:45:00Z',
      is_read: false
    },
    {
      id: '4',
      type: 'SYSTEM',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur on March 20th from 2:00 AM to 4:00 AM IST',
      timestamp: '2024-03-12T14:20:00Z',
      is_read: true
    }
  ];

  const markAsRead = (id: string) => {
    // In a real app, this would make an API call
    console.log('Marking notification as read:', id);
  };

  const markAllAsRead = () => {
    // In a real app, this would make an API call
    console.log('Marking all notifications as read');
  };

  const deleteNotification = (id: string) => {
    // In a real app, this would make an API call
    console.log('Deleting notification:', id);
  };

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      <div className="hidden md:block fixed left-0 top-0 h-full z-10">
        <Sidebar activeTab="notifications" onTabChange={() => {}} />
      </div>
      <div className="flex-1 flex min-w-0 md:ml-64">
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-6 space-y-6 md:ml-0 overflow-x-hidden">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Bell size={32} className="text-blue-400" />
                  <h1 className="text-3xl font-bold text-white">Notifications</h1>
                </div>
                <button 
                  onClick={markAllAsRead}
                  className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-all duration-200"
                >
                  Mark All as Read
                </button>
              </div>

              <div className="space-y-4">
                {mockNotifications.map((notification) => (
                  <div key={notification.id} className={`bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 ${
                    !notification.is_read ? 'border-l-4 border-l-blue-400' : ''
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">{notification.title}</h3>
                          <p className="text-blue-200 mt-1">{notification.message}</p>
                          <p className="text-blue-300 text-sm mt-2">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!notification.is_read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all duration-200"
                            title="Mark as Read"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-200"
                          title="Delete"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {mockNotifications.length === 0 && (
                <div className="text-center py-12">
                  <Bell size={64} className="text-blue-400 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Notifications</h3>
                  <p className="text-blue-200">You're all caught up! Check back later for updates.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;