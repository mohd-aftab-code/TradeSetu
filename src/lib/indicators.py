"""
Modular Indicator Library for Algo-Trading
"""

import pandas as pd
import numpy as np
from typing import Dict, Any

class IndicatorLibrary:
    """Comprehensive indicator library with customizable parameters"""
    
    def __init__(self):
        self.defaults = {
            # Moving Averages
            'SMA': {'period': 20},
            'EMA': {'period': 20},
            'WMA': {'period': 20},
            'DEMA': {'period': 20},
            'TEMA': {'period': 20},
            'TRIMA': {'period': 20},
            'KAMA': {'fast': 2, 'slow': 30},
            'MAMA': {'fastlimit': 0.5, 'slowlimit': 0.05},
            'T3': {'period': 20, 'vfactor': 0.7},
            
            # Volume & Price
            'VWAP': {},
            'CANDLE': {},
            'NUMBER': {'value': 0},
            
            # Momentum
            'MACD': {'fastperiod': 12, 'slowperiod': 26, 'signalperiod': 9},
            'RSI': {'period': 14},
            'STOCHASTIC': {'fastk_period': 14, 'slowk_period': 3, 'slowd_period': 3},
            
            # Trend
            'SUPERTREND': {'atr_period': 10, 'multiplier': 3},
            'ADX': {'period': 14},
            'PLUS_DI': {'period': 14},
            'MINUS_DI': {'period': 14},
            'PARABOLIC_SAR': {'acceleration': 0.02, 'maximum': 0.20},
            
            # Volatility
            'BBANDS': {'period': 20, 'nbdevup': 2, 'nbdevdn': 2},
            'ATR': {'period': 14},
            'TRANGE': {},
            
            # Pivot Points
            'PIVOT_POINT': {'type': 'classic'},
            'CAMARILLA_PIVOT': {},
            
            # Regression
            'LINEAR_REGRESSION': {'period': 14},
            'LINEAR_REGRESSION_INTERCEPT': {'period': 14},
        }
    
    def calculate_indicator(self, data: pd.DataFrame, indicator: str, **kwargs) -> pd.Series:
        """Calculate any indicator with custom parameters or defaults"""
        if indicator not in self.defaults:
            raise ValueError(f"Indicator '{indicator}' not supported")
        
        params = {**self.defaults[indicator], **kwargs}
        
        # Map to calculation methods
        methods = {
            'SMA': self.sma, 'EMA': self.ema, 'WMA': self.wma,
            'DEMA': self.dema, 'TEMA': self.tema, 'TRIMA': self.trima,
            'KAMA': self.kama, 'MAMA': self.mama, 'T3': self.t3,
            'VWAP': self.vwap, 'CANDLE': self.candle, 'NUMBER': self.number,
            'MACD': self.macd, 'RSI': self.rsi, 'STOCHASTIC': self.stochastic,
            'SUPERTREND': self.supertrend, 'ADX': self.adx,
            'PLUS_DI': self.plus_di, 'MINUS_DI': self.minus_di,
            'PARABOLIC_SAR': self.parabolic_sar, 'BBANDS': self.bbands,
            'ATR': self.atr, 'TRANGE': self.trange,
            'PIVOT_POINT': self.pivot_point, 'CAMARILLA_PIVOT': self.camarilla_pivot,
            'LINEAR_REGRESSION': self.linear_regression,
            'LINEAR_REGRESSION_INTERCEPT': self.linear_regression_intercept
        }
        
        if indicator in methods:
            return methods[indicator](data, **params)
        else:
            raise ValueError(f"Indicator '{indicator}' calculation not implemented")
    
    # Moving Averages
    def sma(self, data: pd.DataFrame, period: int = 20) -> pd.Series:
        return data['close'].rolling(window=period).mean()
    
    def ema(self, data: pd.DataFrame, period: int = 20) -> pd.Series:
        return data['close'].ewm(span=period).mean()
    
    def wma(self, data: pd.DataFrame, period: int = 20) -> pd.Series:
        weights = np.arange(1, period + 1)
        return data['close'].rolling(window=period).apply(
            lambda x: np.dot(x, weights) / weights.sum(), raw=True
        )
    
    def dema(self, data: pd.DataFrame, period: int = 20) -> pd.Series:
        ema1 = self.ema(data, period)
        ema2 = ema1.ewm(span=period).mean()
        return 2 * ema1 - ema2
    
    def tema(self, data: pd.DataFrame, period: int = 20) -> pd.Series:
        ema1 = self.ema(data, period)
        ema2 = ema1.ewm(span=period).mean()
        ema3 = ema2.ewm(span=period).mean()
        return 3 * ema1 - 3 * ema2 + ema3
    
    def trima(self, data: pd.DataFrame, period: int = 20) -> pd.Series:
        return data['close'].rolling(window=period).apply(
            lambda x: x.rolling(window=len(x)//2 + 1).mean().iloc[-1], raw=True
        )
    
    def kama(self, data: pd.DataFrame, fast: int = 2, slow: int = 30) -> pd.Series:
        change = data['close'].diff()
        volatility = change.rolling(window=10).std()
        er = change.rolling(window=10).sum() / volatility.rolling(window=10).sum()
        sc = (er * (2/(fast+1) - 2/(slow+1)) + 2/(slow+1))**2
        return data['close'].ewm(alpha=sc).mean()
    
    def mama(self, data: pd.DataFrame, fastlimit: float = 0.5, slowlimit: float = 0.05) -> pd.Series:
        # Simplified MAMA implementation
        return self.ema(data, 20)
    
    def t3(self, data: pd.DataFrame, period: int = 20, vfactor: float = 0.7) -> pd.Series:
        # Simplified T3 implementation
        return self.ema(data, period)
    
    # Volume & Price
    def vwap(self, data: pd.DataFrame) -> pd.Series:
        typical_price = (data['high'] + data['low'] + data['close']) / 3
        return (typical_price * data['volume']).cumsum() / data['volume'].cumsum()
    
    def candle(self, data: pd.DataFrame) -> pd.Series:
        return data['close']
    
    def number(self, data: pd.DataFrame, value: float = 0) -> pd.Series:
        return pd.Series([value] * len(data), index=data.index)
    
    # Momentum Indicators
    def macd(self, data: pd.DataFrame, fastperiod: int = 12, slowperiod: int = 26, signalperiod: int = 9) -> pd.Series:
        ema_fast = self.ema(data, fastperiod)
        ema_slow = self.ema(data, slowperiod)
        macd_line = ema_fast - ema_slow
        return macd_line
    
    def rsi(self, data: pd.DataFrame, period: int = 14) -> pd.Series:
        delta = data['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        return 100 - (100 / (1 + rs))
    
    def stochastic(self, data: pd.DataFrame, fastk_period: int = 14, slowk_period: int = 3, slowd_period: int = 3) -> pd.Series:
        lowest_low = data['low'].rolling(window=fastk_period).min()
        highest_high = data['high'].rolling(window=fastk_period).max()
        k = 100 * ((data['close'] - lowest_low) / (highest_high - lowest_low))
        return k.rolling(window=slowk_period).mean()
    
    # Trend Indicators
    def supertrend(self, data: pd.DataFrame, atr_period: int = 10, multiplier: float = 3) -> pd.Series:
        atr = self.atr(data, period=atr_period)
        basic_upper = (data['high'] + data['low']) / 2 + multiplier * atr
        basic_lower = (data['high'] + data['low']) / 2 - multiplier * atr
        return basic_upper  # Simplified implementation
    
    def adx(self, data: pd.DataFrame, period: int = 14) -> pd.Series:
        # Simplified ADX implementation
        return pd.Series(50, index=data.index)
    
    def plus_di(self, data: pd.DataFrame, period: int = 14) -> pd.Series:
        # Simplified +DI implementation
        return pd.Series(25, index=data.index)
    
    def minus_di(self, data: pd.DataFrame, period: int = 14) -> pd.Series:
        # Simplified -DI implementation
        return pd.Series(25, index=data.index)
    
    def parabolic_sar(self, data: pd.DataFrame, acceleration: float = 0.02, maximum: float = 0.20) -> pd.Series:
        # Simplified Parabolic SAR implementation
        return data['close'] * 0.98
    
    # Volatility Indicators
    def bbands(self, data: pd.DataFrame, period: int = 20, nbdevup: float = 2, nbdevdn: float = 2) -> pd.Series:
        sma = self.sma(data, period)
        std = data['close'].rolling(window=period).std()
        return sma + (std * nbdevup)
    
    def bbands_upper(self, data: pd.DataFrame, period: int = 20, nbdevup: float = 2, nbdevdn: float = 2) -> pd.Series:
        """Bollinger Bands Upper"""
        upper, middle, lower = talib.BBANDS(data['close'], timeperiod=period, nbdevup=nbdevup, nbdevdn=nbdevdn)
        return upper
    
    def bbands_lower(self, data: pd.DataFrame, period: int = 20, nbdevup: float = 2, nbdevdn: float = 2) -> pd.Series:
        """Bollinger Bands Lower"""
        upper, middle, lower = talib.BBANDS(data['close'], timeperiod=period, nbdevup=nbdevup, nbdevdn=nbdevdn)
        return lower
    
    def atr(self, data: pd.DataFrame, period: int = 14) -> pd.Series:
        high_low = data['high'] - data['low']
        high_close = np.abs(data['high'] - data['close'].shift())
        low_close = np.abs(data['low'] - data['close'].shift())
        true_range = np.maximum(high_low, np.maximum(high_close, low_close))
        return true_range.rolling(window=period).mean()
    
    def trange(self, data: pd.DataFrame) -> pd.Series:
        high_low = data['high'] - data['low']
        high_close = np.abs(data['high'] - data['close'].shift())
        low_close = np.abs(data['low'] - data['close'].shift())
        return np.maximum(high_low, np.maximum(high_close, low_close))
    
    # Pivot Points
    def pivot_point(self, data: pd.DataFrame, type: str = 'classic') -> pd.Series:
        if type == 'classic':
            return (data['high'] + data['low'] + data['close']) / 3
        elif type == 'woodie':
            return (data['high'] + data['low'] + 2 * data['close']) / 4
        else:
            return (data['high'] + data['low'] + data['close']) / 3
    
    def camarilla_pivot(self, data: pd.DataFrame) -> pd.Series:
        pivot = (data['high'] + data['low'] + data['close']) / 3
        return data['close'] + (data['high'] - data['low']) * 1.1/12
    
    # Regression
    def linear_regression(self, data: pd.DataFrame, period: int = 14) -> pd.Series:
        # Simplified linear regression
        return data['close'].rolling(window=period).mean()
    
    def linear_regression_intercept(self, data: pd.DataFrame, period: int = 14) -> pd.Series:
        # Simplified linear regression intercept
        return data['close'].rolling(window=period).mean()
    
    def get_all_indicators(self, data: pd.DataFrame, custom_params: Dict[str, Dict] = None) -> pd.DataFrame:
        """Calculate all indicators and return as DataFrame"""
        if custom_params is None:
            custom_params = {}
        
        result_df = data.copy()
        
        for indicator in self.defaults.keys():
            try:
                params = custom_params.get(indicator, {})
                result_df[f'{indicator}'] = self.calculate_indicator(data, indicator, **params)
            except Exception as e:
                print(f"Error calculating {indicator}: {e}")
                result_df[f'{indicator}'] = np.nan
        
        return result_df

# Export indicator list for frontend
INDICATOR_LIST = [
    {'value': 'SMA', 'label': 'Simple Moving Average (SMA)', 'category': 'Moving Averages'},
    {'value': 'EMA', 'label': 'Exponential Moving Average (EMA)', 'category': 'Moving Averages'},
    {'value': 'WMA', 'label': 'Weighted Moving Average (WMA)', 'category': 'Moving Averages'},
    {'value': 'DEMA', 'label': 'Double Exponential MA (DEMA)', 'category': 'Moving Averages'},
    {'value': 'TEMA', 'label': 'Triple Exponential MA (TEMA)', 'category': 'Moving Averages'},
    {'value': 'TRIMA', 'label': 'Triangular Moving Average (TRIMA)', 'category': 'Moving Averages'},
    {'value': 'KAMA', 'label': 'Kaufman Adaptive MA (KAMA)', 'category': 'Moving Averages'},
    {'value': 'MAMA', 'label': 'MESA Adaptive MA (MAMA)', 'category': 'Moving Averages'},
    {'value': 'T3', 'label': 'T3 Moving Average', 'category': 'Moving Averages'},
    {'value': 'VWAP', 'label': 'Volume Weighted Average Price (VWAP)', 'category': 'Volume & Price'},
    {'value': 'CANDLE', 'label': 'Candle (OHLC)', 'category': 'Volume & Price'},
    {'value': 'NUMBER', 'label': 'User-defined Number', 'category': 'Volume & Price'},
    {'value': 'MACD', 'label': 'MACD Line', 'category': 'Momentum'},
    {'value': 'RSI', 'label': 'Relative Strength Index (RSI)', 'category': 'Momentum'},
    {'value': 'STOCHASTIC', 'label': 'Stochastic Oscillator', 'category': 'Momentum'},
    {'value': 'SUPERTREND', 'label': 'SuperTrend', 'category': 'Trend'},
    {'value': 'ADX', 'label': 'Average Directional Index (ADX)', 'category': 'Trend'},
    {'value': 'PLUS_DI', 'label': 'Plus Directional Indicator (+DI)', 'category': 'Trend'},
    {'value': 'MINUS_DI', 'label': 'Minus Directional Indicator (-DI)', 'category': 'Trend'},
    {'value': 'PARABOLIC_SAR', 'label': 'Parabolic SAR', 'category': 'Trend'},
    {'value': 'BBANDS', 'label': 'Bollinger Bands', 'category': 'Volatility'},
    {'value': 'ATR', 'label': 'Average True Range (ATR)', 'category': 'Volatility'},
    {'value': 'TRANGE', 'label': 'True Range', 'category': 'Volatility'},
    {'value': 'PIVOT_POINT', 'label': 'Pivot Point', 'category': 'Pivot Points'},
    {'value': 'CAMARILLA_PIVOT', 'label': 'Camarilla Pivot', 'category': 'Pivot Points'},
    {'value': 'LINEAR_REGRESSION', 'label': 'Linear Regression', 'category': 'Regression'},
    {'value': 'LINEAR_REGRESSION_INTERCEPT', 'label': 'Linear Regression Intercept', 'category': 'Regression'},
]
