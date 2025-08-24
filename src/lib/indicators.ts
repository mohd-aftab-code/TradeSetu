// Technical Indicators Utility Module
// Comprehensive implementation of 22 technical indicators for trading software

export interface OHLCVData {
  open: number[];
  high: number[];
  low: number[];
  close: number[];
  volume: number[];
  timestamp: number[];
}

export interface IndicatorParams {
  [key: string]: any;
}

export interface IndicatorResult {
  values: number[];
  metadata?: {
    [key: string]: any;
  };
}

// Parameter validation utilities
const validateParams = (params: IndicatorParams, defaults: IndicatorParams, minMax: { [key: string]: { min: number; max: number } }) => {
  const validated = { ...defaults, ...params };
  
  for (const [key, limits] of Object.entries(minMax)) {
    if (validated[key] !== undefined) {
      validated[key] = Math.max(limits.min, Math.min(limits.max, validated[key]));
      
    }
  }
  
  return validated;
};

// CORE PRICE DATA INDICATORS

/**
 * 1. Number - User-defined numeric value
 */
export function calculateNumber(data: OHLCVData, params: IndicatorParams = {}): IndicatorResult {
  const { value = 0 } = validateParams(params, { value: 0 }, { value: { min: -1000000, max: 1000000 } });
  
  const values = new Array(data.close.length).fill(value);
  
  return { values };
}

/**
 * 2. Candle Components - Returns open, high, low, or close values
 */
export function calculateCandleComponent(data: OHLCVData, params: IndicatorParams = {}): IndicatorResult {
  const { component = 'close' } = validateParams(params, { component: 'close' }, {});
  
  let values: number[];
  
  switch (component) {
    case 'open':
      values = [...data.open];
      break;
    case 'high':
      values = [...data.high];
      break;
    case 'low':
      values = [...data.low];
      break;
    case 'close':
    default:
      values = [...data.close];
      break;
  }
  
  return { values };
}

// MOVING AVERAGES

/**
 * 3. SMA - Simple Moving Average
 */
export function calculateSMA(data: OHLCVData, params: IndicatorParams = {}): IndicatorResult {
  const { period = 14, source = 'close' } = validateParams(
    params, 
    { period: 14, source: 'close' }, 
    { period: { min: 1, max: 500 } }
  );
  
  const values: number[] = [];
  const sourceData = componentToArray(data, source);
  
  for (let i = 0; i < sourceData.length; i++) {
    if (i < period - 1) {
      values.push(NaN);
    } else {
      const sum = sourceData.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      values.push(sum / period);
    }
  }
  
  return { values };
}

/**
 * 4. EMA - Exponential Moving Average
 */
export function calculateEMA(data: OHLCVData, params: IndicatorParams = {}): IndicatorResult {
  const { period = 14, source = 'close' } = validateParams(
    params, 
    { period: 14, source: 'close' }, 
    { period: { min: 1, max: 500 } }
  );
  
  const values: number[] = [];
  const sourceData = componentToArray(data, source);
  const multiplier = 2 / (period + 1);
  
  for (let i = 0; i < sourceData.length; i++) {
    if (i === 0) {
      values.push(sourceData[0]);
    } else {
      const ema = (sourceData[i] * multiplier) + (values[i - 1] * (1 - multiplier));
      values.push(ema);
    }
  }
  
  return { values };
}

/**
 * 5. WMA - Weighted Moving Average
 */
export function calculateWMA(data: OHLCVData, params: IndicatorParams = {}): IndicatorResult {
  const { period = 14, source = 'close' } = validateParams(
    params, 
    { period: 14, source: 'close' }, 
    { period: { min: 1, max: 500 } }
  );
  
  const values: number[] = [];
  const sourceData = componentToArray(data, source);
  
  for (let i = 0; i < sourceData.length; i++) {
    if (i < period - 1) {
      values.push(NaN);
    } else {
      let weightedSum = 0;
      let weightSum = 0;
      
      for (let j = 0; j < period; j++) {
        const weight = j + 1;
        weightedSum += sourceData[i - j] * weight;
        weightSum += weight;
      }
      
      values.push(weightedSum / weightSum);
    }
  }
  
  return { values };
}

/**
 * 6. TEMA - Triple Exponential Moving Average
 */
export function calculateTEMA(data: OHLCVData, params: IndicatorParams = {}): IndicatorResult {
  const { period = 14, source = 'close' } = validateParams(
    params, 
    { period: 14, source: 'close' }, 
    { period: { min: 1, max: 500 } }
  );
  
  const sourceData = componentToArray(data, source);
  const multiplier = 2 / (period + 1);
  
  // First EMA
  const ema1: number[] = [];
  for (let i = 0; i < sourceData.length; i++) {
    if (i === 0) {
      ema1.push(sourceData[0]);
    } else {
      const ema = (sourceData[i] * multiplier) + (ema1[i - 1] * (1 - multiplier));
      ema1.push(ema);
    }
  }
  
  // Second EMA
  const ema2: number[] = [];
  for (let i = 0; i < ema1.length; i++) {
    if (i === 0) {
      ema2.push(ema1[0]);
    } else {
      const ema = (ema1[i] * multiplier) + (ema2[i - 1] * (1 - multiplier));
      ema2.push(ema);
    }
  }
  
  // Third EMA
  const ema3: number[] = [];
  for (let i = 0; i < ema2.length; i++) {
    if (i === 0) {
      ema3.push(ema2[0]);
    } else {
      const ema = (ema2[i] * multiplier) + (ema3[i - 1] * (1 - multiplier));
      ema3.push(ema);
    }
  }
  
  // TEMA = 3 * EMA1 - 3 * EMA2 + EMA3
  const values = ema1.map((val, i) => 3 * val - 3 * ema2[i] + ema3[i]);
  
  return { values };
}

