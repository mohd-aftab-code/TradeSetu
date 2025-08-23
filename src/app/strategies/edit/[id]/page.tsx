'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Play, Pause } from 'lucide-react';
import { Strategy } from '../../../../types/database';

const StrategyEditPage = () => {
  const router = useRouter();
  const params = useParams();
  const strategyId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    strategy_type: 'INTRADAY' as const,
    symbol: '',
    entry_conditions: '',
    exit_conditions: '',
    risk_management: {
      stop_loss: 0,
      take_profit: 0,
      position_size: 0
    },
    is_active: false,
    is_paper_trading: true
  });

  useEffect(() => {
    if (strategyId) {
      fetchStrategy();
    }
  }, [strategyId]);

  const fetchStrategy = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/strategies/${strategyId}`);
      if (response.ok) {
        const data = await response.json();
        const strategyData = data.strategy;
        setStrategy(strategyData);
        
        // Parse risk_management JSON if it's a string
        let riskManagement = strategyData.risk_management;
        if (typeof riskManagement === 'string') {
          try {
            riskManagement = JSON.parse(riskManagement);
          } catch (e) {
            riskManagement = { stop_loss: 0, take_profit: 0, position_size: 0 };
          }
        }

        setFormData({
          name: strategyData.name || '',
          description: strategyData.description || '',
          strategy_type: strategyData.strategy_type || 'INTRADAY',
          symbol: strategyData.symbol || '',
          entry_conditions: strategyData.entry_conditions || '',
          exit_conditions: strategyData.exit_conditions || '',
          risk_management: riskManagement,
          is_active: strategyData.is_active || false,
          is_paper_trading: strategyData.is_paper_trading || true
        });
      } else {
        console.error('Failed to fetch strategy');
        router.push('/strategies');
      }
    } catch (error) {
      console.error('Error fetching strategy:', error);
      router.push('/strategies');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRiskManagementChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      risk_management: {
        ...prev.risk_management,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!strategy) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/strategies/${strategyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          user_id: strategy.user_id
        }),
      });

      if (response.ok) {
        router.push('/strategies');
      } else {
        console.error('Failed to update strategy');
      }
    } catch (error) {
      console.error('Error updating strategy:', error);
    } finally {
      setSaving(false);
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
          ...formData,
          user_id: strategy.user_id,
          is_active: !formData.is_active
        }),
      });

      if (response.ok) {
        setFormData(prev => ({ ...prev, is_active: !prev.is_active }));
      }
    } catch (error) {
      console.error('Error toggling strategy status:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-white">Loading strategy...</div>
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="p-6">
        <div className="text-white">Strategy not found</div>
      </div>
    );
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
          <h1 className="text-3xl font-bold text-white">Edit Strategy</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleToggleActive}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 ${
              formData.is_active
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
            }`}
          >
            {formData.is_active ? <Pause size={16} /> : <Play size={16} />}
            <span>{formData.is_active ? 'Deactivate' : 'Activate'}</span>
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">
                  Strategy Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter strategy name"
                  required
                />
              </div>

              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your strategy"
                />
              </div>

              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">
                  Strategy Type
                </label>
                <select
                  name="strategy_type"
                  value={formData.strategy_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="INTRADAY">Intraday</option>
                  <option value="SWING">Swing</option>
                  <option value="SCALPING">Scalping</option>
                  <option value="POSITIONAL">Positional</option>
                </select>
              </div>

              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">
                  Symbol
                </label>
                <input
                  type="text"
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., NIFTY50, BANKNIFTY"
                  required
                />
              </div>
            </div>
          </div>

          {/* Trading Conditions */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Trading Conditions</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">
                  Entry Conditions
                </label>
                <textarea
                  name="entry_conditions"
                  value={formData.entry_conditions}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Define entry conditions"
                />
              </div>

              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">
                  Exit Conditions
                </label>
                <textarea
                  name="exit_conditions"
                  value={formData.exit_conditions}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Define exit conditions"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Risk Management */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">Risk Management</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-blue-200 text-sm font-medium mb-2">
                Stop Loss (%)
              </label>
              <input
                type="number"
                value={formData.risk_management.stop_loss}
                onChange={(e) => handleRiskManagementChange('stop_loss', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="2.5"
                step="0.1"
                min="0"
              />
            </div>

            <div>
              <label className="block text-blue-200 text-sm font-medium mb-2">
                Take Profit (%)
              </label>
              <input
                type="number"
                value={formData.risk_management.take_profit}
                onChange={(e) => handleRiskManagementChange('take_profit', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="5.0"
                step="0.1"
                min="0"
              />
            </div>

            <div>
              <label className="block text-blue-200 text-sm font-medium mb-2">
                Position Size (Lots)
              </label>
              <input
                type="number"
                value={formData.risk_management.position_size}
                onChange={(e) => handleRiskManagementChange('position_size', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1"
                step="0.1"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_paper_trading"
                checked={formData.is_paper_trading}
                onChange={(e) => setFormData(prev => ({ ...prev, is_paper_trading: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-white/5 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="is_paper_trading" className="text-blue-200">
                Enable Paper Trading
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-white/5 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="is_active" className="text-blue-200">
                Activate Strategy
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StrategyEditPage;
