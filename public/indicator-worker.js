// Web Worker for indicator calculations
// This worker handles heavy calculations to prevent blocking the main thread

// Import the indicator calculation functions
// Note: In a real implementation, you would need to bundle the indicators module
// or use a different approach to share code between main thread and worker

// For now, we'll implement a simplified version that can be extended
self.onmessage = function(event) {
  const { indicator, data, params } = event.data;
  
  try {
    // This is a placeholder implementation
    // In a real implementation, you would import and use the actual indicator functions
    const result = calculateIndicatorWorker(indicator, data, params);
    
    self.postMessage({
      type: 'success',
      result: result
    });
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message
    });
  }
};

// Simplified indicator calculation for worker
function calculateIndicatorWorker(indicator, data, params) {
  // This is a basic implementation - in production, you would import the full indicators module
  const { open, high, low, close, volume, timestamp } = data;
  
  switch (indicator.toLowerCase()) {
    case 'sma':
      return calculateSMAWorker(close, params.period || 14);
    case 'ema':
      return calculateEMAWorker(close, params.period || 14);
    case 'rsi':
      return calculateRSIWorker(close, params.period || 14);
    case 'macd':
      return calculateMACDWorker(close, params);
    case 'bollinger_bands':
      return calculateBollingerBandsWorker(close, params);
    default:
      throw new Error(`Unknown indicator: ${indicator}`);
  }
}

function calculateSMAWorker(data, period) {
  const values = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      values.push(NaN);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      values.push(sum / period);
    }
  }
  
  return { values };
}

function calculateEMAWorker(data, period) {
  const values = [];
  const multiplier = 2 / (period + 1);
  
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      values.push(data[0]);
    } else {
      const ema = (data[i] * multiplier) + (values[i - 1] * (1 - multiplier));
      values.push(ema);
    }
  }
  
  return { values };
}

function calculateRSIWorker(data, period) {
  const values = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      values.push(NaN);
    } else {
      let gains = 0;
      let losses = 0;
      
      for (let j = 1; j <= period; j++) {
        const change = data[i - j + 1] - data[i - j];
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

function calculateMACDWorker(data, params) {
  const fastPeriod = params.fastPeriod || 12;
  const slowPeriod = params.slowPeriod || 26;
  const signalPeriod = params.signalPeriod || 9;
  
  const fastEMA = calculateEMAWorker(data, fastPeriod);
  const slowEMA = calculateEMAWorker(data, slowPeriod);
  
  const macdLine = fastEMA.values.map((fast, i) => fast - slowEMA.values[i]);
  const signalLine = calculateEMAWorker(macdLine, signalPeriod);
  const histogram = macdLine.map((macd, i) => macd - signalLine.values[i]);
  
  return {
    values: macdLine,
    metadata: {
      signalLine: signalLine.values,
      histogram: histogram
    }
  };
}

function calculateBollingerBandsWorker(data, params) {
  const period = params.period || 20;
  const stdDev = params.stdDev || 2;
  
  const sma = calculateSMAWorker(data, period);
  const upper = [];
  const middle = [];
  const lower = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      upper.push(NaN);
      middle.push(NaN);
      lower.push(NaN);
    } else {
      const mean = sma.values[i];
      let variance = 0;
      
      for (let j = 0; j < period; j++) {
        const diff = data[i - j] - mean;
        variance += diff * diff;
      }
      
      const standardDeviation = Math.sqrt(variance / period);
      const bandWidth = standardDeviation * stdDev;
      
      upper.push(mean + bandWidth);
      middle.push(mean);
      lower.push(mean - bandWidth);
    }
  }
  
  return {
    values: middle,
    metadata: { upper, lower }
  };
}
