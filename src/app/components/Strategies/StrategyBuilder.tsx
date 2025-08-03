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
  const [selectedIndicators, setSelectedIndicators] = useState([]);
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
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');

  // Handlers and UI for each section will be added here

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

// ...existing code...
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
        {/* Entry condition UI will be added here */}
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
        {/* Exit condition UI will be added here */}
      </div>
      {/* 10. Final Features */}
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
        </div>
      </div>
      {/* 3. Indicator List (For Indicator-Based) */}
      {strategyType === 'Indicator-Based' && (
        <div className="mb-4">
          <label className="block text-white font-semibold mb-2">Indicators</label>
          {/* Indicator selection UI will be added here */}
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
        {/* Entry condition UI will be added here */}
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
        {/* Exit condition UI will be added here */}
      </div>
      {/* 10. Final Features */}
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
  const [selectedIndicators, setSelectedIndicators] = useState([]);
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
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');

  // Handlers and UI for each section will be added here

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
// Removed duplicate code after export
      </div>
      {/* 3. Indicator List (For Indicator-Based) */}
      {strategyType === 'Indicator-Based' && (
        <div className="mb-4">
          <label className="block text-white font-semibold mb-2">Indicators</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(INDICATORS).map(([category, indicators]) => (
              <div key={category}>
                <div className="font-bold text-blue-300 mb-1">{category}</div>
                {indicators.map(ind => (
                  <label key={ind} className="flex items-center space-x-2 text-white text-sm">
                    <input
                      type="checkbox"
                      checked={selectedIndicators.includes(ind)}
                      onChange={e => {
                        if (e.target.checked) setSelectedIndicators([...selectedIndicators, ind]);
                        else setSelectedIndicators(selectedIndicators.filter(x => x !== ind));
                      }}
                    />
                    <span>{ind}</span>
                  </label>
                ))}
              </div>
            ))}
          </div>
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
        {/* Entry condition UI will be added here */}
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
        {/* Exit condition UI will be added here */}
      </div>
      {/* 10. Final Features */}
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
'use client'

import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Settings, 
  Play, 
  Pause, 
  Save, 
  Eye,
  Code,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Target,
  Zap,
  Layers,
  Cpu,
  Database,
  Globe,
  Shield,
  Brain,
  Rocket,
  Palette,
  Activity,
  PieChart,
  LineChart,
  Settings as SettingsIcon,
  RotateCcw,
  Download,
  Upload,
  Share2,
  Star,
  Heart,
  Filter,
  Search,
  Grid,
  List,
  Maximize2,
  Minimize2,
  Move,
  GripVertical
} from 'lucide-react';

interface StrategyBlock {
  id: string;
  type: 'condition' | 'action' | 'indicator' | 'variable';
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  config: any;
  position: { x: number; y: number };
}

interface StrategyBuilderProps {
  onSave: (strategy: any) => void;
  onBack: () => void;
}

// Add connection type
type Connection = { from: string; to: string };

const StrategyBuilder: React.FC<StrategyBuilderProps> = ({ onSave, onBack }) => {
  const [blocks, setBlocks] = useState<StrategyBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  const availableBlocks = [
    {
      type: 'condition',
      title: 'Price Condition',
      description: 'Check if price meets certain criteria',
      icon: <TrendingUp size={20} />,
      color: 'from-blue-500 to-blue-600',
      config: { operator: '>', value: 0, timeframe: '1m' }
    },
    {
      type: 'indicator',
      title: 'RSI Indicator',
      description: 'Relative Strength Index',
      icon: <BarChart3 size={20} />,
      color: 'from-purple-500 to-purple-600',
      config: { period: 14, overbought: 70, oversold: 30 }
    },
    {
      type: 'indicator',
      title: 'MACD Indicator',
      description: 'Moving Average Convergence Divergence',
      icon: <LineChart size={20} />,
      color: 'from-green-500 to-green-600',
      config: { fast: 12, slow: 26, signal: 9 }
    },
    {
      type: 'action',
      title: 'Buy Action',
      description: 'Execute buy order',
      icon: <CheckCircle size={20} />,
      color: 'from-green-500 to-green-600',
      config: { quantity: 100, orderType: 'market' }
    },
    {
      type: 'action',
      title: 'Sell Action',
      description: 'Execute sell order',
      icon: <AlertTriangle size={20} />,
      color: 'from-red-500 to-red-600',
      config: { quantity: 100, orderType: 'market' }
    },
    {
      type: 'action',
      title: 'Buy CE',
      description: 'Buy Call Option (CE)',
      icon: <CheckCircle size={20} />,
      color: 'from-green-500 to-green-600',
      config: { optionType: 'CE', action: 'BUY', quantity: 1 }
    },
    {
      type: 'action',
      title: 'Sell CE',
      description: 'Sell Call Option (CE)',
      icon: <AlertTriangle size={20} />,
      color: 'from-red-500 to-red-600',
      config: { optionType: 'CE', action: 'SELL', quantity: 1 }
    },
    {
      type: 'action',
      title: 'Buy PE',
      description: 'Buy Put Option (PE)',
      icon: <CheckCircle size={20} />,
      color: 'from-green-500 to-green-600',
      config: { optionType: 'PE', action: 'BUY', quantity: 1 }
    },
    {
      type: 'action',
      title: 'Sell PE',
      description: 'Sell Put Option (PE)',
      icon: <AlertTriangle size={20} />,
      color: 'from-red-500 to-red-600',
      config: { optionType: 'PE', action: 'SELL', quantity: 1 }
    },
    {
      type: 'variable',
      title: 'Position Size',
      description: 'Calculate position size',
      icon: <DollarSign size={20} />,
      color: 'from-yellow-500 to-yellow-600',
      config: { riskPercent: 2, accountSize: 10000 }
    }
  ];

  const addBlock = (blockType: any) => {
    const newBlock: StrategyBlock = {
      id: `block-${Date.now()}`,
      type: blockType.type as 'condition' | 'action' | 'indicator' | 'variable',
      title: blockType.title,
      description: blockType.description,
      icon: blockType.icon,
      color: blockType.color,
      config: { ...blockType.config },
      position: { x: 100, y: 100 + blocks.length * 120 }
    };
    setBlocks([...blocks, newBlock]);
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(block => block.id !== id));
    if (selectedBlock === id) setSelectedBlock(null);
  };

  const updateBlockPosition = (id: string, position: { x: number; y: number }) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, position } : block
    ));
  };

  const handleDragStart = (e: React.DragEvent, block: StrategyBlock) => {
    setIsDragging(true);
    setSelectedBlock(block.id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const blockType = e.dataTransfer.getData('blockType');
    const block = availableBlocks.find(b => b.type === blockType);
    if (block) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const position = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
        const newBlock: StrategyBlock = {
          id: `block-${Date.now()}`,
          type: block.type as 'condition' | 'action' | 'indicator' | 'variable',
          title: block.title,
          description: block.description,
          icon: block.icon,
          color: block.color,
          config: { ...block.config },
          position
        };
        setBlocks([...blocks, newBlock]);
      }
    }
  };

  // Connection handlers
  const handlePortMouseDown = (blockId: string) => {
    setConnectingFrom(blockId);
  };
  const handlePortMouseUp = (blockId: string) => {
    if (connectingFrom && connectingFrom !== blockId) {
      setConnections([...connections, { from: connectingFrom, to: blockId }]);
    }
    setConnectingFrom(null);
  };

  // Logic preview generator
  function generateLogicPreview() {
    if (blocks.length === 0) return 'No strategy defined.';
    // Find root blocks (not a 'to' in any connection)
    const toSet = new Set(connections.map(c => c.to));
    const roots = blocks.filter(b => !toSet.has(b.id));
    function walk(blockId: string): string {
      const block = blocks.find(b => b.id === blockId);
      if (!block) return '';
      const next = connections.find(c => c.from === blockId)?.to;
      let desc = '';
      if (block.type === 'condition') desc = `If ${block.title}`;
      else if (block.type === 'indicator') desc = `${block.title}`;
      else if (block.type === 'action') desc = `Then ${block.title}`;
      else if (block.type === 'variable') desc = `${block.title}`;
      if (next) desc += ' → ' + walk(next);
      return desc;
    }
    return roots.map(r => walk(r.id)).join('\n');
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex flex-col">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all duration-300"
            >
              <RotateCcw size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
                <Brain size={24} className="text-blue-400" />
                <span>Visual Strategy Builder</span>
              </h1>
              <p className="text-blue-200 text-sm">Drag and drop to build your trading strategy</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`p-2 rounded-lg transition-all duration-300 flex items-center space-x-2 ${
                previewMode 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Eye size={16} />
              <span className="text-sm">Preview</span>
            </button>
            <button className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all duration-300">
              <Play size={16} />
            </button>
            <button className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2">
              <Save size={16} />
              <span>Save Strategy</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar - Available Blocks */}
        <div className="w-80 bg-white/10 backdrop-blur-2xl border-r border-white/20 p-4 overflow-y-auto shadow-xl">
          <div className="mb-8">
            <h3 className="text-lg font-extrabold text-white mb-4 flex items-center space-x-3 border-b border-blue-400/20 pb-2">
              <Layers size={22} className="text-blue-400 animate-pulse" />
              <span>Strategy Blocks</span>
            </h3>
            <div className="space-y-4">
              {availableBlocks.map((block, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('blockType', block.type);
                    e.dataTransfer.setData('blockIndex', index.toString());
                  }}
                  className="bg-gradient-to-br from-white/10 to-blue-400/10 hover:from-blue-500/20 hover:to-purple-500/20 backdrop-blur-lg rounded-2xl p-4 border border-white/20 transition-all duration-300 cursor-move group shadow-md hover:scale-105 hover:shadow-blue-400/30 flex items-center space-x-4"
                  style={{ boxShadow: '0 4px 24px 0 rgba(59,130,246,0.08)' }}
                >
                  <div className={`bg-gradient-to-r ${block.color} p-3 rounded-xl shadow-lg group-hover:animate-bounce group-hover:rotate-6 transition-all duration-300`}>
                    {block.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-base tracking-wide mb-1 group-hover:text-blue-300 transition-colors duration-200">{block.title}</h4>
                    <p className="text-blue-200 text-xs opacity-80 group-hover:opacity-100 transition-opacity">{block.description}</p>
                  </div>
                  <GripVertical size={18} className="text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>

          {/* Strategy Properties */}
          <div className="mb-8">
            <h3 className="text-lg font-extrabold text-white mb-4 flex items-center space-x-3 border-b border-purple-400/20 pb-2">
              <SettingsIcon size={22} className="text-purple-400 animate-spin-slow" />
              <span>Strategy Properties</span>
            </h3>
            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                <label className="block text-blue-200 text-sm mb-2 font-semibold">Strategy Name</label>
                <input
                  type="text"
                  className="w-full p-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  placeholder="My Strategy"
                />
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                <label className="block text-blue-200 text-sm mb-2 font-semibold">Symbol</label>
                <input
                  type="text"
                  className="w-full p-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  placeholder="NIFTY50"
                />
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                <label className="block text-blue-200 text-sm mb-2 font-semibold">Timeframe</label>
                <select className="w-full p-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none">
                  <option>1 minute</option>
                  <option>5 minutes</option>
                  <option>15 minutes</option>
                  <option>1 hour</option>
                  <option>1 day</option>
                </select>
              </div>
            </div>
          </div>

          {/* Performance Preview */}
          <div>
            <h3 className="text-lg font-extrabold text-white mb-4 flex items-center space-x-3 border-b border-green-400/20 pb-2">
              <PieChart size={22} className="text-green-400 animate-pulse" />
              <span>Performance Preview</span>
            </h3>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-blue-200 text-sm">Total Return</span>
                <span className="text-green-400 font-semibold">+15.4%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200 text-sm">Win Rate</span>
                <span className="text-blue-400 font-semibold">68%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200 text-sm">Max Drawdown</span>
                <span className="text-red-400 font-semibold">-8.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200 text-sm">Sharpe Ratio</span>
                <span className="text-yellow-400 font-semibold">1.8</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={canvasRef}
            onDrop={handleCanvasDrop}
            onDragOver={(e) => e.preventDefault()}
            className="w-full h-full bg-gradient-to-br from-slate-800/50 to-blue-900/50 relative"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)
              `
            }}
          >
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="w-full h-full" style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }} />
            </div>

            {/* SVG Connections */}
            <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
              {connections.map((conn, i) => {
                const fromBlock = blocks.find(b => b.id === conn.from);
                const toBlock = blocks.find(b => b.id === conn.to);
                if (!fromBlock || !toBlock) return null;
                return (
                  <line
                    key={i}
                    x1={fromBlock.position.x + 200}
                    y1={fromBlock.position.y + 40}
                    x2={toBlock.position.x}
                    y2={toBlock.position.y + 40}
                    stroke="#60a5fa"
                    strokeWidth="3"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })}
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#60a5fa" />
                </marker>
              </defs>
            </svg>
            {/* Strategy Blocks with ports */}
            {blocks.map((block) => (
              <div
                key={block.id}
                draggable
                onDragStart={(e) => handleDragStart(e, block)}
                onDragEnd={handleDragEnd}
                className={`absolute cursor-move transition-all duration-300 ${
                  selectedBlock === block.id ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
                }`}
                style={{
                  left: block.position.x,
                  top: block.position.y,
                  transform: isDragging && selectedBlock === block.id ? 'scale(1.05)' : 'scale(1)',
                  zIndex: 2
                }}
              >
                <div className={`bg-gradient-to-r ${block.color} backdrop-blur-lg rounded-xl p-4 border border-white/20 shadow-lg min-w-[200px] relative`}>
                  {/* Output port (right) */}
                  <div
                    className="absolute right-[-12px] top-1/2 -translate-y-1/2 w-6 h-6 bg-blue-400 rounded-full border-2 border-white cursor-crosshair z-10"
                    onMouseDown={() => handlePortMouseDown(block.id)}
                    title="Connect to..."
                  />
                  {/* Input port (left) */}
                  <div
                    className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-6 h-6 bg-green-400 rounded-full border-2 border-white cursor-crosshair z-10"
                    onMouseUp={() => handlePortMouseUp(block.id)}
                    title="Connect from..."
                  />
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {block.icon}
                      <h4 className="font-semibold text-white text-sm">{block.title}</h4>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setSelectedBlock(block.id)}
                        className="p-1 rounded bg-white/20 text-white hover:bg-white/30 transition-all duration-200"
                      >
                        <Settings size={12} />
                      </button>
                      <button
                        onClick={() => removeBlock(block.id)}
                        className="p-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-200"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <p className="text-white/80 text-xs mb-3">{block.description}</p>
                  
                  {/* Block Configuration Preview */}
                  <div className="bg-white/10 rounded-lg p-2">
                    <div className="text-xs text-white/60">
                      {block.type === 'condition' && (
                        <span>Price {block.config.operator} {block.config.value}</span>
                      )}
                      {block.type === 'indicator' && (
                        <span>{block.title} ({block.config.period || block.config.fast})</span>
                      )}
                      {block.type === 'action' && (
                        <span>{block.title} {block.config.quantity} units</span>
                      )}
                      {block.type === 'variable' && (
                        <span>Risk: {block.config.riskPercent}%</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {blocks.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="bg-white/10 backdrop-blur-lg rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                    <Plus size={32} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Start Building Your Strategy</h3>
                    <p className="text-blue-200">Drag blocks from the sidebar to create your trading strategy</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Logic Preview Panel */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[600px] bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 shadow-lg z-50">
            <h3 className="text-white text-lg font-semibold mb-2">Strategy Logic Preview</h3>
            <pre className="text-blue-200 text-sm whitespace-pre-wrap">{generateLogicPreview()}</pre>
          </div>
        </div>

        {/* Right Panel - Block Configuration */}
        {selectedBlock && (
          <div className="w-80 bg-white/5 backdrop-blur-lg border-l border-white/20 p-4 overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Settings size={20} className="text-green-400" />
                <span>Block Configuration</span>
              </h3>
              
              {selectedBlock && (
                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-3">General Settings</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-blue-200 text-sm mb-1">Name</label>
                        <input
                          type="text"
                          className="w-full p-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm"
                          defaultValue={blocks.find(b => b.id === selectedBlock)?.title}
                        />
                      </div>
                      <div>
                        <label className="block text-blue-200 text-sm mb-1">Description</label>
                        <textarea
                          className="w-full p-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm"
                          rows={2}
                          defaultValue={blocks.find(b => b.id === selectedBlock)?.description}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-3">Parameters</h4>
                    <div className="space-y-3">
                      {blocks.find(b => b.id === selectedBlock)?.type === 'condition' && (
                        <>
                          <div>
                            <label className="block text-blue-200 text-sm mb-1">Operator</label>
                            <select className="w-full p-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm">
                              <option>Greater than ({'>'})</option>
                              <option>Less than ({'<'})</option>
                              <option>Equals (=)</option>
                              <option>Crosses above</option>
                              <option>Crosses below</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-blue-200 text-sm mb-1">Value</label>
                            <input
                              type="number"
                              className="w-full p-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm"
                              defaultValue="0"
                            />
                          </div>
                        </>
                      )}
                      
                      {blocks.find(b => b.id === selectedBlock)?.type === 'indicator' && (
                        <>
                          <div>
                            <label className="block text-blue-200 text-sm mb-1">Period</label>
                            <input
                              type="number"
                              className="w-full p-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm"
                              defaultValue="14"
                            />
                          </div>
                          <div>
                            <label className="block text-blue-200 text-sm mb-1">Overbought Level</label>
                            <input
                              type="number"
                              className="w-full p-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm"
                              defaultValue="70"
                            />
                          </div>
                          <div>
                            <label className="block text-blue-200 text-sm mb-1">Oversold Level</label>
                            <input
                              type="number"
                              className="w-full p-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm"
                              defaultValue="30"
                            />
                          </div>
                        </>
                      )}

                      {blocks.find(b => b.id === selectedBlock)?.type === 'action' && (
                        <>
                          <div>
                            <label className="block text-blue-200 text-sm mb-1">Quantity</label>
                            <input
                              type="number"
                              className="w-full p-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm"
                              defaultValue="100"
                            />
                          </div>
                          <div>
                            <label className="block text-blue-200 text-sm mb-1">Order Type</label>
                            <select className="w-full p-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm">
                              <option>Market</option>
                              <option>Limit</option>
                              <option>Stop Loss</option>
                            </select>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex-1 bg-blue-500/20 text-blue-400 p-2 rounded-lg hover:bg-blue-500/30 transition-all duration-300 text-sm">
                      Apply
                    </button>
                    <button 
                      onClick={() => setSelectedBlock(null)}
                      className="flex-1 bg-white/10 text-white p-2 rounded-lg hover:bg-white/20 transition-all duration-300 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StrategyBuilder; 