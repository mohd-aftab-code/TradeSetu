'use client'

import React, { useState } from 'react';
import { Settings, Save, Database, Shield, Bell, DollarSign } from 'lucide-react';

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'TradeSetu',
    siteDescription: 'Advanced Trading Platform',
    maintenanceMode: false,
    
    // Trading Settings
    maxStrategiesPerUser: 10,
    maxPositionSize: 1000000,
    tradingHours: {
      start: '09:15',
      end: '15:30'
    },
    
    // Subscription Settings
    freePlanStrategies: 2,
    basicPlanPrice: 999,
    premiumPlanPrice: 2999,
    enterprisePlanPrice: 9999,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    
    // Security Settings
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    requireTwoFactor: false,
    
    // API Settings
    rateLimitPerMinute: 100,
    apiTimeout: 30
  });

  const handleChange = (section: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: typeof prev[section as keyof typeof prev] === 'object' 
        ? { ...prev[section as keyof typeof prev] as any, [field]: value }
        : value
    }));
  };

  const handleSave = () => {
    console.log('Saving settings:', settings);
    // Implement save functionality
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Settings size={32} className="text-purple-400" />
          <h1 className="text-3xl font-bold text-white">System Settings</h1>
        </div>
        <button
          onClick={handleSave}
          className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
        >
          <Save size={20} />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center space-x-3 mb-4">
            <Settings size={24} className="text-purple-400" />
            <h2 className="text-xl font-semibold text-white">General Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-purple-200 text-sm mb-2">Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-purple-200 text-sm mb-2">Site Description</label>
              <input
                type="text"
                value={settings.siteDescription}
                onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-purple-200">Maintenance Mode</span>
              <button
                onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.maintenanceMode ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Trading Settings */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center space-x-3 mb-4">
            <Database size={24} className="text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Trading Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-purple-200 text-sm mb-2">Max Strategies Per User</label>
              <input
                type="number"
                value={settings.maxStrategiesPerUser}
                onChange={(e) => setSettings({...settings, maxStrategiesPerUser: parseInt(e.target.value)})}
                className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-purple-200 text-sm mb-2">Max Position Size (₹)</label>
              <input
                type="number"
                value={settings.maxPositionSize}
                onChange={(e) => setSettings({...settings, maxPositionSize: parseInt(e.target.value)})}
                className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-purple-200 text-sm mb-2">Trading Start Time</label>
                <input
                  type="time"
                  value={settings.tradingHours.start}
                  onChange={(e) => handleChange('tradingHours', 'start', e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-purple-200 text-sm mb-2">Trading End Time</label>
                <input
                  type="time"
                  value={settings.tradingHours.end}
                  onChange={(e) => handleChange('tradingHours', 'end', e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Settings */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center space-x-3 mb-4">
            <DollarSign size={24} className="text-green-400" />
            <h2 className="text-xl font-semibold text-white">Subscription Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-purple-200 text-sm mb-2">Free Plan Strategies</label>
              <input
                type="number"
                value={settings.freePlanStrategies}
                onChange={(e) => setSettings({...settings, freePlanStrategies: parseInt(e.target.value)})}
                className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-purple-200 text-sm mb-2">Basic Plan Price (₹)</label>
                <input
                  type="number"
                  value={settings.basicPlanPrice}
                  onChange={(e) => setSettings({...settings, basicPlanPrice: parseInt(e.target.value)})}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-purple-200 text-sm mb-2">Premium Plan Price (₹)</label>
                <input
                  type="number"
                  value={settings.premiumPlanPrice}
                  onChange={(e) => setSettings({...settings, premiumPlanPrice: parseInt(e.target.value)})}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-purple-200 text-sm mb-2">Enterprise Plan Price (₹)</label>
              <input
                type="number"
                value={settings.enterprisePlanPrice}
                onChange={(e) => setSettings({...settings, enterprisePlanPrice: parseInt(e.target.value)})}
                className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center space-x-3 mb-4">
            <Shield size={24} className="text-red-400" />
            <h2 className="text-xl font-semibold text-white">Security Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-purple-200 text-sm mb-2">Session Timeout (minutes)</label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-purple-200 text-sm mb-2">Max Login Attempts</label>
              <input
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => setSettings({...settings, maxLoginAttempts: parseInt(e.target.value)})}
                className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-purple-200">Require Two-Factor Authentication</span>
              <button
                onClick={() => setSettings({...settings, requireTwoFactor: !settings.requireTwoFactor})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.requireTwoFactor ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.requireTwoFactor ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <div className="flex items-center space-x-3 mb-4">
          <Bell size={24} className="text-yellow-400" />
          <h2 className="text-xl font-semibold text-white">Notification Settings</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center justify-between">
            <span className="text-purple-200">Email Notifications</span>
            <button
              onClick={() => setSettings({...settings, emailNotifications: !settings.emailNotifications})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.emailNotifications ? 'bg-purple-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-purple-200">SMS Notifications</span>
            <button
              onClick={() => setSettings({...settings, smsNotifications: !settings.smsNotifications})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.smsNotifications ? 'bg-purple-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-purple-200">Push Notifications</span>
            <button
              onClick={() => setSettings({...settings, pushNotifications: !settings.pushNotifications})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.pushNotifications ? 'bg-purple-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;