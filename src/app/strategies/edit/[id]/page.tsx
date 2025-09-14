'use client'

/**
 * Strategy Edit Page
 * 
 * This page allows users to edit different types of trading strategies:
 * - Time-based strategies: Execute trades at specific times
 * - Indicator-based strategies: Use technical indicators for entry/exit signals
 * - Programming strategies: Custom algorithms in Python
 * 
 * All form fields are pre-filled with stored values for editing.
 */

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, BarChart3, Code, CheckCircle, X } from 'lucide-react';
import Sidebar from '../../../components/Layout/Sidebar';
import { getUserToken, getUserData } from '@/lib/cookies';

// Import strategy components
import TimeBasedStrategy from '../../create/time-based/TimeBasedStrategy';
import IndicatorBasedStrategy from '../../create/indicator-based/IndicatorBasedStrategy';
import ProgrammingStrategy from '../../create/programming/ProgrammingStrategy';

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

const EditStrategyPage = () => {
  const router = useRouter();
  const params = useParams();
  const strategyId = params.id as string;
  
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [strategy, setStrategy] = useState<any>(null);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [strategyCreationType, setStrategyCreationType] = useState<'selection' | 'time-indicator' | 'programming' | 'time-based' | 'indicator-based'>('selection');
  const [strategySubType, setStrategySubType] = useState<'time-based' | 'indicator-based' | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [deploymentStatus, setDeploymentStatus] = useState<string>('');
  
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
    is_active: false,
    is_paper_trading: true
  });

  const [timeBasedFormData, setTimeBasedFormData] = useState({
    name: '',
    description: '',
    strategy_type: 'TIME_BASED',
    asset_type: 'INDEX',
    symbol: '',
    trigger_type: 'specific_time',
    trigger_time: '09:30',
    trigger_timezone: 'IST',
    trigger_recurrence: 'daily',
    trigger_weekly_days: [],
    trigger_monthly_day: 1,
    trigger_monthly_type: 'day_of_month',
    trigger_after_open_minutes: 15,
    trigger_before_close_minutes: 30,
    trigger_candle_interval: 5,
    trigger_candle_delay_minutes: 0,
    action_type: 'place_order',
    order_transaction_type: 'BUY',
    order_type: 'MARKET',
    order_quantity: 1,
    order_product_type: 'MIS',
    order_price: 0,
    working_days: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    start_time: '09:15',
    square_off_time: '15:15',
    strategy_start_date: '',
    strategy_start_time: '09:15',
    strategy_validity_date: '',
    deactivate_after_first_trigger: false,
    stop_loss_type: 'SL %',
    stop_loss_value: 2.0,
    take_profit_type: 'TP %',
    take_profit_value: 4.0,
    position_size: '1',
    profit_trailing_type: 'no_trailing',
    trailing_stop: false,
    trailing_stop_percentage: 1.5,
    trailing_profit: false,
    trailing_profit_percentage: 2.0,
    daily_loss_limit: 5000,
    daily_profit_limit: 10000,
    max_trade_cycles: 3,
    no_trade_after: '15:15',
    is_active: false,
    is_paper_trading: true
  });

  const [indicatorBasedFormData, setIndicatorBasedFormData] = useState({
    name: '',
    description: '',
    strategy_type: 'INDICATOR_BASED',
    asset_type: 'INDEX',
    symbol: '',
    chart_type: 'Candle',
    time_interval: '5 Min',
    transaction_type: 'Both Side',
    long_conditions: [],
    short_conditions: [],
    condition_blocks: 1,
    logical_operator: 'AND',
    selected_indicators: {
      long1: { indicator: '', parameters: {} },
      long2: { indicator: '', parameters: {} },
      short1: { indicator: '', parameters: {} },
      short2: { indicator: '', parameters: {} }
    },
    stop_loss_type: 'SL %',
    stop_loss_value: 2.0,
    take_profit_type: 'TP %',
    take_profit_value: 4.0,
    position_size: '1',
    profit_trailing_type: 'no_trailing',
    trailing_stop: false,
    trailing_stop_percentage: 1.5,
    trailing_profit: false,
    trailing_profit_percentage: 2.0,
    daily_loss_limit: 5000,
    daily_profit_limit: 10000,
    max_trade_cycles: 3,
    no_trade_after: '15:15',
    working_days: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    start_time: '09:15',
    square_off_time: '15:15',
    is_active: false,
    is_paper_trading: true
  });

  const [programmingFormData, setProgrammingFormData] = useState({
    name: '',
    description: '',
    strategy_type: 'PROGRAMMING',
    asset_type: 'STOCK',
    symbol: '',
    programming_language: 'PYTHON',
    code: '',
    code_version: '1.0',
    execution_frequency: 'real_time',
    max_execution_time: 300,
    dependencies: {},
    environment_variables: {},
    stop_loss_type: 'SL %',
    stop_loss_value: 2.0,
    take_profit_type: 'TP %',
    take_profit_value: 4.0,
    position_size: '1',
    is_active: false,
    is_paper_trading: true
  });

  // Additional states for TimeBasedStrategy component
  const [instrumentSearch, setInstrumentSearch] = useState({
    searchQuery: '',
    searchResults: [] as any[],
    isSearching: false,
    selectedInstrument: null as any
  });

  const [availableInstruments] = useState([
    { symbol: 'NIFTY 50', name: 'NIFTY 50', segment: 'INDEX', lotSize: 1 },
    { symbol: 'BANKNIFTY', name: 'BANK NIFTY', segment: 'INDEX', lotSize: 1 },
    { symbol: 'SENSEX', name: 'SENSEX', segment: 'INDEX', lotSize: 1 },
    { symbol: 'RELIANCE', name: 'RELIANCE', segment: 'EQ', lotSize: 1 },
    { symbol: 'TCS', name: 'TCS', segment: 'EQ', lotSize: 1 }
  ]);

  const [isUnderlyingSelected, setIsUnderlyingSelected] = useState(false);
  const [orderLegs, setOrderLegs] = useState([] as any[]);
  const [advanceFeatures, setAdvanceFeatures] = useState({
    trailingStop: false,
    trailingStopPercentage: 1.5,
    trailingProfit: false,
    trailingProfitPercentage: 2.0,
    dailyLossLimit: 5000,
    dailyProfitLimit: 10000,
    maxTradeCycles: 3,
    noTradeAfter: '15:15'
  });
  const [showAdvanceFeatures, setShowAdvanceFeatures] = useState(false);
  const [profitTrailingType, setProfitTrailingType] = useState('no_trailing');

  // Handler functions for TimeBasedStrategy
  const handleInstrumentSearch = (query: string) => {
    setInstrumentSearch(prev => ({
      ...prev,
      searchQuery: query,
      isSearching: query.length > 0,
      searchResults: query.length > 0 ? availableInstruments.filter(instrument => 
        instrument.symbol.toLowerCase().includes(query.toLowerCase()) ||
        instrument.name.toLowerCase().includes(query.toLowerCase())
      ) : []
    }));
  };

  const handleInstrumentSelect = (instrument: any) => {
    setInstrumentSearch(prev => ({
      ...prev,
      selectedInstrument: instrument,
      searchQuery: instrument.symbol,
      isSearching: false,
      searchResults: []
    }));
    setIsUnderlyingSelected(true);
    setTimeBasedFormData(prev => ({
      ...prev,
      symbol: instrument.symbol
    }));
  };

  const handleInstrumentRemove = () => {
    setInstrumentSearch(prev => ({
      ...prev,
      selectedInstrument: null,
      searchQuery: '',
      isSearching: false,
      searchResults: []
    }));
    setIsUnderlyingSelected(false);
    setTimeBasedFormData(prev => ({
      ...prev,
      symbol: ''
    }));
  };

  const addLeg = () => {
    const newLeg = {
      id: Date.now(),
      legType: 'BUY',
      optionType: 'CE',
      strikeType: 'ATM',
      strikePrice: '',
      quantity: 1,
      productType: 'MIS'
    };
    setOrderLegs(prev => [...prev, newLeg]);
  };

  const deleteLeg = (id: number) => {
    setOrderLegs(prev => prev.filter(leg => leg.id !== id));
  };

  const updateLeg = (id: number, field: string, value: any) => {
    setOrderLegs(prev => prev.map(leg => 
      leg.id === id ? { ...leg, [field]: value } : leg
    ));
  };

  const getATMOptions = (atmPt: string) => {
    const basePrice = 20000; // Example base price
    const options = [];
    for (let i = -5; i <= 5; i++) {
      const strike = basePrice + (i * 100);
      options.push(strike.toString());
    }
    return options;
  };

  // Indicator data
  const indicatorsData: IndicatorGroup = {
    'Moving Averages': [
      {
        value: 'SMA',
        label: 'Simple Moving Average (SMA)',
        category: 'Moving Averages',
        parameters: [
          { name: 'period', label: 'Period', type: 'number', default: 20, min: 1, max: 200, step: 1 }
        ]
      },
      {
        value: 'EMA',
        label: 'Exponential Moving Average (EMA)',
        category: 'Moving Averages',
        parameters: [
          { name: 'period', label: 'Period', type: 'number', default: 20, min: 1, max: 200, step: 1 }
        ]
      },
      {
        value: 'WMA',
        label: 'Weighted Moving Average (WMA)',
        category: 'Moving Averages',
        parameters: [
          { name: 'period', label: 'Period', type: 'number', default: 20, min: 1, max: 200, step: 1 }
        ]
      },
      {
        value: 'DEMA',
        label: 'Double Exponential Moving Average (DEMA)',
        category: 'Moving Averages',
        parameters: [
          { name: 'period', label: 'Period', type: 'number', default: 20, min: 1, max: 200, step: 1 }
        ]
      },
      {
        value: 'TEMA',
        label: 'Triple Exponential Moving Average (TEMA)',
        category: 'Moving Averages',
        parameters: [
          { name: 'period', label: 'Period', type: 'number', default: 20, min: 1, max: 200, step: 1 }
        ]
      }
    ],
    'Momentum': [
      {
        value: 'RSI',
        label: 'Relative Strength Index (RSI)',
        category: 'Momentum',
        parameters: [
          { name: 'period', label: 'Period', type: 'number', default: 14, min: 2, max: 100, step: 1 },
          { name: 'overbought', label: 'Overbought Level', type: 'number', default: 70, min: 50, max: 100, step: 1 },
          { name: 'oversold', label: 'Oversold Level', type: 'number', default: 30, min: 0, max: 50, step: 1 }
        ]
      },
      {
        value: 'STOCHASTIC',
        label: 'Stochastic Oscillator',
        category: 'Momentum',
        parameters: [
          { name: 'k_period', label: 'K Period', type: 'number', default: 14, min: 1, max: 100, step: 1 },
          { name: 'd_period', label: 'D Period', type: 'number', default: 3, min: 1, max: 20, step: 1 }
        ]
      }
    ],
    'Trend': [
      {
        value: 'MACD',
        label: 'MACD (Moving Average Convergence Divergence)',
        category: 'Trend',
        parameters: [
          { name: 'fast_period', label: 'Fast Period', type: 'number', default: 12, min: 1, max: 50, step: 1 },
          { name: 'slow_period', label: 'Slow Period', type: 'number', default: 26, min: 1, max: 100, step: 1 },
          { name: 'signal_period', label: 'Signal Period', type: 'number', default: 9, min: 1, max: 50, step: 1 }
        ]
      },
      {
        value: 'BOLLINGER',
        label: 'Bollinger Bands',
        category: 'Trend',
        parameters: [
          { name: 'period', label: 'Period', type: 'number', default: 20, min: 1, max: 100, step: 1 },
          { name: 'std_dev', label: 'Standard Deviation', type: 'number', default: 2, min: 1, max: 5, step: 0.1 }
        ]
      }
    ]
  };

  useEffect(() => {
    // Initialize indicators array
    const allIndicators: Indicator[] = [];
    Object.values(indicatorsData).forEach(categoryIndicators => {
      allIndicators.push(...categoryIndicators);
    });
    setIndicators(allIndicators);

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
    }
  }, [strategyId, router]);

  const fetchStrategy = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/strategies/${strategyId}`);
      if (response.ok) {
        const data = await response.json();
        const strategyData = data.strategy;
        setStrategy(strategyData);
        
        // Set strategy type and form data based on strategy type
        if (strategyData.strategy_type === 'TIME_BASED') {
          setStrategyCreationType('time-based');
          setStrategySubType('time-based');
          
          // Set time-based form data with stored values
          setTimeBasedFormData({
            name: strategyData.name || '',
            description: strategyData.description || '',
            strategy_type: strategyData.strategy_type || 'TIME_BASED',
            asset_type: strategyData.asset_type || 'INDEX',
            symbol: strategyData.symbol || '',
            trigger_type: strategyData.details?.trigger_type || 'specific_time',
            trigger_time: strategyData.details?.trigger_time || '09:30',
            trigger_timezone: strategyData.details?.trigger_timezone || 'IST',
            trigger_recurrence: strategyData.details?.trigger_recurrence || 'daily',
            trigger_weekly_days: strategyData.details?.trigger_weekly_days || [],
            trigger_monthly_day: strategyData.details?.trigger_monthly_day || 1,
            trigger_monthly_type: strategyData.details?.trigger_monthly_type || 'day_of_month',
            trigger_after_open_minutes: strategyData.details?.trigger_after_open_minutes || 15,
            trigger_before_close_minutes: strategyData.details?.trigger_before_close_minutes || 30,
            trigger_candle_interval: strategyData.details?.trigger_candle_interval || 5,
            trigger_candle_delay_minutes: strategyData.details?.trigger_candle_delay_minutes || 0,
            action_type: strategyData.details?.action_type || 'place_order',
            order_transaction_type: strategyData.details?.order_transaction_type || 'BUY',
            order_type: strategyData.details?.order_type || 'MARKET',
            order_quantity: strategyData.details?.order_quantity || 1,
            order_product_type: strategyData.details?.order_product_type || 'MIS',
            order_price: strategyData.details?.order_price || 0,
            working_days: strategyData.details?.working_days || {
              monday: true, tuesday: true, wednesday: true, thursday: true, friday: true,
              saturday: false, sunday: false
            },
            start_time: strategyData.details?.start_time || '09:15',
            square_off_time: strategyData.details?.square_off_time || '15:15',
            strategy_start_date: strategyData.details?.strategy_start_date || '',
            strategy_start_time: strategyData.details?.strategy_start_time || '09:15',
            strategy_validity_date: strategyData.details?.strategy_validity_date || '',
            deactivate_after_first_trigger: strategyData.details?.deactivate_after_first_trigger || false,
            stop_loss_type: strategyData.details?.stop_loss_type || 'SL %',
            stop_loss_value: strategyData.details?.stop_loss_value || 2.0,
            take_profit_type: strategyData.details?.take_profit_type || 'TP %',
            take_profit_value: strategyData.details?.take_profit_value || 4.0,
            position_size: strategyData.details?.position_size || '1',
            profit_trailing_type: strategyData.details?.profit_trailing_type || 'no_trailing',
            trailing_stop: strategyData.details?.trailing_stop || false,
            trailing_stop_percentage: strategyData.details?.trailing_stop_percentage || 1.5,
            trailing_profit: strategyData.details?.trailing_profit || false,
            trailing_profit_percentage: strategyData.details?.trailing_profit_percentage || 2.0,
            daily_loss_limit: strategyData.details?.daily_loss_limit || 5000,
            daily_profit_limit: strategyData.details?.daily_profit_limit || 10000,
            max_trade_cycles: strategyData.details?.max_trade_cycles || 3,
            no_trade_after: strategyData.details?.no_trade_after || '15:15',
            is_active: strategyData.is_active || false,
            is_paper_trading: strategyData.is_paper_trading || true
          });
        } else if (strategyData.strategy_type === 'INDICATOR_BASED') {
          setStrategyCreationType('indicator-based');
          setStrategySubType('indicator-based');
          
          // Set indicator-based form data with stored values
          setIndicatorBasedFormData({
            name: strategyData.name || '',
            description: strategyData.description || '',
            strategy_type: strategyData.strategy_type || 'INDICATOR_BASED',
            asset_type: strategyData.asset_type || 'INDEX',
            symbol: strategyData.symbol || '',
            chart_type: strategyData.details?.chart_type || 'Candle',
            time_interval: strategyData.details?.time_interval || '5 Min',
            transaction_type: strategyData.details?.transaction_type || 'Both Side',
            long_conditions: strategyData.details?.long_conditions || [],
            short_conditions: strategyData.details?.short_conditions || [],
            condition_blocks: strategyData.details?.condition_blocks || 1,
            logical_operator: strategyData.details?.logical_operator || 'AND',
            selected_indicators: strategyData.details?.selected_indicators || {
              long1: { indicator: '', parameters: {} },
              long2: { indicator: '', parameters: {} },
              short1: { indicator: '', parameters: {} },
              short2: { indicator: '', parameters: {} }
            },
            stop_loss_type: strategyData.details?.stop_loss_type || 'SL %',
            stop_loss_value: strategyData.details?.stop_loss_value || 2.0,
            take_profit_type: strategyData.details?.take_profit_type || 'TP %',
            take_profit_value: strategyData.details?.take_profit_value || 4.0,
            position_size: strategyData.details?.position_size || '1',
            profit_trailing_type: strategyData.details?.profit_trailing_type || 'no_trailing',
            trailing_stop: strategyData.details?.trailing_stop || false,
            trailing_stop_percentage: strategyData.details?.trailing_stop_percentage || 1.5,
            trailing_profit: strategyData.details?.trailing_profit || false,
            trailing_profit_percentage: strategyData.details?.trailing_profit_percentage || 2.0,
            daily_loss_limit: strategyData.details?.daily_loss_limit || 5000,
            daily_profit_limit: strategyData.details?.daily_profit_limit || 10000,
            max_trade_cycles: strategyData.details?.max_trade_cycles || 3,
            no_trade_after: strategyData.details?.no_trade_after || '15:15',
            working_days: strategyData.details?.working_days || {
              monday: true, tuesday: true, wednesday: true, thursday: true, friday: true,
              saturday: false, sunday: false
            },
            start_time: strategyData.details?.start_time || '09:15',
            square_off_time: strategyData.details?.square_off_time || '15:15',
            is_active: strategyData.is_active || false,
            is_paper_trading: strategyData.is_paper_trading || true
          });
        } else if (strategyData.strategy_type === 'PROGRAMMING') {
          setStrategyCreationType('programming');
          
          // Set programming form data with stored values
          setProgrammingFormData({
            name: strategyData.name || '',
            description: strategyData.description || '',
            strategy_type: strategyData.strategy_type || 'PROGRAMMING',
            asset_type: strategyData.asset_type || 'STOCK',
            symbol: strategyData.symbol || '',
            programming_language: strategyData.details?.programming_language || 'PYTHON',
            code: strategyData.details?.code || '',
            code_version: strategyData.details?.code_version || '1.0',
            execution_frequency: strategyData.details?.execution_frequency || 'real_time',
            max_execution_time: strategyData.details?.max_execution_time || 300,
            dependencies: strategyData.details?.dependencies || {},
            environment_variables: strategyData.details?.environment_variables || {},
            stop_loss_type: strategyData.details?.stop_loss_type || 'SL %',
            stop_loss_value: strategyData.details?.stop_loss_value || 2.0,
            take_profit_type: strategyData.details?.take_profit_type || 'TP %',
            take_profit_value: strategyData.details?.take_profit_value || 4.0,
            position_size: strategyData.details?.position_size || '1',
            is_active: strategyData.is_active || false,
            is_paper_trading: strategyData.is_paper_trading || true
          });
        }
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

  // Form submission handlers
  const handleTimeBasedSubmit = async (formData: any) => {
    try {
      setSaving(true);
      
      // Update main strategy
      const mainResponse = await fetch(`/api/strategies/${strategyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          strategy_type: formData.strategy_type,
          symbol: formData.symbol,
          asset_type: formData.asset_type,
          entry_conditions: `Trigger: ${formData.trigger_type}, Time: ${formData.trigger_time}`,
          exit_conditions: 'Stop Loss or Take Profit',
          risk_management: {
            stop_loss: `${formData.stop_loss_value}%`,
            take_profit: `${formData.take_profit_value}%`,
            position_size: `${formData.position_size} lot`
          },
          is_active: formData.is_active,
          is_paper_trading: formData.is_paper_trading,
          user_id: strategy?.user_id
        }),
      });

      if (!mainResponse.ok) {
        throw new Error('Failed to update main strategy');
      }

      // Update time-based strategy details
      const detailResponse = await fetch('/api/strategies/time-based', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          user_id: strategy?.user_id
        }),
      });

      if (!detailResponse.ok) {
        throw new Error('Failed to update strategy details');
      }

      setDeploymentStatus('Strategy updated successfully!');
      setTimeout(() => {
        router.push('/strategies');
      }, 1000);
    } catch (error) {
      console.error('Error updating strategy:', error);
      setDeploymentStatus('Failed to update strategy');
    } finally {
      setSaving(false);
    }
  };

  const handleIndicatorBasedSubmit = async (formData: any) => {
    try {
      setSaving(true);
      
      // Update main strategy
      const mainResponse = await fetch(`/api/strategies/${strategyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          strategy_type: formData.strategy_type,
          symbol: formData.symbol,
          asset_type: formData.asset_type,
          entry_conditions: `Long: ${formData.selected_indicators.long1?.indicator || 'Not set'}, Short: ${formData.selected_indicators.short1?.indicator || 'Not set'}`,
          exit_conditions: 'Stop Loss or Take Profit',
          risk_management: {
            stop_loss: `${formData.stop_loss_value}%`,
            take_profit: `${formData.take_profit_value}%`,
            position_size: `${formData.position_size} lot`
          },
          is_active: formData.is_active,
          is_paper_trading: formData.is_paper_trading,
          user_id: strategy?.user_id
        }),
      });

      if (!mainResponse.ok) {
        throw new Error('Failed to update main strategy');
      }

      // Update indicator-based strategy details
      const detailResponse = await fetch('/api/strategies/indicator-based', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          user_id: strategy?.user_id
        }),
      });

      if (!detailResponse.ok) {
        throw new Error('Failed to update strategy details');
      }

      setDeploymentStatus('Strategy updated successfully!');
      setTimeout(() => {
        router.push('/strategies');
      }, 1000);
    } catch (error) {
      console.error('Error updating strategy:', error);
      setDeploymentStatus('Failed to update strategy');
    } finally {
      setSaving(false);
    }
  };

  const handleProgrammingSubmit = async (formData: any) => {
    try {
      setSaving(true);
      
      // Update main strategy
      const mainResponse = await fetch(`/api/strategies/${strategyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          strategy_type: formData.strategy_type,
          symbol: formData.symbol,
          asset_type: formData.asset_type,
          entry_conditions: `Programming: ${formData.programming_language}`,
          exit_conditions: 'Stop Loss or Take Profit',
          risk_management: {
            stop_loss: `${formData.stop_loss_value}%`,
            take_profit: `${formData.take_profit_value}%`,
            position_size: `${formData.position_size} lot`
          },
          is_active: formData.is_active,
          is_paper_trading: formData.is_paper_trading,
          user_id: strategy?.user_id
        }),
      });

      if (!mainResponse.ok) {
        throw new Error('Failed to update main strategy');
      }

      // Update programming strategy details
      const detailResponse = await fetch('/api/strategies/programming', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          user_id: strategy?.user_id
        }),
      });

      if (!detailResponse.ok) {
        throw new Error('Failed to update strategy details');
      }

      setDeploymentStatus('Strategy updated successfully!');
      setTimeout(() => {
        router.push('/strategies');
      }, 1000);
    } catch (error) {
      console.error('Error updating strategy:', error);
      setDeploymentStatus('Failed to update strategy');
    } finally {
      setSaving(false);
    }
  };

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
          <main className="flex-1 p-6 md:ml-0">
            <div className="flex items-center justify-center">
              <div className="text-white">Loading strategy...</div>
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
          <main className="flex-1 p-6 md:ml-0">
            <div className="text-white">Strategy not found</div>
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
          {/* Header */}
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
          </div>

          {/* Strategy Type Display */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center space-x-4">
              {strategy.strategy_type === 'TIME_BASED' && <BarChart3 className="text-blue-400" size={24} />}
              {strategy.strategy_type === 'INDICATOR_BASED' && <BarChart3 className="text-green-400" size={24} />}
              {strategy.strategy_type === 'PROGRAMMING' && <Code className="text-purple-400" size={24} />}
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {strategy.strategy_type === 'TIME_BASED' && 'Time-Based Strategy'}
                  {strategy.strategy_type === 'INDICATOR_BASED' && 'Indicator-Based Strategy'}
                  {strategy.strategy_type === 'PROGRAMMING' && 'Programming Strategy'}
                </h2>
                <p className="text-blue-200">Edit your strategy configuration</p>
              </div>
            </div>
          </div>

          {/* Strategy Forms */}
          {strategyCreationType === 'time-based' && (
            <TimeBasedStrategy
              timeIndicatorFormData={timeBasedFormData}
              setTimeIndicatorFormData={setTimeBasedFormData}
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
          )}

          {strategyCreationType === 'indicator-based' && (
            <IndicatorBasedStrategy
              timeIndicatorFormData={indicatorBasedFormData}
              setTimeIndicatorFormData={setIndicatorBasedFormData}
              setStrategyCreationType={setStrategyCreationType}
              handleTimeIndicatorSubmit={handleIndicatorBasedSubmit}
              instrumentSearch={instrumentSearch}
              handleInstrumentSearch={handleInstrumentSearch}
              handleInstrumentSelect={handleInstrumentSelect}
              handleInstrumentRemove={handleInstrumentRemove}
              availableInstruments={availableInstruments}
              isUnderlyingSelected={isUnderlyingSelected}
              conditionBlocks={indicatorBasedFormData.condition_blocks}
              setConditionBlocks={(blocks: any) => setIndicatorBasedFormData((prev: any) => ({ ...prev, condition_blocks: blocks }))}
              logicalOperator={indicatorBasedFormData.logical_operator as 'AND' | 'OR'}
              setLogicalOperator={(operator: any) => setIndicatorBasedFormData((prev: any) => ({ ...prev, logical_operator: operator }))}
              longComparator=""
              shortComparator=""
              handleLongComparatorChange={() => {}}
              handleShortComparatorChange={() => {}}
              selectedIndicators={indicatorBasedFormData.selected_indicators}
              openIndicatorModal={() => {}}
              indicators={indicators as any}
              strikeType="ATM"
              setStrikeType={() => {}}
              customPrice=""
              setCustomPrice={() => {}}
              profitTrailingType={indicatorBasedFormData.profit_trailing_type}
              setProfitTrailingType={(type: any) => setIndicatorBasedFormData((prev: any) => ({ ...prev, profit_trailing_type: type }))}
              handleTimeIndicatorChange={(e: any) => {
                const { name, value } = e.target;
                setIndicatorBasedFormData((prev: any) => ({
                  ...prev,
                  [name]: value
                }));
              }}
              addConditionBlock={() => setIndicatorBasedFormData((prev: any) => ({ ...prev, condition_blocks: prev.condition_blocks + 1 }))}
            />
          )}

          {strategyCreationType === 'programming' && (
            <ProgrammingStrategy
              programmingFormData={programmingFormData}
              setProgrammingFormData={setProgrammingFormData}
              setStrategyCreationType={setStrategyCreationType}
              handleProgrammingSubmit={handleProgrammingSubmit}
              handleProgrammingChange={(e: any) => {
                const { name, value } = e.target;
                setProgrammingFormData((prev: any) => ({
                  ...prev,
                  [name]: value
                }));
              }}
              validationErrors={[]}
            />
          )}

          {/* Deployment Status */}
          {deploymentStatus && (
            <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
              deploymentStatus.includes('successfully') 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              <div className="flex items-center space-x-2">
                {deploymentStatus.includes('successfully') ? (
                  <CheckCircle size={20} />
                ) : (
                  <X size={20} />
                )}
                <span>{deploymentStatus}</span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default EditStrategyPage;
