'use client'

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Play, Pause, TrendingUp, Eye, RefreshCw } from 'lucide-react';
import { Strategy } from '../../../../types/database';
import { useRouter } from 'next/navigation';
import { formatPercentage } from '../../../../lib/utils';
import { getUserData } from '../../../../lib/cookies';

const StrategyList = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [deploymentStatus, setDeploymentStatus] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [strategyToDelete, setStrategyToDelete] = useState<string>('');
  const router = useRouter();

  // Get user ID from authentication data
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get user data from cookies
    const userData = getUserData();
    console.log('StrategyList useEffect - User data from cookies:', userData);
    if (userData && userData.id) {
      console.log('StrategyList useEffect - User ID found:', userData.id);
      setUserId(userData.id);
      fetchStrategies(userData.id);
    } else {
      console.error('StrategyList useEffect - No user data found or user ID missing');
      // Try with hardcoded user ID for debugging
      const debugUserId = 'tradesetu002';
      console.log('StrategyList useEffect - Using debug user ID:', debugUserId);
      setUserId(debugUserId);
      fetchStrategies(debugUserId);
    }
  }, []);

  const fetchStrategies = async (user_id: string) => {
    try {
      setLoading(true);
      console.log('StrategyList fetchStrategies - Starting fetch for user_id:', user_id);
      const response = await fetch(`/api/strategies?user_id=${user_id}`);
      console.log('StrategyList fetchStrategies - Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('StrategyList fetchStrategies - API Response data:', data);
        console.log('StrategyList fetchStrategies - Strategies array:', data.strategies);
        console.log('StrategyList fetchStrategies - Strategies array length:', data.strategies?.length);
        console.log('StrategyList fetchStrategies - Setting strategies state with:', data.strategies || []);
        setStrategies(data.strategies || []);
        console.log('StrategyList fetchStrategies - State updated, strategies should now be:', data.strategies || []);
      } else {
        const errorData = await response.json();
        console.error('StrategyList fetchStrategies - Failed to fetch strategies:', errorData);
      }
    } catch (error) {
      console.error('StrategyList fetchStrategies - Error fetching strategies:', error);
    } finally {
      console.log('StrategyList fetchStrategies - Setting loading to false');
      setLoading(false);
    }
  };


  const toggleStrategy = async (id: string) => {
    try {
      const strategy = strategies.find(s => s.id === id);
      if (!strategy) return;

      const response = await fetch(`/api/strategies/${id}`, {
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
        setStrategies(strategies.map(s => 
          s.id === id ? { ...s, is_active: !s.is_active } : s
        ));
        setDeploymentStatus(`Strategy ${strategy.is_active ? 'deactivated' : 'activated'} successfully!`);
        setTimeout(() => setDeploymentStatus(''), 3000);
      }
    } catch (error) {
      console.error('Error toggling strategy:', error);
    }
  };

  const handleDeleteStrategy = async () => {
    try {
      console.log('Deleting strategy with ID:', strategyToDelete);
      const response = await fetch(`/api/strategies?id=${strategyToDelete}`, {
        method: 'DELETE',
      });

      console.log('Delete response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Delete response data:', data);
        setStrategies(strategies.filter(s => s.id !== strategyToDelete));
        setShowDeleteModal(false);
        setStrategyToDelete('');
        setDeploymentStatus('Strategy deleted successfully!');
        setTimeout(() => setDeploymentStatus(''), 3000);
      } else {
        const errorData = await response.json();
        console.error('Delete failed:', errorData);
        setDeploymentStatus(`Delete failed: ${errorData.error || 'Unknown error'}`);
        setTimeout(() => setDeploymentStatus(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting strategy:', error);
      setDeploymentStatus(`Delete error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setDeploymentStatus(''), 3000);
    }
  };


  const handleViewStrategy = (id: string) => {
    console.log('View button clicked for strategy ID:', id);
    console.log('Navigating to:', `/strategies/${id}`);
    router.push(`/strategies/${id}`);
  };

  const handleBacktestStrategy = (id: string) => {
    router.push(`/backtesting?strategy_id=${id}`);
  };

  const getStrategyTypeColor = (type: string) => {
    switch (type) {
      case 'SCALPING': return 'text-red-400 bg-red-500/20';
      case 'SWING': return 'text-blue-400 bg-blue-500/20';
      case 'INTRADAY': return 'text-green-400 bg-green-500/20';
      case 'POSITIONAL': return 'text-purple-400 bg-purple-500/20';
      case 'TIME_BASED': return 'text-cyan-400 bg-cyan-500/20';
      case 'INDICATOR_BASED': return 'text-orange-400 bg-orange-500/20';
      case 'PROGRAMMING': return 'text-pink-400 bg-pink-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const handleCreateStrategy = () => {
    router.push('/strategies/create');
  };

  console.log('StrategyList render - loading:', loading);
  console.log('StrategyList render - strategies:', strategies);
  console.log('StrategyList render - strategies length:', strategies.length);
  console.log('StrategyList render - userId:', userId);
  console.log('StrategyList render - strategies type:', typeof strategies);
  console.log('StrategyList render - strategies is array:', Array.isArray(strategies));
  console.log('StrategyList render - strategies content:', JSON.stringify(strategies, null, 2));
  console.log('StrategyList render - strategies[0]:', strategies[0]);
  console.log('StrategyList render - strategies[0]?.name:', strategies[0]?.name);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-white">Loading strategies...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Strategies</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => userId && fetchStrategies(userId)}
            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-200 flex items-center space-x-2"
            title="Refresh Strategies"
            disabled={!userId}
          >
            <RefreshCw size={20} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleCreateStrategy}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Create Strategy</span>
          </button>
        </div>
      </div>

      {deploymentStatus && (
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-green-400">
          {deploymentStatus}
        </div>
      )}

      {strategies.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-white text-xl mb-4">No strategies found</div>
          <div className="text-blue-200 text-sm mb-4">
            Total strategies loaded: {strategies.length}
          </div>
          <div className="text-red-200 text-sm mb-4">
            Debug: strategies array = {JSON.stringify(strategies)}
          </div>
          <div className="text-yellow-200 text-sm mb-4">
            Condition check: strategies.length === 0 = {strategies.length === 0}
          </div>
          <button
            onClick={handleCreateStrategy}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
          >
            Create Your First Strategy
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="text-green-200 text-sm mb-4 col-span-full">
            Debug: Rendering {strategies.length} strategies
          </div>
          {strategies.map((strategy, index) => {
            console.log(`StrategyList render - Mapping strategy ${index}:`, strategy);
            return (
            <div key={strategy.id} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">{strategy.name || 'No Name'}</h3>
                  <p className="text-blue-200 mt-1">{strategy.description || 'No Description'}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href={`/strategies/${strategy.id}`}
                    onClick={(e) => {
                      console.log('View link clicked, strategy:', strategy);
                      console.log('Navigating to:', `/strategies/${strategy.id}`);
                    }}
                    className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all duration-200 inline-block"
                    title="View Strategy"
                  >
                    <Eye size={16} />
                  </a>
                  <button
                    onClick={() => toggleStrategy(strategy.id)}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      strategy.is_active
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                    }`}
                    title={strategy.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {strategy.is_active ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <button 
                    onClick={() => {
                      setStrategyToDelete(strategy.id);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-200"
                    title="Delete Strategy"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStrategyTypeColor(strategy.strategy_type)}`}>
                  {strategy.strategy_type}
                </span>
                <span className="text-blue-200 text-sm">{strategy.symbol}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  strategy.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {strategy.is_active ? 'Active' : 'Inactive'}
                </span>
                {strategy.is_paper_trading && (
                  <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                    Paper Trading
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-blue-200 text-sm">Success Rate</p>
                  <p className="text-lg font-bold text-white">
                    {strategy.success_rate !== null && strategy.success_rate !== undefined 
                      ? formatPercentage(strategy.success_rate) 
                      : strategy.win_rate !== null && strategy.win_rate !== undefined
                      ? formatPercentage(strategy.win_rate)
                      : 'N/A'
                    }
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-blue-200 text-sm">Total Executions</p>
                  <p className="text-lg font-bold text-white">
                    {strategy.total_executions !== null && strategy.total_executions !== undefined 
                      ? strategy.total_executions 
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp size={16} className="text-green-400" />
                  <span className="text-sm text-blue-200">
                    Last executed: {strategy.last_executed ? new Date(strategy.last_executed).toLocaleDateString() : 'Never'}
                  </span>
                </div>
                <button
                  onClick={() => handleBacktestStrategy(strategy.id)}
                  className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm hover:bg-purple-500/30 transition-all duration-200"
                >
                  Backtest
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Delete Strategy</h3>
            <p className="text-blue-200 mb-6">Are you sure you want to delete this strategy? This action cannot be undone.</p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStrategy}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StrategyList;