/**
 * DEMA - Double Exponential Moving Average
 */
export function calculateDEMA(data: OHLCVData, params: IndicatorParams = {}): IndicatorResult {
  const { period = 14, source = 'close' } = validateParams(
    params, 
    { period: 14, source: 'close' }, 
    { period: { min: 1, max: 500 } }
  );
  
  const sourceData = componentToArray(data, source);
  const multiplier = 2 / (period + 1);
  
  // First EMA
  const ema1: number[] = [];
  for (let i = 0; i < sourceData.length; i++) {
    if (i === 0) {
      ema1.push(sourceData[0]);
    } else {
      const ema = (sourceData[i] * multiplier) + (ema1[i - 1] * (1 - multiplier));
      ema1.push(ema);
    }
  }
  
  // Second EMA
  const ema2: number[] = [];
  for (let i = 0; i < ema1.length; i++) {
    if (i === 0) {
      ema2.push(ema1[0]);
    } else {
      const ema = (ema1[i] * multiplier) + (ema2[i - 1] * (1 - multiplier));
      ema2.push(ema);
    }
  }
  
  // DEMA = 2 * EMA1 - EMA2
  const values = ema1.map((val, i) => 2 * val - ema2[i]);
  
  return { values };
}

/**
 * TRIMA - Triangular Moving Average
 */
export function calculateTRIMA(data: OHLCVData, params: IndicatorParams = {}): IndicatorResult {
  const { period = 14, source = 'close' } = validateParams(
    params, 
    { period: 14, source: 'close' }, 
    { period: { min: 1, max: 500 } }
  );
  
  const sourceData = componentToArray(data, source);
  const smaPeriod = Math.ceil(period / 2);
  
  // Calculate SMA first
  const sma: number[] = [];
  for (let i = 0; i < sourceData.length; i++) {
    if (i < smaPeriod - 1) {
      sma.push(NaN);
    } else {
      const sum = sourceData.slice(i - smaPeriod + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / smaPeriod);
    }
  }
  
  // Calculate TRIMA (SMA of SMA)
  const values: number[] = [];
  for (let i = 0; i < sma.length; i++) {
    if (i < smaPeriod - 1 || isNaN(sma[i])) {
      values.push(NaN);
    } else {
      const sum = sma.slice(i - smaPeriod + 1, i + 1).reduce((a, b) => a + b, 0);
      values.push(sum / smaPeriod);
    }
  }
  
  return { values };
}

/**
 * KAMA - Kaufman Adaptive Moving Average
 */
export function calculateKAMA(data: OHLCVData, params: IndicatorParams = {}): IndicatorResult {
  const { fast = 2, slow = 30, source = 'close' } = validateParams(
    params, 
    { fast: 2, slow: 30, source: 'close' }, 
    { fast: { min: 1, max: 20 }, slow: { min: 10, max: 100 } }
  );
  
  const sourceData = componentToArray(data, source);
  const values: number[] = [];
  
  for (let i = 0; i < sourceData.length; i++) {
    if (i < 10) {
      values.push(sourceData[i]);
    } else {
      const change = Math.abs(sourceData[i] - sourceData[i - 10]);
      let volatility = 0;
      
      for (let j = 0; j < 10; j++) {
        volatility += Math.abs(sourceData[i - j] - sourceData[i - j - 1]);
      }
      
      const er = change / volatility;
      const fastSC = 2 / (fast + 1);
      const slowSC = 2 / (slow + 1);
      const sc = Math.pow(er * (fastSC - slowSC) + slowSC, 2);
      
      const kama = values[i - 1] + sc * (sourceData[i] - values[i - 1]);
      values.push(kama);
    }
  }
  
  return { values };
}

/**
 * MAMA - MESA Adaptive Moving Average
 */
export function calculateMAMA(data: OHLCVData, params: IndicatorParams = {}): IndicatorResult {
  const { fastlimit = 0.5, slowlimit = 0.05, source = 'close' } = validateParams(
    params, 
    { fastlimit: 0.5, slowlimit: 0.05, source: 'close' }, 
    { fastlimit: { min: 0.1, max: 1.0 }, slowlimit: { min: 0.01, max: 0.5 } }
  );
  
  const sourceData = componentToArray(data, source);
  const values: number[] = [];
  
  // Simplified MAMA implementation
  for (let i = 0; i < sourceData.length; i++) {
    if (i < 10) {
      values.push(sourceData[i]);
    } else {
      // Calculate phase and smooth
      const smooth = (4 * sourceData[i] + 3 * sourceData[i - 1] + 2 * sourceData[i - 2] + sourceData[i - 3]) / 10;
      const detrender = (0.0962 * smooth + 0.5769 * (i > 1 ? smooth - 2 * sourceData[i - 2] + sourceData[i - 4] : 0));
      
      // Calculate phase
      const q1 = (0.0962 * detrender + 0.5769 * (i > 1 ? detrender - 2 * (i > 2 ? detrender : 0) + (i > 4 ? detrender : 0) : 0));
      const i1 = detrender - q1;
      
      const phase = Math.atan2(q1, i1);
      const alpha = Math.exp(-4.6 * (phase / Math.PI));
      
      // Apply limits
      const limitedAlpha = Math.max(slowlimit, Math.min(fastlimit, alpha));
      
      const mama = limitedAlpha * sourceData[i] + (1 - limitedAlpha) * (i > 0 ? values[i - 1] : sourceData[i]);
      values.push(mama);
    }
  }
  
  return { values };
}

/**
 * T3 - T3 Moving Average
 */
