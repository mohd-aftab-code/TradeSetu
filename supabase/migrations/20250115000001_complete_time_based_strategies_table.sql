-- Complete Time Based Strategies Table with ALL form fields
-- This table captures every single field from the TimeBasedStrategy.tsx form

CREATE TABLE IF NOT EXISTS time_based_strategies_complete (
    -- Primary Key
    id VARCHAR(36) PRIMARY KEY,
    strategy_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(20) NOT NULL,
    
    -- Basic Strategy Information
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Selected Instrument Information
    selected_instrument_symbol VARCHAR(50),
    selected_instrument_name VARCHAR(255),
    selected_instrument_segment VARCHAR(50),
    selected_instrument_lot_size INT,
    
    -- Order Configuration
    order_product_type ENUM('MIS','CNC','BTST') NOT NULL,
    start_time TIME NOT NULL,
    square_off_time TIME NOT NULL,
    working_days JSON NOT NULL, -- {"monday": true, "tuesday": true, ...}
    
    -- Order Legs (stored as JSON array)
    order_legs JSON NOT NULL, -- Array of order leg objects
    
    -- Advance Features Configuration
    advance_features JSON NOT NULL, -- All advance feature settings
    
    -- Risk Management
    daily_profit_limit DECIMAL(15,2) DEFAULT 0.00,
    daily_loss_limit DECIMAL(15,2) DEFAULT 0.00,
    max_trade_cycles INT DEFAULT 1,
    no_trade_after TIME,
    
    -- Profit Trailing Configuration
    profit_trailing_type ENUM('no_trailing','lock_fix_profit','trail_profit','lock_and_trail') DEFAULT 'no_trailing',
    profit_trailing_config JSON, -- Store specific trailing configuration based on type
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (strategy_id) REFERENCES strategies(id) ON DELETE CASCADE,
    INDEX idx_strategy_id (strategy_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- Create Order Legs Table for detailed leg storage
CREATE TABLE IF NOT EXISTS time_based_order_legs (
    id VARCHAR(36) PRIMARY KEY,
    time_based_strategy_id VARCHAR(36) NOT NULL,
    leg_order INT NOT NULL, -- Order of the leg (1, 2, 3, etc.)
    
    -- Basic Leg Information
    action ENUM('buy','sell') NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    option_type ENUM('ce','pe') NOT NULL,
    expiry ENUM('Weekly','Next Weekly','Monthly') NOT NULL,
    
    -- ATM Configuration
    atm_pt ENUM('ATM pt','ATM %','SP','SP >=','SP <=') NOT NULL,
    atm_value VARCHAR(50), -- Can be dropdown selection or custom value
    
    -- Stop Loss Configuration
    sl_type ENUM('SL %','SL pt') NOT NULL,
    sl_value DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    sl_on_price ENUM('On Price','On Close') NOT NULL,
    
    -- Take Profit Configuration
    tp_type ENUM('TP %','TP pt') NOT NULL,
    tp_value DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tp_on_price ENUM('On Price','On Close') NOT NULL,
    
    -- Advance Features for this leg
    wait_and_trade_enabled BOOLEAN DEFAULT FALSE,
    wait_and_trade_type ENUM('%↑','%↓','pt↑','pt↓','Equal') DEFAULT '%↑',
    wait_and_trade_value DECIMAL(10,2) DEFAULT 0.00,
    
    re_entry_enabled BOOLEAN DEFAULT FALSE,
    re_entry_type ENUM('ReExecute','ReEntry On Cost','ReEntry On Close') DEFAULT 'ReEntry On Cost',
    re_entry_value INT DEFAULT 5,
    re_entry_condition ENUM('On Close','On Price') DEFAULT 'On Close',
    
    trail_sl_enabled BOOLEAN DEFAULT FALSE,
    tsl_type ENUM('TSL %','TSL pt') DEFAULT 'TSL %',
    tsl_value1 DECIMAL(10,2) DEFAULT 0.00, -- If price moves (X)
    tsl_value2 DECIMAL(10,2) DEFAULT 0.00, -- Then Trail SL by (Y)
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (time_based_strategy_id) REFERENCES time_based_strategies_complete(id) ON DELETE CASCADE,
    INDEX idx_time_based_strategy_id (time_based_strategy_id),
    INDEX idx_leg_order (leg_order)
);

-- Create Advance Features Table for detailed feature storage
CREATE TABLE IF NOT EXISTS time_based_advance_features (
    id VARCHAR(36) PRIMARY KEY,
    time_based_strategy_id VARCHAR(36) NOT NULL,
    
    -- Global Advance Features
    move_sl_to_cost BOOLEAN DEFAULT FALSE,
    exit_all_on_sl_tgt BOOLEAN DEFAULT FALSE,
    pre_punch_sl BOOLEAN DEFAULT FALSE,
    wait_and_trade BOOLEAN DEFAULT FALSE,
    re_entry_execute BOOLEAN DEFAULT FALSE,
    trail_sl BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (time_based_strategy_id) REFERENCES time_based_strategies_complete(id) ON DELETE CASCADE,
    INDEX idx_time_based_strategy_id (time_based_strategy_id)
);

-- Create Profit Trailing Configuration Table
CREATE TABLE IF NOT EXISTS time_based_profit_trailing (
    id VARCHAR(36) PRIMARY KEY,
    time_based_strategy_id VARCHAR(36) NOT NULL,
    
    -- Profit Trailing Type
    trailing_type ENUM('no_trailing','lock_fix_profit','trail_profit','lock_and_trail') NOT NULL,
    
    -- Lock Fix Profit Configuration
    lock_fix_profit_reach DECIMAL(15,2), -- If profit reaches
    lock_fix_profit_at DECIMAL(15,2), -- Lock profit at
    
    -- Trail Profit Configuration
    trail_profit_increase DECIMAL(15,2), -- On every increase of
    trail_profit_by DECIMAL(15,2), -- Trail profit by
    
    -- Lock and Trail Configuration
    lock_and_trail_reach DECIMAL(15,2), -- If profit reach
    lock_and_trail_at DECIMAL(15,2), -- Lock profit at
    lock_and_trail_increase DECIMAL(15,2), -- Every profit increase by
    lock_and_trail_by DECIMAL(15,2), -- Trail profit by
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (time_based_strategy_id) REFERENCES time_based_strategies_complete(id) ON DELETE CASCADE,
    INDEX idx_time_based_strategy_id (time_based_strategy_id)
);

-- Create Instrument Search History Table
CREATE TABLE IF NOT EXISTS time_based_instrument_searches (
    id VARCHAR(36) PRIMARY KEY,
    time_based_strategy_id VARCHAR(36) NOT NULL,
    search_query VARCHAR(255),
    search_results JSON, -- Store search results
    selected_instrument JSON, -- Store selected instrument details
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (time_based_strategy_id) REFERENCES time_based_strategies_complete(id) ON DELETE CASCADE,
    INDEX idx_time_based_strategy_id (time_based_strategy_id),
    INDEX idx_search_query (search_query)
);

-- Create Form State Table (for debugging and form recovery)
CREATE TABLE IF NOT EXISTS time_based_form_states (
    id VARCHAR(36) PRIMARY KEY,
    time_based_strategy_id VARCHAR(36) NOT NULL,
    
    -- Form Data States
    time_indicator_form_data JSON NOT NULL,
    instrument_search_state JSON NOT NULL,
    order_legs_state JSON NOT NULL,
    advance_features_state JSON NOT NULL,
    profit_trailing_type_state VARCHAR(50) NOT NULL,
    
    -- Form Validation States
    is_underlying_selected BOOLEAN DEFAULT FALSE,
    show_advance_features BOOLEAN DEFAULT FALSE,
    form_validation_errors JSON,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (time_based_strategy_id) REFERENCES time_based_strategies_complete(id) ON DELETE CASCADE,
    INDEX idx_time_based_strategy_id (time_based_strategy_id)
);

-- Create Strategy Execution Log Table
CREATE TABLE IF NOT EXISTS time_based_execution_logs (
    id VARCHAR(36) PRIMARY KEY,
    time_based_strategy_id VARCHAR(36) NOT NULL,
    
    -- Execution Details
    execution_type ENUM('FORM_SUBMIT','LEG_ADD','LEG_DELETE','LEG_UPDATE','ADVANCE_FEATURE_TOGGLE','INSTRUMENT_SELECT','FORM_VALIDATION') NOT NULL,
    execution_data JSON, -- Store execution-specific data
    execution_result ENUM('SUCCESS','ERROR','WARNING') NOT NULL,
    error_message TEXT,
    
    -- User Context
    user_agent TEXT,
    ip_address VARCHAR(45),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (time_based_strategy_id) REFERENCES time_based_strategies_complete(id) ON DELETE CASCADE,
    INDEX idx_time_based_strategy_id (time_based_strategy_id),
    INDEX idx_execution_type (execution_type),
    INDEX idx_created_at (created_at)
);

-- Create Strategy Performance Tracking Table
CREATE TABLE IF NOT EXISTS time_based_strategy_performance (
    id VARCHAR(36) PRIMARY KEY,
    time_based_strategy_id VARCHAR(36) NOT NULL,
    
    -- Performance Metrics
    total_form_submissions INT DEFAULT 0,
    successful_submissions INT DEFAULT 0,
    failed_submissions INT DEFAULT 0,
    average_form_completion_time DECIMAL(10,2), -- in seconds
    most_used_advance_features JSON, -- Track which features are used most
    most_used_order_legs_count INT DEFAULT 0,
    
    -- User Behavior Analytics
    most_selected_instruments JSON, -- Track popular instrument selections
    most_used_profit_trailing_types JSON, -- Track popular trailing types
    form_abandonment_points JSON, -- Track where users abandon the form
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (time_based_strategy_id) REFERENCES time_based_strategies_complete(id) ON DELETE CASCADE,
    INDEX idx_time_based_strategy_id (time_based_strategy_id)
);

-- Insert sample data for testing
INSERT INTO time_based_strategies_complete (
    id, strategy_id, user_id, name, description,
    selected_instrument_symbol, selected_instrument_name, selected_instrument_segment, selected_instrument_lot_size,
    order_product_type, start_time, square_off_time, working_days, order_legs, advance_features,
    daily_profit_limit, daily_loss_limit, max_trade_cycles, no_trade_after,
    profit_trailing_type, profit_trailing_config
) VALUES (
    'time_strategy_001', 'strategy_001', 'tradesetu001', 'NIFTY Time Strategy', 'Time-based NIFTY options strategy',
    'NIFTY', 'NIFTY 50', 'INDEX', 50,
    'MIS', '09:15:00', '15:15:00', 
    '{"monday": true, "tuesday": true, "wednesday": true, "thursday": true, "friday": true, "saturday": false, "sunday": false}',
    '[
        {
            "id": 1,
            "action": "buy",
            "quantity": 1,
            "option_type": "ce",
            "expiry": "Weekly",
            "atm_pt": "ATM pt",
            "atm_value": "0",
            "sl_type": "SL %",
            "sl_value": 2.0,
            "sl_on_price": "On Price",
            "tp_type": "TP %",
            "tp_value": 4.0,
            "tp_on_price": "On Price",
            "wait_and_trade_enabled": false,
            "re_entry_enabled": false,
            "trail_sl_enabled": false
        }
    ]',
    '{
        "moveSLToCost": false,
        "exitAllOnSLTgt": false,
        "prePunchSL": false,
        "waitAndTrade": false,
        "reEntryExecute": false,
        "trailSL": false
    }',
    1000.00, 500.00, 1, '15:15:00',
    'no_trailing', '{}'
);

