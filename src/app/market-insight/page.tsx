'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Activity, 
  Target, 
  AlertTriangle,
  Calendar,
  Clock,
  DollarSign,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Share2,
  Bookmark,
  RefreshCw,
  Search,
  X
} from 'lucide-react';
import Sidebar from '../components/Layout/Sidebar';

const MarketInsight: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [selectedIndex, setSelectedIndex] = useState('NIFTY');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const timeframes = ['1H', '4H', '1D', '1W', '1M'];
  const indices = ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'SENSEX', 'MIDCAP'];

  const marketData = {
    nifty: {
      current: 21567.45,
      change: 125.30,
      changePercent: 0.58,
      high: 21650.20,
      low: 21450.80,
      volume: '2.5M',
      open: 21442.15
    },
    banknifty: {
      current: 46892.80,
      change: -89.20,
      changePercent: -0.19,
      high: 47200.50,
      low: 46750.30,
      volume: '1.8M',
      open: 46982.00
    }
  };

  const technicalIndicators = [
    { name: 'RSI', value: '65', status: 'neutral', trend: 'sideways' },
    { name: 'MACD', value: 'Bullish', status: 'positive', trend: 'up' },
    { name: 'Bollinger Bands', value: 'Upper', status: 'positive', trend: 'up' },
    { name: 'Stochastic', value: '75', status: 'positive', trend: 'up' },
    { name: 'VWAP', value: '21550', status: 'positive', trend: 'up' },
    { name: 'Supertrend', value: 'Bullish', status: 'positive', trend: 'up' }
  ];

  const marketNews = [
    {
      title: 'Nifty hits new all-time high as global markets rally',
      time: '2 min ago',
      impact: 'positive',
      source: 'Economic Times'
    },
    {
      title: 'RBI maintains repo rate at 6.5% for fifth consecutive time',
      time: '15 min ago',
      impact: 'neutral',
      source: 'Business Standard'
    },
    {
      title: 'Global markets rally on Fed rate cut expectations',
      time: '1 hour ago',
      impact: 'positive',
      source: 'Reuters'
    },
    {
      title: 'Oil prices surge 3% on supply concerns',
      time: '2 hours ago',
      impact: 'negative',
      source: 'Bloomberg'
    },
    {
      title: 'IT stocks gain on strong quarterly results',
      time: '3 hours ago',
      impact: 'positive',
      source: 'Money Control'
    }
  ];

  const topGainers = [
    { symbol: 'RELIANCE', change: '+3.2%', price: '₹2,456', volume: '1.2M' },
    { symbol: 'TCS', change: '+2.8%', price: '₹3,890', volume: '890K' },
    { symbol: 'INFY', change: '+2.1%', price: '₹1,567', volume: '1.1M' },
    { symbol: 'HDFCBANK', change: '+1.9%', price: '₹1,678', volume: '2.1M' },
    { symbol: 'ICICIBANK', change: '+1.7%', price: '₹987', volume: '1.8M' }
  ];

  const topLosers = [
    { symbol: 'HDFC', change: '-2.1%', price: '₹1,678', volume: '750K' },
    { symbol: 'AXISBANK', change: '-1.8%', price: '₹1,123', volume: '1.3M' },
    { symbol: 'WIPRO', change: '-1.5%', price: '₹456', volume: '950K' },
    { symbol: 'TECHM', change: '-1.3%', price: '₹1,234', volume: '680K' },
    { symbol: 'ULTRACEMCO', change: '-1.1%', price: '₹8,567', volume: '420K' }
  ];

     const sectorPerformance = [
     { sector: 'IT', change: '+2.5%', status: 'positive' },
     { sector: 'Banking', change: '+1.8%', status: 'positive' },
     { sector: 'Auto', change: '+1.2%', status: 'positive' },
     { sector: 'Pharma', change: '-0.8%', status: 'negative' },
     { sector: 'Realty', change: '-1.2%', status: 'negative' },
     { sector: 'Metal', change: '+0.5%', status: 'positive' },
     { sector: 'Energy', change: '+1.9%', status: 'positive' },
     { sector: 'FMCG', change: '+0.3%', status: 'positive' },
     { sector: 'Consumer Durables', change: '+1.1%', status: 'positive' },
     { sector: 'Telecom', change: '-0.4%', status: 'negative' },
     { sector: 'Healthcare', change: '-0.2%', status: 'negative' },
     { sector: 'Oil & Gas', change: '+2.1%', status: 'positive' },
     { sector: 'Power', change: '+0.9%', status: 'positive' },
     { sector: 'Infrastructure', change: '+1.4%', status: 'positive' },
     { sector: 'Capital Goods', change: '+0.8%', status: 'positive' },
     { sector: 'Chemicals', change: '+1.6%', status: 'positive' },
     { sector: 'Media', change: '+0.7%', status: 'positive' },
     { sector: 'Retail', change: '+0.9%', status: 'positive' },
     { sector: 'Fintech', change: '+1.7%', status: 'positive' },
     { sector: 'Renewable Energy', change: '+2.8%', status: 'positive' }
   ];

       const oiSpurts = [
      { symbol: 'RELIANCE', oiChange: '+45.2%', price: '₹2,456', volume: '1.2M', strike: '2400 CE' },
      { symbol: 'TCS', oiChange: '+38.7%', price: '₹3,890', volume: '890K', strike: '3900 PE' },
      { symbol: 'INFY', oiChange: '+32.1%', price: '₹1,567', volume: '1.1M', strike: '1600 CE' },
      { symbol: 'HDFCBANK', oiChange: '+28.9%', price: '₹1,678', volume: '2.1M', strike: '1700 PE' },
      { symbol: 'ICICIBANK', oiChange: '+25.4%', price: '₹987', volume: '1.8M', strike: '1000 CE' }
    ];

    const topOiGainers = [
      { symbol: 'RELIANCE', oiChange: '+67.3%', price: '₹2,456', volume: '2.1M', strike: '2400 CE', oiValue: '12.5L' },
      { symbol: 'TCS', oiChange: '+54.8%', price: '₹3,890', volume: '1.5M', strike: '3900 PE', oiValue: '8.9L' },
      { symbol: 'INFY', oiChange: '+48.2%', price: '₹1,567', volume: '1.8M', strike: '1600 CE', oiValue: '15.2L' },
      { symbol: 'HDFCBANK', oiChange: '+42.7%', price: '₹1,678', volume: '3.2M', strike: '1700 PE', oiValue: '22.1L' },
      { symbol: 'ICICIBANK', oiChange: '+39.1%', price: '₹987', volume: '2.8M', strike: '1000 CE', oiValue: '18.7L' }
    ];

      const topOiLosers = [
    { symbol: 'HDFC', oiChange: '-52.4%', price: '₹1,678', volume: '950K', strike: '1700 CE', oiValue: '5.2L' },
    { symbol: 'AXISBANK', oiChange: '-45.8%', price: '₹1,123', volume: '1.1M', strike: '1150 PE', oiValue: '7.8L' },
    { symbol: 'WIPRO', oiChange: '-38.9%', price: '₹456', volume: '680K', strike: '460 CE', oiValue: '3.4L' },
    { symbol: 'TECHM', oiChange: '-34.2%', price: '₹1,234', volume: '890K', strike: '1250 PE', oiValue: '6.1L' },
    { symbol: 'ULTRACEMCO', oiChange: '-29.7%', price: '₹8,567', volume: '420K', strike: '8600 CE', oiValue: '2.9L' }
  ];

  // Searchable instruments data
  const searchableInstruments = [
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', type: 'Stock', exchange: 'NSE' },
    { symbol: 'TCS', name: 'Tata Consultancy Services Ltd', type: 'Stock', exchange: 'NSE' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', type: 'Stock', exchange: 'NSE' },
    { symbol: 'INFY', name: 'Infosys Ltd', type: 'Stock', exchange: 'NSE' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', type: 'Stock', exchange: 'NSE' },
    { symbol: 'NIFTY', name: 'NIFTY 50 Index', type: 'Index', exchange: 'NSE' },
    { symbol: 'BANKNIFTY', name: 'Bank Nifty Index', type: 'Index', exchange: 'NSE' },
    { symbol: 'FINNIFTY', name: 'Financial Services Nifty', type: 'Index', exchange: 'NSE' },
    { symbol: 'SENSEX', name: 'BSE Sensex', type: 'Index', exchange: 'BSE' },
    { symbol: 'NIFTY 21500 CE', name: 'NIFTY 21500 Call Option', type: 'Option', exchange: 'NSE' },
    { symbol: 'NIFTY 21500 PE', name: 'NIFTY 21500 Put Option', type: 'Option', exchange: 'NSE' },
    { symbol: 'BANKNIFTY 47000 CE', name: 'BANKNIFTY 47000 Call Option', type: 'Option', exchange: 'NSE' },
    { symbol: 'BANKNIFTY 47000 PE', name: 'BANKNIFTY 47000 Put Option', type: 'Option', exchange: 'NSE' }
  ];

  // Filter instruments based on search query
  const filteredInstruments = searchableInstruments.filter(instrument =>
    instrument.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    instrument.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Search functions
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowSearchResults(query.length > 0);
  };

  const handleInstrumentSelect = (instrument: any) => {
    console.log('Selected instrument:', instrument);
    setSearchQuery('');
    setShowSearchResults(false);
    setShowSearchInput(false);
    // Here you would typically navigate to the chart or open it
  };

  const toggleSearchInput = () => {
    setShowSearchInput(!showSearchInput);
    if (!showSearchInput) {
      setSearchQuery('');
      setShowSearchResults(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #3b82f6, #8b5cf6);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #2563eb, #7c3aed);
        }
      `}</style>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      <div className="hidden md:block fixed left-0 top-0 h-full z-10">
        <Sidebar activeTab="market-insight" onTabChange={() => {}} />
      </div>
      
      <div className="flex-1 flex min-w-0 md:ml-64">
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="bg-gradient-to-br from-slate-800 via-blue-900 to-purple-800 p-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <BarChart3 className="text-purple-400" size={32} />
                  Market Insight
                </h1>
                <p className="text-blue-200 mt-2">Comprehensive market analysis and technical indicators</p>
              </div>
              <div className="flex items-center gap-4">
                {/* Search Button/Input */}
                <div className="relative">
                  {showSearchInput ? (
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="text"
                          placeholder="Search instruments..."
                          value={searchQuery}
                          onChange={(e) => handleSearch(e.target.value)}
                          className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 w-64"
                          autoFocus
                        />
                        <button
                          onClick={() => setShowSearchInput(false)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      
                      {/* Search Results Dropdown */}
                      {showSearchResults && filteredInstruments.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-white/20 rounded-lg shadow-2xl z-50 max-h-80 overflow-y-auto custom-scrollbar">
                          {filteredInstruments.map((instrument, index) => (
                            <div
                              key={index}
                              onClick={() => handleInstrumentSelect(instrument)}
                              className="flex items-center justify-between p-3 hover:bg-white/10 cursor-pointer transition-colors duration-200 border-b border-white/10 last:border-b-0"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex flex-col">
                                  <span className="text-white font-semibold">{instrument.symbol}</span>
                                  <span className="text-gray-400 text-sm">{instrument.name}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  instrument.type === 'Stock' ? 'bg-blue-500/20 text-blue-300' :
                                  instrument.type === 'Index' ? 'bg-green-500/20 text-green-300' :
                                  'bg-purple-500/20 text-purple-300'
                                }`}>
                                  {instrument.type}
                                </span>
                                <span className="text-gray-500 text-xs">{instrument.exchange}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {showSearchResults && filteredInstruments.length === 0 && searchQuery.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-white/20 rounded-lg shadow-2xl z-50 p-4">
                          <p className="text-gray-400 text-center">No instruments found for "{searchQuery}"</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={toggleSearchInput}
                      className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-all duration-300"
                      title="Search instruments"
                    >
                      <Search size={16} />
                    </button>
                  )}
                </div>
                
                              <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300">
                <RefreshCw size={16} />
                Refresh
              </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 space-y-6">
            {/* Market Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* NIFTY Card */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">NIFTY 50</h3>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-green-400" size={20} />
                    <span className="text-green-400 font-bold">+0.58%</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-3xl font-bold text-white">₹21,567.45</div>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-blue-300">Change:</span>
                      <span className="text-green-400 font-bold ml-1">+125.30</span>
                    </div>
                    <div>
                      <span className="text-blue-300">Volume:</span>
                      <span className="text-white font-bold ml-1">2.5M</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-300">High:</span>
                      <span className="text-white font-bold ml-1">₹21,650</span>
                    </div>
                    <div>
                      <span className="text-blue-300">Low:</span>
                      <span className="text-white font-bold ml-1">₹21,451</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BANKNIFTY Card */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">BANK NIFTY</h3>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="text-red-400" size={20} />
                    <span className="text-red-400 font-bold">-0.19%</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-3xl font-bold text-white">₹46,892.80</div>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-blue-300">Change:</span>
                      <span className="text-red-400 font-bold ml-1">-89.20</span>
                    </div>
                    <div>
                      <span className="text-blue-300">Volume:</span>
                      <span className="text-white font-bold ml-1">1.8M</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-300">High:</span>
                      <span className="text-white font-bold ml-1">₹47,201</span>
                    </div>
                    <div>
                      <span className="text-blue-300">Low:</span>
                      <span className="text-white font-bold ml-1">₹46,750</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Market Sentiment */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300">
                <h3 className="text-xl font-bold text-white mb-4">Market Sentiment</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-300">Bullish</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div className="w-16 h-full bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-green-400 font-bold text-sm">75%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-300">Neutral</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div className="w-4 h-full bg-yellow-500 rounded-full"></div>
                      </div>
                      <span className="text-yellow-400 font-bold text-sm">20%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-300">Bearish</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div className="w-1 h-full bg-red-500 rounded-full"></div>
                      </div>
                      <span className="text-red-400 font-bold text-sm">5%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            

                         {/* Top Gainers & Losers */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* Top Gainers */}
               <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-6 border border-white/20">
                 <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                   <TrendingUp className="text-green-400" size={24} />
                   Top Gainers
                 </h3>
                 <div className="space-y-3">
                   {topGainers.map((stock, index) => (
                     <div key={index} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                       <div className="flex items-center gap-3">
                         <span className="text-white font-semibold">{stock.symbol}</span>
                         <span className="text-blue-300 text-sm">Vol: {stock.volume}</span>
                       </div>
                       <div className="text-right">
                         <div className="text-green-400 font-bold">{stock.change}</div>
                         <div className="text-white text-sm">{stock.price}</div>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>

               {/* Top Losers */}
               <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-6 border border-white/20">
                 <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                   <TrendingDown className="text-red-400" size={24} />
                   Top Losers
                 </h3>
                 <div className="space-y-3">
                   {topLosers.map((stock, index) => (
                     <div key={index} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                       <div className="flex items-center gap-3">
                         <span className="text-white font-semibold">{stock.symbol}</span>
                         <span className="text-blue-300 text-sm">Vol: {stock.volume}</span>
                       </div>
                       <div className="text-right">
                         <div className="text-red-400 font-bold">{stock.change}</div>
                         <div className="text-white text-sm">{stock.price}</div>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             </div>

                           {/* OI Data Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top OI Gainers */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <TrendingUp className="text-green-400" size={24} />
                    Top OI Gainers
                  </h3>
                  <div className="space-y-3">
                    {topOiGainers.map((stock, index) => (
                      <div key={index} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-white font-semibold">{stock.symbol}</span>
                          <span className="text-green-300 text-sm">{stock.strike}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-green-400 font-bold">{stock.oiChange}</div>
                            <div className="text-white text-sm">{stock.price}</div>
                          </div>
                          <div className="text-right">
                            <span className="text-blue-300 text-sm">Vol: {stock.volume}</span>
                            <div className="text-green-300 text-xs">OI: {stock.oiValue}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top OI Losers */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <TrendingDown className="text-red-400" size={24} />
                    Top OI Losers
                  </h3>
                  <div className="space-y-3">
                    {topOiLosers.map((stock, index) => (
                      <div key={index} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-white font-semibold">{stock.symbol}</span>
                          <span className="text-red-300 text-sm">{stock.strike}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-red-400 font-bold">{stock.oiChange}</div>
                            <div className="text-white text-sm">{stock.price}</div>
                          </div>
                          <div className="text-right">
                            <span className="text-blue-300 text-sm">Vol: {stock.volume}</span>
                            <div className="text-red-300 text-xs">OI: {stock.oiValue}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* OI Spurts */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Activity className="text-purple-400" size={24} />
                    OI Spurts
                  </h3>
                  <div className="space-y-3">
                    {oiSpurts.map((stock, index) => (
                      <div key={index} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-white font-semibold">{stock.symbol}</span>
                          <span className="text-purple-300 text-sm">{stock.strike}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-purple-400 font-bold">{stock.oiChange}</div>
                            <div className="text-white text-sm">{stock.price}</div>
                          </div>
                          <span className="text-blue-300 text-sm">Vol: {stock.volume}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            {/* Sector Performance */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6">Sector Performance</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {sectorPerformance.map((sector, index) => (
                  <div key={index} className="bg-white/5 p-4 rounded-lg text-center">
                    <div className="text-white font-semibold mb-2">{sector.sector}</div>
                    <div className={`text-lg font-bold ${
                      sector.status === 'positive' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {sector.change}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
                 </div>
       </div>
     </div>
     </>
   );
};

export default MarketInsight; 