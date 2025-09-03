'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Clock, CheckCircle, AlertTriangle, X, Search } from 'lucide-react';
import Sidebar from '../../../components/Layout/Sidebar';
import { getUserToken, getUserData } from '@/lib/cookies';

const TimeBasedStrategyPage = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  const [timeIndicatorFormData, setTimeIndicatorFormData] = useState({
    name: '',
    symbol: '',
    time_order_product_type: '',
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
    }
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

  const handleTimeBasedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!timeIndicatorFormData.name.trim() || !timeIndicatorFormData.symbol.trim() || !timeIndicatorFormData.time_order_product_type) {
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
          description: `Time Based Strategy created on ${new Date().toLocaleDateString()}`,
          strategy_type: 'TIME_BASED',
          symbol: timeIndicatorFormData.symbol,
          entry_conditions: 'Time-based entry',
          exit_conditions: 'Time-based exit',
          risk_management: {
            stop_loss: '2%',
            take_profit: '4%',
            position_size: '1 lot'
          },
          is_paper_trading: true
        }),
      });

      if (response.ok) {
        console.log('Time Based Strategy saved successfully');
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
        <main className="flex-1 p-4 space-y-4 md:ml-0 overflow-x-hidden">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/strategies/create')}
                  className="group relative p-3 rounded-xl bg-gradient-to-r from-white/10 to-white/5 text-white hover:from-white/20 hover:to-white/10 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                >
                  <ArrowLeft size={20} className="relative z-10" />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl blur-md opacity-60 animate-pulse"></div>
                    <div className="relative bg-gradient-to-r from-blue-500 to-cyan-600 p-3 rounded-xl shadow-xl">
                      <Clock size={24} className="text-white drop-shadow-lg" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Time Based Strategy</h2>
                    <p className="text-blue-200 text-xs">Create strategies based on time triggers</p>
                  </div>
                </div>
              </div>
              
              {/* Navigation Options */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => router.push('/strategies/create')}
                  className="px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg text-blue-200 hover:from-blue-500/30 hover:to-cyan-500/30 transition-all duration-300 text-sm"
                >
                  Main Page
                </button>
                <button
                  onClick={() => router.push('/strategies/create?type=time-based')}
                  className="px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg text-green-200 hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-300 text-sm"
                >
                  Integrated Form
                </button>
              </div>
            </div>

            {/* Page Information Notice */}
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl p-3 border border-blue-500/20">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                <div>
                  <h4 className="text-white font-semibold text-sm">Standalone Time-Based Strategy Page</h4>
                  <p className="text-blue-200 text-xs">
                    This is a dedicated page for Time-Based strategies. You can also use the integrated form in the main strategy creation page.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleTimeBasedSubmit} className="space-y-4">
              {/* Select Underlying Asset */}
              <div className="bg-gradient-to-br from-slate-800/80 to-blue-900/80 backdrop-blur-lg rounded-xl p-4 border border-blue-500/30 shadow-xl">
                <h3 className="text-base font-semibold text-white mb-3 flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  Select Underlying Asset
                </h3>
                <div className="space-y-2">
                  <div className="group relative">
                    <div className="relative">
                      <div className="p-2 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-blue-500/30 rounded-lg">
                        <div className="relative">
                          <input
                            type="text"
                            value={instrumentSearch.searchQuery}
                            onChange={(e) => handleInstrumentSearch(e.target.value)}
                            className="w-full p-1.5 pl-6 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-blue-500/30 rounded-lg text-white focus:ring-1 focus:ring-blue-400 focus:outline-none transition-all duration-300 backdrop-blur-sm text-sm"
                            placeholder="Search NIFTY 50, BANKNIFTY, SENSEX, RELIANCE, TCS..."
                          />
                          <div className="absolute left-1.5 top-1/2 transform -translate-y-1/2">
                            <Search size={12} className="text-blue-300" />
                          </div>
                          {instrumentSearch.selectedInstrument && (
                            <button 
                              onClick={handleInstrumentRemove}
                              className="absolute right-1.5 top-1/2 transform -translate-y-1/2"
                            >
                              <X size={12} className="text-red-300 hover:text-red-200" />
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

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-white text-xs font-medium">Popular Indices:</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {availableInstruments.filter(instrument => instrument.segment === 'INDEX').slice(0, 4).map((instrument, index) => (
                        <button
                          key={index}
                          onClick={() => handleInstrumentSelect(instrument)}
                          className="group p-1.5 rounded-md bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-200 hover:scale-105"
                        >
                          <div className="text-center">
                            <div className="text-white font-semibold text-xs">{instrument.symbol}</div>
                            <div className="text-blue-200 text-xs">{instrument.segment}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-white text-xs font-medium">Popular Stocks:</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {availableInstruments.filter(instrument => instrument.segment === 'STOCK').slice(0, 8).map((instrument, index) => (
                        <button
                          key={index}
                          onClick={() => handleInstrumentSelect(instrument)}
                          className="group p-1.5 rounded-md bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 hover:border-green-400/50 transition-all duration-200 hover:scale-105"
                        >
                          <div className="text-center">
                            <div className="text-white font-semibold text-xs">{instrument.symbol}</div>
                            <div className="text-green-200 text-xs">{instrument.segment}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {isUnderlyingSelected && (
                    <div className="mt-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-3 border border-green-500/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CheckCircle size={16} className="text-green-400" />
                          <div>
                            <h4 className="text-white font-semibold text-sm">Selected Instrument</h4>
                            <div className="text-green-200 text-xs">
                              <div className="font-medium">{instrumentSearch.selectedInstrument?.symbol}</div>
                              <div className="opacity-75">{instrumentSearch.selectedInstrument?.name}</div>
                              <div className="opacity-75">
                                {instrumentSearch.selectedInstrument?.segment} • Lot: {instrumentSearch.selectedInstrument?.lotSize}
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={handleInstrumentRemove}
                          className="p-1.5 hover:bg-red-500/20 rounded-md transition-colors duration-200"
                          title="Remove selected instrument"
                        >
                          <X size={14} className="text-red-400 hover:text-red-300" />
                        </button>
                      </div>
                    </div>
                  )}

                  {!isUnderlyingSelected && (
                    <div className="mt-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg p-3 border border-orange-500/20">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle size={16} className="text-orange-400" />
                        <div>
                          <h4 className="text-white font-semibold text-sm">Select Underlying Required</h4>
                          <p className="text-orange-200 text-xs">
                            You must select an underlying instrument before you can configure your strategy
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Configuration */}
              <div className="bg-gradient-to-br from-slate-800/80 to-blue-900/80 backdrop-blur-lg rounded-xl p-4 border border-blue-500/30 shadow-xl">
                <h3 className="text-base font-semibold text-white mb-3 flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  Order Configuration
                </h3>
                
                <div className="mb-3 p-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle size={14} className="text-orange-400" />
                    <span className="text-orange-200 text-xs">
                      <span className="font-semibold">Note:</span> Order Type selection is compulsory after selecting underlying asset
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-white text-xs font-medium mb-2">
                      Order Type <span className="text-red-400">*</span>
                    </label>
                    
                    {timeIndicatorFormData.time_order_product_type && (
                      <div className="mb-2 p-1.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30">
                        <div className="flex items-center space-x-2">
                          <CheckCircle size={12} className="text-green-400" />
                          <span className="text-green-200 text-xs">
                            Selected: <span className="font-semibold">{timeIndicatorFormData.time_order_product_type}</span>
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-1.5">
                      {['MIS', 'CNC', 'BTST'].map((type) => (
                        <label key={type} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="orderType"
                            value={type}
                            checked={timeIndicatorFormData.time_order_product_type === type}
                            onChange={(e) => setTimeIndicatorFormData(prev => ({
                              ...prev,
                              time_order_product_type: e.target.value
                            }))}
                            className="w-3 h-3 text-blue-600 bg-slate-700 border-slate-500 focus:ring-blue-500"
                          />
                          <span className="text-white text-sm">{type}</span>
                        </label>
                      ))}
                    </div>
                    {!timeIndicatorFormData.time_order_product_type && (
                      <p className="text-red-400 text-xs mt-1">Please select an order type</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-white text-xs font-medium mb-1.5">Start time</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={timeIndicatorFormData.start_time}
                        onChange={(e) => setTimeIndicatorFormData(prev => ({
                          ...prev,
                          start_time: e.target.value
                        }))}
                        className="flex-1 p-1.5 bg-slate-700/50 border border-blue-500/50 rounded-lg text-white focus:ring-1 focus:ring-blue-400 focus:outline-none backdrop-blur-sm text-sm"
                        style={{
                          colorScheme: 'dark'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white text-xs font-medium mb-1.5">Square off</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={timeIndicatorFormData.square_off_time}
                        onChange={(e) => setTimeIndicatorFormData(prev => ({
                          ...prev,
                          square_off_time: e.target.value
                        }))}
                        className="flex-1 p-1.5 bg-slate-700/50 border border-blue-500/50 rounded-lg text-white focus:ring-1 focus:ring-blue-400 focus:outline-none backdrop-blur-sm text-sm"
                        style={{
                          colorScheme: 'dark'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white text-xs font-medium mb-1.5">Trading Days</label>
                    <div className="flex space-x-1">
                      {[
                        { key: 'monday', label: 'MON' },
                        { key: 'tuesday', label: 'TUE' },
                        { key: 'wednesday', label: 'WED' },
                        { key: 'thursday', label: 'THU' },
                        { key: 'friday', label: 'FRI' }
                      ].map((day) => (
                        <button 
                          key={day.key}
                          type="button"
                          onClick={() => setTimeIndicatorFormData(prev => ({
                            ...prev,
                            working_days: {
                              ...prev.working_days,
                              [day.key]: !prev.working_days[day.key as keyof typeof prev.working_days]
                            }
                          }))}
                          className={`px-2 py-1 rounded text-xs font-medium shadow-md transition-all duration-200 ${
                            timeIndicatorFormData.working_days[day.key as keyof typeof timeIndicatorFormData.working_days]
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      Click on days to toggle them on/off for trading
                    </div>
                  </div>
                </div>
              </div>

              {/* Strategy Name */}
              <div className="bg-gradient-to-br from-slate-800/80 to-blue-900/80 backdrop-blur-lg rounded-xl p-4 border border-blue-500/30 shadow-xl">
                <label className="block text-white text-xs font-medium mb-1.5">Strategy Name</label>
                <input
                  type="text"
                  name="name"
                  value={timeIndicatorFormData.name}
                  onChange={handleTimeIndicatorChange}
                  className="w-full p-2 bg-slate-700/50 border border-blue-500/50 rounded-lg text-white focus:ring-1 focus:ring-blue-400 focus:outline-none backdrop-blur-sm text-sm"
                  placeholder="Enter strategy name"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  disabled={!isUnderlyingSelected || !timeIndicatorFormData.name.trim() || !timeIndicatorFormData.time_order_product_type}
                  className={`px-6 py-2.5 font-semibold rounded-lg transition-all duration-300 shadow-lg text-sm ${
                    isUnderlyingSelected && timeIndicatorFormData.name.trim() && timeIndicatorFormData.time_order_product_type
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                      : 'bg-gradient-to-r from-gray-500 to-gray-600 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  {!isUnderlyingSelected 
                    ? 'Select Underlying First' 
                    : !timeIndicatorFormData.name.trim() 
                      ? 'Enter Strategy Name First' 
                      : !timeIndicatorFormData.time_order_product_type
                        ? 'Select Order Type First'
                        : 'Save & Continue'
                  }
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TimeBasedStrategyPage;