-- Insert corresponding order leg
INSERT INTO time_based_order_legs (
    id, time_based_strategy_id, leg_order, action, quantity, option_type, expiry,
    atm_pt, atm_value, sl_type, sl_value, sl_on_price, tp_type, tp_value, tp_on_price
) VALUES (
    'leg_001', 'time_strategy_001', 1, 'buy', 1, 'ce', 'Weekly',
    'ATM pt', '0', 'SL %', 2.0, 'On Price', 'TP %', 4.0, 'On Price'
);

-- Insert advance features
INSERT INTO time_based_advance_features (
    id, time_based_strategy_id, move_sl_to_cost, exit_all_on_sl_tgt, 
    pre_punch_sl, wait_and_trade, re_entry_execute, trail_sl
) VALUES (
    'adv_001', 'time_strategy_001', false, false, false, false, false, false
);

-- Insert profit trailing config
INSERT INTO time_based_profit_trailing (
    id, time_based_strategy_id, trailing_type
) VALUES (
    'trail_001', 'time_strategy_001', 'no_trailing'
);

-- Insert form state
INSERT INTO time_based_form_states (
    id, time_based_strategy_id, time_indicator_form_data, instrument_search_state,
    order_legs_state, advance_features_state, profit_trailing_type_state,
    is_underlying_selected, show_advance_features
) VALUES (
    'state_001', 'time_strategy_001',
    '{"name": "NIFTY Time Strategy", "time_order_product_type": "MIS", "start_time": "09:15:00", "square_off_time": "15:15:00", "working_days": {"monday": true, "tuesday": true, "wednesday": true, "thursday": true, "friday": true, "saturday": false, "sunday": false}, "daily_profit_limit": 1000, "daily_loss_limit": 500, "max_trade_cycles": 1, "noTradeAfter": "15:15:00"}',
    '{"searchQuery": "", "isSearching": false, "searchResults": [], "selectedInstrument": {"symbol": "NIFTY", "name": "NIFTY 50", "segment": "INDEX", "lotSize": 50}}',
    '[{"id": 1, "action": "buy", "quantity": 1, "option_type": "ce", "expiry": "Weekly", "atm_pt": "ATM pt", "atm_value": "0", "sl_type": "SL %", "sl_value": 2, "sl_on_price": "On Price", "tp_type": "TP %", "tp_value": 4, "tp_on_price": "On Price"}]',
    '{"moveSLToCost": false, "exitAllOnSLTgt": false, "prePunchSL": false, "waitAndTrade": false, "reEntryExecute": false, "trailSL": false}',
    'no_trailing', true, false
);

-- Insert performance tracking
INSERT INTO time_based_strategy_performance (
    id, time_based_strategy_id, total_form_submissions, successful_submissions,
    most_used_advance_features, most_used_order_legs_count
) VALUES (
    'perf_001', 'time_strategy_001', 1, 1,
    '{"moveSLToCost": 0, "exitAllOnSLTgt": 0, "prePunchSL": 0, "waitAndTrade": 0, "reEntryExecute": 0, "trailSL": 0}',
    1
);
