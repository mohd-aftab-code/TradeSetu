-- Complete Indicator Based Strategy Tables
-- This migration creates comprehensive tables for storing all indicator-based strategy data

-- Main indicator-based strategy table
CREATE TABLE IF NOT EXISTS indicator_based_strategies_complete (
    id VARCHAR(36) PRIMARY KEY,
    strategy_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(20) NOT NULL,
    
    -- Basic Strategy Info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Selected Instrument Details
    selected_instrument_symbol VARCHAR(50),
    selected_instrument_name VARCHAR(255),
    selected_instrument_segment VARCHAR(50),
    selected_instrument_lot_size INT,
    
    -- Trading Configuration
    order_type ENUM('MIS', 'CNC', 'BTST') DEFAULT 'MIS',
    start_time TIME DEFAULT '09:15:00',
    square_off_time TIME DEFAULT '15:15:00',
    working_days JSON,
    
    -- Chart and Analysis Configuration
    chart_type ENUM('Candle', 'Line', 'Bar', 'Area') DEFAULT 'Candle',
    time_interval ENUM('1 Min', '3 Min', '5 Min', '10 Min', '15 Min', '30 Min', '1 H', '4 H', '1 D') DEFAULT '5 Min',
    transaction_type ENUM('Both Side', 'Only Long', 'Only Short') DEFAULT 'Both Side',
    
    -- Condition Configuration
    condition_blocks INT DEFAULT 1,
    logical_operator ENUM('AND', 'OR') DEFAULT 'AND',
    
    -- Long Conditions (JSON for complex conditions)
    long_conditions JSON,
    long_comparator VARCHAR(50),
    
    -- Short Conditions (JSON for complex conditions)
    short_conditions JSON,
    short_comparator VARCHAR(50),
    
    -- Selected Indicators
    selected_indicators JSON,
    
    -- Strike Configuration
    strike_type ENUM('ATM pt', 'ATM %', 'SP', 'SP >=', 'SP <=') DEFAULT 'ATM pt',
    strike_value VARCHAR(100),
    custom_price DECIMAL(10,2),
    
    -- Trading Parameters
    action_type ENUM('BUY', 'SELL') DEFAULT 'BUY',
    quantity INT DEFAULT 1,
    expiry_type ENUM('WEEKLY', 'MONTHLY') DEFAULT 'WEEKLY',
    
    -- Stop Loss Configuration
    sl_type ENUM('SL %', 'SL pt') DEFAULT 'SL pt',
    sl_value DECIMAL(8,2),
    sl_on_price ENUM('On Price', 'On Close') DEFAULT 'On Price',
    
    -- Take Profit Configuration
    tp_type ENUM('TP %', 'TP pt') DEFAULT 'TP pt',
    tp_value DECIMAL(8,2),
    tp_on_price ENUM('On Price', 'On Close') DEFAULT 'On Price',
    
    -- Risk Management
    daily_profit_limit DECIMAL(15,2) DEFAULT 0.00,
    daily_loss_limit DECIMAL(15,2) DEFAULT 0.00,
    max_trade_cycles INT DEFAULT 1,
    no_trade_after TIME,
    
    -- Profit Trailing
    profit_trailing_type ENUM('no_trailing', 'lock_fix_profit', 'trail_profit', 'lock_and_trail') DEFAULT 'no_trailing',
    profit_trailing_config JSON,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (strategy_id) REFERENCES strategies(id) ON DELETE CASCADE,
    INDEX idx_strategy_id (strategy_id),
    INDEX idx_user_id (user_id)
);

-- Individual condition blocks table for complex conditions
CREATE TABLE IF NOT EXISTS indicator_condition_blocks (
    id VARCHAR(36) PRIMARY KEY,
    indicator_strategy_id VARCHAR(36) NOT NULL,
    block_order INT NOT NULL,
    
    -- Long Condition Details
    long_indicator1 VARCHAR(100),
    long_indicator1_params JSON,
    long_comparator VARCHAR(50),
    long_indicator2 VARCHAR(100),
    long_indicator2_params JSON,
    
    -- Short Condition Details
    short_indicator1 VARCHAR(100),
    short_indicator1_params JSON,
    short_comparator VARCHAR(50),
    short_indicator2 VARCHAR(100),
    short_indicator2_params JSON,
    
    -- Logical Operator for this block
    logical_operator ENUM('AND', 'OR'),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (indicator_strategy_id) REFERENCES indicator_based_strategies_complete(id) ON DELETE CASCADE,
    INDEX idx_indicator_strategy_id (indicator_strategy_id)
);

