/**
 * Utility functions for safe data handling
 */

/**
 * Safely converts a value to a number and formats it with toFixed
 * @param value - The value to convert (can be string, number, or null/undefined)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string with the specified decimal places
 */
export function safeToFixed(value: any, decimals: number = 1): string {
  if (typeof value === 'number') {
    return value.toFixed(decimals);
  }
  
  if (typeof value === 'string') {
    const num = parseFloat(value);
    return isNaN(num) ? '0.0' : num.toFixed(decimals);
  }
  
  return '0.0';
}

/**
 * Safely converts a value to a number
 * @param value - The value to convert
 * @param defaultValue - Default value if conversion fails (default: 0)
 * @returns Number value
 */
export function safeToNumber(value: any, defaultValue: number = 0): number {
  if (typeof value === 'number') {
    return value;
  }
  
  if (typeof value === 'string') {
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
  }
  
  return defaultValue;
}

/**
 * Safely formats a percentage value
 * @param value - The value to format as percentage
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: any, decimals: number = 1): string {
  return `${safeToFixed(value, decimals)}%`;
}
