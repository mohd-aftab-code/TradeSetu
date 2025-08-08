'use client'

import React, { useState } from 'react';
import { Plus, Edit, Trash2, Play, Pause, TrendingUp, Zap, Clock, BarChart3, Copy } from 'lucide-react';
import { mockStrategies } from '../../../../data/mockData';
import { Strategy } from '../../../../types/database';
import { useRouter } from 'next/navigation';

const StrategyList = () => {
  const [strategies, setStrategies] = useState<Strategy[]>(mockStrategies);
  const [deploymentStatus, setDeploymentStatus] = useState<string>('');
  const router = useRouter();

  const toggleStrategy = (id: string) => {
    setStrategies(strategies.map(s => 
      s.id === id ? { ...s, is_active: !s.is_active } : s
    ));
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

  // Function to deploy strategy
  const deployStrategy = (strategyId: string) => {
    setDeploymentStatus(`Deploying strategy ${strategyId}...`);
    // Simulate deployment process
    setTimeout(() => {
      setDeploymentStatus(`Strategy ${strategyId} deployed successfully!`);
      setTimeout(() => setDeploymentStatus(''), 3000);
    }, 2000);
  };

  const handleCreateStrategy = () => {
    router.push('/strategies/create');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Strategies</h1>
        <div className="flex items-center space-x-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {strategies.map((strategy) => (
          <div key={strategy.id} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white">{strategy.name}</h3>
                <p className="text-blue-200 mt-1">{strategy.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleStrategy(strategy.id)}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    strategy.is_active
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                  }`}
                >
                  {strategy.is_active ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all duration-200">
                  <Edit size={16} />
                </button>
                <button className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-200">
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
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-blue-200 text-sm">Total P&L</p>
                <p className="text-lg font-bold text-white">₹{strategy.performance_metrics.total_pnl.toLocaleString()}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-blue-200 text-sm">Win Rate</p>
                <p className="text-lg font-bold text-white">
                  {((strategy.performance_metrics.winning_trades / strategy.performance_metrics.total_trades) * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp size={16} className="text-green-400" />
                <span className="text-sm text-blue-200">
                  {strategy.performance_metrics.total_trades} trades
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-200">Sharpe Ratio</p>
                <p className="text-sm font-semibold text-white">{strategy.performance_metrics.sharpe_ratio}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StrategyList;