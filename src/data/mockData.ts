import { User, Strategy, Backtest, Bill, LiveTrade, MarketData, Notification } from '../types/database';

// Mock admin data
export const mockAdmins = [
  {
    id: 'admin-1',
    email: 'admin@tradesetu.com',
    name: 'System Administrator',
    role: 'SUPER_ADMIN',
    created_at: new Date('2024-01-01'),
    last_login: new Date(),
    permissions: ['USER_MANAGEMENT', 'SYSTEM_SETTINGS', 'BILLING', 'ANALYTICS']
  }
];

// Mock user data
export const mockUser: User = {
  id: '1',
  email: 'john.doe@example.com',
  name: 'John Doe',
  phone: '+91 9876543210',
  created_at: new Date('2024-01-15'),
  updated_at: new Date(),
  is_active: true,
  subscription_plan: 'PREMIUM',
  subscription_expires: new Date('2024-12-31'),
  balance: 250000,
  kyc_status: 'APPROVED',
  pan_card: 'ABCDE1234F',
  address: '123 Trading Street',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400001'
};

// Mock strategies
export const mockStrategies: Strategy[] = [
  {
    id: '1',
    user_id: '1',
    name: 'Momentum Scalping',
    description: 'High-frequency scalping strategy for intraday trading',
    strategy_type: 'SCALPING',
    symbol: 'NIFTY50',
    entry_conditions: 'RSI > 70 and Volume > 1.5x average',
    exit_conditions: 'RSI < 30 or Stop Loss hit',
    risk_management: {
      stop_loss: 0.5,
      take_profit: 1.5,
      position_size: 100
    },
    is_active: true,
    created_at: new Date('2024-01-20'),
    updated_at: new Date(),
    performance_metrics: {
      total_trades: 156,
      winning_trades: 98,
      total_pnl: 45000,
      max_drawdown: 8.5,
      sharpe_ratio: 1.85
    }
  },
  {
    id: '2',
    user_id: '1',
    name: 'Swing Trade Master',
    description: 'Medium-term swing trading strategy',
    strategy_type: 'SWING',
    symbol: 'BANKNIFTY',
    entry_conditions: 'EMA crossover with volume confirmation',
    exit_conditions: 'Target reached or trend reversal',
    risk_management: {
      stop_loss: 2.0,
      take_profit: 6.0,
      position_size: 50
    },
    is_active: true,
    created_at: new Date('2024-02-01'),
    updated_at: new Date(),
    performance_metrics: {
      total_trades: 45,
      winning_trades: 32,
      total_pnl: 78000,
      max_drawdown: 12.3,
      sharpe_ratio: 2.15
    }
  }
];

// Mock market data
export const mockMarketData: MarketData[] = [
  {
    symbol: 'NIFTY50',
    price: 21450.30,
    change: 125.45,
    change_percent: 0.59,
    volume: 1250000,
    high: 21485.60,
    low: 21320.15,
    open: 21380.50,
    timestamp: new Date()
  },
  {
    symbol: 'BANKNIFTY',
    price: 46320.80,
    change: -85.30,
    change_percent: -0.18,
    volume: 890000,
    high: 46450.20,
    low: 46180.45,
    open: 46406.10,
    timestamp: new Date()
  }
];

// Mock live trades
export const mockLiveTrades: LiveTrade[] = [
  {
    id: '1',
    user_id: '1',
    strategy_id: '1',
    symbol: 'NIFTY50',
    side: 'BUY',
    quantity: 100,
    entry_price: 21430.50,
    current_price: 21450.30,
    status: 'OPEN',
    created_at: new Date(),
    updated_at: new Date(),
    pnl: 1980,
    fees: 15.50
  }
];

// Mock bills
export const mockBills: Bill[] = [
  {
    id: '1',
    user_id: '1',
    bill_number: 'TS-2024-001',
    amount: 10999,
    gst_amount: 1979.82,
    total_amount: 12978.82,
    billing_period: 'March 2024',
    due_date: new Date('2024-03-31'),
    status: 'PAID',
    created_at: new Date('2024-03-01'),
    paid_at: new Date('2024-03-15'),
    items: [
      {
        id: '1',
        bill_id: '1',
        description: 'Premium Subscription',
        quantity: 1,
        unit_price: 10999,
        total_price: 10999,
        gst_rate: 18
      }
    ]
  },
  {
    id: '2',
    user_id: '1',
    bill_number: 'TS-2024-002',
    amount: 10999,
    gst_amount: 1979.82,
    total_amount: 12978.82,
    billing_period: 'February 2024',
    due_date: new Date('2024-02-29'),
    status: 'EXPIRED',
    created_at: new Date('2024-02-01'),
    paid_at: undefined,
    items: [
      {
        id: '2',
        bill_id: '2',
        description: 'Premium Subscription',
        quantity: 1,
        unit_price: 10999,
        total_price: 10999,
        gst_rate: 18
      }
    ]
  }
];

// Mock notifications
export const mockNotifications: Notification[] = [
  {
    id: '1',
    user_id: '1',
    type: 'TRADE_ALERT',
    title: 'Trade Executed',
    message: 'Your Momentum Scalping strategy executed a BUY order for NIFTY50',
    is_read: false,
    created_at: new Date()
  },
  {
    id: '2',
    user_id: '1',
    type: 'BILLING',
    title: 'Payment Received',
    message: 'Your payment of ₹3,538.82 has been received successfully',
    is_read: true,
    created_at: new Date('2024-03-15')
  }
];