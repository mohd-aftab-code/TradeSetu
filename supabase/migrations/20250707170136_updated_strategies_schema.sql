-- Updated Strategies Schema for Time-Based and Indicator-Based Strategies
-- Migration: 20250707170136_updated_strategies_schema.sql

-- Drop existing tables if they exist
DROP TABLE IF EXISTS strategy_performance CASCADE;
DROP TABLE IF EXISTS strategies CASCADE;

-- Create updated strategies table
CREATE TABLE strategies (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    strategy_type ENUM('INTRADAY', 'SWING', 'SCALPING', 'POSITIONAL', 'TIME_BASED', 'INDICATOR_BASED', 'PROGRAMMING') NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    asset_type ENUM('STOCK', 'INDEX', 'OPTION') DEFAULT 'STOCK',
    entry_conditions TEXT,
    exit_conditions TEXT,
    risk_management JSON,
    is_active TINYINT(1) DEFAULT 1,
    is_paper_trading TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_executed TIMESTAMP NULL,
    total_executions INT DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- Strategy specific data (JSON fields for flexibility)
    strategy_data JSON,
    
    -- Time-based strategy specific fields
    trigger_type VARCHAR(50) NULL, -- 'specific_time', 'after_market_open', 'before_market_close', 'candle_based'
    trigger_time TIME NULL,
    trigger_timezone VARCHAR(10) DEFAULT 'IST',
    trigger_recurrence VARCHAR(20) DEFAULT 'daily', -- 'once', 'daily', 'weekly', 'monthly'
    trigger_weekly_days JSON NULL, -- ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    trigger_monthly_day INT NULL,
    trigger_monthly_type VARCHAR(20) NULL, -- 'day_of_month', 'first_monday', 'last_friday'
    trigger_after_open_minutes INT NULL,
    trigger_before_close_minutes INT NULL,
    trigger_candle_interval INT NULL,
    trigger_candle_delay_minutes INT NULL,
    
    -- Action fields
    action_type VARCHAR(20) DEFAULT 'place_order', -- 'place_order', 'modify_order', 'cancel_order', 'send_notification', 'run_strategy'
    order_transaction_type VARCHAR(10) NULL, -- 'BUY', 'SELL'
    order_type VARCHAR(20) DEFAULT 'MARKET', -- 'MARKET', 'LIMIT', 'SL', 'SL-M'
    order_quantity INT DEFAULT 1,
    order_product_type VARCHAR(10) DEFAULT 'MIS', -- 'MIS', 'CNC', 'NRML'
    order_price DECIMAL(10,2) NULL,
    
    -- Conditions
    enable_conditions TINYINT(1) DEFAULT 0,
    conditions JSON NULL,
    
    -- Strategy validity
    strategy_validity_date DATE NULL,
    deactivate_after_first_trigger TINYINT(1) DEFAULT 0,
    
    -- Trading configuration
    start_time TIME DEFAULT '09:15',
    square_off_time TIME DEFAULT '15:15',
    working_days JSON DEFAULT '{"monday": true, "tuesday": true, "wednesday": true, "thursday": true, "friday": true, "saturday": false, "sunday": false}',
    transaction_type VARCHAR(20) DEFAULT 'Both Side', -- 'Both Side', 'Only Long', 'Only Short'
    chart_type VARCHAR(20) DEFAULT 'Candle',
    interval VARCHAR(20) DEFAULT '5 Min',
    
    -- Risk management specific fields
    daily_loss_limit DECIMAL(15,2) DEFAULT 5000.00,
    daily_profit_limit DECIMAL(15,2) DEFAULT 10000.00,
    max_trade_cycles INT DEFAULT 3,
    no_trade_after TIME DEFAULT '15:15',
    
    -- Profit trailing
    profit_trailing_type VARCHAR(20) DEFAULT 'no_trailing', -- 'no_trailing', 'lock_fix_profit', 'trail_profit', 'lock_and_trail'
    trailing_stop TINYINT(1) DEFAULT 0,
    trailing_stop_percentage DECIMAL(5,2) DEFAULT 1.50,
    trailing_profit TINYINT(1) DEFAULT 0,
    trailing_profit_percentage DECIMAL(5,2) DEFAULT 2.00,
    
    -- Advance features
    advance_features JSON DEFAULT '{"moveSLToCost": false, "exitAllOnSLTgt": false, "prePunchSL": true, "waitAndTrade": false, "reEntryExecute": false, "trailSL": false, "premiumDifference": false}',
    
    -- Order legs for complex strategies
    order_legs JSON NULL,
    
    -- Entry conditions for indicator-based strategies
    entry_conditions_data JSON NULL, -- For storing indicator-based entry conditions
    
    -- Programming strategy specific
    programming_language VARCHAR(20) NULL, -- 'PYTHON', 'JAVASCRIPT'
    strategy_code TEXT NULL,
    
    -- Performance metrics
    performance_metrics JSON DEFAULT '{"total_trades": 0, "winning_trades": 0, "total_pnl": 0, "max_drawdown": 0, "sharpe_ratio": 0}'
);

-- Create updated strategy_performance table
CREATE TABLE strategy_performance (
    id VARCHAR(36) PRIMARY KEY,
    strategy_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(20) NOT NULL,
    total_trades INT DEFAULT 0,
    winning_trades INT DEFAULT 0,
    losing_trades INT DEFAULT 0,
    total_pnl DECIMAL(15,2) DEFAULT 0.00,
    max_drawdown DECIMAL(10,2) DEFAULT 0.00,
    sharpe_ratio DECIMAL(10,4) DEFAULT 0.0000,
    win_rate DECIMAL(5,2) DEFAULT 0.00,
    avg_win DECIMAL(10,2) DEFAULT 0.00,
    avg_loss DECIMAL(10,2) DEFAULT 0.00,
    profit_factor DECIMAL(10,4) DEFAULT 0.0000,
    max_consecutive_losses INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (strategy_id) REFERENCES strategies(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_strategies_user_id ON strategies(user_id);
CREATE INDEX idx_strategies_strategy_type ON strategies(strategy_type);
CREATE INDEX idx_strategies_symbol ON strategies(symbol);
CREATE INDEX idx_strategies_is_active ON strategies(is_active);
CREATE INDEX idx_strategies_created_at ON strategies(created_at);

CREATE INDEX idx_strategy_performance_strategy_id ON strategy_performance(strategy_id);
CREATE INDEX idx_strategy_performance_user_id ON strategy_performance(user_id);

-- No sample data - only real user data will be stored
