'use client'

/**
 * Pre Punch SL (Pre-Punch Stop Loss) Implementation
 * 
 * This feature automatically places stop loss orders in the demat account
 * when trades are executed through the software, based on user configuration.
 * 
 * How it works:
 * 1. User creates a strategy with "Pre Punch SL" enabled in Advance Features
 * 2. When the strategy executes a trade, the main order is placed first
 * 3. If Pre Punch SL is enabled, the system automatically calculates the SL price
 * 4. The SL order is then placed in the demat account with opposite side
 * 5. The executed trade is updated with SL order details
 * 
 * Key Functions:
 * - handlePrePunchSL: Core logic for automatic SL placement
 * - placeSLOrderInDemat: Places SL order in demat account via API
 * - executeOrderWithPrePunchSL: Main execution function with Pre Punch SL integration
 * - executeMainOrder: Executes the main trade order
 * - getCurrentMarketData: Fetches current market prices
 * 
 * SL Price Calculation:
 * - For BUY orders: SL = Current Price - SL Value (points) or Current Price * (1 - SL %)
 * - For SELL orders: SL = Current Price + SL Value (points) or Current Price * (1 + SL %)
 * 
 * API Integration:
 * - /api/broker/place-order: For placing SL orders in demat account
 * - /api/trade/{id}: For updating executed trades with SL order details
 * 
 * Error Handling:
 * - Comprehensive validation of SL configuration
 * - Fallback handling if SL order placement fails
 * - Detailed logging for debugging
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, BarChart3, Code, TrendingUp, Cpu, Zap, Target, Shield, Brain, Rocket, Palette, Database, Globe, Clock, DollarSign, AlertTriangle, CheckCircle, Sparkles, Layers, BarChart2, Activity, PieChart, LineChart, Settings, Play, Pause, RotateCcw, X, Sun, Plus, Copy, Trash2, Search, ExternalLink, Info, ChevronDown, ChevronRight } from 'lucide-react';
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
    },
    // Time-based strategy specific fields
    // Strategy Trigger (The When)
    trigger_type: 'specific_time', // 'specific_time', 'after_market_open', 'before_market_close', 'candle_based'
    trigger_time: '09:20:00',
    trigger_timezone: 'IST',
    trigger_recurrence: 'daily', // 'once', 'daily', 'weekly', 'monthly'
    trigger_weekly_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    trigger_monthly_day: 1,
    trigger_monthly_type: 'day_of_month', // 'day_of_month', 'first_monday', 'last_friday'
    trigger_after_open_minutes: 5,
    trigger_before_close_minutes: 15,
    trigger_candle_interval: 5,
    trigger_candle_delay_minutes: 1,
    // Action (The What)
    action_type: 'place_order', // 'place_order', 'modify_order', 'cancel_order', 'send_notification', 'run_strategy'
    time_order_transaction_type: 'BUY', // 'BUY', 'SELL'
    time_order_type: 'MARKET', // 'MARKET', 'LIMIT', 'SL', 'SL-M'
    time_order_quantity: 1,
    time_order_product_type: 'MIS', // 'MIS', 'CNC', 'NRML'
    time_order_price: '',
    // Conditions (The Only If)
    enable_conditions: false,
    conditions: [],
    // Strategy Expiry (The Until When)
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

  // Pre Punch SL functionality - Automatically place SL orders in demat account
  const handlePrePunchSL = async (orderLeg: any, executedTrade: any) => {
    try {
      console.log('Pre Punch SL: Processing order leg for automatic SL placement', orderLeg);
      
      // Validate that Pre Punch SL is enabled
      if (!advanceFeatures.prePunchSL) {
        console.log('Pre Punch SL: Feature is disabled, skipping automatic SL placement');
        return { success: false, message: 'Pre Punch SL feature is disabled' };
      }

      // Validate order leg has SL configuration
      if (!orderLeg.slType || !orderLeg.slValue) {
        console.log('Pre Punch SL: Order leg missing SL configuration', orderLeg);
        return { success: false, message: 'Stop Loss configuration is missing' };
      }

      // Calculate SL price based on SL type and value
      let slPrice = 0;
      const currentPrice = executedTrade.executionPrice || 0;
      
      if (orderLeg.slType === 'SL %') {
        // Calculate SL price based on percentage
        if (orderLeg.action === 'buy') {
          // For buy orders, SL is below current price
          slPrice = currentPrice * (1 - orderLeg.slValue / 100);
        } else {
          // For sell orders, SL is above current price
          slPrice = currentPrice * (1 + orderLeg.slValue / 100);
        }
      } else if (orderLeg.slType === 'SL pt') {
        // Calculate SL price based on points
        if (orderLeg.action === 'buy') {
          // For buy orders, SL is below current price
          slPrice = currentPrice - orderLeg.slValue;
        } else {
          // For sell orders, SL is above current price
          slPrice = currentPrice + orderLeg.slValue;
        }
      }

      // Round SL price to 2 decimal places
      slPrice = Math.round(slPrice * 100) / 100;

      // Validate calculated SL price
      if (slPrice <= 0) {
        console.error('Pre Punch SL: Invalid calculated SL price', { slPrice, orderLeg, executedTrade });
        return { success: false, message: 'Invalid calculated Stop Loss price' };
      }

      // Prepare SL order data for demat account
      const slOrderData = {
        symbol: executedTrade.symbol,
        quantity: orderLeg.quantity,
        orderType: 'SL',
        price: slPrice,
        triggerPrice: slPrice,
        side: orderLeg.action === 'buy' ? 'SELL' : 'BUY', // Opposite of original order
        productType: 'MIS', // Can be made configurable
        validity: 'DAY',
        disclosedQuantity: 0,
        orderTag: `SL_${executedTrade.orderId}_${Date.now()}`,
        // Additional demat account specific fields
        exchange: 'NSE', // Can be made configurable
        segment: 'OPTSTK', // Options segment
        instrumentType: 'OPT',
        expiryDate: orderLeg.expiry,
        strikePrice: orderLeg.atm === 'ATM' ? 'ATM' : orderLeg.atm,
        optionType: orderLeg.optionType.toUpperCase(),
        // Risk management
        stopLossType: orderLeg.slType,
        stopLossValue: orderLeg.slValue,
        stopLossOnPrice: orderLeg.slOnPrice
      };

      console.log('Pre Punch SL: Prepared SL order data', slOrderData);

      // Place SL order in demat account via API
      const slOrderResponse = await placeSLOrderInDemat(slOrderData);
      
      if (slOrderResponse.success) {
        console.log('Pre Punch SL: Successfully placed SL order in demat account', slOrderResponse);
        
        // Update the executed trade with SL order details
        const updatedTrade = {
          ...executedTrade,
          stopLossOrder: {
            orderId: slOrderResponse.orderId,
            price: slPrice,
            status: 'PENDING',
            placedAt: new Date().toISOString(),
            dematAccountId: slOrderResponse.dematAccountId
          }
        };

        // Save updated trade to database
        await updateExecutedTrade(updatedTrade);

        return {
          success: true,
          message: 'Stop Loss order successfully placed in demat account',
          slOrderId: slOrderResponse.orderId,
          slPrice: slPrice,
          dematAccountId: slOrderResponse.dematAccountId
        };
      } else {
        console.error('Pre Punch SL: Failed to place SL order in demat account', slOrderResponse);
        return {
          success: false,
          message: `Failed to place SL order: ${slOrderResponse.message}`,
          error: slOrderResponse.error
        };
      }

    } catch (error) {
      console.error('Pre Punch SL: Error during automatic SL placement', error);
      return {
        success: false,
        message: 'Error during automatic Stop Loss placement',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  // Function to place SL order in demat account
  const placeSLOrderInDemat = async (slOrderData: any) => {
    try {
      console.log('Placing SL order in demat account:', slOrderData);

      // This would be your actual API call to your demat account integration
      // For now, we'll simulate the API call
      const response = await fetch('/api/broker/place-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getUserToken()}`
        },
        body: JSON.stringify({
          orderType: 'SL',
          ...slOrderData
        })
      });

      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          orderId: result.orderId,
          dematAccountId: result.dematAccountId,
          message: 'SL order placed successfully'
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || 'Failed to place SL order',
          error: errorData.error
        };
      }
    } catch (error) {
      console.error('Error placing SL order in demat account:', error);
      return {
        success: false,
        message: 'Network error while placing SL order',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  // Function to update executed trade with SL order details
  const updateExecutedTrade = async (updatedTrade: any) => {
    try {
      const response = await fetch(`/api/trade/${updatedTrade.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getUserToken()}`
        },
        body: JSON.stringify(updatedTrade)
      });

      if (response.ok) {
        console.log('Trade updated successfully with SL order details');
        return true;
      } else {
        console.error('Failed to update trade with SL order details');
        return false;
      }
    } catch (error) {
      console.error('Error updating trade:', error);
      return false;
    }
  };

  // Enhanced order execution function with Pre Punch SL integration
  const executeOrderWithPrePunchSL = async (orderLeg: any, marketData: any) => {
    try {
      console.log('Executing order with Pre Punch SL integration:', orderLeg);

      // First, execute the main order
      const mainOrderResult = await executeMainOrder(orderLeg, marketData);
      
      if (!mainOrderResult.success) {
        console.error('Failed to execute main order:', mainOrderResult);
        return mainOrderResult;
      }

      console.log('Main order executed successfully:', mainOrderResult);

      // If Pre Punch SL is enabled, automatically place SL order
      if (advanceFeatures.prePunchSL) {
        console.log('Pre Punch SL enabled, placing automatic SL order...');
        
        const prePunchSLResult = await handlePrePunchSL(orderLeg, mainOrderResult.executedTrade);
        
        if (prePunchSLResult.success) {
          console.log('Pre Punch SL order placed successfully:', prePunchSLResult);
          
          // Return combined result
          return {
            success: true,
            message: 'Order executed and SL order placed successfully',
            mainOrder: mainOrderResult,
            slOrder: prePunchSLResult,
            totalOrders: 2
          };
        } else {
          console.warn('Main order executed but Pre Punch SL failed:', prePunchSLResult);
          
          // Return partial success
          return {
            success: true,
            message: 'Order executed but SL order placement failed',
            mainOrder: mainOrderResult,
            slOrder: prePunchSLResult,
            totalOrders: 1,
            warning: 'SL order placement failed, please place manually'
          };
        }
      } else {
        console.log('Pre Punch SL disabled, only main order executed');
        return {
          success: true,
          message: 'Order executed successfully (Pre Punch SL disabled)',
          mainOrder: mainOrderResult,
          totalOrders: 1
        };
      }

    } catch (error) {
      console.error('Error in executeOrderWithPrePunchSL:', error);
      return {
        success: false,
        message: 'Error during order execution',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  // Function to execute main order (placeholder - implement your actual order execution logic)
  const executeMainOrder = async (orderLeg: any, marketData: any) => {
    try {
      console.log('Executing main order:', orderLeg);
      
      // This would be your actual order execution logic
      // For now, we'll simulate a successful order execution
      const executedTrade = {
        id: `TRADE_${Date.now()}`,
        orderId: `ORDER_${Date.now()}`,
        symbol: instrumentSearch.selectedInstrument?.symbol || 'NIFTY',
        quantity: orderLeg.quantity,
        side: orderLeg.action.toUpperCase(),
        price: marketData.currentPrice || 100,
        executionPrice: marketData.currentPrice || 100,
        status: 'EXECUTED',
        executedAt: new Date().toISOString(),
        orderLeg: orderLeg,
        marketData: marketData
      };

      return {
        success: true,
        message: 'Main order executed successfully',
        executedTrade: executedTrade
      };
    } catch (error) {
      console.error('Error executing main order:', error);
      return {
        success: false,
        message: 'Failed to execute main order',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  // Function to get current market data (placeholder - implement your actual market data logic)
  const getCurrentMarketData = async (symbol: string) => {
    try {
      // This would be your actual market data API call
      // For now, we'll return mock data
      return {
        symbol: symbol,
        currentPrice: Math.random() * 1000 + 100, // Random price between 100-1100
        timestamp: new Date().toISOString(),
        volume: Math.floor(Math.random() * 1000000),
        change: Math.random() * 10 - 5
      };
    } catch (error) {
      console.error('Error fetching market data:', error);
      return null;
    }
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
    
    // Create new strategy object for Time Based Strategy
    const newStrategy = {
      id: Date.now().toString(), // Generate unique ID
      user_id: (user as any)?.id || '1',
      name: timeIndicatorFormData.name.trim(),
      description: timeIndicatorFormData.description || `Time Based Strategy created on ${new Date().toLocaleDateString()}`,
      strategy_type: 'TIME_BASED',
      symbol: timeIndicatorFormData.symbol,
      entry_conditions: 'Time-based entry',
      exit_conditions: 'Time-based exit',
      risk_management: {
        stop_loss: '2%',
        take_profit: '4%',
        position_size: '1 lot'
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
        strategy_type: 'TIME_BASED'
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
        console.log('Time Based Strategy saved successfully');
        router.push('/strategies');
      } else {
        const errorData = await response.json();
        console.error('Failed to save time based strategy:', errorData);
        alert(`Error saving strategy: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving time based strategy:', error);
      alert(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    
    // Order Type validation
    if (!timeIndicatorFormData.time_order_product_type) {
      validationErrors.push('Order Type is required');
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
    { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd', segment: 'STOCK', lotSize: 125 },
    { symbol: 'NESTLEIND', name: 'Nestle India Ltd', segment: 'STOCK', lotSize: 100 },
    { symbol: 'POWERGRID', name: 'Power Grid Corporation of India Ltd', segment: 'STOCK', lotSize: 1500 },
    { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Ltd', segment: 'STOCK', lotSize: 125 },
    { symbol: 'NTPC', name: 'NTPC Ltd', segment: 'STOCK', lotSize: 1500 },
    { symbol: 'HCLTECH', name: 'HCL Technologies Ltd', segment: 'STOCK', lotSize: 200 },
    { symbol: 'TECHM', name: 'Tech Mahindra Ltd', segment: 'STOCK', lotSize: 400 },
    { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd', segment: 'STOCK', lotSize: 200 },
    { symbol: 'ADANIPORTS', name: 'Adani Ports & SEZ Ltd', segment: 'STOCK', lotSize: 500 },
    { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd', segment: 'STOCK', lotSize: 500 },
    { symbol: 'TATASTEEL', name: 'Tata Steel Ltd', segment: 'STOCK', lotSize: 1500 },
    { symbol: 'HINDALCO', name: 'Hindalco Industries Ltd', segment: 'STOCK', lotSize: 1000 },
    { symbol: 'COALINDIA', name: 'Coal India Ltd', segment: 'STOCK', lotSize: 3000 },
    { symbol: 'ONGC', name: 'Oil & Natural Gas Corporation Ltd', segment: 'STOCK', lotSize: 1100 },
    { symbol: 'IOC', name: 'Indian Oil Corporation Ltd', segment: 'STOCK', lotSize: 1500 },
    { symbol: 'BPCL', name: 'Bharat Petroleum Corporation Ltd', segment: 'STOCK', lotSize: 1200 },
    { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp Ltd', segment: 'STOCK', lotSize: 200 },
    { symbol: 'EICHERMOT', name: 'Eicher Motors Ltd', segment: 'STOCK', lotSize: 100 },
    { symbol: 'M&M', name: 'Mahindra & Mahindra Ltd', segment: 'STOCK', lotSize: 300 },
    { symbol: 'BRITANNIA', name: 'Britannia Industries Ltd', segment: 'STOCK', lotSize: 200 },
    { symbol: 'DIVISLAB', name: 'Divi\'s Laboratories Ltd', segment: 'STOCK', lotSize: 100 },
    { symbol: 'DRREDDY', name: 'Dr Reddy\'s Laboratories Ltd', segment: 'STOCK', lotSize: 125 },
    { symbol: 'CIPLA', name: 'Cipla Ltd', segment: 'STOCK', lotSize: 400 },
    { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals Enterprise Ltd', segment: 'STOCK', lotSize: 200 },
    { symbol: 'SHREECEM', name: 'Shree Cement Ltd', segment: 'STOCK', lotSize: 50 },
    { symbol: 'GRASIM', name: 'Grasim Industries Ltd', segment: 'STOCK', lotSize: 200 },
    { symbol: 'LT', name: 'Larsen & Toubro Ltd', segment: 'STOCK', lotSize: 200 },
    { symbol: 'ADANIPOWER', name: 'Adani Power Ltd', segment: 'STOCK', lotSize: 4000 },
    { symbol: 'VEDL', name: 'Vedanta Ltd', segment: 'STOCK', lotSize: 1000 },
    { symbol: 'HINDCOPPER', name: 'Hindustan Copper Ltd', segment: 'STOCK', lotSize: 2000 },
    { symbol: 'NATIONALUM', name: 'National Aluminium Company Ltd', segment: 'STOCK', lotSize: 2000 },
    { symbol: 'ADANIGREEN', name: 'Adani Green Energy Ltd', segment: 'STOCK', lotSize: 400 },
    { symbol: 'ADANITRANS', name: 'Adani Transmission Ltd', segment: 'STOCK', lotSize: 200 },
    { symbol: 'ADANIGAS', name: 'Adani Total Gas Ltd', segment: 'STOCK', lotSize: 100 },
    { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd', segment: 'STOCK', lotSize: 200 },
    { symbol: 'ADANIPORTS', name: 'Adani Ports & SEZ Ltd', segment: 'STOCK', lotSize: 500 },
    { symbol: 'ADANIPOWER', name: 'Adani Power Ltd', segment: 'STOCK', lotSize: 4000 },
    { symbol: 'ADANIWILMAR', name: 'Adani Wilmar Ltd', segment: 'STOCK', lotSize: 200 },
    { symbol: 'ADANIONE', name: 'Adani One Ltd', segment: 'STOCK', lotSize: 100 },
    { symbol: 'ADANIFOODS', name: 'Adani Foods Ltd', segment: 'STOCK', lotSize: 100 },
    { symbol: 'ADANIDL', name: 'Adani Digital Labs Ltd', segment: 'STOCK', lotSize: 100 },
    { symbol: 'ADANIHOL', name: 'Adani Hotels Ltd', segment: 'STOCK', lotSize: 100 },
    { symbol: 'ADANIMED', name: 'Adani Media Ltd', segment: 'STOCK', lotSize: 100 },
    { symbol: 'ADANINEWS', name: 'Adani News Ltd', segment: 'STOCK', lotSize: 100 },
    { symbol: 'ADANIPHARMA', name: 'Adani Pharma Ltd', segment: 'STOCK', lotSize: 100 },
    { symbol: 'ADANIRETAIL', name: 'Adani Retail Ltd', segment: 'STOCK', lotSize: 100 },
    { symbol: 'ADANITELECOM', name: 'Adani Telecom Ltd', segment: 'STOCK', lotSize: 100 },
    { symbol: 'ADANITRADE', name: 'Adani Trade Ltd', segment: 'STOCK', lotSize: 100 },
    { symbol: 'ADANIWEALTH', name: 'Adani Wealth Ltd', segment: 'STOCK', lotSize: 100 },
    { symbol: 'ADANIYOUTH', name: 'Adani Youth Ltd', segment: 'STOCK', lotSize: 100 },
    { symbol: 'ADANIZERO', name: 'Adani Zero Ltd', segment: 'STOCK', lotSize: 100 }
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setStrategyCreationType('time-indicator')}
            className="group relative p-4 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 text-white hover:from-white/20 hover:to-white/10 transition-all duration-500 transform hover:scale-110 hover:rotate-12 shadow-2xl hover:shadow-blue-500/25"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <ArrowLeft size={24} className="relative z-10" />
          </button>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-blue-500 to-cyan-600 p-4 rounded-2xl shadow-2xl">
                <Clock size={28} className="text-white drop-shadow-2xl" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Time Based Strategy</h2>
              <p className="text-blue-200 text-sm mt-1">Create strategies based on time triggers</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleTimeBasedSubmit} className="space-y-6">
        {/* Select Underlying Asset */}
        <div className="bg-gradient-to-br from-slate-800/80 to-blue-900/80 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30 shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            Select Underlying Asset
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
                      className="w-full p-2 pl-8 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-blue-500/30 rounded-lg text-white focus:ring-1 focus:ring-blue-400 focus:outline-none transition-all duration-300 backdrop-blur-sm text-sm"
                      placeholder="Search NIFTY 50, BANKNIFTY, SENSEX, RELIANCE, TCS..."
                    />
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                      <Search size={14} className="text-blue-300" />
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
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-white text-sm font-medium">Popular Indices:</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {availableInstruments.filter(instrument => instrument.segment === 'INDEX').slice(0, 4).map((instrument, index) => (
                  <button
                    key={index}
                    onClick={() => handleInstrumentSelect(instrument)}
                    className="group p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-200 hover:scale-105"
                  >
                    <div className="text-center">
                      <div className="text-white font-semibold text-xs">{instrument.symbol}</div>
                      <div className="text-blue-200 text-xs mt-1">{instrument.segment}</div>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="flex items-center space-x-2 mt-4">
                <span className="text-white text-sm font-medium">Popular Stocks:</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {availableInstruments.filter(instrument => instrument.segment === 'STOCK').slice(0, 8).map((instrument, index) => (
                  <button
                    key={index}
                    onClick={() => handleInstrumentSelect(instrument)}
                    className="group p-2 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 hover:border-green-400/50 transition-all duration-200 hover:scale-105"
                  >
                    <div className="text-center">
                      <div className="text-white font-semibold text-xs">{instrument.symbol}</div>
                      <div className="text-green-200 text-xs mt-1">{instrument.segment}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Instrument Display */}
            {isUnderlyingSelected && (
              <div className="mt-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle size={20} className="text-green-400" />
                    <div>
                      <h4 className="text-white font-semibold">Selected Instrument</h4>
                      <div className="text-green-200 text-sm">
                        <div className="font-medium">{instrumentSearch.selectedInstrument?.symbol}</div>
                        <div className="text-xs opacity-75">{instrumentSearch.selectedInstrument?.name}</div>
                        <div className="text-xs opacity-75">
                          {instrumentSearch.selectedInstrument?.segment} • Lot Size: {instrumentSearch.selectedInstrument?.lotSize}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleInstrumentRemove}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors duration-200"
                    title="Remove selected instrument"
                  >
                    <X size={16} className="text-red-400 hover:text-red-300" />
                  </button>
                </div>
              </div>
            )}

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
          </div>
        </div>

        {/* Order Configuration */}
        <div className="bg-gradient-to-br from-slate-800/80 to-blue-900/80 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30 shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            Order Configuration
          </h3>
          
          {/* Compulsory Field Warning */}
          <div className="mb-4 p-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
            <div className="flex items-center space-x-2">
              <AlertTriangle size={16} className="text-orange-400" />
              <span className="text-orange-200 text-sm">
                <span className="font-semibold">Note:</span> Order Type selection is compulsory after selecting underlying asset
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Order Type */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Order Type <span className="text-red-400">*</span>
              </label>
              
              {/* Selection Status */}
              {timeIndicatorFormData.time_order_product_type && (
                <div className="mb-3 p-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30">
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={14} className="text-green-400" />
                    <span className="text-green-200 text-xs">
                      Selected: <span className="font-semibold">{timeIndicatorFormData.time_order_product_type}</span>
                    </span>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                {['MIS', 'CNC', 'BTST'].map((type) => (
                  <label key={type} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="orderType"
                      value={type}
                      checked={timeIndicatorFormData.time_order_product_type === type}
                      onChange={(e) => setTimeIndicatorFormData(prev => ({
                        ...prev,
                        time_order_product_type: e.target.value
                      }))}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-white">{type}</span>
                  </label>
                ))}
              </div>
              {!timeIndicatorFormData.time_order_product_type && (
                <p className="text-red-400 text-xs mt-1">Please select an order type</p>
              )}
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Start time</label>
              <div className="flex items-center space-x-2">
                <input
                  type="time"
                  value={timeIndicatorFormData.start_time}
                  onChange={(e) => setTimeIndicatorFormData(prev => ({
                    ...prev,
                    start_time: e.target.value
                  }))}
                  className="flex-1 p-2 bg-slate-700/50 border border-blue-500/50 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:outline-none backdrop-blur-sm [&::-webkit-calendar-picker-indicator]:bg-slate-700 [&::-webkit-calendar-picker-indicator]:rounded [&::-webkit-calendar-picker-indicator]:p-1 [&::-webkit-calendar-picker-indicator]:hover:bg-slate-600"
                  style={{
                    colorScheme: 'dark'
                  }}
                />
              </div>
            </div>

            {/* Square Off */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Square off</label>
              <div className="flex items-center space-x-2">
                <input
                  type="time"
                  value={timeIndicatorFormData.square_off_time}
                  onChange={(e) => setTimeIndicatorFormData(prev => ({
                    ...prev,
                    square_off_time: e.target.value
                  }))}
                  className="flex-1 p-2 bg-slate-700/50 border border-blue-500/50 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:outline-none backdrop-blur-sm [&::-webkit-calendar-picker-indicator]:bg-slate-700 [&::-webkit-calendar-picker-indicator]:rounded [&::-webkit-calendar-picker-indicator]:p-1 [&::-webkit-calendar-picker-indicator]:hover:bg-slate-600"
                  style={{
                    colorScheme: 'dark'
                  }}
                />
              </div>
            </div>

            {/* Trading Days */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Trading Days</label>
              <div className="flex space-x-1">
                {[
                  { key: 'monday', label: 'MON' },
                  { key: 'tuesday', label: 'TUE' },
                  { key: 'wednesday', label: 'WED' },
                  { key: 'thursday', label: 'THU' },
                  { key: 'friday', label: 'FRI' }
                ].map((day) => (
                  <button 
                    key={day.key}
                    type="button"
                    onClick={() => setTimeIndicatorFormData(prev => ({
                      ...prev,
                      working_days: {
                        ...prev.working_days,
                        [day.key]: !prev.working_days[day.key as keyof typeof prev.working_days]
                      }
                    }))}
                    className={`px-3 py-1 rounded text-xs font-medium shadow-lg transition-all duration-200 ${
                      timeIndicatorFormData.working_days[day.key as keyof typeof timeIndicatorFormData.working_days]
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-xs text-slate-400">
                Click on days to toggle them on/off for trading
              </div>
            </div>
          </div>
        </div>

        {/* Order Legs Section */}
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl p-6 border border-orange-500/20 relative overflow-hidden">
          {/* Background Pattern for Order Legs Section */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M0 0h40v40H0V0zm40 40h40v40H40V40zm0-40h2l-2 2V0zm0 4l4-4h2l-6 6V4zm0 4l8-8h2L40 10V8zm0 8L56 0h2L40 18v-2zm0 8L64 0h2L40 26v-2zm0 8L72 0h2L40 34v-2zm0 8L80 0v2L42 40h-2zm4 0L80 4v2L46 40h-2zm4 0L80 8v2L50 40h-2zm4 0l28-28v2L54 40h-2zm4 0l24-24v2L58 40h-2zm4 0l20-20v2L62 40h-2zm4 0l16-16v2L66 40h-2zm4 0l12-12v2L70 40h-2zm4 0l8-8v2l-6 6h-2zm4 0l4-4v2l-2 2h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                  <Layers size={20} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Order Legs</h3>
              </div>
              <button
                type="button"
                onClick={addLeg}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus size={18} />
                <span>ADD LEG</span>
              </button>
            </div>

          {/* Column Headers */}
          <div className="grid grid-cols-12 gap-2 items-center mb-4 px-2">
            <div className="col-span-1 text-xs font-semibold text-gray-700 text-center bg-gray-100 py-2 rounded-lg">Action</div>
            <div className="col-span-1 text-xs font-semibold text-gray-700 text-center bg-gray-100 py-2 rounded-lg">Qty</div>
            <div className="col-span-1 text-xs font-semibold text-gray-700 text-center bg-gray-100 py-2 rounded-lg">Option</div>
            <div className="col-span-1 text-xs font-semibold text-gray-700 text-center bg-gray-100 py-2 rounded-lg">Expiry</div>
            <div className="col-span-1 text-xs font-semibold text-gray-700 text-center bg-gray-100 py-2 rounded-lg">ATM Pt</div>
            <div className="col-span-1 text-xs font-semibold text-gray-700 text-center bg-gray-100 py-2 rounded-lg">ATM</div>
            <div className="col-span-1 text-xs font-semibold text-gray-700 text-center bg-gray-100 py-2 rounded-lg">SL Type</div>
            <div className="col-span-1 text-xs font-semibold text-gray-700 text-center bg-gray-100 py-2 rounded-lg">SL Value</div>
            <div className="col-span-1 text-xs font-semibold text-gray-700 text-center bg-gray-100 py-2 rounded-lg">SL On</div>
            <div className="col-span-1 text-xs font-semibold text-gray-700 text-center bg-gray-100 py-2 rounded-lg">TP Type</div>
            <div className="col-span-1 text-xs font-semibold text-gray-700 text-center bg-gray-100 py-2 rounded-lg">TP Value</div>
            <div className="col-span-1 text-xs font-semibold text-gray-700 text-center bg-gray-100 py-2 rounded-lg">TP On</div>
            <div className="col-span-1 text-xs font-semibold text-gray-700 text-center bg-gray-100 py-2 rounded-lg">Actions</div>
          </div>

          <div className="space-y-4">
            {orderLegs.map((leg, index) => (
              <div key={leg.id} className={`relative overflow-hidden rounded-xl p-4 shadow-lg transition-all duration-300 hover:shadow-xl ${
                index === 0 
                  ? 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200' 
                  : 'bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 border border-orange-200'
              }`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '20px 20px'
                  }}></div>
                </div>
                
                {/* Leg Header */}
                <div className="relative z-10 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                      <span className={`text-sm font-semibold ${index === 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                        Order Leg {index + 1}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${index === 0 ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                        {leg.action.toUpperCase()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${index === 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-red-100 text-red-700'}`}>
                        {leg.optionType.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-12 gap-2 items-center relative z-10 h-20">
                  {/* Action */}
                  <div className="col-span-1">
                    <select
                      value={leg.action}
                      onChange={(e) => updateLeg(leg.id, 'action', e.target.value)}
                      className="w-full h-12 p-2 text-sm font-medium rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all duration-200"
                      style={{
                        backgroundColor: leg.action === 'buy' ? '#10b981' : '#ef4444',
                        color: 'white',
                        borderColor: leg.action === 'buy' ? '#059669' : '#dc2626'
                      }}
                    >
                      <option value="buy" className="bg-green-500 text-white">BUY</option>
                      <option value="sell" className="bg-red-500 text-white">SELL</option>
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="col-span-1">
                    <input
                      type="number"
                      value={leg.quantity}
                      onChange={(e) => updateLeg(leg.id, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full h-12 p-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-gradient-to-r from-gray-50 to-slate-50 transition-all duration-200"
                      placeholder="Qty"
                    />
                  </div>

                  {/* Option Type */}
                  <div className="col-span-1">
                    <select
                      value={leg.optionType}
                      onChange={(e) => updateLeg(leg.id, 'optionType', e.target.value)}
                      className="w-full h-12 p-2 text-sm font-medium rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all duration-200"
                      style={{
                        backgroundColor: leg.optionType === 'ce' ? '#3b82f6' : '#ef4444',
                        color: 'white',
                        borderColor: leg.optionType === 'ce' ? '#2563eb' : '#dc2626'
                      }}
                    >
                      <option value="ce" className="bg-blue-500 text-white">CE</option>
                      <option value="pe" className="bg-red-500 text-white">PE</option>
                    </select>
                  </div>

                  {/* Expiry */}
                  <div className="col-span-1">
                    <select
                      value={leg.expiry}
                      onChange={(e) => updateLeg(leg.id, 'expiry', e.target.value)}
                      className="w-full h-12 p-2 text-sm font-medium rounded-lg border-2 border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 transition-all duration-200"
                    >
                      <option value="Weekly">Weekly</option>
                      <option value="Next Weekly">Next Weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>

                  {/* ATM Pt */}
                  <div className="col-span-1">
                    <select
                      value={leg.atmPt}
                      onChange={(e) => updateLeg(leg.id, 'atmPt', e.target.value)}
                      className="w-full h-12 p-2 text-sm font-medium rounded-lg border-2 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 transition-all duration-200"
                    >
                      <option value="ATM pt">ATM pt</option>
                      <option value="ATM %">ATM %</option>
                      <option value="SP">SP</option>
                      <option value="SP &gt;=">SP &gt;=</option>
                      <option value="SP &lt;=">SP &lt;=</option>
                    </select>
                  </div>

                  {/* ATM */}
                  <div className="col-span-1">
                    {(leg.atmPt === 'ATM pt' || leg.atmPt === 'ATM %') ? (
                      <select
                        value={leg.atm}
                        onChange={(e) => updateLeg(leg.id, 'atm', e.target.value)}
                        className="w-full h-12 p-2 text-sm font-medium rounded-lg border-2 border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 transition-all duration-200"
                      >
                        {getATMOptions(leg.atmPt).map((option: string) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="number"
                        value={leg.atm}
                        placeholder="Enter Premium Value"
                        onChange={(e) => updateLeg(leg.id, 'atm', e.target.value)}
                        className="w-full h-12 p-2 text-sm border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-gradient-to-r from-orange-50 to-red-50 transition-all duration-200"
                      />
                    )}
                  </div>

                  {/* SL Type */}
                  <div className="col-span-1">
                    <select
                      value={leg.slType}
                      onChange={(e) => updateLeg(leg.id, 'slType', e.target.value)}
                      className="w-full h-12 p-2 text-sm font-medium rounded-lg border-2 border-red-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-gradient-to-r from-red-50 to-pink-50 text-red-700 transition-all duration-200"
                    >
                      <option value="SL %">SL %</option>
                      <option value="SL pt">SL pt</option>
                    </select>
                  </div>

                  {/* SL Value */}
                  <div className="col-span-1">
                    <input
                      type="number"
                      value={leg.slValue}
                      onChange={(e) => updateLeg(leg.id, 'slValue', parseInt(e.target.value) || 0)}
                      className="w-full h-12 p-2 text-sm border-2 border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-gradient-to-r from-red-50 to-pink-50 transition-all duration-200"
                    />
                  </div>

                  {/* SL On */}
                  <div className="col-span-1">
                    <select
                      value={leg.slOnPrice}
                      onChange={(e) => updateLeg(leg.id, 'slOnPrice', e.target.value)}
                      className="w-full h-12 p-2 text-sm font-medium rounded-lg border-2 border-red-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-gradient-to-r from-red-50 to-pink-50 text-red-700 transition-all duration-200"
                    >
                      <option value="On Price">On Price</option>
                      <option value="On Close">On Close</option>
                    </select>
                  </div>

                  {/* TP Type */}
                  <div className="col-span-1">
                    <select
                      value={leg.tpType}
                      onChange={(e) => updateLeg(leg.id, 'tpType', e.target.value)}
                      className="w-full h-12 p-2 text-sm font-medium rounded-lg border-2 border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 transition-all duration-200"
                    >
                      <option value="TP %">TP %</option>
                      <option value="TP pt">TP pt</option>
                    </select>
                  </div>

                  {/* TP Value */}
                  <div className="col-span-1">
                    <input
                      type="number"
                      value={leg.tpValue}
                      onChange={(e) => updateLeg(leg.id, 'tpValue', parseInt(e.target.value) || 0)}
                      className="w-full h-12 p-2 text-sm border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 transition-all duration-200"
                    />
                  </div>

                  {/* TP On */}
                  <div className="col-span-1">
                    <select
                      value={leg.tpOnPrice}
                      onChange={(e) => updateLeg(leg.id, 'tpOnPrice', e.target.value)}
                      className="w-full h-12 p-2 text-sm font-medium rounded-lg border-2 border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 transition-all duration-200"
                    >
                      <option value="On Price">On Price</option>
                      <option value="On Close">On Close</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="col-span-1 flex space-x-1 h-12 items-center justify-center">
                    <button
                      type="button"
                      onClick={() => deleteLeg(leg.id)}
                      className="p-2 text-red-500 hover:text-red-700 transition-colors hover:bg-red-50 rounded-lg"
                      title="Delete leg"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newLeg = { ...leg, id: Math.max(...orderLegs.map(l => l.id)) + 1 };
                        setOrderLegs(prev => [...prev, newLeg]);
                      }}
                      className="p-2 text-orange-500 hover:text-orange-700 transition-colors hover:bg-orange-50 rounded-lg"
                      title="Duplicate leg"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>

                {/* Advance Feature Section within each Order Leg - Only visible when Wait & Trade, Re Entry/Execute, or Trail SL is enabled globally */}
                {(advanceFeatures.waitAndTrade || advanceFeatures.reEntryExecute || advanceFeatures.trailSL) && (
                  <div className="mt-4 pt-4 border-t border-gray-200 relative">
                    {/* Subtle background pattern for Advance Feature section */}
                    <div className="absolute inset-0 opacity-3">
                      <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M0 20L20 0h20v20H0zM20 40L0 20h20v20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundSize: '15px 15px'
                      }}></div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center space-x-2 mb-3">
                        <ChevronDown size={16} className="text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">Advance Feature</span>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        {/* Wait & Trade Configuration - Only visible when Wait & Trade is enabled */}
                        {advanceFeatures.waitAndTrade && (
                          <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-lg p-2 border border-gray-200 shadow-sm">
                            <Clock size={16} className="text-pink-500" />
                            <select
                              value={leg.waitAndTradeType || '%↑'}
                              onChange={(e) => updateLeg(leg.id, 'waitAndTradeType', e.target.value)}
                              className="px-3 py-2 text-sm border-2 border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 bg-gradient-to-r from-pink-50 to-rose-50 transition-all duration-200"
                            >
                              <option value="%↑">%↑</option>
                              <option value="%↓">%↓</option>
                              <option value="pt↑">pt↑</option>
                              <option value="pt↓">pt↓</option>
                              <option value="Equal">Equal</option>
                            </select>
                            <input
                              type="number"
                              value={leg.waitAndTradeValue || 0}
                              onChange={(e) => updateLeg(leg.id, 'waitAndTradeValue', parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              min="0"
                              max="100"
                              step="0.1"
                              className="w-20 px-3 py-2 text-sm border-2 border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 bg-gradient-to-r from-pink-50 to-rose-50 transition-all duration-200"
                            />
                          </div>
                        )}
                        
                        {/* ReEntry Configuration - Only visible when Re Entry/Execute is enabled */}
                        {advanceFeatures.reEntryExecute && (
                          <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-lg p-2 border border-gray-200 shadow-sm">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-700">ReEntry</span>
                              <select
                                value={leg.reEntryType || 'ReEntry On Cost'}
                                onChange={(e) => updateLeg(leg.id, 'reEntryType', e.target.value)}
                                className="px-3 py-2 text-sm border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 transition-all duration-200"
                              >
                                <option value="ReExecute">ReExecute</option>
                                <option value="ReEntry On Cost">ReEntry On Cost</option>
                                <option value="ReEntry On Close">ReEntry On Close</option>
                              </select>
                            </div>
                            <input
                              type="number"
                              value={leg.reEntryValue || 5}
                              onChange={(e) => updateLeg(leg.id, 'reEntryValue', parseInt(e.target.value) || 0)}
                              placeholder="5"
                              min="0"
                              max="100"
                              step="1"
                              className="w-16 px-3 py-2 text-sm border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 transition-all duration-200"
                            />
                            <select
                              value={leg.reEntryCondition || 'On Close'}
                              onChange={(e) => updateLeg(leg.id, 'reEntryCondition', e.target.value)}
                              className="px-3 py-2 text-sm border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 transition-all duration-200"
                            >
                              <option value="On Close">On Close</option>
                              <option value="On Price">On Price</option>
                            </select>
                          </div>
                        )}

                        {/* Trailing Stop Loss Configuration - Only visible when Trail SL is enabled */}
                        {advanceFeatures.trailSL && (
                          <div className="flex items-center space-x-4 bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-gray-200 shadow-sm">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-700">TSL</span>
                              <select
                                value={leg.tslType || 'TSL %'}
                                onChange={(e) => updateLeg(leg.id, 'tslType', e.target.value)}
                                className="px-3 py-2 text-sm border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50 transition-all duration-200"
                              >
                                <option value="TSL %">TSL %</option>
                                <option value="TSL pt">TSL pt</option>
                              </select>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <label className="text-sm font-medium text-blue-700">If price moves (X)</label>
                              <input
                                type="number"
                                value={leg.tslValue1 || ''}
                                onChange={(e) => updateLeg(leg.id, 'tslValue1', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                                placeholder="Enter any value"
                                className="w-32 h-10 px-3 py-2 text-sm border-2 border-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-600 bg-white transition-all duration-200"
                              />
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <label className="text-sm font-medium text-gray-600">Then Trail SL by (Y)</label>
                              <input
                                type="number"
                                value={leg.tslValue2 || ''}
                                onChange={(e) => updateLeg(leg.id, 'tslValue2', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                                placeholder="Enter any value"
                                className="w-32 h-10 px-3 py-2 text-sm border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-600 bg-white transition-all duration-200"
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Description text */}
                        <div className="text-gray-600 text-sm bg-white/60 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-200">
                          {advanceFeatures.waitAndTrade && (
                            <span>Wait for price to move by <span className="font-semibold text-pink-600">{leg.waitAndTradeValue || 0}</span> {leg.waitAndTradeType || '%↑'}</span>
                          )}
                          {advanceFeatures.reEntryExecute && (
                            <span>ReEntry: <span className="font-semibold text-blue-600">{leg.reEntryType || 'ReEntry On Cost'}</span> with value <span className="font-semibold text-blue-600">{leg.reEntryValue || 5}</span> <span className="text-gray-500">({leg.reEntryCondition || 'On Close'})</span></span>
                          )}
                          {advanceFeatures.trailSL && (
                            <span>Trail SL: <span className="font-semibold text-purple-600">{leg.tslType || 'TSL %'}</span> with values <span className="font-semibold text-purple-600">{leg.tslValue1 || 5}</span> and <span className="font-semibold text-purple-600">{leg.tslValue2 || 6}</span></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        </div>

        {/* Advance Features Section */}
        <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl p-6 border border-blue-500/20">
          <div className="flex items-center space-x-2 mb-4">
            <button
              type="button"
              onClick={() => setShowAdvanceFeatures(!showAdvanceFeatures)}
              className="text-blue-300 hover:text-blue-200 transition-colors"
            >
              {showAdvanceFeatures ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            <h3 className="text-lg font-bold text-white">Advance Features</h3>
            <Info size={16} className="text-blue-300" />
          </div>

          {showAdvanceFeatures && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={advanceFeatures.moveSLToCost}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setAdvanceFeatures(prev => ({
                      ...prev,
                      moveSLToCost: isChecked,
                      // If Move SL to Cost is selected, unselect and disable Pre Punch SL and Wait & Trade
                      prePunchSL: isChecked ? false : prev.prePunchSL,
                      waitAndTrade: isChecked ? false : prev.waitAndTrade
                    }));
                  }}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-white text-sm">Move SL to Cost</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={advanceFeatures.exitAllOnSLTgt}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setAdvanceFeatures(prev => ({
                      ...prev,
                      exitAllOnSLTgt: isChecked,
                      // If Exit All on SL/Tgt is selected, unselect and disable Re Entry/Execute
                      reEntryExecute: isChecked ? false : prev.reEntryExecute
                    }));
                  }}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-white text-sm">Exit All on SL/Tgt</span>
              </label>

              <label className={`flex items-center space-x-2 ${advanceFeatures.moveSLToCost ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  checked={advanceFeatures.prePunchSL}
                  onChange={(e) => setAdvanceFeatures(prev => ({ ...prev, prePunchSL: e.target.checked }))}
                  disabled={advanceFeatures.moveSLToCost}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="text-white text-sm">Pre Punch SL</span>
                <button
                  type="button"
                  onClick={async () => {
                    if (orderLegs.length > 0) {
                      const marketData = await getCurrentMarketData(instrumentSearch.selectedInstrument?.symbol || 'NIFTY');
                      if (marketData) {
                        const result = await executeOrderWithPrePunchSL(orderLegs[0], marketData);
                        console.log('Pre Punch SL Test Result:', result);
                        alert(`Pre Punch SL Test: ${result.message}`);
                      }
                    } else {
                      alert('Please add at least one order leg to test Pre Punch SL');
                    }
                  }}
                  className="ml-2 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  title="Test Pre Punch SL functionality"
                >
                  Test
                </button>
              </label>

              <label className={`flex items-center space-x-2 ${advanceFeatures.moveSLToCost ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  checked={advanceFeatures.waitAndTrade}
                  onChange={(e) => setAdvanceFeatures(prev => ({ ...prev, waitAndTrade: e.target.checked }))}
                  disabled={advanceFeatures.moveSLToCost}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="text-white text-sm">Wait & Trade</span>
              </label>

              <label className={`flex items-center space-x-2 ${advanceFeatures.exitAllOnSLTgt ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  checked={advanceFeatures.reEntryExecute}
                  onChange={(e) => setAdvanceFeatures(prev => ({ ...prev, reEntryExecute: e.target.checked }))}
                  disabled={advanceFeatures.exitAllOnSLTgt}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="text-white text-sm">Re Entry/Execute</span>
                <Info size={12} className="text-blue-300" />
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={advanceFeatures.trailSL}
                  onChange={(e) => setAdvanceFeatures(prev => ({ ...prev, trailSL: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-white text-sm">Trail SL</span>
              </label>
            </div>
          )}
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
                    value={timeIndicatorFormData.daily_profit_limit || ''}
                    onChange={(e) => setTimeIndicatorFormData(prev => ({
                      ...prev,
                      daily_profit_limit: parseFloat(e.target.value) || 0
                    }))}
                    className="w-full p-3 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-400 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-xs text-orange-300 mb-2">Exit When Over All Loss In Amount (INR)</label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={timeIndicatorFormData.daily_loss_limit || ''}
                    onChange={(e) => setTimeIndicatorFormData(prev => ({
                      ...prev,
                      daily_loss_limit: parseFloat(e.target.value) || 0
                    }))}
                    className="w-full p-3 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-400 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs text-orange-300 mb-2">Max Trade Cycle</label>
                  <input
                    type="number"
                    defaultValue="1"
                    value={timeIndicatorFormData.max_trade_cycles || 1}
                    onChange={(e) => setTimeIndicatorFormData(prev => ({
                      ...prev,
                      max_trade_cycles: parseInt(e.target.value) || 1
                    }))}
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
                
                <label className="flex items-center space-x-2 cursor-pointer">
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
                
                <label className="flex items-center space-x-2 cursor-pointer">
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
                
                <label className="flex items-center space-x-2 cursor-pointer">
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

        {/* Strategy Name */}
        <div className="bg-gradient-to-br from-slate-800/80 to-blue-900/80 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30 shadow-xl">
          <label className="block text-white text-sm font-medium mb-2">Strategy Name</label>
          <input
            type="text"
            name="name"
            value={timeIndicatorFormData.name}
            onChange={handleTimeIndicatorChange}
            className="w-full p-3 bg-slate-700/50 border border-blue-500/50 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:outline-none backdrop-blur-sm"
            placeholder="Enter strategy name"
            required
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={!isUnderlyingSelected || !timeIndicatorFormData.name.trim() || !timeIndicatorFormData.time_order_product_type}
            className={`px-8 py-3 font-semibold rounded-lg transition-all duration-300 shadow-lg ${
              isUnderlyingSelected && timeIndicatorFormData.name.trim() && timeIndicatorFormData.time_order_product_type
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                : 'bg-gradient-to-r from-gray-500 to-gray-600 text-gray-300 cursor-not-allowed'
            }`}
          >
            {!isUnderlyingSelected 
              ? 'Select Underlying First' 
              : !timeIndicatorFormData.name.trim() 
                ? 'Enter Strategy Name First' 
                : !timeIndicatorFormData.time_order_product_type
                  ? 'Select Order Type First'
                  : 'Save & Continue'
            }
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
                     placeholder="Search NIFTY 50, BANKNIFTY, SENSEX, RELIANCE, TCS..."
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
           <div className="space-y-3">
             <div className="flex items-center space-x-2">
               <span className="text-white text-sm font-medium">Popular Indices:</span>
             </div>
             <div className="grid grid-cols-4 gap-2">
               {availableInstruments.filter(instrument => instrument.segment === 'INDEX').slice(0, 4).map((instrument, index) => (
                 <button
                   key={index}
                   onClick={() => handleInstrumentSelect(instrument)}
                   className="group p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-200 hover:scale-105"
                 >
                   <div className="text-center">
                     <div className="text-white font-semibold text-xs">{instrument.symbol}</div>
                     <div className="text-blue-200 text-xs mt-1">{instrument.segment}</div>
                   </div>
                 </button>
               ))}
             </div>
             
             <div className="flex items-center space-x-2 mt-4">
               <span className="text-white text-sm font-medium">Popular Stocks:</span>
             </div>
             <div className="grid grid-cols-4 gap-2">
               {availableInstruments.filter(instrument => instrument.segment === 'STOCK').slice(0, 8).map((instrument, index) => (
                 <button
                   key={index}
                   onClick={() => handleInstrumentSelect(instrument)}
                   className="group p-2 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 hover:border-green-400/50 transition-all duration-200 hover:scale-105"
                 >
                   <div className="text-center">
                     <div className="text-white font-semibold text-xs">{instrument.symbol}</div>
                     <div className="text-green-200 text-xs mt-1">{instrument.segment}</div>
                   </div>
                 </button>
               ))}
             </div>
           </div>

          {/* Selected Instrument Display */}
          {isUnderlyingSelected && (
            <div className="mt-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle size={20} className="text-green-400" />
                  <div>
                    <h4 className="text-white font-semibold">Selected Instrument</h4>
                    <div className="text-green-200 text-sm">
                      <div className="font-medium">{instrumentSearch.selectedInstrument?.symbol}</div>
                      <div className="text-xs opacity-75">{instrumentSearch.selectedInstrument?.name}</div>
                      <div className="text-xs opacity-75">
                        {instrumentSearch.selectedInstrument?.segment} • Lot Size: {instrumentSearch.selectedInstrument?.lotSize}
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleInstrumentRemove}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors duration-200"
                  title="Remove selected instrument"
                >
                  <X size={16} className="text-red-400 hover:text-red-300" />
                </button>
              </div>
            </div>
          )}

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
                       value={strikeType}
                       disabled={!isUnderlyingSelected}
                       className={`px-2 py-2 rounded text-sm font-medium border focus:outline-none ${
                         isUnderlyingSelected
                           ? 'bg-blue-100 text-blue-700 border-blue-300 focus:ring-1 focus:ring-blue-400'
                           : 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed opacity-50'
                       }`}
                       onChange={(e) => {
                         if (!isUnderlyingSelected) return;
                         setStrikeType(e.target.value);
                         setCustomPrice(''); // Reset custom price when strike type changes
                       }}
                     >
                       <option value="ATM pt">ATM pt</option>
                       <option value="ATM %">ATM %</option>
                       <option value="SP">SP</option>
                       <option value="SP >=">SP &gt;=</option>
                       <option value="SP <=">SP &lt;=</option>
                     </select>
                     
                     {/* Dynamic strike offset based on strike type */}
                     {strikeType === 'ATM pt' && (
                       <select 
                         className="bg-blue-100 text-blue-700 px-2 py-2 rounded text-sm font-medium border border-blue-300 focus:ring-1 focus:ring-blue-400 focus:outline-none"
                         onChange={(e) => {
                           // Handle ATM pt selection
                         }}
                       >
                         <option value="ITM 1500">ITM 1500</option>
                         <option value="ITM 1400">ITM 1400</option>
                         <option value="ITM 1300">ITM 1300</option>
                         <option value="ITM 1200">ITM 1200</option>
                         <option value="ITM 1100">ITM 1100</option>
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
                         <option value="OTM 1100">OTM 1100</option>
                         <option value="OTM 1200">OTM 1200</option>
                         <option value="OTM 1300">OTM 1300</option>
                         <option value="OTM 1400">OTM 1400</option>
                         <option value="OTM 1500">OTM 1500</option>
                       </select>
                     )}
                     
                     {strikeType === 'ATM %' && (
                       <select 
                         className="bg-blue-100 text-blue-700 px-2 py-2 rounded text-sm font-medium border border-blue-300 focus:ring-1 focus:ring-blue-400 focus:outline-none"
                         onChange={(e) => {
                           // Handle ATM % selection
                         }}
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
                         <option value="ITM 3.0%">ITM 3.0%</option>
                         <option value="ITM 2.0%">ITM 2.0%</option>
                         <option value="ITM 1.0%">ITM 1.0%</option>
                         <option value="ATM">ATM</option>
                         <option value="OTM 1.0%">OTM 1.0%</option>
                         <option value="OTM 2.0%">OTM 2.0%</option>
                         <option value="OTM 3.0%">OTM 3.0%</option>
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
                     )}
                     
                     {(strikeType === 'SP' || strikeType === 'SP >=' || strikeType === 'SP <=') && (
                       <input 
                         type="number" 
                         value={customPrice}
                         placeholder="Enter Premium Value"
                         className="bg-black text-white px-2 py-2 rounded text-sm font-medium border border-gray-600 focus:ring-1 focus:ring-white focus:outline-none"
                         style={{ width: '120px' }}
                         onChange={(e) => setCustomPrice(e.target.value)}
                       />
                     )}
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
        return renderTimeIndicatorForm();
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