// Database Schema Types for TradeSetu Platform

export interface User {
  id: string; // Now in format: tradesetu001, tradesetu002, etc.
  email: string;
  name: string;
  phone: string;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
  subscription_plan: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  subscription_expires: Date;
  balance: number;
  kyc_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  pan_card: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  role: 'USER' | 'SALES_EXECUTIVE' | 'ADMIN';
}

export interface Strategy {
  id: string;
  user_id: string;
  name: string;
  description: string;
  strategy_type: 'INTRADAY' | 'SWING' | 'SCALPING' | 'POSITIONAL' | 'TIME_BASED' | 'INDICATOR_BASED' | 'PROGRAMMING';
  symbol: string;
  asset_type?: 'STOCK' | 'INDEX' | 'FUTURES' | 'OPTIONS' | 'CURRENCY' | 'COMMODITY';
  entry_conditions: string;
  exit_conditions: string;
  risk_management: {
    stop_loss: string | number;
    take_profit: string | number;
    position_size: string | number;
  };
  is_active: boolean;
  is_paper_trading: boolean;
  created_at: Date;
  updated_at: Date;
  last_executed?: Date;
  total_executions?: number;
  success_rate?: number;
  performance_metrics?: {
    total_trades: number;
    winning_trades: number;
    total_pnl: number;
    max_drawdown: number;
    sharpe_ratio: number;
  };
  // Additional fields from database
  details?: any; // Strategy-specific details
  performance?: {
    id: string;
    strategy_id: string;
    user_id: string;
    total_trades: number;
    winning_trades: number;
    losing_trades: number;
    total_pnl: number;
    max_drawdown: number;
    sharpe_ratio: number;
    win_rate: number;
    avg_win: number;
    avg_loss: number;
    profit_factor: number;
    max_consecutive_losses: number;
    total_runtime_hours: number;
    avg_trade_duration_minutes: number;
    max_position_size: number;
    max_daily_loss: number;
    max_daily_profit: number;
    created_at: Date;
    updated_at: Date;
  };
  total_trades?: number;
  winning_trades?: number;
  total_pnl?: number;
  win_rate?: number;
  max_drawdown?: number;
}

export interface BacktestTrade {
  id: string;
  backtest_id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  entry_price: number;
  exit_price: number;
  entry_time: Date;
  exit_time: Date;
  pnl: number;
  fees: number;
  created_at: Date;
}

export interface Backtest {
  id: string;
  strategy_id: string;
  user_id: string;
  start_date: Date;
  end_date: Date;
  initial_capital: number;
  final_value: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  total_pnl: number;
  max_drawdown: number;
  sharpe_ratio: number;
  created_at: Date;
  trade_logs: BacktestTrade[];
}

export interface TradeLog {
  id: string;
  backtest_id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  entry_price: number;
  exit_price: number;
  entry_time: Date;
  exit_time: Date;
  pnl: number;
  fees: number;
}

export interface Bill {
  id: string;
  user_id: string;
  bill_number: string;
  amount: number;
  gst_amount: number;
  total_amount: number;
  billing_period: string;
  due_date: Date;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'EXPIRED';
  created_at: Date;
  paid_at?: Date;
  items: BillItem[];
}

export interface BillItem {
  id: string;
  bill_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  gst_rate: number;
}

export interface LiveTrade {
  id: string;
  user_id: string;
  strategy_id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  entry_price: number;
  current_price: number;
  status: 'OPEN' | 'CLOSED' | 'CANCELLED';
  created_at: Date;
  updated_at: Date;
  pnl: number;
  fees: number;
}

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  timestamp: Date;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'TRADE_ALERT' | 'BILLING' | 'SYSTEM' | 'STRATEGY';
  title: string;
  message: string;
  is_read: boolean;
  created_at: Date;
}