# Complete Time Based Strategy Table Structure

## Overview
This document provides the complete database table structure for the Time Based Strategy form, capturing ALL form fields and conditions from `TimeBasedStrategy.tsx`.

## Main Table: `time_based_strategies_complete`

### Primary Information
- `id` - Primary key
- `strategy_id` - Foreign key to strategies table
- `user_id` - User identifier
- `name` - Strategy name
- `description` - Strategy description

### Selected Instrument Information
- `selected_instrument_symbol` - Symbol (e.g., NIFTY, BANKNIFTY)
- `selected_instrument_name` - Full name (e.g., NIFTY 50)
- `selected_instrument_segment` - Segment (INDEX, STOCK, etc.)
- `selected_instrument_lot_size` - Lot size for trading

### Order Configuration
- `order_product_type` - ENUM('MIS','CNC','BTST')
- `start_time` - TIME field for strategy start
- `square_off_time` - TIME field for strategy end
- `working_days` - JSON object for trading days

### Order Legs
- `order_legs` - JSON array containing all order leg configurations

### Advance Features
- `advance_features` - JSON object containing all advance feature settings

### Risk Management
- `daily_profit_limit` - Maximum daily profit limit
- `daily_loss_limit` - Maximum daily loss limit
- `max_trade_cycles` - Maximum number of trade cycles
- `no_trade_after` - Time after which no trades should be executed

### Profit Trailing
- `profit_trailing_type` - ENUM for trailing type
- `profit_trailing_config` - JSON for specific trailing configuration

## Supporting Tables

### 1. `time_based_order_legs`
Stores detailed information for each order leg:
- Basic leg info (action, quantity, option_type, expiry)
- ATM configuration (atm_pt, atm_value)
- Stop Loss settings (sl_type, sl_value, sl_on_price)
- Take Profit settings (tp_type, tp_value, tp_on_price)
- Advance features per leg (wait_and_trade, re_entry, trail_sl)

### 2. `time_based_advance_features`
Stores global advance feature settings:
- move_sl_to_cost
- exit_all_on_sl_tgt
- pre_punch_sl
- wait_and_trade
- re_entry_execute
- trail_sl

### 3. `time_based_profit_trailing`
Stores detailed profit trailing configuration:
- Trailing type selection
- Lock fix profit settings
- Trail profit settings
- Lock and trail settings

### 4. `time_based_instrument_searches`
Tracks instrument search history:
- Search queries
- Search results
- Selected instruments

### 5. `time_based_form_states`
Stores complete form state for recovery:
- All form data states
- Validation states
- UI state information

### 6. `time_based_execution_logs`
Tracks all form interactions:
- Form submissions
- Leg additions/deletions
- Feature toggles
- Validation results

### 7. `time_based_strategy_performance`
Analytics and performance tracking:
- Form completion metrics
- Feature usage analytics
- User behavior tracking

## Form Field Mapping

### Basic Configuration
| Form Field | Database Field | Table |
|------------|----------------|-------|
| Strategy Name | name | time_based_strategies_complete |
| Order Type | order_product_type | time_based_strategies_complete |
| Start Time | start_time | time_based_strategies_complete |
| Square Off Time | square_off_time | time_based_strategies_complete |
| Working Days | working_days | time_based_strategies_complete |

### Selected Instrument
| Form Field | Database Field | Table |
|------------|----------------|-------|
| Symbol | selected_instrument_symbol | time_based_strategies_complete |
| Name | selected_instrument_name | time_based_strategies_complete |
| Segment | selected_instrument_segment | time_based_strategies_complete |
| Lot Size | selected_instrument_lot_size | time_based_strategies_complete |

### Order Legs
| Form Field | Database Field | Table |
|------------|----------------|-------|
| Action | action | time_based_order_legs |
| Quantity | quantity | time_based_order_legs |
| Option Type | option_type | time_based_order_legs |
| Expiry | expiry | time_based_order_legs |
| ATM Point | atm_pt | time_based_order_legs |
| ATM Value | atm_value | time_based_order_legs |
| SL Type | sl_type | time_based_order_legs |
| SL Value | sl_value | time_based_order_legs |
| SL On | sl_on_price | time_based_order_legs |
| TP Type | tp_type | time_based_order_legs |
| TP Value | tp_value | time_based_order_legs |
| TP On | tp_on_price | time_based_order_legs |

