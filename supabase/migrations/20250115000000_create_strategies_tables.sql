-- Create strategies tables based on form structure
-- This migration creates all necessary tables for the strategies system

-- Main strategies table
CREATE TABLE IF NOT EXISTS strategies (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    strategy_type ENUM('INTRADAY','SWING','SCALPING','POSITIONAL','TIME_BASED','INDICATOR_BASED','PROGRAMMING') NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    asset_type ENUM('STOCK','INDEX','FUTURES','OPTIONS','CURRENCY','COMMODITY') NOT NULL DEFAULT 'STOCK',
    entry_conditions TEXT,
    exit_conditions TEXT,
    risk_management JSON,
    is_active TINYINT(1) DEFAULT 0,
    is_paper_trading TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_executed TIMESTAMP NULL,
    total_executions INT DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    INDEX idx_user_id (user_id),
    INDEX idx_strategy_type (strategy_type),
    INDEX idx_symbol (symbol)
);

-- Time-based strategies table
CREATE TABLE IF NOT EXISTS time_based_strategies (
    id VARCHAR(36) PRIMARY KEY,
    strategy_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(20) NOT NULL,
    
    -- Trigger Configuration
    trigger_type ENUM('specific_time','after_open','before_close','candle_completion') DEFAULT 'specific_time',
    trigger_time TIME DEFAULT '09:20:00',
    trigger_timezone VARCHAR(10) DEFAULT 'IST',
    trigger_recurrence ENUM('daily','weekly','monthly','once') DEFAULT 'daily',
    trigger_weekly_days JSON,
    trigger_monthly_day INT DEFAULT 1,
    trigger_monthly_type ENUM('day_of_month','last_day_of_month') DEFAULT 'day_of_month',
    trigger_after_open_minutes INT DEFAULT 5,
    trigger_before_close_minutes INT DEFAULT 15,
    trigger_candle_interval INT DEFAULT 5,
    trigger_candle_delay_minutes INT DEFAULT 1,
    
    -- Action Configuration
    action_type ENUM('place_order','send_notification','execute_script') DEFAULT 'place_order',
    order_transaction_type ENUM('BUY','SELL','BOTH') DEFAULT 'BUY',
    order_type ENUM('MARKET','LIMIT','STOP_LOSS','STOP_LOSS_MARKET') DEFAULT 'MARKET',
    order_quantity INT DEFAULT 1,
    order_product_type ENUM('MIS','CNC','BTST','NRML') DEFAULT 'MIS',
    order_price DECIMAL(10,2) DEFAULT 0.00,
    
    -- Time Configuration
    working_days JSON,
    start_time TIME DEFAULT '09:15:00',
    square_off_time TIME DEFAULT '15:15:00',
    strategy_start_date DATE NULL,
    strategy_start_time TIME NULL,
    strategy_validity_date DATE NULL,
    deactivate_after_first_trigger TINYINT(1) DEFAULT 0,
    
    -- Risk Management
    stop_loss_type ENUM('SL %','SL Points','SL ATR') DEFAULT 'SL %',
    stop_loss_value DECIMAL(8,2) DEFAULT 2.00,
    take_profit_type ENUM('TP %','TP Points','TP ATR') DEFAULT 'TP %',
    take_profit_value DECIMAL(8,2) DEFAULT 4.00,
    position_size VARCHAR(20) DEFAULT '1',
    
    -- Profit Trailing
    profit_trailing_type ENUM('no_trailing','trailing_stop','trailing_profit','both') DEFAULT 'no_trailing',
    trailing_stop TINYINT(1) DEFAULT 0,
    trailing_stop_percentage DECIMAL(5,2) DEFAULT 0.00,
    trailing_profit TINYINT(1) DEFAULT 0,
    trailing_profit_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    -- Limits
    daily_loss_limit DECIMAL(15,2) DEFAULT 0.00,
    daily_profit_limit DECIMAL(15,2) DEFAULT 0.00,
    max_trade_cycles INT DEFAULT 0,
    no_trade_after TIME NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (strategy_id) REFERENCES strategies(id) ON DELETE CASCADE,
    INDEX idx_strategy_id (strategy_id),
    INDEX idx_user_id (user_id)
);