export function calculateT3(data: OHLCVData, params: IndicatorParams = {}): IndicatorResult {
  const { period = 20, vfactor = 0.7, source = 'close' } = validateParams(
    params, 
    { period: 20, vfactor: 0.7, source: 'close' }, 
    { period: { min: 1, max: 200 }, vfactor: { min: 0.1, max: 1.0 } }
  );
  
  const sourceData = componentToArray(data, source);
  const multiplier = 2 / (period + 1);
  
  // Calculate multiple EMAs
  const ema1: number[] = [];
  const ema2: number[] = [];
  const ema3: number[] = [];
  const ema4: number[] = [];
  const ema5: number[] = [];
  const ema6: number[] = [];
  
  // First EMA
  for (let i = 0; i < sourceData.length; i++) {
    if (i === 0) {
      ema1.push(sourceData[0]);
    } else {
      const ema = (sourceData[i] * multiplier) + (ema1[i - 1] * (1 - multiplier));
      ema1.push(ema);
    }
  }
  
  // Second EMA
  for (let i = 0; i < ema1.length; i++) {
    if (i === 0) {
      ema2.push(ema1[0]);
    } else {
      const ema = (ema1[i] * multiplier) + (ema2[i - 1] * (1 - multiplier));
      ema2.push(ema);
    }
  }
  
  // Third EMA
  for (let i = 0; i < ema2.length; i++) {
    if (i === 0) {
      ema3.push(ema2[0]);
    } else {
      const ema = (ema2[i] * multiplier) + (ema3[i - 1] * (1 - multiplier));
      ema3.push(ema);
    }
  }
  
  // Fourth EMA
  for (let i = 0; i < ema3.length; i++) {
    if (i === 0) {
      ema4.push(ema3[0]);
    } else {
      const ema = (ema3[i] * multiplier) + (ema4[i - 1] * (1 - multiplier));
      ema4.push(ema);
    }
  }
  
  // Fifth EMA
  for (let i = 0; i < ema4.length; i++) {
    if (i === 0) {
      ema5.push(ema4[0]);
    } else {
      const ema = (ema4[i] * multiplier) + (ema5[i - 1] * (1 - multiplier));
      ema5.push(ema);
    }
  }
  
  // Sixth EMA
  for (let i = 0; i < ema5.length; i++) {
    if (i === 0) {
      ema6.push(ema5[0]);
    } else {
      const ema = (ema5[i] * multiplier) + (ema6[i - 1] * (1 - multiplier));
      ema6.push(ema);
    }
  }
  
  // T3 calculation
  const c1 = -Math.pow(vfactor, 3);
  const c2 = 3 * Math.pow(vfactor, 2);
  const c3 = -3 * vfactor;
  const c4 = 1;
  
  const values = ema1.map((val, i) => 
    c1 * ema6[i] + c2 * ema5[i] + c3 * ema4[i] + c4 * ema3[i]
  );
  
  return { values };
}

/**
 * 7. VWAP - Volume Weighted Average Price with Standard Deviation Bands
 */
export function calculateVWAP(data: OHLCVData, params: IndicatorParams = {}): IndicatorResult {
  // Parse parameters
  const sdMultipliersStr = params.sdMultipliers || '1,2,3';
  const resetInterval = params.resetInterval || 'daily';
  
  // Convert string to array of numbers
  const sdMultipliers = sdMultipliersStr.split(',').map((s: string) => parseFloat(s.trim()));
  
  // Convert OHLCVData to array format expected by VWAP bands
  const ohlcvArray = data.close.map((close, i) => ({
    timestamp: data.timestamp[i],
    open: data.open[i],
    high: data.high[i],
    low: data.low[i],
    close: close,
    volume: data.volume[i]
  }));
  
  // For now, return a simple VWAP calculation without bands
  // TODO: Import VWAP bands calculation properly
  const values: number[] = [];
  let cumulativeTPV = 0; // Total Price * Volume
  let cumulativeVolume = 0;
  
  for (let i = 0; i < data.close.length; i++) {
    const typicalPrice = (data.high[i] + data.low[i] + data.close[i]) / 3;
    const volume = data.volume[i];
    
    cumulativeTPV += typicalPrice * volume;
    cumulativeVolume += volume;
    
    if (cumulativeVolume > 0) {
      values.push(cumulativeTPV / cumulativeVolume);
    } else {
      values.push(typicalPrice);
    }
  }
  
  return { values };
}

/**
 * VWAP Upper Bands - Standard Deviation Bands
 */
export function calculateVWAPUpperBands(data: OHLCVData, params: IndicatorParams = {}): IndicatorResult {
  // For now, return VWAP values as upper bands
  // TODO: Implement proper VWAP bands calculation
  const vwapResult = calculateVWAP(data, params);
  return { values: vwapResult.values };
}

/**
 * VWAP Lower Bands - Standard Deviation Bands
 */
export function calculateVWAPLowerBands(data: OHLCVData, params: IndicatorParams = {}): IndicatorResult {
  // For now, return VWAP values as lower bands
  // TODO: Implement proper VWAP bands calculation
  const vwapResult = calculateVWAP(data, params);
  return { values: vwapResult.values };
}

// OSCILLATORS

/**
 * 8. RSI - Relative Strength Index
 */
export function calculateRSI(data: OHLCVData, params: IndicatorParams = {}): IndicatorResult {
  const { period = 14, source = 'close' } = validateParams(
    params, 
    { period: 14, source: 'close' }, 
    { period: { min: 1, max: 500 } }
  );
  
  const values: number[] = [];
  const sourceData = componentToArray(data, source);
  
  for (let i = 0; i < sourceData.length; i++) {
    if (i < period) {
      values.push(NaN);
    } else {
      let gains = 0;
      let losses = 0;
      
      for (let j = 1; j <= period; j++) {
        const change = sourceData[i - j + 1] - sourceData[i - j];
        if (change > 0) {
          gains += change;
        } else {
          losses += Math.abs(change);
        }
      }
      
      const avgGain = gains / period;
      const avgLoss = losses / period;
      
      if (avgLoss === 0) {
        values.push(100);
      } else {
        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));
        values.push(rsi);
      }
    }
  }
  
  return { values };
}