### Advance Features (Per Leg)
| Form Field | Database Field | Table |
|------------|----------------|-------|
| Wait & Trade Type | wait_and_trade_type | time_based_order_legs |
| Wait & Trade Value | wait_and_trade_value | time_based_order_legs |
| Re Entry Type | re_entry_type | time_based_order_legs |
| Re Entry Value | re_entry_value | time_based_order_legs |
| Re Entry Condition | re_entry_condition | time_based_order_legs |
| TSL Type | tsl_type | time_based_order_legs |
| TSL Value 1 | tsl_value1 | time_based_order_legs |
| TSL Value 2 | tsl_value2 | time_based_order_legs |

### Global Advance Features
| Form Field | Database Field | Table |
|------------|----------------|-------|
| Move SL to Cost | move_sl_to_cost | time_based_advance_features |
| Exit All on SL/Tgt | exit_all_on_sl_tgt | time_based_advance_features |
| Pre Punch SL | pre_punch_sl | time_based_advance_features |
| Wait & Trade | wait_and_trade | time_based_advance_features |
| Re Entry/Execute | re_entry_execute | time_based_advance_features |
| Trail SL | trail_sl | time_based_advance_features |

### Risk Management
| Form Field | Database Field | Table |
|------------|----------------|-------|
| Daily Profit Limit | daily_profit_limit | time_based_strategies_complete |
| Daily Loss Limit | daily_loss_limit | time_based_strategies_complete |
| Max Trade Cycles | max_trade_cycles | time_based_strategies_complete |
| No Trade After | no_trade_after | time_based_strategies_complete |

### Profit Trailing
| Form Field | Database Field | Table |
|------------|----------------|-------|
| Trailing Type | trailing_type | time_based_profit_trailing |
| Lock Fix Profit Reach | lock_fix_profit_reach | time_based_profit_trailing |
| Lock Fix Profit At | lock_fix_profit_at | time_based_profit_trailing |
| Trail Profit Increase | trail_profit_increase | time_based_profit_trailing |
| Trail Profit By | trail_profit_by | time_based_profit_trailing |
| Lock and Trail Reach | lock_and_trail_reach | time_based_profit_trailing |
| Lock and Trail At | lock_and_trail_at | time_based_profit_trailing |
| Lock and Trail Increase | lock_and_trail_increase | time_based_profit_trailing |
| Lock and Trail By | lock_and_trail_by | time_based_profit_trailing |

## JSON Field Structures

### working_days
```json
{
  "monday": true,
  "tuesday": true,
  "wednesday": true,
  "thursday": true,
  "friday": true,
  "saturday": false,
  "sunday": false
}
```

### order_legs
```json
[
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
]
```

### advance_features
```json
{
  "moveSLToCost": false,
  "exitAllOnSLTgt": false,
  "prePunchSL": false,
  "waitAndTrade": false,
  "reEntryExecute": false,
  "trailSL": false
}
```

## Key Features

1. **Complete Field Coverage**: Every single field from the TimeBasedStrategy form is captured
2. **Normalized Structure**: Data is properly normalized across multiple tables
3. **JSON Support**: Complex form data is stored as JSON for flexibility
4. **Audit Trail**: Complete logging of all form interactions
5. **Performance Tracking**: Analytics for form usage and completion
6. **State Recovery**: Complete form state can be recovered
7. **Search History**: Instrument search history is tracked
8. **Validation Tracking**: Form validation errors are logged

## Usage

This table structure ensures that:
- No form field is lost during submission
- All form conditions are properly stored
- Complete form state can be recovered
- Analytics can be performed on form usage
- The system can track user behavior and form completion rates
- All advance features and their configurations are captured
- Order legs with all their configurations are stored
- Risk management settings are preserved
- Profit trailing configurations are maintained

The structure is designed to be comprehensive, scalable, and maintainable while capturing every aspect of the Time Based Strategy form.