-- Indicator parameters table for storing specific indicator configurations
CREATE TABLE IF NOT EXISTS indicator_parameters (
    id VARCHAR(36) PRIMARY KEY,
    condition_block_id VARCHAR(36) NOT NULL,
    indicator_name VARCHAR(100) NOT NULL,
    indicator_type ENUM('long1', 'long2', 'short1', 'short2') NOT NULL,
    
    -- Common parameters
    period INT,
    multiplier DECIMAL(8,2),
    smoothing_factor DECIMAL(8,2),
    
    -- Moving Average specific
    ma_type ENUM('SMA', 'EMA', 'WMA', 'TEMA') DEFAULT 'SMA',
    
    -- RSI specific
    overbought_level DECIMAL(5,2) DEFAULT 70.00,
    oversold_level DECIMAL(5,2) DEFAULT 30.00,
    
    -- MACD specific
    fast_period INT DEFAULT 12,
    slow_period INT DEFAULT 26,
    signal_period INT DEFAULT 9,
    
    -- Bollinger Bands specific
    std_deviation DECIMAL(5,2) DEFAULT 2.00,
    
    -- Stochastic specific
    k_period INT DEFAULT 14,
    d_period INT DEFAULT 3,
    smooth_k INT DEFAULT 3,
    
    -- Custom parameters (JSON for flexibility)
    custom_params JSON,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (condition_block_id) REFERENCES indicator_condition_blocks(id) ON DELETE CASCADE,
    INDEX idx_condition_block_id (condition_block_id),
    INDEX idx_indicator_type (indicator_type)
);

-- Strike configuration details
CREATE TABLE IF NOT EXISTS indicator_strike_config (
    id VARCHAR(36) PRIMARY KEY,
    indicator_strategy_id VARCHAR(36) NOT NULL,
    
    -- Strike Type and Value
    strike_type ENUM('ATM pt', 'ATM %', 'SP', 'SP >=', 'SP <=') NOT NULL,
    strike_value VARCHAR(100),
    custom_price DECIMAL(10,2),
    
    -- ATM Point specific values
    atm_offset_points INT,
    atm_offset_percentage DECIMAL(5,2),
    
    -- SP specific values
    sp_operator ENUM('>=', '<=', '=') DEFAULT '=',
    sp_value DECIMAL(10,2),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (indicator_strategy_id) REFERENCES indicator_based_strategies_complete(id) ON DELETE CASCADE,
    INDEX idx_indicator_strategy_id (indicator_strategy_id)
);

-- Risk management configuration
CREATE TABLE IF NOT EXISTS indicator_risk_management (
    id VARCHAR(36) PRIMARY KEY,
    indicator_strategy_id VARCHAR(36) NOT NULL,
    
    -- Daily Limits
    daily_profit_limit DECIMAL(15,2) DEFAULT 0.00,
    daily_loss_limit DECIMAL(15,2) DEFAULT 0.00,
    
    -- Trade Limits
    max_trade_cycles INT DEFAULT 1,
    max_position_size DECIMAL(15,2),
    
    -- Time Limits
    no_trade_after TIME,
    trading_start_time TIME DEFAULT '09:15:00',
    trading_end_time TIME DEFAULT '15:15:00',
    
    -- Stop Loss Configuration
    stop_loss_type ENUM('SL %', 'SL pt', 'SL ATR') DEFAULT 'SL pt',
    stop_loss_value DECIMAL(8,2),
    stop_loss_on_price ENUM('On Price', 'On Close') DEFAULT 'On Price',
    
    -- Take Profit Configuration
    take_profit_type ENUM('TP %', 'TP pt', 'TP ATR') DEFAULT 'TP pt',
    take_profit_value DECIMAL(8,2),
    take_profit_on_price ENUM('On Price', 'On Close') DEFAULT 'On Price',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (indicator_strategy_id) REFERENCES indicator_based_strategies_complete(id) ON DELETE CASCADE,
    INDEX idx_indicator_strategy_id (indicator_strategy_id)
);

