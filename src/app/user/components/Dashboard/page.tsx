'use client'

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Target, DollarSign, Activity, Users, UserCircle2, Info, ArrowLeft, ArrowRight, Plus, Handshake } from 'lucide-react';
import Sidebar from '../Layout/Sidebar';
import { getUserToken, getUserData } from '@/lib/cookies';

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
  // Strategy and trade data state
  const [strategies, setStrategies] = useState<any[]>([]);
  const [liveTrades, setLiveTrades] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  // Broker state
  const [brokers, setBrokers] = useState<any[]>([]);
  const [userConnections, setUserConnections] = useState<any[]>([]);
  const [isLoadingBrokers, setIsLoadingBrokers] = useState(true);
  const [connectingBroker, setConnectingBroker] = useState<string | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showApiSetupModal, setShowApiSetupModal] = useState(false);
  const [selectedBrokerForOTP, setSelectedBrokerForOTP] = useState<any>(null);
  const [selectedBrokerForSetup, setSelectedBrokerForSetup] = useState<any>(null);
  const [apiSetupInstructions, setApiSetupInstructions] = useState<any>(null);
  const [isLoadingSetup, setIsLoadingSetup] = useState(false);
  const [accountDetails, setAccountDetails] = useState({
    userId: '',
    password: '',
    apiKey: '',
    apiSecret: ''
  });
  const [otp, setOtp] = useState('');
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);

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

  // Fetch brokers data
  useEffect(() => {
    const fetchBrokers = async () => {
      try {
        setIsLoadingBrokers(true);
        const token = getUserToken();
        const userData = getUserData();
        
        if (!token || !userData) {
          setBrokers([]);
          setUserConnections([]);
          return;
        }

        const response = await fetch(`/api/users/broker/connect?userId=${userData.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setBrokers(data.data.availableBrokers);
            setUserConnections(data.data.userConnections);
          }
        }
      } catch (error) {
        console.error('Error fetching brokers:', error);
      } finally {
        setIsLoadingBrokers(false);
      }
    };

    fetchBrokers();
  }, []);

  // Function to show API setup instructions
  const showApiSetup = async (brokerId: string) => {
    try {
      setIsLoadingSetup(true);
      const broker = brokers.find(b => b.id === brokerId);
      setSelectedBrokerForSetup(broker);
      
      const response = await fetch(`/api/users/broker/connect?brokerId=${brokerId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setApiSetupInstructions(data.data);
          setShowApiSetupModal(true);
        }
      }
    } catch (error) {
      console.error('Error fetching API setup instructions:', error);
      alert('Error loading API setup instructions');
    } finally {
      setIsLoadingSetup(false);
    }
  };

  // Function to connect to broker
  const connectToBroker = async (brokerId: string) => {
    try {
      setConnectingBroker(brokerId);
      const userData = getUserData();
      
      if (!userData) {
        alert('Please login to connect broker');
        return;
      }

      // Show account details modal first
      const broker = brokers.find(b => b.id === brokerId);
      setSelectedBrokerForOTP(broker);
      setShowAccountModal(true);
      setConnectingBroker(null);
    } catch (error) {
      console.error('Error connecting to broker:', error);
      alert('Error connecting to broker');
      setConnectingBroker(null);
    }
  };

  // Function to send OTP after account details
  const sendOTP = async () => {
    try {
      setIsSendingOTP(true);
      const userData = getUserData();
      
      if (!userData || !selectedBrokerForOTP) {
        alert('Please login to connect broker');
        return;
      }

      // Validate account details
      if (!accountDetails.userId || !accountDetails.password) {
        alert('Please enter User ID and Password');
        return;
      }

      // Simulate sending OTP to mobile
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Close account modal and show OTP modal
      setShowAccountModal(false);
      setShowOTPModal(true);
      
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert('Error sending OTP');
    } finally {
      setIsSendingOTP(false);
    }
  };

  // Function to verify OTP and complete connection
  const verifyOTPAndConnect = async () => {
    try {
      setIsVerifyingOTP(true);
      const userData = getUserData();
      
      if (!userData || !selectedBrokerForOTP) {
        alert('Please login to connect broker');
        return;
      }

      if (!otp || otp.length !== 6) {
        alert('Please enter a valid 6-digit OTP');
        return;
      }

             // Verify OTP and connect
       const response = await fetch('/api/users/broker/connect', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           brokerId: selectedBrokerForOTP.id,
           userId: userData.id,
           connectionType: 'otp_verification',
           otp: otp,
           credentials: {
             apiKey: accountDetails.apiKey || `demo_api_key_${selectedBrokerForOTP.id}`,
             apiSecret: accountDetails.apiSecret || `demo_api_secret_${selectedBrokerForOTP.id}`,
             username: accountDetails.userId,
             password: accountDetails.password
           }
         })
       });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
                     alert(`Successfully connected to ${data.connection.broker_name}!`);
           setShowOTPModal(false);
           setOtp('');
           setAccountDetails({ userId: '', password: '', apiKey: '', apiSecret: '' });
           setSelectedBrokerForOTP(null);
          // Refresh broker connections
          window.location.reload();
        } else {
          alert(`Connection failed: ${data.error}`);
        }
      } else {
        alert('Failed to connect to broker');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      alert('Error verifying OTP');
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const totalPnL = strategies.reduce((sum, strategy) => sum + strategy.performance_metrics.total_pnl, 0);
  const totalTrades = strategies.reduce((sum, strategy) => sum + strategy.performance_metrics.total_trades, 0);
  const winRate = strategies.reduce((sum, strategy) => sum + (strategy.performance_metrics.winning_trades / strategy.performance_metrics.total_trades), 0) / strategies.length;

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

        const response = await fetch('/api/auth/profile', {
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
      const response = await fetch('/api/users/market-data');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setMarketData(data.data);
          setDataSource(data.source || 'Unknown');
        } else {
          setMarketData([]); // Clear market data on error
          setDataSource('Error fetching market data');
        }
      } else {
        setMarketData([]); // Clear market data on error
        setDataSource('Error fetching market data');
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
      setMarketData([]); // Clear market data on error
      setDataSource('Error fetching market data');
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
                      Active Trades: {liveTrades.length}
                    </span>
                    <div className="w-full max-w-xs lg:max-w-md flex flex-col gap-1">
                      {liveTrades.length === 0 ? (
                        <span className="text-blue-300 text-xs lg:text-sm italic">No active trades</span>
                      ) : (
                        liveTrades.map((trade, idx) => {
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
                    <p className="text-xl lg:text-2xl font-bold text-white">{strategies.filter(s => s.is_active).length}</p>
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
                    <p className="text-xl lg:text-2xl font-bold text-white">₹{userData?.balance || 0}</p>
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
                {strategies.map((strategy) => (
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
              {isLoadingBrokers ? (
                // Loading skeleton
              <div className="grid gap-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between bg-gradient-to-r from-white/10 to-white/5 rounded-xl p-4 border border-white/20 animate-pulse">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-full"></div>
                        <div>
                          <div className="h-4 bg-white/20 rounded w-24 mb-2"></div>
                          <div className="h-3 bg-white/20 rounded w-16"></div>
                        </div>
                      </div>
                      <div className="h-8 bg-white/20 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* User's Connected Brokers */}
                  {userConnections.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Connected Brokers
                      </h3>
                      <div className="grid gap-3">
                        {userConnections.map((connection) => (
                          <div
                            key={connection.id}
                            className="flex items-center justify-between bg-gradient-to-r from-green-500/10 to-green-600/5 rounded-xl p-4 border border-green-500/20"
                  >
                    <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg overflow-hidden relative">
                                <img 
                                  src={connection.broker_logo || `https://via.placeholder.com/60x60/10b981/ffffff?text=${connection.broker_name[0]}`} 
                                  alt={connection.broker_name}
                                  className="w-full h-full object-contain p-1"
                                  onError={(e) => {
                                    // Fallback to text if image fails to load
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const fallback = target.parentElement?.querySelector('.fallback-text');
                                    if (fallback) {
                                      fallback.classList.remove('hidden');
                                    }
                                  }}
                                />
                                <div className="fallback-text hidden absolute inset-0 flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br from-green-500 to-green-600">
                                  {connection.broker_name[0]}
                                </div>
                              </div>
                              <div>
                                <div className="font-bold text-white">{connection.broker_name}</div>
                                <div className="text-xs text-blue-300">Last sync: {new Date(connection.last_sync).toLocaleString()}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
                                Connected
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Available Brokers */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Available Brokers
                    </h3>
                    <div className="grid gap-3">
                      {brokers.map((broker, idx) => {
                        const isConnected = userConnections.some(conn => conn.broker_id === broker.id);
                        const isConnecting = connectingBroker === broker.id;
                        
                        return (
                          <div
                            key={broker.id}
                            className="flex items-center justify-between bg-gradient-to-r from-white/10 to-white/5 rounded-xl p-4 border border-white/20 hover:from-white/20 hover:to-white/10 transition-all duration-300 group shadow-lg hover:shadow-xl"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 shadow-lg overflow-hidden relative">
                                <img 
                                  src={broker.logo} 
                                  alt={broker.name}
                                  className="w-full h-full object-contain p-1"
                                  onError={(e) => {
                                    // Fallback to text if image fails to load
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const fallback = target.parentElement?.querySelector('.fallback-text');
                                    if (fallback) {
                                      fallback.classList.remove('hidden');
                                    }
                                  }}
                                />
                                <div className="fallback-text hidden absolute inset-0 flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br from-blue-500 to-purple-600">
                        {broker.name[0]}
                                </div>
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-blue-200 transition">{broker.name}</div>
                                <div className="text-xs text-gray-400">{broker.features.join(', ')}</div>
                                <div className="text-xs text-purple-300 font-medium">{broker.apiName}</div>
                      </div>
                    </div>
                                                         <div className="flex items-center gap-2">
                               {isConnected ? (
                                 <div className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
                                   Connected
                                 </div>
                               ) : (
                                 <div className="flex flex-col gap-2">
                    <button
                                     className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-1.5 rounded-full font-semibold shadow-lg hover:from-red-600 hover:to-orange-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                                     onClick={() => showApiSetup(broker.id)}
                                     disabled={isLoadingSetup}
                                   >
                                     {isLoadingSetup ? (
                                       <div className="flex items-center gap-1">
                                         <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                         <span>Loading...</span>
                                       </div>
                                     ) : (
                                       'API Setup'
                                     )}
                                   </button>
                                   <button
                                     className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:from-purple-600 hover:to-blue-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                     onClick={() => connectToBroker(broker.id)}
                                     disabled={isConnecting}
                                   >
                                     {isConnecting ? (
                                       <div className="flex items-center gap-2">
                                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                         <span>Connecting...</span>
                                       </div>
                                     ) : (
                                       'Connect'
                                     )}
                                   </button>
                                 </div>
                               )}
                             </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
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

       {/* Account Details Modal */}
       {showAccountModal && selectedBrokerForOTP && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
           <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-blue-100 rounded-2xl shadow-2xl max-w-md w-full mx-4 relative overflow-hidden border border-white/20">
             {/* Modal Header */}
             <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-6 border-b border-white/10">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full">
                     <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                     </svg>
                   </div>
                   <div>
                     <h2 className="text-xl font-bold text-white">Account Details</h2>
                     <p className="text-blue-200 text-sm">Enter your {selectedBrokerForOTP.name} credentials</p>
                   </div>
                 </div>
                 <button
                   className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all duration-300"
                      onClick={() => {
                     setShowAccountModal(false);
                     setAccountDetails({ userId: '', password: '', apiKey: '', apiSecret: '' });
                     setSelectedBrokerForOTP(null);
                      }}
                    >
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                   </svg>
                    </button>
                  </div>
             </div>

             {/* Modal Content */}
             <div className="p-6">
               <div className="text-center mb-6">
                 <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                   <span className="text-2xl font-bold text-blue-300">{selectedBrokerForOTP.name[0]}</span>
                 </div>
                 <h3 className="text-lg font-semibold text-white mb-2">Connect to {selectedBrokerForOTP.name}</h3>
                 <p className="text-blue-200 text-sm">Enter your trading account credentials</p>
               </div>

               <div className="space-y-4">
                 <div>
                   <label className="block text-blue-200 text-sm font-medium mb-2">User ID / Client ID</label>
                   <input
                     type="text"
                     value={accountDetails.userId}
                     onChange={(e) => setAccountDetails({...accountDetails, userId: e.target.value})}
                     placeholder="Enter your User ID"
                     className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   />
                 </div>

                 <div>
                   <label className="block text-blue-200 text-sm font-medium mb-2">Password</label>
                   <input
                     type="password"
                     value={accountDetails.password}
                     onChange={(e) => setAccountDetails({...accountDetails, password: e.target.value})}
                     placeholder="Enter your password"
                     className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   />
                 </div>

                 <div>
                   <label className="block text-blue-200 text-sm font-medium mb-2">API Key (Optional)</label>
                   <input
                     type="text"
                     value={accountDetails.apiKey}
                     onChange={(e) => setAccountDetails({...accountDetails, apiKey: e.target.value})}
                     placeholder="Enter API Key if available"
                     className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   />
                 </div>

                 <div>
                   <label className="block text-blue-200 text-sm font-medium mb-2">API Secret (Optional)</label>
                   <input
                     type="password"
                     value={accountDetails.apiSecret}
                     onChange={(e) => setAccountDetails({...accountDetails, apiSecret: e.target.value})}
                     placeholder="Enter API Secret if available"
                     className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   />
                 </div>

                 <div className="flex gap-3">
                   <button
                     onClick={() => {
                       setShowAccountModal(false);
                       setAccountDetails({ userId: '', password: '', apiKey: '', apiSecret: '' });
                       setSelectedBrokerForOTP(null);
                     }}
                     className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                   >
                     Cancel
                   </button>
                   <button
                     onClick={sendOTP}
                     disabled={isSendingOTP || !accountDetails.userId || !accountDetails.password}
                     className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {isSendingOTP ? (
                       <div className="flex items-center justify-center gap-2">
                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                         <span>Sending OTP...</span>
                       </div>
                     ) : (
                       'Send OTP'
                     )}
                   </button>
                 </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 border-t border-white/10">
               <div className="text-center">
                 <p className="text-blue-200 text-xs">
                   OTP will be sent to your registered mobile number
                 </p>
               </div>
             </div>
           </div>
         </div>
       )}

       {/* OTP Verification Modal */}
       {showOTPModal && selectedBrokerForOTP && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
           <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-blue-100 rounded-2xl shadow-2xl max-w-md w-full mx-4 relative overflow-hidden border border-white/20">
             {/* Modal Header */}
             <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-6 border-b border-white/10">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-full">
                     <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                     </svg>
                   </div>
                   <div>
                     <h2 className="text-xl font-bold text-white">OTP Verification</h2>
                     <p className="text-blue-200 text-sm">Enter OTP sent to your mobile</p>
                   </div>
                 </div>
                 <button
                   className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all duration-300"
                                        onClick={() => {
                       setShowOTPModal(false);
                       setOtp('');
                       setAccountDetails({ userId: '', password: '', apiKey: '', apiSecret: '' });
                       setSelectedBrokerForOTP(null);
                     }}
                 >
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 </button>
               </div>
             </div>

             {/* Modal Content */}
             <div className="p-6">
               <div className="text-center mb-6">
                 <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                   <span className="text-2xl font-bold text-blue-300">{selectedBrokerForOTP.name[0]}</span>
                 </div>
                 <h3 className="text-lg font-semibold text-white mb-2">Connect to {selectedBrokerForOTP.name}</h3>
                 <p className="text-blue-200 text-sm">We've sent a 6-digit OTP to your registered mobile number</p>
                 <p className="text-blue-300 text-xs mt-1">Account: {accountDetails.userId}</p>
               </div>
 
               <div className="space-y-4">
                 <div>
                   <label className="block text-blue-200 text-sm font-medium mb-2">Enter OTP</label>
                   <input
                     type="text"
                     value={otp}
                     onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                     placeholder="Enter 6-digit OTP"
                     className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     maxLength={6}
                   />
                 </div>

                 <div className="flex items-center justify-between text-sm">
                   <span className="text-blue-300">Didn't receive OTP?</span>
                   <button className="text-blue-400 hover:text-blue-300 underline">Resend OTP</button>
                 </div>

                 <div className="flex gap-3">
                   <button
                     onClick={() => {
                       setShowOTPModal(false);
                       setOtp('');
                       setAccountDetails({ userId: '', password: '', apiKey: '', apiSecret: '' });
                       setSelectedBrokerForOTP(null);
                     }}
                     className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                   >
                     Cancel
                   </button>
                   <button
                     onClick={verifyOTPAndConnect}
                     disabled={isVerifyingOTP || otp.length !== 6}
                     className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {isVerifyingOTP ? (
                       <div className="flex items-center justify-center gap-2">
                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                         <span>Verifying...</span>
                       </div>
                     ) : (
                       'Verify & Connect'
                     )}
                   </button>
                 </div>
               </div>
             </div>

             {/* Modal Footer */}
             <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 border-t border-white/10">
               <div className="text-center">
                 <p className="text-blue-200 text-xs">
                   For security, OTP expires in 5 minutes
                 </p>
               </div>
             </div>
           </div>
         </div>
               )}

        {/* API Setup Modal */}
        {showApiSetupModal && selectedBrokerForSetup && apiSetupInstructions && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-blue-100 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 relative overflow-hidden border border-white/20">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-orange-500 to-red-600 p-3 rounded-full">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">API Setup Guide</h2>
                      <p className="text-blue-200 text-sm">{apiSetupInstructions.brokerName} ({apiSetupInstructions.apiName}) Integration</p>
                    </div>
                  </div>
                  <button
                    className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all duration-300"
                    onClick={() => {
                      setShowApiSetupModal(false);
                      setSelectedBrokerForSetup(null);
                      setApiSetupInstructions(null);
                    }}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-6">
                  {/* Setup URL */}
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 rounded-lg border border-white/20">
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      Setup URL
                    </h3>
                    <a 
                      href={apiSetupInstructions.setupUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline break-all"
                    >
                      {apiSetupInstructions.setupUrl}
                    </a>
                    <p className="text-blue-200 text-sm mt-2">Click to open in new tab</p>
                  </div>

                  {/* Instructions */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Step-by-Step Instructions
                    </h3>
                    <div className="space-y-3">
                      {apiSetupInstructions.instructions.map((instruction: string, index: number) => (
                        <div key={index} className="flex items-start gap-3 bg-white/5 p-3 rounded-lg border border-white/10">
                          <div className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                            {index + 1}
                          </div>
                          <p className="text-blue-100 text-sm leading-relaxed">{instruction}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Required Fields */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      Required Fields
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {apiSetupInstructions.requiredFields.map((field: string) => (
                        <div key={field} className="bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
                          <span className="text-red-400 text-sm font-semibold">{field}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                                     {/* Optional Fields */}
                   {apiSetupInstructions.optionalFields.length > 0 && (
                     <div>
                       <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                         <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                         </svg>
                         Optional Fields
                       </h3>
                       <div className="grid grid-cols-2 gap-2">
                         {apiSetupInstructions.optionalFields.map((field: string) => (
                           <div key={field} className="bg-yellow-500/10 border border-yellow-500/20 px-3 py-2 rounded-lg">
                             <span className="text-yellow-400 text-sm font-semibold">{field}</span>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}

                   {/* Additional Notes */}
                   {apiSetupInstructions.additionalNotes && apiSetupInstructions.additionalNotes.length > 0 && (
                     <div>
                       <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                         <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                         </svg>
                         Important Notes
                       </h3>
                       <div className="space-y-2">
                         {apiSetupInstructions.additionalNotes.map((note: string, index: number) => (
                           <div key={index} className="bg-orange-500/10 border border-orange-500/20 px-3 py-2 rounded-lg">
                             <span className="text-orange-300 text-sm">{note}</span>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 p-4 border-t border-white/10">
                <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-blue-200 text-sm">
                      After setting up API credentials, click "Connect" to proceed
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowApiSetupModal(false);
                      setSelectedBrokerForSetup(null);
                      setApiSetupInstructions(null);
                    }}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-500 transition-all duration-300"
                  >
                    Got it!
                  </button>
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