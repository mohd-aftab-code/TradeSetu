# Indicator Based Strategy Table Structure

## Overview
This document describes the comprehensive table structure for storing all indicator-based strategy data. The structure is designed to capture all form fields and conditions from the IndicatorBasedStrategy.tsx component.

## Main Tables

### 1. `indicator_based_strategies_complete`
**Primary table for storing indicator-based strategy data**

| Column | Type | Description |
|--------|------|-------------|
| `id` | VARCHAR(36) | Primary key |
| `strategy_id` | VARCHAR(36) | Foreign key to strategies table |
| `user_id` | VARCHAR(20) | User identifier |
| `name` | VARCHAR(255) | Strategy name |
| `description` | TEXT | Strategy description |
| `selected_instrument_symbol` | VARCHAR(50) | Selected instrument symbol |
| `selected_instrument_name` | VARCHAR(255) | Selected instrument name |
| `selected_instrument_segment` | VARCHAR(50) | Instrument segment (INDEX, STOCK, etc.) |
| `selected_instrument_lot_size` | INT | Lot size of selected instrument |
| `order_type` | ENUM | Order type (MIS, CNC, BTST) |
| `start_time` | TIME | Trading start time |
| `square_off_time` | TIME | Trading end time |
| `working_days` | JSON | Selected working days |
| `chart_type` | ENUM | Chart type (Candle, Line, Bar, Area) |
| `time_interval` | ENUM | Time interval (1 Min, 3 Min, etc.) |
| `transaction_type` | ENUM | Transaction type (Both Side, Only Long, Only Short) |
| `condition_blocks` | INT | Number of condition blocks |
| `logical_operator` | ENUM | Logical operator (AND, OR) |
| `long_conditions` | JSON | Long entry conditions |
| `long_comparator` | VARCHAR(50) | Long condition comparator |
| `short_conditions` | JSON | Short entry conditions |
| `short_comparator` | VARCHAR(50) | Short condition comparator |
| `selected_indicators` | JSON | Selected indicators configuration |
| `strike_type` | ENUM | Strike type (ATM pt, ATM %, SP, etc.) |
| `strike_value` | VARCHAR(100) | Strike value |
| `custom_price` | DECIMAL(10,2) | Custom price for SP options |
| `action_type` | ENUM | Action type (BUY, SELL) |
| `quantity` | INT | Order quantity |
| `expiry_type` | ENUM | Expiry type (WEEKLY, MONTHLY) |
| `sl_type` | ENUM | Stop loss type (SL %, SL pt) |
| `sl_value` | DECIMAL(8,2) | Stop loss value |
| `sl_on_price` | ENUM | SL trigger (On Price, On Close) |
| `tp_type` | ENUM | Take profit type (TP %, TP pt) |
| `tp_value` | DECIMAL(8,2) | Take profit value |
| `tp_on_price` | ENUM | TP trigger (On Price, On Close) |
| `daily_profit_limit` | DECIMAL(15,2) | Daily profit limit |
| `daily_loss_limit` | DECIMAL(15,2) | Daily loss limit |
| `max_trade_cycles` | INT | Maximum trade cycles |
| `no_trade_after` | TIME | No trade after time |
| `profit_trailing_type` | ENUM | Profit trailing type |
| `profit_trailing_config` | JSON | Profit trailing configuration |

### 2. `indicator_condition_blocks`
**Stores individual condition blocks for complex conditions**

| Column | Type | Description |
|--------|------|-------------|
| `id` | VARCHAR(36) | Primary key |
| `indicator_strategy_id` | VARCHAR(36) | Foreign key to main table |
| `block_order` | INT | Order of condition block |
| `long_indicator1` | VARCHAR(100) | First long indicator |
| `long_indicator1_params` | JSON | Parameters for first long indicator |
| `long_comparator` | VARCHAR(50) | Long condition comparator |
| `long_indicator2` | VARCHAR(100) | Second long indicator |
| `long_indicator2_params` | JSON | Parameters for second long indicator |
| `short_indicator1` | VARCHAR(100) | First short indicator |
| `short_indicator1_params` | JSON | Parameters for first short indicator |
| `short_comparator` | VARCHAR(50) | Short condition comparator |
| `short_indicator2` | VARCHAR(100) | Second short indicator |
| `short_indicator2_params` | JSON | Parameters for second short indicator |
| `logical_operator` | ENUM | Logical operator for this block |

### 3. `indicator_parameters`
**Stores specific parameters for each indicator**

