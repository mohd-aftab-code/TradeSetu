'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Play, Pause, TrendingUp, BarChart3, Clock, Calendar, Target } from 'lucide-react';
import { Strategy } from '../../../../types/database';
import { formatPercentage } from '../../../../lib/utils';
import Sidebar from '../../components/Layout/Sidebar';
import { getUserToken, getUserData } from '@/lib/cookies';

const StrategyViewPage = () => {
  const router = useRouter();
  const params = useParams();
  const strategyId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = getUserToken();
    const userData = getUserData();

    console.log('Strategy detail page - Token:', token);
    console.log('Strategy detail page - User data:', userData);
    console.log('Strategy detail page - Strategy ID:', strategyId);

    // Temporarily disable authentication check for debugging
    // if (!token || !userData) {
    //   console.log('No token or user data found, redirecting to login');
    //   router.push('/auth/login');
    //   return;
    // }
    
    // For debugging - use mock user data if no real data
    if (!token || !userData) {
      console.log('No token or user data found, using mock data for debugging');
      const mockUserData = { id: 'tradesetu002', name: 'Test User' };
      setUser(mockUserData);
      setIsLoading(false);
      
      if (strategyId) {
        console.log('Fetching strategy details for ID:', strategyId);
        fetchStrategy();
        fetchStats();
      }
      return;
    }

    console.log('User authenticated, setting user data');
    setUser(userData);
    setIsLoading(false);

    if (strategyId) {
      console.log('Fetching strategy details for ID:', strategyId);
      fetchStrategy();
      fetchStats();
    }
  }, [strategyId, router]);

  const fetchStrategy = async () => {
    try {
      setLoading(true);
      console.log('Fetching strategy details for ID:', strategyId);
      
      // Get user ID for the API call
      const userData = getUserData();
      const userId = userData?.id || 'tradesetu002'; // Fallback for debugging
      
      const response = await fetch(`/api/strategies?user_id=${userId}`);
      console.log('Strategy detail fetch response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Strategy detail fetch response data:', data);
        console.log('All strategies:', data.strategies);
        
        // Find the specific strategy by ID
        const foundStrategy = data.strategies.find((s: Strategy) => s.id === strategyId);
        console.log('Found strategy:', foundStrategy);
        
        if (foundStrategy) {
          setStrategy(foundStrategy);
        } else {
          console.error('Strategy not found with ID:', strategyId);
          router.push('/strategies');
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch strategies:', errorData);
        router.push('/strategies');
      }
    } catch (error) {
      console.error('Error fetching strategy:', error);
      router.push('/strategies');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      if (strategy?.user_id) {
        const response = await fetch(`/api/strategies/stats?user_id=${strategy.user_id}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.overall_stats);
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleToggleActive = async () => {
    if (!strategy) return;

    try {
      const response = await fetch(`/api/strategies/${strategyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...strategy,
          is_active: !strategy.is_active
        }),
      });

      if (response.ok) {
        setStrategy(prev => prev ? { ...prev, is_active: !prev.is_active } : null);
      }
    } catch (error) {
      console.error('Error toggling strategy status:', error);
    }
  };

  const handleBacktest = () => {
    router.push(`/backtesting?strategy_id=${strategyId}`);
  };

  const getStrategyTypeColor = (type: string) => {
    switch (type) {
      case 'SCALPING': return 'text-red-400 bg-red-500/20';
      case 'SWING': return 'text-blue-400 bg-blue-500/20';
      case 'INTRADAY': return 'text-green-400 bg-green-500/20';
      case 'POSITIONAL': return 'text-purple-400 bg-purple-500/20';
      case 'TIME_BASED': return 'text-orange-400 bg-orange-500/20';
      case 'INDICATOR_BASED': return 'text-cyan-400 bg-cyan-500/20';
      case 'PROGRAMMING': return 'text-pink-400 bg-pink-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  // Parse risk management from new structure
  console.log('Strategy object:', strategy);
  console.log('Strategy risk_management:', strategy?.risk_management);
  console.log('Strategy details:', strategy?.details);
  
  let riskManagement: any = strategy?.risk_management || {};
  if (typeof riskManagement === 'string') {
    try {
      riskManagement = JSON.parse(riskManagement);
    } catch (e) {
      riskManagement = { stop_loss_type: 'N/A', take_profit_type: 'N/A', position_size: 'N/A' };
    }
  }
  
  console.log('Parsed riskManagement:', riskManagement);

  // Early returns for loading states
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
        <div className="fixed left-0 top-0 h-full z-10">
          <Sidebar activeTab="strategies" onTabChange={() => {}} />
        </div>
        <div className="flex-1 flex min-w-0 md:ml-64">
          <main className="flex-1 p-6 space-y-4 md:ml-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/strategies')}
                className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all duration-200"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-2xl font-bold text-white">Loading Strategy</h1>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <div className="text-white">Loading strategy with ID: {strategyId}</div>
              </div>
              <p className="text-white/60 text-center mt-2">
                Please wait while we fetch the strategy details...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  console.log('Strategy detail page render - loading:', loading);
  console.log('Strategy detail page render - strategy:', strategy);
  console.log('Strategy detail page render - strategyId:', strategyId);

  if (!strategy) {
    return (
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
        <div className="fixed left-0 top-0 h-full z-10">
          <Sidebar activeTab="strategies" onTabChange={() => {}} />
        </div>
        <div className="flex-1 flex min-w-0 md:ml-64">
          <main className="flex-1 p-6 space-y-4 md:ml-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/strategies')}
                className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all duration-200"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-2xl font-bold text-white">Strategy Not Found</h1>
            </div>
            
            <div className="bg-red-500/20 backdrop-blur-lg rounded-xl p-6 border border-red-500/30">
              <h2 className="text-xl font-semibold text-red-400 mb-2">Strategy Not Found</h2>
              <div className="text-red-200 text-sm mb-4">
                Debug: strategyId = {strategyId}, strategy = {JSON.stringify(strategy)}
              </div>
              <p className="text-white mb-4">
                The strategy with ID "{strategyId}" could not be found. This could be due to:
              </p>
              <ul className="text-white/80 space-y-1 ml-4">
                <li>• The strategy doesn't exist in the database</li>
                <li>• Database connection issues</li>
                <li>• Invalid strategy ID</li>
              </ul>
              
              <div className="mt-4 space-x-4">
                <button
                  onClick={() => router.push('/strategies')}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-200"
                >
                  Back to Strategies
                </button>
                <button
                  onClick={() => router.push('/debug')}
                  className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-all duration-200"
                >
                  Debug Database
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      <div className="fixed left-0 top-0 h-full z-10">
        <Sidebar activeTab="strategies" onTabChange={() => {}} />
      </div>
      <div className="flex-1 flex min-w-0 md:ml-64">
        <main className="flex-1 p-6 space-y-6 md:ml-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/strategies')}
            className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all duration-200"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold text-white">{strategy.name}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBacktest}
            className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-200 flex items-center space-x-2"
          >
            <BarChart3 size={16} />
            <span>Backtest</span>
          </button>
          <button
            onClick={handleToggleActive}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 ${
              strategy.is_active
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
            }`}
          >
            {strategy.is_active ? <Pause size={16} /> : <Play size={16} />}
            <span>{strategy.is_active ? 'Deactivate' : 'Activate'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Strategy Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Strategy Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-blue-200 text-sm mb-1">Description</p>
                <p className="text-white">{strategy.description || 'No description provided'}</p>
              </div>
              
              <div>
                <p className="text-blue-200 text-sm mb-1">Symbol</p>
                <p className="text-white">{strategy.symbol}</p>
              </div>
              
              <div>
                <p className="text-blue-200 text-sm mb-1">Strategy Type</p>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStrategyTypeColor(strategy.strategy_type)}`}>
                  {strategy.strategy_type}
                </span>
              </div>
              
              <div>
                <p className="text-blue-200 text-sm mb-1">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  strategy.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {strategy.is_active ? 'Active' : 'Inactive'}
                </span>
                {strategy.is_paper_trading && (
                  <span className="ml-2 px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                    Paper Trading
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Trading Conditions */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Trading Conditions</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-blue-200 text-sm mb-2">Entry Conditions</p>
                {strategy.strategy_type === 'INDICATOR_BASED' && strategy.details ? (
                  <div className="space-y-3">
                    {/* Long Entry Conditions */}
                    {strategy.details.condition_blocks && strategy.details.condition_blocks.length > 0 && (
                      <div className="bg-white/5 p-3 rounded-lg">
                        <p className="text-blue-200 text-sm mb-2">
                          Long Entry {strategy.details.condition_blocks[0]?.long_comparator ? `(${strategy.details.condition_blocks[0].long_comparator})` : ''}:
                        </p>
                        {strategy.details.condition_blocks.map((block: any, index: number) => (
                          <div key={index} className="text-white text-sm">
                            {block.long_indicator1} {block.long_indicator2 ? 'vs' : ''} {block.long_indicator2}
                            {block.long_indicator1_params && Object.keys(block.long_indicator1_params).length > 0 && (
                              <span className="text-blue-300 ml-2">
                                ({Object.entries(block.long_indicator1_params).map(([param, value]: [string, any]) => 
                                  `${param}: ${value}`
                                ).join(', ')})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Short Entry Conditions */}
                    {strategy.details.condition_blocks && strategy.details.condition_blocks.length > 0 && (
                      <div className="bg-white/5 p-3 rounded-lg">
                        <p className="text-blue-200 text-sm mb-2">
                          Short Entry {strategy.details.condition_blocks[0]?.short_comparator ? `(${strategy.details.condition_blocks[0].short_comparator})` : ''}:
                        </p>
                        {strategy.details.condition_blocks.map((block: any, index: number) => (
                          <div key={index} className="text-white text-sm">
                            {block.short_indicator1} {block.short_indicator2 ? 'vs' : ''} {block.short_indicator2}
                            {block.short_indicator1_params && Object.keys(block.short_indicator1_params).length > 0 && (
                              <span className="text-blue-300 ml-2">
                                ({Object.entries(block.short_indicator1_params).map(([param, value]: [string, any]) => 
                                  `${param}: ${value}`
                                ).join(', ')})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Fallback if no conditions */}
                    {(!strategy.details.condition_blocks || strategy.details.condition_blocks.length === 0) && (
                      <p className="text-white bg-white/5 p-3 rounded-lg">No entry conditions defined</p>
                    )}
                  </div>
                ) : (
                <p className="text-white bg-white/5 p-3 rounded-lg">
                  {strategy.entry_conditions || 'No entry conditions defined'}
                </p>
                )}
              </div>
              
              <div>
                <p className="text-blue-200 text-sm mb-2">Exit Conditions</p>
                {strategy.strategy_type === 'INDICATOR_BASED' && strategy.details ? (
                  <div className="bg-white/5 p-3 rounded-lg">
                    <div className="space-y-2">
                      <div className="text-white text-sm">
                        <span className="text-blue-200">Stop Loss:</span> {riskManagement?.stop_loss_type || 'N/A'} - {riskManagement?.stop_loss_value || 'N/A'}
                      </div>
                      <div className="text-white text-sm">
                        <span className="text-blue-200">Take Profit:</span> {riskManagement?.take_profit_type || 'N/A'} - {riskManagement?.take_profit_value || 'N/A'}
                      </div>
                      <div className="text-white text-sm">
                        <span className="text-blue-200">Position Size:</span> {riskManagement?.position_size || 'N/A'}
                      </div>
                    </div>
                  </div>
                ) : (
                <p className="text-white bg-white/5 p-3 rounded-lg">
                  {strategy.exit_conditions || 'No exit conditions defined'}
                </p>
                )}
              </div>

              {/* Strategy-specific details */}
              {strategy.details && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Strategy Details</h3>
                  
                  {strategy.strategy_type === 'INDICATOR_BASED' && (
                    <div className="space-y-6">
                      

                    </div>
                  )}

                  {/* Indicator-based Strategy Details */}
                  {strategy.strategy_type === 'INDICATOR_BASED' && (
                    <div className="space-y-6">

                      {/* Select Underlying Section */}
                      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <h4 className="text-lg font-semibold text-white mb-4">Select Underlying</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-blue-200 text-sm mb-2">Symbol</p>
                            <p className="text-white font-medium">{strategy.details?.form_state?.selectedInstrument?.symbol || strategy.symbol || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-2">Asset Type</p>
                            <p className="text-white font-medium">{strategy.details?.form_state?.selectedInstrument?.segment || strategy.asset_type || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-2">Name</p>
                            <p className="text-white font-medium">{strategy.details?.form_state?.selectedInstrument?.name || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-2">Lot Size</p>
                            <p className="text-white font-medium">{strategy.details?.form_state?.selectedInstrument?.lotSize || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Order Configuration Section */}
                      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <h4 className="text-lg font-semibold text-white mb-4">Order Configuration</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-blue-200 text-sm mb-2">Order Type</p>
                            <p className="text-white font-medium">{(strategy as any).config?.order_type || strategy.details?.config?.order_type || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-2">Start Time</p>
                            <p className="text-white font-medium">{(strategy as any).config?.start_time || strategy.details?.config?.start_time || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-2">Square Off Time</p>
                            <p className="text-white font-medium">{(strategy as any).config?.square_off_time || strategy.details?.config?.square_off_time || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Chart Configuration Section */}
                      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <h4 className="text-lg font-semibold text-white mb-4">Chart Configuration</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-blue-200 text-sm mb-2">Transaction Type</p>
                            <p className="text-white font-medium">{strategy.details?.chart_config?.transaction_type || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-2">Chart Type</p>
                            <p className="text-white font-medium">{strategy.details?.chart_config?.chart_type || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-2">Time Interval</p>
                            <p className="text-white font-medium">{strategy.details?.chart_config?.time_interval || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Entry Conditions Section */}
                      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <h4 className="text-lg font-semibold text-white mb-4">Entry Conditions</h4>
                        {strategy.details?.condition_blocks && strategy.details.condition_blocks.length > 0 ? (
                          <div className="space-y-4">
                            {strategy.details.condition_blocks.map((block: any, index: number) => (
                              <div key={index} className="bg-white/5 p-4 rounded-lg">
                                <h5 className="text-white font-medium mb-3">Condition Block {index + 1}</h5>
                                
                                {/* Long Entry Conditions */}
                                {(block.long_indicator1 || block.long_indicator2) && (
                                  <div className="mb-4">
                                    <p className="text-green-200 text-sm mb-2">Long Entry Conditions</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {block.long_indicator1 && (
                                        <div className="bg-green-500/10 p-3 rounded-lg">
                                          <p className="text-green-200 text-xs mb-1">Indicator 1</p>
                                          <p className="text-white text-sm">{block.long_indicator1}</p>
                                          {block.long_indicator1_params && Object.keys(block.long_indicator1_params).length > 0 && (
                              <div className="mt-2">
                                              {Object.entries(block.long_indicator1_params).map(([param, value]: [string, any]) => (
                                  <p key={param} className="text-white text-xs">
                                    {param}: {value}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                                      )}
                                      {block.long_indicator2 && (
                                        <div className="bg-green-500/10 p-3 rounded-lg">
                                          <p className="text-green-200 text-xs mb-1">Indicator 2</p>
                                          <p className="text-white text-sm">{block.long_indicator2}</p>
                                          {block.long_indicator2_params && Object.keys(block.long_indicator2_params).length > 0 && (
                                            <div className="mt-2">
                                              {Object.entries(block.long_indicator2_params).map(([param, value]: [string, any]) => (
                                                <p key={param} className="text-white text-xs">
                                                  {param}: {value}
                                                </p>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    {block.long_comparator && (
                                      <p className="text-green-200 text-sm mt-2">Comparator: {block.long_comparator}</p>
                                    )}
                                  </div>
                                )}

                                {/* Short Entry Conditions */}
                                {(block.short_indicator1 || block.short_indicator2) && (
                                  <div className="mb-4">
                                    <p className="text-red-200 text-sm mb-2">Short Entry Conditions</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {block.short_indicator1 && (
                                        <div className="bg-red-500/10 p-3 rounded-lg">
                                          <p className="text-red-200 text-xs mb-1">Indicator 1</p>
                                          <p className="text-white text-sm">{block.short_indicator1}</p>
                                          {block.short_indicator1_params && Object.keys(block.short_indicator1_params).length > 0 && (
                                            <div className="mt-2">
                                              {Object.entries(block.short_indicator1_params).map(([param, value]: [string, any]) => (
                                                <p key={param} className="text-white text-xs">
                                                  {param}: {value}
                                                </p>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                      {block.short_indicator2 && (
                                        <div className="bg-red-500/10 p-3 rounded-lg">
                                          <p className="text-red-200 text-xs mb-1">Indicator 2</p>
                                          <p className="text-white text-sm">{block.short_indicator2}</p>
                                          {block.short_indicator2_params && Object.keys(block.short_indicator2_params).length > 0 && (
                                            <div className="mt-2">
                                              {Object.entries(block.short_indicator2_params).map(([param, value]: [string, any]) => (
                                                <p key={param} className="text-white text-xs">
                                                  {param}: {value}
                                                </p>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    {block.short_comparator && (
                                      <p className="text-red-200 text-sm mt-2">Comparator: {block.short_comparator}</p>
                                    )}
                                  </div>
                                )}

                                {block.logical_operator && (
                                  <p className="text-blue-200 text-sm">Logical Operator: {block.logical_operator}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                            <p className="text-red-200">No entry conditions found</p>
                          </div>
                        )}
                      </div>

                      {/* Strike Configuration Section */}
                      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <h4 className="text-lg font-semibold text-white mb-4">Strike Configuration</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-blue-200 text-sm mb-2">Strike Type</p>
                            <p className="text-white font-medium">{strategy.details?.strike_config?.strike_type || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-2">Custom Price</p>
                            <p className="text-white font-medium">{strategy.details?.strike_config?.custom_price || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Option Configuration Section */}
                      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <h4 className="text-lg font-semibold text-white mb-4">Option Configuration</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-blue-200 text-sm mb-2">When Long Condition</p>
                            <p className="text-white font-medium">{strategy.details?.option_config?.option_type || 'CE'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-2">When Short Condition</p>
                            <p className="text-white font-medium">{strategy.details?.option_config?.option_type === 'CE' ? 'PE' : 'CE'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-2">Action</p>
                            <p className="text-white font-medium">{strategy.details?.option_config?.action || 'BUY'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-2">Qty</p>
                            <p className="text-white font-medium">{strategy.details?.option_config?.qty || '75'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-2">Expiry</p>
                            <p className="text-white font-medium">{strategy.details?.option_config?.expiry_type || 'Weekly'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-2">Lot Size</p>
                            <p className="text-white font-medium">{strategy.details?.option_config?.lot_size || '1'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Risk Management Section */}
                      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <h4 className="text-lg font-semibold text-white mb-4">Risk Management</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-blue-200 text-sm mb-2">Stop Loss Type</p>
                            <p className="text-white font-medium">{riskManagement?.stop_loss_type || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-2">Stop Loss Value</p>
                            <p className="text-white font-medium">{riskManagement?.stop_loss_value || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-2">Take Profit Type</p>
                            <p className="text-white font-medium">{riskManagement?.take_profit_type || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-2">Take Profit Value</p>
                            <p className="text-white font-medium">{riskManagement?.take_profit_value || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Additional Configuration Section */}
                      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <h4 className="text-lg font-semibold text-white mb-4">Additional Configuration</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-blue-200 text-sm mb-2">Daily Profit Limit</p>
                            <p className="text-white font-medium">{(strategy as any).config?.daily_profit_limit || strategy.details?.config?.daily_profit_limit || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-2">Daily Loss Limit</p>
                            <p className="text-white font-medium">{(strategy as any).config?.daily_loss_limit || strategy.details?.config?.daily_loss_limit || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-2">Max Trade Cycles</p>
                            <p className="text-white font-medium">{(strategy as any).config?.max_trade_cycles || strategy.details?.config?.max_trade_cycles || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-2">No Trade After</p>
                            <p className="text-white font-medium">{(strategy as any).config?.no_trade_after || strategy.details?.config?.no_trade_after || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {strategy.strategy_type === 'TIME_BASED' && (
                    <div className="space-y-6">
                      {/* Selected Instrument */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3">Selected Instrument</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <p className="text-blue-200 text-sm mb-1">Symbol</p>
                            <p className="text-white">{strategy.details.selected_instrument_symbol || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-1">Name</p>
                            <p className="text-white">{strategy.details.selected_instrument_name || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-1">Segment</p>
                            <p className="text-white">{strategy.details.selected_instrument_segment || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-1">Lot Size</p>
                            <p className="text-white">{strategy.details.selected_instrument_lot_size || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Order Configuration */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3">Order Configuration</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <p className="text-blue-200 text-sm mb-1">Order Product Type</p>
                            <p className="text-white">{strategy.details.order_product_type || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-1">Start Time</p>
                            <p className="text-white">{strategy.details.start_time || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-1">Square Off Time</p>
                            <p className="text-white">{strategy.details.square_off_time || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-1">No Trade After</p>
                            <p className="text-white">{strategy.details.no_trade_after || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Working Days */}
                      {strategy.details.working_days && (
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-3">Working Days</h4>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(strategy.details.working_days).map(([day, isActive]: [string, any]) => (
                              <span
                                key={day}
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  isActive
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-gray-500/20 text-gray-400'
                                }`}
                              >
                                {day.charAt(0).toUpperCase() + day.slice(1)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Order Legs */}
                      {strategy.details.order_legs && strategy.details.order_legs.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-3">Order Legs</h4>
                          <div className="space-y-4">
                            {strategy.details.order_legs.map((leg: any, index: number) => (
                              <div key={index} className="bg-white/5 p-4 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                  <h5 className="text-white font-medium">Leg {index + 1}</h5>
                                  <div className="flex space-x-2">
                                    <span className={`px-2 py-1 rounded text-xs ${
                                      leg.action === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                    }`}>
                                      {leg.action?.toUpperCase()}
                                    </span>
                                    <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400">
                                      {leg.optionType?.toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <p className="text-blue-200 text-xs mb-1">Quantity</p>
                                    <p className="text-white">{leg.quantity || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-blue-200 text-xs mb-1">Expiry</p>
                                    <p className="text-white">{leg.expiry || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-blue-200 text-xs mb-1">ATM Point</p>
                                    <p className="text-white">{leg.atmPt || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-blue-200 text-xs mb-1">ATM Value</p>
                                    <p className="text-white">{leg.atm || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-blue-200 text-xs mb-1">SL Type</p>
                                    <p className="text-white">{leg.slType || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-blue-200 text-xs mb-1">SL Value</p>
                                    <p className="text-white">{leg.slValue || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-blue-200 text-xs mb-1">TP Type</p>
                                    <p className="text-white">{leg.tpType || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-blue-200 text-xs mb-1">TP Value</p>
                                    <p className="text-white">{leg.tpValue || 'N/A'}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Trigger Configuration */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3">Trigger Configuration</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <p className="text-blue-200 text-sm mb-1">Trigger Type</p>
                            <p className="text-white">{strategy.details.trigger_type || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-1">Trigger Time</p>
                            <p className="text-white">{strategy.details.trigger_time || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-1">Timezone</p>
                            <p className="text-white">{strategy.details.trigger_timezone || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-1">Recurrence</p>
                            <p className="text-white">{strategy.details.trigger_recurrence || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-1">After Open (min)</p>
                            <p className="text-white">{strategy.details.trigger_after_open_minutes || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-1">Before Close (min)</p>
                            <p className="text-white">{strategy.details.trigger_before_close_minutes || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-1">Candle Interval</p>
                            <p className="text-white">{strategy.details.trigger_candle_interval || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-1">Candle Delay (min)</p>
                            <p className="text-white">{strategy.details.trigger_candle_delay_minutes || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-1">Monthly Day</p>
                            <p className="text-white">{strategy.details.trigger_monthly_day || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-1">Monthly Type</p>
                            <p className="text-white">{strategy.details.trigger_monthly_type || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Order Configuration */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3">Order Configuration</h4>
                        <div className="bg-white/5 p-4 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <p className="text-blue-200 text-sm mb-1">Action</p>
                              <p className="text-white font-semibold">{strategy.details.action_type || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-blue-200 text-sm mb-1">Qty</p>
                              <p className="text-white font-semibold">{strategy.details.quantity || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-blue-200 text-sm mb-1">Expiry</p>
                              <p className="text-white font-semibold">{strategy.details.expiry_type || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-blue-200 text-sm mb-1">Order Type</p>
                              <p className="text-white font-semibold">{strategy.details.order_type || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-blue-200 text-sm mb-1">Transaction Type</p>
                              <p className="text-white font-semibold">{strategy.details.transaction_type || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-blue-200 text-sm mb-1">Order Price</p>
                              <p className="text-white font-semibold">{strategy.details.order_price || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Time Configuration */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3">Time Configuration</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <p className="text-blue-200 text-sm mb-1">Start Time</p>
                            <p className="text-white">{strategy.details.start_time || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-1">Square Off Time</p>
                            <p className="text-white">{strategy.details.square_off_time || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-1">Strategy Start Date</p>
                            <p className="text-white">{strategy.details.strategy_start_date || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-1">Strategy Start Time</p>
                            <p className="text-white">{strategy.details.strategy_start_time || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-1">Validity Date</p>
                            <p className="text-white">{strategy.details.strategy_validity_date || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-1">Deactivate After First Trigger</p>
                            <p className="text-white">{strategy.details.deactivate_after_first_trigger ? 'Yes' : 'No'}</p>
                          </div>
                        </div>
                      </div>


                      {/* Weekly Days Configuration */}
                      {strategy.details.trigger_weekly_days && (
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-3">Weekly Days Configuration</h4>
                          <div className="flex flex-wrap gap-2">
                            {Array.isArray(strategy.details.trigger_weekly_days) ? 
                              strategy.details.trigger_weekly_days.map((day: string) => (
                                <span
                                  key={day}
                                  className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400"
                                >
                                  {day.charAt(0).toUpperCase() + day.slice(1)}
                                </span>
                              )) : 
                              Object.entries(strategy.details.trigger_weekly_days).map(([day, isActive]: [string, any]) => (
                                <span
                                  key={day}
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    isActive
                                      ? 'bg-green-500/20 text-green-400'
                                      : 'bg-gray-500/20 text-gray-400'
                                  }`}
                                >
                                  {day.charAt(0).toUpperCase() + day.slice(1)}
                                </span>
                              ))
                            }
                          </div>
                        </div>
                      )}
                      
                      {/* Working Days */}
                      {strategy.details.working_days && (
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-3">Working Days</h4>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(strategy.details.working_days).map(([day, isActive]: [string, any]) => (
                              <span
                                key={day}
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  isActive
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-gray-500/20 text-gray-400'
                                }`}
                              >
                                {day.charAt(0).toUpperCase() + day.slice(1)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Performance Stats */}
        <div className="space-y-6">
          {/* Performance Metrics */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Performance Metrics</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp size={16} className="text-green-400" />
                  <span className="text-blue-200 text-sm">Success Rate</span>
                </div>
                  <span className="text-white font-semibold">
                    {strategy.success_rate !== null && strategy.success_rate !== undefined 
                      ? formatPercentage(strategy.success_rate) 
                      : strategy.win_rate !== null && strategy.win_rate !== undefined
                      ? formatPercentage(strategy.win_rate)
                      : 'N/A'
                    }
                  </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target size={16} className="text-blue-400" />
                  <span className="text-blue-200 text-sm">Total Executions</span>
                </div>
                  <span className="text-white font-semibold">
                    {strategy.total_executions !== null && strategy.total_executions !== undefined 
                      ? strategy.total_executions 
                      : 'N/A'
                    }
                  </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock size={16} className="text-purple-400" />
                  <span className="text-blue-200 text-sm">Last Executed</span>
                </div>
                <span className="text-white text-sm">
                  {strategy.last_executed ? new Date(strategy.last_executed).toLocaleDateString() : 'Never'}
                </span>
              </div>
            </div>

            {/* Detailed Performance Data */}
            {strategy.performance && (
              <div className="mt-6 pt-6 border-t border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Detailed Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-blue-200 text-sm">Total Trades</span>
                      <span className="text-white font-semibold">{strategy.performance.total_trades || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-200 text-sm">Winning Trades</span>
                      <span className="text-green-400 font-semibold">{strategy.performance.winning_trades || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-200 text-sm">Losing Trades</span>
                      <span className="text-red-400 font-semibold">{strategy.performance.losing_trades || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-200 text-sm">Total P&L</span>
                      <span className={`font-semibold ${(strategy.performance.total_pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ₹{strategy.performance.total_pnl || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-200 text-sm">Win Rate</span>
                      <span className="text-white font-semibold">
                        {strategy.performance.win_rate ? formatPercentage(strategy.performance.win_rate) : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-blue-200 text-sm">Max Drawdown</span>
                      <span className="text-red-400 font-semibold">
                        {strategy.performance.max_drawdown ? `${strategy.performance.max_drawdown}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-200 text-sm">Sharpe Ratio</span>
                      <span className="text-white font-semibold">{strategy.performance.sharpe_ratio || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-200 text-sm">Avg Win</span>
                      <span className="text-green-400 font-semibold">₹{strategy.performance.avg_win || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-200 text-sm">Avg Loss</span>
                      <span className="text-red-400 font-semibold">₹{strategy.performance.avg_loss || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-200 text-sm">Profit Factor</span>
                      <span className="text-white font-semibold">{strategy.performance.profit_factor || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Strategy Info */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Strategy Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-blue-200 text-sm">Created</span>
                <span className="text-white text-sm">
                  {new Date(strategy.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-blue-200 text-sm">Last Updated</span>
                <span className="text-white text-sm">
                  {new Date(strategy.updated_at).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-blue-200 text-sm">Strategy ID</span>
                <span className="text-white text-xs font-mono">{strategy.id}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            
            <div className="space-y-3">
              <button
                onClick={handleBacktest}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <BarChart3 size={16} />
                <span>Run Backtest</span>
              </button>
              
              
              <button
                onClick={handleToggleActive}
                className={`w-full px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                  strategy.is_active
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                }`}
              >
                {strategy.is_active ? <Pause size={16} /> : <Play size={16} />}
                <span>{strategy.is_active ? 'Deactivate' : 'Activate'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      </main>
      </div>
    </div>
  );
};

export default StrategyViewPage;
