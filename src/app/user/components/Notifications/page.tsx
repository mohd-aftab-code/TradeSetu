import React from 'react';
import { Bell, Check, X } from 'lucide-react';

const NotificationsPage: React.FC = () => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'TRADE_ALERT': return '📈';
      case 'BILLING': return '💳';
      case 'SYSTEM': return '⚙️';
      case 'STRATEGY': return '🎯';
      default: return '📢';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Bell size={32} className="text-blue-400" />
          <h1 className="text-3xl font-bold text-white">Notifications</h1>
        </div>
        <button className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-all duration-200">
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
                <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                <div>
                  <h3 className="font-semibold text-white">{notification.title}</h3>
                  <p className="text-blue-200 mt-1">{notification.message}</p>
                  <p className="text-sm text-blue-300 mt-2">
                    {notification.created_at.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!notification.is_read && (
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                )}
                <button className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all duration-200">
                  <Check size={16} />
                </button>
                <button className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-200">
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;