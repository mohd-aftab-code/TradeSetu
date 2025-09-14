'use client'

/**
 * Strategy Creation Page
 * 
 * This page allows users to create different types of trading strategies:
 * - Time-based strategies: Execute trades at specific times
 * - Indicator-based strategies: Use technical indicators for entry/exit signals
 * - Programming strategies: Custom algorithms in Python
 * 
 * Each strategy type stores data in its dedicated table for better organization.
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, BarChart3, Code, CheckCircle, X } from 'lucide-react';
import Sidebar from '../../components/Layout/Sidebar';
import { getUserToken, getUserData } from '@/lib/cookies';

// Import strategy components
import TimeBasedStrategy from './time-based/TimeBasedStrategy';
import IndicatorBasedStrategy from './indicator-based/IndicatorBasedStrategy';
import ProgrammingStrategy from './programming/ProgrammingStrategy';

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
  console.log('CreateStrategyPage component loaded successfully');
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
    order_type: 'MARKET',
    lot_size: 1,
    entry_time: '09:20',
    exit_time: '15:30',
    re_entry_condition: 'NEXT_SIGNAL',
    wait_and_trade: false,
    premium_difference: 0,
    is_options_strategy: false,
    option_type: 'CE',
    strike_selection: 'ATM',
    expiry_type: 'WEEKLY',
    daily_loss_limit: 5000,
    daily_profit_limit: 10000,
    max_trade_cycles: 3,
    trailing_stop: false,
    trailing_stop_percentage: 1.5,
    trailing_profit: false,
    trailing_profit_percentage: 2.0,
    noTradeAfter: '15:15',
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
    legs: [],
    entryConditions: {
      long: [],
      short: []
    } as {
      long: Array<{id: number, indicator1: string, comparator: string, indicator2: string}>,
      short: Array<{id: number, indicator1: string, comparator: string, indicator2: string}>
    },
    trigger_type: 'specific_time',
    trigger_time: '09:20:00',
    trigger_timezone: 'IST',
    trigger_recurrence: 'daily',
    trigger_weekly_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    trigger_monthly_day: 1,
    trigger_monthly_type: 'day_of_month',
    trigger_after_open_minutes: 5,
    trigger_before_close_minutes: 15,
    trigger_candle_interval: 5,
    trigger_candle_delay_minutes: 1,
    action_type: 'place_order',
    time_order_transaction_type: 'BUY',
    time_order_type: 'MARKET',
    time_order_quantity: 1,
    time_order_product_type: 'MIS',
    time_order_price: '',
    enable_conditions: false,
    conditions: [],
    strategy_validity_date: '',
    deactivate_after_first_trigger: false
  });

  // State for tracking condition blocks
  const [conditionBlocks, setConditionBlocks] = useState(1);
  const [logicalOperator, setLogicalOperator] = useState<'AND' | 'OR'>('AND');
  
  // Time-based strategy conditions state
  const [timeBasedConditions, setTimeBasedConditions] = useState<Array<{
    id: number;
    field: string;
    operator: string;
    value: string;
  }>>([]);
  
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

  // State for managing multiple legs
  const [orderLegs, setOrderLegs] = useState<Array<{
    id: number;
    action: string;
    quantity: number;
    optionType: string;
    expiry: string;
    atmPt: string;
    atm: string;
    slType: string;
    slValue: number;
    slOnPrice: string;
    tpType: string;
    tpValue: number;
    tpOnPrice: string;
    waitAndTradeType: string;
    waitAndTradeValue: number;
    reEntryType: string;
    reEntryValue: number;
    reEntryCondition: string;
    tslType: string;
    tslValue1: number;
    tslValue2: number;
  }>>([
    {
      id: 1,
      action: 'sell',
      quantity: 20,
      optionType: 'pe',
      expiry: 'Weekly',
      atmPt: 'ATM pt',
      atm: 'ATM',
      slType: 'SL %',
      slValue: 30,
      slOnPrice: 'On Price',
      tpType: 'TP %',
      tpValue: 30,
      tpOnPrice: 'On Price',
      waitAndTradeType: '%↑',
      waitAndTradeValue: 0,
      reEntryType: 'ReEntry On Cost',
      reEntryValue: 5,
      reEntryCondition: 'On Close',
      tslType: 'TSL %',
      tslValue1: 5,
      tslValue2: 6
    },
    {
      id: 2,
      action: 'sell',
      quantity: 29,
      optionType: 'pe',
      expiry: 'Next Weekly',
      atmPt: 'ATM pt',
      atm: 'ATM',
      slType: 'SL %',
      slValue: 30,
      slOnPrice: 'On Price',
      tpType: 'TP %',
      tpValue: 0,
      tpOnPrice: 'On Price',
      waitAndTradeType: '%↑',
      waitAndTradeValue: 0,
      reEntryType: 'ReEntry On Cost',
      reEntryValue: 5,
      reEntryCondition: 'On Close',
      tslType: 'TSL %',
      tslValue1: 5,
      tslValue2: 6
    }
  ]);

  // State for Advance Features section
  const [showAdvanceFeatures, setShowAdvanceFeatures] = useState(false);
  const [advanceFeatures, setAdvanceFeatures] = useState({
    moveSLToCost: false,
    exitAllOnSLTgt: false,
    prePunchSL: true,
    waitAndTrade: false,
    reEntryExecute: false,
    trailSL: false,
    premiumDifference: false
  });

  // State for strike configuration
  const [strikeType, setStrikeType] = useState('ATM pt');
  const [customPrice, setCustomPrice] = useState('');

  // Check if underlying is selected
  const isUnderlyingSelected = !!instrumentSearch.selectedInstrument;

  // Utility functions for strategy creation
  const generateStrategyId = () => `strategy_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  
  const formatStrategyData = (formData: any, strategyType: string) => {
        return {
      user_id: (user as any)?.id || 'tradesetu001',
      name: formData.name.trim(),
      description: formData.description || `${strategyType} Strategy created on ${new Date().toLocaleDateString()}`,
      strategy_type: strategyType,
      symbol: formData.symbol,
      asset_type: formData.asset_type || 'STOCK',
      entry_conditions: formData.entry_conditions || `${strategyType} entry conditions`,
      exit_conditions: formData.exit_conditions || `${strategyType} exit conditions`,
      risk_management: {
        stop_loss: formData.stop_loss || '2%',
        take_profit: formData.take_profit || '4%',
        position_size: formData.position_size || '1 lot'
      },
      is_paper_trading: true
    };
  };

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

  // Add new leg
  const addLeg = () => {
    const newLeg = {
      id: Math.max(...orderLegs.map(leg => leg.id)) + 1,
      action: 'sell',
      quantity: 20,
      optionType: 'pe',
      expiry: 'Monthly',
      atmPt: 'ATM pt',
      atm: 'ATM',
      slType: 'SL %',
      slValue: 30,
      slOnPrice: 'On Price',
      tpType: 'TP %',
      tpValue: 30,
      tpOnPrice: 'On Price',
      waitAndTradeType: '%↑',
      waitAndTradeValue: 0,
      reEntryType: 'ReEntry On Cost',
      reEntryValue: 5,
      reEntryCondition: 'On Close',
      tslType: 'TSL %',
      tslValue1: 5,
      tslValue2: 6
    };
    setOrderLegs(prev => [...prev, newLeg]);
  };

  // Delete leg
  const deleteLeg = (legId: number) => {
    if (orderLegs.length > 1) {
      setOrderLegs(prev => prev.filter(leg => leg.id !== legId));
    }
  };

  // Generate ATM options based on ATM Pt selection
  const getATMOptions = (atmPt: string) => {
    if (atmPt === 'ATM pt') {
      // Generate ITM options from 1500 to 100 in decrements of 100 (descending order)
      const itmOptions = [];
      for (let i = 1500; i >= 100; i -= 100) {
        itmOptions.push(`ITM ${i}`);
      }
      
      // Add ATM in the middle
      const atmOptions = ['ATM'];
      
      // Generate OTM options from 100 to 1500 in increments of 100
      const otmOptions = [];
      for (let i = 100; i <= 1500; i += 100) {
        otmOptions.push(`OTM ${i}`);
      }
      
      return [...itmOptions, ...atmOptions, ...otmOptions];
    } else if (atmPt === 'ATM %') {
      // Generate ITM percentage options from 20.0% to 1.0% in descending order
      const itmOptions = [];
      for (let i = 20; i >= 1; i--) {
        itmOptions.push(`ITM ${i}.0%`);
      }
      
      // Add ATM in the middle
      const atmOptions = ['ATM'];
      
      // Generate OTM percentage options from 1.0% to 20.0% in ascending order
      const otmOptions = [];
      for (let i = 1; i <= 20; i++) {
        otmOptions.push(`OTM ${i}.0%`);
      }
      
      return [...itmOptions, ...atmOptions, ...otmOptions];
    } else if (atmPt === 'SP' || atmPt === 'SP >=' || atmPt === 'SP <=') {
      // For SP options, return empty array as custom input field will be shown
      return [];
    } else {
      // Default options for other ATM Pt selections
      return ['ATM', 'ITM 100', 'ITM 200', 'OTM 100', 'OTM 200'];
    }
  };

  // Update leg data
  const updateLeg = (legId: number, field: string, value: any) => {
    setOrderLegs(prev => prev.map(leg => 
      leg.id === legId ? { ...leg, [field]: value } : leg
    ));
  };

  useEffect(() => {
    console.log('useEffect running - checking authentication');
    // Check if user is authenticated
    const token = getUserToken();
    const userData = getUserData();
    
    console.log('Token:', token ? 'Found' : 'Not found');
    console.log('User data:', userData ? 'Found' : 'Not found');

    if (!token || !userData) {
      console.log('No auth found, redirecting to login');
      router.push('/auth/login');
      return;
    }

    console.log('Auth found, setting user and loading indicators');
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

  const handleTimeBasedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Comprehensive validation for Time Based Strategy
    const validationErrors = [];
    
    // Strategy name validation
    if (!timeIndicatorFormData.name.trim()) {
      validationErrors.push('Strategy Name is required');
    }
    
    // Symbol validation
    if (!timeIndicatorFormData.symbol.trim()) {
      validationErrors.push('Symbol/Underlying is required');
    }
    
    // Order Type validation
    if (!timeIndicatorFormData.time_order_product_type) {
      validationErrors.push('Order Type is required');
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
    
    try {
      // Step 1: Create main strategy record
      const strategyResponse = await fetch('/api/strategies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: (user as any)?.id || 'tradesetu001',
      name: timeIndicatorFormData.name.trim(),
      description: timeIndicatorFormData.description || `Time Based Strategy created on ${new Date().toLocaleDateString()}`,
      strategy_type: 'TIME_BASED',
      symbol: timeIndicatorFormData.symbol,
          asset_type: timeIndicatorFormData.asset_type || 'STOCK',
      entry_conditions: 'Time-based entry',
      exit_conditions: 'Time-based exit',
      risk_management: {
            stop_loss: timeIndicatorFormData.stop_loss || '2%',
            take_profit: timeIndicatorFormData.take_profit || '4%',
            position_size: timeIndicatorFormData.position_size || '1 lot'
          },
          is_paper_trading: true
        }),
      });

      if (!strategyResponse.ok) {
        const errorData = await strategyResponse.json();
        throw new Error(errorData.error || 'Failed to create main strategy');
      }

      const strategyData = await strategyResponse.json();
      const strategyId = strategyData.strategy_id;

      // Step 2: Create time-based strategy specific data
      const timeBasedResponse = await fetch('/api/strategies/time-based', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: (user as any)?.id || 'tradesetu001',
          strategy_id: strategyId,
          trigger_type: timeIndicatorFormData.trigger_type || 'specific_time',
          trigger_time: timeIndicatorFormData.trigger_time || '09:20:00',
          trigger_timezone: timeIndicatorFormData.trigger_timezone || 'IST',
          trigger_recurrence: timeIndicatorFormData.trigger_recurrence || 'daily',
          trigger_weekly_days: timeIndicatorFormData.trigger_weekly_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          trigger_monthly_day: timeIndicatorFormData.trigger_monthly_day || 1,
          trigger_monthly_type: timeIndicatorFormData.trigger_monthly_type || 'day_of_month',
          trigger_after_open_minutes: timeIndicatorFormData.trigger_after_open_minutes || 5,
          trigger_before_close_minutes: timeIndicatorFormData.trigger_before_close_minutes || 15,
          trigger_candle_interval: timeIndicatorFormData.trigger_candle_interval || 5,
          trigger_candle_delay_minutes: timeIndicatorFormData.trigger_candle_delay_minutes || 1,
          action_type: timeIndicatorFormData.action_type || 'place_order',
          order_transaction_type: timeIndicatorFormData.time_order_transaction_type || 'BUY',
          order_type: timeIndicatorFormData.time_order_type || 'MARKET',
          order_quantity: timeIndicatorFormData.time_order_quantity || 1,
          order_product_type: timeIndicatorFormData.time_order_product_type || 'MIS',
          order_price: timeIndicatorFormData.time_order_price || null,
          working_days: timeIndicatorFormData.working_days,
          start_time: timeIndicatorFormData.start_time || '09:15:00',
          square_off_time: timeIndicatorFormData.square_off_time || '15:15:00',
          strategy_start_date: timeIndicatorFormData.strategy_start_date || null,
          strategy_start_time: timeIndicatorFormData.strategy_start_time || '09:15:00',
          strategy_validity_date: timeIndicatorFormData.strategy_validity_date || null,
          deactivate_after_first_trigger: timeIndicatorFormData.deactivate_after_first_trigger || false,
          stop_loss_type: 'SL %',
          stop_loss_value: parseFloat(timeIndicatorFormData.stop_loss) || 2.0,
          take_profit_type: 'TP %',
          take_profit_value: parseFloat(timeIndicatorFormData.take_profit) || 4.0,
          position_size: timeIndicatorFormData.position_size || '1',
          profit_trailing_type: profitTrailingType || 'no_trailing',
          trailing_stop: timeIndicatorFormData.trailing_stop || false,
          trailing_stop_percentage: timeIndicatorFormData.trailing_stop_percentage || 1.5,
          trailing_profit: timeIndicatorFormData.trailing_profit || false,
          trailing_profit_percentage: timeIndicatorFormData.trailing_profit_percentage || 2.0,
          daily_loss_limit: timeIndicatorFormData.daily_loss_limit || 5000,
          daily_profit_limit: timeIndicatorFormData.daily_profit_limit || 10000,
          max_trade_cycles: timeIndicatorFormData.max_trade_cycles || 3,
          no_trade_after: timeIndicatorFormData.noTradeAfter || '15:15:00'
        }),
      });

      if (!timeBasedResponse.ok) {
        const errorData = await timeBasedResponse.json();
        throw new Error(errorData.error || 'Failed to create time-based strategy details');
      }

        console.log('Time Based Strategy saved successfully');
      // Add a small delay to ensure data is saved
      setTimeout(() => {
        router.push('/strategies');
      }, 1000);
    } catch (error) {
      console.error('Error saving time based strategy:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

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
    
    // Entry conditions validation - check if indicators are selected
    const hasLongConditions = (timeIndicatorFormData.transaction_type === 'Both Side' || timeIndicatorFormData.transaction_type === 'Only Long') && 
      (selectedIndicators.long1?.indicator || selectedIndicators.long2?.indicator);
    const hasShortConditions = (timeIndicatorFormData.transaction_type === 'Both Side' || timeIndicatorFormData.transaction_type === 'Only Short') && 
      (selectedIndicators.short1?.indicator || selectedIndicators.short2?.indicator);
    
    if (!hasLongConditions && !hasShortConditions) {
      validationErrors.push('At least one entry condition (Long or Short) is required');
    }
    
    // Exit conditions validation - these are handled by stop loss and take profit
    // No need to validate exit_conditions field for indicator-based strategies
    
    // Risk management validation - these are handled by the form UI, not form data
    // For indicator-based strategies, we'll use default values if not provided
    // No need to validate these fields as they have default values in the API call
    
    // Time validation - these should have default values, but let's check anyway
    if (!timeIndicatorFormData.start_time || timeIndicatorFormData.start_time.trim() === '') {
      validationErrors.push('Start Time is required');
    }
    
    if (!timeIndicatorFormData.square_off_time || timeIndicatorFormData.square_off_time.trim() === '') {
      validationErrors.push('Square Off Time is required');
    }
    
    // Comparator validation - only validate if conditions are selected
    if ((timeIndicatorFormData.transaction_type === 'Both Side' || timeIndicatorFormData.transaction_type === 'Only Long') && 
        (selectedIndicators.long1?.indicator || selectedIndicators.long2?.indicator) && 
        (!longComparator || longComparator.trim() === '')) {
      validationErrors.push('Long Entry Comparator is required');
    }
    
    if ((timeIndicatorFormData.transaction_type === 'Both Side' || timeIndicatorFormData.transaction_type === 'Only Short') && 
        (selectedIndicators.short1?.indicator || selectedIndicators.short2?.indicator) && 
        (!shortComparator || shortComparator.trim() === '')) {
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
    
    try {
      // Step 1: Create main strategy record
      const strategyResponse = await fetch('/api/strategies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: (user as any)?.id || 'tradesetu001',
      name: timeIndicatorFormData.name.trim(),
          description: timeIndicatorFormData.description || `Indicator Based Strategy created on ${new Date().toLocaleDateString()}`,
          strategy_type: 'INDICATOR_BASED',
          symbol: timeIndicatorFormData.symbol,
          asset_type: timeIndicatorFormData.asset_type || 'STOCK',
      entry_conditions: `Long: ${longComparator || 'Not set'}, Short: ${shortComparator || 'Not set'}`,
      exit_conditions: 'Stop Loss or Take Profit',
      risk_management: {
        stop_loss: '2%',
        take_profit: '4%',
        position_size: '1 lot'
      },
          is_paper_trading: true
        }),
      });

      if (!strategyResponse.ok) {
        const errorData = await strategyResponse.json();
        throw new Error(errorData.error || 'Failed to create main strategy');
      }

      const strategyData = await strategyResponse.json();
      const strategyId = strategyData.strategy_id;

      // Step 2: Create indicator-based strategy specific data
      const indicatorResponse = await fetch('/api/strategies/indicator-based', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: (user as any)?.id || 'tradesetu001',
          strategy_id: strategyId,
          chart_type: timeIndicatorFormData.chart_type || 'Candle',
          time_interval: timeIndicatorFormData.interval || '5 Min',
          transaction_type: timeIndicatorFormData.transaction_type || 'Both Side',
          long_conditions: timeIndicatorFormData.entryConditions.long || [],
          short_conditions: timeIndicatorFormData.entryConditions.short || [],
          condition_blocks: conditionBlocks,
          logical_operator: logicalOperator,
          selected_indicators: selectedIndicators,
          stop_loss_type: 'SL %',
          stop_loss_value: 2.0,
          take_profit_type: 'TP %',
          take_profit_value: 4.0,
          position_size: '1',
          profit_trailing_type: profitTrailingType || 'no_trailing',
          trailing_stop: timeIndicatorFormData.trailing_stop || false,
          trailing_stop_percentage: timeIndicatorFormData.trailing_stop_percentage || 1.5,
          trailing_profit: timeIndicatorFormData.trailing_profit || false,
          trailing_profit_percentage: timeIndicatorFormData.trailing_profit_percentage || 2.0,
          daily_loss_limit: timeIndicatorFormData.daily_loss_limit || 5000,
          daily_profit_limit: timeIndicatorFormData.daily_profit_limit || 10000,
          max_trade_cycles: timeIndicatorFormData.max_trade_cycles || 3,
          no_trade_after: timeIndicatorFormData.noTradeAfter || '15:15:00',
          working_days: timeIndicatorFormData.working_days,
          start_time: timeIndicatorFormData.start_time || '09:15:00',
          square_off_time: timeIndicatorFormData.square_off_time || '15:15:00'
        }),
      });

      if (!indicatorResponse.ok) {
        const errorData = await indicatorResponse.json();
        throw new Error(errorData.error || 'Failed to create indicator-based strategy details');
      }

      console.log('Indicator Based Strategy saved successfully');
      // Add a small delay to ensure data is saved
      setTimeout(() => {
        router.push('/strategies');
      }, 1000);
    } catch (error) {
      console.error('Error saving indicator based strategy:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    
    try {
      // Step 1: Create main strategy record
      const strategyResponse = await fetch('/api/strategies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: (user as any)?.id || 'tradesetu001',
          name: programmingFormData.name.trim(),
          description: programmingFormData.description || `Programming Strategy created on ${new Date().toLocaleDateString()}`,
      strategy_type: 'PROGRAMMING',
          symbol: programmingFormData.symbol,
          asset_type: 'STOCK',
      entry_conditions: 'Custom programming logic',
      exit_conditions: 'Custom exit conditions',
      risk_management: {
        stop_loss: programmingFormData.stop_loss || '2%',
        take_profit: programmingFormData.take_profit || '4%',
        position_size: programmingFormData.position_size || '1 lot'
      },
          is_paper_trading: true
        }),
      });

      if (!strategyResponse.ok) {
        const errorData = await strategyResponse.json();
        throw new Error(errorData.error || 'Failed to create main strategy');
      }

      const strategyData = await strategyResponse.json();
      const strategyId = strategyData.strategy_id;

      // Step 2: Create programming strategy specific data
      const programmingResponse = await fetch('/api/strategies/programming', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: (user as any)?.id || 'tradesetu001',
          strategy_id: strategyId,
          programming_language: programmingFormData.programming_language || 'PYTHON',
          code: programmingFormData.code,
          code_version: '1.0.0',
          execution_frequency: 'real_time',
          max_execution_time: 30,
          dependencies: [],
          environment_variables: {},
          stop_loss_type: 'SL %',
          stop_loss_value: parseFloat(programmingFormData.stop_loss) || 2.0,
          take_profit_type: 'TP %',
          take_profit_value: parseFloat(programmingFormData.take_profit) || 4.0,
          position_size: programmingFormData.position_size || '1'
        }),
      });

      if (!programmingResponse.ok) {
        const errorData = await programmingResponse.json();
        throw new Error(errorData.error || 'Failed to create programming strategy details');
      }

      console.log('Programming Strategy saved successfully');
      // Add a small delay to ensure data is saved
      setTimeout(() => {
        router.push('/strategies');
      }, 1000);
    } catch (error) {
      console.error('Error saving programming strategy:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    // Major Indices
    { symbol: 'NIFTY 50', name: 'NIFTY 50', segment: 'INDEX', lotSize: 50 },
    { symbol: 'BANKNIFTY', name: 'BANK NIFTY', segment: 'INDEX', lotSize: 25 },
    { symbol: 'FINNIFTY', name: 'FINANCIAL NIFTY', segment: 'INDEX', lotSize: 40 },
    { symbol: 'MIDCPNIFTY', name: 'MIDCAP NIFTY', segment: 'INDEX', lotSize: 75 },
    { symbol: 'SENSEX', name: 'S&P BSE SENSEX', segment: 'INDEX', lotSize: 10 },
    { symbol: 'NIFTY IT', name: 'NIFTY IT', segment: 'INDEX', lotSize: 40 },
    { symbol: 'NIFTY PHARMA', name: 'NIFTY PHARMA', segment: 'INDEX', lotSize: 40 },
    { symbol: 'NIFTY AUTO', name: 'NIFTY AUTO', segment: 'INDEX', lotSize: 40 },
    { symbol: 'NIFTY FMCG', name: 'NIFTY FMCG', segment: 'INDEX', lotSize: 40 },
    { symbol: 'NIFTY METAL', name: 'NIFTY METAL', segment: 'INDEX', lotSize: 40 },
    { symbol: 'NIFTY REALTY', name: 'NIFTY REALTY', segment: 'INDEX', lotSize: 40 },
    { symbol: 'NIFTY PSU BANK', name: 'NIFTY PSU BANK', segment: 'INDEX', lotSize: 40 },
    { symbol: 'NIFTY PVT BANK', name: 'NIFTY PVT BANK', segment: 'INDEX', lotSize: 40 },
    
    // Popular Stocks
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', segment: 'STOCK', lotSize: 250 },
    { symbol: 'TCS', name: 'Tata Consultancy Services Ltd', segment: 'STOCK', lotSize: 100 },
    { symbol: 'INFY', name: 'Infosys Ltd', segment: 'STOCK', lotSize: 300 },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', segment: 'STOCK', lotSize: 500 },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', segment: 'STOCK', lotSize: 275 },
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', segment: 'STOCK', lotSize: 200 },
    { symbol: 'ITC', name: 'ITC Ltd', segment: 'STOCK', lotSize: 400 },
    { symbol: 'SBIN', name: 'State Bank of India', segment: 'STOCK', lotSize: 1500 },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', segment: 'STOCK', lotSize: 400 },
    { symbol: 'AXISBANK', name: 'Axis Bank Ltd', segment: 'STOCK', lotSize: 600 },
    { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd', segment: 'STOCK', lotSize: 300 },
    { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd', segment: 'STOCK', lotSize: 200 },
    { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd', segment: 'STOCK', lotSize: 100 },
    { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Ltd', segment: 'STOCK', lotSize: 400 },
    { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', segment: 'STOCK', lotSize: 1500 },
    { symbol: 'WIPRO', name: 'Wipro Ltd', segment: 'STOCK', lotSize: 600 },
    { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd', segment: 'STOCK', lotSize: 100 },
    { symbol: 'TITAN', name: 'Titan Company Ltd', segment: 'STOCK', lotSize: 300 },
    { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd', segment: 'STOCK', lotSize: 125 }
  ];

  // Handle instrument search
  const handleInstrumentSearch = (query: string) => {
    setInstrumentSearch(prev => ({
      ...prev,
      searchQuery: query,
      isSearching: query.length > 0
    }));

    if (query.length > 0) {
      const filtered = availableInstruments.filter(instrument => {
        const searchTerm = query.toLowerCase();
        const symbolMatch = instrument.symbol.toLowerCase().includes(searchTerm);
        const nameMatch = instrument.name.toLowerCase().includes(searchTerm);
        const segmentMatch = instrument.segment.toLowerCase().includes(searchTerm);
        
        // Also search for partial matches and common abbreviations
        const symbolWords = instrument.symbol.toLowerCase().split(' ');
        const nameWords = instrument.name.toLowerCase().split(' ');
        const wordMatch = symbolWords.some(word => word.includes(searchTerm)) ||
                         nameWords.some(word => word.includes(searchTerm));
        
        return symbolMatch || nameMatch || segmentMatch || wordMatch;
      });
      
      // Sort results: exact matches first, then partial matches
      const sortedResults = filtered.sort((a, b) => {
        const queryLower = query.toLowerCase();
        const aExact = a.symbol.toLowerCase() === queryLower || a.name.toLowerCase() === queryLower;
        const bExact = b.symbol.toLowerCase() === queryLower || b.name.toLowerCase() === queryLower;
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        // Then sort by segment (INDEX first, then STOCK)
        if (a.segment === 'INDEX' && b.segment === 'STOCK') return -1;
        if (a.segment === 'STOCK' && b.segment === 'INDEX') return 1;
        
        return 0;
      });
      
      setInstrumentSearch(prev => ({
        ...prev,
        searchResults: sortedResults
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
                  <BarChart3 size={32} className="text-white drop-shadow-2xl" />
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
                <BarChart3 size={28} className="text-white drop-shadow-2xl" />
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
                  <BarChart3 size={32} className="text-white drop-shadow-2xl" />
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

  const renderContent = () => {
    switch (strategyCreationType) {
      case 'selection':
        return renderStrategyTypeSelection();
      case 'time-indicator':
        return renderStrategySubTypeSelection();
      case 'time-based':
        return (
          <TimeBasedStrategy
            timeIndicatorFormData={timeIndicatorFormData}
            setTimeIndicatorFormData={setTimeIndicatorFormData}
            setStrategyCreationType={setStrategyCreationType}
            handleTimeBasedSubmit={handleTimeBasedSubmit}
            instrumentSearch={instrumentSearch}
            handleInstrumentSearch={handleInstrumentSearch}
            handleInstrumentSelect={handleInstrumentSelect}
            handleInstrumentRemove={handleInstrumentRemove}
            availableInstruments={availableInstruments}
            isUnderlyingSelected={isUnderlyingSelected}
            orderLegs={orderLegs}
            setOrderLegs={setOrderLegs}
            addLeg={addLeg}
            deleteLeg={deleteLeg}
            updateLeg={updateLeg}
            getATMOptions={getATMOptions}
            advanceFeatures={advanceFeatures}
            setAdvanceFeatures={setAdvanceFeatures}
            showAdvanceFeatures={showAdvanceFeatures}
            setShowAdvanceFeatures={setShowAdvanceFeatures}
            profitTrailingType={profitTrailingType}
            setProfitTrailingType={setProfitTrailingType}
          />
        );
      case 'indicator-based':
        return (
          <IndicatorBasedStrategy
            timeIndicatorFormData={timeIndicatorFormData}
            setTimeIndicatorFormData={setTimeIndicatorFormData}
            setStrategyCreationType={setStrategyCreationType}
            handleTimeIndicatorSubmit={handleTimeIndicatorSubmit}
            instrumentSearch={instrumentSearch}
            handleInstrumentSearch={handleInstrumentSearch}
            handleInstrumentSelect={handleInstrumentSelect}
            handleInstrumentRemove={handleInstrumentRemove}
            availableInstruments={availableInstruments}
            isUnderlyingSelected={isUnderlyingSelected}
            conditionBlocks={conditionBlocks}
            setConditionBlocks={setConditionBlocks}
            logicalOperator={logicalOperator}
            setLogicalOperator={setLogicalOperator}
            longComparator={longComparator}
            shortComparator={shortComparator}
            handleLongComparatorChange={handleLongComparatorChange}
            handleShortComparatorChange={handleShortComparatorChange}
            selectedIndicators={selectedIndicators}
            openIndicatorModal={openIndicatorModal}
            indicators={indicators}
            strikeType={strikeType}
            setStrikeType={setStrikeType}
            customPrice={customPrice}
            setCustomPrice={setCustomPrice}
            profitTrailingType={profitTrailingType}
            setProfitTrailingType={setProfitTrailingType}
            handleTimeIndicatorChange={handleTimeIndicatorChange}
            addConditionBlock={addConditionBlock}
          />
        );
      case 'programming':
        return (
          <ProgrammingStrategy
            programmingFormData={programmingFormData}
            setProgrammingFormData={setProgrammingFormData}
            setStrategyCreationType={setStrategyCreationType}
            handleProgrammingSubmit={handleProgrammingSubmit}
            handleProgrammingChange={handleProgrammingChange}
            validationErrors={validationErrors}
          />
        );
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
