'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../components/Layout/Sidebar';
import { 
  BarChart3, 
  Calendar, 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Share2, 
  Settings,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  Star,
  Filter,
  Search,
  Grid,
  List,
  Maximize2,
  Minimize2,
  Move,
  GripVertical,
  Zap,
  Brain,
  Rocket,
  Palette,
  Database,
  Globe,
  Shield,
  Layers,
  Cpu,
  PieChart,
  LineChart,
  BarChart2,
  Eye,
  EyeOff,
  RefreshCw,
  FileText,
  Users,
  Award,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  MapPin,
  Tag,
  Hash,
  Percent,
  Hash as HashIcon
} from 'lucide-react';
import { mockStrategies } from '../../data/mockData';

const BacktestingPage = () => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [timeframe, setTimeframe] = useState('1D')
  const [isRunning, setIsRunning] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState('RSI Strategy')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token || !userData) {
      router.push('/auth/login')
      return
    }
    try {
      setUser(JSON.parse(userData))
    } catch (error) {
      router.push('/auth/login')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white text-xl">Loading...</div>;
  }
  if (!user) return null;

  const performanceData = {
    totalReturn: 15.4,
    winRate: 68,
    totalTrades: 156,
    avgWin: 2.3,
    avgLoss: -1.1,
    maxDrawdown: -8.2,
    sharpeRatio: 1.8,
    profitFactor: 2.1,
    maxConsecutiveWins: 8,
    maxConsecutiveLosses: 3
  };

  const tradeHistory = [
    { id: 1, date: '2024-01-15', symbol: 'NIFTY50', action: 'BUY', quantity: 100, price: 18500, pnl: 230, status: 'WIN' },
    { id: 2, date: '2024-01-16', symbol: 'NIFTY50', action: 'SELL', quantity: 100, price: 18730, pnl: -110, status: 'LOSS' },
    { id: 3, date: '2024-01-17', symbol: 'NIFTY50', action: 'BUY', quantity: 100, price: 18620, pnl: 180, status: 'WIN' },
    { id: 4, date: '2024-01-18', symbol: 'NIFTY50', action: 'SELL', quantity: 100, price: 18800, pnl: 320, status: 'WIN' },
    { id: 5, date: '2024-01-19', symbol: 'NIFTY50', action: 'BUY', quantity: 100, price: 18750, pnl: -90, status: 'LOSS' },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-full w-60 bg-black/40 border-r border-white/20 z-20">
        <Sidebar activeTab="backtesting" onTabChange={() => {}} />
      </div>
      {/* Main Content */}
      <main className="ml-60 p-8">
        {/* Header/Card */}
        <div className="bg-[#0d0e3f] rounded-2xl p-8 mb-8 text-white flex flex-col md:flex-row md:items-center md:justify-between shadow">
          <div>
            <h1 className="text-2xl font-bold mb-2">Hello Pravin Yadav,</h1>
            {/* ...other header content... */}
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold">Total P&L</div>
            <div className="text-2xl font-bold">₹ 0.00</div>
          </div>
        </div>
        {/* Strategy Selection & Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="bg-slate-800/60 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Target size={20} className="text-blue-400" />
              <span>Strategy</span>
            </h3>
            <select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value)}
              className="w-full p-3 bg-slate-800/60 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {mockStrategies.map((strategy) => (
                <option key={strategy.id} value={strategy.name}>{strategy.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Calendar size={20} className="text-green-400" />
              <span>Date Range</span>
              <span className="flex items-center space-x-1 bg-green-500/10 px-3 py-1 rounded-lg ml-2 animate-pulse text-green-400 font-semibold text-sm cursor-pointer hover:bg-green-500/20 transition">
                <Play size={18} className="text-green-400" />
                <span>Run Backtesting</span>
              </span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-blue-200 text-sm mb-1">From</label>
                <input
                  type="date"
                  className="w-full p-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm"
                  defaultValue="2024-01-01"
                />
              </div>
              <div>
                <label className="block text-blue-200 text-sm mb-1">To</label>
                <input
                  type="date"
                  className="w-full p-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm"
                  defaultValue="2024-01-31"
                />
              </div>
            </div>
          </div>

          {/* Compare Strategy Card (moved next to Date Range) */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <BarChart3 size={20} className="text-yellow-400" />
              <span>Compare Strategy</span>
            </h3>
            <div className="mb-4">
              <label className="block text-blue-200 text-sm mb-2">Select strategies to compare</label>
              <div className="flex flex-col gap-2">
                {mockStrategies.map((strategy) => (
                  <label key={strategy.id} className="flex items-center gap-2 text-white">
                    <input type="checkbox" className="accent-blue-500" />
                    <span>{strategy.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-blue-200 text-sm text-center">
              Comparison results will appear here.
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 border border-white/20">
            <h3 className="text-base font-semibold text-white mb-3 flex items-center space-x-2">
              <Clock size={18} className="text-purple-400" />
              <span>Timeframe</span>
            </h3>
            <div className="grid grid-cols-3 gap-1">
              {['1 minute', '3 minute', '5 minute', '10 minute', '15 minute', '30 minute', '1 hr'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`p-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
                    timeframe === tf
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
          <div className="flex border-b border-white/20">
            {[
              { id: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
              { id: 'performance', label: 'Performance', icon: <TrendingUp size={16} /> },
              { id: 'trades', label: 'Trades', icon: <Activity size={16} /> },
              { id: 'charts', label: 'Charts', icon: <LineChart size={16} /> },
              { id: 'analysis', label: 'Analysis', icon: <Brain size={16} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-white/5'
                    : 'text-blue-200 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-lg rounded-xl p-4 border border-green-400/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-green-200 text-sm">Total Return</span>
                      <TrendingUpIcon size={16} className="text-green-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">{performanceData.totalReturn}%</div>
                    <div className="text-green-400 text-xs">+2.3% today</div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-lg rounded-xl p-4 border border-blue-400/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-blue-200 text-sm">Win Rate</span>
                      <Target size={16} className="text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">{performanceData.winRate}%</div>
                    <div className="text-blue-400 text-xs">{performanceData.totalTrades} trades</div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-lg rounded-xl p-4 border border-purple-400/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-purple-200 text-sm">Sharpe Ratio</span>
                      <Star size={16} className="text-purple-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">{performanceData.sharpeRatio}</div>
                    <div className="text-purple-400 text-xs">Risk-adjusted</div>
                  </div>

                  <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-lg rounded-xl p-4 border border-red-400/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-red-200 text-sm">Max Drawdown</span>
                      <TrendingDownIcon size={16} className="text-red-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">{performanceData.maxDrawdown}%</div>
                    <div className="text-red-400 text-xs">Peak to trough</div>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-lg rounded-xl p-4 border border-yellow-400/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-yellow-200 text-sm">Profit Factor</span>
                      <DollarSign size={16} className="text-yellow-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">{performanceData.profitFactor}</div>
                    <div className="text-yellow-400 text-xs">Win/Loss ratio</div>
                  </div>
                </div>

                {/* Performance Chart */}
                <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <LineChart size={20} className="text-blue-400" />
                    <span>Performance Over Time</span>
                  </h3>
                  <div className="h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <BarChart3 size={48} className="text-blue-400 mx-auto" />
                      <p className="text-blue-200">Interactive Performance Chart</p>
                      <p className="text-blue-300 text-sm">Chart.js or TradingView integration</p>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                      <Activity size={20} className="text-green-400" />
                      <span>Trading Statistics</span>
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-blue-200">Average Win</span>
                        <span className="text-green-400 font-semibold">+{performanceData.avgWin}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-200">Average Loss</span>
                        <span className="text-red-400 font-semibold">{performanceData.avgLoss}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-200">Max Consecutive Wins</span>
                        <span className="text-green-400 font-semibold">{performanceData.maxConsecutiveWins}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-200">Max Consecutive Losses</span>
                        <span className="text-red-400 font-semibold">{performanceData.maxConsecutiveLosses}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                      <Shield size={20} className="text-purple-400" />
                      <span>Risk Metrics</span>
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-blue-200">Volatility</span>
                        <span className="text-purple-400 font-semibold">12.3%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-200">Beta</span>
                        <span className="text-purple-400 font-semibold">0.85</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-200">Sortino Ratio</span>
                        <span className="text-purple-400 font-semibold">2.1</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-200">Calmar Ratio</span>
                        <span className="text-purple-400 font-semibold">1.9</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Tab */}
            {activeTab === 'performance' && (
              <div className="space-y-6">
                <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-4">Detailed Performance Analysis</h3>
                  <div className="h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <PieChart size={48} className="text-blue-400 mx-auto" />
                      <p className="text-blue-200">Advanced Performance Charts</p>
                      <p className="text-blue-300 text-sm">Monthly returns, drawdown periods, etc.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Trades Tab */}
            {activeTab === 'trades' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Trade History</h3>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300" />
                      <input
                        type="text"
                        placeholder="Search trades..."
                        className="pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all duration-300">
                      <Filter size={16} />
                    </button>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/10">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">Symbol</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">Action</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">Quantity</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">P&L</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {tradeHistory.map((trade) => (
                          <tr key={trade.id} className="hover:bg-white/5 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{trade.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-semibold">{trade.symbol}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                trade.action === 'BUY' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {trade.action}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{trade.quantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">₹{trade.price.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-semibold ${
                                trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {trade.pnl >= 0 ? '+' : ''}₹{trade.pnl}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                trade.status === 'WIN' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {trade.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Charts Tab */}
            {activeTab === 'charts' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                    <h3 className="text-lg font-semibold text-white mb-4">Price Chart with Signals</h3>
                    <div className="h-80 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <LineChart size={48} className="text-blue-400 mx-auto" />
                        <p className="text-blue-200">Interactive Price Chart</p>
                        <p className="text-blue-300 text-sm">With buy/sell signals</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                    <h3 className="text-lg font-semibold text-white mb-4">Equity Curve</h3>
                    <div className="h-80 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-lg flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <TrendingUp size={48} className="text-green-400 mx-auto" />
                        <p className="text-blue-200">Portfolio Value Over Time</p>
                        <p className="text-blue-300 text-sm">With drawdown periods</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-4">Monthly Returns Heatmap</h3>
                  <div className="h-64 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <BarChart2 size={48} className="text-yellow-400 mx-auto" />
                      <p className="text-blue-200">Monthly Performance Heatmap</p>
                      <p className="text-blue-300 text-sm">Color-coded by performance</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Analysis Tab */}
            {activeTab === 'analysis' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                    <h3 className="text-lg font-semibold text-white mb-4">Strategy Analysis</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <span className="text-blue-200">Strategy Complexity</span>
                        <span className="text-green-400 font-semibold">Medium</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <span className="text-blue-200">Market Conditions</span>
                        <span className="text-blue-400 font-semibold">Trending</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <span className="text-blue-200">Risk Level</span>
                        <span className="text-yellow-400 font-semibold">Moderate</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <span className="text-blue-200">Recommended Capital</span>
                        <span className="text-purple-400 font-semibold">₹50,000+</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                    <h3 className="text-lg font-semibold text-white mb-4">Recommendations</h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3 p-3 bg-green-500/10 rounded-lg border border-green-400/20">
                        <CheckCircle size={16} className="text-green-400 mt-0.5" />
                        <div>
                          <p className="text-green-400 font-semibold text-sm">Good Performance</p>
                          <p className="text-green-200 text-xs">Strategy shows consistent positive returns</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-400/20">
                        <AlertTriangle size={16} className="text-yellow-400 mt-0.5" />
                        <div>
                          <p className="text-yellow-400 font-semibold text-sm">Consider Optimization</p>
                          <p className="text-yellow-200 text-xs">Win rate could be improved with parameter tuning</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-3 bg-blue-500/10 rounded-lg border border-blue-400/20">
                        <Brain size={16} className="text-blue-400 mt-0.5" />
                        <div>
                          <p className="text-blue-400 font-semibold text-sm">AI Suggestion</p>
                          <p className="text-blue-200 text-xs">Consider adding stop-loss for better risk management</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BacktestingPage;