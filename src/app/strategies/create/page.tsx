'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, BarChart3, Code, TrendingUp, Cpu, Zap, Target, Shield, Brain, Rocket, Palette, Database, Globe, Clock, DollarSign, AlertTriangle, CheckCircle, Sparkles, Layers, BarChart2, Activity, PieChart, LineChart, Settings, Play, Pause, RotateCcw, X, Sun, Plus, Copy, Trash2, Search } from 'lucide-react';
import Sidebar from '../../components/Layout/Sidebar';
import { getUserToken, getUserData } from '@/lib/cookies';

// Indicator data interface
interface IndicatorParameter {
  name: string;
  label: string;
  type: 'number' | 'select' | 'text';
  default: number | string;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
}

interface Indicator {
  value: string;
  label: string;
  category: string;
  parameters: IndicatorParameter[];
}

interface IndicatorGroup {
  [category: string]: Indicator[];
}

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
    noTradeAfter: '15:15',
    // Strategy scheduling and watch updates
    strategy_start_date: '',
    strategy_start_time: '09:15',
    start_time: '09:15',
    square_off_time: '15:15',
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
    legs: [],
    // Entry conditions array
    entryConditions: {
      long: [],
      short: []
    } as {
      long: Array<{id: number, indicator1: string, comparator: string, indicator2: string}>,
      short: Array<{id: number, indicator1: string, comparator: string, indicator2: string}>
    }
  });

  // State for tracking condition blocks
  const [conditionBlocks, setConditionBlocks] = useState(1);
  const [logicalOperator, setLogicalOperator] = useState<'AND' | 'OR'>('AND');
  
  // State for profit trailing selection
  const [profitTrailingType, setProfitTrailingType] = useState<'no_trailing' | 'lock_fix_profit' | 'trail_profit' | 'lock_and_trail'>('no_trailing');

  // State for comparator selections
  const [longComparator, setLongComparator] = useState('');
  const [shortComparator, setShortComparator] = useState('');

  // Indicator data state
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [groupedIndicators, setGroupedIndicators] = useState<IndicatorGroup>({});
  const [isLoadingIndicators, setIsLoadingIndicators] = useState(true);
  
  // Selected indicators and their parameters
  const [selectedIndicators, setSelectedIndicators] = useState<{
    long1?: { indicator: string; parameters: Record<string, any> };
    long2?: { indicator: string; parameters: Record<string, any> };
    short1?: { indicator: string; parameters: Record<string, any> };
    short2?: { indicator: string; parameters: Record<string, any> };
  }>({});

  // Modal state for indicator selection
  const [showIndicatorModal, setShowIndicatorModal] = useState(false);
  const [currentIndicatorPosition, setCurrentIndicatorPosition] = useState<'long1' | 'long2' | 'short1' | 'short2' | null>(null);
  const [tempSelectedIndicator, setTempSelectedIndicator] = useState<string>('');
  const [tempIndicatorParameters, setTempIndicatorParameters] = useState<Record<string, any>>({});

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

  // State for validation errors
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Check if underlying is selected
  const isUnderlyingSelected = !!instrumentSearch.selectedInstrument;

  // Fetch indicators from API
  const fetchIndicators = async () => {
    try {
      setIsLoadingIndicators(true);
      const response = await fetch('/api/indicators');
      if (response.ok) {
        const data = await response.json();
        setIndicators(data.indicators);
        setGroupedIndicators(data.grouped);
      } else {
        console.error('Failed to fetch indicators');
      }
    } catch (error) {
      console.error('Error fetching indicators:', error);
    } finally {
      setIsLoadingIndicators(false);
    }
  };

  // Handle indicator selection
  const handleIndicatorChange = (position: 'long1' | 'long2' | 'short1' | 'short2', indicatorValue: string) => {
    const selectedIndicator = indicators.find(ind => ind.value === indicatorValue);
    if (selectedIndicator) {
      const defaultParameters = selectedIndicator.parameters.reduce((acc, param) => {
        acc[param.name] = param.default;
        return acc;
      }, {} as Record<string, any>);

      setSelectedIndicators(prev => ({
        ...prev,
        [position]: {
          indicator: indicatorValue,
          parameters: defaultParameters
        }
      }));
    }
  };

  // Open indicator selection modal
  const openIndicatorModal = (position: 'long1' | 'long2' | 'short1' | 'short2') => {
    setCurrentIndicatorPosition(position);
    setTempSelectedIndicator(selectedIndicators[position]?.indicator || '');
    setTempIndicatorParameters(selectedIndicators[position]?.parameters || {});
    setShowIndicatorModal(true);
  };

  // Handle indicator selection in modal
  const handleModalIndicatorChange = (indicatorValue: string) => {
    console.log('Indicator selected:', indicatorValue);
    setTempSelectedIndicator(indicatorValue);
    const selectedIndicator = indicators.find(ind => ind.value === indicatorValue);
    if (selectedIndicator) {
      const defaultParameters = selectedIndicator.parameters.reduce((acc, param) => {
        acc[param.name] = param.default;
        return acc;
      }, {} as Record<string, any>);
      console.log('Default parameters:', defaultParameters);
      setTempIndicatorParameters(defaultParameters);
    } else {
      setTempIndicatorParameters({});
    }
  };

  // Handle parameter change in modal
  const handleModalParameterChange = (paramName: string, value: any) => {
    console.log('Parameter change:', paramName, value);
    setTempIndicatorParameters(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  // Apply indicator selection from modal
  const applyIndicatorSelection = () => {
    if (currentIndicatorPosition && tempSelectedIndicator) {
      setSelectedIndicators(prev => ({
        ...prev,
        [currentIndicatorPosition]: {
          indicator: tempSelectedIndicator,
          parameters: tempIndicatorParameters
        }
      }));
    }
    setShowIndicatorModal(false);
    setCurrentIndicatorPosition(null);
    setTempSelectedIndicator('');
    setTempIndicatorParameters({});
  };

  // Cancel indicator selection
  const cancelIndicatorSelection = () => {
    setShowIndicatorModal(false);
    setCurrentIndicatorPosition(null);
    setTempSelectedIndicator('');
    setTempIndicatorParameters({});
  };

  // Handle parameter change
  const handleParameterChange = (position: 'long1' | 'long2' | 'short1' | 'short2', paramName: string, value: any) => {
    setSelectedIndicators(prev => ({
      ...prev,
      [position]: {
        ...prev[position],
        parameters: {
          ...prev[position]?.parameters,
          [paramName]: value
        }
      }
    }));
  };

  // Get selected indicator details
  const getSelectedIndicator = (position: 'long1' | 'long2' | 'short1' | 'short2') => {
    const selected = selectedIndicators[position];
    if (!selected) return null;
    return indicators.find(ind => ind.value === selected.indicator);
  };

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
    
    // Fetch indicators
    fetchIndicators();
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

  const handleTimeIndicatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Comprehensive validation for all required fields
    const validationErrors = [];
    
    // Strategy name validation
    if (!timeIndicatorFormData.name.trim()) {
      validationErrors.push('Strategy Name is required');
    }
    
    // Symbol validation
    if (!timeIndicatorFormData.symbol.trim()) {
      validationErrors.push('Symbol/Underlying is required');
    }
    
    // Entry conditions validation
    if (!timeIndicatorFormData.entry_conditions.trim()) {
      validationErrors.push('Entry Conditions are required');
    }
    
    // Exit conditions validation
    if (!timeIndicatorFormData.exit_conditions.trim()) {
      validationErrors.push('Exit Conditions are required');
    }
    
    // Risk management validation
    if (!timeIndicatorFormData.stop_loss || timeIndicatorFormData.stop_loss.toString().trim() === '') {
      validationErrors.push('Stop Loss is required');
    }
    
    if (!timeIndicatorFormData.take_profit || timeIndicatorFormData.take_profit.toString().trim() === '') {
      validationErrors.push('Take Profit is required');
    }
    
    if (!timeIndicatorFormData.position_size || timeIndicatorFormData.position_size.toString().trim() === '') {
      validationErrors.push('Position Size is required');
    }
    
    // Time validation - these should have default values, but let's check anyway
    if (!timeIndicatorFormData.start_time || timeIndicatorFormData.start_time.trim() === '') {
      validationErrors.push('Start Time is required');
    }
    
    if (!timeIndicatorFormData.square_off_time || timeIndicatorFormData.square_off_time.trim() === '') {
      validationErrors.push('Square Off Time is required');
    }
    
    // Comparator validation
    if (!longComparator || longComparator.trim() === '') {
      validationErrors.push('Long Entry Comparator is required');
    }
    
    if (!shortComparator || shortComparator.trim() === '') {
      validationErrors.push('Short Entry Comparator is required');
    }
    
    // If there are validation errors, show them and return
    if (validationErrors.length > 0) {
      setValidationErrors(validationErrors);
      const errorMessage = 'Please fill in the following required fields:\n\n' + validationErrors.join('\n');
      alert(errorMessage);
      return;
    }
    
    // Clear validation errors if validation passes
    setValidationErrors([]);
    
    // Create new strategy object
    const newStrategy = {
      id: Date.now().toString(), // Generate unique ID
      user_id: (user as any)?.id || '1',
      name: timeIndicatorFormData.name.trim(),
      description: timeIndicatorFormData.description || `Strategy created on ${new Date().toLocaleDateString()}`,
      strategy_type: timeIndicatorFormData.strategy_type || 'INTRADAY',
      symbol: timeIndicatorFormData.symbol || 'NIFTY50',
      entry_conditions: `Long: ${longComparator}, Short: ${shortComparator}`,
      exit_conditions: timeIndicatorFormData.exit_conditions || 'Stop Loss or Take Profit',
      risk_management: {
        stop_loss: timeIndicatorFormData.stop_loss || '2%',
        take_profit: timeIndicatorFormData.take_profit || '4%',
        position_size: timeIndicatorFormData.position_size || '1 lot'
      },
      is_active: false,
      created_at: new Date(),
      updated_at: new Date(),
      performance_metrics: {
        total_trades: 0,
        winning_trades: 0,
        total_pnl: 0,
        max_drawdown: 0,
        sharpe_ratio: 0
      },
      strategy_data: {
        ...timeIndicatorFormData,
        longComparator,
        shortComparator,
        profitTrailingType,
        conditionBlocks,
        logicalOperator
      }
    };

    // Save to database
    try {
      const response = await fetch('/api/strategies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: (user as any)?.id || 'tradesetu001',
          name: newStrategy.name,
          description: newStrategy.description,
          strategy_type: newStrategy.strategy_type,
          symbol: newStrategy.symbol,
          entry_conditions: newStrategy.entry_conditions,
          exit_conditions: newStrategy.exit_conditions,
          risk_management: newStrategy.risk_management,
          is_paper_trading: true
        }),
      });

      if (response.ok) {
        console.log('Strategy saved successfully');
        router.push('/strategies');
      } else {
        const errorData = await response.json();
        console.error('Failed to save strategy:', errorData);
        alert(`Error saving strategy: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving strategy:', error);
      alert(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleProgrammingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Comprehensive validation for programming strategy
    const validationErrors = [];
    
    // Strategy name validation
    if (!programmingFormData.name?.trim()) {
      validationErrors.push('Strategy Name is required');
    }
    
    // Symbol validation
    if (!programmingFormData.symbol?.trim()) {
      validationErrors.push('Symbol is required');
    }
    
    // Code validation
    if (!programmingFormData.code?.trim()) {
      validationErrors.push('Strategy Code is required');
    }
    
    // Risk management validation
    if (!programmingFormData.stop_loss || programmingFormData.stop_loss.toString().trim() === '') {
      validationErrors.push('Stop Loss is required');
    }
    
    if (!programmingFormData.take_profit || programmingFormData.take_profit.toString().trim() === '') {
      validationErrors.push('Take Profit is required');
    }
    
    if (!programmingFormData.position_size || programmingFormData.position_size.toString().trim() === '') {
      validationErrors.push('Position Size is required');
    }
    
    // If there are validation errors, show them and return
    if (validationErrors.length > 0) {
      setValidationErrors(validationErrors);
      const errorMessage = 'Please fill in the following required fields:\n\n' + validationErrors.join('\n');
      alert(errorMessage);
      return;
    }
    
    // Clear validation errors if validation passes
    setValidationErrors([]);
    
    // Create new programming strategy object
    const newStrategy = {
      id: Date.now().toString(), // Generate unique ID
      user_id: (user as any)?.id || '1',
      name: programmingFormData.name || `Programming Strategy ${new Date().toLocaleDateString()}`,
      description: programmingFormData.description || 'Custom programming strategy',
      strategy_type: 'PROGRAMMING',
      symbol: programmingFormData.symbol || 'NIFTY50',
      entry_conditions: 'Custom programming logic',
      exit_conditions: 'Custom exit conditions',
      risk_management: {
        stop_loss: programmingFormData.stop_loss || '2%',
        take_profit: programmingFormData.take_profit || '4%',
        position_size: programmingFormData.position_size || '1 lot'
      },
      is_active: false,
      created_at: new Date(),
      updated_at: new Date(),
      performance_metrics: {
        total_trades: 0,
        winning_trades: 0,
        total_pnl: 0,
        max_drawdown: 0,
        sharpe_ratio: 0
      },
      strategy_data: {
        ...programmingFormData
      }
    };

    // Save to database
    try {
      const response = await fetch('/api/strategies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: (user as any)?.id || 'tradesetu001',
          name: newStrategy.name,
          description: newStrategy.description,
          strategy_type: newStrategy.strategy_type,
          symbol: newStrategy.symbol,
          entry_conditions: newStrategy.entry_conditions,
          exit_conditions: newStrategy.exit_conditions,
          risk_management: newStrategy.risk_management,
          is_paper_trading: true
        }),
      });

      if (response.ok) {
        console.log('Programming strategy saved successfully');
        router.push('/strategies');
      } else {
        const errorData = await response.json();
        console.error('Failed to save programming strategy:', errorData);
        alert(`Error saving strategy: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving programming strategy:', error);
      alert(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Function to check if a field is empty and should show error styling
  const isFieldEmpty = (fieldName: string) => {
    const value = timeIndicatorFormData[fieldName as keyof typeof timeIndicatorFormData];
    return typeof value === 'string' && !value.trim();
  };

  // Function to get field styling based on validation state
  const getFieldStyling = (fieldName: string, baseClasses: string) => {
    if (isFieldEmpty(fieldName)) {
      return baseClasses.replace('border-green-500/30', 'border-red-500/50').replace('focus:ring-green-400', 'focus:ring-red-400');
    }
    return baseClasses;
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

  // Handler for long comparator selection with dependency logic
  const handleLongComparatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    setLongComparator(selectedValue);
    
    // Auto-select corresponding short comparator
    if (selectedValue === 'crosses_above') {
      setShortComparator('crosses_below');
    } else if (selectedValue === 'crosses_below') {
      setShortComparator('crosses_above');
    } else if (selectedValue === 'less_than') {
      setShortComparator('higher_than');
    } else if (selectedValue === 'higher_than') {
      setShortComparator('less_than');
    } else if (selectedValue === 'equal') {
      setShortComparator('equal');
    }
  };

  // Handler for short comparator selection with dependency logic
  const handleShortComparatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    setShortComparator(selectedValue);
    
    // Auto-select corresponding long comparator
    if (selectedValue === 'crosses_above') {
      setLongComparator('crosses_below');
    } else if (selectedValue === 'crosses_below') {
      setLongComparator('crosses_above');
    } else if (selectedValue === 'less_than') {
      setLongComparator('higher_than');
    } else if (selectedValue === 'higher_than') {
      setLongComparator('less_than');
    } else if (selectedValue === 'equal') {
      setLongComparator('equal');
    }
  };

     // Available instruments for strategy creation
  const availableInstruments = [
    { symbol: 'NIFTY 50', name: 'NIFTY 50', segment: 'INDEX', lotSize: 50 },
    { symbol: 'BANKNIFTY', name: 'BANK NIFTY', segment: 'INDEX', lotSize: 25 },
    { symbol: 'FINNIFTY', name: 'FINANCIAL NIFTY', segment: 'INDEX', lotSize: 40 },
    { symbol: 'MIDCPNIFTY', name: 'MIDCAP NIFTY', segment: 'INDEX', lotSize: 75 }
  ];

  // Handle instrument search
  const handleInstrumentSearch = (query: string) => {
    setInstrumentSearch(prev => ({
      ...prev,
      searchQuery: query,
      isSearching: query.length > 0
    }));

    if (query.length > 0) {
      const filtered = availableInstruments.filter(instrument =>
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

   // Handle adding entry conditions
   const addEntryCondition = (type: 'long' | 'short') => {
     const newCondition = {
       id: Date.now(),
       indicator1: '',
       comparator: '',
       indicator2: ''
     };
     
     setTimeIndicatorFormData(prev => ({
       ...prev,
       entryConditions: {
         ...prev.entryConditions,
         [type]: [...prev.entryConditions[type], newCondition]
       }
     }));
   };

   // Handle removing entry conditions
   const removeEntryCondition = (type: 'long' | 'short', id: number) => {
     setTimeIndicatorFormData(prev => ({
       ...prev,
       entryConditions: {
         ...prev.entryConditions,
         [type]: prev.entryConditions[type].filter(condition => condition.id !== id)
       }
     }));
   };

   // Handle updating entry condition values
   const updateEntryCondition = (type: 'long' | 'short', id: number, field: string, value: string) => {
     setTimeIndicatorFormData(prev => ({
       ...prev,
       entryConditions: {
         ...prev.entryConditions,
         [type]: prev.entryConditions[type].map(condition => 
           condition.id === id ? { ...condition, [field]: value } : condition
         )
       }
     }));
   };

   // Handle adding condition blocks
   const addConditionBlock = () => {
     setConditionBlocks(prev => prev + 1);
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
        {/* Required Fields Notice */}
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl p-4 border border-orange-500/20">
          <div className="flex items-center space-x-3">
            <AlertTriangle size={20} className="text-orange-400" />
            <div>
              <h4 className="text-white font-semibold">Required Fields</h4>
              <p className="text-orange-200 text-sm">
                Fields marked with <span className="text-red-400 font-bold">*</span> are required to save your strategy
              </p>
            </div>
          </div>
        </div>

        {/* Validation Errors Display */}
        {validationErrors.length > 0 && (
          <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-2xl p-4 border border-red-500/20">
            <div className="flex items-start space-x-3">
              <AlertTriangle size={20} className="text-red-400 mt-1" />
              <div className="flex-1">
                <h4 className="text-white font-semibold mb-2">Please fix the following errors:</h4>
                <ul className="space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-red-200 text-sm flex items-center space-x-2">
                      <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

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
                <label className="block text-green-300 text-sm font-semibold mb-3 group-hover:text-green-200 transition-colors duration-300">
                  Strategy Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={timeIndicatorFormData.name}
                  onChange={handleTimeIndicatorChange}
                  className={getFieldStyling('name', "w-full p-4 bg-gradient-to-r from-white/10 to-white/5 border border-green-500/30 rounded-2xl text-white focus:ring-2 focus:ring-green-400 focus:outline-none transition-all duration-500 transform group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-green-500/25 backdrop-blur-sm")}
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
                <label className="block text-green-300 text-sm font-semibold mb-3 group-hover:text-green-200 transition-colors duration-300">
                  Primary Indicator <span className="text-red-400">*</span>
                </label>
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
            <label className="block text-green-300 text-sm font-semibold mb-3">
              Symbol <span className="text-red-400">*</span>
            </label>
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
                <label className="block text-green-300 text-sm font-semibold mb-3 group-hover:text-green-200 transition-colors duration-300">
                  Entry Conditions <span className="text-red-400">*</span>
                </label>
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
                <label className="block text-green-300 text-sm font-semibold mb-3 group-hover:text-green-200 transition-colors duration-300">
                  Exit Conditions <span className="text-red-400">*</span>
                </label>
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
                <div className="flex items-center space-x-2">
                  {/* Hour Dropdown */}
                  <div className="relative flex-1">
                    <select
                      name="strategy_start_time_hour"
                      value={timeIndicatorFormData.strategy_start_time.split(':')[0]}
                      onChange={(e) => {
                        const currentMinute = timeIndicatorFormData.strategy_start_time.split(':')[1];
                        const newTime = `${e.target.value}:${currentMinute}`;
                        setTimeIndicatorFormData(prev => ({
                          ...prev,
                          strategy_start_time: newTime
                        }));
                      }}
                      className="w-full p-4 pr-8 bg-gradient-to-r from-white/10 to-white/5 border border-purple-500/30 rounded-2xl text-white focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-500 transform group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-purple-500/25 backdrop-blur-sm appearance-none cursor-pointer hover:border-purple-400"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i.toString().padStart(2, '0')} className="bg-slate-800 text-white">
                          {i.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-purple-300"></div>
                    </div>
                  </div>
                  
                  {/* Separator */}
                  <span className="text-purple-300 font-bold text-lg">:</span>
                  
                  {/* Minute Dropdown */}
                  <div className="relative flex-1">
                    <select
                      name="strategy_start_time_minute"
                      value={timeIndicatorFormData.strategy_start_time.split(':')[1]}
                      onChange={(e) => {
                        const currentHour = timeIndicatorFormData.strategy_start_time.split(':')[0];
                        const newTime = `${currentHour}:${e.target.value}`;
                        setTimeIndicatorFormData(prev => ({
                          ...prev,
                          strategy_start_time: newTime
                        }));
                      }}
                      className="w-full p-4 pr-8 bg-gradient-to-r from-white/10 to-white/5 border border-purple-500/30 rounded-2xl text-white focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-500 transform group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-purple-500/25 backdrop-blur-sm appearance-none cursor-pointer hover:border-purple-400"
                    >
                      {Array.from({ length: 60 }, (_, i) => (
                        <option key={i} value={i.toString().padStart(2, '0')} className="bg-slate-800 text-white">
                          {i.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-purple-300"></div>
                    </div>
                  </div>
                  
                  {/* Clock Icon */}
                  <div className="flex-shrink-0">
                    <Clock size={20} className="text-purple-300" />
                  </div>
                </div>
                

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
                <label className="block text-red-300 text-sm font-semibold mb-3 group-hover:text-red-200 transition-colors duration-300">
                  Stop Loss <span className="text-red-400">*</span>
                </label>
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
                <label className="block text-red-300 text-sm font-semibold mb-3 group-hover:text-red-200 transition-colors duration-300">
                  Take Profit <span className="text-red-400">*</span>
                </label>
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
                <label className="block text-red-300 text-sm font-semibold mb-3 group-hover:text-red-200 transition-colors duration-300">
                  Position Size <span className="text-red-400">*</span>
                </label>
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

      {/* Underlying Search & Select Card */}
      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl p-4 border border-blue-500/20">
                 <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-3">
           <span>Select Underlying</span>
          </h3>
          
        <div className="space-y-3">
                     {/* Search Input with Dropdown */}
            <div className="group relative">
              <div className="relative">
               <div className="p-3 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-blue-500/30 rounded-lg">
              <div className="relative">
            <input
              type="text"
                     value={instrumentSearch.searchQuery}
                     onChange={(e) => handleInstrumentSearch(e.target.value)}
                     className="w-full p-2 pl-8 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-green-500/30 rounded-lg text-white focus:ring-1 focus:ring-green-400 focus:outline-none transition-all duration-300 backdrop-blur-sm text-sm"
                     placeholder="Search NIFTY, BANKNIFTY, RELIANCE..."
                   />
                   <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                     <Search size={14} className="text-green-300" />
          </div>
                   {instrumentSearch.selectedInstrument && (
                  <button 
                    onClick={handleInstrumentRemove}
                       className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                       <X size={14} className="text-red-300 hover:text-red-200" />
                  </button>
                   )}
                    </div>
                  </div>
                  
              {/* Search Results Dropdown */}
              {instrumentSearch.isSearching && instrumentSearch.searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gradient-to-r from-slate-800/95 to-slate-700/95 rounded-xl border border-blue-500/30 backdrop-blur-sm max-h-48 overflow-y-auto z-10">
                  <div className="p-2">
                    <div className="space-y-1">
                      {instrumentSearch.searchResults.map((instrument, index) => (
                        <div
                          key={index}
                          onClick={() => handleInstrumentSelect(instrument)}
                          className="group cursor-pointer p-2 rounded-lg bg-gradient-to-r from-white/5 to-white/3 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-200 hover:scale-105"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                              <div>
                                <div className="text-white font-semibold text-sm">{instrument.symbol}</div>
                                <div className="text-blue-200 text-xs">{instrument.name}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-blue-200 text-xs">{instrument.segment}</div>
                              <div className="text-blue-300 text-xs">Lot: {instrument.lotSize}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                    </div>
                  )}
            </div>
          </div>

                     {/* Quick Selection Buttons */}
           <div className="grid grid-cols-4 gap-2">
             {availableInstruments.slice(0, 4).map((instrument, index) => (
                          <button
                            key={index}
                            onClick={() => handleInstrumentSelect(instrument)}
                 className="group p-2 rounded-lg bg-gradient-to-r from-white/5 to-white/3 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-200 hover:scale-105"
               >
                 <div className="text-center">
                   <div className="text-white font-semibold text-xs">{instrument.symbol}</div>
                   <div className="text-blue-200 text-xs mt-1">{instrument.segment}</div>
                 </div>
                          </button>
                        ))}
          </div>

          {/* Warning if no underlying selected */}
          {!isUnderlyingSelected && (
            <div className="mt-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl p-4 border border-orange-500/20">
              <div className="flex items-center space-x-3">
                <AlertTriangle size={20} className="text-orange-400" />
                <div>
                  <h4 className="text-white font-semibold">Select Underlying Required</h4>
                  <p className="text-orange-200 text-sm">
                    You must select an underlying instrument before you can configure your strategy
                  </p>
                </div>
              </div>
            </div>
          )}

           {/* Trading Configuration */}
           <div className="mt-4 space-y-4">
             {/* Row 1: Order Type, Start Time, Square Off, Days */}
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
               {/* Order Type */}
               <div>
                 <label className="block text-blue-300 text-xs font-semibold mb-2">Order Type</label>
                 <div className="space-y-1">
              {['MIS', 'CNC', 'BTST'].map((type) => (
                     <label key={type} className="flex items-center space-x-2 cursor-pointer">
                       <input
                         type="radio"
                         name="order_type"
                         value={type}
                         checked={timeIndicatorFormData.order_type === type}
                         onChange={(e) => setTimeIndicatorFormData(prev => ({ ...prev, order_type: e.target.value }))}
                         className="w-3 h-3 text-blue-600 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-full focus:ring-1 focus:ring-blue-400"
                       />
                       <span className="text-white text-xs">{type}</span>
                     </label>
              ))}
            </div>
          </div>

               {/* Start Time */}
               <div>
                 <label className="block text-blue-300 text-xs font-semibold mb-2">
                   Start Time <span className="text-red-400">*</span>
                 </label>
                 <div className="flex items-center space-x-2">
                   {/* Hour Dropdown */}
                   <div className="relative flex-1">
                     <select
                       name="start_time_hour"
                       value={(timeIndicatorFormData.start_time || '09:15').split(':')[0]}
                       onChange={(e) => {
                         const currentMinute = (timeIndicatorFormData.start_time || '09:15').split(':')[1];
                         const newTime = `${e.target.value}:${currentMinute}`;
                         setTimeIndicatorFormData(prev => ({
                           ...prev,
                           start_time: newTime
                         }));
                       }}
                       className="w-full p-2 pr-6 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-blue-500/30 rounded-lg text-white text-xs focus:ring-1 focus:ring-blue-400 focus:outline-none appearance-none cursor-pointer hover:border-blue-400"
                     >
                       {Array.from({ length: 24 }, (_, i) => (
                         <option key={i} value={i.toString().padStart(2, '0')} className="bg-slate-800 text-white">
                           {i.toString().padStart(2, '0')}
                         </option>
                       ))}
                     </select>
                     <div className="absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none">
                       <div className="w-0 h-0 border-l-3 border-l-transparent border-r-3 border-r-transparent border-t-3 border-t-blue-300"></div>
                     </div>
                   </div>
                   
                   {/* Separator */}
                   <span className="text-blue-300 font-bold text-sm">:</span>
                   
                   {/* Minute Dropdown */}
                   <div className="relative flex-1">
                     <select
                       name="start_time_minute"
                       value={(timeIndicatorFormData.start_time || '09:15').split(':')[1]}
                       onChange={(e) => {
                         const currentHour = (timeIndicatorFormData.start_time || '09:15').split(':')[0];
                         const newTime = `${currentHour}:${e.target.value}`;
                         setTimeIndicatorFormData(prev => ({
                           ...prev,
                           start_time: newTime
                         }));
                       }}
                       className="w-full p-2 pr-6 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-blue-500/30 rounded-lg text-white text-xs focus:ring-1 focus:ring-blue-400 focus:outline-none appearance-none cursor-pointer hover:border-blue-400"
                     >
                       {Array.from({ length: 60 }, (_, i) => (
                         <option key={i} value={i.toString().padStart(2, '0')} className="bg-slate-800 text-white">
                           {i.toString().padStart(2, '0')}
                         </option>
                       ))}
                     </select>
                     <div className="absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none">
                       <div className="w-0 h-0 border-l-3 border-l-transparent border-r-3 border-r-transparent border-t-3 border-t-blue-300"></div>
                     </div>
                   </div>
                   
                   {/* Clock Icon */}
                   <div className="flex-shrink-0">
                     <Clock size={12} className="text-blue-300" />
                   </div>
                 </div>
                 

               </div>

                                                               {/* Square Off */}
                 <div>
                   <label className="block text-blue-300 text-xs font-semibold mb-2">
                     Square Off <span className="text-red-400">*</span>
                   </label>
                   <div className="flex items-center space-x-2">
                     {/* Hour Dropdown */}
                     <div className="relative flex-1">
                       <select
                         name="square_off_time_hour"
                         value={(timeIndicatorFormData.square_off_time || '15:15').split(':')[0]}
                         onChange={(e) => {
                           const currentMinute = (timeIndicatorFormData.square_off_time || '15:15').split(':')[1];
                           const newTime = `${e.target.value}:${currentMinute}`;
                           setTimeIndicatorFormData(prev => ({
                             ...prev,
                             square_off_time: newTime
                           }));
                         }}
                         className="w-full p-2 pr-6 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-blue-500/30 rounded-lg text-white text-xs focus:ring-1 focus:ring-blue-400 focus:outline-none appearance-none cursor-pointer hover:border-blue-400"
                       >
                         {Array.from({ length: 24 }, (_, i) => (
                           <option key={i} value={i.toString().padStart(2, '0')} className="bg-slate-800 text-white">
                             {i.toString().padStart(2, '0')}
                           </option>
                         ))}
                       </select>
                       <div className="absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none">
                         <div className="w-0 h-0 border-l-3 border-l-transparent border-r-3 border-r-transparent border-t-3 border-t-blue-300"></div>
                       </div>
                     </div>
                     
                     {/* Separator */}
                     <span className="text-blue-300 font-bold text-sm">:</span>
                     
                     {/* Minute Dropdown */}
                     <div className="relative flex-1">
                       <select
                         name="square_off_time_minute"
                         value={(timeIndicatorFormData.square_off_time || '15:15').split(':')[1]}
                         onChange={(e) => {
                           const currentHour = (timeIndicatorFormData.square_off_time || '15:15').split(':')[0];
                           const newTime = `${currentHour}:${e.target.value}`;
                           setTimeIndicatorFormData(prev => ({
                             ...prev,
                             square_off_time: newTime
                           }));
                         }}
                         className="w-full p-2 pr-6 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-blue-500/30 rounded-lg text-white text-xs focus:ring-1 focus:ring-blue-400 focus:outline-none appearance-none cursor-pointer hover:border-blue-400"
                       >
                         {Array.from({ length: 60 }, (_, i) => (
                           <option key={i} value={i.toString().padStart(2, '0')} className="bg-slate-800 text-white">
                             {i.toString().padStart(2, '0')}
                           </option>
                         ))}
                       </select>
                       <div className="absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none">
                         <div className="w-0 h-0 border-l-3 border-l-transparent border-r-3 border-r-transparent border-t-3 border-t-blue-300"></div>
                       </div>
                     </div>
                     
                     {/* Clock Icon */}
                     <div className="flex-shrink-0">
                       <Clock size={12} className="text-blue-300" />
                     </div>
                   </div>
                   

                 </div>

               {/* Days of Week */}
               <div>
                 <label className="block text-blue-300 text-xs font-semibold mb-2">Days of Week</label>
                 <div className="grid grid-cols-5 gap-1">
                   {['MON', 'TUE', 'WED', 'THU', 'FRI'].map((day) => (
                <button
                       key={day}
                                               onClick={() => {
                          const dayKey = day.toLowerCase() as keyof typeof timeIndicatorFormData.working_days;
                          setTimeIndicatorFormData(prev => ({
                            ...prev,
                            working_days: {
                              ...prev.working_days,
                              [dayKey]: !prev.working_days[dayKey]
                            }
                          }));
                        }}
                                               className={`p-1 rounded text-xs font-medium transition-all duration-200 ${
                          timeIndicatorFormData.working_days[day.toLowerCase() as keyof typeof timeIndicatorFormData.working_days]
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/5 text-blue-300 border border-blue-500/30'
                        }`}
                     >
                       {day}
                </button>
              ))}
                 </div>
            </div>
          </div>

             {/* Row 2: Transaction Type, Chart Type, Interval */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Transaction Type */}
               <div>
                 <label className="block text-blue-300 text-xs font-semibold mb-2">Transaction Type</label>
                 <div className="flex space-x-1">
              {['Both Side', 'Only Long', 'Only Short'].map((type) => (
                <button
                  key={type}
                       onClick={() => setTimeIndicatorFormData(prev => ({ ...prev, transaction_type: type }))}
                       className={`flex-1 p-2 rounded text-xs font-medium transition-all duration-200 ${
                    timeIndicatorFormData.transaction_type === type
                           ? 'bg-blue-500 text-white'
                           : 'bg-white/5 text-blue-300 border border-blue-500/30'
                  }`}
                >
                       {type}
                </button>
              ))}
            </div>
                 <div className="flex items-center justify-end mt-1">
                   <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            </div>
          </div>

          {/* Chart Type */}
                <div>
                  <label className="block text-blue-300 text-xs font-semibold mb-2">Chart Type</label>
                  <div className="flex space-x-1">
                <button
                      onClick={() => setTimeIndicatorFormData(prev => ({ ...prev, chart_type: 'Candle' }))}
                      className={`flex-1 p-2 rounded text-xs font-medium transition-all duration-200 flex items-center justify-center space-x-1 ${
                        timeIndicatorFormData.chart_type === 'Candle'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/5 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      <BarChart3 size={12} />
                      <span>Candle</span>
                </button>
            </div>
          </div>

               {/* Interval */}
          <div>
                 <label className="block text-blue-300 text-xs font-semibold mb-2">Interval</label>
                 <div className="flex space-x-1">
                   {['1 Min', '3 Min', '5 Min', '10 Min', '15 Min', '30 Min', '1 H'].map((interval) => (
                <button
                  key={interval}
                       onClick={() => setTimeIndicatorFormData(prev => ({ ...prev, interval }))}
                       className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                    timeIndicatorFormData.interval === interval
                           ? 'bg-blue-500 text-white'
                           : 'bg-white/5 text-blue-300 border border-blue-500/30'
                  }`}
                >
                       {interval}
                </button>
              ))}
            </div>
          </div>
        </div>
            </div>
          </div>
        </div>

      {/* Entry Conditions Card */}
      <div className={`rounded-2xl p-4 border transition-all duration-300 ${
        isUnderlyingSelected 
          ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20' 
          : 'bg-gradient-to-r from-gray-500/10 to-gray-600/10 border-gray-500/20 opacity-50'
      }`}>
        <h3 className="text-lg font-bold text-white mb-4">
          <span>Entry conditions</span>
          {!isUnderlyingSelected && (
            <span className="text-orange-400 text-sm ml-2">(Select underlying first)</span>
          )}
          </h3>
          
        <div className="space-y-4">
          {/* Dynamic Condition Blocks */}
          {Array.from({ length: conditionBlocks }, (_, blockIndex) => (
            <div key={blockIndex}>
              {/* Condition Block */}
              <div className="space-y-4 relative">
                {/* Delete Button - Show only for blocks after the first one */}
                {blockIndex > 0 && (
                  <div className="absolute top-0 right-0 z-10">
                    <button
                      onClick={() => setConditionBlocks(prev => prev - 1)}
                      className="p-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-full transition-all duration-200 hover:scale-110"
                      title="Delete this condition block"
                    >
                      <X size={14} />
                    </button>
              </div>
                )}
                
                {/* Long Entry condition - Show only if Both Side or Only Long is selected */}
                {(timeIndicatorFormData.transaction_type === 'Both Side' || timeIndicatorFormData.transaction_type === 'Only Long') && (
                  <div>
                    <span className="text-green-400 font-semibold text-sm">Long Entry condition</span>
                    <div className="mt-2 space-y-3">
                      {/* First Indicator */}
                      <div className="grid grid-cols-3 gap-2">
                        <button 
                          type="button"
                          onClick={() => openIndicatorModal('long1')}
                          disabled={!isUnderlyingSelected}
                          className={`p-2 border rounded-lg text-white text-xs focus:outline-none transition-all duration-200 text-left ${
                            isUnderlyingSelected
                              ? 'bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-green-500/30 focus:ring-1 focus:ring-green-400 hover:border-green-400'
                              : 'bg-gradient-to-r from-gray-600/80 to-gray-700/80 border-gray-500/30 cursor-not-allowed opacity-50'
                          }`}
                        >
                          {selectedIndicators.long1?.indicator ? 
                            indicators.find(ind => ind.value === selectedIndicators.long1?.indicator)?.label || 'Select Indicator' 
                            : 'Select Indicator'
                          }
                        </button>
                        
                      <select 
                        value={longComparator}
                        onChange={handleLongComparatorChange}
                        disabled={!isUnderlyingSelected}
                        className={`p-2 border rounded-lg text-white text-xs focus:outline-none appearance-none ${
                          isUnderlyingSelected
                            ? 'bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-green-500/30 focus:ring-1 focus:ring-green-400'
                            : 'bg-gradient-to-r from-gray-600/80 to-gray-700/80 border-gray-500/30 cursor-not-allowed opacity-50'
                        }`}
                      >
                        <option value="">Select Comparator</option>
                        <option value="crosses_above">Crosses Above</option>
                        <option value="crosses_below">Crosses Below</option>
                        <option value="higher_than">Higher than</option>
                        <option value="less_than">Less than</option>
                        <option value="equal">Equal</option>
                      </select>
                        
                        <button 
                          type="button"
                          onClick={() => openIndicatorModal('long2')}
                          disabled={!isUnderlyingSelected}
                          className={`p-2 border rounded-lg text-white text-xs focus:outline-none transition-all duration-200 text-left ${
                            isUnderlyingSelected
                              ? 'bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-green-500/30 focus:ring-1 focus:ring-green-400 hover:border-green-400'
                              : 'bg-gradient-to-r from-gray-600/80 to-gray-700/80 border-gray-500/30 cursor-not-allowed opacity-50'
                          }`}
                        >
                          {selectedIndicators.long2?.indicator ? 
                            indicators.find(ind => ind.value === selectedIndicators.long2?.indicator)?.label || 'Select Indicator' 
                            : 'Select Indicator'
                          }
                        </button>
                      </div>


              </div>
            </div>
                )}

                {/* Short Entry condition - Show only if Both Side or Only Short is selected */}
                {(timeIndicatorFormData.transaction_type === 'Both Side' || timeIndicatorFormData.transaction_type === 'Only Short') && (
                  <div>
                    <span className="text-red-400 font-semibold text-sm">Short Entry condition</span>
                    <div className="mt-2 space-y-3">
                      {/* First Indicator */}
                      <div className="grid grid-cols-3 gap-2">
                        <button 
                          type="button"
                          onClick={() => openIndicatorModal('short1')}
                          disabled={!isUnderlyingSelected}
                          className={`p-2 border rounded-lg text-white text-xs focus:outline-none transition-all duration-200 text-left ${
                            isUnderlyingSelected
                              ? 'bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-red-500/30 focus:ring-1 focus:ring-red-400 hover:border-red-400'
                              : 'bg-gradient-to-r from-gray-600/80 to-gray-700/80 border-gray-500/30 cursor-not-allowed opacity-50'
                          }`}
                        >
                          {selectedIndicators.short1?.indicator ? 
                            indicators.find(ind => ind.value === selectedIndicators.short1?.indicator)?.label || 'Select Indicator' 
                            : 'Select Indicator'
                          }
                        </button>
                        
                      <select 
                        value={shortComparator}
                        onChange={handleShortComparatorChange}
                        disabled={!isUnderlyingSelected}
                        className={`p-2 border rounded-lg text-white text-xs focus:outline-none appearance-none ${
                          isUnderlyingSelected
                            ? 'bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-red-500/30 focus:ring-1 focus:ring-red-400'
                            : 'bg-gradient-to-r from-gray-600/80 to-gray-700/80 border-gray-500/30 cursor-not-allowed opacity-50'
                        }`}
                      >
                        <option value="">Select Comparator</option>
                        <option value="crosses_above">Crosses Above</option>
                        <option value="crosses_below">Crosses Below</option>
                        <option value="higher_than">Higher than</option>
                        <option value="less_than">Less than</option>
                        <option value="equal">Equal</option>
                      </select>
                        
                        <button 
                          type="button"
                          onClick={() => openIndicatorModal('short2')}
                          disabled={!isUnderlyingSelected}
                          className={`p-2 border rounded-lg text-white text-xs focus:outline-none transition-all duration-200 text-left ${
                            isUnderlyingSelected
                              ? 'bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-red-500/30 focus:ring-1 focus:ring-red-400 hover:border-red-400'
                              : 'bg-gradient-to-r from-gray-600/80 to-gray-700/80 border-gray-500/30 cursor-not-allowed opacity-50'
                          }`}
                        >
                          {selectedIndicators.short2?.indicator ? 
                            indicators.find(ind => ind.value === selectedIndicators.short2?.indicator)?.label || 'Select Indicator' 
                            : 'Select Indicator'
                          }
                        </button>
                      </div>


              </div>
            </div>
                )}
          </div>

              {/* AND/OR Toggle - Show only if there are multiple blocks and not the last block */}
              {conditionBlocks > 1 && blockIndex < conditionBlocks - 1 && (
                <div className="flex justify-center my-4">
                  <div className="flex bg-white/10 rounded-lg p-1 border border-blue-500/30">
                    <button 
                      onClick={() => setLogicalOperator('AND')}
                      className={`px-4 py-2 rounded text-xs font-medium transition-colors ${
                        logicalOperator === 'AND' 
                          ? 'bg-blue-500 text-white' 
                          : 'text-blue-300 hover:text-white'
                      }`}
                    >
                      AND
                    </button>
                    <button 
                      onClick={() => setLogicalOperator('OR')}
                      className={`px-4 py-2 rounded text-xs font-medium transition-colors ${
                        logicalOperator === 'OR' 
                          ? 'bg-blue-500 text-white' 
                          : 'text-blue-300 hover:text-white'
                      }`}
                    >
                      OR
                    </button>
        </div>
                </div>
              )}
            </div>
          ))}

                                {/* Add Condition Button */}
           <div className="flex justify-center pt-4">
           <button
               onClick={addConditionBlock}
               disabled={!isUnderlyingSelected}
               className={`px-6 py-3 font-semibold rounded-lg transition-all duration-300 transform ${
                 isUnderlyingSelected
                   ? 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-105 hover:shadow-lg cursor-pointer'
                   : 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-50'
               }`}
             >
               Add Condition +
           </button>
         </div>
         </div>
       </div>

               {/* Trading Configuration Card */}
        <div className={`rounded-2xl p-6 border transition-all duration-300 ${
          isUnderlyingSelected 
            ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20' 
            : 'bg-gradient-to-r from-gray-500/10 to-gray-600/10 border-gray-500/20 opacity-50'
        }`}>
         <div className="space-y-6">
                       {/* Conditions Section */}
                         <div className="flex justify-between items-start">
                               <div className="flex items-center space-x-3">
                  <span className="text-green-600 font-semibold">When Long Condition</span>
                                   <div className="flex items-center space-x-1">
                     <select 
                       id="long-condition-select"
                       disabled={!isUnderlyingSelected}
                       className={`px-3 py-1 rounded-lg text-sm font-medium border focus:outline-none ${
                         isUnderlyingSelected
                           ? 'bg-green-100 text-green-700 border-green-300 focus:ring-1 focus:ring-green-400'
                           : 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed opacity-50'
                       }`}
                       onChange={(e) => {
                         if (!isUnderlyingSelected) return;
                         const selectedValue = e.target.value;
                         const shortConditionSelect = document.getElementById('short-condition-select') as HTMLSelectElement;
                         if (shortConditionSelect) {
                           // Set the opposite value in the short condition select
                           shortConditionSelect.value = selectedValue === 'CE' ? 'PE' : 'CE';
                         }
                       }}
                     >
                       <option value="CE">CE</option>
                       <option value="PE">PE</option>
                     </select>
                   </div>
                </div>
                               <div className="flex items-center space-x-3 ml-8">
                  <span className="text-red-600 font-semibold">When Short Condition</span>
                                   <div className="flex items-center space-x-1">
                     <select 
                       id="short-condition-select"
                       disabled={!isUnderlyingSelected}
                       className={`px-3 py-1 rounded-lg text-sm font-medium border focus:outline-none ${
                         isUnderlyingSelected
                           ? 'bg-red-100 text-red-700 border-red-300 focus:ring-1 focus:ring-red-400'
                           : 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed opacity-50'
                       }`}
                       onChange={(e) => {
                         if (!isUnderlyingSelected) return;
                         const selectedValue = e.target.value;
                         const longConditionSelect = document.getElementById('long-condition-select') as HTMLSelectElement;
                         if (longConditionSelect) {
                           // Set the opposite value in the long condition select
                           longConditionSelect.value = selectedValue === 'CE' ? 'PE' : 'CE';
                         }
                       }}
                     >
                       <option value="PE">PE</option>
                       <option value="CE">CE</option>
                     </select>
                   </div>
                </div>
             </div>

                                                                                               {/* Trading Parameters Row */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                <div className="flex flex-col">
                  <label className="text-xs text-blue-300 mb-1">Action</label>
                  <select 
                    disabled={!isUnderlyingSelected}
                    className={`p-2 rounded text-sm font-medium border focus:outline-none ${
                      isUnderlyingSelected
                        ? 'bg-green-100 text-green-700 border-green-300 focus:ring-1 focus:ring-green-400'
                        : 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                  </select>
                </div>
              
                <div className="flex flex-col">
                  <label className="text-xs text-blue-300 mb-1">Qty</label>
                  <input 
                    type="number" 
                    placeholder="75"
                    disabled={!isUnderlyingSelected}
                    className={`w-full p-2 border rounded text-sm focus:outline-none ${
                      isUnderlyingSelected
                        ? 'border-gray-300 focus:ring-1 focus:ring-blue-400'
                        : 'border-gray-500 bg-gray-100 text-gray-500 cursor-not-allowed opacity-50'
                    }`}
                    onChange={(e) => {
                      if (!isUnderlyingSelected) return;
                      // Update quantity based on lot size
                      const quantity = parseInt(e.target.value) || 0;
                      const lotSize = instrumentSearch.selectedInstrument?.lotSize || 50;
                      const totalQuantity = quantity * lotSize;
                      console.log(`Quantity: ${quantity}, Lot Size: ${lotSize}, Total: ${totalQuantity}`);
                    }}
                />
              </div>
              
                <div className="flex flex-col">
                  <label className="text-xs text-blue-300 mb-1">Expiry</label>
                  <select 
                    disabled={!isUnderlyingSelected}
                    className={`px-2 py-2 rounded text-sm font-medium border focus:outline-none ${
                      isUnderlyingSelected
                        ? 'bg-blue-100 text-blue-700 border-blue-300 focus:ring-1 focus:ring-blue-400'
                        : 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
            </div>

                                 <div className="flex flex-col">
                   <label className="text-xs text-blue-300 mb-1">Strike Configuration</label>
                   <div className="flex space-x-1">
                     <select 
                       id="strikeTypeSelect"
                       disabled={!isUnderlyingSelected}
                       className={`px-2 py-2 rounded text-sm font-medium border focus:outline-none ${
                         isUnderlyingSelected
                           ? 'bg-blue-100 text-blue-700 border-blue-300 focus:ring-1 focus:ring-blue-400'
                           : 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed opacity-50'
                       }`}
                       onChange={(e) => {
                         if (!isUnderlyingSelected) return;
                         const strikeType = e.target.value;
                         const strikeOffsetContainer = document.getElementById('strikeOffsetContainer');
                         
                         if (!strikeOffsetContainer) return;
                         
                         if (strikeType === 'ATM pt') {
                           // Show ITM/OTM point-based options
                           strikeOffsetContainer.innerHTML = `
                             <select 
                               id="strikeOffsetSelect"
                               class="bg-blue-100 text-blue-700 px-2 py-2 rounded text-sm font-medium border border-blue-300 focus:ring-1 focus:ring-blue-400 focus:outline-none"
                             >
                               <option value="ITM 1000">ITM 1000</option>
                               <option value="ITM 900">ITM 900</option>
                               <option value="ITM 800">ITM 800</option>
                               <option value="ITM 700">ITM 700</option>
                               <option value="ITM 600">ITM 600</option>
                               <option value="ITM 500">ITM 500</option>
                               <option value="ITM 400">ITM 400</option>
                               <option value="ITM 300">ITM 300</option>
                               <option value="ITM 200">ITM 200</option>
                               <option value="ITM 100">ITM 100</option>
                               <option value="ATM">ATM</option>
                               <option value="OTM 100">OTM 100</option>
                               <option value="OTM 200">OTM 200</option>
                               <option value="OTM 300">OTM 300</option>
                               <option value="OTM 400">OTM 400</option>
                               <option value="OTM 500">OTM 500</option>
                               <option value="OTM 600">OTM 600</option>
                               <option value="OTM 700">OTM 700</option>
                               <option value="OTM 800">OTM 800</option>
                               <option value="OTM 900">OTM 900</option>
                               <option value="OTM 1000">OTM 1000</option>
                             </select>
                           `;
                         } else if (strikeType === 'ATM %') {
                           // Show percentage-based options
                           strikeOffsetContainer.innerHTML = `
                             <select 
                               id="strikeOffsetSelect"
                               class="bg-blue-100 text-blue-700 px-2 py-2 rounded text-sm font-medium border border-blue-300 focus:ring-1 focus:ring-blue-400 focus:outline-none"
                             >
                               <option value="ITM 20.0%">ITM 20.0%</option>
                               <option value="ITM 19.0%">ITM 19.0%</option>
                               <option value="ITM 18.0%">ITM 18.0%</option>
                               <option value="ITM 17.0%">ITM 17.0%</option>
                               <option value="ITM 16.0%">ITM 16.0%</option>
                               <option value="ITM 15.0%">ITM 15.0%</option>
                               <option value="ITM 14.0%">ITM 14.0%</option>
                               <option value="ITM 13.0%">ITM 13.0%</option>
                               <option value="ITM 12.0%">ITM 12.0%</option>
                               <option value="ITM 11.0%">ITM 11.0%</option>
                               <option value="ITM 10.0%">ITM 10.0%</option>
                               <option value="ITM 9.0%">ITM 9.0%</option>
                               <option value="ITM 8.0%">ITM 8.0%</option>
                               <option value="ITM 7.0%">ITM 7.0%</option>
                               <option value="ITM 6.0%">ITM 6.0%</option>
                               <option value="ITM 5.0%">ITM 5.0%</option>
                               <option value="ITM 4.0%">ITM 4.0%</option>
                               <option value="ATM">ATM</option>
                               <option value="OTM 4.0%">OTM 4.0%</option>
                               <option value="OTM 5.0%">OTM 5.0%</option>
                               <option value="OTM 6.0%">OTM 6.0%</option>
                               <option value="OTM 7.0%">OTM 7.0%</option>
                               <option value="OTM 8.0%">OTM 8.0%</option>
                               <option value="OTM 9.0%">OTM 9.0%</option>
                               <option value="OTM 10.0%">OTM 10.0%</option>
                               <option value="OTM 11.0%">OTM 11.0%</option>
                               <option value="OTM 12.0%">OTM 12.0%</option>
                               <option value="OTM 13.0%">OTM 13.0%</option>
                               <option value="OTM 14.0%">OTM 14.0%</option>
                               <option value="OTM 15.0%">OTM 15.0%</option>
                               <option value="OTM 16.0%">OTM 16.0%</option>
                               <option value="OTM 17.0%">OTM 17.0%</option>
                               <option value="OTM 18.0%">OTM 18.0%</option>
                               <option value="OTM 19.0%">OTM 19.0%</option>
                               <option value="OTM 20.0%">OTM 20.0%</option>
                             </select>
                           `;
                         } else {
                           // For CP options, show input field for premium amount
                           strikeOffsetContainer.innerHTML = `
                             <input 
                               type="number" 
                               placeholder="Enter Premium Amount"
                               class="bg-blue-100 text-blue-700 px-2 py-2 rounded text-sm font-medium border border-blue-300 focus:ring-1 focus:ring-blue-400 focus:outline-none"
                               style="width: 100px;"
                             />
                           `;
                         }
                       }}
                     >
                       <option value="ATM pt">ATM pt</option>
                       <option value="ATM %">ATM %</option>
                       <option value="CP">CP</option>
                       <option value="CP >=">CP &gt;=</option>
                       <option value="CP <=">CP &lt;=</option>
                     </select>
                     <div id="strikeOffsetContainer">
                       <select 
                         id="strikeOffsetSelect"
                         className="bg-blue-100 text-blue-700 px-2 py-2 rounded text-sm font-medium border border-blue-300 focus:ring-1 focus:ring-blue-400 focus:outline-none"
                       >
                         <option value="ITM 1000">ITM 1000</option>
                         <option value="ITM 900">ITM 900</option>
                         <option value="ITM 800">ITM 800</option>
                         <option value="ITM 700">ITM 700</option>
                         <option value="ITM 600">ITM 600</option>
                         <option value="ITM 500">ITM 500</option>
                         <option value="ITM 400">ITM 400</option>
                         <option value="ITM 300">ITM 300</option>
                         <option value="ITM 200">ITM 200</option>
                         <option value="ITM 100">ITM 100</option>
                         <option value="ATM">ATM</option>
                         <option value="OTM 100">OTM 100</option>
                         <option value="OTM 200">OTM 200</option>
                         <option value="OTM 300">OTM 300</option>
                         <option value="OTM 400">OTM 400</option>
                         <option value="OTM 500">OTM 500</option>
                         <option value="OTM 600">OTM 600</option>
                         <option value="OTM 700">OTM 700</option>
                         <option value="OTM 800">OTM 800</option>
                         <option value="OTM 900">OTM 900</option>
                         <option value="OTM 1000">OTM 1000</option>
                       </select>
              </div>
            </div>
                 </div>
              
                <div className="flex flex-col">
                  <label className="text-xs text-blue-300 mb-1">SL Type</label>
                  <select className="bg-blue-100 text-blue-700 px-2 py-2 rounded text-sm font-medium border border-blue-300 focus:ring-1 focus:ring-blue-400 focus:outline-none">
                    <option value="SL pt">SL pt</option>
                    <option value="SL %">SL %</option>
                  </select>
          </div>
        </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                <input 
                  type="number" 
                  placeholder="30" 
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
                />
               
                <div className="flex flex-col">
                  <label className="text-xs text-blue-300 mb-1">SL On</label>
                  <select className="bg-blue-100 text-blue-700 px-2 py-2 rounded text-sm font-medium border border-blue-300 focus:ring-1 focus:ring-blue-400 focus:outline-none">
                    <option value="On Price">On Price</option>
                    <option value="On Close">On Close</option>
                  </select>
                </div>
               
                <div className="flex flex-col">
                  <label className="text-xs text-blue-300 mb-1">TP Type</label>
                  <select className="bg-blue-100 text-blue-700 px-2 py-2 rounded text-sm font-medium border border-blue-300 focus:ring-1 focus:ring-blue-400 focus:outline-none">
                    <option value="TP pt">TP pt</option>
                    <option value="TP %">TP %</option>
                  </select>
                </div>
               
                <input
                  type="number"
                  placeholder="0" 
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-end">
                <div className="flex flex-col">
                  <label className="text-xs text-blue-300 mb-1">TP On</label>
                  <select className="bg-blue-100 text-blue-700 px-2 py-2 rounded text-sm font-medium border border-blue-300 focus:ring-1 focus:ring-blue-400 focus:outline-none">
                    <option value="On Price">On Price</option>
                    <option value="On Close">On Close</option>
                  </select>
                </div>
              </div>
              </div>
            </div>

        {/* Risk Management & Profit Trailing Card */}
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl p-6 border border-orange-500/20">
          <div className="space-y-6">
            {/* Risk Management Section */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                <span>Risk management</span>
                <div className="w-4 h-4 bg-orange-400 rounded-full flex items-center justify-center">
                  <span className="text-orange-900 text-xs font-bold">i</span>
                </div>
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs text-orange-300 mb-2">Exit When Over All Profit In Amount (INR)</label>
                <input
                  type="number"
                    placeholder="Enter amount"
                    className="w-full p-3 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-400 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                />
              </div>
                
                <div className="flex flex-col">
                  <label className="text-xs text-orange-300 mb-2">Exit When Over All Loss In Amount (INR)</label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    className="w-full p-3 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-400 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                  />
            </div>

                <div className="flex flex-col">
                  <label className="text-xs text-orange-300 mb-2">Max Trade Cycle</label>
                <input
                  type="number"
                    defaultValue="1"
                    className="w-full p-3 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-400 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-xs text-orange-300 mb-2">No Trade After</label>
                  <div className="flex items-center space-x-2">
                    {/* Hour Dropdown */}
                    <div className="relative flex-1">
                      <select
                        name="noTradeAfterHour"
                        value={timeIndicatorFormData.noTradeAfter.split(':')[0]}
                        onChange={(e) => {
                          const currentMinute = timeIndicatorFormData.noTradeAfter.split(':')[1];
                          const newTime = `${e.target.value}:${currentMinute}`;
                          setTimeIndicatorFormData(prev => ({
                            ...prev,
                            noTradeAfter: newTime
                          }));
                        }}
                        className="w-full p-3 pr-8 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-orange-500/30 rounded-lg text-white focus:ring-1 focus:ring-orange-400 focus:outline-none transition-all duration-300 backdrop-blur-sm appearance-none cursor-pointer hover:border-orange-400"
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i.toString().padStart(2, '0')} className="bg-slate-800 text-white">
                            {i.toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-orange-300"></div>
                      </div>
                    </div>
                    
                    {/* Separator */}
                    <span className="text-orange-300 font-bold text-lg">:</span>
                    
                    {/* Minute Dropdown */}
                    <div className="relative flex-1">
                      <select
                        name="noTradeAfterMinute"
                        value={timeIndicatorFormData.noTradeAfter.split(':')[1]}
                        onChange={(e) => {
                          const currentHour = timeIndicatorFormData.noTradeAfter.split(':')[0];
                          const newTime = `${currentHour}:${e.target.value}`;
                          setTimeIndicatorFormData(prev => ({
                            ...prev,
                            noTradeAfter: newTime
                          }));
                        }}
                        className="w-full p-3 pr-8 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-orange-500/30 rounded-lg text-white focus:ring-1 focus:ring-orange-400 focus:outline-none transition-all duration-300 backdrop-blur-sm appearance-none cursor-pointer hover:border-orange-400"
                      >
                        {Array.from({ length: 60 }, (_, i) => (
                          <option key={i} value={i.toString().padStart(2, '0')} className="bg-slate-800 text-white">
                            {i.toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-orange-300"></div>
                      </div>
                    </div>
                    
                    {/* Clock Icon */}
                    <div className="flex-shrink-0">
                      <Clock size={20} className="text-orange-300" />
                    </div>
                  </div>
                  

                </div>
          </div>
        </div>

            {/* Profit Trailing Section */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                <span>Profit Trailing</span>
                <div className="w-4 h-4 bg-orange-400 rounded-full flex items-center justify-center">
                  <span className="text-orange-900 text-xs font-bold">i</span>
        </div>
              </h3>
              
                            <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="profit_trailing"
                    value="no_trailing"
                    checked={profitTrailingType === 'no_trailing'}
                    onChange={(e) => setProfitTrailingType(e.target.value as any)}
                    className="w-4 h-4 text-orange-600 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-full focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                  />
                  <span className="text-white font-medium">No Trailing</span>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="profit_trailing"
                    value="lock_fix_profit"
                    checked={profitTrailingType === 'lock_fix_profit'}
                    onChange={(e) => setProfitTrailingType(e.target.value as any)}
                    className="w-4 h-4 text-orange-600 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-full focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                  />
                  <span className="text-white font-medium">Lock Fix Profit</span>
                  {profitTrailingType === 'lock_fix_profit' && (
                    <div className="flex items-center space-x-2 ml-4">
                      <input
                        type="number"
                        placeholder="If profit reaches"
                        className="w-28 p-2 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-400 focus:outline-none transition-all duration-300 backdrop-blur-sm text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Lock profit at"
                        className="w-28 p-2 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-400 focus:outline-none transition-all duration-300 backdrop-blur-sm text-sm"
                      />
                    </div>
                  )}
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="profit_trailing"
                    value="trail_profit"
                    checked={profitTrailingType === 'trail_profit'}
                    onChange={(e) => setProfitTrailingType(e.target.value as any)}
                    className="w-4 h-4 text-orange-600 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-full focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                  />
                  <span className="text-white font-medium">Trail Profit</span>
                  {profitTrailingType === 'trail_profit' && (
                    <div className="flex items-center space-x-2 ml-4">
                      <input
                        type="number"
                        placeholder="On every increase of"
                        className="w-32 p-2 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-400 focus:outline-none transition-all duration-300 backdrop-blur-sm text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Trail profit by"
                        className="w-32 p-2 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-400 focus:outline-none transition-all duration-300 backdrop-blur-sm text-sm"
                      />
                    </div>
                  )}
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="profit_trailing"
                    value="lock_and_trail"
                    checked={profitTrailingType === 'lock_and_trail'}
                    onChange={(e) => setProfitTrailingType(e.target.value as any)}
                    className="w-4 h-4 text-orange-600 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-full focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                  />
                  <span className="text-white font-medium">Lock and Trail</span>
                  {profitTrailingType === 'lock_and_trail' && (
                    <div className="flex items-center space-x-2 ml-4">
                      <input
                        type="number"
                        placeholder="If profit reach"
                        className="w-32 p-2 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-400 focus:outline-none transition-all duration-300 backdrop-blur-sm text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Lock profit at"
                        className="w-32 p-2 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-400 focus:outline-none transition-all duration-300 backdrop-blur-sm text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Every profit increase by"
                        className="w-32 p-2 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-400 focus:outline-none transition-all duration-300 backdrop-blur-sm text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Trail profit by"
                        className="w-32 p-2 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-400 focus:outline-none transition-all duration-300 backdrop-blur-sm text-sm"
                      />
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Name and Save Buttons */}
        <div className="bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 rounded-2xl p-6 border-2 border-yellow-500/30 shadow-lg shadow-yellow-500/20">
          <div className="space-y-6">
            {/* Strategy Name Input */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                <span>Strategy Name</span>
                <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-yellow-900 text-xs font-bold">★</span>
                </div>
              </h3>
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/30 via-orange-500/30 to-red-500/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
                <div className="relative">
                                     <input
                     type="text"
                     name="name"
                     value={timeIndicatorFormData.name}
                     onChange={handleTimeIndicatorChange}
                     className={`w-full p-4 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 border-2 rounded-2xl text-gray-900 focus:ring-4 focus:ring-yellow-400 focus:outline-none transition-all duration-500 transform group-hover:scale-105 group-hover:shadow-2xl backdrop-blur-sm placeholder-gray-600 font-medium ${
                       timeIndicatorFormData.name.trim() 
                         ? 'border-yellow-400 shadow-lg shadow-yellow-500/25' 
                         : 'border-orange-400 shadow-lg shadow-orange-500/25'
                     }`}
                     placeholder="Enter your strategy name..."
                     required
                   />
                  {timeIndicatorFormData.name.trim() && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {!timeIndicatorFormData.name.trim() && (
                <p className="text-orange-400 text-sm mt-2 flex items-center space-x-1">
                  <AlertTriangle size={16} />
                  <span>Strategy name is required to save</span>
                </p>
              )}
              {!isUnderlyingSelected && (
                <p className="text-orange-400 text-sm mt-2 flex items-center space-x-1">
                  <AlertTriangle size={16} />
                  <span>Select an underlying instrument to enable strategy creation</span>
                </p>
              )}
            </div>

            {/* Save Strategy Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={!timeIndicatorFormData.name.trim() || !isUnderlyingSelected}
                className={`group relative px-12 py-4 font-bold rounded-2xl transition-all duration-500 transform ${
                  timeIndicatorFormData.name.trim() && isUnderlyingSelected
                    ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/25 cursor-pointer'
                    : 'bg-gradient-to-r from-gray-500 to-gray-600 text-gray-300 cursor-not-allowed opacity-50'
                }`}
              >
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  timeIndicatorFormData.name.trim() && isUnderlyingSelected
                    ? 'bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20'
                    : ''
                }`}></div>
                <span className="relative z-10 flex items-center space-x-3">
                  <Save size={24} className={timeIndicatorFormData.name.trim() && isUnderlyingSelected ? 'animate-pulse' : ''} />
                  <span className="text-lg">
                    {!isUnderlyingSelected 
                      ? 'Select Underlying First' 
                      : !timeIndicatorFormData.name.trim() 
                        ? 'Enter Strategy Name First' 
                        : 'Save Strategy'
                    }
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>
        
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
        {/* Required Fields Notice */}
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl p-4 border border-orange-500/20">
          <div className="flex items-center space-x-3">
            <AlertTriangle size={20} className="text-orange-400" />
            <div>
              <h4 className="text-white font-semibold">Required Fields</h4>
              <p className="text-orange-200 text-sm">
                Fields marked with <span className="text-red-400 font-bold">*</span> are required to save your strategy
              </p>
            </div>
          </div>
        </div>

        {/* Validation Errors Display */}
        {validationErrors.length > 0 && (
          <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-2xl p-4 border border-red-500/20">
            <div className="flex items-start space-x-3">
              <AlertTriangle size={20} className="text-red-400 mt-1" />
              <div className="flex-1">
                <h4 className="text-white font-semibold mb-2">Please fix the following errors:</h4>
                <ul className="space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-red-200 text-sm flex items-center space-x-2">
                      <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="transform hover:scale-105 transition-all duration-300">
            <label className="block text-blue-200 text-sm font-medium mb-2">
              Strategy Name <span className="text-red-400">*</span>
            </label>
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
                      <label className="block text-blue-200 text-sm font-medium mb-2">
              Strategy Code <span className="text-red-400">*</span>
            </label>
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
            <label className="block text-blue-200 text-sm font-medium mb-2">
              Stop Loss <span className="text-red-400">*</span>
            </label>
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
            <label className="block text-blue-200 text-sm font-medium mb-2">
              Take Profit <span className="text-red-400">*</span>
            </label>
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
            <label className="block text-blue-200 text-sm font-medium mb-2">
              Position Size <span className="text-red-400">*</span>
            </label>
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

      {/* Indicator Selection Modal */}
      {showIndicatorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto border border-blue-500/30 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Select Indicator</h3>
              <button
                onClick={cancelIndicatorSelection}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
              >
                <X size={24} className="text-white" />
              </button>
            </div>

            {/* Indicator List */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                {Object.entries(groupedIndicators).map(([category, categoryIndicators]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-blue-300 font-semibold text-sm border-b border-blue-500/30 pb-1">
                      {category}
                    </h4>
                    <div className="space-y-1">
                      {categoryIndicators.map((indicator) => (
                        <label
                          key={indicator.value}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors duration-200"
                        >
                          <input
                            type="radio"
                            name="indicator"
                            value={indicator.value}
                            checked={tempSelectedIndicator === indicator.value}
                            onChange={(e) => handleModalIndicatorChange(e.target.value)}
                            className="w-4 h-4 text-blue-600 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-full focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                          />
                          <span className="text-white font-medium">{indicator.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Parameter Configuration */}
            {tempSelectedIndicator && (
              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-500/20 mb-6">
                <h4 className="text-blue-300 font-semibold mb-4">
                  {indicators.find(ind => ind.value === tempSelectedIndicator)?.label} Parameters
                </h4>
                
                {/* Debug info - remove in production */}
                <div className="mb-4 p-2 bg-slate-800/50 rounded text-xs text-gray-300">
                  <div>Selected Indicator: {tempSelectedIndicator}</div>
                  <div>Current Parameters: {JSON.stringify(tempIndicatorParameters)}</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {indicators.find(ind => ind.value === tempSelectedIndicator)?.parameters.map((param) => {
                    console.log('Rendering parameter:', param.name, 'Current value:', tempIndicatorParameters[param.name]);
                    return (
                      <div key={param.name} className="space-y-2">
                        <label className="text-blue-200 text-sm font-medium">{param.label}</label>
                        {param.type === 'number' ? (
                          <input
                            type="number"
                            value={tempIndicatorParameters[param.name] !== undefined ? tempIndicatorParameters[param.name] : param.default}
                            onChange={(e) => {
                              const inputValue = e.target.value;
                              console.log('Raw input value:', inputValue, 'for param:', param.name);
                              
                              // Allow empty input temporarily
                              if (inputValue === '' || inputValue === null || inputValue === undefined) {
                                console.log('Empty input, allowing temporary empty state');
                                handleModalParameterChange(param.name, '');
                                return;
                              }
                              
                              // Parse the number
                              const parsed = parseFloat(inputValue);
                              if (isNaN(parsed)) {
                                console.log('Invalid number, allowing as string temporarily');
                                handleModalParameterChange(param.name, inputValue);
                                return;
                              }
                              
                              console.log('Valid number parsed:', parsed);
                              handleModalParameterChange(param.name, parsed);
                            }}
                            onBlur={(e) => {
                              // Only set default if the field is completely empty when leaving
                              const value = tempIndicatorParameters[param.name];
                              if (value === '' || value === null || value === undefined) {
                                handleModalParameterChange(param.name, param.default);
                              }
                            }}
                            min={param.min}
                            max={param.max}
                            step={param.step || 1}
                            className="w-full p-3 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-blue-500/30 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                          />
                        ) : param.type === 'text' ? (
                          <input
                            type="text"
                            value={tempIndicatorParameters[param.name] !== undefined ? tempIndicatorParameters[param.name] : param.default}
                            onChange={(e) => {
                              console.log('Text input changed:', param.name, 'from', tempIndicatorParameters[param.name], 'to', e.target.value);
                              handleModalParameterChange(param.name, e.target.value);
                            }}
                            className="w-full p-3 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-blue-500/30 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                            placeholder="Enter value..."
                          />
                        ) : param.type === 'select' ? (
                          <select
                            value={tempIndicatorParameters[param.name] !== undefined ? tempIndicatorParameters[param.name] : param.default}
                            onChange={(e) => {
                              console.log('Select changed:', param.name, 'from', tempIndicatorParameters[param.name], 'to', e.target.value);
                              handleModalParameterChange(param.name, e.target.value);
                            }}
                            className="w-full p-3 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-blue-500/30 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                          >
                            {param.options?.map((option) => (
                              <option key={option.value} value={option.value} className="bg-slate-800 text-white">
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : null}
                        
                        
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelIndicatorSelection}
                className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105"
              >
                Cancel
              </button>
              <button
                onClick={applyIndicatorSelection}
                disabled={!tempSelectedIndicator}
                className={`px-6 py-3 font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 ${
                  tempSelectedIndicator
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-700'
                    : 'bg-gradient-to-r from-gray-500 to-gray-600 text-gray-300 cursor-not-allowed'
                }`}
              >
                Ok
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateStrategyPage; 