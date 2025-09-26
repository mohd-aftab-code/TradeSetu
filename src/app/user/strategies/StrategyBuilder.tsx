'use client'

import React, { useState } from 'react';

const UNDERLYINGS = ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'STOCK'];
const STRATEGY_TYPES = ['Time-Based', 'Indicator-Based'];
const TIME_FRAMES = ['1m', '5m', '15m', '1H', '1D'];
const INDICATORS = {
  Popular: ['SMA', 'EMA', 'VWAP', 'RSI', 'MACD', 'Bollinger Bands', 'SuperTrend'],
  Trend: ['ADX', 'Parabolic SAR', 'Ichimoku Cloud'],
  Volume: ['Volume', 'OBV', 'MFI'],
  Momentum: ['Stochastic RSI', 'CCI', 'ROC'],
};
const CONDITION_TYPES = ['Crosses Above', 'Crosses Below', 'Greater Than', 'Less Than'];
const COMPARE_WITH = ['Indicator', 'Constant Value'];
const ACTIONS = ['Buy', 'Sell'];
const OPTION_TYPES = ['Call (CE)', 'Put (PE)'];
const STRIKE_PRICES = ['ATM', 'ITM 1', 'OTM 1', 'Custom'];
const SL_TYPES = ['Points', 'Percentage'];
const TARGET_TYPES = ['Points', 'Percentage'];
const ORDER_TYPES = ['Market', 'Limit', 'SL-M'];
const POSITION_SIZING = ['Fixed Quantity', 'Capital %'];
const NOTIFICATIONS = ['Telegram', 'Email'];