/**
 * 9. Stochastic
 */
export function calculateStochastic(data: OHLCVData, params: IndicatorParams = {}): IndicatorResult {
  const { period = 14, type = 'fast' } = validateParams(
    params, 
    { period: 14, type: 'fast' }, 
    { 
      period: { min: 1, max: 100 }
    }
  );
  
  const kValues: number[] = [];
  const dValues: number[] = [];
  
  // Calculate %K
  for (let i = 0; i < data.close.length; i++) {
    if (i < period - 1) {
      kValues.push(NaN);
    } else {
      const highestHigh = Math.max(...data.high.slice(i - period + 1, i + 1));
      const lowestLow = Math.min(...data.low.slice(i - period + 1, i + 1));
      
      if (highestHigh === lowestLow) {
        kValues.push(50);
      } else {
        const k = ((data.close[i] - lowestLow) / (highestHigh - lowestLow)) * 100;
        kValues.push(k);
      }
    }
  }
  
  // Calculate %D based on type
  const dPeriod = type === 'fast' ? 3 : 3; // Both use 3 for simplicity, but could be different
  const smoothingPeriod = type === 'fast' ? 1 : 3; // Fast = no smoothing, Slow = 3-period smoothing
  
  // Apply smoothing for slow type
  let smoothedKValues = kValues;
  if (type === 'slow' && smoothingPeriod > 1) {
    smoothedKValues = [];
    for (let i = 0; i < kValues.length; i++) {
      if (i < smoothingPeriod - 1 || isNaN(kValues[i])) {
        smoothedKValues.push(NaN);
      } else {
        const sum = kValues.slice(i - smoothingPeriod + 1, i + 1).reduce((a, b) => a + b, 0);
        smoothedKValues.push(sum / smoothingPeriod);
      }
    }
  }
  
  // Calculate %D (SMA of %K)
  for (let i = 0; i < smoothedKValues.length; i++) {
    if (i < dPeriod - 1 || isNaN(smoothedKValues[i])) {
      dValues.push(NaN);
    } else {
      const sum = smoothedKValues.slice(i - dPeriod + 1, i + 1).reduce((a, b) => a + b, 0);
      dValues.push(sum / dPeriod);
    }
  }
  
  // Return %K for fast, %D for slow
  const returnValues = type === 'fast' ? kValues : dValues;
  
  return { 
    values: returnValues,
    metadata: { kValues, dValues, type }
  };
}

/**
 * 10. MACD - Moving Average Convergence Divergence
 */
export function calculateMACD(data: OHLCVData, params: IndicatorParams = {}): IndicatorResult {
  const { fastPeriod = 12, slowPeriod = 26, signalPeriod = 9, fastperiod = 12, slowperiod = 26, signalperiod = 9, source = 'close' } = validateParams(
    params, 
    { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, fastperiod: 12, slowperiod: 26, signalperiod: 9, source: 'close' }, 
    { 
      fastPeriod: { min: 1, max: 100 }, 
      slowPeriod: { min: 1, max: 100 },
      signalPeriod: { min: 1, max: 50 },
      fastperiod: { min: 1, max: 100 }, 
      slowperiod: { min: 1, max: 100 },
      signalperiod: { min: 1, max: 50 }
    }
  );
  
  // Use the parameters that were provided
  const fast = fastPeriod || fastperiod;
  const slow = slowPeriod || slowperiod;
  const signal = signalPeriod || signalperiod;
  
  const sourceData = componentToArray(data, source);
  
  // Calculate fast and slow EMAs
  const fastEMA = calculateEMA({ ...data, close: sourceData }, { period: fast, source: 'close' });
  const slowEMA = calculateEMA({ ...data, close: sourceData }, { period: slow, source: 'close' });
  
  // Calculate MACD line
  const macdLine = fastEMA.values.map((fastVal, i) => fastVal - slowEMA.values[i]);
  
  // Calculate signal line (EMA of MACD)
  const signalLine: number[] = [];
  const multiplier = 2 / (signal + 1);
  
  for (let i = 0; i < macdLine.length; i++) {
    if (i === 0) {
      signalLine.push(macdLine[0]);
    } else {
      const signal = (macdLine[i] * multiplier) + (signalLine[i - 1] * (1 - multiplier));
      signalLine.push(signal);
    }
  }
  
  // Calculate histogram
  const histogram = macdLine.map((macd, i) => macd - signalLine[i]);
  
  return { 
    values: macdLine,
    metadata: { signalLine, histogram }
  };
}

/**
 * 11. MACD-Signal
 */
export function calculateMACDSignal(data: OHLCVData, params: IndicatorParams = {}): IndicatorResult {
  const macdResult = calculateMACD(data, params);
  return {
    values: macdResult.metadata?.signalLine || [],
    metadata: { macdLine: macdResult.values, histogram: macdResult.metadata?.histogram }
  };
}

// TREND INDICATORS

/**
 * 12. ADX - Average Directional Index
 */
