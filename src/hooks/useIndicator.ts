import { useState, useEffect, useCallback, useMemo } from 'react';
import { calculateIndicator, OHLCVData, IndicatorParams, IndicatorResult } from '../lib/indicators';

export interface UseIndicatorOptions {
  indicator: string;
  params?: IndicatorParams;
  data: OHLCVData;
  autoUpdate?: boolean;
  updateInterval?: number;
}

export interface UseIndicatorReturn {
  result: IndicatorResult | null;
  loading: boolean;
  error: string | null;
  recalculate: () => void;
  updateData: (newData: OHLCVData) => void;
  updateParams: (newParams: IndicatorParams) => void;
}

/**
 * React hook for real-time indicator calculation
 * Automatically recalculates when data or parameters change
 */
export function useIndicator({
  indicator,
  params = {},
  data,
  autoUpdate = true,
  updateInterval = 1000
}: UseIndicatorOptions): UseIndicatorReturn {
  const [result, setResult] = useState<IndicatorResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentData, setCurrentData] = useState<OHLCVData>(data);
  const [currentParams, setCurrentParams] = useState<IndicatorParams>(params);

  // Memoized calculation function
  const calculate = useCallback(async () => {
    if (!currentData.close.length) {
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use Web Worker for heavy calculations if available
      if (typeof Worker !== 'undefined' && currentData.close.length > 1000) {
        const worker = new Worker('/api/indicator-worker.js');
        
        worker.postMessage({
          indicator,
          data: currentData,
          params: currentParams
        });

        worker.onmessage = (event) => {
          setResult(event.data.result);
          setLoading(false);
          worker.terminate();
        };

        worker.onerror = (event) => {
          setError(`Worker error: ${event.message}`);
          setLoading(false);
          worker.terminate();
        };
      } else {
        // Synchronous calculation for smaller datasets
        const calculatedResult = calculateIndicator(indicator, currentData, currentParams);
        setResult(calculatedResult);
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setLoading(false);
    }
  }, [indicator, currentData, currentParams]);

  // Initial calculation
  useEffect(() => {
    calculate();
  }, [calculate]);

  // Auto-update timer
  useEffect(() => {
    if (!autoUpdate) return;

    const interval = setInterval(() => {
      calculate();
    }, updateInterval);

    return () => clearInterval(interval);
  }, [autoUpdate, updateInterval, calculate]);

  // Update data function
  const updateData = useCallback((newData: OHLCVData) => {
    setCurrentData(newData);
  }, []);

  // Update parameters function
  const updateParams = useCallback((newParams: IndicatorParams) => {
    setCurrentParams(newParams);
  }, []);

  // Manual recalculation function
  const recalculate = useCallback(() => {
    calculate();
  }, [calculate]);

  // Memoized return value
  const returnValue = useMemo(() => ({
    result,
    loading,
    error,
    recalculate,
    updateData,
    updateParams
  }), [result, loading, error, recalculate, updateData, updateParams]);

  return returnValue;
}

/**
 * Hook for calculating multiple indicators simultaneously
 */
export function useMultipleIndicators(
  indicators: Array<{
    name: string;
    indicator: string;
    params?: IndicatorParams;
  }>,
  data: OHLCVData,
  options?: {
    autoUpdate?: boolean;
    updateInterval?: number;
  }
) {
  const [results, setResults] = useState<{ [key: string]: IndicatorResult | null }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

  const calculateAll = useCallback(async () => {
    const newResults: { [key: string]: IndicatorResult | null } = {};
    const newLoading: { [key: string]: boolean } = {};
    const newErrors: { [key: string]: string | null } = {};

    // Set all indicators to loading
    indicators.forEach(({ name }) => {
      newLoading[name] = true;
      newErrors[name] = null;
    });

    setLoading(newLoading);

    // Calculate all indicators
    const promises = indicators.map(async ({ name, indicator, params = {} }) => {
      try {
        const result = calculateIndicator(indicator, data, params);
        newResults[name] = result;
        newErrors[name] = null;
      } catch (err) {
        newResults[name] = null;
        newErrors[name] = err instanceof Error ? err.message : 'Unknown error occurred';
      }
    });

    await Promise.all(promises);

    setResults(newResults);
    setLoading({});
    setErrors(newErrors);
  }, [indicators, data]);

  useEffect(() => {
    calculateAll();
  }, [calculateAll]);

  useEffect(() => {
    if (!options?.autoUpdate) return;

    const interval = setInterval(() => {
      calculateAll();
    }, options.updateInterval || 1000);

    return () => clearInterval(interval);
  }, [calculateAll, options?.autoUpdate, options?.updateInterval]);

  return {
    results,
    loading,
    errors,
    recalculate: calculateAll
  };
}

/**
 * Hook for calculating indicators with data streaming
 */
export function useStreamingIndicator(
  indicator: string,
  params: IndicatorParams = {},
  options?: {
    bufferSize?: number;
    autoUpdate?: boolean;
    updateInterval?: number;
  }
) {
  const [dataBuffer, setDataBuffer] = useState<OHLCVData>({
    open: [],
    high: [],
    low: [],
    close: [],
    volume: [],
    timestamp: []
  });

  const [result, setResult] = useState<IndicatorResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const bufferSize = options?.bufferSize || 1000;

  const addDataPoint = useCallback((dataPoint: {
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    timestamp: number;
  }) => {
    setDataBuffer(prev => {
      const newBuffer = {
        open: [...prev.open, dataPoint.open],
        high: [...prev.high, dataPoint.high],
        low: [...prev.low, dataPoint.low],
        close: [...prev.close, dataPoint.close],
        volume: [...prev.volume, dataPoint.volume],
        timestamp: [...prev.timestamp, dataPoint.timestamp]
      };

      // Maintain buffer size
      if (newBuffer.open.length > bufferSize) {
        return {
          open: newBuffer.open.slice(-bufferSize),
          high: newBuffer.high.slice(-bufferSize),
          low: newBuffer.low.slice(-bufferSize),
          close: newBuffer.close.slice(-bufferSize),
          volume: newBuffer.volume.slice(-bufferSize),
          timestamp: newBuffer.timestamp.slice(-bufferSize)
        };
      }

      return newBuffer;
    });
  }, [bufferSize]);

  const calculate = useCallback(async () => {
    if (dataBuffer.close.length === 0) {
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const calculatedResult = calculateIndicator(indicator, dataBuffer, params);
      setResult(calculatedResult);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setLoading(false);
    }
  }, [indicator, dataBuffer, params]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  useEffect(() => {
    if (!options?.autoUpdate) return;

    const interval = setInterval(() => {
      calculate();
    }, options.updateInterval || 1000);

    return () => clearInterval(interval);
  }, [calculate, options?.autoUpdate, options?.updateInterval]);

  return {
    result,
    loading,
    error,
    addDataPoint,
    dataBuffer,
    recalculate: calculate
  };
}
