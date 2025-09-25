'use client';

import React, { useState, useEffect } from 'react';
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
  X,
  Zap,
  TrendingUpIcon,
  TrendingDownIcon
} from 'lucide-react';
import Sidebar from '../components/Layout/Sidebar';



const MarketInsight: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [selectedIndex, setSelectedIndex] = useState('NIFTY');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  
  // Enhanced market data state
  const [marketData, setMarketData] = useState<any[]>([]);
  const [indices, setIndices] = useState<any[]>([]);
  const [stocks, setStocks] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [isLoadingMarketData, setIsLoadingMarketData] = useState(true);
  const [dataSource, setDataSource] = useState<string>('Loading...');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());


  const timeframes = ['1H', '4H', '1D', '1W', '1M'];
  const indicesList = ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'SENSEX', 'MIDCAP'];

  // Fetch comprehensive market data
  const fetchMarketData = async () => {
    try {
      setIsLoadingMarketData(true);
      const response = await fetch('/api/users/market-data');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setMarketData(data.data);
          setIndices(data.indices || []);
          setStocks(data.stocks || []);
          setOptions(data.options || []);
          setSectors(data.sectors || []);
          setDataSource(data.source || 'Unknown');
          setLastUpdated(new Date());
        } else {
          setMarketData([]);
          setDataSource('Mock data (fallback)');
        }
      } else {
        setMarketData([]);
        setDataSource('Mock data (fallback)');
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
      setMarketData([]);
      setDataSource('Mock data (fallback)');
    } finally {
      setIsLoadingMarketData(false);
    }
  };

  // Auto-refresh market data every 30 seconds
  useEffect(() => {
    fetchMarketData();
    
    const interval = setInterval(fetchMarketData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Add error handling for empty sectors
  const validSectors = sectors.filter(sector => sector && sector.price > 0);

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
  };

  const toggleSearchInput = () => {
    setShowSearchInput(!showSearchInput);
    if (!showSearchInput) {
      setSearchQuery('');
      setShowSearchResults(false);
    }
  };

  // Helper functions for data processing
  const getNiftyData = () => indices.find(item => item.symbol === 'NIFTY50') || {};
  const getBankNiftyData = () => indices.find(item => item.symbol === 'BANKNIFTY') || {};
  const getSensexData = () => indices.find(item => item.symbol === 'SENSEX') || {};

  // Get top gainers and losers from sectors (not stocks)
  const topGainers = validSectors
    .filter(item => item.change > 0)
    .sort((a, b) => b.change_percent - a.change_percent)
    .slice(0, 5);

  const topLosers = validSectors
    .filter(item => item.change < 0)
    .sort((a, b) => a.change_percent - b.change_percent)
    .slice(0, 5);

  // Get OI data
  const topOiGainers = options
    .filter(item => item.oiChange > 0)
    .sort((a, b) => b.oiChange - a.oiChange)
    .slice(0, 5);

  const topOiLosers = options
    .filter(item => item.oiChange < 0)
    .sort((a, b) => a.oiChange - b.oiChange)
    .slice(0, 5);

  const oiSpurts = options
    .filter(item => Math.abs(item.oiChange) > 100000)
    .sort((a, b) => Math.abs(b.oiChange) - Math.abs(a.oiChange))
    .slice(0, 5);

  // Get sector performance (direct from sectors array)
  const sectorPerformance = validSectors.map(sector => ({
    sector: sector.symbol,
    change: sector.change_percent,
    status: sector.change_percent >= 0 ? 'positive' : 'negative'
  }));

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
                  {/* Market Data Status */}
                  <div className="flex items-center gap-3">
                    {isLoadingMarketData && (
                      <div className="flex items-center gap-2 text-blue-300 text-sm">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <span>Live</span>
                      </div>
                    )}
                    <div className="text-xs text-blue-300 bg-white/5 px-2 py-1 rounded">
                      {dataSource}
                    </div>
                    <button
                      onClick={fetchMarketData}
                      disabled={isLoadingMarketData}
                      className="p-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-300 hover:text-blue-200 transition-colors disabled:opacity-50"
                      title="Refresh market data"
                    >
                      <RefreshCw size={16} className={isLoadingMarketData ? 'animate-spin' : ''} />
                    </button>
                    <span className="text-xs text-blue-300 bg-white/5 px-2 py-1 rounded">
                      {lastUpdated.toLocaleTimeString()}
                    </span>
                  </div>

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
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 space-y-6">
              {/* Market Overview - Indices */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* NIFTY Card */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">NIFTY 50</h3>
                  <div className="flex items-center gap-2">
                      {isLoadingMarketData ? (
                        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          {getNiftyData().change >= 0 ? (
                    <TrendingUp className="text-green-400" size={20} />
                          ) : (
                            <TrendingDown className="text-red-400" size={20} />
                          )}
                          <span className={`font-bold ${
                            getNiftyData().change >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {getNiftyData().change_percent?.toFixed(2) || '0.00'}%
                          </span>
                        </>
                      )}
                  </div>
                </div>
                <div className="space-y-3">
                    <div className="text-3xl font-bold text-white">
                      {isLoadingMarketData ? (
                        <div className="h-8 bg-white/20 rounded animate-pulse"></div>
                      ) : (
                        `₹${getNiftyData().price?.toLocaleString() || '0'}`
                      )}
                    </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-blue-300">Change:</span>
                        <span className={`font-bold ml-1 ${
                          getNiftyData().change >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {getNiftyData().change >= 0 ? '+' : ''}
                          {getNiftyData().change?.toFixed(2) || '0.00'}
                        </span>
                    </div>
                    <div>
                      <span className="text-blue-300">Volume:</span>
                        <span className="text-white font-bold ml-1">
                          {getNiftyData().volume ? 
                            `${(getNiftyData().volume / 1000000).toFixed(1)}M` : 
                            '0M'
                          }
                        </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-300">High:</span>
                        <span className="text-white font-bold ml-1">
                          ₹{getNiftyData().high?.toLocaleString() || '0'}
                        </span>
                    </div>
                    <div>
                      <span className="text-blue-300">Low:</span>
                        <span className="text-white font-bold ml-1">
                          ₹{getNiftyData().low?.toLocaleString() || '0'}
                        </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BANKNIFTY Card */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">BANK NIFTY</h3>
                  <div className="flex items-center gap-2">
                      {isLoadingMarketData ? (
                        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          {getBankNiftyData().change >= 0 ? (
                            <TrendingUp className="text-green-400" size={20} />
                          ) : (
                    <TrendingDown className="text-red-400" size={20} />
                          )}
                          <span className={`font-bold ${
                            getBankNiftyData().change >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {getBankNiftyData().change_percent?.toFixed(2) || '0.00'}%
                          </span>
                        </>
                      )}
                  </div>
                </div>
                <div className="space-y-3">
                    <div className="text-3xl font-bold text-white">
                      {isLoadingMarketData ? (
                        <div className="h-8 bg-white/20 rounded animate-pulse"></div>
                      ) : (
                        `₹${getBankNiftyData().price?.toLocaleString() || '0'}`
                      )}
                    </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-blue-300">Change:</span>
                        <span className={`font-bold ml-1 ${
                          getBankNiftyData().change >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {getBankNiftyData().change >= 0 ? '+' : ''}
                          {getBankNiftyData().change?.toFixed(2) || '0.00'}
                        </span>
                    </div>
                    <div>
                      <span className="text-blue-300">Volume:</span>
                        <span className="text-white font-bold ml-1">
                          {getBankNiftyData().volume ? 
                            `${(getBankNiftyData().volume / 1000000).toFixed(1)}M` : 
                            '0M'
                          }
                        </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-300">High:</span>
                        <span className="text-white font-bold ml-1">
                          ₹{getBankNiftyData().high?.toLocaleString() || '0'}
                        </span>
                    </div>
                    <div>
                      <span className="text-blue-300">Low:</span>
                        <span className="text-white font-bold ml-1">
                          ₹{getBankNiftyData().low?.toLocaleString() || '0'}
                        </span>
                    </div>
                  </div>
                </div>
              </div>

                {/* SENSEX Card */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">SENSEX</h3>
                    <div className="flex items-center gap-2">
                      {isLoadingMarketData ? (
                        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          {getSensexData().change >= 0 ? (
                            <TrendingUp className="text-green-400" size={20} />
                          ) : (
                            <TrendingDown className="text-red-400" size={20} />
                          )}
                          <span className={`font-bold ${
                            getSensexData().change >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {getSensexData().change_percent?.toFixed(2) || '0.00'}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="text-3xl font-bold text-white">
                      {isLoadingMarketData ? (
                        <div className="h-8 bg-white/20 rounded animate-pulse"></div>
                      ) : (
                        `${getSensexData().price?.toLocaleString() || '0'}`
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-blue-300">Change:</span>
                        <span className={`font-bold ml-1 ${
                          getSensexData().change >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {getSensexData().change >= 0 ? '+' : ''}
                          {getSensexData().change?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-300">Volume:</span>
                        <span className="text-white font-bold ml-1">
                          {getSensexData().volume ? 
                            `${(getSensexData().volume / 1000000).toFixed(1)}M` : 
                            '0M'
                          }
                        </span>
                    </div>
                  </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-300">High:</span>
                        <span className="text-white font-bold ml-1">
                          {getSensexData().high?.toLocaleString() || '0'}
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-300">Low:</span>
                        <span className="text-white font-bold ml-1">
                          {getSensexData().low?.toLocaleString() || '0'}
                        </span>
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
                    Top Sector Gainers
                 </h3>
                 <div className="space-y-3">
                    {isLoadingMarketData ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="flex items-center justify-between bg-white/5 p-3 rounded-lg animate-pulse">
                          <div className="flex items-center gap-3">
                            <div className="h-4 bg-white/20 rounded w-16"></div>
                            <div className="h-3 bg-white/20 rounded w-12"></div>
                          </div>
                          <div className="text-right">
                            <div className="h-4 bg-white/20 rounded w-12 mb-1"></div>
                            <div className="h-3 bg-white/20 rounded w-16"></div>
                          </div>
                        </div>
                      ))
                    ) : (
                                           topGainers.map((sector, index) => (
                       <div key={index} className="flex items-center justify-between bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors">
                       <div className="flex items-center gap-3">
                           <span className="text-white font-semibold">{sector.symbol}</span>
                           <span className="text-blue-300 text-sm">
                             Sector
                           </span>
                       </div>
                       <div className="text-right">
                           <div className="text-green-400 font-bold">+{sector.change_percent.toFixed(2)}%</div>
                           <div className="text-white text-sm">₹{sector.price.toLocaleString()}</div>
                       </div>
                     </div>
                     ))
                    )}
                 </div>
               </div>

               {/* Top Losers */}
               <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-6 border border-white/20">
                 <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                   <TrendingDown className="text-red-400" size={24} />
                    Top Sector Losers
                 </h3>
                 <div className="space-y-3">
                    {isLoadingMarketData ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="flex items-center justify-between bg-white/5 p-3 rounded-lg animate-pulse">
                          <div className="flex items-center gap-3">
                            <div className="h-4 bg-white/20 rounded w-16"></div>
                            <div className="h-3 bg-white/20 rounded w-12"></div>
                          </div>
                          <div className="text-right">
                            <div className="h-4 bg-white/20 rounded w-12 mb-1"></div>
                            <div className="h-3 bg-white/20 rounded w-16"></div>
                          </div>
                        </div>
                      ))
                    ) : (
                                           topLosers.map((sector, index) => (
                       <div key={index} className="flex items-center justify-between bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors">
                       <div className="flex items-center gap-3">
                           <span className="text-white font-semibold">{sector.symbol}</span>
                           <span className="text-blue-300 text-sm">
                             Sector
                           </span>
                       </div>
                       <div className="text-right">
                           <div className="text-red-400 font-bold">{sector.change_percent.toFixed(2)}%</div>
                           <div className="text-white text-sm">₹{sector.price.toLocaleString()}</div>
                       </div>
                     </div>
                     ))
                    )}
                 </div>
               </div>
             </div>

                           {/* OI Data Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top OI Gainers */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Zap className="text-green-400" size={24} />
                    Top OI Gainers
                  </h3>
                  <div className="space-y-3">
                    {topOiGainers.map((option, index) => (
                      <div key={index} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-white font-semibold">{option.symbol}</span>
                          <span className="text-green-300 text-sm">{option.strike} {option.optionType}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-green-400 font-bold">+{((option.oiChange / option.oi) * 100).toFixed(1)}%</div>
                            <div className="text-white text-sm">₹{option.price.toFixed(2)}</div>
                          </div>
                          <div className="text-right">
                            <span className="text-blue-300 text-sm">Vol: {(option.volume / 1000).toFixed(0)}K</span>
                            <div className="text-green-300 text-xs">OI: {(option.oi / 100000).toFixed(1)}L</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top OI Losers */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Zap className="text-red-400" size={24} />
                    Top OI Losers
                  </h3>
                  <div className="space-y-3">
                    {topOiLosers.map((option, index) => (
                      <div key={index} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-white font-semibold">{option.symbol}</span>
                          <span className="text-red-300 text-sm">{option.strike} {option.optionType}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-red-400 font-bold">{((option.oiChange / option.oi) * 100).toFixed(1)}%</div>
                            <div className="text-white text-sm">₹{option.price.toFixed(2)}</div>
                          </div>
                          <div className="text-right">
                            <span className="text-blue-300 text-sm">Vol: {(option.volume / 1000).toFixed(0)}K</span>
                            <div className="text-red-300 text-xs">OI: {(option.oi / 100000).toFixed(1)}L</div>
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
                    {oiSpurts.map((option, index) => (
                      <div key={index} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-white font-semibold">{option.symbol}</span>
                          <span className="text-purple-300 text-sm">{option.strike} {option.optionType}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className={`font-bold ${option.oiChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {option.oiChange > 0 ? '+' : ''}{((option.oiChange / option.oi) * 100).toFixed(1)}%
                            </div>
                            <div className="text-white text-sm">₹{option.price.toFixed(2)}</div>
                          </div>
                          <span className="text-blue-300 text-sm">Vol: {(option.volume / 1000).toFixed(0)}K</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* All Sectors Performance */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <BarChart3 className="text-blue-400" size={24} />
                  All Sectors Performance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                     {validSectors.map((sector, index) => (
                     <div 
                       key={index} 
                       className="bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group"
                       onClick={() => sector.tradingViewUrl && window.open(sector.tradingViewUrl, '_blank')}
                       title={`Click to view ${sector.symbol} chart on TradingView`}
                     >
                       <div className="flex items-center justify-between">
                         <div>
                           <div className="text-white font-semibold text-lg group-hover:text-blue-300 transition-colors">
                             {sector.symbol}
                           </div>
                           <div className="text-blue-300 text-sm flex items-center gap-1">
                             <span>Sector Index</span>
                             <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                               <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                             </svg>
                           </div>
                         </div>
                         <div className="text-right">
                           <div className={`text-xl font-bold ${
                             sector.change_percent >= 0 ? 'text-green-400' : 'text-red-400'
                           }`}>
                             {sector.change_percent >= 0 ? '+' : ''}{sector.change_percent.toFixed(2)}%
                           </div>
                           <div className="text-white text-sm">₹{sector.price.toLocaleString()}</div>
                         </div>
                       </div>
                       <div className="mt-3 flex items-center justify-between text-xs text-blue-300">
                         <span>Change: {sector.change >= 0 ? '+' : ''}{sector.change.toFixed(2)}</span>
                         <span>Vol: {(sector.volume / 1000000).toFixed(1)}M</span>
                       </div>
                       <div className="mt-2 text-xs text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity">
                         Click to view live chart →
                    </div>
                  </div>
                ))}
              </div>
            </div>



              {/* Market Status */}
               <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Activity className="text-green-400 animate-pulse" size={24} />
                  Market Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white/5 p-4 rounded-lg text-center">
                    <div className="text-blue-300 text-sm mb-2">Market Status</div>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-400 font-bold">LIVE</span>
                    </div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg text-center">
                    <div className="text-blue-300 text-sm mb-2">Last Updated</div>
                    <div className="text-white font-semibold">{lastUpdated.toLocaleTimeString()}</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg text-center">
                    <div className="text-blue-300 text-sm mb-2">Data Source</div>
                    <div className="text-white font-semibold">{dataSource}</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg text-center">
                    <div className="text-blue-300 text-sm mb-2">Total Symbols</div>
                    <div className="text-white font-semibold">{marketData.length}</div>
                  </div>
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