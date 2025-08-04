'use client'

import React, { useState } from 'react';
import { Plus, Edit, Trash2, Play, Pause, TrendingUp, Zap, Clock, BarChart3, Copy } from 'lucide-react';
import { mockStrategies } from '../../../../data/mockData';
import { Strategy } from '../../../../types/database';

interface StrategyListProps {
  onCreateStrategy: () => void;
}

const StrategyList: React.FC<StrategyListProps> = ({ onCreateStrategy }) => {
  const [strategies, setStrategies] = useState<Strategy[]>(mockStrategies);
  const [showTimeBasedStrategy, setShowTimeBasedStrategy] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<string>('');

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

  // Function to open Time Based & Indicators strategy page
  const openTimeBasedStrategy = () => {
    setShowTimeBasedStrategy(true);
    setDeploymentStatus('Opening Time Based & Indicators Strategy Builder...');
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

  // Time Based & Indicators Strategy Builder Component
  const TimeBasedStrategyBuilder = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [strategyData, setStrategyData] = useState({
      // Step 1: Basic Strategy Information
      name: '',
      description: '',
      
      // Step 2: Core Signals
      signals: [
        {
          id: 'signal_1',
          name: 'Long_Entry_Signal',
          condition: 'RSI(14) Crosses Above 40',
          indicator: 'RSI',
          parameters: { period: 14, operator: 'Crosses Above', value: 40 }
        }
      ],
      
      // Step 3: Option Position Builder
      legs: [
        {
          id: 'leg_1',
          signalLink: 'Long_Entry_Signal',
          action: 'BUY',
          instrument: 'CE',
          quantity: 1,
          expiry: 'Weekly',
          strikeSelection: 'ATM',
          stopLoss: { value: 50, unit: 'Points' },
          takeProfit: { value: 100, unit: 'Points' },
          prePunchSL: false
        }
      ],
      
      // Step 4: Risk Management
      riskManagement: {
        dailyProfitLimit: 5000,
        dailyLossLimit: 3000,
        maxTradeCycle: 3,
        noTradeAfter: '15:00',
        trailingSettings: {
          enabled: false,
          lockProfit: 1000,
          trailAmount: 500
        },
        reentryRules: {
          enabled: true,
          rule: 'Re-enter on Next Fresh Signal'
        }
      }
    });

      const [newSignal, setNewSignal] = useState({
    name: '',
    indicator: 'RSI',
    condition: 'RSI(14) Crosses Above 40',
    parameters: { period: 14, operator: 'Crosses Above', value: 40 }
  });

    const indicators = {
      'RSI': { parameters: ['period', 'operator', 'value'], operators: ['Crosses Above', 'Crosses Below', 'Greater Than', 'Less Than'] },
      'MACD': { parameters: ['fast', 'slow', 'signal', 'operator'], operators: ['Crosses Above', 'Crosses Below'] },
      'Supertrend': { parameters: ['period', 'multiplier', 'operator'], operators: ['Changes Direction', 'Above', 'Below'] },
      'Moving Average': { parameters: ['period', 'type', 'operator', 'value'], operators: ['Crosses Above', 'Crosses Below', 'Greater Than', 'Less Than'] },
      'Bollinger Bands': { parameters: ['period', 'deviation', 'operator'], operators: ['Price Crosses Upper', 'Price Crosses Lower', 'Squeeze'] },
      'Stochastic': { parameters: ['k_period', 'd_period', 'operator', 'value'], operators: ['Crosses Above', 'Crosses Below', 'Greater Than', 'Less Than'] },
      'VWAP': { parameters: ['operator', 'value'], operators: ['Price Crosses Above', 'Price Crosses Below'] }
    };

      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setStrategyData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setStrategyData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

    const addSignal = () => {
      if (newSignal.name) {
        setStrategyData(prev => ({
          ...prev,
          signals: [...prev.signals, { ...newSignal, id: `signal_${Date.now()}` }]
        }));
        setNewSignal({ name: '', indicator: 'RSI', condition: 'RSI(14) Crosses Above 40', parameters: { period: 14, operator: 'Crosses Above', value: 40 } });
      }
    };

    const addLeg = () => {
      const newLeg = {
        id: `leg_${Date.now()}`,
        signalLink: strategyData.signals[0]?.name || '',
        action: 'BUY',
        instrument: 'CE',
        quantity: 1,
        expiry: 'Weekly',
        strikeSelection: 'ATM',
        stopLoss: { value: 50, unit: 'Points' },
        takeProfit: { value: 100, unit: 'Points' },
        prePunchSL: false
      };
      setStrategyData(prev => ({
        ...prev,
        legs: [...prev.legs, newLeg]
      }));
    };

    const updateLeg = (legId: string, field: string, value: any) => {
      setStrategyData(prev => ({
        ...prev,
        legs: prev.legs.map(leg => 
          leg.id === legId ? { ...leg, [field]: value } : leg
        )
      }));
    };

    const removeLeg = (legId: string) => {
      setStrategyData(prev => ({
        ...prev,
        legs: prev.legs.filter(leg => leg.id !== legId)
      }));
    };

    const duplicateLeg = (legId: string) => {
      const legToDuplicate = strategyData.legs.find(leg => leg.id === legId);
      if (legToDuplicate) {
        const newLeg = { ...legToDuplicate, id: `leg_${Date.now()}` };
        setStrategyData(prev => ({
          ...prev,
          legs: [...prev.legs, newLeg]
        }));
      }
    };

    const handleDeploy = () => {
      setDeploymentStatus('Deploying comprehensive strategy...');
      setTimeout(() => {
        setDeploymentStatus('Strategy deployed successfully! All legs and signals are active.');
        setTimeout(() => {
          setShowTimeBasedStrategy(false);
          setDeploymentStatus('');
        }, 2000);
      }, 3000);
    };

    const renderStepIndicator = () => (
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
              currentStep >= step 
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                : 'bg-white/10 text-blue-200'
            }`}>
              {step}
            </div>
            {step < 5 && (
              <div className={`w-16 h-1 mx-2 ${
                currentStep > step ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-white/10'
              }`} />
            )}
          </div>
        ))}
      </div>
    );

    const renderStep1 = () => (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-white mb-4">Step 1: Basic Strategy Information</h3>
        
        <div>
          <label className="block text-blue-200 text-sm mb-2">Strategy Name *</label>
          <input
            type="text"
            name="name"
            value={strategyData.name}
            onChange={handleInputChange}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="e.g., Nifty Short Straddle Strategy"
          />
        </div>

        <div>
          <label className="block text-blue-200 text-sm mb-2">Description</label>
          <textarea
            name="description"
            value={strategyData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Describe your strategy, trading logic, and any important notes..."
          />
        </div>
      </div>
    );

    const renderStep2 = () => (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-white mb-4">Step 2: Define Core Signals</h3>
        
        {/* Existing Signals */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-blue-200">Current Signals</h4>
          {strategyData.signals.map((signal) => (
            <div key={signal.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-white font-semibold">{signal.name}</h5>
                  <p className="text-blue-200 text-sm">{signal.condition}</p>
                </div>
                <button className="text-red-400 hover:text-red-300">Delete</button>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Signal */}
        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <h4 className="text-lg font-medium text-blue-200 mb-4">Add New Signal</h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-blue-200 text-sm mb-2">Signal Name</label>
              <input
                type="text"
                value={newSignal.name}
                onChange={(e) => setNewSignal(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="e.g., Short_Entry_Signal"
              />
            </div>

            <div>
              <label className="block text-blue-200 text-sm mb-2">Indicator</label>
              <select
                value={newSignal.indicator}
                onChange={(e) => setNewSignal(prev => ({ ...prev, indicator: e.target.value }))}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {Object.keys(indicators).map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-blue-200 text-sm mb-2">Operator</label>
              <select
                value={newSignal.parameters.operator}
                onChange={(e) => setNewSignal(prev => ({ 
                  ...prev, 
                  parameters: { ...prev.parameters, operator: e.target.value }
                }))}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {indicators[newSignal.indicator as keyof typeof indicators]?.operators.map(op => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-blue-200 text-sm mb-2">Period</label>
              <input
                type="number"
                value={newSignal.parameters.period}
                onChange={(e) => setNewSignal(prev => ({ 
                  ...prev, 
                  parameters: { ...prev.parameters, period: parseInt(e.target.value) }
                }))}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="14"
              />
            </div>

            <div>
              <label className="block text-blue-200 text-sm mb-2">Value</label>
              <input
                type="number"
                value={newSignal.parameters.value}
                onChange={(e) => setNewSignal(prev => ({ 
                  ...prev, 
                  parameters: { ...prev.parameters, value: parseInt(e.target.value) }
                }))}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="40"
              />
            </div>
          </div>

          <button
            onClick={addSignal}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
          >
            Add Signal
          </button>
        </div>
      </div>
    );

    const renderStep3 = () => (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Step 3: Option Position Builder</h3>
          <button
            onClick={addLeg}
            className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Add Leg +</span>
          </button>
        </div>

        <div className="space-y-4">
          {strategyData.legs.map((leg, index) => (
            <div key={leg.id} className="bg-white/5 rounded-lg p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">Leg {index + 1}</h4>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => duplicateLeg(leg.id)}
                    className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all duration-200"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={() => removeLeg(leg.id)}
                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-200 text-sm mb-2">Link to Signal *</label>
                  <select
                    value={leg.signalLink}
                    onChange={(e) => updateLeg(leg.id, 'signalLink', e.target.value)}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {strategyData.signals.map(signal => (
                      <option key={signal.id} value={signal.name}>{signal.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-blue-200 text-sm mb-2">Action</label>
                  <div className="flex space-x-2">
                    {['BUY', 'SELL'].map(action => (
                      <button
                        key={action}
                        onClick={() => updateLeg(leg.id, 'action', action)}
                        className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                          leg.action === action
                            ? action === 'BUY' 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-blue-200 text-sm mb-2">Instrument</label>
                  <div className="flex space-x-2">
                    {['CE', 'PE'].map(instrument => (
                      <button
                        key={instrument}
                        onClick={() => updateLeg(leg.id, 'instrument', instrument)}
                        className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                          leg.instrument === instrument
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {instrument}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-blue-200 text-sm mb-2">Quantity</label>
                  <input
                    type="number"
                    value={leg.quantity}
                    onChange={(e) => updateLeg(leg.id, 'quantity', parseInt(e.target.value))}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="1"
                  />
                </div>

                <div>
                  <label className="block text-blue-200 text-sm mb-2">Expiry</label>
                  <select
                    value={leg.expiry}
                    onChange={(e) => updateLeg(leg.id, 'expiry', e.target.value)}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-blue-200 text-sm mb-2">Strike Selection</label>
                  <select
                    value={leg.strikeSelection}
                    onChange={(e) => updateLeg(leg.id, 'strikeSelection', e.target.value)}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="ATM">ATM</option>
                    <option value="ATM+1">ATM+1</option>
                    <option value="ATM-1">ATM-1</option>
                    <option value="OTM 100">OTM 100 points</option>
                    <option value="ITM 100">ITM 100 points</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-blue-200 text-sm mb-2">Stop Loss</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={leg.stopLoss.value}
                      onChange={(e) => updateLeg(leg.id, 'stopLoss', { ...leg.stopLoss, value: parseInt(e.target.value) })}
                      className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                      placeholder="50"
                    />
                    <select
                      value={leg.stopLoss.unit}
                      onChange={(e) => updateLeg(leg.id, 'stopLoss', { ...leg.stopLoss, unit: e.target.value })}
                      className="w-24 p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                    >
                      <option value="Points">Points</option>
                      <option value="%">%</option>
                      <option value="Underlying Points">Underlying</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-blue-200 text-sm mb-2">Take Profit</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={leg.takeProfit.value}
                      onChange={(e) => updateLeg(leg.id, 'takeProfit', { ...leg.takeProfit, value: parseInt(e.target.value) })}
                      className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
                      placeholder="100"
                    />
                    <select
                      value={leg.takeProfit.unit}
                      onChange={(e) => updateLeg(leg.id, 'takeProfit', { ...leg.takeProfit, unit: e.target.value })}
                      className="w-24 p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
                    >
                      <option value="Points">Points</option>
                      <option value="%">%</option>
                      <option value="Underlying Points">Underlying</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center space-x-2 text-blue-200">
                    <input
                      type="checkbox"
                      checked={leg.prePunchSL}
                      onChange={(e) => updateLeg(leg.id, 'prePunchSL', e.target.checked)}
                      className="rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm">Pre-Punch SL</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    const renderStep4 = () => (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-white mb-4">Step 4: Overall Strategy Risk & Trade Management</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Risk Limits */}
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h4 className="text-lg font-semibold text-white mb-4">Daily Risk Limits</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-blue-200 text-sm mb-2">Exit When Over All Profit (INR)</label>
                <input
                  type="number"
                  name="riskManagement.dailyProfitLimit"
                  value={strategyData.riskManagement.dailyProfitLimit}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
                  placeholder="5000"
                />
              </div>

              <div>
                <label className="block text-blue-200 text-sm mb-2">Exit When Over All Loss (INR)</label>
                <input
                  type="number"
                  name="riskManagement.dailyLossLimit"
                  value={strategyData.riskManagement.dailyLossLimit}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                  placeholder="3000"
                />
              </div>
            </div>
          </div>

          {/* Trade Cycle & Timing */}
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h4 className="text-lg font-semibold text-white mb-4">Trade Cycle & Timing</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-blue-200 text-sm mb-2">Max Trade Cycle (per day)</label>
                <input
                  type="number"
                  name="riskManagement.maxTradeCycle"
                  value={strategyData.riskManagement.maxTradeCycle}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="3"
                />
              </div>

              <div>
                <label className="block text-blue-200 text-sm mb-2">No Trade After</label>
                <input
                  type="time"
                  name="riskManagement.noTradeAfter"
                  value={strategyData.riskManagement.noTradeAfter}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Trailing */}
        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <h4 className="text-lg font-semibold text-white mb-4">Advanced Trailing for Overall P/L</h4>
          
          <div className="space-y-4">
            <label className="flex items-center space-x-2 text-blue-200">
              <input
                type="checkbox"
                checked={strategyData.riskManagement.trailingSettings.enabled}
                onChange={(e) => setStrategyData(prev => ({
                  ...prev,
                  riskManagement: {
                    ...prev.riskManagement,
                    trailingSettings: {
                      ...prev.riskManagement.trailingSettings,
                      enabled: e.target.checked
                    }
                  }
                }))}
                className="rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500"
              />
              <span>Enable Lock & Trail</span>
            </label>

            {strategyData.riskManagement.trailingSettings.enabled && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-200 text-sm mb-2">Lock Fix Profit (INR)</label>
                  <input
                    type="number"
                    value={strategyData.riskManagement.trailingSettings.lockProfit}
                    onChange={(e) => setStrategyData(prev => ({
                      ...prev,
                      riskManagement: {
                        ...prev.riskManagement,
                        trailingSettings: {
                          ...prev.riskManagement.trailingSettings,
                          lockProfit: parseInt(e.target.value)
                        }
                      }
                    }))}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
                    placeholder="1000"
                  />
                </div>

                <div>
                  <label className="block text-blue-200 text-sm mb-2">Trail Amount (INR)</label>
                  <input
                    type="number"
                    value={strategyData.riskManagement.trailingSettings.trailAmount}
                    onChange={(e) => setStrategyData(prev => ({
                      ...prev,
                      riskManagement: {
                        ...prev.riskManagement,
                        trailingSettings: {
                          ...prev.riskManagement.trailingSettings,
                          trailAmount: parseInt(e.target.value)
                        }
                      }
                    }))}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
                    placeholder="500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Re-entry Management */}
        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <h4 className="text-lg font-semibold text-white mb-4">Re-entry Management</h4>
          
          <div className="space-y-4">
            <label className="flex items-center space-x-2 text-blue-200">
              <input
                type="checkbox"
                checked={strategyData.riskManagement.reentryRules.enabled}
                onChange={(e) => setStrategyData(prev => ({
                  ...prev,
                  riskManagement: {
                    ...prev.riskManagement,
                    reentryRules: {
                      ...prev.riskManagement.reentryRules,
                      enabled: e.target.checked
                    }
                  }
                }))}
                className="rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500"
              />
              <span>Enable Re-entry Rules</span>
            </label>

            {strategyData.riskManagement.reentryRules.enabled && (
              <div>
                <label className="block text-blue-200 text-sm mb-2">Re-entry Rule</label>
                <select
                  value={strategyData.riskManagement.reentryRules.rule}
                  onChange={(e) => setStrategyData(prev => ({
                    ...prev,
                    riskManagement: {
                      ...prev.riskManagement,
                      reentryRules: {
                        ...prev.riskManagement.reentryRules,
                        rule: e.target.value
                      }
                    }
                  }))}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Re-enter on Next Fresh Signal">Re-enter on Next Fresh Signal</option>
                  <option value="Wait for 5 minutes">Wait for 5 minutes</option>
                  <option value="Wait for 15 minutes">Wait for 15 minutes</option>
                  <option value="No re-entry today">No re-entry today</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>
    );

    const renderStep5 = () => (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-white mb-4">Step 5: Review & Deploy</h3>
        
        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <h4 className="text-lg font-semibold text-white mb-4">Strategy Summary</h4>
          
          <div className="space-y-4 text-blue-200">
            <div>
              <strong className="text-white">Strategy Name:</strong> {strategyData.name || 'Not specified'}
            </div>
            
            {strategyData.description && (
              <div>
                <strong className="text-white">Description:</strong> {strategyData.description}
              </div>
            )}

            <div>
              <strong className="text-white">Signals ({strategyData.signals.length}):</strong>
              <ul className="mt-2 space-y-1">
                {strategyData.signals.map(signal => (
                  <li key={signal.id} className="ml-4">• {signal.name}: {signal.condition}</li>
                ))}
              </ul>
            </div>

            <div>
              <strong className="text-white">Position Legs ({strategyData.legs.length}):</strong>
              <ul className="mt-2 space-y-1">
                {strategyData.legs.map((leg, index) => (
                  <li key={leg.id} className="ml-4">
                    • Leg {index + 1}: {leg.action} {leg.instrument} {leg.quantity} lot(s) at {leg.strikeSelection} 
                    (Triggered by: {leg.signalLink})
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <strong className="text-white">Risk Management:</strong>
              <ul className="mt-2 space-y-1">
                <li className="ml-4">• Daily Profit Limit: ₹{strategyData.riskManagement.dailyProfitLimit}</li>
                <li className="ml-4">• Daily Loss Limit: ₹{strategyData.riskManagement.dailyLossLimit}</li>
                <li className="ml-4">• Max Trades per Day: {strategyData.riskManagement.maxTradeCycle}</li>
                <li className="ml-4">• No Trade After: {strategyData.riskManagement.noTradeAfter}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300"
            >
              Previous
            </button>
            <button
              onClick={handleDeploy}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2"
            >
              <Zap size={16} />
              <span>Deploy Strategy</span>
            </button>
          </div>
          
          {deploymentStatus && (
            <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg text-sm">
              {deploymentStatus}
            </div>
          )}
        </div>
      </div>
    );

    const renderCurrentStep = () => {
      switch (currentStep) {
        case 1: return renderStep1();
        case 2: return renderStep2();
        case 3: return renderStep3();
        case 4: return renderStep4();
        case 5: return renderStep5();
        default: return renderStep1();
      }
    };

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-6">
        <div className="bg-gradient-to-br from-slate-800 to-blue-900 rounded-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
                <BarChart3 size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Advanced Strategy Builder</h2>
                <p className="text-blue-200">Create comprehensive trading strategies with signals and position management</p>
              </div>
            </div>
            <button
              onClick={() => setShowTimeBasedStrategy(false)}
              className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all duration-300"
            >
              ✕
            </button>
          </div>

          {renderStepIndicator()}
          {renderCurrentStep()}

          {/* Navigation */}
          {currentStep < 5 && (
            <div className="mt-8 flex items-center justify-between">
              <div>
                {currentStep > 1 && (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300"
                  >
                    Previous
                  </button>
                )}
              </div>
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Strategies</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={openTimeBasedStrategy}
            className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
          >
            <Clock size={20} />
            <span>Time & Indicators</span>
          </button>
          <button
            onClick={onCreateStrategy}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Create Strategy</span>
          </button>
        </div>
      </div>

      {deploymentStatus && !showTimeBasedStrategy && (
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

      {/* Time Based Strategy Modal */}
      {showTimeBasedStrategy && <TimeBasedStrategyBuilder />}
    </div>
  );
};

export default StrategyList;