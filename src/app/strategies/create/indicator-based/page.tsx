'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BarChart3, CheckCircle, AlertTriangle, X, Search, Clock } from 'lucide-react';
import Sidebar from '../../../components/Layout/Sidebar';
import { getUserToken, getUserData } from '@/lib/cookies';

const IndicatorBasedStrategyPage = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  const [timeIndicatorFormData, setTimeIndicatorFormData] = useState({
    name: '',
    symbol: '',
    order_type: 'MIS',
    start_time: '09:15',
    square_off_time: '15:15',
    working_days: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    transaction_type: 'Both Side',
    chart_type: 'Candle',
    interval: '5 Min'
  });

  const [instrumentSearch, setInstrumentSearch] = useState<{
    searchQuery: string;
    isSearching: boolean;
    selectedInstrument: any;
    searchResults: any[];
  }>({
    searchQuery: '',
    isSearching: false,
    selectedInstrument: null,
    searchResults: []
  });

  const [longComparator, setLongComparator] = useState('');
  const [shortComparator, setShortComparator] = useState('');
  const [profitTrailingType, setProfitTrailingType] = useState('no_trailing');

  const isUnderlyingSelected = !!instrumentSearch.selectedInstrument;

  const availableInstruments = [
    { symbol: 'NIFTY 50', name: 'NIFTY 50', segment: 'INDEX', lotSize: 50 },
    { symbol: 'BANKNIFTY', name: 'BANK NIFTY', segment: 'INDEX', lotSize: 25 },
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', segment: 'STOCK', lotSize: 250 },
    { symbol: 'TCS', name: 'Tata Consultancy Services Ltd', segment: 'STOCK', lotSize: 100 }
  ];

  const handleInstrumentSearch = (query: string) => {
    setInstrumentSearch(prev => ({
      ...prev,
      searchQuery: query,
      isSearching: query.length > 0
    }));

    if (query.length > 0) {
      const filtered = availableInstruments.filter(instrument => {
        const searchTerm = query.toLowerCase();
        return instrument.symbol.toLowerCase().includes(searchTerm) ||
               instrument.name.toLowerCase().includes(searchTerm);
      });
      
      setInstrumentSearch(prev => ({
        ...prev,
        searchResults: filtered
      }));
    } else {
      setInstrumentSearch(prev => ({
        ...prev,
        searchResults: []
      }));
    }
  };

  const handleInstrumentSelect = (instrument: any) => {
    setInstrumentSearch(prev => ({
      ...prev,
      selectedInstrument: instrument,
      searchQuery: instrument.symbol,
      isSearching: false,
      searchResults: []
    }));
    
    setTimeIndicatorFormData(prev => ({
      ...prev,
      symbol: instrument.symbol
    }));
  };

  const handleInstrumentRemove = () => {
    setInstrumentSearch(prev => ({
      ...prev,
      selectedInstrument: null,
      searchQuery: '',
      searchResults: []
    }));
    
    setTimeIndicatorFormData(prev => ({
      ...prev,
      symbol: ''
    }));
  };

  const handleTimeIndicatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!timeIndicatorFormData.name.trim() || !timeIndicatorFormData.symbol.trim() || !longComparator || !shortComparator) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      const response = await fetch('/api/strategies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: (user as any)?.id || 'tradesetu001',
          name: timeIndicatorFormData.name,
          description: `Indicator Based Strategy created on ${new Date().toLocaleDateString()}`,
          strategy_type: 'INDICATOR_BASED',
          symbol: timeIndicatorFormData.symbol,
          entry_conditions: `Long: ${longComparator}, Short: ${shortComparator}`,
          exit_conditions: 'Stop Loss or Take Profit',
          risk_management: {
            stop_loss: '2%',
            take_profit: '4%',
            position_size: '1 lot'
          },
          is_paper_trading: true
        }),
      });

      if (response.ok) {
        console.log('Indicator Based Strategy saved successfully');
        router.push('/strategies');
      } else {
        const errorData = await response.json();
        alert(`Error saving strategy: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleTimeIndicatorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setTimeIndicatorFormData({
      ...timeIndicatorFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleLongComparatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    setLongComparator(selectedValue);
    
    if (selectedValue === 'crosses_above') {
      setShortComparator('crosses_below');
    } else if (selectedValue === 'crosses_below') {
      setShortComparator('crosses_above');
    } else if (selectedValue === 'less_than') {
      setShortComparator('higher_than');
    } else if (selectedValue === 'higher_than') {
      setShortComparator('less_than');
    } else if (selectedValue === 'equal') {
      setShortComparator('equal');
    }
  };

  const handleShortComparatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    setShortComparator(selectedValue);
    
    if (selectedValue === 'crosses_above') {
      setLongComparator('crosses_below');
    } else if (selectedValue === 'crosses_below') {
      setLongComparator('crosses_above');
    } else if (selectedValue === 'less_than') {
      setLongComparator('higher_than');
    } else if (selectedValue === 'higher_than') {
      setLongComparator('less_than');
    } else if (selectedValue === 'equal') {
      setLongComparator('equal');
    }
  };

  useEffect(() => {
    const token = getUserToken();
    const userData = getUserData();

    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    setUser(userData);
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      <div className="fixed left-0 top-0 h-full z-10">
        <Sidebar activeTab="strategies" onTabChange={() => {}} />
      </div>
      <div className="flex-1 flex min-w-0 md:ml-64">
        <main className="flex-1 p-6 space-y-6 md:ml-0 overflow-x-hidden">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => router.push('/strategies/create')}
                  className="group relative p-4 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 text-white hover:from-white/20 hover:to-white/10 transition-all duration-500 transform hover:scale-110 hover:rotate-12 shadow-2xl hover:shadow-green-500/25"
                >
                  <ArrowLeft size={24} className="relative z-10" />
                </button>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
                    <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-2xl shadow-2xl">
                      <BarChart3 size={28} className="text-white drop-shadow-2xl" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Indicator Based Strategy</h2>
                    <p className="text-blue-200 text-sm mt-1">Create strategies using technical indicators</p>
                  </div>
                </div>
              </div>
              
              {/* Navigation Options */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.push('/strategies/create')}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg text-blue-200 hover:from-blue-500/30 hover:to-cyan-500/30 transition-all duration-300"
                >
                  Use Main Page
                </button>
                <button
                  onClick={() => router.push('/strategies/create?type=indicator-based')}
                  className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg text-green-200 hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-300"
                >
                  Use Integrated Form
                </button>
              </div>
            </div>

            {/* Page Information Notice */}
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-4 border border-green-500/20">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div>
                  <h4 className="text-white font-semibold">Standalone Indicator-Based Strategy Page</h4>
                  <p className="text-green-200 text-sm">
                    This is a dedicated page for Indicator-Based strategies. You can also use the integrated form in the main strategy creation page.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleTimeIndicatorSubmit} className="space-y-6">
              {/* Underlying Search & Select Card */}
              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl p-4 border border-blue-500/20">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-3">
                  <span>Select Underlying</span>
                </h3>
                
                <div className="space-y-3">
                  <div className="group relative">
                    <div className="relative">
                      <div className="p-3 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-blue-500/30 rounded-lg">
                        <div className="relative">
                          <input
                            type="text"
                            value={instrumentSearch.searchQuery}
                            onChange={(e) => handleInstrumentSearch(e.target.value)}
                            className="w-full p-2 pl-8 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-green-500/30 rounded-lg text-white focus:ring-1 focus:ring-green-400 focus:outline-none transition-all duration-300 backdrop-blur-sm text-sm"
                            placeholder="Search NIFTY 50, BANKNIFTY, SENSEX, RELIANCE, TCS..."
                          />
                          <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                            <Search size={14} className="text-green-300" />
                          </div>
                          {instrumentSearch.selectedInstrument && (
                            <button 
                              onClick={handleInstrumentRemove}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2"
                            >
                              <X size={14} className="text-red-300 hover:text-red-200" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {instrumentSearch.isSearching && instrumentSearch.searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-gradient-to-r from-slate-800/95 to-slate-700/95 rounded-xl border border-blue-500/30 backdrop-blur-sm max-h-48 overflow-y-auto z-10">
                          <div className="p-2">
                            <div className="space-y-1">
                              {instrumentSearch.searchResults.map((instrument, index) => (
                                <div
                                  key={index}
                                  onClick={() => handleInstrumentSelect(instrument)}
                                  className="group cursor-pointer p-2 rounded-lg bg-gradient-to-r from-white/5 to-white/3 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-200 hover:scale-105"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                      <div>
                                        <div className="text-white font-semibold text-sm">{instrument.symbol}</div>
                                        <div className="text-blue-200 text-xs">{instrument.name}</div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-blue-200 text-xs">{instrument.segment}</div>
                                      <div className="text-blue-300 text-xs">Lot: {instrument.lotSize}</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-white text-sm font-medium">Popular Indices:</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {availableInstruments.filter(instrument => instrument.segment === 'INDEX').slice(0, 4).map((instrument, index) => (
                        <button
                          key={index}
                          onClick={() => handleInstrumentSelect(instrument)}
                          className="group p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-200 hover:scale-105"
                        >
                          <div className="text-center">
                            <div className="text-white font-semibold text-xs">{instrument.symbol}</div>
                            <div className="text-blue-200 text-xs mt-1">{instrument.segment}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-4">
                      <span className="text-white text-sm font-medium">Popular Stocks:</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {availableInstruments.filter(instrument => instrument.segment === 'STOCK').slice(0, 8).map((instrument, index) => (
                        <button
                          key={index}
                          onClick={() => handleInstrumentSelect(instrument)}
                          className="group p-2 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 hover:border-green-400/50 transition-all duration-200 hover:scale-105"
                        >
                          <div className="text-center">
                            <div className="text-white font-semibold text-xs">{instrument.symbol}</div>
                            <div className="text-green-200 text-xs mt-1">{instrument.segment}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {isUnderlyingSelected && (
                    <div className="mt-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CheckCircle size={20} className="text-green-400" />
                          <div>
                            <h4 className="text-white font-semibold">Selected Instrument</h4>
                            <div className="text-green-200 text-sm">
                              <div className="font-medium">{instrumentSearch.selectedInstrument?.symbol}</div>
                              <div className="text-xs opacity-75">{instrumentSearch.selectedInstrument?.name}</div>
                              <div className="text-xs opacity-75">
                                {instrumentSearch.selectedInstrument?.segment} • Lot Size: {instrumentSearch.selectedInstrument?.lotSize}
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={handleInstrumentRemove}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors duration-200"
                          title="Remove selected instrument"
                        >
                          <X size={16} className="text-red-400 hover:text-red-300" />
                        </button>
                      </div>
                    </div>
                  )}

                  {!isUnderlyingSelected && (
                    <div className="mt-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl p-4 border border-orange-500/20">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle size={20} className="text-orange-400" />
                        <div>
                          <h4 className="text-white font-semibold">Select Underlying Required</h4>
                          <p className="text-orange-200 text-sm">
                            You must select an underlying instrument before you can configure your strategy
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Trading Configuration */}
              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl p-4 border border-blue-500/20">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-3">
                  <span>Trading Configuration</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-blue-300 text-xs font-semibold mb-2">Order Type</label>
                      <div className="space-y-1">
                        {['MIS', 'CNC', 'BTST'].map((type) => (
                          <label key={type} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="order_type"
                              value={type}
                              checked={timeIndicatorFormData.order_type === type}
                              onChange={(e) => setTimeIndicatorFormData(prev => ({ ...prev, order_type: e.target.value }))}
                              className="w-3 h-3 text-blue-600 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-full focus:ring-1 focus:ring-blue-400"
                            />
                            <span className="text-white text-xs">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-blue-300 text-xs font-semibold mb-2">Start Time</label>
                      <input
                        type="time"
                        value={timeIndicatorFormData.start_time}
                        onChange={(e) => setTimeIndicatorFormData(prev => ({ ...prev, start_time: e.target.value }))}
                        className="w-full p-2 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-blue-500/30 rounded-lg text-white text-xs focus:ring-1 focus:ring-blue-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-blue-300 text-xs font-semibold mb-2">Square Off</label>
                      <input
                        type="time"
                        value={timeIndicatorFormData.square_off_time}
                        onChange={(e) => setTimeIndicatorFormData(prev => ({ ...prev, square_off_time: e.target.value }))}
                        className="w-full p-2 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-blue-500/30 rounded-lg text-white text-xs focus:ring-1 focus:ring-blue-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-blue-300 text-xs font-semibold mb-2">Trading Days</label>
                      <div className="grid grid-cols-5 gap-1">
                        {['MON', 'TUE', 'WED', 'THU', 'FRI'].map((day) => (
                          <button
                            key={day}
                            onClick={() => {
                              const dayKey = day.toLowerCase() as keyof typeof timeIndicatorFormData.working_days;
                              setTimeIndicatorFormData(prev => ({
                                ...prev,
                                working_days: {
                                  ...prev.working_days,
                                  [dayKey]: !prev.working_days[dayKey]
                                }
                              }));
                            }}
                            className={`p-1 rounded text-xs font-medium transition-all duration-200 ${
                              timeIndicatorFormData.working_days[day.toLowerCase() as keyof typeof timeIndicatorFormData.working_days]
                                ? 'bg-blue-500 text-white'
                                : 'bg-white/5 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-blue-300 text-xs font-semibold mb-2">Transaction Type</label>
                      <div className="flex space-x-1">
                        {['Both Side', 'Only Long', 'Only Short'].map((type) => (
                          <button
                            key={type}
                            onClick={() => setTimeIndicatorFormData(prev => ({ ...prev, transaction_type: type }))}
                            className={`flex-1 p-2 rounded text-xs font-medium transition-all duration-200 ${
                              timeIndicatorFormData.transaction_type === type
                                ? 'bg-blue-500 text-white'
                                : 'bg-white/5 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-blue-300 text-xs font-semibold mb-2">Chart Type</label>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => setTimeIndicatorFormData(prev => ({ ...prev, chart_type: 'Candle' }))}
                          className={`flex-1 p-2 rounded text-xs font-medium transition-all duration-200 flex items-center justify-center space-x-1 ${
                            timeIndicatorFormData.chart_type === 'Candle'
                              ? 'bg-blue-500 text-white'
                              : 'bg-white/5 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          <BarChart3 size={12} />
                          <span>Candle</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-blue-300 text-xs font-semibold mb-2">Interval</label>
                      <div className="flex space-x-1">
                        {['1 Min', '3 Min', '5 Min', '10 Min', '15 Min', '30 Min', '1 H'].map((interval) => (
                          <button
                            key={interval}
                            onClick={() => setTimeIndicatorFormData(prev => ({ ...prev, interval }))}
                            className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                              timeIndicatorFormData.interval === interval
                                ? 'bg-blue-500 text-white'
                                : 'bg-white/5 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {interval}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Entry Conditions */}
              <div className={`rounded-2xl p-4 border transition-all duration-300 ${
                isUnderlyingSelected 
                  ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20' 
                  : 'bg-gradient-to-r from-gray-500/10 to-gray-600/10 border-gray-500/20 opacity-50'
              }`}>
                <h3 className="text-lg font-bold text-white mb-4">
                  <span>Entry conditions</span>
                  {!isUnderlyingSelected && (
                    <span className="text-orange-400 text-sm ml-2">(Select underlying first)</span>
                  )}
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-green-400 font-semibold text-sm mb-2">Long Entry Condition</label>
                      <select 
                        value={longComparator}
                        onChange={handleLongComparatorChange}
                        disabled={!isUnderlyingSelected}
                        className={`w-full p-3 border rounded-lg text-white text-sm focus:outline-none ${
                          isUnderlyingSelected
                            ? 'bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-green-500/30 focus:ring-1 focus:ring-green-400'
                            : 'bg-gradient-to-r from-gray-600/80 to-gray-700/80 border-gray-500/30 cursor-not-allowed opacity-50'
                        }`}
                      >
                        <option value="">Select Comparator</option>
                        <option value="crosses_above">Crosses Above</option>
                        <option value="crosses_below">Crosses Below</option>
                        <option value="higher_than">Higher than</option>
                        <option value="less_than">Less than</option>
                        <option value="equal">Equal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-red-400 font-semibold text-sm mb-2">Short Entry Condition</label>
                      <select 
                        value={shortComparator}
                        onChange={handleShortComparatorChange}
                        disabled={!isUnderlyingSelected}
                        className={`w-full p-3 border rounded-lg text-white text-sm focus:outline-none ${
                          isUnderlyingSelected
                            ? 'bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-red-500/30 focus:ring-1 focus:ring-red-400'
                            : 'bg-gradient-to-r from-gray-600/80 to-gray-700/80 border-gray-500/30 cursor-not-allowed opacity-50'
                        }`}
                      >
                        <option value="">Select Comparator</option>
                        <option value="crosses_above">Crosses Above</option>
                        <option value="crosses_below">Crosses Below</option>
                        <option value="higher_than">Higher than</option>
                        <option value="less_than">Less than</option>
                        <option value="equal">Equal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-blue-400 font-semibold text-sm mb-2">Status</label>
                      <div className="p-3 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-blue-500/30 rounded-lg">
                        {longComparator && shortComparator ? (
                          <div className="flex items-center space-x-2 text-green-400">
                            <CheckCircle size={16} />
                            <span className="text-sm">Conditions Set</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-orange-400">
                            <AlertTriangle size={16} />
                            <span className="text-sm">Set Conditions</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strategy Name */}
              <div className="bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 rounded-2xl p-6 border-2 border-yellow-500/30 shadow-lg shadow-yellow-500/20">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                      <span>Strategy Name</span>
                      <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                        <span className="text-yellow-900 text-xs font-bold">★</span>
                      </div>
                    </h3>
                    <div className="group relative">
                      <input
                        type="text"
                        name="name"
                        value={timeIndicatorFormData.name}
                        onChange={handleTimeIndicatorChange}
                        className={`w-full p-4 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 border-2 rounded-2xl text-gray-900 focus:ring-4 focus:ring-yellow-400 focus:outline-none transition-all duration-500 transform group-hover:scale-105 group-hover:shadow-2xl backdrop-blur-sm placeholder-gray-600 font-medium ${
                          timeIndicatorFormData.name.trim() 
                            ? 'border-yellow-400 shadow-lg shadow-yellow-500/25' 
                            : 'border-orange-400 shadow-lg shadow-orange-500/25'
                        }`}
                        placeholder="Enter your strategy name..."
                        required
                      />
                      {timeIndicatorFormData.name.trim() && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        </div>
                      )}
                    </div>
                    {!timeIndicatorFormData.name.trim() && (
                      <p className="text-orange-400 text-sm mt-2 flex items-center space-x-1">
                        <AlertTriangle size={16} />
                        <span>Strategy name is required to save</span>
                      </p>
                    )}
                    {!isUnderlyingSelected && (
                      <p className="text-orange-400 text-sm mt-2 flex items-center space-x-1">
                        <AlertTriangle size={16} />
                        <span>Select an underlying instrument to enable strategy creation</span>
                      </p>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={!timeIndicatorFormData.name.trim() || !isUnderlyingSelected || !longComparator || !shortComparator}
                      className={`group relative px-12 py-4 font-bold rounded-2xl transition-all duration-500 transform ${
                        timeIndicatorFormData.name.trim() && isUnderlyingSelected && longComparator && shortComparator
                          ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/25 cursor-pointer'
                          : 'bg-gradient-to-r from-gray-500 to-gray-600 text-gray-300 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <span className="relative z-10 flex items-center space-x-3">
                        <BarChart3 size={24} className={timeIndicatorFormData.name.trim() && isUnderlyingSelected && longComparator && shortComparator ? 'animate-pulse' : ''} />
                        <span className="text-lg">
                          {!isUnderlyingSelected 
                            ? 'Select Underlying First' 
                            : !timeIndicatorFormData.name.trim() 
                              ? 'Enter Strategy Name First' 
                              : !longComparator || !shortComparator
                                ? 'Set Entry Conditions First'
                                : 'Save Strategy'
                          }
                        </span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default IndicatorBasedStrategyPage;
