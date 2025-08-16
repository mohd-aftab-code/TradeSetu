'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, BarChart3, Code, TrendingUp, Cpu, Zap, Target, Shield, Brain, Rocket, Palette, Database, Globe, Clock, DollarSign, AlertTriangle, CheckCircle, Sparkles, Layers, BarChart2, Activity, PieChart, LineChart, Settings, Play, Pause, RotateCcw, X, Sun, Plus, Copy, Trash2 } from 'lucide-react';
import Sidebar from '../../components/Layout/Sidebar';
import { getUserToken, getUserData } from '@/lib/cookies';

const CreateStrategyPage = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [strategyCreationType, setStrategyCreationType] = useState<'selection' | 'time-indicator' | 'programming' | 'time-based' | 'indicator-based'>('selection');
  const [strategySubType, setStrategySubType] = useState<'time-based' | 'indicator-based' | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [deploymentStatus, setDeploymentStatus] = useState<string>('');
  const router = useRouter();
  
  const [timeIndicatorFormData, setTimeIndicatorFormData] = useState({
    name: '',
    description: '',
    strategy_type: 'INTRADAY',
    asset_type: 'STOCK',
    symbol: '',
    indicator_type: 'RSI',
    entry_conditions: '',
    exit_conditions: '',
    stop_loss: '',
    take_profit: '',
    position_size: '',
    // New fields for comprehensive algo trading
    order_type: 'MARKET',
    lot_size: 1,
    entry_time: '09:20',
    exit_time: '15:30',
    re_entry_condition: 'NEXT_SIGNAL',
    wait_and_trade: false,
    premium_difference: 0,
    // Options trading fields
    is_options_strategy: false,
    option_type: 'CE',
    strike_selection: 'ATM',
    expiry_type: 'WEEKLY',
    // Risk management
    daily_loss_limit: 5000,
    daily_profit_limit: 10000,
    max_trade_cycles: 3,
    trailing_stop: false,
    trailing_stop_percentage: 1.5,
    trailing_profit: false,
    trailing_profit_percentage: 2.0,
    // Strategy scheduling and watch updates
    strategy_start_date: '',
    strategy_start_time: '09:15',
    start_time: '',
    square_off_time: '',
    working_days: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    transaction_type: 'Both Side',
    chart_type: 'Candle',
    interval: '5 Min',
    is_active: false,
    last_updated: new Date().toISOString(),
    // Legs for options strategies
    legs: []
  });

  // Instrument search state
  const [instrumentSearch, setInstrumentSearch] = useState<{
    searchQuery: string;
    isSearching: boolean;
    selectedInstrument: any;
    searchResults: any[];
  }>({
    searchQuery: '',
    isSearching: false,
    selectedInstrument: null,
    searchResults: [] as any[]
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
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleTimeIndicatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating time & indicator strategy:', timeIndicatorFormData);
    router.back();
  };

  const handleProgrammingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating programming strategy:', programmingFormData);
    router.back();
  };

  const handleTimeIndicatorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setTimeIndicatorFormData({
      ...timeIndicatorFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleProgrammingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProgrammingFormData({
      ...programmingFormData,
      [e.target.name]: e.target.value
    });
  };

  // Mock instrument data for search
  const mockInstruments = [
    { symbol: 'NIFTY 50', name: 'NIFTY 50', segment: 'INDEX', lotSize: 50, change: '+2.45%', price: 19500 },
    { symbol: 'BANKNIFTY', name: 'BANK NIFTY', segment: 'INDEX', lotSize: 25, change: '+1.85%', price: 44500 },
    { symbol: 'RELIANCE', name: 'Reliance Industries', segment: 'STOCK', lotSize: 250, change: '+0.95%', price: 2450 },
    { symbol: 'TCS', name: 'Tata Consultancy Services', segment: 'STOCK', lotSize: 100, change: '+1.25%', price: 3850 },
    { symbol: 'INFY', name: 'Infosys Limited', segment: 'STOCK', lotSize: 100, change: '+0.75%', price: 1450 },
    { symbol: 'HDFC', name: 'HDFC Bank', segment: 'STOCK', lotSize: 250, change: '+1.15%', price: 1650 },
    { symbol: 'ITC', name: 'ITC Limited', segment: 'STOCK', lotSize: 100, change: '+0.65%', price: 450 },
    { symbol: 'SBIN', name: 'State Bank of India', segment: 'STOCK', lotSize: 1500, change: '+1.35%', price: 650 },
    { symbol: 'AXIS', name: 'Axis Bank', segment: 'STOCK', lotSize: 250, change: '+0.85%', price: 950 },
    { symbol: 'ICICIBANK', name: 'ICICI Bank', segment: 'STOCK', lotSize: 250, change: '+1.05%', price: 950 },
    { symbol: 'FINNIFTY', name: 'FINANCIAL NIFTY', segment: 'INDEX', lotSize: 40, change: '+1.95%', price: 20500 },
    { symbol: 'MIDCPNIFTY', name: 'MIDCAP NIFTY', segment: 'INDEX', lotSize: 75, change: '+2.15%', price: 12500 }
  ];

  // Handle instrument search
  const handleInstrumentSearch = (query: string) => {
    setInstrumentSearch(prev => ({
      ...prev,
      searchQuery: query,
      isSearching: query.length > 0
    }));

    if (query.length > 0) {
      const filtered = mockInstruments.filter(instrument =>
        instrument.symbol.toLowerCase().includes(query.toLowerCase()) ||
        instrument.name.toLowerCase().includes(query.toLowerCase()) ||
        instrument.segment.toLowerCase().includes(query.toLowerCase())
      );
      setInstrumentSearch(prev => ({
        ...prev,
        searchResults: filtered
      }));
    } else {
      setInstrumentSearch(prev => ({
        ...prev,
        searchResults: []
      }));
    }
  };

  // Handle instrument selection
  const handleInstrumentSelect = (instrument: any) => {
    setInstrumentSearch(prev => ({
      ...prev,
      selectedInstrument: instrument,
      searchQuery: instrument.symbol,
      isSearching: false,
      searchResults: []
    }));
    
    // Update form data with selected instrument
    setTimeIndicatorFormData(prev => ({
      ...prev,
      symbol: instrument.symbol,
      asset_type: instrument.segment
    }));
  };

  // Handle instrument removal
  const handleInstrumentRemove = () => {
    setInstrumentSearch(prev => ({
      ...prev,
      selectedInstrument: null,
      searchQuery: '',
      searchResults: []
    }));
    
    // Clear form data
    setTimeIndicatorFormData(prev => ({
      ...prev,
      symbol: '',
      asset_type: 'STOCK'
    }));
  };

  const renderStrategyTypeSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Create New Strategy</h2>
        <p className="text-blue-200">Choose your strategy creation method</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Time & Indicator Based Strategy */}
        <div className="group relative bg-gradient-to-br from-green-500/20 via-blue-600/20 to-purple-600/20 backdrop-blur-xl rounded-2xl p-8 border border-green-500/30 hover:border-green-400/50 transition-all duration-700 cursor-pointer transform hover:scale-105 hover:rotate-1 hover:shadow-2xl hover:shadow-green-500/25" onClick={() => setStrategyCreationType('time-indicator')}>
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-2xl animate-pulse"></div>
          
          {/* Glowing border effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-6 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-green-500 to-blue-600 p-5 rounded-2xl shadow-2xl transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                  <Clock size={32} className="text-white drop-shadow-2xl" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-green-300 transition-colors duration-300">Time & Indicator Based</h3>
                <p className="text-blue-200 text-sm">Create strategies with time-based signals</p>
              </div>
            </div>
            
            <div className="space-y-3 text-blue-200 text-sm">
              <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform duration-300">
                <div className="relative">
                  <CheckCircle size={18} className="text-green-400 animate-ping" />
                  <CheckCircle size={18} className="text-green-400 absolute inset-0" />
                </div>
                <span className="font-medium">Time-based Triggers</span>
              </div>
              <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform duration-300" style={{ transitionDelay: '0.1s' }}>
                <div className="relative">
                  <CheckCircle size={18} className="text-green-400 animate-ping" style={{ animationDelay: '0.2s' }} />
                  <CheckCircle size={18} className="text-green-400 absolute inset-0" />
                </div>
                <span className="font-medium">Technical Indicators</span>
              </div>
              <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform duration-300" style={{ transitionDelay: '0.2s' }}>
                <div className="relative">
                  <CheckCircle size={18} className="text-green-400 animate-ping" style={{ animationDelay: '0.4s' }} />
                  <CheckCircle size={18} className="text-green-400 absolute inset-0" />
                </div>
                <span className="font-medium">Risk Management</span>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-green-500/30 to-blue-500/30 rounded-xl border border-green-400/40 backdrop-blur-sm">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-300 font-semibold">Advanced</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-blue-300 font-semibold">Popular</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Programming Strategy */}
        <div className="group relative bg-gradient-to-br from-purple-500/20 via-pink-600/20 to-indigo-600/20 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-700 cursor-pointer transform hover:scale-105 hover:-rotate-1 hover:shadow-2xl hover:shadow-purple-500/25" onClick={() => setStrategyCreationType('programming')}>
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl animate-pulse"></div>
          
          {/* Glowing border effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-6 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-purple-500 to-pink-600 p-5 rounded-2xl shadow-2xl transform group-hover:-rotate-12 group-hover:scale-110 transition-all duration-500">
                  <Code size={32} className="text-white drop-shadow-2xl" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors duration-300">Programming Strategy</h3>
                <p className="text-blue-200 text-sm">Write custom algorithms in Python</p>
              </div>
            </div>
            
            <div className="space-y-3 text-blue-200 text-sm">
              <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform duration-300">
                <div className="relative">
                  <CheckCircle size={18} className="text-purple-400 animate-ping" />
                  <CheckCircle size={18} className="text-purple-400 absolute inset-0" />
                </div>
                <span className="font-medium">Custom Python Code</span>
              </div>
              <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform duration-300" style={{ transitionDelay: '0.1s' }}>
                <div className="relative">
                  <CheckCircle size={18} className="text-purple-400 animate-ping" style={{ animationDelay: '0.2s' }} />
                  <CheckCircle size={18} className="text-purple-400 absolute inset-0" />
                </div>
                <span className="font-medium">Advanced Algorithms</span>
              </div>
              <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform duration-300" style={{ transitionDelay: '0.2s' }}>
                <div className="relative">
                  <CheckCircle size={18} className="text-purple-400 animate-ping" style={{ animationDelay: '0.4s' }} />
                  <CheckCircle size={18} className="text-purple-400 absolute inset-0" />
                </div>
                <span className="font-medium">Full Control</span>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-xl border border-purple-400/40 backdrop-blur-sm">
              <div className="flex items-center justify-between text-sm">
                <span className="text-purple-300 font-semibold">Expert</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="text-pink-300 font-semibold">Flexible</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStrategySubTypeSelection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setStrategyCreationType('selection')}
            className="group relative p-4 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 text-white hover:from-white/20 hover:to-white/10 transition-all duration-500 transform hover:scale-110 hover:rotate-12 shadow-2xl hover:shadow-green-500/25"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <ArrowLeft size={24} className="relative z-10" />
          </button>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-green-500 to-blue-600 p-4 rounded-2xl shadow-2xl">
                <Clock size={28} className="text-white drop-shadow-2xl" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Time & Indicator Based Strategy</h2>
              <p className="text-blue-200 text-sm mt-1">Choose your strategy type</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Time Based Strategy */}
        <div className="group relative bg-gradient-to-br from-blue-500/20 via-cyan-600/20 to-teal-600/20 backdrop-blur-xl rounded-2xl p-8 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-700 cursor-pointer transform hover:scale-105 hover:rotate-1 hover:shadow-2xl hover:shadow-blue-500/25" onClick={() => {
          setStrategySubType('time-based');
          setStrategyCreationType('time-based');
        }}>
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl animate-pulse"></div>
          
          {/* Glowing border effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-6 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-cyan-600 p-5 rounded-2xl shadow-2xl transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                  <Clock size={32} className="text-white drop-shadow-2xl" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors duration-300">Time Based Strategy</h3>
                <p className="text-blue-200 text-sm">Create strategies based on time triggers</p>
              </div>
            </div>
            
            <div className="space-y-3 text-blue-200 text-sm">
              <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform duration-300">
                <div className="relative">
                  <CheckCircle size={18} className="text-blue-400 animate-ping" />
                  <CheckCircle size={18} className="text-blue-400 absolute inset-0" />
                </div>
                <span className="font-medium">Fixed Entry/Exit Times</span>
              </div>
              <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform duration-300" style={{ transitionDelay: '0.1s' }}>
                <div className="relative">
                  <CheckCircle size={18} className="text-blue-400 animate-ping" style={{ animationDelay: '0.2s' }} />
                  <CheckCircle size={18} className="text-blue-400 absolute inset-0" />
                </div>
                <span className="font-medium">Scheduled Trading</span>
              </div>
              <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform duration-300" style={{ transitionDelay: '0.2s' }}>
                <div className="relative">
                  <CheckCircle size={18} className="text-blue-400 animate-ping" style={{ animationDelay: '0.4s' }} />
                  <CheckCircle size={18} className="text-blue-400 absolute inset-0" />
                </div>
                <span className="font-medium">Time-based Signals</span>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-xl border border-blue-400/40 backdrop-blur-sm">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-300 font-semibold">Simple</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-cyan-300 font-semibold">Reliable</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Indicator Based Strategy */}
        <div className="group relative bg-gradient-to-br from-green-500/20 via-emerald-600/20 to-teal-600/20 backdrop-blur-xl rounded-2xl p-8 border border-green-500/30 hover:border-green-400/50 transition-all duration-700 cursor-pointer transform hover:scale-105 hover:-rotate-1 hover:shadow-2xl hover:shadow-green-500/25" onClick={() => {
          setStrategySubType('indicator-based');
          setStrategyCreationType('indicator-based');
        }}>
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl animate-pulse"></div>
          
          {/* Glowing border effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400/20 to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-6 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 p-5 rounded-2xl shadow-2xl transform group-hover:-rotate-12 group-hover:scale-110 transition-all duration-500">
                  <BarChart3 size={32} className="text-white drop-shadow-2xl" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-green-300 transition-colors duration-300">Indicator Based Strategy</h3>
                <p className="text-blue-200 text-sm">Create strategies using technical indicators</p>
              </div>
            </div>
            
            <div className="space-y-3 text-blue-200 text-sm">
              <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform duration-300">
                <div className="relative">
                  <CheckCircle size={18} className="text-green-400 animate-ping" />
                  <CheckCircle size={18} className="text-green-400 absolute inset-0" />
                </div>
                <span className="font-medium">Technical Indicators</span>
              </div>
              <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform duration-300" style={{ transitionDelay: '0.1s' }}>
                <div className="relative">
                  <CheckCircle size={18} className="text-green-400 animate-ping" style={{ animationDelay: '0.2s' }} />
                  <CheckCircle size={18} className="text-green-400 absolute inset-0" />
                </div>
                <span className="font-medium">Signal Conditions</span>
              </div>
              <div className="flex items-center space-x-3 group-hover:translate-x-2 transition-transform duration-300" style={{ transitionDelay: '0.2s' }}>
                <div className="relative">
                  <CheckCircle size={18} className="text-green-400 animate-ping" style={{ animationDelay: '0.4s' }} />
                  <CheckCircle size={18} className="text-green-400 absolute inset-0" />
                </div>
                <span className="font-medium">Advanced Analysis</span>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-xl border border-green-400/40 backdrop-blur-sm">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-300 font-semibold">Advanced</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-emerald-300 font-semibold">Dynamic</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTimeBasedForm = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setStrategyCreationType('time-indicator')}
            className="group relative p-4 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 text-white hover:from-white/20 hover:to-white/10 transition-all duration-500 transform hover:scale-110 hover:rotate-12 shadow-2xl hover:shadow-green-500/25"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <ArrowLeft size={24} className="relative z-10" />
          </button>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-2xl shadow-2xl">
                <BarChart3 size={28} className="text-white drop-shadow-2xl" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Indicator Based Strategy</h2>
              <p className="text-blue-200 text-sm mt-1">Create strategies using technical indicators</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleTimeIndicatorSubmit} className="space-y-8">
        {/* Basic Strategy Information */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-500/20">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Basic Strategy Information</span>
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <label className="block text-green-300 text-sm font-semibold mb-3 group-hover:text-green-200 transition-colors duration-300">Strategy Name *</label>
                <input
                  type="text"
                  name="name"
                  value={timeIndicatorFormData.name}
                  onChange={handleTimeIndicatorChange}
                  className="w-full p-4 bg-gradient-to-r from-white/10 to-white/5 border border-green-500/30 rounded-2xl text-white focus:ring-2 focus:ring-green-400 focus:outline-none transition-all duration-500 transform group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-green-500/25 backdrop-blur-sm"
                  placeholder="e.g., RSI Strategy with Moving Average"
                  required
                />
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <label className="block text-green-300 text-sm font-semibold mb-3 group-hover:text-green-200 transition-colors duration-300">Strategy Type</label>
                <select
                  name="strategy_type"
                  value={timeIndicatorFormData.strategy_type}
                  onChange={handleTimeIndicatorChange}
                  className="w-full p-4 bg-gradient-to-r from-white/10 to-white/5 border border-green-500/30 rounded-2xl text-white focus:ring-2 focus:ring-green-400 focus:outline-none transition-all duration-500 transform group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-green-500/25 backdrop-blur-sm"
                >
                  <option value="INTRADAY">Intraday</option>
                  <option value="SWING">Swing</option>
                  <option value="SCALPING">Scalping</option>
                  <option value="POSITIONAL">Positional</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-green-300 text-sm font-semibold mb-3">Strategy Description</label>
            <textarea
              name="description"
              value={timeIndicatorFormData.description}
              onChange={handleTimeIndicatorChange}
              rows={3}
              className="w-full p-4 bg-gradient-to-r from-white/10 to-white/5 border border-green-500/30 rounded-2xl text-white focus:ring-2 focus:ring-green-400 focus:outline-none transition-all duration-500 backdrop-blur-sm"
              placeholder="Describe your indicator-based trading strategy..."
            />
          </div>
        </div>

        {/* Technical Indicators Configuration */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-500/20">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Technical Indicators Configuration</span>
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <label className="block text-green-300 text-sm font-semibold mb-3 group-hover:text-green-200 transition-colors duration-300">Primary Indicator</label>
                <select
                  name="indicator_type"
                  value={timeIndicatorFormData.indicator_type}
                  onChange={handleTimeIndicatorChange}
                  className="w-full p-4 bg-gradient-to-r from-white/10 to-white/5 border border-green-500/30 rounded-2xl text-white focus:ring-2 focus:ring-green-400 focus:outline-none transition-all duration-500 transform group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-green-500/25 backdrop-blur-sm"
                >
                  <option value="RSI">RSI (Relative Strength Index)</option>
                  <option value="MACD">MACD (Moving Average Convergence Divergence)</option>
                  <option value="MA">Moving Average</option>
                  <option value="BB">Bollinger Bands</option>
                  <option value="VWAP">VWAP (Volume Weighted Average Price)</option>
                  <option value="SUPERTREND">SuperTrend</option>
                  <option value="ADX">ADX (Average Directional Index)</option>
                </select>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <label className="block text-green-300 text-sm font-semibold mb-3 group-hover:text-green-200 transition-colors duration-300">Asset Type</label>
                <select
                  name="asset_type"
                  value={timeIndicatorFormData.asset_type}
                  onChange={handleTimeIndicatorChange}
                  className="w-full p-4 bg-gradient-to-r from-white/10 to-white/5 border border-green-500/30 rounded-2xl text-white focus:ring-2 focus:ring-green-400 focus:outline-none transition-all duration-500 transform group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-green-500/25 backdrop-blur-sm"
                >
                  <option value="STOCK">Stock</option>
                  <option value="INDEX">Index</option>
                  <option value="OPTION">Option</option>
                  <option value="FUTURE">Future</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-green-300 text-sm font-semibold mb-3">Symbol</label>
            <input
              type="text"
              name="symbol"
              value={timeIndicatorFormData.symbol}
              onChange={handleTimeIndicatorChange}
              className="w-full p-4 bg-gradient-to-r from-white/10 to-white/5 border border-green-500/30 rounded-2xl text-white focus:ring-2 focus:ring-green-400 focus:outline-none transition-all duration-500 backdrop-blur-sm"
              placeholder="e.g., NIFTY, BANKNIFTY, RELIANCE"
            />
          </div>
        </div>

        {/* Entry/Exit Conditions */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-500/20">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Entry/Exit Conditions</span>
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <label className="block text-green-300 text-sm font-semibold mb-3 group-hover:text-green-200 transition-colors duration-300">Entry Conditions</label>
                <textarea
                  name="entry_conditions"
                  value={timeIndicatorFormData.entry_conditions}
                  onChange={handleTimeIndicatorChange}
                  rows={4}
                  className="w-full p-4 bg-gradient-to-r from-white/10 to-white/5 border border-green-500/30 rounded-2xl text-white focus:ring-2 focus:ring-green-400 focus:outline-none transition-all duration-500 backdrop-blur-sm"
                  placeholder="e.g., RSI > 70 AND Price > MA20"
                />
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <label className="block text-green-300 text-sm font-semibold mb-3 group-hover:text-green-200 transition-colors duration-300">Exit Conditions</label>
                <textarea
                  name="exit_conditions"
                  value={timeIndicatorFormData.exit_conditions}
                  onChange={handleTimeIndicatorChange}
                  rows={4}
                  className="w-full p-4 bg-gradient-to-r from-white/10 to-white/5 border border-green-500/30 rounded-2xl text-white focus:ring-2 focus:ring-green-400 focus:outline-none transition-all duration-500 backdrop-blur-sm"
                  placeholder="e.g., RSI < 30 OR Stop Loss Hit"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Scheduling & Watch Updates */}
        <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-2xl p-6 border border-purple-500/20">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <span>Strategy Scheduling & Watch Updates</span>
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <label className="block text-purple-300 text-sm font-semibold mb-3 group-hover:text-purple-200 transition-colors duration-300">Strategy Start Date</label>
                <input
                  type="date"
                  name="strategy_start_date"
                  value={timeIndicatorFormData.strategy_start_date}
                  onChange={handleTimeIndicatorChange}
                  className="w-full p-4 bg-gradient-to-r from-white/10 to-white/5 border border-purple-500/30 rounded-2xl text-white focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-500 transform group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-purple-500/25 backdrop-blur-sm"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <label className="block text-purple-300 text-sm font-semibold mb-3 group-hover:text-purple-200 transition-colors duration-300">Strategy Start Time</label>
                <input
                  type="time"
                  name="strategy_start_time"
                  value={timeIndicatorFormData.strategy_start_time}
                  onChange={handleTimeIndicatorChange}
                  className="w-full p-4 bg-gradient-to-r from-white/10 to-white/5 border border-purple-500/30 rounded-2xl text-white focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-500 transform group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-purple-500/25 backdrop-blur-sm"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-purple-300 text-sm font-semibold mb-4">Working Days</label>
            <div className="grid grid-cols-2 lg:grid-cols-7 gap-3">
              {Object.entries(timeIndicatorFormData.working_days).map(([day, isActive]) => (
                <div key={day} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <label className="relative flex items-center space-x-2 p-3 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => {
                        setTimeIndicatorFormData(prev => ({
                          ...prev,
                          working_days: {
                            ...prev.working_days,
                            [day]: e.target.checked
                          }
                        }));
                      }}
                      className="w-4 h-4 text-purple-600 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 rounded focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                    />
                    <span className="text-white font-medium capitalize">{day}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl border border-purple-500/20">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <div>
                  <h4 className="text-white font-semibold">Strategy Status</h4>
                  <p className="text-purple-200 text-sm">
                    {timeIndicatorFormData.is_active ? 'Active' : 'Inactive'} • Last Updated: {new Date(timeIndicatorFormData.last_updated).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTimeIndicatorFormData(prev => ({
                    ...prev,
                    is_active: !prev.is_active,
                    last_updated: new Date().toISOString()
                  }));
                }}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                  timeIndicatorFormData.is_active
                    ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700'
                    : 'bg-gradient-to-r from-green-500 to-blue-600 text-white hover:from-green-600 hover:to-blue-700'
                }`}
              >
                {timeIndicatorFormData.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>

        {/* Risk Management */}
        <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-2xl p-6 border border-red-500/20">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-3">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            <span>Risk Management</span>
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <label className="block text-red-300 text-sm font-semibold mb-3 group-hover:text-red-200 transition-colors duration-300">Stop Loss</label>
                <input
                  type="number"
                  name="stop_loss"
                  value={timeIndicatorFormData.stop_loss}
                  onChange={handleTimeIndicatorChange}
                  className="w-full p-4 bg-gradient-to-r from-white/10 to-white/5 border border-red-500/30 rounded-2xl text-white focus:ring-2 focus:ring-red-400 focus:outline-none transition-all duration-500 transform group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-red-500/25 backdrop-blur-sm"
                  placeholder="e.g., 100"
                />
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <label className="block text-red-300 text-sm font-semibold mb-3 group-hover:text-red-200 transition-colors duration-300">Take Profit</label>
                <input
                  type="number"
                  name="take_profit"
                  value={timeIndicatorFormData.take_profit}
                  onChange={handleTimeIndicatorChange}
                  className="w-full p-4 bg-gradient-to-r from-white/10 to-white/5 border border-red-500/30 rounded-2xl text-white focus:ring-2 focus:ring-red-400 focus:outline-none transition-all duration-500 transform group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-red-500/25 backdrop-blur-sm"
                  placeholder="e.g., 200"
                />
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <label className="block text-red-300 text-sm font-semibold mb-3 group-hover:text-red-200 transition-colors duration-300">Position Size</label>
                <input
                  type="number"
                  name="position_size"
                  value={timeIndicatorFormData.position_size}
                  onChange={handleTimeIndicatorChange}
                  className="w-full p-4 bg-gradient-to-r from-white/10 to-white/5 border border-red-500/30 rounded-2xl text-white focus:ring-2 focus:ring-red-400 focus:outline-none transition-all duration-500 transform group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-red-500/25 backdrop-blur-sm"
                  placeholder="e.g., 1000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="group relative px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10 flex items-center space-x-2">
              <Save size={20} />
              <span>Create Indicator Based Strategy</span>
            </span>
          </button>
        </div>
      </form>
    </div>
  );

  const renderTimeIndicatorForm = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setStrategyCreationType('time-indicator')}
            className="group relative p-4 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 text-white hover:from-white/20 hover:to-white/10 transition-all duration-500 transform hover:scale-110 hover:rotate-12 shadow-2xl hover:shadow-green-500/25"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <ArrowLeft size={24} className="relative z-10" />
          </button>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-2xl shadow-2xl">
                <BarChart3 size={28} className="text-white drop-shadow-2xl" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Indicator Based Strategy</h2>
              <p className="text-blue-200 text-sm mt-1">Create strategies using technical indicators</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleTimeIndicatorSubmit} className="space-y-8">
        {/* Technical Indicators Configuration */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-500/20">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Technical Indicators Configuration</span>
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <label className="block text-green-300 text-sm font-semibold mb-3 group-hover:text-green-200 transition-colors duration-300">Primary Indicator</label>
                <select
                  name="indicator_type"
                  value={timeIndicatorFormData.indicator_type}
                  onChange={handleTimeIndicatorChange}
                  className="w-full p-4 bg-gradient-to-r from-white/10 to-white/5 border border-green-500/30 rounded-2xl text-white focus:ring-2 focus:ring-green-400 focus:outline-none transition-all duration-500 transform group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-green-500/25 backdrop-blur-sm"
                >
                  <option value="RSI">RSI (Relative Strength Index)</option>
                  <option value="MACD">MACD (Moving Average Convergence Divergence)</option>
                  <option value="MA">Moving Average</option>
                  <option value="BB">Bollinger Bands</option>
                  <option value="VWAP">VWAP (Volume Weighted Average Price)</option>
                  <option value="SUPERTREND">SuperTrend</option>
                  <option value="ADX">ADX (Average Directional Index)</option>
                </select>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <label className="block text-green-300 text-sm font-semibold mb-3 group-hover:text-green-200 transition-colors duration-300">Asset Type</label>
                <select
                  name="asset_type"
                  value={timeIndicatorFormData.asset_type}
                  onChange={handleTimeIndicatorChange}
                  className="w-full p-4 bg-gradient-to-r from-white/10 to-white/5 border border-green-500/30 rounded-2xl text-white focus:ring-2 focus:ring-green-400 focus:outline-none transition-all duration-500 transform group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-green-500/25 backdrop-blur-sm"
                >
                  <option value="STOCK">Stock</option>
                  <option value="INDEX">Index</option>
                  <option value="OPTION">Option</option>
                  <option value="FUTURE">Future</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-green-300 text-sm font-semibold mb-3">Symbol</label>
            <input
              type="text"
              name="symbol"
              value={timeIndicatorFormData.symbol}
              onChange={handleTimeIndicatorChange}
              className="w-full p-4 bg-gradient-to-r from-white/10 to-white/5 border border-green-500/30 rounded-2xl text-white focus:ring-2 focus:ring-green-400 focus:outline-none transition-all duration-500 backdrop-blur-sm"
              placeholder="e.g., NIFTY, BANKNIFTY, RELIANCE"
            />
          </div>
        </div>

        {/* Trading Configuration Interface */}
        <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl p-6 border border-blue-500/20">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span>Trading Configuration</span>
          </h3>
          
          {/* Instrument Selection Card */}
          <div className="group relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative bg-gradient-to-r from-slate-800/50 to-slate-700/50 p-6 rounded-2xl border border-blue-500/30 hover:border-blue-400/50 transition-all duration-500 transform group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-blue-500/25 backdrop-blur-sm">
              {instrumentSearch.selectedInstrument ? (
                // Selected Instrument Display
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                      <BarChart3 size={24} className="text-white" />
                    </div>
                    <div>
                      <h4 className="text-blue-300 font-semibold text-lg">{instrumentSearch.selectedInstrument.symbol}</h4>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-green-400">{instrumentSearch.selectedInstrument.change}</span>
                        <span className="text-blue-200">Lot Size: {instrumentSearch.selectedInstrument.lotSize}</span>
                        <span className="text-purple-200">{instrumentSearch.selectedInstrument.segment}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={handleInstrumentRemove}
                    className="w-8 h-8 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-lg flex items-center justify-center hover:from-red-500/30 hover:to-pink-500/30 transition-all duration-300"
                  >
                    <X size={16} className="text-red-400" />
                  </button>
                </div>
              ) : (
                // Instrument Search Interface
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                      <BarChart3 size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-blue-300 text-sm font-semibold mb-2">Search Underlying Asset</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={instrumentSearch.searchQuery}
                          onChange={(e) => handleInstrumentSearch(e.target.value)}
                          placeholder="Search for instruments (e.g., NIFTY, BANKNIFTY, RELIANCE)"
                          className="w-full p-4 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-blue-500/30 rounded-2xl text-white focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-500 backdrop-blur-sm"
                        />
                        {instrumentSearch.isSearching && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Search Results */}
                  {instrumentSearch.searchResults.length > 0 && (
                    <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                      {instrumentSearch.searchResults.map((instrument, index) => (
                        <div
                          key={index}
                          onClick={() => handleInstrumentSelect(instrument)}
                          className="group relative p-4 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-xl border border-blue-500/20 hover:border-blue-400/40 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500/50 to-cyan-600/50 rounded-lg flex items-center justify-center">
                                <BarChart3 size={16} className="text-white" />
                              </div>
                              <div>
                                <h5 className="text-blue-200 font-semibold">{instrument.symbol}</h5>
                                <p className="text-blue-300 text-sm">{instrument.name}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-3 text-sm">
                                <span className="text-green-400">{instrument.change}</span>
                                <span className="text-purple-200">{instrument.segment}</span>
                                <span className="text-blue-200">Lot: {instrument.lotSize}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Popular Instruments */}
                  {!instrumentSearch.isSearching && instrumentSearch.searchResults.length === 0 && (
                    <div className="mt-4">
                      <p className="text-blue-300 text-sm font-semibold mb-3">Popular Instruments:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {mockInstruments.slice(0, 6).map((instrument, index) => (
                          <button
                            key={index}
                            onClick={() => handleInstrumentSelect(instrument)}
                            className="group relative p-3 bg-gradient-to-r from-slate-700/30 to-slate-600/30 rounded-lg border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 transform hover:scale-105"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative text-left">
                              <div className="text-blue-200 font-semibold text-sm">{instrument.symbol}</div>
                              <div className="text-blue-300 text-xs">{instrument.segment}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Order Type Selection */}
          <div className="mb-6">
            <label className="block text-blue-300 text-sm font-semibold mb-3">Order Type</label>
            <div className="flex space-x-4">
              {['MIS', 'CNC', 'BTST'].map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`group relative px-6 py-3 rounded-xl font-semibold transition-all duration-500 transform hover:scale-105 ${
                    timeIndicatorFormData.order_type === type
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-2xl shadow-blue-500/25'
                      : 'bg-gradient-to-r from-slate-800/50 to-slate-700/50 text-blue-200 border border-blue-500/30 hover:border-blue-400/50'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10">{type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <label className="block text-blue-300 text-sm font-semibold mb-3 group-hover:text-blue-200 transition-colors duration-300">Start Time</label>
                <input
                  type="time"
                  name="start_time"
                  value={timeIndicatorFormData.start_time || ''}
                  onChange={handleTimeIndicatorChange}
                  className="w-full p-4 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-blue-500/30 rounded-2xl text-white focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-500 transform group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-blue-500/25 backdrop-blur-sm"
                />
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <label className="block text-blue-300 text-sm font-semibold mb-3 group-hover:text-blue-200 transition-colors duration-300">Square Off Time</label>
                <input
                  type="time"
                  name="square_off_time"
                  value={timeIndicatorFormData.square_off_time || ''}
                  onChange={handleTimeIndicatorChange}
                  className="w-full p-4 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-blue-500/30 rounded-2xl text-white focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-500 transform group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-blue-500/25 backdrop-blur-sm"
                />
              </div>
            </div>
          </div>

          {/* Day Selection */}
          <div className="mb-6">
            <label className="block text-blue-300 text-sm font-semibold mb-3">Working Days</label>
            <div className="flex space-x-2">
              {[
                { key: 'MON', day: 'monday' },
                { key: 'TUE', day: 'tuesday' },
                { key: 'WED', day: 'wednesday' },
                { key: 'THU', day: 'thursday' },
                { key: 'FRI', day: 'friday' }
              ].map(({ key, day }) => (
                <button
                  key={key}
                  type="button"
                  className={`group relative px-4 py-2 rounded-lg font-semibold transition-all duration-500 transform hover:scale-105 ${
                    timeIndicatorFormData.working_days[day as keyof typeof timeIndicatorFormData.working_days]
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-2xl shadow-blue-500/25'
                      : 'bg-gradient-to-r from-slate-800/50 to-slate-700/50 text-blue-200 border border-blue-500/30 hover:border-blue-400/50'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10">{key}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Transaction Type */}
          <div className="mb-6">
            <label className="block text-blue-300 text-sm font-semibold mb-3">Transaction Type</label>
            <div className="flex space-x-4">
              {['Both Side', 'Only Long', 'Only Short'].map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`group relative px-6 py-3 rounded-xl font-semibold transition-all duration-500 transform hover:scale-105 ${
                    timeIndicatorFormData.transaction_type === type
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-2xl shadow-blue-500/25'
                      : 'bg-gradient-to-r from-slate-800/50 to-slate-700/50 text-blue-200 border border-blue-500/30 hover:border-blue-400/50'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10">{type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chart Type */}
          <div className="mb-6">
            <label className="block text-blue-300 text-sm font-semibold mb-3">Chart Type</label>
            <div className="flex space-x-4">
              {[
                { name: 'Candle', icon: '📊' },
                { name: 'Heikin Ashi', icon: '📈' }
              ].map((chart) => (
                <button
                  key={chart.name}
                  type="button"
                  className={`group relative px-6 py-3 rounded-xl font-semibold transition-all duration-500 transform hover:scale-105 ${
                    timeIndicatorFormData.chart_type === chart.name
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-2xl shadow-blue-500/25'
                      : 'bg-gradient-to-r from-slate-800/50 to-slate-700/50 text-blue-200 border border-blue-500/30 hover:border-blue-400/50'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center space-x-2">
                    <span>{chart.icon}</span>
                    <span>{chart.name}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Interval Selection */}
          <div>
            <label className="block text-blue-300 text-sm font-semibold mb-3">Time Interval</label>
            <div className="flex flex-wrap gap-2">
              {['1 Min', '3 Min', '5 Min', '10 Min', '15 Min', '30 Min', '1H'].map((interval) => (
                <button
                  key={interval}
                  type="button"
                  className={`group relative px-4 py-2 rounded-lg font-semibold transition-all duration-500 transform hover:scale-105 ${
                    timeIndicatorFormData.interval === interval
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-2xl shadow-blue-500/25'
                      : 'bg-gradient-to-r from-slate-800/50 to-slate-700/50 text-blue-200 border border-blue-500/30 hover:border-blue-400/50'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10">{interval}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Entry/Exit Conditions */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-500/20">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Entry/Exit Conditions</span>
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <label className="block text-green-300 text-sm font-semibold mb-3 group-hover:text-green-200 transition-colors duration-300">Entry Conditions</label>
                <textarea
                  name="entry_conditions"
                  value={timeIndicatorFormData.entry_conditions}
                  onChange={handleTimeIndicatorChange}
                  rows={4}
                  className="w-full p-4 bg-gradient-to-r from-white/10 to-white/5 border border-green-500/30 rounded-2xl text-white focus:ring-2 focus:ring-green-400 focus:outline-none transition-all duration-500 backdrop-blur-sm"
                  placeholder="e.g., RSI > 70 AND Price > MA20"
                />
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <label className="block text-green-300 text-sm font-semibold mb-3 group-hover:text-green-200 transition-colors duration-300">Exit Conditions</label>
                <textarea
                  name="exit_conditions"
                  value={timeIndicatorFormData.exit_conditions}
                  onChange={handleTimeIndicatorChange}
                  rows={4}
                  className="w-full p-4 bg-gradient-to-r from-white/10 to-white/5 border border-green-500/30 rounded-2xl text-white focus:ring-2 focus:ring-green-400 focus:outline-none transition-all duration-500 backdrop-blur-sm"
                  placeholder="e.g., RSI < 30 OR Stop Loss Hit"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Risk Management */}
        <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-2xl p-6 border border-red-500/20">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-3">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            <span>Risk Management</span>
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <label className="block text-red-300 text-sm font-semibold mb-3 group-hover:text-red-200 transition-colors duration-300">Stop Loss</label>
                <input
                  type="number"
                  name="stop_loss"
                  value={timeIndicatorFormData.stop_loss}
                  onChange={handleTimeIndicatorChange}
                  className="w-full p-4 bg-gradient-to-r from-white/10 to-white/5 border border-red-500/30 rounded-2xl text-white focus:ring-2 focus:ring-red-400 focus:outline-none transition-all duration-500 transform group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-red-500/25 backdrop-blur-sm"
                  placeholder="e.g., 100"
                />
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <label className="block text-red-300 text-sm font-semibold mb-3 group-hover:text-red-200 transition-colors duration-300">Take Profit</label>
                <input
                  type="number"
                  name="take_profit"
                  value={timeIndicatorFormData.take_profit}
                  onChange={handleTimeIndicatorChange}
                  className="w-full p-4 bg-gradient-to-r from-white/10 to-white/5 border border-red-500/30 rounded-2xl text-white focus:ring-2 focus:ring-red-400 focus:outline-none transition-all duration-500 transform group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-red-500/25 backdrop-blur-sm"
                  placeholder="e.g., 200"
                />
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <label className="block text-red-300 text-sm font-semibold mb-3 group-hover:text-red-200 transition-colors duration-300">Position Size</label>
                <input
                  type="number"
                  name="position_size"
                  value={timeIndicatorFormData.position_size}
                  onChange={handleTimeIndicatorChange}
                  className="w-full p-4 bg-gradient-to-r from-white/10 to-white/5 border border-red-500/30 rounded-2xl text-white focus:ring-2 focus:ring-red-400 focus:outline-none transition-all duration-500 transform group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-red-500/25 backdrop-blur-sm"
                  placeholder="e.g., 1000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="group relative px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10 flex items-center space-x-2">
              <Save size={20} />
              <span>Create Indicator Based Strategy</span>
            </span>
          </button>
        </div>
      </form>
    </div>
  );

  const renderProgrammingForm = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setStrategyCreationType('selection')}
            className="group relative p-4 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 text-white hover:from-white/20 hover:to-white/10 transition-all duration-500 transform hover:scale-110 hover:rotate-12 shadow-2xl hover:shadow-purple-500/25"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <ArrowLeft size={24} className="relative z-10" />
          </button>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-purple-500 to-pink-600 p-4 rounded-2xl shadow-2xl">
                <Code size={28} className="text-white drop-shadow-2xl" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Programming Strategy</h2>
              <p className="text-blue-200 text-sm mt-1">Write custom algorithms in Python</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleProgrammingSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="transform hover:scale-105 transition-all duration-300">
            <label className="block text-blue-200 text-sm font-medium mb-2">Strategy Name *</label>
            <input
              type="text"
              name="name"
              value={programmingFormData.name}
              onChange={handleProgrammingChange}
              className="w-full p-3 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-purple-500/30 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
              placeholder="e.g., Custom Algorithm Strategy"
              required
            />
          </div>

          <div className="transform hover:scale-105 transition-all duration-300">
            <label className="block text-blue-200 text-sm font-medium mb-2">Programming Language</label>
            <select
              name="programming_language"
              value={programmingFormData.programming_language}
              onChange={handleProgrammingChange}
              className="w-full p-3 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-purple-500/30 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
            >
              <option value="PYTHON">Python</option>
              <option value="JAVASCRIPT">JavaScript</option>
            </select>
          </div>
        </div>

        <div className="transform hover:scale-105 transition-all duration-300">
          <label className="block text-blue-200 text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={programmingFormData.description}
            onChange={handleProgrammingChange}
            rows={3}
            className="w-full p-3 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-purple-500/30 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
            placeholder="Describe your algorithm..."
          />
        </div>

        <div className="transform hover:scale-105 transition-all duration-300">
          <label className="block text-blue-200 text-sm font-medium mb-2">Strategy Code *</label>
          <textarea
            name="code"
            value={programmingFormData.code}
            onChange={handleProgrammingChange}
            rows={15}
            className="w-full p-3 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-purple-500/30 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono text-sm transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
            placeholder={`# Example Python Strategy Code
def strategy(data):
    # Your trading logic here
    if data['rsi'] < 30:
        return 'BUY'
    elif data['rsi'] > 70:
        return 'SELL'
    return 'HOLD'`}
            required
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="transform hover:scale-105 transition-all duration-300">
            <label className="block text-blue-200 text-sm font-medium mb-2">Stop Loss</label>
            <input
              type="text"
              name="stop_loss"
              value={programmingFormData.stop_loss}
              onChange={handleProgrammingChange}
              className="w-full p-3 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-purple-500/30 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
              placeholder="e.g., 50 points"
            />
          </div>

          <div className="transform hover:scale-105 transition-all duration-300">
            <label className="block text-blue-200 text-sm font-medium mb-2">Take Profit</label>
            <input
              type="text"
              name="take_profit"
              value={programmingFormData.take_profit}
              onChange={handleProgrammingChange}
              className="w-full p-3 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-purple-500/30 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
              placeholder="e.g., 100 points"
            />
          </div>

          <div className="transform hover:scale-105 transition-all duration-300">
            <label className="block text-blue-200 text-sm font-medium mb-2">Position Size</label>
            <input
              type="text"
              name="position_size"
              value={programmingFormData.position_size}
              onChange={handleProgrammingChange}
              className="w-full p-3 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-purple-500/30 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
              placeholder="e.g., 1 lot"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="group relative px-8 py-4 bg-gradient-to-r from-white/10 to-white/5 text-white rounded-2xl hover:from-white/20 hover:to-white/10 transition-all duration-500 transform hover:scale-105 hover:-rotate-2 shadow-2xl hover:shadow-red-500/25 backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-orange-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10 font-semibold">Cancel</span>
          </button>
          <button
            type="submit"
            className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl font-bold hover:from-purple-600 hover:to-pink-700 transition-all duration-500 flex items-center space-x-3 transform hover:scale-110 hover:rotate-2 shadow-2xl hover:shadow-purple-500/50 backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center space-x-3">
              <div className="relative">
                <Code size={24} className="text-white drop-shadow-2xl animate-pulse" />
                <div className="absolute inset-0 bg-purple-400 rounded-full blur-sm animate-ping"></div>
              </div>
              <span className="text-lg">Create Strategy</span>
            </div>
          </button>
        </div>
      </form>
    </div>
  );

  const renderContent = () => {
    switch (strategyCreationType) {
      case 'selection':
        return renderStrategyTypeSelection();
      case 'time-indicator':
        return renderStrategySubTypeSelection();
      case 'time-based':
        return renderTimeBasedForm();
      case 'indicator-based':
        return renderTimeIndicatorForm(); // This case will be handled by renderStrategySubTypeSelection
      case 'programming':
        return renderProgrammingForm();
      default:
        return renderStrategyTypeSelection();
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      <div className="fixed left-0 top-0 h-full z-10">
        <Sidebar activeTab="strategies" onTabChange={() => {}} />
      </div>
      <div className="flex-1 flex min-w-0 md:ml-64">
        <main className="flex-1 p-6 space-y-6 md:ml-0 overflow-x-hidden">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default CreateStrategyPage; 