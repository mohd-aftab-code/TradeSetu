// Database Schema Types for TradeSetu Platform

export interface User {
  id: string;
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
}

export interface Strategy {
  id: string;
  user_id: string;
  name: string;
  description: string;
  strategy_type: 'INTRADAY' | 'SWING' | 'SCALPING' | 'POSITIONAL';
  symbol: string;
  entry_conditions: string;
  exit_conditions: string;
  risk_management: {
    stop_loss: number;
    take_profit: number;
    position_size: number;
  };
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  performance_metrics: {
    total_trades: number;
    winning_trades: number;
    total_pnl: number;
    max_drawdown: number;
    sharpe_ratio: number;
  };
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
  trade_logs: TradeLog[];
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