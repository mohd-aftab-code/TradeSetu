import React from 'react';
import { 
  Home, 
  TrendingUp, 
  Target, 
  FileText, 
  User, 
  Settings, 
  LogOut,
  Activity,
  BarChart3,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { removeUserAuth } from '@/lib/cookies';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const router = useRouter();

  const handleLogout = () => {
    removeUserAuth();
    router.push('/');
  };

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'strategies', icon: Target, label: 'Strategies' },
    { id: 'backtesting', icon: TrendingUp, label: 'Backtesting' },
    { id: 'live-trades', icon: Activity, label: 'Live Trades' },
    { id: 'market-insight', icon: BarChart3, label: 'Market Insight' },
    { id: 'onetape-trade', icon: Zap, label: 'Onetape Trade' },
    { id: 'billing', icon: FileText, label: 'Billing' },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  const routeMap: Record<string, string> = {
    dashboard: '/user/dashboard',
    strategies: '/user/strategies',
    backtesting: '/user/backtesting',
    'live-trades': '/user/live-trades',
    'market-insight': '/user/market-insight',
    'onetape-trade': '/user/onetape-trade',
    billing: '/user/billing',
    profile: '/user/profile',
    settings: '/user/settings',
  };

  return (
    <div className="w-64 bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-lg border-r border-white/20 h-full fixed left-0 top-0 z-50 overflow-y-auto">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white">TradeSetu</h1>
        <p className="text-blue-200 text-sm mt-1">Trading Platform</p>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={routeMap[item.id] || '/dashboard'}
              className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-white border-r-4 border-blue-400'
                  : 'text-blue-200 hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
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
  );
};

export default Sidebar;      