export function calculateADX(data: OHLCVData, params: IndicatorParams = {}): IndicatorResult {
  const { period = 14 } = validateParams(
    params, 
    { period: 14 }, 
    { period: { min: 1, max: 100 } }
  );
  
  const values: number[] = [];
  const plusDI: number[] = [];
  const minusDI: number[] = [];
  
  for (let i = 0; i < data.close.length; i++) {
    if (i < period) {
      values.push(NaN);
      plusDI.push(NaN);
      minusDI.push(NaN);
    } else {
      let plusDM = 0;
      let minusDM = 0;
      let trueRange = 0;
      
      for (let j = 1; j <= period; j++) {
        const idx = i - j + 1;
        const prevIdx = i - j;
        
        // True Range
        const tr1 = data.high[idx] - data.low[idx];
        const tr2 = Math.abs(data.high[idx] - data.close[prevIdx]);
        const tr3 = Math.abs(data.low[idx] - data.close[prevIdx]);
        const tr = Math.max(tr1, tr2, tr3);
        trueRange += tr;
        
        // Directional Movement
        const upMove = data.high[idx] - data.high[prevIdx];
        const downMove = data.low[prevIdx] - data.low[idx];
        
        if (upMove > downMove && upMove > 0) {
          plusDM += upMove;
        }
        if (downMove > upMove && downMove > 0) {
          minusDM += downMove;
        }
      }
      
      const avgPlusDM = plusDM / period;
      const avgMinusDM = minusDM / period;
      const avgTR = trueRange / period;
      
      const plusDIVal = (avgPlusDM / avgTR) * 100;
      const minusDIVal = (avgMinusDM / avgTR) * 100;
      
      plusDI.push(plusDIVal);
      minusDI.push(minusDIVal);
      
      const dx = Math.abs(plusDIVal - minusDIVal) / (plusDIVal + minusDIVal) * 100;
      values.push(dx);
    }
  }
  
  return { 
    values,
    metadata: { plusDI, minusDI }
  };
}

/**
 * 13. +DI - Positive Directional Indicator
 */
export function calculatePlusDI(data: OHLCVData, params: IndicatorParams = {}): IndicatorResult {
  const adxResult = calculateADX(data, params);
  return {
    values: adxResult.metadata?.plusDI || [],
    metadata: { adx: adxResult.values, minusDI: adxResult.metadata?.minusDI }
  };
}

/**
 * 14. -DI - Negative Directional Indicator
 */
export function calculateMinusDI(data: OHLCVData, params: IndicatorParams = {}): IndicatorResult {
  const adxResult = calculateADX(data, params);
  return {
    values: adxResult.metadata?.minusDI || [],
    metadata: { adx: adxResult.values, plusDI: adxResult.metadata?.plusDI }
  };
}

/**
 * 15. Parabolic SAR
 */
export function calculateParabolicSAR(data: OHLCVData, params: IndicatorParams = {}): IndicatorResult {
  const { minimum_af = 0.02, maximum_af = 0.2 } = validateParams(
    params, 
    { minimum_af: 0.02, maximum_af: 0.2 }, 
    { 
      minimum_af: { min: 0.001, max: 0.1 }, 
      maximum_af: { min: 0.1, max: 1.0 }
    }
  );
  
  const values: number[] = [];
  let isLong = true;
  let af = minimum_af;
  let ep = data.low[0];
  let sar = data.high[0];
  
  for (let i = 0; i < data.close.length; i++) {
    if (i === 0) {
      values.push(sar);
      continue;
    }
    
    const prevSar = values[i - 1];
    
    if (isLong) {
      if (data.low[i] < prevSar) {
        isLong = false;
        sar = ep;
        ep = data.low[i];
        af = minimum_af;
      } else {
        if (data.high[i] > ep) {
          ep = data.high[i];
          af = Math.min(af + minimum_af, maximum_af);
        }
        sar = prevSar + af * (ep - prevSar);
        if (sar > data.low[i - 1]) {
          sar = data.low[i - 1];
        }
        if (sar > data.low[i - 2]) {
          sar = data.low[i - 2];
        }
      }
    } else {
      if (data.high[i] > prevSar) {
        isLong = true;
        sar = ep;
        ep = data.high[i];
        af = minimum_af;
      } else {
        if (data.low[i] < ep) {
          ep = data.low[i];
          af = Math.min(af + minimum_af, maximum_af);
        }
        sar = prevSar - af * (prevSar - ep);
        if (sar < data.high[i - 1]) {
          sar = data.high[i - 1];
        }
        if (sar < data.high[i - 2]) {
          sar = data.high[i - 2];
        }
      }
    }
    
    values.push(sar);
  }
  
  return { values };
}

/**
 * 16. Linear Regression
 */
export function calculateLinearRegression(data: OHLCVData, params: IndicatorParams = {}): IndicatorResult {
  const { period = 14, source = 'close' } = validateParams(
    params, 
    { period: 14, source: 'close' }, 
    { period: { min: 1, max: 500 } }
  );
  
  const values: number[] = [];
  const sourceData = componentToArray(data, source);
  
  for (let i = 0; i < sourceData.length; i++) {
    if (i < period - 1) {
      values.push(NaN);
    } else {
      const xValues = Array.from({ length: period }, (_, j) => j);
      const yValues = sourceData.slice(i - period + 1, i + 1);
      
      const n = period;
      const sumX = xValues.reduce((a, b) => a + b, 0);
      const sumY = yValues.reduce((a, b) => a + b, 0);
      const sumXY = xValues.reduce((sum, x, j) => sum + x * yValues[j], 0);
      const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      
      // Calculate the regression value for the current point
      const regressionValue = slope * (period - 1) + intercept;
      values.push(regressionValue);
    }
  }
  
  return { values };
}

/**
 * 17. Linear Regression Intercept
 */
