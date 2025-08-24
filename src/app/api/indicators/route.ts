import { NextRequest, NextResponse } from 'next/server';

const INDICATOR_LIST = [
  // Moving Averages
  { 
    value: 'SMA', 
    label: 'Simple Moving Average (SMA)', 
    category: 'Moving Averages',
    parameters: [
      { name: 'period', label: 'Period', type: 'number', default: 20, min: 1, max: 500 }
    ]
  },
  { 
    value: 'EMA', 
    label: 'Exponential Moving Average (EMA)', 
    category: 'Moving Averages',
    parameters: [
      { name: 'period', label: 'Period', type: 'number', default: 20, min: 1, max: 500 }
    ]
  },
  { 
    value: 'WMA', 
    label: 'Weighted Moving Average (WMA)', 
    category: 'Moving Averages',
    parameters: [
      { name: 'period', label: 'Period', type: 'number', default: 20, min: 1, max: 500 }
    ]
  },
  { 
    value: 'DEMA', 
    label: 'Double Exponential MA (DEMA)', 
    category: 'Moving Averages',
    parameters: [
      { name: 'period', label: 'Period', type: 'number', default: 20, min: 1, max: 500 }
    ]
  },
  { 
    value: 'TEMA', 
    label: 'Triple Exponential MA (TEMA)', 
    category: 'Moving Averages',
    parameters: [
      { name: 'period', label: 'Period', type: 'number', default: 20, min: 1, max: 500 }
    ]
  },
  { 
    value: 'TRIMA', 
    label: 'Triangular Moving Average (TRIMA)', 
    category: 'Moving Averages',
    parameters: [
      { name: 'period', label: 'Period', type: 'number', default: 20, min: 1, max: 500 }
    ]
  },
  { 
    value: 'KAMA', 
    label: 'Kaufman Adaptive MA (KAMA)', 
    category: 'Moving Averages',
    parameters: [
      { name: 'fast', label: 'Fast Period', type: 'number', default: 2, min: 1, max: 20 },
      { name: 'slow', label: 'Slow Period', type: 'number', default: 30, min: 10, max: 100 }
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
      { name: 'period', label: 'Period', type: 'number', default: 20, min: 1, max: 200 },
      { name: 'vfactor', label: 'Volume Factor', type: 'number', default: 0.7, min: 0.1, max: 1.0, step: 0.1 }
    ]
  },
  
  // Volume & Price
  { 
    value: 'VWAP', 
    label: 'Volume Weighted Average Price (VWAP)', 
    category: 'Volume & Price',
    parameters: [
      { name: 'sdMultipliers', label: 'Standard Deviation Multipliers', type: 'select', default: '1,2,3', options: [
        { value: '1', label: 'SDPLUS 1' },
        { value: '1,2', label: 'SDPLUS 1, SDPLUS 2' },
        { value: '1,2,3', label: 'SDPLUS 1, SDPLUS 2, SDPLUS 3' },
        { value: '2', label: 'SDPLUS 2' },
        { value: '3', label: 'SDPLUS 3' }
      ]},
      { name: 'resetInterval', label: 'Reset Interval', type: 'select', default: 'daily', options: [
        { value: 'daily', label: 'Daily' },
        { value: 'session', label: 'Session' },
        { value: 'none', label: 'None' }
      ]}
    ]
  },
  { 
    value: 'VWAP_UPPER_BANDS', 
    label: 'VWAP Upper Bands (SDPLUS)', 
    category: 'Volume & Price',
    parameters: [
      { name: 'sdMultipliers', label: 'Standard Deviation Multipliers', type: 'select', default: '1,2,3', options: [
        { value: '1', label: 'SDPLUS 1' },
        { value: '1,2', label: 'SDPLUS 1, SDPLUS 2' },
        { value: '1,2,3', label: 'SDPLUS 1, SDPLUS 2, SDPLUS 3' },
        { value: '2', label: 'SDPLUS 2' },
        { value: '3', label: 'SDPLUS 3' }
      ]},
      { name: 'resetInterval', label: 'Reset Interval', type: 'select', default: 'daily', options: [
        { value: 'daily', label: 'Daily' },
        { value: 'session', label: 'Session' },
        { value: 'none', label: 'None' }
      ]},
      { name: 'bandIndex', label: 'Band Index', type: 'number', default: 0, min: 0, max: 10 }
    ]
  },
  { 
    value: 'VWAP_LOWER_BANDS', 
    label: 'VWAP Lower Bands (SDMINUS)', 
    category: 'Volume & Price',
    parameters: [
      { name: 'sdMultipliers', label: 'Standard Deviation Multipliers', type: 'select', default: '1,2,3', options: [
        { value: '1', label: 'SDMINUS 1' },
        { value: '1,2', label: 'SDMINUS 1, SDMINUS 2' },
        { value: '1,2,3', label: 'SDMINUS 1, SDMINUS 2, SDMINUS 3' },
        { value: '2', label: 'SDMINUS 2' },
        { value: '3', label: 'SDMINUS 3' }
      ]},
      { name: 'resetInterval', label: 'Reset Interval', type: 'select', default: 'daily', options: [
        { value: 'daily', label: 'Daily' },
        { value: 'session', label: 'Session' },
        { value: 'none', label: 'None' }
      ]},
      { name: 'bandIndex', label: 'Band Index', type: 'number', default: 0, min: 0, max: 10 }
    ]
  },
  { 
    value: 'CANDLE', 
    label: 'Candle (OHLC)', 
    category: 'Volume & Price',
    parameters: [
      { name: 'component', label: 'Candle Component', type: 'select', default: 'close', options: [
        { value: 'open', label: 'OPEN' },
        { value: 'high', label: 'HIGH' },
        { value: 'low', label: 'LOW' },
        { value: 'close', label: 'CLOSE' }
      ]}
    ]
  },
  { 
    value: 'NUMBER', 
    label: 'Number', 
    category: 'Volume & Price',
    parameters: [
      { name: 'value', label: 'Value', type: 'number', default: 0, min: -1000000, max: 1000000 }
    ]
  },
  
  // Momentum
  { 
    value: 'MACD', 
    label: 'MACD Line', 
    category: 'Momentum',
    parameters: [
      { name: 'fastperiod', label: 'Fast Period', type: 'number', default: 12, min: 1, max: 100 },
      { name: 'slowperiod', label: 'Slow Period', type: 'number', default: 26, min: 1, max: 100 },
      { name: 'signalperiod', label: 'Signal Period', type: 'number', default: 9, min: 1, max: 50 }
    ]
  },
  { 
    value: 'RSI', 
    label: 'Relative Strength Index (RSI)', 
    category: 'Momentum',
    parameters: [
      { name: 'period', label: 'Period', type: 'number', default: 14, min: 1, max: 500 }
    ]
  },
  { 
    value: 'STOCHASTIC', 
    label: 'Stochastic', 
    category: 'Momentum',
    parameters: [
      { name: 'period', label: 'Period', type: 'number', default: 14, min: 1, max: 100 },
      { name: 'type', label: 'Type', type: 'select', default: 'fast', options: [
        { value: 'fast', label: 'Fast' },
        { value: 'slow', label: 'Slow' }
      ]}
    ]
  },
  
  // Trend
  { 
    value: 'SUPERTREND', 
    label: 'SuperTrend', 
    category: 'Trend',
    parameters: [
      { name: 'atr_period', label: 'ATR Period', type: 'number', default: 10, min: 1, max: 100 },
      { name: 'multiplier', label: 'Multiplier', type: 'number', default: 3, min: 0.1, max: 20, step: 0.1 }
    ]
  },
  { 
    value: 'ADX', 
    label: 'Average Directional Index (ADX)', 
    category: 'Trend',
    parameters: [
      { name: 'period', label: 'Period', type: 'number', default: 14, min: 1, max: 100 }
    ]
  },
  { 
    value: 'PLUS_DI', 
    label: 'Plus Directional Indicator (+DI)', 
    category: 'Trend',
    parameters: [
      { name: 'period', label: 'Period', type: 'number', default: 14, min: 1, max: 100 }
    ]
  },
  { 
    value: 'MINUS_DI', 
    label: 'Minus Directional Indicator (-DI)', 
    category: 'Trend',
    parameters: [
      { name: 'period', label: 'Period', type: 'number', default: 14, min: 1, max: 100 }
    ]
  },
  { 
    value: 'PARABOLIC_SAR', 
    label: 'Parabolic SAR', 
    category: 'Trend',
    parameters: [
      { name: 'minimum_af', label: 'Minimum_AF', type: 'number', default: 0.02, min: 0.001, max: 0.1, step: 0.001 },
      { name: 'maximum_af', label: 'Maximum_AF', type: 'number', default: 0.2, min: 0.1, max: 1.0, step: 0.01 }
    ]
  },
  
  // Volatility
  { 
    value: 'BBANDS', 
    label: 'Bollinger Bands', 
    category: 'Volatility',
    parameters: [
      { name: 'period', label: 'Period', type: 'number', default: 20, min: 1, max: 500 },
      { name: 'nbdevup', label: 'Upper Deviation', type: 'number', default: 2, min: 0.1, max: 10, step: 0.1 },
      { name: 'nbdevdn', label: 'Lower Deviation', type: 'number', default: 2, min: 0.1, max: 10, step: 0.1 }
    ]
  },
  { 
    value: 'ATR', 
    label: 'Average True Range (ATR)', 
    category: 'Volatility',
    parameters: [
      { name: 'period', label: 'Period', type: 'number', default: 14, min: 1, max: 100 }
    ]
  },
  { 
    value: 'TRANGE', 
    label: 'True Range', 
    category: 'Volatility',
    parameters: [
      { name: 'smoothing', label: 'Smoothing Period', type: 'number', default: 1, min: 1, max: 50 }
    ]
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
      ]},
      { name: 'level', label: 'Level', type: 'select', default: 'pp', options: [
        { value: 'r3', label: 'R3' },
        { value: 'r2', label: 'R2' },
        { value: 'r1', label: 'R1' },
        { value: 'pp', label: 'PP' },
        { value: 's1', label: 'S1' },
        { value: 's2', label: 'S2' },
        { value: 's3', label: 'S3' }
      ]}
    ]
  },
  { 
    value: 'CAMARILLA_PIVOT', 
    label: 'Camarilla Pivot', 
    category: 'Pivot Points',
    parameters: [
      { name: 'level', label: 'Level', type: 'select', default: 'pp', options: [
        { value: 'h5', label: 'H5' },
        { value: 'h4', label: 'H4' },
        { value: 'h3', label: 'H3' },
        { value: 'h2', label: 'H2' },
        { value: 'h1', label: 'H1' },
        { value: 'pp', label: 'PP' },
        { value: 'l1', label: 'L1' },
        { value: 'l2', label: 'L2' },
        { value: 'l3', label: 'L3' },
        { value: 'l4', label: 'L4' },
        { value: 'l5', label: 'L5' }
      ]}
    ]
  },
  
  // Regression
  { 
    value: 'LINEAR_REGRESSION', 
    label: 'Linear Regression', 
    category: 'Regression',
    parameters: [
      { name: 'period', label: 'Period', type: 'number', default: 14, min: 1, max: 500 }
    ]
  },
  { 
    value: 'LINEAR_REGRESSION_INTERCEPT', 
    label: 'Linear Regression Intercept', 
    category: 'Regression',
    parameters: [
      { name: 'period', label: 'Period', type: 'number', default: 14, min: 1, max: 500 }
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
