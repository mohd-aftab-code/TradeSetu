import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Save, 
  BarChart3, 
  Code, 
  TrendingUp, 
  Cpu, 
  Zap,
  Target,
  Shield,
  Brain,
  Rocket,
  Palette,
  Database,
  Globe,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Layers,
  BarChart2,
  Activity,
  PieChart,
  LineChart,
  Settings,
  Play,
  Pause,
  RotateCcw,
  X,
  Sun,
  Plus,
  Copy,
  Trash2
} from 'lucide-react';

interface CreateStrategyProps {
  onBack: () => void;
}

const CreateStrategy: React.FC<CreateStrategyProps> = ({ onBack }) => {
  const [strategyCreationType, setStrategyCreationType] = useState<'selection' | 'price-action' | 'programming' | 'time-based'>('selection');
  const [showTimeBasedModal, setShowTimeBasedModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [deploymentStatus, setDeploymentStatus] = useState<string>('');
  
  const [priceActionFormData, setPriceActionFormData] = useState({
    name: '',
    description: '',
    strategy_type: 'INTRADAY',
    symbol: '',
    indicator_type: 'RSI',
    entry_conditions: '',
    exit_conditions: '',
    stop_loss: '',
    take_profit: '',
    position_size: ''
  });

  const [programmingFormData, setProgrammingFormData] = useState({
    name: '',
    description: '',
    strategy_type: 'INTRADAY',
    symbol: '',
    programming_language: 'PYTHON',
    code: '',
    stop_loss: '',
    take_profit: '',
    position_size: ''
  });
  
  const [timeBasedStrategyData, setTimeBasedStrategyData] = useState({
    name: '',
    description: '',
    signals: [
      {
        id: 'signal_1',
        name: 'Long_Entry_Signal',
        condition: 'RSI(14) Crosses Above 40',
        indicator: 'RSI',
        parameters: { period: 14, operator: 'Crosses Above', value: 40 }
      }
    ],
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
    riskManagement: {
      dailyProfitLimit: 5000,
      dailyLossLimit: 3000,
      maxTradeCycle: 5,
      noTradeAfter: '15:00',
      reentryRules: {
        enabled: false,
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

  const handlePriceActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating price action strategy:', priceActionFormData);
    onBack();
  };

  const handleProgrammingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating programming strategy:', programmingFormData);
    onBack();
  };

  const handlePriceActionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setPriceActionFormData({
      ...priceActionFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleProgrammingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProgrammingFormData({
      ...programmingFormData,
      [e.target.name]: e.target.value
    });
  };
  
  const indicators = {
    'RSI': { parameters: ['period', 'operator', 'value'], operators: ['Crosses Above', 'Crosses Below', 'Greater Than', 'Less Than'] },
    'MACD': { parameters: ['fast', 'slow', 'signal', 'operator'], operators: ['Crosses Above', 'Crosses Below'] },
    'Supertrend': { parameters: ['period', 'multiplier', 'operator'], operators: ['Changes Direction', 'Above', 'Below'] },
    'Moving Average': { parameters: ['period', 'type', 'operator', 'value'], operators: ['Crosses Above', 'Crosses Below', 'Greater Than', 'Less Than'] },
    'Bollinger Bands': { parameters: ['period', 'deviation', 'operator'], operators: ['Price Crosses Upper', 'Price Crosses Lower', 'Squeeze'] },
    'Stochastic': { parameters: ['k_period', 'd_period', 'operator', 'value'], operators: ['Crosses Above', 'Crosses Below', 'Greater Than', 'Less Than'] },
    'VWAP': { parameters: ['operator', 'value'], operators: ['Price Crosses Above', 'Price Crosses Below'] }
  };
  
  const handleTimeBasedInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setTimeBasedStrategyData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setTimeBasedStrategyData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addSignal = () => {
    if (newSignal.name) {
      setTimeBasedStrategyData(prev => ({
        ...prev,
        signals: [...prev.signals, { ...newSignal, id: `signal_${Date.now()}` }]
      }));
      setNewSignal({ name: '', indicator: 'RSI', condition: 'RSI(14) Crosses Above 40', parameters: { period: 14, operator: 'Crosses Above', value: 40 } });
    }
  };

  const addLeg = () => {
    const newLeg = {
      id: `leg_${Date.now()}`,
      signalLink: timeBasedStrategyData.signals[0]?.name || '',
      action: 'BUY',
      instrument: 'CE',
      quantity: 1,
      expiry: 'Weekly',
      strikeSelection: 'ATM',
      stopLoss: { value: 50, unit: 'Points' },
      takeProfit: { value: 100, unit: 'Points' },
      prePunchSL: false
    };
    setTimeBasedStrategyData(prev => ({
      ...prev,
      legs: [...prev.legs, newLeg]
    }));
  };

  const updateLeg = (legId: string, field: string, value: any) => {
    setTimeBasedStrategyData(prev => ({
      ...prev,
      legs: prev.legs.map(leg => 
        leg.id === legId ? { ...leg, [field]: value } : leg
      )
    }));
  };

  const removeLeg = (legId: string) => {
    setTimeBasedStrategyData(prev => ({
      ...prev,
      legs: prev.legs.filter(leg => leg.id !== legId)
    }));
  };

  const duplicateLeg = (legId: string) => {
    const legToDuplicate = timeBasedStrategyData.legs.find(leg => leg.id === legId);
    if (legToDuplicate) {
      const newLeg = {
        ...legToDuplicate,
        id: `leg_${Date.now()}`
      };
      setTimeBasedStrategyData(prev => ({
        ...prev,
        legs: [...prev.legs, newLeg]
      }));
    }
  };

  const handleTimeBasedDeploy = () => {
    setDeploymentStatus('Strategy deployed successfully! 🚀');
    setTimeout(() => {
      onBack();
    }, 2000);
  };

  // Strategy Type Selection Screen
  if (strategyCreationType === 'selection') {
    return (
      <div className="p-6 space-y-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 backdrop-blur-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center space-x-3">
              <Sparkles className="text-yellow-400" size={32} />
              <span>Create New Strategy</span>
            </h1>
            <p className="text-blue-200 mt-2">Choose your preferred method to build your trading strategy</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center justify-center space-x-2">
              <Target size={28} className="text-blue-400" />
              <span>Strategy Creation Methods</span>
            </h2>
            <p className="text-blue-300 max-w-2xl mx-auto">
              Select the approach that best fits your trading style and technical expertise
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Time Based & Indicators */}
            <div 
              onClick={() => setStrategyCreationType('time-based')}
              className="group relative overflow-hidden bg-gradient-to-br from-blue-500/20 via-blue-600/20 to-cyan-600/20 backdrop-blur-xl rounded-2xl p-8 border border-blue-400/30 hover:border-blue-300/50 transition-all duration-500 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 text-center space-y-6">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-6 rounded-2xl w-20 h-20 mx-auto flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-lg">
                  <BarChart3 size={36} className="text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-3 flex items-center justify-center space-x-2">
                    <Clock size={28} className="text-blue-300" />
                    <span>Time Based & Indicators</span>
                  </h3>
                  <p className="text-blue-200 text-lg leading-relaxed">
                    Create strategies based on time windows and technical indicators.
                    Perfect for traders who prefer structured, rule-based approaches.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-3 text-blue-300 bg-white/5 rounded-lg p-3">
                    <Clock size={18} className="text-blue-400" />
                    <span>Scheduled Entries & Exits</span>
                  </div>
                  <div className="flex items-center justify-center space-x-3 text-blue-300 bg-white/5 rounded-lg p-3">
                    <BarChart2 size={18} className="text-blue-400" />
                    <span>Multiple Indicators (RSI, MACD, MA)</span>
                  </div>
                  <div className="flex items-center justify-center space-x-3 text-blue-300 bg-white/5 rounded-lg p-3">
                    <Sun size={18} className="text-blue-400" />
                    <span>Session Windows</span>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-2 text-yellow-400">
                  <Zap size={20} />
                  <span className="font-semibold">No-Code Solution</span>
                </div>
              </div>
            </div>

            {/* Programming Language Based */}
            <div 
              onClick={() => setStrategyCreationType('programming')}
              className="group relative overflow-hidden bg-gradient-to-br from-purple-500/20 via-pink-600/20 to-orange-600/20 backdrop-blur-xl rounded-2xl p-8 border border-purple-400/30 hover:border-purple-300/50 transition-all duration-500 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 text-center space-y-6">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-2xl w-20 h-20 mx-auto flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-lg">
                  <Code size={36} className="text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-3 flex items-center justify-center space-x-2">
                    <Rocket size={28} className="text-purple-300" />
                    <span>Programming Languages</span>
                  </h3>
                  <p className="text-blue-200 text-lg leading-relaxed">
                    Write custom algorithms using Python or JavaScript.
                    Ideal for advanced traders and developers who want full control over their strategies.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-3 text-blue-300 bg-white/5 rounded-lg p-3">
                    <Database size={18} className="text-purple-400" />
                    <span>Python & JavaScript Support</span>
                  </div>
                  <div className="flex items-center justify-center space-x-3 text-blue-300 bg-white/5 rounded-lg p-3">
                    <Cpu size={18} className="text-purple-400" />
                    <span>Custom Algorithms</span>
                  </div>
                  <div className="flex items-center justify-center space-x-3 text-blue-300 bg-white/5 rounded-lg p-3">
                    <Activity size={18} className="text-purple-400" />
                    <span>Advanced Backtesting</span>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-2 text-yellow-400">
                  <Zap size={20} />
                  <span className="font-semibold">Code-Based Trading</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Comparison */}
          <div className="mt-12 bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6 text-center flex items-center justify-center space-x-2">
              <Settings size={24} className="text-blue-400" />
              <span>Feature Comparison</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="bg-blue-500/20 p-4 rounded-xl w-16 h-16 mx-auto flex items-center justify-center">
                  <Clock size={24} className="text-blue-400" />
                </div>
                <h4 className="font-semibold text-white">Setup Time</h4>
                <p className="text-blue-300 text-sm">Quick setup with visual tools</p>
              </div>
              <div className="text-center space-y-3">
                <div className="bg-purple-500/20 p-4 rounded-xl w-16 h-16 mx-auto flex items-center justify-center">
                  <Shield size={24} className="text-purple-400" />
                </div>
                <h4 className="font-semibold text-white">Complexity</h4>
                <p className="text-blue-300 text-sm">Advanced customization options</p>
              </div>
              <div className="text-center space-y-3">
                <div className="bg-green-500/20 p-4 rounded-xl w-16 h-16 mx-auto flex items-center justify-center">
                  <DollarSign size={24} className="text-green-400" />
                </div>
                <h4 className="font-semibold text-white">Profit Potential</h4>
                <p className="text-blue-300 text-sm">High returns with proper strategy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Programming Language Based Form
  if (strategyCreationType === 'programming') {
    return (
      <div className="p-6 space-y-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setStrategyCreationType('selection')}
            className="p-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 backdrop-blur-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center space-x-3">
              <Code className="text-purple-400" size={32} />
              <span>Create Programming Strategy</span>
            </h1>
            <p className="text-blue-200 mt-2">Write custom algorithms using Python or JavaScript</p>
          </div>
        </div>

        <form onSubmit={handleProgrammingSubmit} className="max-w-6xl space-y-8">
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-2xl p-8 border border-purple-400/20 space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
              <Target size={28} className="text-purple-400" />
              <span>Basic Information</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-blue-200 text-sm font-semibold flex items-center space-x-2">
                  <Palette size={16} />
                  <span>Strategy Name</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={programmingFormData.name}
                  onChange={handleProgrammingChange}
                  className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all duration-300"
                  placeholder="Enter strategy name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-blue-200 text-sm font-semibold flex items-center space-x-2">
                  <Activity size={16} />
                  <span>Strategy Type</span>
                </label>
                <select
                  name="strategy_type"
                  value={programmingFormData.strategy_type}
                  onChange={handleProgrammingChange}
                  className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all duration-300"
                >
                  <option value="INTRADAY">Intraday</option>
                  <option value="SWING">Swing</option>
                  <option value="SCALPING">Scalping</option>
                  <option value="POSITIONAL">Positional</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-blue-200 text-sm font-semibold flex items-center space-x-2">
                <Globe size={16} />
                <span>Description</span>
              </label>
              <textarea
                name="description"
                value={programmingFormData.description}
                onChange={handleProgrammingChange}
                rows={3}
                className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all duration-300"
                placeholder="Describe your strategy"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-blue-200 text-sm font-semibold flex items-center space-x-2">
                  <TrendingUp size={16} />
                  <span>Symbol</span>
                </label>
                <input
                  type="text"
                  name="symbol"
                  value={programmingFormData.symbol}
                  onChange={handleProgrammingChange}
                  className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all duration-300"
                  placeholder="e.g., NIFTY, BANKNIFTY"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-blue-200 text-sm font-semibold flex items-center space-x-2">
                  <Code size={16} />
                  <span>Programming Language</span>
                </label>
                <select
                  name="programming_language"
                  value={programmingFormData.programming_language}
                  onChange={handleProgrammingChange}
                  className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all duration-300"
                >
                  <option value="PYTHON">Python</option>
                  <option value="JAVASCRIPT">JavaScript</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl rounded-2xl p-8 border border-blue-400/20 space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
              <Code size={28} className="text-blue-400" />
              <span>Strategy Code</span>
            </h2>
            
            <div className="space-y-2">
              <label className="block text-blue-200 text-sm font-semibold flex items-center space-x-2">
                <Database size={16} />
                <span>Algorithm Code</span>
              </label>
              <textarea
                name="code"
                value={programmingFormData.code}
                onChange={handleProgrammingChange}
                rows={15}
                className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-300 font-mono text-sm"
                placeholder={programmingFormData.programming_language === 'PYTHON'
                  ? `# Example Python Strategy
import pandas as pd
import numpy as np

def calculateRSI(data, period=14):
    delta = data['close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

def strategy(data):
    # Example: Buy when RSI < 30, Sell when RSI > 70
    
    const rsi = calculateRSI(data, 14);
    const currentPrice = data.close[data.close.length - 1];
    
    if (rsi[rsi.length - 1] < 30) {
        return {action: 'BUY', price: currentPrice};
    } else if (rsi[rsi.length - 1] > 70) {
        return {action: 'SELL', price: currentPrice};
    } else {
        return {action: 'HOLD', price: currentPrice};
    }
}`
                  : `// Example JavaScript Strategy
function calculateRSI(data, period = 14) {
    const delta = data.close.map((price, i) => i > 0 ? price - data.close[i-1] : 0);
    const gains = delta.map(d => d > 0 ? d : 0);
    const losses = delta.map(d => d < 0 ? -d : 0);
    
    const avgGain = gains.slice(-period).reduce((a, b) => a + b) / period;
    const avgLoss = losses.slice(-period).reduce((a, b) => a + b) / period;
    
    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    return rsi;
}

function strategy(data) {
    // Example: Buy when RSI < 30, Sell when RSI > 70
    
    const rsi = calculateRSI(data, 14);
    const currentPrice = data.close[data.close.length - 1];
    
    if (rsi < 30) {
        return {action: 'BUY', price: currentPrice};
    } else if (rsi > 70) {
        return {action: 'SELL', price: currentPrice};
    } else {
        return {action: 'HOLD', price: currentPrice};
    }
}`}
                required
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 backdrop-blur-xl rounded-2xl p-8 border border-red-400/20 space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
              <Shield size={28} className="text-red-400" />
              <span>Risk Management</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-blue-200 text-sm font-semibold flex items-center space-x-2">
                  <AlertTriangle size={16} />
                  <span>Stop Loss (%)</span>
                </label>
                <input
                  type="number"
                  name="stop_loss"
                  value={programmingFormData.stop_loss}
                  onChange={handleProgrammingChange}
                  step="0.1"
                  className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-400 transition-all duration-300"
                  placeholder="2.0"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-blue-200 text-sm font-semibold flex items-center space-x-2">
                  <TrendingUp size={16} />
                  <span>Take Profit (%)</span>
                </label>
                <input
                  type="number"
                  name="take_profit"
                  value={programmingFormData.take_profit}
                  onChange={handleProgrammingChange}
                  step="0.1"
                  className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-400 transition-all duration-300"
                  placeholder="5.0"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-blue-200 text-sm font-semibold flex items-center space-x-2">
                  <DollarSign size={16} />
                  <span>Position Size</span>
                </label>
                <input
                  type="number"
                  name="position_size"
                  value={programmingFormData.position_size}
                  onChange={handleProgrammingChange}
                  className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-400 transition-all duration-300"
                  placeholder="100"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <button
              type="submit"
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-10 py-4 rounded-xl font-bold hover:from-purple-600 hover:to-pink-700 transition-all duration-300 flex items-center space-x-3 hover:scale-105 shadow-lg"
            >
              <Save size={24} />
              <span>Create Programming Strategy</span>
            </button>
            <button
              type="button"
              onClick={() => setStrategyCreationType('selection')}
              className="bg-white/10 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 flex items-center space-x-2"
            >
              <RotateCcw size={20} />
              <span>Back</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Default return for invalid strategy type
  return null;
};

export default CreateStrategy; 