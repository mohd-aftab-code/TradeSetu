# API Routes Updated for Normalized Database Structure

## ✅ **Updated API Routes:**

### 1. **Main Strategies Route** (`/api/strategies/route.ts`)
- **GET**: Updated to use normalized structure with JOINs
- **POST**: Updated to create records in all related tables
- **Helper Functions**: Updated for new structure

### 2. **Time-Based Strategies** (`/api/strategies/time-based/route.ts`)
- **POST**: Now stores data in JSON format (trigger_config, order_legs, advance_features, form_state)
- **GET**: Fetches with normalized structure and parses JSON fields
- **PUT**: Updates JSON fields properly
- **DELETE**: Works with new structure

### 3. **Indicator-Based Strategies** (`/api/strategies/indicator-based/route.ts`)
- **POST**: Now stores data in JSON format (chart_config, condition_blocks, selected_indicators, strike_config, form_state)
- **GET**: Fetches with normalized structure and parses JSON fields
- **PUT**: Updates JSON fields properly
- **DELETE**: Works with new structure

### 4. **Programming Strategies** (`/api/strategies/programming/route.ts`)
- **POST**: Now stores data in JSON format (dependencies, environment_variables, execution_config)
- **GET**: Fetches with normalized structure and parses JSON fields
- **PUT**: Updates JSON fields properly
- **DELETE**: Works with new structure

### 5. **Performance Route** (`/api/strategies/performance/route.ts`)
- ✅ Already compatible with normalized structure

## 🎯 **Key Changes Made:**

### **Database Structure:**
- **Main Table**: `strategies` (common fields)
- **Config Table**: `strategy_config` (instrument, timing, limits)
- **Risk Management**: `strategy_risk_management` (SL/TP settings)
- **Profit Trailing**: `strategy_profit_trailing` (trailing settings)
- **Strategy-Specific**: JSON storage for complex data

### **API Response Format:**
```json
{
  "strategies": [
    {
      "id": "strategy_123",
      "name": "My Strategy",
      "strategy_type": "TIME_BASED",
      "details": {
        "trigger_config": {...},
        "order_legs": [...],
        "advance_features": {...},
        "form_state": {...}
      },
      "performance": {
        "total_trades": 10,
        "win_rate": 75.5,
        "total_pnl": 1500.00
      }
    }
  ]
}
```

### **Data Storage:**
- **Common Fields**: Stored in separate normalized tables
- **Complex Data**: Stored as JSON in strategy-specific tables
- **Performance**: Stored in dedicated performance table

## 🚀 **Benefits:**

1. **Reduced Tables**: From 15+ to 12 tables
2. **Better Performance**: Normalized structure with proper JOINs
3. **Flexible Storage**: JSON for complex form data
4. **Consistent API**: All routes follow same pattern
5. **Easy Maintenance**: Clean separation of concerns

## 📝 **Usage Examples:**

### **Create Time-Based Strategy:**
```javascript
POST /api/strategies
{
  "user_id": "user123",
  "name": "My Time Strategy",
  "strategy_type": "TIME_BASED",
  "config": {
    "selected_instrument_symbol": "BANKNIFTY",
    "start_time": "09:15:00",
    "square_off_time": "15:15:00"
  },
  "strategy_specific_data": {
    "trigger_config": {
      "trigger_type": "specific_time",
      "trigger_time": "09:20:00"
    },
    "order_legs": [...],
    "advance_features": {...}
  }
}
```

### **Fetch Strategies:**
```javascript
GET /api/strategies?user_id=user123&strategy_type=TIME_BASED
```

## ✅ **All APIs Updated and Ready!**
