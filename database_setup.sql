-- MySQL Database Setup for Trading Platform
-- Run this script to create the required tables

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS trading_platform;
USE trading_platform;

-- Strategies table
CREATE TABLE IF NOT EXISTS strategies (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    strategy_type ENUM('INTRADAY', 'SWING', 'SCALPING', 'POSITIONAL') NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    entry_conditions TEXT,
    exit_conditions TEXT,
    risk_management JSON,
    is_active TINYINT(1) DEFAULT 0,
    is_paper_trading TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_executed TIMESTAMP NULL,
    total_executions INT DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00
);

-- Backtests table
CREATE TABLE IF NOT EXISTS backtests (
    id VARCHAR(36) PRIMARY KEY,
    strategy_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    initial_capital DECIMAL(15,2) NOT NULL,
    final_value DECIMAL(15,2),
    total_trades INT DEFAULT 0,
    winning_trades INT DEFAULT 0,
    losing_trades INT DEFAULT 0,
    total_pnl DECIMAL(15,2) DEFAULT 0.00,
    max_drawdown DECIMAL(5,2) DEFAULT 0.00,
    sharpe_ratio DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (strategy_id) REFERENCES strategies(id) ON DELETE CASCADE
);

-- Backtest trades table
CREATE TABLE IF NOT EXISTS backtest_trades (
    id VARCHAR(36) PRIMARY KEY,
    backtest_id VARCHAR(36) NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    side ENUM('BUY', 'SELL') NOT NULL,
    quantity INT NOT NULL,
    entry_price DECIMAL(10,2) NOT NULL,
    exit_price DECIMAL(10,2) NOT NULL,
    entry_time TIMESTAMP NOT NULL,
    exit_time TIMESTAMP NOT NULL,
    pnl DECIMAL(15,2) NOT NULL,
    fees DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (backtest_id) REFERENCES backtests(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_strategies_user_id ON strategies(user_id);
CREATE INDEX idx_strategies_created_at ON strategies(created_at);
CREATE INDEX idx_backtests_strategy_id ON backtests(strategy_id);
CREATE INDEX idx_backtest_trades_backtest_id ON backtest_trades(backtest_id);
