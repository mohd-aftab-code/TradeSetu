'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Play, Pause, TrendingUp, BarChart3, Clock, Calendar, Target } from 'lucide-react';
import { Strategy } from '../../../types/database';
import { formatPercentage } from '../../../lib/utils';

const StrategyViewPage = () => {
  const router = useRouter();
  const params = useParams();
  const strategyId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (strategyId) {
      fetchStrategy();
      fetchStats();
    }
  }, [strategyId]);

  const fetchStrategy = async () => {
    try {
      setLoading(true);
      console.log('Fetching strategy with ID:', strategyId);
      const response = await fetch(`/api/strategies/${strategyId}`);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Strategy data received:', data);
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
      const response = await fetch(`/api/strategies/stats?user_id=${strategy?.user_id || 'tradesetu001'}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.overall_stats);
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
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
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
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="p-6 space-y-4">
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
      </div>
    );
  }

  // Parse risk management JSON if it's a string
  let riskManagement = strategy.risk_management;
  if (typeof riskManagement === 'string') {
    try {
      riskManagement = JSON.parse(riskManagement);
    } catch (e) {
      riskManagement = { stop_loss: 0, take_profit: 0, position_size: 0 };
    }
  }

  return (
    <div className="p-6 space-y-6">
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
            onClick={() => router.push(`/strategies/edit/${strategyId}`)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
          >
            <Edit size={16} />
            <span>Edit</span>
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
                <p className="text-white bg-white/5 p-3 rounded-lg">
                  {strategy.entry_conditions || 'No entry conditions defined'}
                </p>
              </div>
              
              <div>
                <p className="text-blue-200 text-sm mb-2">Exit Conditions</p>
                <p className="text-white bg-white/5 p-3 rounded-lg">
                  {strategy.exit_conditions || 'No exit conditions defined'}
                </p>
              </div>
            </div>
          </div>

          {/* Risk Management */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Risk Management</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-blue-200 text-sm mb-1">Stop Loss</p>
                <p className="text-xl font-bold text-white">{riskManagement.stop_loss}%</p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-blue-200 text-sm mb-1">Take Profit</p>
                <p className="text-xl font-bold text-white">{riskManagement.take_profit}%</p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-blue-200 text-sm mb-1">Position Size</p>
                <p className="text-xl font-bold text-white">{riskManagement.position_size} lots</p>
              </div>
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
                <span className="text-white font-semibold">{formatPercentage(strategy.success_rate)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target size={16} className="text-blue-400" />
                  <span className="text-blue-200 text-sm">Total Executions</span>
                </div>
                <span className="text-white font-semibold">{strategy.total_executions || 0}</span>
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
                onClick={() => router.push(`/strategies/edit/${strategyId}`)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Edit size={16} />
                <span>Edit Strategy</span>
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
    </div>
  );
};

export default StrategyViewPage;