-- Profit trailing configuration
CREATE TABLE IF NOT EXISTS indicator_profit_trailing (
    id VARCHAR(36) PRIMARY KEY,
    indicator_strategy_id VARCHAR(36) NOT NULL,
    
    -- Trailing Type
    trailing_type ENUM('no_trailing', 'lock_fix_profit', 'trail_profit', 'lock_and_trail') DEFAULT 'no_trailing',
    
    -- Lock Fix Profit Configuration
    lock_fix_profit_reach DECIMAL(15,2),
    lock_fix_profit_at DECIMAL(15,2),
    
    -- Trail Profit Configuration
    trail_profit_increase DECIMAL(15,2),
    trail_profit_by DECIMAL(15,2),
    
    -- Lock and Trail Configuration
    lock_and_trail_reach DECIMAL(15,2),
    lock_and_trail_at DECIMAL(15,2),
    lock_and_trail_increase DECIMAL(15,2),
    lock_and_trail_by DECIMAL(15,2),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (indicator_strategy_id) REFERENCES indicator_based_strategies_complete(id) ON DELETE CASCADE,
    INDEX idx_indicator_strategy_id (indicator_strategy_id)
);

-- Form state preservation
CREATE TABLE IF NOT EXISTS indicator_form_states (
    id VARCHAR(36) PRIMARY KEY,
    indicator_strategy_id VARCHAR(36) NOT NULL,
    
    -- Form Data
    indicator_form_data JSON,
    instrument_search_state JSON,
    condition_blocks_state JSON,
    selected_indicators_state JSON,
    strike_config_state JSON,
    risk_management_state JSON,
    profit_trailing_state JSON,
    
    -- UI State
    is_underlying_selected BOOLEAN DEFAULT FALSE,
    show_advanced_options BOOLEAN DEFAULT FALSE,
    current_condition_block INT DEFAULT 1,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (indicator_strategy_id) REFERENCES indicator_based_strategies_complete(id) ON DELETE CASCADE,
    INDEX idx_indicator_strategy_id (indicator_strategy_id)
);

-- Available indicators reference table
CREATE TABLE IF NOT EXISTS available_indicators (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(150) NOT NULL,
    category ENUM('Trend', 'Momentum', 'Volatility', 'Volume', 'Custom') NOT NULL,
    description TEXT,
    
    -- Parameter definitions
    required_params JSON,
    optional_params JSON,
    default_params JSON,
    
    -- UI Configuration
    icon VARCHAR(50),
    color VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_is_active (is_active)
);

-- Insert default indicators
INSERT INTO available_indicators (id, name, display_name, category, description, required_params, optional_params, default_params, icon, color) VALUES
('ind_001', 'SMA', 'Simple Moving Average', 'Trend', 'Calculates the average price over a specified period', '["period"]', '["source"]', '{"period": 20, "source": "close"}', 'trending-up', 'blue'),
('ind_002', 'EMA', 'Exponential Moving Average', 'Trend', 'Gives more weight to recent prices', '["period"]', '["source"]', '{"period": 20, "source": "close"}', 'trending-up', 'green'),
('ind_003', 'RSI', 'Relative Strength Index', 'Momentum', 'Measures the speed and change of price movements', '["period"]', '["overbought", "oversold"]', '{"period": 14, "overbought": 70, "oversold": 30}', 'activity', 'purple'),
('ind_004', 'MACD', 'Moving Average Convergence Divergence', 'Trend', 'Shows the relationship between two moving averages', '["fast_period", "slow_period", "signal_period"]', '["source"]', '{"fast_period": 12, "slow_period": 26, "signal_period": 9, "source": "close"}', 'bar-chart', 'orange'),
('ind_005', 'BB', 'Bollinger Bands', 'Volatility', 'Shows price volatility with upper and lower bands', '["period", "std_deviation"]', '["source"]', '{"period": 20, "std_deviation": 2, "source": "close"}', 'layers', 'red'),
('ind_006', 'STOCH', 'Stochastic Oscillator', 'Momentum', 'Compares closing price to price range over a period', '["k_period", "d_period"]', '["smooth_k"]', '{"k_period": 14, "d_period": 3, "smooth_k": 3}', 'zap', 'yellow'),
('ind_007', 'WMA', 'Weighted Moving Average', 'Trend', 'Gives more weight to recent data points', '["period"]', '["source"]', '{"period": 20, "source": "close"}', 'trending-up', 'cyan'),
('ind_008', 'TEMA', 'Triple Exponential Moving Average', 'Trend', 'Reduces lag compared to regular EMA', '["period"]', '["source"]', '{"period": 20, "source": "close"}', 'trending-up', 'indigo');