export function calculateLinearRegressionIntercept(data: OHLCVData, params: IndicatorParams = {}): IndicatorResult {
  const { period = 14, source = 'close' } = validateParams(
    params, 
    { period: 14, source: 'close' }, 
    { period: { min: 1, max: 500 } }
  );
  
  const values: number[] = [];
  const sourceData = componentToArray(data, source);
  
  for (let i = 0; i < sourceData.length; i++) {
    if (i < period - 1) {
      values.push(NaN);
    } else {
      const xValues = Array.from({ length: period }, (_, j) => j);
      const yValues = sourceData.slice(i - period + 1, i + 1);
      
      const n = period;
      const sumX = xValues.reduce((a, b) => a + b, 0);
      const sumY = yValues.reduce((a, b) => a + b, 0);
      const sumXY = xValues.reduce((sum, x, j) => sum + x * yValues[j], 0);
      const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      
      values.push(intercept);
    }
  }
  
  return { values };
}

// VOLATILITY INDICATORS

/**
 * 18. Bollinger Bands
 */
export function calculateBollingerBands(data: OHLCVData, params: IndicatorParams = {}): IndicatorResult {
  const { period = 20, stdDev = 2, nbdevup = 2, nbdevdn = 2, source = 'close' } = validateParams(
    params, 
    { period: 20, stdDev: 2, nbdevup: 2, nbdevdn: 2, source: 'close' }, 
    { 
      period: { min: 1, max: 500 }, 
      stdDev: { min: 0.1, max: 10 },
      nbdevup: { min: 0.1, max: 10 },
      nbdevdn: { min: 0.1, max: 10 }
    }
  );
  
  // Use nbdevup/nbdevdn if provided, otherwise use stdDev
  const upperDev = nbdevup !== undefined ? nbdevup : stdDev;
  const lowerDev = nbdevdn !== undefined ? nbdevdn : stdDev;
  
  const sourceData = componentToArray(data, source);
  const sma = calculateSMA({ ...data, close: sourceData }, { period, source: 'close' });
  
  const upper: number[] = [];
  const middle: number[] = [];
  const lower: number[] = [];
  
  for (let i = 0; i < sourceData.length; i++) {
    if (i < period - 1) {
      upper.push(NaN);
      middle.push(NaN);
      lower.push(NaN);
    } else {
      const mean = sma.values[i];
      let variance = 0;
      
      for (let j = 0; j < period; j++) {
        const diff = sourceData[i - j] - mean;
        variance += diff * diff;
      }
      
             const standardDeviation = Math.sqrt(variance / period);
       const upperBandWidth = standardDeviation * upperDev;
       const lowerBandWidth = standardDeviation * lowerDev;
       
       upper.push(mean + upperBandWidth);
       middle.push(mean);
       lower.push(mean - lowerBandWidth);
    }
  }
  
  return { 
    values: middle,
    metadata: { upper, lower }
  };
}

/**
 * 19. ATR - Average True Range
 */
export function calculateATR(data: OHLCVData, params: IndicatorParams = {}): IndicatorResult {
  const { period = 14 } = validateParams(
    params, 
    { period: 14 }, 
    { period: { min: 1, max: 100 } }
  );
  
  const trueRanges = calculateTrueRange(data, {});
  const values: number[] = [];
  
  for (let i = 0; i < trueRanges.values.length; i++) {
    if (i < period - 1) {
      values.push(NaN);
    } else {
      const sum = trueRanges.values.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      values.push(sum / period);
    }
  }
  
  return { values };
}

/**
 * 20. True Range
 */
export function calculateTrueRange(data: OHLCVData, params: IndicatorParams = {}): IndicatorResult {
  const { smoothing = 1 } = validateParams(
    params, 
    { smoothing: 1 }, 
    { smoothing: { min: 1, max: 50 } }
  );
  
  const rawValues: number[] = [];
  
  for (let i = 0; i < data.close.length; i++) {
    if (i === 0) {
      rawValues.push(data.high[i] - data.low[i]);
    } else {
      const tr1 = data.high[i] - data.low[i];
      const tr2 = Math.abs(data.high[i] - data.close[i - 1]);
      const tr3 = Math.abs(data.low[i] - data.close[i - 1]);
      rawValues.push(Math.max(tr1, tr2, tr3));
    }
  }
  
  // Apply smoothing if needed
  if (smoothing === 1) {
    return { values: rawValues };
  }
  
  const values: number[] = [];
  for (let i = 0; i < rawValues.length; i++) {
    if (i < smoothing - 1) {
      values.push(NaN);
    } else {
      const sum = rawValues.slice(i - smoothing + 1, i + 1).reduce((a, b) => a + b, 0);
      values.push(sum / smoothing);
    }
  }
  
  return { values };
}

/**
 * 21. SuperTrend
 */
export function calculateSuperTrend(data: OHLCVData, params: IndicatorParams = {}): IndicatorResult {
  const { period = 10, multiplier = 3, atr_period = 10 } = validateParams(
    params, 
    { period: 10, multiplier: 3, atr_period: 10 }, 
    { 
      period: { min: 1, max: 100 }, 
      multiplier: { min: 0.1, max: 20 },
      atr_period: { min: 1, max: 100 }
    }
  );
  
  const atr = calculateATR(data, { period: atr_period });
  const values: number[] = [];
  let isLong = true;
  let prevSuperTrend = 0;
  
  for (let i = 0; i < data.close.length; i++) {
    if (i < period) {
      values.push(NaN);
      continue;
    }
    
    const atrValue = atr.values[i];
    const hl2 = (data.high[i] + data.low[i]) / 2;
    
    let upperBand = hl2 + (multiplier * atrValue);
    let lowerBand = hl2 - (multiplier * atrValue);
    
    if (i > period) {
      const prevUpperBand = values[i - 1] + (multiplier * atr.values[i - 1]);
      const prevLowerBand = values[i - 1] - (multiplier * atr.values[i - 1]);
      
      if (upperBand > prevUpperBand || data.close[i - 1] > prevUpperBand) {
        upperBand = Math.min(upperBand, prevUpperBand);
      } else {
        upperBand = upperBand;
      }
      
      if (lowerBand < prevLowerBand || data.close[i - 1] < prevLowerBand) {
        lowerBand = Math.max(lowerBand, prevLowerBand);
      } else {
        lowerBand = lowerBand;
      }
    }
    
    let superTrend;
    if (i === period) {
      superTrend = lowerBand;
      isLong = true;
    } else {
      if (prevSuperTrend === values[i - 1] && data.close[i] <= upperBand) {
        superTrend = upperBand;
        isLong = false;
      } else if (prevSuperTrend === values[i - 1] && data.close[i] > upperBand) {
        superTrend = upperBand;
        isLong = true;
      } else if (prevSuperTrend === values[i - 1] && data.close[i] >= lowerBand) {
        superTrend = lowerBand;
        isLong = true;
      } else if (prevSuperTrend === values[i - 1] && data.close[i] < lowerBand) {
        superTrend = lowerBand;
        isLong = false;
      } else if (isLong && data.close[i] <= upperBand) {
        superTrend = upperBand;
        isLong = false;
      } else if (!isLong && data.close[i] >= lowerBand) {
        superTrend = lowerBand;
        isLong = true;
      } else {
        superTrend = prevSuperTrend;
      }
    }
    
    values.push(superTrend);
    prevSuperTrend = superTrend;
  }
  
  return { values };
}