-- Indicator-based strategies table
CREATE TABLE IF NOT EXISTS indicator_based_strategies (
    id VARCHAR(36) PRIMARY KEY,
    strategy_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(20) NOT NULL,
    
    -- Chart Configuration
    chart_type ENUM('Candle','Line','Bar','Area') DEFAULT 'Candle',
    time_interval ENUM('1 Min','3 Min','5 Min','10 Min','15 Min','30 Min','1 H','4 H','1 D') DEFAULT '5 Min',
    transaction_type ENUM('Both Side','Only Long','Only Short') DEFAULT 'Both Side',
    
    -- Entry Conditions
    long_conditions JSON,
    short_conditions JSON,
    condition_blocks INT DEFAULT 1,
    logical_operator ENUM('AND','OR') DEFAULT 'AND',
    selected_indicators JSON,
    
    -- Risk Management
    stop_loss_type ENUM('SL %','SL Points','SL ATR') DEFAULT 'SL %',
    stop_loss_value DECIMAL(8,2) DEFAULT 2.00,
    take_profit_type ENUM('TP %','TP Points','TP ATR') DEFAULT 'TP %',
    take_profit_value DECIMAL(8,2) DEFAULT 4.00,
    position_size VARCHAR(20) DEFAULT '1',
    
    -- Profit Trailing
    profit_trailing_type ENUM('no_trailing','trailing_stop','trailing_profit','both') DEFAULT 'no_trailing',
    trailing_stop TINYINT(1) DEFAULT 0,
    trailing_stop_percentage DECIMAL(5,2) DEFAULT 0.00,
    trailing_profit TINYINT(1) DEFAULT 0,
    trailing_profit_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    -- Limits
    daily_loss_limit DECIMAL(15,2) DEFAULT 0.00,
    daily_profit_limit DECIMAL(15,2) DEFAULT 0.00,
    max_trade_cycles INT DEFAULT 0,
    no_trade_after TIME NULL,
    
    -- Time Configuration
    working_days JSON,
    start_time TIME DEFAULT '09:15:00',
    square_off_time TIME DEFAULT '15:15:00',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (strategy_id) REFERENCES strategies(id) ON DELETE CASCADE,
    INDEX idx_strategy_id (strategy_id),
    INDEX idx_user_id (user_id)
);

-- Programming strategies table
CREATE TABLE IF NOT EXISTS programming_strategies (
    id VARCHAR(36) PRIMARY KEY,
    strategy_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(20) NOT NULL,
    
    -- Programming Configuration
    programming_language ENUM('PYTHON','JAVASCRIPT','TYPESCRIPT','R','MATLAB') DEFAULT 'PYTHON',
    code TEXT NOT NULL,
    code_version VARCHAR(20) DEFAULT '1.0.0',
    execution_frequency ENUM('real_time','minute','hourly','daily') DEFAULT 'real_time',
    max_execution_time INT DEFAULT 30,
    dependencies JSON,
    environment_variables JSON,
    
    -- Risk Management
    stop_loss_type ENUM('SL %','SL Points','SL ATR') DEFAULT 'SL %',
    stop_loss_value DECIMAL(8,2) DEFAULT 2.00,
    take_profit_type ENUM('TP %','TP Points','TP ATR') DEFAULT 'TP %',
    take_profit_value DECIMAL(8,2) DEFAULT 4.00,
    position_size VARCHAR(20) DEFAULT '1',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (strategy_id) REFERENCES strategies(id) ON DELETE CASCADE,
    INDEX idx_strategy_id (strategy_id),
    INDEX idx_user_id (user_id)
);

-- Strategy performance table
CREATE TABLE IF NOT EXISTS strategy_performance (
    id VARCHAR(36) PRIMARY KEY,
    strategy_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(20) NOT NULL,
    
    -- Performance Metrics
    total_trades INT DEFAULT 0,
    winning_trades INT DEFAULT 0,
    losing_trades INT DEFAULT 0,
    total_pnl DECIMAL(15,2) DEFAULT 0.00,
    max_drawdown DECIMAL(5,2) DEFAULT 0.00,
    sharpe_ratio DECIMAL(8,4) DEFAULT 0.0000,
    win_rate DECIMAL(5,2) DEFAULT 0.00,
    avg_win DECIMAL(15,2) DEFAULT 0.00,
    avg_loss DECIMAL(15,2) DEFAULT 0.00,
    profit_factor DECIMAL(8,4) DEFAULT 0.0000,
    max_consecutive_losses INT DEFAULT 0,
    
    -- Runtime Metrics
    total_runtime_hours DECIMAL(10,2) DEFAULT 0.00,
    avg_trade_duration_minutes DECIMAL(8,2) DEFAULT 0.00,
    max_position_size DECIMAL(15,2) DEFAULT 0.00,
    max_daily_loss DECIMAL(15,2) DEFAULT 0.00,
    max_daily_profit DECIMAL(15,2) DEFAULT 0.00,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (strategy_id) REFERENCES strategies(id) ON DELETE CASCADE,
    INDEX idx_strategy_id (strategy_id),
    INDEX idx_user_id (user_id)
);