| Column | Type | Description |
|--------|------|-------------|
| `id` | VARCHAR(36) | Primary key |
| `condition_block_id` | VARCHAR(36) | Foreign key to condition blocks |
| `indicator_name` | VARCHAR(100) | Name of the indicator |
| `indicator_type` | ENUM | Type (long1, long2, short1, short2) |
| `period` | INT | Period parameter |
| `multiplier` | DECIMAL(8,2) | Multiplier parameter |
| `smoothing_factor` | DECIMAL(8,2) | Smoothing factor |
| `ma_type` | ENUM | Moving average type (SMA, EMA, WMA, TEMA) |
| `overbought_level` | DECIMAL(5,2) | RSI overbought level |
| `oversold_level` | DECIMAL(5,2) | RSI oversold level |
| `fast_period` | INT | MACD fast period |
| `slow_period` | INT | MACD slow period |
| `signal_period` | INT | MACD signal period |
| `std_deviation` | DECIMAL(5,2) | Bollinger Bands standard deviation |
| `k_period` | INT | Stochastic K period |
| `d_period` | INT | Stochastic D period |
| `smooth_k` | INT | Stochastic smooth K |
| `custom_params` | JSON | Custom parameters for flexibility |

### 4. `indicator_strike_config`
**Stores strike configuration details**

| Column | Type | Description |
|--------|------|-------------|
| `id` | VARCHAR(36) | Primary key |
| `indicator_strategy_id` | VARCHAR(36) | Foreign key to main table |
| `strike_type` | ENUM | Strike type (ATM pt, ATM %, SP, etc.) |
| `strike_value` | VARCHAR(100) | Strike value |
| `custom_price` | DECIMAL(10,2) | Custom price for SP options |
| `atm_offset_points` | INT | ATM offset in points |
| `atm_offset_percentage` | DECIMAL(5,2) | ATM offset percentage |
| `sp_operator` | ENUM | SP operator (>=, <=, =) |
| `sp_value` | DECIMAL(10,2) | SP value |

### 5. `indicator_risk_management`
**Stores risk management configuration**

| Column | Type | Description |
|--------|------|-------------|
| `id` | VARCHAR(36) | Primary key |
| `indicator_strategy_id` | VARCHAR(36) | Foreign key to main table |
| `daily_profit_limit` | DECIMAL(15,2) | Daily profit limit |
| `daily_loss_limit` | DECIMAL(15,2) | Daily loss limit |
| `max_trade_cycles` | INT | Maximum trade cycles |
| `max_position_size` | DECIMAL(15,2) | Maximum position size |
| `no_trade_after` | TIME | No trade after time |
| `trading_start_time` | TIME | Trading start time |
| `trading_end_time` | TIME | Trading end time |
| `stop_loss_type` | ENUM | Stop loss type |
| `stop_loss_value` | DECIMAL(8,2) | Stop loss value |
| `stop_loss_on_price` | ENUM | SL trigger type |
| `take_profit_type` | ENUM | Take profit type |
| `take_profit_value` | DECIMAL(8,2) | Take profit value |
| `take_profit_on_price` | ENUM | TP trigger type |

### 6. `indicator_profit_trailing`
**Stores profit trailing configuration**

| Column | Type | Description |
|--------|------|-------------|
| `id` | VARCHAR(36) | Primary key |
| `indicator_strategy_id` | VARCHAR(36) | Foreign key to main table |
| `trailing_type` | ENUM | Trailing type |
| `lock_fix_profit_reach` | DECIMAL(15,2) | Lock fix profit reach |
| `lock_fix_profit_at` | DECIMAL(15,2) | Lock fix profit at |
| `trail_profit_increase` | DECIMAL(15,2) | Trail profit increase |
| `trail_profit_by` | DECIMAL(15,2) | Trail profit by |
| `lock_and_trail_reach` | DECIMAL(15,2) | Lock and trail reach |
| `lock_and_trail_at` | DECIMAL(15,2) | Lock and trail at |
| `lock_and_trail_increase` | DECIMAL(15,2) | Lock and trail increase |
| `lock_and_trail_by` | DECIMAL(15,2) | Lock and trail by |

### 7. `indicator_form_states`
**Stores form state for UI preservation**

