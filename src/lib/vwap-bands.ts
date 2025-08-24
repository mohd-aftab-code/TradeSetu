// VWAP with Standard Deviation Bands Utility
// Comprehensive implementation for React-based trading applications

export interface OHLCVData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface VWAPBandsParams {
  sdMultipliers?: number[];
  resetInterval?: 'daily' | 'session' | 'none';
}

export interface VWAPBandsResult {
  vwap: number[];
  upperBands: number[][];
  lowerBands: number[][];
  typicalPrices: number[];
  standardDeviations: number[];
}

export interface VWAPSession {
  startIndex: number;
  endIndex: number;
  cumulativeTypicalPriceVolume: number;
  cumulativeVolume: number;
  typicalPrices: number[];
  volumes: number[];
  vwapValues: number[];
}

/**
 * Determines if a new trading session has begun based on timestamp comparison
 * @param currentTimestamp - Current candle timestamp
 * @param previousTimestamp - Previous candle timestamp
 * @param resetInterval - Reset interval type
 * @returns true if a new session has begun
 */
export function isNewSession(
  currentTimestamp: number,
  previousTimestamp: number,
  resetInterval: string
): boolean {
  if (resetInterval === 'none') {
    return false;
  }

  if (resetInterval === 'daily') {
    const currentDate = new Date(currentTimestamp);
    const previousDate = new Date(previousTimestamp);
    
    // Check if it's a new day (different date)
    return (
      currentDate.getFullYear() !== previousDate.getFullYear() ||
      currentDate.getMonth() !== previousDate.getMonth() ||
      currentDate.getDate() !== previousDate.getDate()
    );
  }

  if (resetInterval === 'session') {
    // For session-based resets, you might want to implement
    // specific session detection logic based on your trading hours
    // For now, we'll use a simple time gap approach
    const timeDiff = currentTimestamp - previousTimestamp;
    const maxGap = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
    
    return timeDiff > maxGap;
  }

  return false;
}

/**
 * Calculates Typical Price for a given OHLCV data point
 * @param data - OHLCV data point
 * @returns Typical Price: (high + low + close) / 3
 */
export function calculateTypicalPrice(data: OHLCVData): number {
  return (data.high + data.low + data.close) / 3;
}

/**
 * Calculates VWAP with Standard Deviation Bands
 * @param data - Array of OHLCV data
 * @param params - Calculation parameters
 * @returns VWAP bands result object
 */
export function calculateVWAPWithBands(
  data: OHLCVData[],
  params: VWAPBandsParams = {}
): VWAPBandsResult {
  const {
    sdMultipliers = [1, 2, 3],
    resetInterval = 'daily'
  } = params;

  // Validate input
  if (!data || data.length === 0) {
    return {
      vwap: [],
      upperBands: sdMultipliers.map(() => []),
      lowerBands: sdMultipliers.map(() => []),
      typicalPrices: [],
      standardDeviations: []
    };
  }

  // Initialize result arrays
  const vwap: number[] = [];
  const upperBands: number[][] = sdMultipliers.map(() => []);
  const lowerBands: number[][] = sdMultipliers.map(() => []);
  const typicalPrices: number[] = [];
  const standardDeviations: number[] = [];

  // Calculate typical prices for all data points
  for (let i = 0; i < data.length; i++) {
    typicalPrices.push(calculateTypicalPrice(data[i]));
  }

  // Track current session
  let currentSession: VWAPSession = {
    startIndex: 0,
    endIndex: 0,
    cumulativeTypicalPriceVolume: 0,
    cumulativeVolume: 0,
    typicalPrices: [],
    volumes: [],
    vwapValues: []
  };

  // Process each data point
  for (let i = 0; i < data.length; i++) {
    const currentData = data[i];
    const typicalPrice = typicalPrices[i];
    const volume = currentData.volume;

    // Check if we need to start a new session
    const isNewSessionFlag = i > 0 && isNewSession(
      currentData.timestamp,
      data[i - 1].timestamp,
      resetInterval
    );

    if (isNewSessionFlag) {
      // Reset session data
      currentSession = {
        startIndex: i,
        endIndex: i,
        cumulativeTypicalPriceVolume: 0,
        cumulativeVolume: 0,
        typicalPrices: [],
        volumes: [],
        vwapValues: []
      };
    }

    // Update session data
    currentSession.cumulativeTypicalPriceVolume += typicalPrice * volume;
    currentSession.cumulativeVolume += volume;
    currentSession.typicalPrices.push(typicalPrice);
    currentSession.volumes.push(volume);
    currentSession.endIndex = i;

    // Calculate VWAP for current point
    let currentVWAP: number;
    if (currentSession.cumulativeVolume === 0) {
      currentVWAP = typicalPrice; // Fallback to typical price if no volume
    } else {
      currentVWAP = currentSession.cumulativeTypicalPriceVolume / currentSession.cumulativeVolume;
    }

    vwap.push(currentVWAP);
    currentSession.vwapValues.push(currentVWAP);

    // Calculate standard deviation for the current session
    let standardDeviation = 0;
    if (currentSession.typicalPrices.length > 1) {
      // Calculate variance: sum of squared deviations from VWAP
      let sumSquaredDeviations = 0;
      let totalVolume = 0;

      for (let j = 0; j < currentSession.typicalPrices.length; j++) {
        const deviation = currentSession.typicalPrices[j] - currentSession.vwapValues[j];
        const weightedDeviation = deviation * deviation * currentSession.volumes[j];
        sumSquaredDeviations += weightedDeviation;
        totalVolume += currentSession.volumes[j];
      }

      // Calculate volume-weighted standard deviation
      if (totalVolume > 0) {
        const variance = sumSquaredDeviations / totalVolume;
        standardDeviation = Math.sqrt(variance);
      }
    }

    standardDeviations.push(standardDeviation);

    // Calculate bands for each multiplier
    for (let bandIndex = 0; bandIndex < sdMultipliers.length; bandIndex++) {
      const multiplier = sdMultipliers[bandIndex];
      const upperBand = currentVWAP + (standardDeviation * multiplier);
      const lowerBand = currentVWAP - (standardDeviation * multiplier);

      upperBands[bandIndex].push(upperBand);
      lowerBands[bandIndex].push(lowerBand);
    }
  }

  return {
    vwap,
    upperBands,
    lowerBands,
    typicalPrices,
    standardDeviations
  };
}

