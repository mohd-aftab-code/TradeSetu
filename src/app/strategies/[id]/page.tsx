'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Play, Pause, TrendingUp, BarChart3, Clock, Calendar, Target } from 'lucide-react';
import { Strategy } from '../../../types/database';
import { formatPercentage } from '../../../lib/utils';
import Sidebar from '../../components/Layout/Sidebar';
import { getUserToken, getUserData } from '@/lib/cookies';

const StrategyViewPage = () => {
  const router = useRouter();
  const params = useParams();
  const strategyId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = getUserToken();
    const userData = getUserData();

    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    setUser(userData);
    setIsLoading(false);

    if (strategyId) {
      fetchStrategy();
      fetchStats();
    }
  }, [strategyId, router]);

  const fetchStrategy = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/strategies/${strategyId}`);
      
      if (response.ok) {
        const data = await response.json();
        setStrategy(data.strategy);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch strategy:', errorData);
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

  // Parse risk management JSON if it's a string
  let riskManagement = strategy?.risk_management;
  if (typeof riskManagement === 'string') {
    try {
      riskManagement = JSON.parse(riskManagement);
    } catch (e) {
      riskManagement = { stop_loss: 'N/A', take_profit: 'N/A', position_size: 'N/A' };
    }
  }

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
                    {strategy.details.long_conditions && strategy.details.long_conditions.length > 0 && (
                      <div className="bg-white/5 p-3 rounded-lg">
                        <p className="text-blue-200 text-sm mb-2">
                          Long Entry {strategy.details.long_comparator ? `(${strategy.details.long_comparator})` : ''}:
                        </p>
                        {strategy.details.long_conditions.map((condition: any, index: number) => (
                          <div key={index} className="text-white text-sm">
                            {condition.indicator1} {condition.indicator2 ? 'vs' : ''} {condition.indicator2}
                            {condition.parameters && Object.keys(condition.parameters).length > 0 && (
                              <span className="text-blue-300 ml-2">
                                ({Object.entries(condition.parameters).map(([param, value]: [string, any]) => 
                                  `${param}: ${value}`
                                ).join(', ')})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Short Entry Conditions */}
                    {strategy.details.short_conditions && strategy.details.short_conditions.length > 0 && (
                      <div className="bg-white/5 p-3 rounded-lg">
                        <p className="text-blue-200 text-sm mb-2">
                          Short Entry {strategy.details.short_comparator ? `(${strategy.details.short_comparator})` : ''}:
                        </p>
                        {strategy.details.short_conditions.map((condition: any, index: number) => (
                          <div key={index} className="text-white text-sm">
                            {condition.indicator1} {condition.indicator2 ? 'vs' : ''} {condition.indicator2}
                            {condition.parameters && Object.keys(condition.parameters).length > 0 && (
                              <span className="text-blue-300 ml-2">
                                ({Object.entries(condition.parameters).map(([param, value]: [string, any]) => 
                                  `${param}: ${value}`
                                ).join(', ')})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Fallback if no conditions */}
                    {(!strategy.details.long_conditions || strategy.details.long_conditions.length === 0) && 
                     (!strategy.details.short_conditions || strategy.details.short_conditions.length === 0) && (
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
                        <span className="text-blue-200">Stop Loss:</span> {strategy.details.sl_type} - {strategy.details.sl_value}
                      </div>
                      <div className="text-white text-sm">
                        <span className="text-blue-200">Take Profit:</span> {strategy.details.tp_type} - {strategy.details.tp_value}
                      </div>
                      <div className="text-white text-sm">
                        <span className="text-blue-200">Position Size:</span> {strategy.details.quantity}
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
                      {/* Selected Instrument */}
                      {strategy.details?.selected_instrument_symbol && (
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
                      )}

                      {/* Chart Configuration */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3">Chart Configuration</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <p className="text-blue-200 text-sm mb-1">Chart Type</p>
                            <p className="text-white">{strategy.details?.chart_type || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-blue-200 text-sm mb-1">Time Interval</p>
                            <p className="text-white">{strategy.details?.time_interval || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-blue-200 text-sm mb-1">Transaction Type</p>
                            <p className="text-white">{strategy.details?.transaction_type || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-1">Condition Blocks</p>
                            <p className="text-white">{strategy.details?.condition_blocks || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-blue-200 text-sm mb-1">Logical Operator</p>
                            <p className="text-white">{strategy.details?.logical_operator || 'N/A'}</p>
                      </div>
                        </div>
                      </div>

                      {/* Entry Conditions */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3">Entry Conditions</h4>
                        <div className="space-y-4">
                          {/* Long Conditions */}
                          {strategy.details?.long_conditions && strategy.details.long_conditions.length > 0 && (
                            <div>
                              <p className="text-blue-200 text-sm mb-2">Long Entry Conditions:</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {strategy.details.long_conditions.map((condition: any, index: number) => (
                                  <div key={index} className="bg-white/5 p-3 rounded-lg">
                                    <p className="text-white text-sm">
                                      {condition.indicator1} {strategy.details?.long_comparator} {condition.indicator2}
                                    </p>
                                    {condition.parameters && Object.keys(condition.parameters).length > 0 && (
                                      <div className="mt-2">
                                        <p className="text-blue-200 text-xs mb-1">Parameters:</p>
                                        {Object.entries(condition.parameters).map(([param, value]: [string, any]) => (
                                          <p key={param} className="text-white text-xs">
                                            {param}: {value}
                                          </p>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Short Conditions */}
                          {strategy.details?.short_conditions && strategy.details.short_conditions.length > 0 && (
                            <div>
                              <p className="text-blue-200 text-sm mb-2">Short Entry Conditions:</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {strategy.details.short_conditions.map((condition: any, index: number) => (
                                  <div key={index} className="bg-white/5 p-3 rounded-lg">
                                    <p className="text-white text-sm">
                                      {condition.indicator1} {strategy.details?.short_comparator} {condition.indicator2}
                                    </p>
                                    {condition.parameters && Object.keys(condition.parameters).length > 0 && (
                                      <div className="mt-2">
                                        <p className="text-blue-200 text-xs mb-1">Parameters:</p>
                                        {Object.entries(condition.parameters).map(([param, value]: [string, any]) => (
                                          <p key={param} className="text-white text-xs">
                                            {param}: {value}
                                          </p>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Fallback for legacy data */}
                          {(!strategy.details?.long_conditions || strategy.details.long_conditions.length === 0) && 
                           (!strategy.details?.short_conditions || strategy.details.short_conditions.length === 0) && (
                            <p className="text-gray-400">No entry conditions defined</p>
                          )}
                        </div>
                      </div>

                      {/* Time Configuration */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3">Time Configuration</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <p className="text-blue-200 text-sm mb-1">Start Time</p>
                            <p className="text-white">{strategy.details?.start_time || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-blue-200 text-sm mb-1">Square Off Time</p>
                            <p className="text-white">{strategy.details?.square_off_time || 'N/A'}</p>
                      </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-1">Order Type</p>
                            <p className="text-white">{strategy.details?.order_type || 'N/A'}</p>
                    </div>
                        </div>
                      </div>

                      {/* Strike Configuration */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3">Strike Configuration</h4>
                        <div className="bg-white/5 p-4 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <p className="text-blue-200 text-sm mb-1">Strike Type</p>
                              <p className="text-white font-semibold">{strategy.details?.strike_type || 'N/A'}</p>
                      </div>
                      <div>
                              <p className="text-blue-200 text-sm mb-1">Strike Value</p>
                              <p className="text-white font-semibold">{strategy.details?.strike_value || 'N/A'}</p>
                      </div>
                      <div>
                              <p className="text-blue-200 text-sm mb-1">Custom Price</p>
                              <p className="text-white font-semibold">{strategy.details?.custom_price || 'N/A'}</p>
                      </div>
                          </div>
                        </div>
                      </div>


                      {/* Daily Limits */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3">Daily Limits</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <p className="text-blue-200 text-sm mb-1">Daily Profit Limit</p>
                            <p className="text-white">₹{strategy.details?.daily_profit_limit || 'Not Set'}</p>
                      </div>
                      <div>
                            <p className="text-blue-200 text-sm mb-1">Daily Loss Limit</p>
                            <p className="text-white">₹{strategy.details?.daily_loss_limit || 'Not Set'}</p>
                      </div>
                      <div>
                            <p className="text-blue-200 text-sm mb-1">Max Trade Cycles</p>
                            <p className="text-white">{strategy.details?.max_trade_cycles || 'Not Set'}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm mb-1">No Trade After</p>
                            <p className="text-white">{strategy.details?.no_trade_after || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Selected Indicators for Indicator-based strategies */}
                  {strategy.strategy_type === 'INDICATOR_BASED' && strategy.details?.selected_indicators && (
                    <div className="mt-4">
                      <h4 className="text-lg font-semibold text-white mb-3">Selected Indicators</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(strategy.details.selected_indicators).map(([key, indicator]: [string, any]) => (
                          <div key={key} className="bg-white/5 p-3 rounded-lg">
                            <p className="text-blue-200 text-sm mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                            <p className="text-white font-medium">{indicator?.indicator || 'N/A'}</p>
                            {indicator?.parameters && Object.keys(indicator.parameters).length > 0 && (
                              <div className="mt-2">
                                <p className="text-blue-200 text-xs mb-1">Parameters:</p>
                                {Object.entries(indicator.parameters).map(([param, value]: [string, any]) => (
                                  <p key={param} className="text-white text-xs">
                                    {param}: {value}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
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

                      {/* Risk Management Details */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3">Risk Management Details</h4>
                        <div className="bg-white/5 p-4 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <p className="text-blue-200 text-sm mb-1">SL Type</p>
                              <p className="text-white font-semibold">{strategy.details.sl_type || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-blue-200 text-sm mb-1">SL Value</p>
                              <p className="text-white font-semibold">{strategy.details.sl_value || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-blue-200 text-sm mb-1">SL On</p>
                              <p className="text-white font-semibold">{strategy.details.sl_on_price || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-blue-200 text-sm mb-1">TP Type</p>
                              <p className="text-white font-semibold">{strategy.details.tp_type || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-blue-200 text-sm mb-1">TP Value</p>
                              <p className="text-white font-semibold">{strategy.details.tp_value || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-blue-200 text-sm mb-1">TP On</p>
                              <p className="text-white font-semibold">{strategy.details.tp_on_price || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Additional Risk Management Details */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3">Additional Risk Management</h4>
                        <div className="bg-white/5 p-4 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <p className="text-blue-200 text-sm mb-1">Trailing Stop</p>
                              <p className="text-white">{strategy.details.trailing_stop ? 'Enabled' : 'Disabled'}</p>
                            </div>
                            <div>
                              <p className="text-blue-200 text-sm mb-1">Trailing Stop %</p>
                              <p className="text-white">{strategy.details.trailing_stop_percentage || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-blue-200 text-sm mb-1">Trailing Profit</p>
                              <p className="text-white">{strategy.details.trailing_profit ? 'Enabled' : 'Disabled'}</p>
                            </div>
                            <div>
                              <p className="text-blue-200 text-sm mb-1">Trailing Profit %</p>
                              <p className="text-white">{strategy.details.trailing_profit_percentage || 'N/A'}</p>
                            </div>
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

          {/* Risk Management */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Risk Management</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-blue-200 text-sm mb-1">Stop Loss</p>
                <p className="text-xl font-bold text-white">
                  {strategy.details?.sl_type || 'N/A'} - {strategy.details?.sl_value || 'N/A'}
                </p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-blue-200 text-sm mb-1">Take Profit</p>
                <p className="text-xl font-bold text-white">
                  {strategy.details?.tp_type || 'N/A'} - {strategy.details?.tp_value || 'N/A'}
                </p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-blue-200 text-sm mb-1">Position Size</p>
                <p className="text-xl font-bold text-white">{strategy.details?.position_size || 'N/A'}</p>
              </div>
            </div>

            {/* Additional Risk Management Details */}
            {strategy.details && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-blue-200 text-sm mb-1">Daily Loss Limit</p>
                  <p className="text-white font-semibold">
                    {strategy.details.daily_loss_limit !== null && strategy.details.daily_loss_limit !== undefined 
                      ? `₹${strategy.details.daily_loss_limit}` 
                      : 'N/A'
                    }
                  </p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-blue-200 text-sm mb-1">Daily Profit Limit</p>
                  <p className="text-white font-semibold">
                    {strategy.details.daily_profit_limit !== null && strategy.details.daily_profit_limit !== undefined 
                      ? `₹${strategy.details.daily_profit_limit}` 
                      : 'N/A'
                    }
                  </p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-blue-200 text-sm mb-1">Max Trade Cycles</p>
                  <p className="text-white font-semibold">
                    {strategy.details.max_trade_cycles !== null && strategy.details.max_trade_cycles !== undefined 
                      ? strategy.details.max_trade_cycles 
                      : 'N/A'
                    }
                  </p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-blue-200 text-sm mb-1">No Trade After</p>
                  <p className="text-white font-semibold">
                    {strategy.details.no_trade_after || 'N/A'}
                  </p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-blue-200 text-sm mb-1">Trailing Stop</p>
                  <p className="text-white font-semibold">{strategy.details.trailing_stop ? 'Enabled' : 'Disabled'}</p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-blue-200 text-sm mb-1">Trailing Profit</p>
                  <p className="text-white font-semibold">{strategy.details.trailing_profit ? 'Enabled' : 'Disabled'}</p>
                </div>
              </div>
            )}
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
