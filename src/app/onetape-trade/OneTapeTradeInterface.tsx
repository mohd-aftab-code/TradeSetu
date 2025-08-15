'use client'

import { useState, useEffect } from 'react'
import { 
  Settings, 
  ChevronDown, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  RefreshCw,
  Lock,
  CheckSquare,
  Square
} from 'lucide-react'
import Sidebar from '../components/Layout/Sidebar'

const OneTapeTradeInterface: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Positions')
  const [predefinedSL, setPredefinedSL] = useState(false)
  const [predefinedTarget, setPredefinedTarget] = useState(false)
  const [selectedExchange, setSelectedExchange] = useState('NSE')
  const [selectedSegment, setSelectedSegment] = useState('Options')
  const [selectedSymbol, setSelectedSymbol] = useState('BANKNIFTY')
  const [selectedExpiry, setSelectedExpiry] = useState('28-Aug-2025')
  const [selectedCallStrike, setSelectedCallStrike] = useState('55100')
  const [selectedPutStrike, setSelectedPutStrike] = useState('55100')
  const [selectedLotSize, setSelectedLotSize] = useState('25')
  const [selectedProductType, setSelectedProductType] = useState('MIS')
  const [trailingProfit, setTrailingProfit] = useState(false)
  const [trailingStopLoss, setTrailingStopLoss] = useState(false)
  const [lockProfit, setLockProfit] = useState(false)

  const tabs = ['Positions', 'Order book', 'Trade Book', 'Holdings', 'Funds', 'Basket order', 'Refresh Data']

  // Dynamic symbols based on exchange
  const getSymbols = () => {
    if (selectedExchange === 'NSE') {
      return ['NIFTY50', 'BANKNIFTY', 'FINNIFTY', 'MIDCAPNIFTY']
    } else if (selectedExchange === 'BSE') {
      return ['SENSEX']
    }
    return ['BANKNIFTY']
  }

  // Dynamic expiry dates based on symbol
  const getExpiryDates = () => {
    if (selectedSymbol === 'NIFTY50') {
      return ['25-Aug-2025', '29-Aug-2025', '26-Sep-2025', '31-Oct-2025']
    } else if (selectedSymbol === 'BANKNIFTY') {
      return ['28-Aug-2025', '04-Sep-2025', '25-Sep-2025', '30-Oct-2025']
    } else if (selectedSymbol === 'FINNIFTY') {
      return ['28-Aug-2025', '04-Sep-2025', '25-Sep-2025', '30-Oct-2025']
    } else if (selectedSymbol === 'MIDCAPNIFTY') {
      return ['28-Aug-2025', '04-Sep-2025', '25-Sep-2025', '30-Oct-2025']
    } else if (selectedSymbol === 'SENSEX') {
      return ['28-Aug-2025', '04-Sep-2025', '25-Sep-2025', '30-Oct-2025']
    }
    return ['28-Aug-2025']
  }

  // Dynamic strike prices based on symbol
  const getStrikePrices = () => {
    if (selectedSymbol === 'NIFTY50') {
      return ['24500', '24600', '24700', '24800', '24900', '25000', '25100', '25200', '25300', '25400', '25500']
    } else if (selectedSymbol === 'BANKNIFTY') {
      return ['55000', '55050', '55100', '55150', '55200', '55250', '55300', '55350', '55400', '55450', '55500']
    } else if (selectedSymbol === 'FINNIFTY') {
      return ['20500', '20550', '20600', '20650', '20700', '20750', '20800', '20850', '20900', '20950', '21000']
    } else if (selectedSymbol === 'MIDCAPNIFTY') {
      return ['12500', '12550', '12600', '12650', '12700', '12750', '12800', '12850', '12900', '12950', '13000']
    } else if (selectedSymbol === 'SENSEX') {
      return ['75000', '75100', '75200', '75300', '75400', '75500', '75600', '75700', '75800', '75900', '76000']
    }
    return ['55100']
  }

  // Dynamic lot sizes based on symbol
  const getLotSizes = () => {
    if (selectedSymbol === 'NIFTY50') {
      return ['75']
    } else if (selectedSymbol === 'BANKNIFTY') {
      return ['35']
    } else if (selectedSymbol === 'FINNIFTY') {
      return ['65']
    } else if (selectedSymbol === 'MIDCAPNIFTY') {
      return ['120']
    } else if (selectedSymbol === 'SENSEX') {
      return ['20']
    }
    return ['25']
  }

  // Update symbol when exchange changes
  useEffect(() => {
    const symbols = getSymbols()
    if (!symbols.includes(selectedSymbol)) {
      setSelectedSymbol(symbols[0])
    }
  }, [selectedExchange])

  // Update expiry when symbol changes
  useEffect(() => {
    const expiryDates = getExpiryDates()
    if (!expiryDates.includes(selectedExpiry)) {
      setSelectedExpiry(expiryDates[0])
    }
  }, [selectedSymbol])

  // Update strike prices when symbol changes
  useEffect(() => {
    const strikePrices = getStrikePrices()
    if (!strikePrices.includes(selectedCallStrike)) {
      setSelectedCallStrike(strikePrices[0])
    }
    if (!strikePrices.includes(selectedPutStrike)) {
      setSelectedPutStrike(strikePrices[0])
    }
  }, [selectedSymbol])

  // Update lot size when symbol changes
  useEffect(() => {
    const lotSizes = getLotSizes()
    if (!lotSizes.includes(selectedLotSize)) {
      setSelectedLotSize(lotSizes[0]) // First lot size
    }
  }, [selectedSymbol])

  return (
    <>
      <style jsx>{`
        /* Custom Scrollbar for all elements */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(51, 65, 85, 0.95));
          border-radius: 10px;
          border: 1px solid rgba(139, 92, 246, 0.4);
          box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3);
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #8b5cf6, #3b82f6, #06b6d4);
          border-radius: 10px;
          border: 1px solid rgba(139, 92, 246, 0.5);
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.3);
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #7c3aed, #2563eb, #0891b2);
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.5);
        }
        
        ::-webkit-scrollbar-corner {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 58, 138, 0.9));
        }
        
        /* Firefox scrollbar */
        * {
          scrollbar-width: thin;
          scrollbar-color: #8b5cf6 rgba(15, 23, 42, 0.8);
        }
        
        /* Custom scrollbar for specific elements */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(51, 65, 85, 0.95));
          border-radius: 10px;
          border: 1px solid rgba(139, 92, 246, 0.4);
          box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #8b5cf6, #3b82f6, #06b6d4);
          border-radius: 10px;
          border: 1px solid rgba(139, 92, 246, 0.5);
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.3);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #7c3aed, #2563eb, #0891b2);
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.5);
        }
        
        /* Remove purple highlight from select options */
        select option {
          background-color: #10b981 !important;
          color: white !important;
        }
        
        select option:checked {
          background-color: #059669 !important;
          color: white !important;
        }
        
        select option:hover {
          background-color: #047857 !important;
          color: white !important;
        }
        
        select:focus option:checked {
          background-color: #059669 !important;
          color: white !important;
        }
        
        /* Ensure dropdown is visible and clickable */
        select {
          cursor: pointer !important;
        }
        
        select:focus {
          outline: none !important;
          border-color: #8b5cf6 !important;
        }
        
        /* Make sure dropdown list is visible */
        select option {
          display: block !important;
          padding: 8px !important;
        }
      `}</style>
      
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
        <div className="hidden md:block fixed left-0 top-0 h-full z-10">
          <Sidebar activeTab="onetape-trade" onTabChange={() => {}} />
        </div>
        <div className="flex-1 flex min-w-0 md:ml-64">
          <div className="flex-1 flex flex-col min-w-0">
            <main className="flex-1 p-1 lg:p-2 space-y-1 lg:space-y-2 md:ml-0 overflow-x-hidden">
              {/* Top Control Panel */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 border border-white/20">
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                  <div></div>
                  <div className="text-purple-200 text-sm">13-08-2025 / 23:29:14</div>
                </div>

                {/* Order Parameters Grid - 3 Rows as per image */}
                <div className="space-y-3">
                  {/* Row 1: Exchange, Segment, Symbol, Expiry Date, Call Strike, Put Strike */}
                  <div className="grid grid-cols-6 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-purple-200 mb-1">Exchange</label>
                      <div className="relative">
                        <select 
                          value={selectedExchange}
                          onChange={(e) => setSelectedExchange(e.target.value)}
                          className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white appearance-none text-sm"
                        >
                          <option value="NSE">NSE</option>
                          <option value="BSE">BSE</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-300" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">Segment</label>
                      <div className="relative">
                        <select 
                          value={selectedSegment}
                          onChange={(e) => setSelectedSegment(e.target.value)}
                          className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white appearance-none text-sm"
                        >
                          <option value="Options">Options</option>
                          <option value="Future">Future</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-300" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">Symbol</label>
                      <div className="relative">
                        <select 
                          value={selectedSymbol}
                          onChange={(e) => setSelectedSymbol(e.target.value)}
                          className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white appearance-none text-sm"
                        >
                          {getSymbols().map((symbol) => (
                            <option key={symbol} value={symbol}>{symbol}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-300" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">Expiry Date</label>
                      <div className="relative">
                        <select 
                          value={selectedExpiry}
                          onChange={(e) => setSelectedExpiry(e.target.value)}
                          className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white appearance-none text-sm"
                        >
                          {getExpiryDates().map((expiry) => (
                            <option key={expiry} value={expiry}>{expiry}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-300" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">Call Strike</label>
                      <div className="relative">
                        <select 
                          value={selectedCallStrike}
                          onChange={(e) => setSelectedCallStrike(e.target.value)}
                          className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white appearance-none text-sm"
                        >
                          {getStrikePrices().map((strike) => (
                            <option key={strike} value={strike}>{strike}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-300" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">Put Strike</label>
                      <div className="relative">
                        <select 
                          value={selectedPutStrike}
                          onChange={(e) => setSelectedPutStrike(e.target.value)}
                          className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white appearance-none text-sm"
                        >
                          {getStrikePrices().map((strike) => (
                            <option key={strike} value={strike}>{strike}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-300" />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Lot Size, Product Type, Order Type, Qty, Market Protection, Predefined SL */}
                  <div className="grid grid-cols-6 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">Qty (In Lot: {selectedLotSize})</label>
                      <input
                        type="text"
                        placeholder="Enter quantity"
                        className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">Product Type</label>
                      <div className="relative">
                        <select 
                          value={selectedProductType}
                          onChange={(e) => setSelectedProductType(e.target.value)}
                          className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white appearance-none text-sm"
                        >
                          <option value="MIS">MIS</option>
                          <option value="CNC">CNC</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-300" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">Order Type</label>
                      <div className="relative">
                        <select className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white appearance-none text-sm">
                          <option value="MARKET">Market Order</option>
                          <option value="LIMIT">Limit Order</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-300" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">Market Protection %</label>
                      <input
                        type="text"
                        placeholder="Enter %"
                        className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">Predefined SL</label>
                      <input
                        type="text"
                        placeholder="Enter SL"
                        className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">Predefined Target</label>
                      <input
                        type="text"
                        placeholder="Enter target"
                        className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                      />
                    </div>
                  </div>

                  {/* Row 3: Position Type, Position View, Trailing Profit, Trailing Stop Loss, Lock Profit */}
                  <div className="grid grid-cols-6 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">Position Type</label>
                      <div className="relative">
                        <select className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white appearance-none text-sm">
                          <option value="DAY">Day</option>
                          <option value="CARRY">Carry</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-300" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">Position View</label>
                      <div className="relative">
                        <select className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white appearance-none text-sm">
                          <option value="NET">Net</option>
                          <option value="BUY">Buy</option>
                          <option value="SELL">Sell</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-300" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">Trailing Profit</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setTrailingProfit(!trailingProfit)}
                          className="p-1 bg-white/10 border border-white/20 rounded text-purple-300 hover:bg-white/20 transition-colors"
                        >
                          {trailingProfit ? <CheckSquare size={12} /> : <Square size={12} />}
                        </button>
                        <input
                          type="text"
                          placeholder="X"
                          className="flex-1 p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                        />
                        <input
                          type="text"
                          placeholder="Y"
                          className="flex-1 p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">Trailing Stop Loss</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setTrailingStopLoss(!trailingStopLoss)}
                          className="p-1 bg-white/10 border border-white/20 rounded text-purple-300 hover:bg-white/20 transition-colors"
                        >
                          {trailingStopLoss ? <CheckSquare size={12} /> : <Square size={12} />}
                        </button>
                        <input
                          type="text"
                          placeholder="X"
                          className="flex-1 p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                        />
                        <input
                          type="text"
                          placeholder="Y"
                          className="flex-1 p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">Lock Profit</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setLockProfit(!lockProfit)}
                          className="p-1 bg-white/10 border border-white/20 rounded text-purple-300 hover:bg-white/20 transition-colors"
                        >
                          {lockProfit ? <CheckSquare size={12} /> : <Square size={12} />}
                        </button>
                        <input
                          type="text"
                          placeholder="X"
                          className="flex-1 p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                        />
                        <input
                          type="text"
                          placeholder="Y"
                          className="flex-1 p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                        />
                      </div>
                    </div>

                    <div></div> {/* Empty div for spacing */}
                  </div>

                  {/* Row 4: Maximum Loss and Maximum Profit */}
                  <div className="grid grid-cols-6 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">Maximum Loss</label>
                      <input
                        type="text"
                        placeholder="Enter max loss"
                        className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">Maximum Profit</label>
                      <input
                        type="text"
                        placeholder="Enter max profit"
                        className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                      />
                    </div>
                    <div></div> {/* Empty div for spacing */}
                    <div></div> {/* Empty div for spacing */}
                    <div></div> {/* Empty div for spacing */}
                    <div></div> {/* Empty div for spacing */}
                  </div>
                </div>
              </div>

              {/* Central Trading Area */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Call Options Column */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 border border-white/20">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-white">{selectedSymbol} 250828 {selectedCallStrike} CE</h3>
                    <div className="flex justify-between text-sm text-purple-200 mt-2">
                      <span>L: 621.55</span>
                      <span>748.95 :H</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                  
                  <div className="text-center mb-6">
                    <p className="text-lg font-bold text-green-400">LTP: 687.40</p>
                    <p className="text-sm text-green-400">(42.60 / 6.61%)</p>
                  </div>

                  <div className="space-y-3">
                    <button className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center">
                      <ArrowLeft size={20} className="mr-2" />
                      Sell Call
                      <ChevronDown size={16} className="ml-2" />
                    </button>
                    <button className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center">
                      <ArrowUp size={20} className="mr-2" />
                      Buy Call
                      <ChevronDown size={16} className="ml-2" />
                    </button>
                  </div>
                </div>

                {/* Index Column */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 border border-white/20">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-white">{selectedSymbol}</h3>
                    <div className="flex justify-between text-sm text-purple-200 mt-2">
                      <span>L: 55026.95</span>
                      <span>55340.05 :O=H</span>
                      <span>L: 315.1</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  
                  <div className="text-center mb-6">
                    <p className="text-lg font-bold text-white">LTP: 55181.45</p>
                    <p className="text-sm text-gray-400">(0.00/0.00%)</p>
                  </div>

                  <div className="space-y-3">
                    <button className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors">
                      Close Trade
                    </button>
                    <div className="flex justify-center">
                      <button className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors">
                        <RefreshCw size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-white/5 rounded-lg">
                    <p className="text-sm text-purple-200">Message: -</p>
                  </div>
                </div>

                {/* Put Options Column */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 border border-white/20">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-white">{selectedSymbol} 250828 {selectedPutStrike} PE</h3>
                    <div className="flex justify-between text-sm text-purple-200 mt-2">
                      <span></span>
                      <span>445 :H</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                  </div>
                  
                  <div className="text-center mb-6">
                    <p className="text-lg font-bold text-red-400">LTP: 353.20</p>
                    <p className="text-sm text-red-400">(-91.95 / -20.66%)</p>
                  </div>

                  <div className="space-y-3">
                    <button className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center">
                      <ArrowDown size={20} className="mr-2" />
                      Buy Put
                      <ChevronDown size={16} className="ml-2" />
                    </button>
                    <button className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center">
                      <ArrowRight size={20} className="mr-2" />
                      Sell Put
                      <ChevronDown size={16} className="ml-2" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Tabs */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 border border-white/20">
                <div className="flex space-x-4 mb-4">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab
                          ? 'bg-purple-500 text-white'
                          : 'text-purple-200 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                
                <div className="bg-white/5 rounded-lg p-4 min-h-[200px]">
                  <p className="text-purple-200 text-sm">Content for {activeTab} tab will be displayed here...</p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  )
}

export default OneTapeTradeInterface