| Column | Type | Description |
|--------|------|-------------|
| `id` | VARCHAR(36) | Primary key |
| `indicator_strategy_id` | VARCHAR(36) | Foreign key to main table |
| `indicator_form_data` | JSON | Complete form data |
| `instrument_search_state` | JSON | Instrument search state |
| `condition_blocks_state` | JSON | Condition blocks state |
| `selected_indicators_state` | JSON | Selected indicators state |
| `strike_config_state` | JSON | Strike configuration state |
| `risk_management_state` | JSON | Risk management state |
| `profit_trailing_state` | JSON | Profit trailing state |
| `is_underlying_selected` | BOOLEAN | Underlying selection state |
| `show_advanced_options` | BOOLEAN | Advanced options visibility |
| `current_condition_block` | INT | Current condition block |

### 8. `available_indicators`
**Reference table for available indicators**

| Column | Type | Description |
|--------|------|-------------|
| `id` | VARCHAR(36) | Primary key |
| `name` | VARCHAR(100) | Indicator name |
| `display_name` | VARCHAR(150) | Display name |
| `category` | ENUM | Category (Trend, Momentum, Volatility, Volume, Custom) |
| `description` | TEXT | Indicator description |
| `required_params` | JSON | Required parameters |
| `optional_params` | JSON | Optional parameters |
| `default_params` | JSON | Default parameters |
| `icon` | VARCHAR(50) | UI icon |
| `color` | VARCHAR(20) | UI color |
| `is_active` | BOOLEAN | Active status |

## Form Field Mapping

### Basic Configuration
- **Strategy Name**: `indicator_based_strategies_complete.name`
- **Description**: `indicator_based_strategies_complete.description`
- **Selected Instrument**: `indicator_based_strategies_complete.selected_instrument_*`

### Trading Configuration
- **Order Type**: `indicator_based_strategies_complete.order_type`
- **Start Time**: `indicator_based_strategies_complete.start_time`
- **Square Off Time**: `indicator_based_strategies_complete.square_off_time`
- **Working Days**: `indicator_based_strategies_complete.working_days`
- **Chart Type**: `indicator_based_strategies_complete.chart_type`
- **Time Interval**: `indicator_based_strategies_complete.time_interval`
- **Transaction Type**: `indicator_based_strategies_complete.transaction_type`

### Condition Configuration
- **Condition Blocks**: `indicator_based_strategies_complete.condition_blocks`
- **Logical Operator**: `indicator_based_strategies_complete.logical_operator`
- **Long Conditions**: `indicator_condition_blocks.long_*`
- **Short Conditions**: `indicator_condition_blocks.short_*`
- **Selected Indicators**: `indicator_parameters.*`

### Strike Configuration
- **Strike Type**: `indicator_strike_config.strike_type`
- **Strike Value**: `indicator_strike_config.strike_value`
- **Custom Price**: `indicator_strike_config.custom_price`

### Risk Management
- **Daily Limits**: `indicator_risk_management.daily_*_limit`
- **Trade Cycles**: `indicator_risk_management.max_trade_cycles`
- **No Trade After**: `indicator_risk_management.no_trade_after`
- **Stop Loss**: `indicator_risk_management.stop_loss_*`
- **Take Profit**: `indicator_risk_management.take_profit_*`

### Profit Trailing
- **Trailing Type**: `indicator_profit_trailing.trailing_type`
- **Trailing Config**: `indicator_profit_trailing.*_*`

## Usage Example

```sql
-- Get complete indicator-based strategy with all related data
SELECT 
    ibs.*,
    icb.*,
    ip.*,
    isc.*,
    irm.*,
    ipt.*,
    ifs.*
FROM indicator_based_strategies_complete ibs
LEFT JOIN indicator_condition_blocks icb ON ibs.id = icb.indicator_strategy_id
LEFT JOIN indicator_parameters ip ON icb.id = ip.condition_block_id
LEFT JOIN indicator_strike_config isc ON ibs.id = isc.indicator_strategy_id
LEFT JOIN indicator_risk_management irm ON ibs.id = irm.indicator_strategy_id
LEFT JOIN indicator_profit_trailing ipt ON ibs.id = ipt.indicator_strategy_id
LEFT JOIN indicator_form_states ifs ON ibs.id = ifs.indicator_strategy_id
WHERE ibs.strategy_id = ?;
```

## Benefits

1. **Comprehensive Data Storage**: Captures all form fields and conditions
2. **Flexible Structure**: JSON fields allow for complex configurations
3. **Normalized Design**: Reduces data redundancy
4. **Easy Querying**: Well-indexed for fast retrieval
5. **Extensible**: Easy to add new indicators and parameters
6. **Form State Preservation**: Maintains UI state for editing
7. **Reference Data**: Built-in indicator definitions

This structure ensures that all data from the IndicatorBasedStrategy form is properly stored and can be easily retrieved for display and editing.
