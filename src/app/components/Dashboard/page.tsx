'use client'

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Target, DollarSign, Activity, Users, UserCircle2, Info, ArrowLeft, ArrowRight, Plus, Handshake } from 'lucide-react';
import { mockUser, mockStrategies, mockLiveTrades, mockMarketData } from '../../../data/mockData';
import Sidebar from '../Layout/Sidebar';
import { getUserToken } from '@/lib/cookies';

const Dashboard: React.FC = () => {
  // header ke liye state
  const [terminalOn, setTerminalOn] = useState(false);
  const [engineOn, setEngineOn] = useState(false);
  const [showBrokerModal, setShowBrokerModal] = useState(false);
  // Update selectedBroker type to match broker object or null
  const [selectedBroker, setSelectedBroker] = useState<null | { name: string; id: string }>(null);
  // User data state
  const [userName, setUserName] = useState<string>('User');
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  // Market data state
  const [marketData, setMarketData] = useState<any[]>([]);
  const [isLoadingMarketData, setIsLoadingMarketData] = useState(true);
  const [dataSource, setDataSource] = useState<string>('Loading...');
  // Replace brokers array with array of objects
  const brokers = [
    { name: 'Zerodha', id: 'Z12345' },
    { name: 'Upstox', id: 'U67890' },
    { name: 'Angel One', id: 'A11223' },
    { name: 'Fyers', id: 'F44556' },
    { name: 'Alice Blue', id: 'AB7788' },
    { name: '5paisa', id: '5P9911' },
    { name: 'Dhan', id: 'D22334' },
    { name: 'ProStocks', id: 'PS5566' },
    { name: 'Motilal Oswal', id: 'MO7788' },
  ];

  // Add color array for avatars
  const brokerColors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
  ];

  const totalPnL = mockStrategies.reduce((sum, strategy) => sum + strategy.performance_metrics.total_pnl, 0);
  const totalTrades = mockStrategies.reduce((sum, strategy) => sum + strategy.performance_metrics.total_trades, 0);
  const winRate = mockStrategies.reduce((sum, strategy) => sum + (strategy.performance_metrics.winning_trades / strategy.performance_metrics.total_trades), 0) / mockStrategies.length;

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = getUserToken();
        if (!token) {
          setUserName('User');
          setIsLoadingUser(false);
          return;
        }

        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setUserName(data.data.name || 'User');
          } else {
            setUserName('User');
          }
        } else {
          setUserName('User');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUserName('User');
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Fetch real-time market data
  const fetchMarketData = async () => {
    try {
      setIsLoadingMarketData(true);
      const response = await fetch('/api/market-data');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setMarketData(data.data);
          setDataSource(data.source || 'Unknown');
        } else {
          setMarketData(mockMarketData);
          setDataSource('Mock data (fallback)');
        }
      } else {
        setMarketData(mockMarketData);
        setDataSource('Mock data (fallback)');
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
      setMarketData(mockMarketData);
      setDataSource('Mock data (fallback)');
    } finally {
      setIsLoadingMarketData(false);
    }
  };

  useEffect(() => {
    fetchMarketData();

    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchMarketData, 30000);

    return () => clearInterval(interval);
  }, []);

    return (
    <>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #3b82f6, #8b5cf6);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #2563eb, #7c3aed);
        }
      `}</style>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
        <div className="hidden md:block fixed left-0 top-0 h-full z-10">
          <Sidebar activeTab="dashboard" onTabChange={() => {}} />
        </div>
        <div className="flex-1 flex min-w-0 md:ml-64">
          <div className="flex-1 flex flex-col min-w-0">
         
          {/* End Dashboard Header */}
          <main className="flex-1 p-3 lg:p-4 space-y-3 lg:space-y-4 md:ml-0 overflow-x-hidden">
            {/* Header Section - moved above the grid */}
            <div className="bg-gradient-to-br from-slate-800 via-blue-900 to-purple-800 rounded-xl p-3 lg:p-4 mb-3 shadow-lg flex flex-col gap-2 border border-blue-800/60 relative overflow-hidden">
              {/* Shine overlay */}
              <div className="absolute left-0 top-0 w-full h-full pointer-events-none">
                <div className="absolute left-[-40%] top-[-40%] w-[180%] h-[60%] rotate-12 bg-gradient-to-r from-white/10 via-transparent to-transparent opacity-20 blur-md" />
              </div>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-white mb-1">
                    Hello {isLoadingUser ? 'Loading...' : userName},
                  </h2>
                </div>
                <div className="text-right">
                  <span className="text-blue-200 text-sm">Total P&L</span>
                  <div className="text-xl lg:text-2xl font-bold text-blue-100">₹ 0.00</div>
                  {/* Stylish, animated Exit Trade button */}
                  <button
                    onClick={() => alert('Exit Trade clicked!')}
                    className="mt-3 flex items-center gap-2 bg-gradient-to-r from-red-500 via-pink-500 to-yellow-500 text-white px-3 lg:px-4 py-2 rounded-full font-bold shadow-lg transition-all duration-300 focus:outline-none hover:scale-105 hover:shadow-2xl relative overflow-hidden animate-pulse text-sm lg:text-base"
                  >
                    <TrendingDown size={16} className="text-white drop-shadow lg:w-5 lg:h-5" />
                    <span className="tracking-wide">Exit Trade</span>
                    <span className="absolute left-0 top-0 w-full h-full bg-white/10 opacity-0 hover:opacity-20 transition-opacity duration-300 rounded-full" />
                  </button>
                  {/* Active Trades section with real trade info */}
                  <div className="mt-3 flex flex-col items-end w-full">
                    <span className="text-blue-200 text-sm lg:text-base font-semibold mb-1 flex items-center gap-2">
                      <Activity className="text-green-400 animate-pulse" size={16} />
                      Active Trades: {mockLiveTrades.length}
                    </span>
                    <div className="w-full max-w-xs lg:max-w-md flex flex-col gap-1">
                      {mockLiveTrades.length === 0 ? (
                        <span className="text-blue-300 text-xs lg:text-sm italic">No active trades</span>
                      ) : (
                        mockLiveTrades.map((trade, idx) => {
                          // Mock values for strike_price and option_type
                          const strike_price = 21500 + idx * 100;
                          const option_type = idx % 2 === 0 ? 'CE' : 'PE';
                          return (
                            <div key={trade.id} className="flex items-center justify-between bg-white/5 rounded-lg px-2 lg:px-3 py-2 mb-1 shadow-sm">
                              <span className="flex items-center gap-1 lg:gap-2">
                                {trade.side === 'BUY' ? (
                                  <TrendingUp className="text-green-400 animate-bounce" size={14} />
                                ) : (
                                  <TrendingDown className="text-red-400 animate-bounce" size={14} />
                                )}
                                <span className="text-white font-semibold text-xs lg:text-sm">{trade.symbol}</span>
                                <span className="text-blue-200 text-xs">{strike_price} {option_type}</span>
                                <span className={`text-xs font-bold ${trade.side === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>{trade.side}</span>
                                <span className="text-blue-200 text-xs">x{trade.quantity}</span>
                              </span>
                              <span className={`text-xs lg:text-sm font-bold ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>₹{trade.pnl}</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <button
                  className="flex items-center gap-2 bg-[#18184a] px-3 py-1.5 rounded-lg text-purple-300 font-semibold hover:bg-[#23235c] transition text-sm"
                  onClick={() => setShowBrokerModal(true)}
                >
                  <Plus size={14} className="inline" /> Add Broker
                </button>
              </div>
              <hr className="my-2 border-blue-900" />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-blue-200 text-xs">{selectedBroker ? selectedBroker.name : ''}</div>
                  <div className="text-white font-semibold">{selectedBroker ? selectedBroker.id : ''}</div>
                </div>
                <div>
                  <div className="text-blue-200 text-xs">Strategies Performance</div>
                  <div className="text-blue-100 font-semibold">₹ 0.00</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-200 text-xs flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full inline-block"></span>
                    Terminal
                    <Info size={14} className="inline ml-1" />
                  </span>
                  <span className="ml-2 text-white text-sm">Off</span>
                  <label className="mx-2 relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={terminalOn}
                      onChange={() => setTerminalOn((v) => !v)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-red-400 transition"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
                  </label>
                  <span className="text-white text-sm">On</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-200 text-xs flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full inline-block"></span>
                    Trading Engine
                  </span>
                  <span className="ml-2 text-white text-sm">Off</span>
                  <label className="mx-2 relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={engineOn}
                      onChange={() => setEngineOn((v) => !v)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-red-400 transition"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
                  </label>
                  <span className="text-white text-sm">On</span>
                </div>
              </div>
            </div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 lg:p-5 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm">Total P&L</p>
                    <p className="text-2xl font-bold text-white">₹{totalPnL.toLocaleString()}</p>
                  </div>
                  <div className="bg-green-500/20 p-3 rounded-full">
                    <TrendingUp className="text-green-400" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 lg:p-5 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm">Active Strategies</p>
                    <p className="text-xl lg:text-2xl font-bold text-white">{mockStrategies.filter(s => s.is_active).length}</p>
                  </div>
                  <div className="bg-blue-500/20 p-2 lg:p-3 rounded-full">
                    <Target className="text-blue-400" size={20} />
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 lg:p-5 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm">Win Rate</p>
                    <p className="text-xl lg:text-2xl font-bold text-white">{(winRate * 100).toFixed(1)}%</p>
                  </div>
                  <div className="bg-purple-500/20 p-2 lg:p-3 rounded-full">
                    <Activity className="text-purple-400" size={20} />
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 lg:p-5 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm">Balance</p>
                    <p className="text-xl lg:text-2xl font-bold text-white">₹{mockUser.balance.toLocaleString()}</p>
                  </div>
                  <div className="bg-yellow-500/20 p-2 lg:p-3 rounded-full">
                    <DollarSign className="text-yellow-400" size={20} />
                  </div>
                </div>
              </div>
            </div>

            {/* Market Overview */}
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-3 lg:p-4 border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base lg:text-lg font-semibold text-white">Market Overview</h2>
                <div className="flex items-center gap-2">
                  {isLoadingMarketData && (
                    <div className="flex items-center gap-1 text-blue-300 text-sm">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span>Live</span>
                    </div>
                  )}
                  <div className="text-xs text-blue-300 bg-white/5 px-2 py-1 rounded">
                    {dataSource}
                  </div>
                  <button
                    onClick={fetchMarketData}
                    disabled={isLoadingMarketData}
                    className="p-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-300 hover:text-blue-200 transition-colors disabled:opacity-50"
                    title="Refresh market data"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <span className="text-xs text-blue-300 bg-white/5 px-2 py-1 rounded">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:gap-3">
                {isLoadingMarketData ? (
                  // Loading skeleton
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 animate-pulse">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="h-4 bg-white/20 rounded w-16 mb-2"></div>
                          <div className="h-6 bg-white/20 rounded w-20"></div>
                        </div>
                        <div className="text-right">
                          <div className="h-4 bg-white/20 rounded w-12 mb-1"></div>
                          <div className="h-3 bg-white/20 rounded w-16"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  marketData.map((data) => (
                    <div key={data.symbol} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-white">{data.symbol}</h3>
                          <p className="text-2xl font-bold text-white">₹{data.price.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <div className={`flex items-center space-x-1 ${data.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {data.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            <span className="font-semibold">{data.change_percent.toFixed(2)}%</span>
                          </div>
                          <p className="text-sm text-blue-200">₹{data.change.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Strategies */}
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-3 lg:p-4 border border-white/20">
              <h2 className="text-base lg:text-lg font-semibold text-white mb-3">Top Performing Strategies</h2>
              <div className="space-y-3">
                {mockStrategies.map((strategy) => (
                  <div key={strategy.id} className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">{strategy.name}</h3>
                        <p className="text-sm text-blue-200">{strategy.symbol} • {strategy.strategy_type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-400">₹{strategy.performance_metrics.total_pnl.toLocaleString()}</p>
                        <p className="text-sm text-blue-200">
                          {strategy.performance_metrics.winning_trades}/{strategy.performance_metrics.total_trades} wins
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
        
        {/* Real-time Watch Section */}
        <div className="hidden xl:block w-80 bg-gradient-to-b from-slate-800/50 to-blue-900/30 backdrop-blur-lg border-l border-white/20 p-4 shadow-2xl">
          <div className="sticky top-4">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-3 rounded-lg border border-white/10">
              <Activity className="text-green-400 animate-pulse" size={18} />
              Real-time Watch
            </h2>
            
            {/* Watchlist Header */}
            <div className="flex items-center justify-between mb-4 bg-white/5 p-3 rounded-lg border border-white/10">
              <div className="flex items-center gap-2">
                <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:from-purple-600 hover:to-blue-500 transition-all duration-300 shadow-lg">
                  + Add Symbol
                </button>
                <button className="text-blue-300 hover:text-blue-200 text-sm bg-white/10 p-1.5 rounded-lg hover:bg-white/20 transition">
                  <TrendingUp size={16} />
                </button>
              </div>
              <div className="text-xs text-blue-300 bg-white/5 px-2 py-1 rounded">
                {new Date().toLocaleTimeString()}
              </div>
            </div>

            {/* Watchlist Items */}
            <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-2 custom-scrollbar">
              {isLoadingMarketData ? (
                // Loading skeleton for watchlist
                Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="bg-gradient-to-r from-white/10 to-white/5 rounded-lg p-3 border border-white/20 animate-pulse">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-4 bg-white/20 rounded w-16"></div>
                      <div className="h-4 bg-white/20 rounded w-12"></div>
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="h-5 bg-white/20 rounded w-20"></div>
                      <div className="h-4 bg-white/20 rounded w-16"></div>
                    </div>
                    <div className="h-3 bg-white/20 rounded w-16"></div>
                  </div>
                ))
              ) : (
                marketData.map((item, index) => (
                  <div key={index} className="bg-gradient-to-r from-white/10 to-white/5 rounded-lg p-3 border border-white/20 hover:from-white/20 hover:to-white/10 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white text-sm group-hover:text-blue-200 transition">{item.symbol}</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.change >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {item.change >= 0 ? '+' : ''}{item.change_percent.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-bold text-lg">₹{item.price.toLocaleString()}</span>
                      <div className="flex items-center gap-1">
                        {item.change >= 0 ? (
                          <TrendingUp size={14} className="text-green-400" />
                        ) : (
                          <TrendingDown size={14} className="text-red-400" />
                        )}
                        <span className={`text-sm font-semibold ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-blue-300 bg-white/5 px-2 py-1 rounded inline-block">
                      Vol: {(item.volume / 1000000).toFixed(1)}M
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-4 pt-4 border-t border-white/20 bg-white/5 p-3 rounded-lg">
              <h3 className="text-sm font-bold text-blue-200 mb-3 flex items-center gap-2">
                <Target size={16} />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg">
                  Buy NIFTY
                </button>
                <button className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg">
                  Sell NIFTY
                </button>
                <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg">
                  Chart View
                </button>
                <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg">
                  Options
                </button>
              </div>
            </div>

            {/* Market Status */}
            <div className="mt-4 pt-4 border-t border-white/20 bg-white/5 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-blue-200">Market Status</span>
                <div className="flex items-center gap-2 bg-green-500/20 px-2 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-400 font-bold">OPEN</span>
                </div>
              </div>
              <div className="text-xs text-blue-300 bg-white/5 px-2 py-1 rounded">
                Next expiry: 28 Dec 2024
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End Dashboard Layout */}
      {/* Broker Modal */}
      {showBrokerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-blue-100 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 relative overflow-hidden border border-white/20">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full">
                    <Handshake className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Connect Broker</h2>
                    <p className="text-blue-200 text-sm">Choose your preferred trading platform</p>
                  </div>
                </div>
                <button
                  className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all duration-300"
                  onClick={() => setShowBrokerModal(false)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="grid gap-4">
                {brokers.map((broker, idx) => (
                  <div
                    key={broker.name}
                    className="flex items-center justify-between bg-gradient-to-r from-white/10 to-white/5 rounded-xl p-4 border border-white/20 hover:from-white/20 hover:to-white/10 transition-all duration-300 group cursor-pointer shadow-lg hover:shadow-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${brokerColors[idx % brokerColors.length]}`}>
                        {broker.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-blue-200 transition">{broker.name}</div>
                        <div className="text-xs text-blue-300">ID: {broker.id}</div>
                      </div>
                    </div>
                    <button
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:from-purple-600 hover:to-blue-500 transition-all duration-300 transform hover:scale-105"
                      onClick={() => {
                        setSelectedBroker(broker);
                        setShowBrokerModal(false);
                      }}
                    >
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 border-t border-white/10">
              <div className="text-center">
                <p className="text-blue-200 text-sm">
                  Need help? <span className="text-blue-400 hover:text-blue-300 cursor-pointer underline">Contact Support</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default Dashboard;