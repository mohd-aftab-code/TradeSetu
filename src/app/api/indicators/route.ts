import { NextRequest, NextResponse } from 'next/server';

const INDICATOR_LIST = [
  // Moving Averages
  { 
    value: 'SMA', 
    label: 'Simple Moving Average (SMA)', 
    category: 'Moving Averages',
    parameters: [
      { name: 'period', label: 'Period', type: 'number', default: 20, min: 1, max: 200, step: 1 }
    ]
  },
  { 
    value: 'EMA', 
    label: 'Exponential Moving Average (EMA)', 
    category: 'Moving Averages',
    parameters: [
      { name: 'period', label: 'Period', type: 'number', default: 20, min: 1, max: 200, step: 1 }
    ]
  },
  { 
    value: 'WMA', 
    label: 'Weighted Moving Average (WMA)', 
    category: 'Moving Averages',
    parameters: [
      { name: 'period', label: 'Period', type: 'number', default: 20, min: 1, max: 200, step: 1 }
    ]
  },
  { 
    value: 'DEMA', 
    label: 'Double Exponential MA (DEMA)', 
    category: 'Moving Averages',
    parameters: [
      { name: 'period', label: 'Period', type: 'number', default: 20, min: 1, max: 200, step: 1 }
    ]
  },
  { 
    value: 'TEMA', 
    label: 'Triple Exponential MA (TEMA)', 
    category: 'Moving Averages',
    parameters: [
      { name: 'period', label: 'Period', type: 'number', default: 20, min: 1, max: 200, step: 1 }
    ]
  },
  { 
    value: 'TRIMA', 
    label: 'Triangular Moving Average (TRIMA)', 
    category: 'Moving Averages',
    parameters: [
      { name: 'period', label: 'Period', type: 'number', default: 20, min: 1, max: 200, step: 1 }
    ]
  },
  { 
    value: 'KAMA', 
    label: 'Kaufman Adaptive MA (KAMA)', 
    category: 'Moving Averages',
    parameters: [
      { name: 'fast', label: 'Fast Period', type: 'number', default: 2, min: 1, max: 20, step: 1 },
      { name: 'slow', label: 'Slow Period', type: 'number', default: 30, min: 10, max: 100, step: 1 }
    ]
  },
  { 
    value: 'MAMA', 
    label: 'MESA Adaptive MA (MAMA)', 
    category: 'Moving Averages',
    parameters: [
      { name: 'fastlimit', label: 'Fast Limit', type: 'number', default: 0.5, min: 0.1, max: 1.0, step: 0.1 },
      { name: 'slowlimit', label: 'Slow Limit', type: 'number', default: 0.05, min: 0.01, max: 0.5, step: 0.01 }
    ]
  },
  { 
    value: 'T3', 
    label: 'T3 Moving Average', 
    category: 'Moving Averages',
    parameters: [
      { name: 'period', label: 'Period', type: 'number', default: 20, min: 1, max: 200, step: 1 },
      { name: 'vfactor', label: 'Volume Factor', type: 'number', default: 0.7, min: 0.1, max: 1.0, step: 0.1 }
    ]
  },
  
  // Volume & Price
  { 
    value: 'VWAP', 
    label: 'Volume Weighted Average Price (VWAP)', 
    category: 'Volume & Price',
    parameters: []
  },
  { 
    value: 'CANDLE', 
    label: 'Candle (OHLC)', 
    category: 'Volume & Price',
    parameters: []
  },
  { 
    value: 'NUMBER', 
    label: 'User-defined Number', 
    category: 'Volume & Price',
    parameters: [
      { name: 'value', label: 'Value', type: 'number', default: 0, min: -1000, max: 10000, step: 0.1 }
    ]
  },
  
  // Momentum
  { 
    value: 'MACD', 
    label: 'MACD Line', 
    category: 'Momentum',
    parameters: [
      { name: 'fastperiod', label: 'Fast Period', type: 'number', default: 12, min: 1, max: 50, step: 1 },
      { name: 'slowperiod', label: 'Slow Period', type: 'number', default: 26, min: 5, max: 100, step: 1 },
      { name: 'signalperiod', label: 'Signal Period', type: 'number', default: 9, min: 1, max: 50, step: 1 }
    ]
  },
  { 
    value: 'RSI', 
    label: 'Relative Strength Index (RSI)', 
    category: 'Momentum',
    parameters: [
      { name: 'period', label: 'Period', type: 'number', default: 14, min: 1, max: 100, step: 1 }
    ]
  },
  { 
    value: 'STOCHASTIC', 
    label: 'Stochastic Oscillator', 
    category: 'Momentum',
    parameters: [
      { name: 'fastk_period', label: 'Fast K Period', type: 'number', default: 14, min: 1, max: 50, step: 1 },
      { name: 'slowk_period', label: 'Slow K Period', type: 'number', default: 3, min: 1, max: 20, step: 1 },
      { name: 'slowd_period', label: 'Slow D Period', type: 'number', default: 3, min: 1, max: 20, step: 1 }
    ]
  },
  
  // Trend
  { 
    value: 'SUPERTREND', 
    label: 'SuperTrend', 
    category: 'Trend',
    parameters: [
      { name: 'atr_period', label: 'ATR Period', type: 'number', default: 10, min: 1, max: 50, step: 1 },
      { name: 'multiplier', label: 'Multiplier', type: 'number', default: 3, min: 0.1, max: 10, step: 0.1 }
    ]
  },
  { 
    value: 'ADX', 
    label: 'Average Directional Index (ADX)', 
    category: 'Trend',
    parameters: [
      { name: 'period', label: 'Period', type: 'number', default: 14, min: 1, max: 100, step: 1 }
    ]
  },
  { 
    value: 'PLUS_DI', 
    label: 'Plus Directional Indicator (+DI)', 
    category: 'Trend',
    parameters: [
      { name: 'period', label: 'Period', type: 'number', default: 14, min: 1, max: 100, step: 1 }
    ]
  },
  { 
    value: 'MINUS_DI', 
    label: 'Minus Directional Indicator (-DI)', 
    category: 'Trend',
    parameters: [
      { name: 'period', label: 'Period', type: 'number', default: 14, min: 1, max: 100, step: 1 }
    ]
  },
  { 
    value: 'PARABOLIC_SAR', 
    label: 'Parabolic SAR', 
    category: 'Trend',
    parameters: [
      { name: 'acceleration', label: 'Acceleration', type: 'number', default: 0.02, min: 0.01, max: 0.5, step: 0.01 },
      { name: 'maximum', label: 'Maximum', type: 'number', default: 0.20, min: 0.1, max: 1.0, step: 0.01 }
    ]
  },
  
  // Volatility
  { 
    value: 'BBANDS', 
    label: 'Bollinger Bands', 
    category: 'Volatility',
    parameters: [
      { name: 'period', label: 'Period', type: 'number', default: 20, min: 1, max: 100, step: 1 },
      { name: 'nbdevup', label: 'Upper Deviation', type: 'number', default: 2, min: 0.1, max: 5, step: 0.1 },
      { name: 'nbdevdn', label: 'Lower Deviation', type: 'number', default: 2, min: 0.1, max: 5, step: 0.1 }
    ]
  },
  { 
    value: 'ATR', 
    label: 'Average True Range (ATR)', 
    category: 'Volatility',
    parameters: [
      { name: 'period', label: 'Period', type: 'number', default: 14, min: 1, max: 100, step: 1 }
    ]
  },
  { 
    value: 'TRANGE', 
    label: 'True Range', 
    category: 'Volatility',
    parameters: []
  },
  
  // Pivot Points
  { 
    value: 'PIVOT_POINT', 
    label: 'Pivot Point', 
    category: 'Pivot Points',
    parameters: [
      { name: 'type', label: 'Type', type: 'select', default: 'classic', options: [
        { value: 'classic', label: 'Classic' },
        { value: 'woodie', label: 'Woodie' }
      ]}
    ]
  },
  { 
    value: 'CAMARILLA_PIVOT', 
    label: 'Camarilla Pivot', 
    category: 'Pivot Points',
    parameters: []
  },
  
  // Regression
  { 
    value: 'LINEAR_REGRESSION', 
    label: 'Linear Regression', 
    category: 'Regression',
    parameters: [
      { name: 'period', label: 'Period', type: 'number', default: 14, min: 1, max: 100, step: 1 }
    ]
  },
  { 
    value: 'LINEAR_REGRESSION_INTERCEPT', 
    label: 'Linear Regression Intercept', 
    category: 'Regression',
    parameters: [
      { name: 'period', label: 'Period', type: 'number', default: 14, min: 1, max: 100, step: 1 }
    ]
  },
];

export async function GET(request: NextRequest) {
  try {
    const groupedIndicators = INDICATOR_LIST.reduce((acc, indicator) => {
      if (!acc[indicator.category]) {
        acc[indicator.category] = [];
      }
      acc[indicator.category].push(indicator);
      return acc;
    }, {} as Record<string, typeof INDICATOR_LIST>);

    return NextResponse.json({
      success: true,
      indicators: INDICATOR_LIST,
      grouped: groupedIndicators,
      categories: Object.keys(groupedIndicators)
    });
  } catch (error) {
    console.error('Error fetching indicators:', error);
    return NextResponse.json(
      { error: 'Failed to fetch indicators' },
      { status: 500 }
    );
  }
}
