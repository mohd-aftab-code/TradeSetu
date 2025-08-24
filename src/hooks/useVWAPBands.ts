import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  calculateVWAPWithBands,
  validateOHLCVData,
  getCurrentVWAPValues,
  formatVWAPBandsResult,
  OHLCVData,
  VWAPBandsParams,
  VWAPBandsResult
} from '../lib/vwap-bands';

export interface UseVWAPBandsOptions {
  data: OHLCVData[];
  params?: VWAPBandsParams;
  autoUpdate?: boolean;
  updateInterval?: number;
  formatDecimals?: number;
  enableValidation?: boolean;
}

export interface UseVWAPBandsReturn {
  result: VWAPBandsResult | null;
  currentValues: {
    vwap: number | null;
    upperBands: number[] | null;
    lowerBands: number[] | null;
    standardDeviation: number | null;
  } | null;
  loading: boolean;
  error: string | null;
  validationErrors: string[];
  recalculate: () => void;
  updateParams: (newParams: VWAPBandsParams) => void;
  updateData: (newData: OHLCVData[]) => void;
  formattedResult: VWAPBandsResult | null;
}

/**
 * React hook for VWAP with Standard Deviation Bands calculation
 * Provides real-time calculation, error handling, and automatic updates
 */
export function useVWAPBands({
  data,
  params = {},
  autoUpdate = true,
  updateInterval = 1000,
  formatDecimals = 2,
  enableValidation = true
}: UseVWAPBandsOptions): UseVWAPBandsReturn {
  const [result, setResult] = useState<VWAPBandsResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [currentParams, setCurrentParams] = useState<VWAPBandsParams>(params);
  const [currentData, setCurrentData] = useState<OHLCVData[]>(data);

  // Memoized calculation function
  const calculate = useCallback(async () => {
    if (!currentData || currentData.length === 0) {
      setResult(null);
      setError(null);
      setValidationErrors([]);
      return;
    }

    setLoading(true);
    setError(null);
    setValidationErrors([]);

    try {
      // Validate data if enabled
      if (enableValidation) {
        const validation = validateOHLCVData(currentData);
        if (!validation.isValid) {
          setValidationErrors(validation.errors);
          setError('Data validation failed');
          setLoading(false);
          return;
        }
      }

      // Calculate VWAP bands
      const calculatedResult = calculateVWAPWithBands(currentData, currentParams);
      setResult(calculatedResult);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [currentData, currentParams, enableValidation]);

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

  // Update data when props change
  useEffect(() => {
    setCurrentData(data);
  }, [data]);

  // Update params when props change
  useEffect(() => {
    setCurrentParams(params);
  }, [params]);

  // Manual recalculation function
  const recalculate = useCallback(() => {
    calculate();
  }, [calculate]);

  // Update parameters function
  const updateParams = useCallback((newParams: VWAPBandsParams) => {
    setCurrentParams(newParams);
  }, []);

  // Update data function
  const updateData = useCallback((newData: OHLCVData[]) => {
    setCurrentData(newData);
  }, []);

  // Memoized current values
  const currentValues = useMemo(() => {
    if (!result) return null;
    return getCurrentVWAPValues(result);
  }, [result]);

  // Memoized formatted result
  const formattedResult = useMemo(() => {
    if (!result) return null;
    return formatVWAPBandsResult(result, formatDecimals);
  }, [result, formatDecimals]);

  // Memoized return value
  const returnValue = useMemo(() => ({
    result,
    currentValues,
    loading,
    error,
    validationErrors,
    recalculate,
    updateParams,
    updateData,
    formattedResult
  }), [
    result,
    currentValues,
    loading,
    error,
    validationErrors,
    recalculate,
    updateParams,
    updateData,
    formattedResult
  ]);

  return returnValue;
}

/**
 * Hook for calculating VWAP bands with streaming data updates
 */
export function useStreamingVWAPBands(
  params: VWAPBandsParams = {},
  options?: {
    bufferSize?: number;
    autoUpdate?: boolean;
    updateInterval?: number;
    formatDecimals?: number;
  }
) {
  const [dataBuffer, setDataBuffer] = useState<OHLCVData[]>([]);
  const [result, setResult] = useState<VWAPBandsResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const bufferSize = options?.bufferSize || 1000;

  const addDataPoint = useCallback((dataPoint: OHLCVData) => {
    setDataBuffer(prev => {
      const newBuffer = [...prev, dataPoint];
      
      // Maintain buffer size
      if (newBuffer.length > bufferSize) {
        return newBuffer.slice(-bufferSize);
      }
      
      return newBuffer;
    });
  }, [bufferSize]);

  const addMultipleDataPoints = useCallback((dataPoints: OHLCVData[]) => {
    setDataBuffer(prev => {
      const newBuffer = [...prev, ...dataPoints];
      
      // Maintain buffer size
      if (newBuffer.length > bufferSize) {
        return newBuffer.slice(-bufferSize);
      }
      
      return newBuffer;
    });
  }, [bufferSize]);

  const clearBuffer = useCallback(() => {
    setDataBuffer([]);
  }, []);

  const calculate = useCallback(async () => {
    if (dataBuffer.length === 0) {
      setResult(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const calculatedResult = calculateVWAPWithBands(dataBuffer, params);
      setResult(calculatedResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [dataBuffer, params]);

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

  const currentValues = useMemo(() => {
    if (!result) return null;
    return getCurrentVWAPValues(result);
  }, [result]);

  const formattedResult = useMemo(() => {
    if (!result) return null;
    return formatVWAPBandsResult(result, options?.formatDecimals || 2);
  }, [result, options?.formatDecimals]);

  return {
    result,
    currentValues,
    loading,
    error,
    dataBuffer,
    addDataPoint,
    addMultipleDataPoints,
    clearBuffer,
    recalculate: calculate,
    formattedResult
  };
}

/**
 * Hook for calculating multiple VWAP bands with different parameters
 */
export function useMultipleVWAPBands(
  data: OHLCVData[],
  configurations: Array<{
    name: string;
    params: VWAPBandsParams;
  }>,
  options?: {
    autoUpdate?: boolean;
    updateInterval?: number;
    formatDecimals?: number;
  }
) {
  const [results, setResults] = useState<{ [key: string]: VWAPBandsResult | null }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

  const calculateAll = useCallback(async () => {
    const newResults: { [key: string]: VWAPBandsResult | null } = {};
    const newLoading: { [key: string]: boolean } = {};
    const newErrors: { [key: string]: string | null } = {};

    // Set all configurations to loading
    configurations.forEach(({ name }) => {
      newLoading[name] = true;
      newErrors[name] = null;
    });

    setLoading(newLoading);

    // Calculate VWAP bands for each configuration
    const promises = configurations.map(async ({ name, params }) => {
      try {
        const result = calculateVWAPWithBands(data, params);
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
  }, [configurations, data]);

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

  const currentValues = useMemo(() => {
    const values: { [key: string]: any } = {};
    
    Object.entries(results).forEach(([name, result]) => {
      if (result) {
        values[name] = getCurrentVWAPValues(result);
      }
    });
    
    return values;
  }, [results]);

  const formattedResults = useMemo(() => {
    const formatted: { [key: string]: VWAPBandsResult | null } = {};
    
    Object.entries(results).forEach(([name, result]) => {
      if (result) {
        formatted[name] = formatVWAPBandsResult(result, options?.formatDecimals || 2);
      }
    });
    
    return formatted;
  }, [results, options?.formatDecimals]);

  return {
    results,
    currentValues,
    loading,
    errors,
    formattedResults,
    recalculate: calculateAll
  };
}