-- Backtests table
CREATE TABLE IF NOT EXISTS backtests (
    id VARCHAR(36) PRIMARY KEY,
    strategy_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    initial_capital DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    final_value DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    total_trades INT DEFAULT 0,
    winning_trades INT DEFAULT 0,
    losing_trades INT DEFAULT 0,
    total_pnl DECIMAL(15,2) DEFAULT 0.00,
    max_drawdown DECIMAL(5,2) DEFAULT 0.00,
    sharpe_ratio DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (strategy_id) REFERENCES strategies(id) ON DELETE CASCADE,
    INDEX idx_strategy_id (strategy_id),
    INDEX idx_user_id (user_id),
    INDEX idx_start_date (start_date),
    INDEX idx_end_date (end_date)
);

-- Backtest trades table
CREATE TABLE IF NOT EXISTS backtest_trades (
    id VARCHAR(36) PRIMARY KEY,
    backtest_id VARCHAR(36) NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    side ENUM('BUY','SELL') NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    entry_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    exit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    entry_time TIMESTAMP NOT NULL,
    exit_time TIMESTAMP NOT NULL,
    pnl DECIMAL(15,2) DEFAULT 0.00,
    fees DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (backtest_id) REFERENCES backtests(id) ON DELETE CASCADE,
    INDEX idx_backtest_id (backtest_id),
    INDEX idx_symbol (symbol),
    INDEX idx_entry_time (entry_time),
    INDEX idx_exit_time (exit_time),
    INDEX idx_side (side)
);

-- Create indexes for better performance
CREATE INDEX idx_strategies_user_type ON strategies(user_id, strategy_type);
CREATE INDEX idx_strategies_active ON strategies(is_active);
CREATE INDEX idx_time_based_trigger ON time_based_strategies(trigger_type, trigger_time);
CREATE INDEX idx_indicator_based_interval ON indicator_based_strategies(time_interval);
CREATE INDEX idx_programming_language ON programming_strategies(programming_language);
CREATE INDEX idx_performance_win_rate ON strategy_performance(win_rate);
CREATE INDEX idx_backtests_strategy_date ON backtests(strategy_id, start_date, end_date);
CREATE INDEX idx_backtest_trades_pnl ON backtest_trades(pnl);

-- Insert sample data for testing (optional)
-- Uncomment the following lines if you want to insert sample data

/*
INSERT INTO strategies (id, user_id, name, description, strategy_type, symbol, asset_type, entry_conditions, exit_conditions, risk_management, is_active, is_paper_trading) VALUES
('strat_001', 'user001', 'Sample Time Strategy', 'A sample time-based strategy', 'TIME_BASED', 'NIFTY 50', 'INDEX', 'Time-based entry at 09:20 AM', 'Time-based exit at 15:15 PM', '{"stop_loss": "2%", "take_profit": "4%", "position_size": "1 lot"}', 1, 1),
('strat_002', 'user001', 'Sample Indicator Strategy', 'A sample indicator-based strategy', 'INDICATOR_BASED', 'BANKNIFTY', 'INDEX', 'RSI > 70 for short entry', 'Stop loss or take profit', '{"stop_loss": "2%", "take_profit": "4%", "position_size": "1 lot"}', 1, 1);

INSERT INTO time_based_strategies (id, strategy_id, user_id, trigger_type, trigger_time, trigger_recurrence, working_days, start_time, square_off_time, stop_loss_value, take_profit_value, position_size) VALUES
('time_001', 'strat_001', 'user001', 'specific_time', '09:20:00', 'daily', '["monday","tuesday","wednesday","thursday","friday"]', '09:15:00', '15:15:00', 2.00, 4.00, '1');

INSERT INTO indicator_based_strategies (id, strategy_id, user_id, chart_type, time_interval, transaction_type, long_conditions, short_conditions, selected_indicators, stop_loss_value, take_profit_value, position_size) VALUES
('ind_001', 'strat_002', 'user001', 'Candle', '5 Min', 'Both Side', '[]', '[]', '{}', 2.00, 4.00, '1');

INSERT INTO strategy_performance (id, strategy_id, user_id, total_trades, winning_trades, losing_trades, total_pnl, win_rate) VALUES
('perf_001', 'strat_001', 'user001', 0, 0, 0, 0.00, 0.00),
('perf_002', 'strat_002', 'user001', 0, 0, 0, 0.00, 0.00);
*/