/**
 * Validates OHLCV data for consistency and completeness
 * @param data - Array of OHLCV data to validate
 * @returns Validation result with errors if any
 */
export function validateOHLCVData(data: OHLCVData[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || data.length === 0) {
    errors.push('Data array is empty or null');
    return { isValid: false, errors };
  }

  for (let i = 0; i < data.length; i++) {
    const candle = data[i];

    // Check for required properties
    if (typeof candle.timestamp !== 'number' || isNaN(candle.timestamp)) {
      errors.push(`Invalid timestamp at index ${i}`);
    }

    if (typeof candle.open !== 'number' || isNaN(candle.open)) {
      errors.push(`Invalid open price at index ${i}`);
    }

    if (typeof candle.high !== 'number' || isNaN(candle.high)) {
      errors.push(`Invalid high price at index ${i}`);
    }

    if (typeof candle.low !== 'number' || isNaN(candle.low)) {
      errors.push(`Invalid low price at index ${i}`);
    }

    if (typeof candle.close !== 'number' || isNaN(candle.close)) {
      errors.push(`Invalid close price at index ${i}`);
    }

    if (typeof candle.volume !== 'number' || isNaN(candle.volume) || candle.volume < 0) {
      errors.push(`Invalid volume at index ${i}`);
    }

    // Check for logical consistency
    if (candle.high < candle.low) {
      errors.push(`High price is less than low price at index ${i}`);
    }

    if (candle.open < candle.low || candle.open > candle.high) {
      errors.push(`Open price is outside high-low range at index ${i}`);
    }

    if (candle.close < candle.low || candle.close > candle.high) {
      errors.push(`Close price is outside high-low range at index ${i}`);
    }

    // Check for timestamp ordering
    if (i > 0 && candle.timestamp <= data[i - 1].timestamp) {
      errors.push(`Timestamp is not strictly increasing at index ${i}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Gets the current VWAP and band values for the latest data point
 * @param result - VWAP bands result object
 * @returns Current values or null if no data
 */
export function getCurrentVWAPValues(result: VWAPBandsResult): {
  vwap: number | null;
  upperBands: number[] | null;
  lowerBands: number[] | null;
  standardDeviation: number | null;
} | null {
  if (!result.vwap || result.vwap.length === 0) {
    return null;
  }

  const lastIndex = result.vwap.length - 1;
  
  return {
    vwap: result.vwap[lastIndex],
    upperBands: result.upperBands.map(band => band[lastIndex]),
    lowerBands: result.lowerBands.map(band => band[lastIndex]),
    standardDeviation: result.standardDeviations[lastIndex]
  };
}

/**
 * Calculates VWAP bands for a specific time range
 * @param data - Array of OHLCV data
 * @param startTime - Start timestamp (inclusive)
 * @param endTime - End timestamp (inclusive)
 * @param params - Calculation parameters
 * @returns VWAP bands result for the specified range
 */
export function calculateVWAPBandsForRange(
  data: OHLCVData[],
  startTime: number,
  endTime: number,
  params: VWAPBandsParams = {}
): VWAPBandsResult {
  const filteredData = data.filter(
    candle => candle.timestamp >= startTime && candle.timestamp <= endTime
  );

  return calculateVWAPWithBands(filteredData, params);
}

/**
 * Formats VWAP bands result for display
 * @param result - VWAP bands result object
 * @param decimals - Number of decimal places for formatting
 * @returns Formatted result object
 */
export function formatVWAPBandsResult(
  result: VWAPBandsResult,
  decimals: number = 2
): VWAPBandsResult {
  const formatNumber = (num: number) => Number(num.toFixed(decimals));

  return {
    vwap: result.vwap.map(formatNumber),
    upperBands: result.upperBands.map(band => band.map(formatNumber)),
    lowerBands: result.lowerBands.map(band => band.map(formatNumber)),
    typicalPrices: result.typicalPrices.map(formatNumber),
    standardDeviations: result.standardDeviations.map(formatNumber)
  };
}