const StrategyBuilder: React.FC = () => {
  // State for each section
  const [underlying, setUnderlying] = useState('NIFTY');
  const [stockSymbol, setStockSymbol] = useState('');
  const [strategyType, setStrategyType] = useState('Time-Based');
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);
  const [timeFrame, setTimeFrame] = useState('5m');
  const [startTime, setStartTime] = useState('09:15');
  const [endTime, setEndTime] = useState('15:30');
  const [entryConditions, setEntryConditions] = useState([]);
  const [action, setAction] = useState('Buy');
  const [optionType, setOptionType] = useState('Call (CE)');
  const [strikePrice, setStrikePrice] = useState('ATM');
  const [customStrike, setCustomStrike] = useState('');
  const [slType, setSlType] = useState('Points');
  const [slValue, setSlValue] = useState('');
  const [targetType, setTargetType] = useState('Points');
  const [targetValue, setTargetValue] = useState('');
  const [positionSizing, setPositionSizing] = useState('Fixed Quantity');
  const [quantity, setQuantity] = useState('');
  const [orderType, setOrderType] = useState('Market');
  const [exitConditions, setExitConditions] = useState([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 bg-white/10 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-4">Strategy Builder</h2>
      
      {/* 1. Underlying Asset Selection */}
      <div className="mb-4">
        <label className="block text-white font-semibold mb-2">Underlying Asset</label>
        <select value={underlying} onChange={e => setUnderlying(e.target.value)} className="w-full p-2 rounded">
          {UNDERLYINGS.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        {underlying === 'STOCK' && (
          <input type="text" value={stockSymbol} onChange={e => setStockSymbol(e.target.value)} placeholder="Enter Stock Symbol" className="mt-2 w-full p-2 rounded" />
        )}
      </div>
      
      {/* 2. Strategy Type Selection */}
      <div className="mb-4">
        <label className="block text-white font-semibold mb-2">Strategy Type</label>
        <div className="flex space-x-4">
          {STRATEGY_TYPES.map(type => (
            <button
              key={type}
              className={`px-4 py-2 rounded ${strategyType === type ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}
              onClick={() => setStrategyType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      
      {/* 3. Indicator Selection (for Indicator-Based strategies) */}
      {strategyType === 'Indicator-Based' && (
        <div className="mb-4">
          <label className="block text-white font-semibold mb-2">Select Indicators</label>
          {Object.entries(INDICATORS).map(([category, indicators]) => (
            <div key={category} className="mb-4">
              <h4 className="text-white font-medium mb-2">{category}</h4>
              <div className="flex flex-wrap gap-2">
                {indicators.map(indicator => (
                  <button
                    key={indicator}
                    className={`px-3 py-1 rounded text-sm ${selectedIndicators.includes(indicator) ? 'bg-green-600 text-white' : 'bg-white/20 text-white'}`}
                    onClick={() => {
                      if (selectedIndicators.includes(indicator)) {
                        setSelectedIndicators(selectedIndicators.filter(i => i !== indicator));
                      } else {
                        setSelectedIndicators([...selectedIndicators, indicator]);
                      }
                    }}
                  >
                    {indicator}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 4. Time Configuration */}
      <div className="mb-4">
        <label className="block text-white font-semibold mb-2">Time Configuration</label>
        <div className="flex space-x-4">
          <select value={timeFrame} onChange={e => setTimeFrame(e.target.value)} className="p-2 rounded">
            {TIME_FRAMES.map(tf => <option key={tf} value={tf}>{tf}</option>)}
          </select>
          <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="p-2 rounded" />
          <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="p-2 rounded" />
        </div>
      </div>
      
      {/* 5. Entry Conditions Section */}
      <div className="mb-4">
        <label className="block text-white font-semibold mb-2">Entry Conditions</label>
        <div className="bg-white/5 p-4 rounded">
          <p className="text-white/70 text-sm">Entry conditions will be configured here</p>
        </div>
      </div>
      
      {/* 6. Trade Configuration */}
      <div className="mb-4">
        <label className="block text-white font-semibold mb-2">Trade Configuration</label>
        <div className="flex space-x-4 mb-2">
          <select value={action} onChange={e => setAction(e.target.value)} className="p-2 rounded">
            {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select value={optionType} onChange={e => setOptionType(e.target.value)} className="p-2 rounded">
            {OPTION_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <select value={strikePrice} onChange={e => setStrikePrice(e.target.value)} className="p-2 rounded">
            {STRIKE_PRICES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {strikePrice === 'Custom' && (
            <input type="text" value={customStrike} onChange={e => setCustomStrike(e.target.value)} placeholder="Custom Strike" className="p-2 rounded" />
          )}
        </div>
      </div>
      
      {/* 7. Stop Loss & Target */}
      <div className="mb-4">
        <label className="block text-white font-semibold mb-2">Stop Loss & Target</label>
        <div className="flex space-x-4 mb-2">
          <select value={slType} onChange={e => setSlType(e.target.value)} className="p-2 rounded">
            {SL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input type="text" value={slValue} onChange={e => setSlValue(e.target.value)} placeholder="SL Value" className="p-2 rounded" />
          <select value={targetType} onChange={e => setTargetType(e.target.value)} className="p-2 rounded">
            {TARGET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="text" value={targetValue} onChange={e => setTargetValue(e.target.value)} placeholder="Target Value" className="p-2 rounded" />
        </div>
      </div>
      
      {/* 8. Order Settings */}
      <div className="mb-4">
        <label className="block text-white font-semibold mb-2">Order Settings</label>
        <div className="flex space-x-4 mb-2">
          <select value={positionSizing} onChange={e => setPositionSizing(e.target.value)} className="p-2 rounded">
            {POSITION_SIZING.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <input type="text" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Quantity" className="p-2 rounded" />
          <select value={orderType} onChange={e => setOrderType(e.target.value)} className="p-2 rounded">
            {ORDER_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>
      
      {/* 9. Exit Conditions (Optional) */}
      <div className="mb-4">
        <label className="block text-white font-semibold mb-2">Exit Conditions (Optional)</label>
        <div className="bg-white/5 p-4 rounded">
          <p className="text-white/70 text-sm">Exit conditions will be configured here</p>
        </div>
      </div>
      
      {/* 10. Notifications */}
      <div className="mb-4">
        <label className="block text-white font-semibold mb-2">Notifications</label>
        <div className="flex space-x-4">
          {NOTIFICATIONS.map(n => (
            <label key={n} className="flex items-center space-x-2 text-white">
              <input
                type="checkbox"
                checked={notifications.includes(n)}
                onChange={e => {
                  if (e.target.checked) setNotifications([...notifications, n]);
                  else setNotifications(notifications.filter(x => x !== n));
                }}
              />
              <span>{n}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Preview, Error, Save, Backtest, Deploy */}
      <div className="mb-4">
        <div className="bg-white/20 p-4 rounded-lg text-white mb-2">
          <strong>Strategy Preview:</strong>
          <div>{preview || 'Live strategy expression will appear here.'}</div>
        </div>
        {error && <div className="text-red-400 mb-2">{error}</div>}
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded font-semibold">Save Strategy</button>
          <button className="px-4 py-2 bg-green-600 text-white rounded font-semibold">Backtest</button>
          <button className="px-4 py-2 bg-yellow-600 text-white rounded font-semibold">Deploy</button>
        </div>
      </div>
    </div>
  );
};

export default StrategyBuilder; 