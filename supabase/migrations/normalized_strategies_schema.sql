-- Normalized Strategies Database Schema
-- This schema reduces table count and normalizes common fields

-- Main strategies table with common fields
CREATE TABLE `strategies` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `strategy_type` enum('TIME_BASED','INDICATOR_BASED','PROGRAMMING') NOT NULL,
  `symbol` varchar(50) NOT NULL,
  `asset_type` enum('STOCK','INDEX','FUTURES','OPTIONS','CURRENCY','COMMODITY') NOT NULL DEFAULT 'STOCK',
  `is_active` tinyint(1) DEFAULT '0',
  `is_paper_trading` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_executed` timestamp NULL DEFAULT NULL,
  `total_executions` int DEFAULT '0',
  `success_rate` decimal(5,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_strategy_type` (`strategy_type`),
  KEY `idx_symbol` (`symbol`),
  KEY `idx_strategies_user_type` (`user_id`,`strategy_type`),
  KEY `idx_strategies_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Common strategy configuration table
CREATE TABLE `strategy_config` (
  `id` varchar(36) NOT NULL,
  `strategy_id` varchar(36) NOT NULL,
  `selected_instrument_symbol` varchar(50) DEFAULT NULL,
  `selected_instrument_name` varchar(255) DEFAULT NULL,
  `selected_instrument_segment` varchar(50) DEFAULT NULL,
  `selected_instrument_lot_size` int DEFAULT NULL,
  `order_type` enum('MIS','CNC','BTST') DEFAULT 'MIS',
  `start_time` time DEFAULT '09:15:00',
  `square_off_time` time DEFAULT '15:15:00',
  `working_days` json DEFAULT NULL,
  `daily_profit_limit` decimal(15,2) DEFAULT '0.00',
  `daily_loss_limit` decimal(15,2) DEFAULT '0.00',
  `max_trade_cycles` int DEFAULT '1',
  `no_trade_after` time DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_strategy_id` (`strategy_id`),
  CONSTRAINT `strategy_config_ibfk_1` FOREIGN KEY (`strategy_id`) REFERENCES `strategies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Risk management table (common for all strategy types)
CREATE TABLE `strategy_risk_management` (
  `id` varchar(36) NOT NULL,
  `strategy_id` varchar(36) NOT NULL,
  `stop_loss_type` enum('SL %','SL pt','SL ATR') DEFAULT 'SL pt',
  `stop_loss_value` decimal(8,2) DEFAULT NULL,
  `stop_loss_on_price` enum('On Price','On Close') DEFAULT 'On Price',
  `take_profit_type` enum('TP %','TP pt','TP ATR') DEFAULT 'TP pt',
  `take_profit_value` decimal(8,2) DEFAULT NULL,
  `take_profit_on_price` enum('On Price','On Close') DEFAULT 'On Price',
  `position_size` varchar(20) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_strategy_id` (`strategy_id`),
  CONSTRAINT `strategy_risk_management_ibfk_1` FOREIGN KEY (`strategy_id`) REFERENCES `strategies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Profit trailing table (common for all strategy types)
CREATE TABLE `strategy_profit_trailing` (
  `id` varchar(36) NOT NULL,
  `strategy_id` varchar(36) NOT NULL,
  `trailing_type` enum('no_trailing','lock_fix_profit','trail_profit','lock_and_trail') DEFAULT 'no_trailing',
  `lock_fix_profit_reach` decimal(15,2) DEFAULT NULL,
  `lock_fix_profit_at` decimal(15,2) DEFAULT NULL,
  `trail_profit_increase` decimal(15,2) DEFAULT NULL,
  `trail_profit_by` decimal(15,2) DEFAULT NULL,
  `lock_and_trail_reach` decimal(15,2) DEFAULT NULL,
  `lock_and_trail_at` decimal(15,2) DEFAULT NULL,
  `lock_and_trail_increase` decimal(15,2) DEFAULT NULL,
  `lock_and_trail_by` decimal(15,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_strategy_id` (`strategy_id`),
  CONSTRAINT `strategy_profit_trailing_ibfk_1` FOREIGN KEY (`strategy_id`) REFERENCES `strategies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Time-based specific configuration (stored as JSON for flexibility)
CREATE TABLE `time_based_strategies` (
  `id` varchar(36) NOT NULL,
  `strategy_id` varchar(36) NOT NULL,
  `trigger_config` json NOT NULL, -- Contains trigger_type, trigger_time, etc.
  `order_legs` json NOT NULL, -- Contains all order leg configurations
  `advance_features` json NOT NULL, -- Contains all advance feature settings
  `form_state` json DEFAULT NULL, -- Contains form state for UI
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_strategy_id` (`strategy_id`),
  CONSTRAINT `time_based_strategies_ibfk_1` FOREIGN KEY (`strategy_id`) REFERENCES `strategies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Indicator-based specific configuration (stored as JSON for flexibility)
CREATE TABLE `indicator_based_strategies` (
  `id` varchar(36) NOT NULL,
  `strategy_id` varchar(36) NOT NULL,
  `chart_config` json NOT NULL, -- Contains chart_type, time_interval, etc.
  `condition_blocks` json NOT NULL, -- Contains all condition block configurations
  `selected_indicators` json NOT NULL, -- Contains indicator configurations
  `strike_config` json NOT NULL, -- Contains strike price configurations
  `form_state` json DEFAULT NULL, -- Contains form state for UI
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_strategy_id` (`strategy_id`),
  CONSTRAINT `indicator_based_strategies_ibfk_1` FOREIGN KEY (`strategy_id`) REFERENCES `strategies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Programming strategies table
CREATE TABLE `programming_strategies` (
  `id` varchar(36) NOT NULL,
  `strategy_id` varchar(36) NOT NULL,
  `programming_language` enum('PYTHON','JAVASCRIPT','TYPESCRIPT','R','MATLAB') DEFAULT 'PYTHON',
  `code` text NOT NULL,
  `code_version` varchar(20) DEFAULT '1.0.0',
  `execution_frequency` enum('real_time','minute','hourly','daily') DEFAULT 'real_time',
  `max_execution_time` int DEFAULT '30',
  `dependencies` json DEFAULT NULL,
  `environment_variables` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_strategy_id` (`strategy_id`),
  KEY `idx_programming_language` (`programming_language`),
  CONSTRAINT `programming_strategies_ibfk_1` FOREIGN KEY (`strategy_id`) REFERENCES `strategies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Strategy performance table (common for all strategy types)
CREATE TABLE `strategy_performance` (
  `id` varchar(36) NOT NULL,
  `strategy_id` varchar(36) NOT NULL,
  `total_trades` int DEFAULT '0',
  `winning_trades` int DEFAULT '0',
  `losing_trades` int DEFAULT '0',
  `total_pnl` decimal(15,2) DEFAULT '0.00',
  `max_drawdown` decimal(5,2) DEFAULT '0.00',
  `sharpe_ratio` decimal(8,4) DEFAULT '0.0000',
  `win_rate` decimal(5,2) DEFAULT '0.00',
  `avg_win` decimal(15,2) DEFAULT '0.00',
  `avg_loss` decimal(15,2) DEFAULT '0.00',
  `profit_factor` decimal(8,4) DEFAULT '0.0000',
  `max_consecutive_losses` int DEFAULT '0',
  `total_runtime_hours` decimal(10,2) DEFAULT '0.00',
  `avg_trade_duration_minutes` decimal(8,2) DEFAULT '0.00',
  `max_position_size` decimal(15,2) DEFAULT '0.00',
  `max_daily_loss` decimal(15,2) DEFAULT '0.00',
  `max_daily_profit` decimal(15,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_strategy_id` (`strategy_id`),
  KEY `idx_performance_win_rate` (`win_rate`),
  CONSTRAINT `strategy_performance_ibfk_1` FOREIGN KEY (`strategy_id`) REFERENCES `strategies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Backtests table (common for all strategy types)
CREATE TABLE `backtests` (
  `id` varchar(36) NOT NULL,
  `strategy_id` varchar(36) NOT NULL,
  `user_id` varchar(20) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `initial_capital` decimal(15,2) NOT NULL DEFAULT '0.00',
  `final_value` decimal(15,2) NOT NULL DEFAULT '0.00',
  `total_trades` int DEFAULT '0',
  `winning_trades` int DEFAULT '0',
  `losing_trades` int DEFAULT '0',
  `total_pnl` decimal(15,2) DEFAULT '0.00',
  `max_drawdown` decimal(5,2) DEFAULT '0.00',
  `sharpe_ratio` decimal(5,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_strategy_id` (`strategy_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_start_date` (`start_date`),
  KEY `idx_end_date` (`end_date`),
  KEY `idx_backtests_strategy_date` (`strategy_id`,`start_date`,`end_date`),
  CONSTRAINT `backtests_ibfk_1` FOREIGN KEY (`strategy_id`) REFERENCES `strategies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Backtest trades table
CREATE TABLE `backtest_trades` (
  `id` varchar(36) NOT NULL,
  `backtest_id` varchar(36) NOT NULL,
  `symbol` varchar(50) NOT NULL,
  `side` enum('BUY','SELL') NOT NULL,
  `quantity` int NOT NULL DEFAULT '0',
  `entry_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `exit_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `entry_time` timestamp NOT NULL,
  `exit_time` timestamp NOT NULL,
  `pnl` decimal(15,2) DEFAULT '0.00',
  `fees` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_backtest_id` (`backtest_id`),
  KEY `idx_symbol` (`symbol`),
  KEY `idx_entry_time` (`entry_time`),
  KEY `idx_exit_time` (`exit_time`),
  KEY `idx_side` (`side`),
  KEY `idx_backtest_trades_pnl` (`pnl`),
  CONSTRAINT `backtest_trades_ibfk_1` FOREIGN KEY (`backtest_id`) REFERENCES `backtests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Users table (keeping existing structure)
CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1',
  `subscription_plan` enum('FREE','BASIC','PREMIUM','ENTERPRISE') DEFAULT 'FREE',
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `role` enum('USER','SALES_EXECUTIVE','ADMIN') DEFAULT 'USER',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Broker connections table (keeping existing structure)
CREATE TABLE `broker_connections` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(20) NOT NULL,
  `broker_name` varchar(100) NOT NULL,
  `broker_id` varchar(100) NOT NULL,
  `api_key` varchar(255) DEFAULT NULL,
  `api_secret` varchar(255) DEFAULT NULL,
  `access_token` varchar(500) DEFAULT NULL,
  `refresh_token` varchar(500) DEFAULT NULL,
  `token_expires_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_sync` timestamp NULL DEFAULT NULL,
  `account_balance` decimal(15,2) DEFAULT '0.00',
  `margin_used` decimal(15,2) DEFAULT '0.00',
  `available_margin` decimal(15,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `broker_connections_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