// SUPPORT/RESISTANCE

/**
 * 22. Pivot Points
 */
export function calculatePivotPoints(data: OHLCVData, params: IndicatorParams = {}): IndicatorResult {
  const { type = 'standard', level = 'pp' } = validateParams(params, { type: 'standard', level: 'pp' }, {});
  
  const values: number[] = [];
  const r1: number[] = [];
  const r2: number[] = [];
  const r3: number[] = [];
  const s1: number[] = [];
  const s2: number[] = [];
  const s3: number[] = [];
  
  for (let i = 0; i < data.close.length; i++) {
    if (i === 0) {
      values.push(NaN);
      r1.push(NaN);
      r2.push(NaN);
      r3.push(NaN);
      s1.push(NaN);
      s2.push(NaN);
      s3.push(NaN);
      continue;
    }
    
    const high = data.high[i - 1];
    const low = data.low[i - 1];
    const close = data.close[i - 1];
    
    let pivot, resistance1, resistance2, resistance3, support1, support2, support3;
    
    switch (type) {
      case 'fibonacci':
        pivot = (high + low + close) / 3;
        resistance1 = pivot + 0.382 * (high - low);
        resistance2 = pivot + 0.618 * (high - low);
        resistance3 = pivot + 1.000 * (high - low);
        support1 = pivot - 0.382 * (high - low);
        support2 = pivot - 0.618 * (high - low);
        support3 = pivot - 1.000 * (high - low);
        break;
      case 'camarilla':
        pivot = (high + low + close) / 3;
        resistance1 = close + (high - low) * 1.1 / 12;
        resistance2 = close + (high - low) * 1.1 / 6;
        resistance3 = close + (high - low) * 1.1 / 4;
        support1 = close - (high - low) * 1.1 / 12;
        support2 = close - (high - low) * 1.1 / 6;
        support3 = close - (high - low) * 1.1 / 4;
        break;
      case 'standard':
      default:
        pivot = (high + low + close) / 3;
        resistance1 = 2 * pivot - low;
        resistance2 = pivot + (high - low);
        resistance3 = high + 2 * (pivot - low);
        support1 = 2 * pivot - high;
        support2 = pivot - (high - low);
        support3 = low - 2 * (high - pivot);
        break;
    }
    
    values.push(pivot);
    r1.push(resistance1);
    r2.push(resistance2);
    r3.push(resistance3);
    s1.push(support1);
    s2.push(support2);
    s3.push(support3);
  }
  
  // Return the specific level requested
  let returnValues: number[];
  switch (level) {
    case 'r3':
      returnValues = r3;
      break;
    case 'r2':
      returnValues = r2;
      break;
    case 'r1':
      returnValues = r1;
      break;
    case 'pp':
    default:
      returnValues = values;
      break;
    case 's1':
      returnValues = s1;
      break;
    case 's2':
      returnValues = s2;
      break;
    case 's3':
      returnValues = s3;
      break;
  }

  return { 
    values: returnValues,
    metadata: { r1, r2, r3, s1, s2, s3, pivot: values, selectedLevel: level }
  };
}

/**
 * 23. Camarilla Pivot Points
 */
export function calculateCamarillaPivot(data: OHLCVData, params: IndicatorParams = {}): IndicatorResult {
  const { level = 'pp' } = validateParams(params, { level: 'pp' }, {});
  
  const values: number[] = [];
  const h5: number[] = [];
  const h4: number[] = [];
  const h3: number[] = [];
  const h2: number[] = [];
  const h1: number[] = [];
  const pp: number[] = [];
  const l1: number[] = [];
  const l2: number[] = [];
  const l3: number[] = [];
  const l4: number[] = [];
  const l5: number[] = [];
  
  for (let i = 0; i < data.close.length; i++) {
    if (i === 0) {
      values.push(NaN);
      h5.push(NaN);
      h4.push(NaN);
      h3.push(NaN);
      h2.push(NaN);
      h1.push(NaN);
      pp.push(NaN);
      l1.push(NaN);
      l2.push(NaN);
      l3.push(NaN);
      l4.push(NaN);
      l5.push(NaN);
      continue;
    }
    
    const high = data.high[i - 1];
    const low = data.low[i - 1];
    const close = data.close[i - 1];
    
    // Camarilla Pivot Point calculation
    const range = high - low;
    const pivot = (high + low + close) / 3;
    
    // Camarilla levels
    const h5Val = close + (range * 1.618);
    const h4Val = close + (range * 1.1 / 4);
    const h3Val = close + (range * 1.1 / 6);
    const h2Val = close + (range * 1.1 / 12);
    const h1Val = close + (range * 1.1 / 24);
    const l1Val = close - (range * 1.1 / 24);
    const l2Val = close - (range * 1.1 / 12);
    const l3Val = close - (range * 1.1 / 6);
    const l4Val = close - (range * 1.1 / 4);
    const l5Val = close - (range * 1.618);
    
    values.push(pivot);
    h5.push(h5Val);
    h4.push(h4Val);
    h3.push(h3Val);
    h2.push(h2Val);
    h1.push(h1Val);
    pp.push(pivot);
    l1.push(l1Val);
    l2.push(l2Val);
    l3.push(l3Val);
    l4.push(l4Val);
    l5.push(l5Val);
  }
  
  // Return the specific level requested
  let returnValues: number[];
  switch (level) {
    case 'h5':
      returnValues = h5;
      break;
    case 'h4':
      returnValues = h4;
      break;
    case 'h3':
      returnValues = h3;
      break;
    case 'h2':
      returnValues = h2;
      break;
    case 'h1':
      returnValues = h1;
      break;
    case 'pp':
    default:
      returnValues = pp;
      break;
    case 'l1':
      returnValues = l1;
      break;
    case 'l2':
      returnValues = l2;
      break;
    case 'l3':
      returnValues = l3;
      break;
    case 'l4':
      returnValues = l4;
      break;
    case 'l5':
      returnValues = l5;
      break;
  }

  return { 
    values: returnValues,
    metadata: { h5, h4, h3, h2, h1, pp, l1, l2, l3, l4, l5, selectedLevel: level }
  };
}

// Utility function to convert component string to array
function componentToArray(data: OHLCVData, component: string): number[] {
  switch (component) {
    case 'open':
      return data.open;
    case 'high':
      return data.high;
    case 'low':
      return data.low;
    case 'close':
    default:
      return data.close;
  }
}

// Main indicator function that routes to specific calculations
export function calculateIndicator(
  indicator: string,
  data: OHLCVData,
  params: IndicatorParams = {}
): IndicatorResult {
  const indicatorMap: { [key: string]: (data: OHLCVData, params: IndicatorParams) => IndicatorResult } = {
    // Core Price Data
    'number': calculateNumber,
    'candle_component': calculateCandleComponent,
    'candle': calculateCandleComponent,
    
    // Moving Averages
    'sma': calculateSMA,
    'ema': calculateEMA,
    'wma': calculateWMA,
    'tema': calculateTEMA,
    'dema': calculateDEMA,
    'trima': calculateTRIMA,
    'kama': calculateKAMA,
    'mama': calculateMAMA,
    't3': calculateT3,
    
    // Volume & Price
    'vwap': calculateVWAP,
    'vwap_upper_bands': calculateVWAPUpperBands,
    'vwap_lower_bands': calculateVWAPLowerBands,
    
    // Momentum
    'rsi': calculateRSI,
    'stochastic': calculateStochastic,
    'macd': calculateMACD,
    'macd_signal': calculateMACDSignal,
    
    // Trend
    'adx': calculateADX,
    'plus_di': calculatePlusDI,
    'minus_di': calculateMinusDI,
    'parabolic_sar': calculateParabolicSAR,
    'supertrend': calculateSuperTrend,
    
    // Regression
    'linear_regression': calculateLinearRegression,
    'linear_regression_intercept': calculateLinearRegressionIntercept,
    
    // Volatility
    'bollinger_bands': calculateBollingerBands,
    'atr': calculateATR,
    'true_range': calculateTrueRange,
    
    // Pivot Points
    'pivot_points': calculatePivotPoints,
    'pivot_point': calculatePivotPoints,
    'camarilla_pivot': calculateCamarillaPivot,
    
    // Additional mappings for different case variations
    'NUMBER': calculateNumber,
    'CANDLE': calculateCandleComponent,
    'SMA': calculateSMA,
    'EMA': calculateEMA,
    'WMA': calculateWMA,
    'TEMA': calculateTEMA,
    'DEMA': calculateDEMA,
    'TRIMA': calculateTRIMA,
    'KAMA': calculateKAMA,
    'MAMA': calculateMAMA,
    'T3': calculateT3,
    'VWAP': calculateVWAP,
    'VWAP_UPPER_BANDS': calculateVWAPUpperBands,
    'VWAP_LOWER_BANDS': calculateVWAPLowerBands,
    'RSI': calculateRSI,
    'STOCHASTIC': calculateStochastic,
    'MACD': calculateMACD,
    'MACD_SIGNAL': calculateMACDSignal,
    'ADX': calculateADX,
    'PLUS_DI': calculatePlusDI,
    'MINUS_DI': calculateMinusDI,
    'PARABOLIC_SAR': calculateParabolicSAR,
    'SUPERTREND': calculateSuperTrend,
    'LINEAR_REGRESSION': calculateLinearRegression,
    'LINEAR_REGRESSION_INTERCEPT': calculateLinearRegressionIntercept,
    'BBANDS': calculateBollingerBands,
    'ATR': calculateATR,
    'TRANGE': calculateTrueRange,
    'PIVOT_POINT': calculatePivotPoints,
    'CAMARILLA_PIVOT': calculateCamarillaPivot,
  };
  
  // Try exact match first, then lowercase
  let calculator = indicatorMap[indicator];
  if (!calculator) {
    calculator = indicatorMap[indicator.toLowerCase()];
  }
  if (!calculator) {
    calculator = indicatorMap[indicator.toUpperCase()];
  }
  
  if (!calculator) {
    throw new Error(`Unknown indicator: ${indicator}`);
  }
  
  return calculator(data, params);
}
