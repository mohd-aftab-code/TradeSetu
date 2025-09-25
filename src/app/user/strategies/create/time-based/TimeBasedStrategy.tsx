'use client'

import React from 'react';
import { ArrowLeft, Clock, CheckCircle, AlertTriangle, Search, X, Plus, Copy, Trash2, ChevronDown, ChevronRight, Layers, Save, Info } from 'lucide-react';

interface TimeBasedStrategyProps {
  timeIndicatorFormData: any;
  setTimeIndicatorFormData: (data: any) => void;
  setStrategyCreationType: (type: any) => void;
  handleTimeBasedSubmit: (e: React.FormEvent) => void;
  instrumentSearch: any;
  handleInstrumentSearch: (query: string) => void;
  handleInstrumentSelect: (instrument: any) => void;
  handleInstrumentRemove: () => void;
  availableInstruments: any[];
  isUnderlyingSelected: boolean;
  orderLegs: any[];
  setOrderLegs: (legs: any) => void;
  addLeg: () => void;
  deleteLeg: (id: number) => void;
  updateLeg: (id: number, field: string, value: any) => void;
  getATMOptions: (atmPt: string) => string[];
  advanceFeatures: any;
  setAdvanceFeatures: (features: any) => void;
  showAdvanceFeatures: boolean;
  setShowAdvanceFeatures: (show: boolean) => void;
  profitTrailingType: string;
  setProfitTrailingType: (type: any) => void;
}

const TimeBasedStrategy: React.FC<TimeBasedStrategyProps> = ({
  timeIndicatorFormData,
  setTimeIndicatorFormData,
  setStrategyCreationType,
  handleTimeBasedSubmit,
  instrumentSearch,
  handleInstrumentSearch,
  handleInstrumentSelect,
  handleInstrumentRemove,
  availableInstruments,
  isUnderlyingSelected,
  orderLegs,
  setOrderLegs,
  addLeg,
  deleteLeg,
  updateLeg,
  getATMOptions,
  advanceFeatures,
  setAdvanceFeatures,
  showAdvanceFeatures,
  setShowAdvanceFeatures,
  profitTrailingType,
  setProfitTrailingType
}) => {
  console.log('TimeBasedStrategy component loaded successfully');
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setStrategyCreationType('time-indicator')}
            className="group relative p-4 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 text-white hover:from-white/20 hover:to-white/10 transition-all duration-500 transform hover:scale-110 hover:rotate-12 shadow-2xl hover:shadow-blue-500/25"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <ArrowLeft size={24} className="relative z-10" />
          </button>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-blue-500 to-cyan-600 p-4 rounded-2xl shadow-2xl">
                <Clock size={28} className="text-white drop-shadow-2xl" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Time Based Strategy</h2>
              <p className="text-blue-200 text-sm mt-1">Create strategies based on time triggers</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleTimeBasedSubmit} className="space-y-6">
        {/* Select Underlying Asset */}
        <div className="bg-gradient-to-br from-slate-800/80 to-blue-900/80 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30 shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            Select Underlying Asset
          </h3>
          <div className="space-y-3">
            {/* Search Input with Dropdown */}
            <div className="group relative">
              <div className="relative">
                <div className="p-3 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-blue-500/30 rounded-lg">
                  <div className="relative">
                    <input
                      type="text"
                      value={instrumentSearch.searchQuery}
                      onChange={(e) => handleInstrumentSearch(e.target.value)}
                      className="w-full p-2 pl-8 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-blue-500/30 rounded-lg text-white focus:ring-1 focus:ring-blue-400 focus:outline-none transition-all duration-300 backdrop-blur-sm text-sm"
                      placeholder="Search NIFTY 50, BANKNIFTY, SENSEX, RELIANCE, TCS..."
                    />
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                      <Search size={14} className="text-blue-300" />
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
                
                {/* Search Results Dropdown */}
                {instrumentSearch.isSearching && instrumentSearch.searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-gradient-to-r from-slate-800/95 to-slate-700/95 rounded-xl border border-blue-500/30 backdrop-blur-sm max-h-48 overflow-y-auto z-10">
                    <div className="p-2">
                      <div className="space-y-1">
                        {instrumentSearch.searchResults.map((instrument: any, index: number) => (
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

            {/* Quick Selection Buttons */}
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

            {/* Selected Instrument Display */}
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

            {/* Warning if no underlying selected */}
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

        {/* Order Configuration */}
        <div className="bg-gradient-to-br from-slate-800/80 to-blue-900/80 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30 shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            Order Configuration
          </h3>
          
          {/* Compulsory Field Warning */}
          <div className="mb-4 p-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
            <div className="flex items-center space-x-2">
              <AlertTriangle size={16} className="text-orange-400" />
              <span className="text-orange-200 text-sm">
                <span className="font-semibold">Note:</span> Order Type selection is compulsory after selecting underlying asset
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Order Type */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Order Type <span className="text-red-400">*</span>
              </label>
              
              {/* Selection Status */}
              {timeIndicatorFormData.time_order_product_type && (
                <div className="mb-3 p-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30">
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={14} className="text-green-400" />
                    <span className="text-green-200 text-xs">
                      Selected: <span className="font-semibold">{timeIndicatorFormData.time_order_product_type}</span>
                    </span>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                {['MIS', 'CNC', 'BTST'].map((type) => (
                  <label key={type} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="orderType"
                      value={type}
                      checked={timeIndicatorFormData.time_order_product_type === type}
                      onChange={(e) => setTimeIndicatorFormData((prev: any) => ({
                        ...prev,
                        time_order_product_type: e.target.value
                      }))}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-white">{type}</span>
                  </label>
                ))}
              </div>
              {!timeIndicatorFormData.time_order_product_type && (
                <p className="text-red-400 text-xs mt-1">Please select an order type</p>
              )}
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Start time</label>
              <div className="flex items-center space-x-2">
                <input
                  type="time"
                  value={timeIndicatorFormData.start_time}
                  onChange={(e) => setTimeIndicatorFormData((prev: any) => ({
                    ...prev,
                    start_time: e.target.value
                  }))}
                  className="flex-1 p-2 bg-slate-700/50 border border-blue-500/50 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:outline-none backdrop-blur-sm [&::-webkit-calendar-picker-indicator]:bg-slate-700 [&::-webkit-calendar-picker-indicator]:rounded [&::-webkit-calendar-picker-indicator]:p-1 [&::-webkit-calendar-picker-indicator]:hover:bg-slate-600"
                  style={{
                    colorScheme: 'dark'
                  }}
                />
              </div>
            </div>

            {/* Square Off */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Square off</label>
              <div className="flex items-center space-x-2">
                <input
                  type="time"
                  value={timeIndicatorFormData.square_off_time}
                  onChange={(e) => setTimeIndicatorFormData((prev: any) => ({
                    ...prev,
                    square_off_time: e.target.value
                  }))}
                  className="flex-1 p-2 bg-slate-700/50 border border-blue-500/50 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:outline-none backdrop-blur-sm [&::-webkit-calendar-picker-indicator]:bg-slate-700 [&::-webkit-calendar-picker-indicator]:rounded [&::-webkit-calendar-picker-indicator]:p-1 [&::-webkit-calendar-picker-indicator]:hover:bg-slate-600"
                  style={{
                    colorScheme: 'dark'
                  }}
                />
              </div>
            </div>

            {/* Trading Days */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Trading Days</label>
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
                    onClick={() => setTimeIndicatorFormData((prev: any) => ({
                      ...prev,
                      working_days: {
                        ...prev.working_days,
                        [day.key]: !prev.working_days[day.key as keyof typeof prev.working_days]
                      }
                    }))}
                    className={`px-3 py-1 rounded text-xs font-medium shadow-lg transition-all duration-200 ${
                      timeIndicatorFormData.working_days[day.key as keyof typeof timeIndicatorFormData.working_days]
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-xs text-slate-400">
                Click on days to toggle them on/off for trading
              </div>
            </div>
          </div>
        </div>

        {/* Order Legs Section */}
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl p-6 border border-orange-500/20 relative overflow-hidden">
          {/* Background Pattern for Order Legs Section */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M0 0h40v40H0V0zm40 40h40v40H40V40zm0-40h2l-2 2V0zm0 4l4-4h2l-6 6V4zm0 4l8-8h2L40 10V8zm0 8L56 0h2L40 18v-2zm0 8L64 0h2L40 26v-2zm0 8L72 0h2L40 34v-2zm0 8L80 0v2L42 40h-2zm4 0L80 4v2L46 40h-2zm4 0L80 8v2L50 40h-2zm4 0l28-28v2L54 40h-2zm4 0l24-24v2L58 40h-2zm4 0l20-20v2L62 40h-2zm4 0l16-16v2L66 40h-2zm4 0l12-12v2L70 40h-2zm4 0l8-8v2l-6 6h-2zm4 0l4-4v2l-2 2h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                  <Layers size={20} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Order Legs</h3>
              </div>
              <button
                type="button"
                onClick={addLeg}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus size={18} />
                <span>ADD LEG</span>
              </button>
            </div>

            <div className="space-y-4">
            {orderLegs.map((leg, index) => (
              <div key={leg.id} className={`relative overflow-hidden rounded-lg p-3 shadow-md transition-all duration-300 hover:shadow-lg ${
                index === 0 
                  ? 'bg-gradient-to-br from-slate-800/80 to-blue-900/80 border border-blue-500/30' 
                  : 'bg-gradient-to-br from-slate-800/80 to-purple-900/80 border border-purple-500/30'
              }`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '20px 20px'
                  }}></div>
                </div>
                
                {/* Leg Header */}
                <div className="relative z-10 mb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-blue-400' : 'bg-purple-400'}`}></div>
                      <span className={`text-xs font-semibold ${index === 0 ? 'text-blue-300' : 'text-purple-300'}`}>
                        Leg {index + 1}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${index === 0 ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'}`}>
                        {leg.action.toUpperCase()}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${index === 0 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-pink-500/20 text-pink-300 border border-pink-500/30'}`}>
                        {leg.optionType.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-12 gap-1.5 items-center relative z-10 h-14">
                  {/* Action */}
                  <div className="col-span-1">
                    <select
                      value={leg.action}
                      onChange={(e) => updateLeg(leg.id, 'action', e.target.value)}
                      className="w-full h-10 p-1.5 text-xs font-medium rounded-md border-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                      style={{
                        backgroundColor: leg.action === 'buy' ? '#059669' : '#dc2626',
                        color: 'white',
                        borderColor: leg.action === 'buy' ? '#10b981' : '#ef4444'
                      }}
                    >
                      <option value="buy" className="bg-green-600 text-white">BUY</option>
                      <option value="sell" className="bg-red-600 text-white">SELL</option>
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="col-span-1">
                    <input
                      type="number"
                      value={leg.quantity}
                      onChange={(e) => updateLeg(leg.id, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full h-10 p-1.5 text-xs font-bold border-2 border-blue-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gradient-to-r from-slate-700/50 to-slate-600/50 text-white transition-all duration-200"
                      placeholder="Qty"
                    />
                  </div>

                  {/* Option Type */}
                  <div className="col-span-1">
                    <select
                      value={leg.optionType}
                      onChange={(e) => updateLeg(leg.id, 'optionType', e.target.value)}
                      className="w-full h-10 p-1.5 text-xs font-medium rounded-md border-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200"
                      style={{
                        backgroundColor: leg.optionType === 'ce' ? '#0891b2' : '#be185d',
                        color: 'white',
                        borderColor: leg.optionType === 'ce' ? '#06b6d4' : '#ec4899'
                      }}
                    >
                      <option value="ce" className="bg-cyan-600 text-white">CE</option>
                      <option value="pe" className="bg-pink-600 text-white">PE</option>
                    </select>
                  </div>

                  {/* Expiry */}
                  <div className="col-span-1">
                    <select
                      value={leg.expiry}
                      onChange={(e) => updateLeg(leg.id, 'expiry', e.target.value)}
                      className="w-full h-10 p-1.5 text-xs font-medium rounded-md border-2 border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gradient-to-r from-slate-700/50 to-blue-900/50 text-blue-300 transition-all duration-200"
                    >
                      <option value="Weekly" className="bg-slate-700 text-blue-300 font-bold">Weekly</option>
                      <option value="Next Weekly" className="bg-slate-700 text-blue-300 font-bold">Next Weekly</option>
                      <option value="Monthly" className="bg-slate-700 text-blue-300 font-bold">Monthly</option>
                    </select>
                  </div>

                  {/* ATM Pt */}
                  <div className="col-span-1">
                    <select
                      value={leg.atmPt}
                      onChange={(e) => updateLeg(leg.id, 'atmPt', e.target.value)}
                      className="w-full h-10 p-1.5 text-xs font-medium rounded-md border-2 border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-gradient-to-r from-slate-700/50 to-purple-900/50 text-purple-300 transition-all duration-200"
                    >
                      <option value="ATM pt" className="bg-slate-700 text-purple-300 font-bold">ATM pt</option>
                      <option value="ATM %" className="bg-slate-700 text-purple-300 font-bold">ATM %</option>
                      <option value="SP" className="bg-slate-700 text-purple-300 font-bold">SP</option>
                      <option value="SP &gt;=" className="bg-slate-700 text-purple-300 font-bold">SP &gt;=</option>
                      <option value="SP &lt;=" className="bg-slate-700 text-purple-300 font-bold">SP &lt;=</option>
                    </select>
                  </div>

                  {/* ATM */}
                  <div className="col-span-1">
                    {(leg.atmPt === 'ATM pt' || leg.atmPt === 'ATM %') ? (
                      <select
                        value={leg.atm}
                        onChange={(e) => updateLeg(leg.id, 'atm', e.target.value)}
                        className="w-full h-10 p-1.5 text-xs font-medium rounded-md border-2 border-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-gradient-to-r from-slate-700/50 to-indigo-900/50 text-indigo-300 transition-all duration-200"
                      >
                        {getATMOptions(leg.atmPt).map((option: string) => (
                          <option key={option} value={option} className="bg-slate-700 text-indigo-300 font-bold">{option}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="number"
                        value={leg.atm}
                        placeholder="Enter Premium Value"
                        onChange={(e) => updateLeg(leg.id, 'atm', e.target.value)}
                        className="w-full h-10 p-1.5 text-xs font-bold border-2 border-orange-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-gradient-to-r from-slate-700/50 to-orange-900/50 text-orange-300 transition-all duration-200"
                      />
                    )}
                  </div>

                  {/* SL Type */}
                  <div className="col-span-1">
                    <select
                      value={leg.slType}
                      onChange={(e) => updateLeg(leg.id, 'slType', e.target.value)}
                      className="w-full h-10 p-1.5 text-xs font-medium rounded-md border-2 border-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-gradient-to-r from-slate-700/50 to-red-900/50 text-red-300 transition-all duration-200"
                    >
                      <option value="SL %" className="bg-slate-700 text-red-300 font-bold">SL %</option>
                      <option value="SL pt" className="bg-slate-700 text-red-300 font-bold">SL pt</option>
                    </select>
                  </div>

                  {/* SL Value */}
                  <div className="col-span-1">
                    <input
                      type="number"
                      value={leg.slValue}
                      onChange={(e) => updateLeg(leg.id, 'slValue', parseInt(e.target.value) || 0)}
                      className="w-full h-10 p-1.5 text-xs font-bold border-2 border-red-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-gradient-to-r from-slate-700/50 to-red-900/50 text-red-300 transition-all duration-200"
                    />
                  </div>

                  {/* SL On */}
                  <div className="col-span-1">
                    <select
                      value={leg.slOnPrice}
                      onChange={(e) => updateLeg(leg.id, 'slOnPrice', e.target.value)}
                      className="w-full h-10 p-1.5 text-xs font-medium rounded-md border-2 border-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-gradient-to-r from-slate-700/50 to-red-900/50 text-red-300 transition-all duration-200"
                    >
                      <option value="On Price" className="bg-slate-700 text-red-300 font-bold">On Price</option>
                      <option value="On Close" className="bg-slate-700 text-red-300 font-bold">On Close</option>
                    </select>
                  </div>

                  {/* TP Type */}
                  <div className="col-span-1">
                    <select
                      value={leg.tpType}
                      onChange={(e) => updateLeg(leg.id, 'tpType', e.target.value)}
                      className="w-full h-10 p-1.5 text-xs font-medium rounded-md border-2 border-green-500/30 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-gradient-to-r from-slate-700/50 to-green-900/50 text-green-300 transition-all duration-200"
                    >
                      <option value="TP %" className="bg-slate-700 text-green-300 font-bold">TP %</option>
                      <option value="TP pt" className="bg-slate-700 text-green-300 font-bold">TP pt</option>
                    </select>
                  </div>

                  {/* TP Value */}
                  <div className="col-span-1">
                    <input
                      type="number"
                      value={leg.tpValue}
                      onChange={(e) => updateLeg(leg.id, 'tpValue', parseInt(e.target.value) || 0)}
                      className="w-full h-10 p-1.5 text-xs font-bold border-2 border-green-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-gradient-to-r from-slate-700/50 to-green-900/50 text-green-300 transition-all duration-200"
                    />
                  </div>

                  {/* TP On */}
                  <div className="col-span-1">
                    <select
                      value={leg.tpOnPrice}
                      onChange={(e) => updateLeg(leg.id, 'tpOnPrice', e.target.value)}
                      className="w-full h-10 p-1.5 text-xs font-medium rounded-md border-2 border-green-500/30 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-gradient-to-r from-slate-700/50 to-green-900/50 text-green-300 transition-all duration-200"
                    >
                      <option value="On Price" className="bg-slate-700 text-green-300 font-bold">On Price</option>
                      <option value="On Close" className="bg-slate-700 text-green-300 font-bold">On Close</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="col-span-1 flex space-x-1 h-10 items-center justify-end">
                    <button
                      type="button"
                      onClick={() => deleteLeg(leg.id)}
                      className="p-1.5 text-red-500 hover:text-red-700 transition-colors hover:bg-red-50 rounded-md"
                      title="Delete leg"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newLeg = { ...leg, id: Math.max(...orderLegs.map(l => l.id)) + 1 };
                        setOrderLegs((prev: any) => [...prev, newLeg]);
                      }}
                      className="p-1.5 text-orange-500 hover:text-orange-700 transition-colors hover:bg-orange-50 rounded-md"
                      title="Duplicate leg"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>

                {/* Advance Feature Section within each Order Leg - Only visible when Wait & Trade, Re Entry/Execute, or Trail SL is enabled globally */}
                {(advanceFeatures.waitAndTrade || advanceFeatures.reEntryExecute || advanceFeatures.trailSL) && (
                  <div className="mt-2 pt-2 border-t border-gray-200 relative">
                    {/* Subtle background pattern for Advance Feature section */}
                    <div className="absolute inset-0 opacity-3">
                      <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M0 20L20 0h20v20H0zM20 40L0 20h20v20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundSize: '15px 15px'
                      }}></div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center space-x-1.5 mb-2">
                        <ChevronDown size={14} className="text-blue-500" />
                        <span className="text-xs font-medium text-gray-700">Advance Feature</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {/* Wait & Trade Configuration - Only visible when Wait & Trade is enabled */}
                        {advanceFeatures.waitAndTrade && (
                          <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-md p-1.5 border border-gray-200 shadow-sm">
                            <Clock size={12} className="text-pink-500" />
                            <select
                              value={leg.waitAndTradeType || '%↑'}
                              onChange={(e) => updateLeg(leg.id, 'waitAndTradeType', e.target.value)}
                              className="px-2 py-1 text-xs border-2 border-pink-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 bg-gradient-to-r from-pink-50 to-rose-50 transition-all duration-200"
                            >
                              <option value="%↑">%↑</option>
                              <option value="%↓">%↓</option>
                              <option value="pt↑">pt↑</option>
                              <option value="pt↓">pt↓</option>
                              <option value="Equal">Equal</option>
                            </select>
                            <input
                              type="number"
                              value={leg.waitAndTradeValue || 0}
                              onChange={(e) => updateLeg(leg.id, 'waitAndTradeValue', parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              min="0"
                              max="100"
                              step="0.1"
                              className="w-16 px-2 py-1 text-xs border-2 border-pink-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 bg-gradient-to-r from-pink-50 to-rose-50 transition-all duration-200"
                            />
                          </div>
                        )}
                        
                        {/* ReEntry Configuration - Only visible when Re Entry/Execute is enabled */}
                        {advanceFeatures.reEntryExecute && (
                          <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-md p-1.5 border border-gray-200 shadow-sm">
                            <div className="flex items-center space-x-1.5">
                              <span className="text-xs font-medium text-gray-700">ReEntry</span>
                              <select
                                value={leg.reEntryType || 'ReEntry On Cost'}
                                onChange={(e) => updateLeg(leg.id, 'reEntryType', e.target.value)}
                                className="px-2 py-1 text-xs border-2 border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 transition-all duration-200"
                              >
                                <option value="ReExecute">ReExecute</option>
                                <option value="ReEntry On Cost">ReEntry On Cost</option>
                                <option value="ReEntry On Close">ReEntry On Close</option>
                              </select>
                            </div>
                            <input
                              type="number"
                              value={leg.reEntryValue || 5}
                              onChange={(e) => updateLeg(leg.id, 'reEntryValue', parseInt(e.target.value) || 0)}
                              placeholder="5"
                              min="0"
                              max="100"
                              step="1"
                              className="w-12 px-2 py-1 text-xs border-2 border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 transition-all duration-200"
                            />
                            <select
                              value={leg.reEntryCondition || 'On Close'}
                              onChange={(e) => updateLeg(leg.id, 'reEntryCondition', e.target.value)}
                              className="px-2 py-1 text-xs border-2 border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 transition-all duration-200"
                            >
                              <option value="On Close">On Close</option>
                              <option value="On Price">On Price</option>
                            </select>
                          </div>
                        )}

                        {/* Trailing Stop Loss Configuration - Only visible when Trail SL is enabled */}
                        {advanceFeatures.trailSL && (
                          <div className="bg-white/80 backdrop-blur-sm rounded-md p-1.5 border border-gray-200 shadow-sm">
                            <div className="flex items-center space-x-2">
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-700">TSL</span>
                                <select
                                  value={leg.tslType || 'TSL %'}
                                  onChange={(e) => updateLeg(leg.id, 'tslType', e.target.value)}
                                  className="px-2 py-1 text-xs border-2 border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50 transition-all duration-200"
                                >
                                  <option value="TSL %">TSL %</option>
                                  <option value="TSL pt">TSL pt</option>
                                </select>
                              </div>
                              
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-blue-700">If price moves (X)</span>
                                <input
                                  type="number"
                                  value={leg.tslValue1 || ''}
                                  onChange={(e) => updateLeg(leg.id, 'tslValue1', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                                  placeholder="Enter any value"
                                  className="w-20 h-8 px-2 py-1 text-xs border-2 border-blue-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-600 bg-white transition-all duration-200"
                                />
                              </div>
                              
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-600">Then Trail SL by (Y)</span>
                                <input
                                  type="number"
                                  value={leg.tslValue2 || ''}
                                  onChange={(e) => updateLeg(leg.id, 'tslValue2', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                                  placeholder="Enter any value"
                                  className="w-20 h-8 px-2 py-1 text-xs border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-600 bg-white transition-all duration-200"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Description text */}
                        <div className="text-gray-600 text-xs bg-white/60 backdrop-blur-sm px-2 py-1.5 rounded-md border border-gray-200">
                          {advanceFeatures.waitAndTrade && (
                            <span>Wait for price to move by <span className="font-semibold text-pink-600">{leg.waitAndTradeValue || 0}</span> {leg.waitAndTradeType || '%↑'}</span>
                          )}
                          {advanceFeatures.reEntryExecute && (
                            <span>ReEntry: <span className="font-semibold text-blue-600">{leg.reEntryType || 'ReEntry On Cost'}</span> with value <span className="font-semibold text-blue-600">{leg.reEntryValue || 5}</span> <span className="text-gray-500">({leg.reEntryCondition || 'On Close'})</span></span>
                          )}
                          {advanceFeatures.trailSL && (
                            <span>Trail SL: <span className="font-semibold text-purple-600">{leg.tslType || 'TSL %'}</span> with values <span className="font-semibold text-purple-600">{leg.tslValue1 || 5}</span> and <span className="font-semibold text-purple-600">{leg.tslValue2 || 6}</span></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        </div>

        {/* Advance Features Section */}
        <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl p-6 border border-blue-500/20">
          <div className="flex items-center space-x-2 mb-4">
            <button
              type="button"
              onClick={() => setShowAdvanceFeatures(!showAdvanceFeatures)}
              className="text-blue-300 hover:text-blue-200 transition-colors"
            >
              {showAdvanceFeatures ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            <h3 className="text-lg font-bold text-white">Advance Features</h3>
            <Info size={16} className="text-blue-300" />
          </div>

          {showAdvanceFeatures && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={advanceFeatures.moveSLToCost}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setAdvanceFeatures((prev: any) => ({
                      ...prev,
                      moveSLToCost: isChecked,
                      // If Move SL to Cost is selected, unselect and disable Pre Punch SL and Wait & Trade
                      prePunchSL: isChecked ? false : prev.prePunchSL,
                      waitAndTrade: isChecked ? false : prev.waitAndTrade
                    }));
                  }}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-white text-sm">Move SL to Cost</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={advanceFeatures.exitAllOnSLTgt}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setAdvanceFeatures((prev: any) => ({
                      ...prev,
                      exitAllOnSLTgt: isChecked,
                      // If Exit All on SL/Tgt is selected, unselect and disable Re Entry/Execute
                      reEntryExecute: isChecked ? false : prev.reEntryExecute
                    }));
                  }}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-white text-sm">Exit All on SL/Tgt</span>
              </label>

              <label className={`flex items-center space-x-2 ${advanceFeatures.moveSLToCost ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  checked={advanceFeatures.prePunchSL}
                  onChange={(e) => setAdvanceFeatures((prev: any) => ({ ...prev, prePunchSL: e.target.checked }))}
                  disabled={advanceFeatures.moveSLToCost}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="text-white text-sm">Pre Punch SL</span>
              </label>

              <label className={`flex items-center space-x-2 ${advanceFeatures.moveSLToCost ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  checked={advanceFeatures.waitAndTrade}
                  onChange={(e) => setAdvanceFeatures((prev: any) => ({ ...prev, waitAndTrade: e.target.checked }))}
                  disabled={advanceFeatures.moveSLToCost}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="text-white text-sm">Wait & Trade</span>
              </label>

              <label className={`flex items-center space-x-2 ${advanceFeatures.exitAllOnSLTgt ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  checked={advanceFeatures.reEntryExecute}
                  onChange={(e) => setAdvanceFeatures((prev: any) => ({ ...prev, reEntryExecute: e.target.checked }))}
                  disabled={advanceFeatures.exitAllOnSLTgt}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="text-white text-sm">Re Entry/Execute</span>
                <Info size={12} className="text-blue-300" />
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={advanceFeatures.trailSL}
                  onChange={(e) => setAdvanceFeatures((prev: any) => ({ ...prev, trailSL: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-white text-sm">Trail SL</span>
              </label>
            </div>
          )}
        </div>

        {/* Risk Management & Profit Trailing Card */}
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl p-6 border border-orange-500/20">
          <div className="space-y-6">
            {/* Risk Management Section */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                <span>Risk management</span>
                <div className="w-4 h-4 bg-orange-400 rounded-full flex items-center justify-center">
                  <span className="text-orange-900 text-xs font-bold">i</span>
                </div>
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs text-orange-300 mb-2">Exit When Over All Profit In Amount (INR)</label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={timeIndicatorFormData.daily_profit_limit || ''}
                    onChange={(e) => setTimeIndicatorFormData((prev: any) => ({
                      ...prev,
                      daily_profit_limit: parseFloat(e.target.value) || 0
                    }))}
                    className="w-full p-3 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-400 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-xs text-orange-300 mb-2">Exit When Over All Loss In Amount (INR)</label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={timeIndicatorFormData.daily_loss_limit || ''}
                    onChange={(e) => setTimeIndicatorFormData((prev: any) => ({
                      ...prev,
                      daily_loss_limit: parseFloat(e.target.value) || 0
                    }))}
                    className="w-full p-3 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-400 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs text-orange-300 mb-2">Max Trade Cycle</label>
                  <input
                    type="number"
                    defaultValue="1"
                    value={timeIndicatorFormData.max_trade_cycles || 1}
                    onChange={(e) => setTimeIndicatorFormData((prev: any) => ({
                      ...prev,
                      max_trade_cycles: parseInt(e.target.value) || 1
                    }))}
                    className="w-full p-3 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-400 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-xs text-orange-300 mb-2">No Trade After</label>
                  <div className="flex items-center space-x-2">
                    {/* Hour Dropdown */}
                    <div className="relative flex-1">
                      <select
                        name="noTradeAfterHour"
                        value={timeIndicatorFormData.noTradeAfter?.split(':')[0] || '15'}
                        onChange={(e) => {
                          const currentMinute = timeIndicatorFormData.noTradeAfter?.split(':')[1] || '15';
                          const newTime = `${e.target.value}:${currentMinute}`;
                          setTimeIndicatorFormData((prev: any) => ({
                            ...prev,
                            noTradeAfter: newTime
                          }));
                        }}
                        className="w-full p-3 pr-8 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-orange-500/30 rounded-lg text-white focus:ring-1 focus:ring-orange-400 focus:outline-none transition-all duration-300 backdrop-blur-sm appearance-none cursor-pointer hover:border-orange-400"
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i.toString().padStart(2, '0')} className="bg-slate-800 text-white">
                            {i.toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-orange-300"></div>
                      </div>
                    </div>
                    
                    {/* Separator */}
                    <span className="text-orange-300 font-bold text-lg">:</span>
                    
                    {/* Minute Dropdown */}
                    <div className="relative flex-1">
                      <select
                        name="noTradeAfterMinute"
                        value={timeIndicatorFormData.noTradeAfter?.split(':')[1] || '15'}
                        onChange={(e) => {
                          const currentHour = timeIndicatorFormData.noTradeAfter?.split(':')[0] || '15';
                          const newTime = `${currentHour}:${e.target.value}`;
                          setTimeIndicatorFormData((prev: any) => ({
                            ...prev,
                            noTradeAfter: newTime
                          }));
                        }}
                        className="w-full p-3 pr-8 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-orange-500/30 rounded-lg text-white focus:ring-1 focus:ring-orange-400 focus:outline-none transition-all duration-300 backdrop-blur-sm appearance-none cursor-pointer hover:border-orange-400"
                      >
                        {Array.from({ length: 60 }, (_, i) => (
                          <option key={i} value={i.toString().padStart(2, '0')} className="bg-slate-800 text-white">
                            {i.toString().padStart(2, '0')} 
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-orange-300"></div>
                      </div>
                    </div>
                    
                    {/* Clock Icon */}
                    <div className="flex-shrink-0">
                      <Clock size={20} className="text-orange-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profit Trailing Section */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                <span>Profit Trailing</span>
                <div className="w-4 h-4 bg-orange-400 rounded-full flex items-center justify-center">
                  <span className="text-orange-900 text-xs font-bold">i</span>
                </div>
              </h3>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="profit_trailing"
                    value="no_trailing"
                    checked={profitTrailingType === 'no_trailing'}
                    onChange={(e) => setProfitTrailingType(e.target.value as any)}
                    className="w-4 h-4 text-orange-600 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-full focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                  />
                  <span className="text-white font-medium">No Trailing</span>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="profit_trailing"
                    value="lock_fix_profit"
                    checked={profitTrailingType === 'lock_fix_profit'}
                    onChange={(e) => setProfitTrailingType(e.target.value as any)}
                    className="w-4 h-4 text-orange-600 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-full focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                  />
                  <span className="text-white font-medium">Lock Fix Profit</span>
                  {profitTrailingType === 'lock_fix_profit' && (
                    <div className="flex items-center space-x-2 ml-4">
                      <input
                        type="number"
                        placeholder="If profit reaches"
                        className="w-28 p-2 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-400 focus:outline-none transition-all duration-300 backdrop-blur-sm text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Lock profit at"
                        className="w-28 p-2 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-400 focus:outline-none transition-all duration-300 backdrop-blur-sm text-sm"
                      />
                    </div>
                  )}
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="profit_trailing"
                    value="trail_profit"
                    checked={profitTrailingType === 'trail_profit'}
                    onChange={(e) => setProfitTrailingType(e.target.value as any)}
                    className="w-4 h-4 text-orange-600 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-full focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                  />
                  <span className="text-white font-medium">Trail Profit</span>
                  {profitTrailingType === 'trail_profit' && (
                    <div className="flex items-center space-x-2 ml-4">
                      <input
                        type="number"
                        placeholder="On every increase of"
                        className="w-32 p-2 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-400 focus:outline-none transition-all duration-300 backdrop-blur-sm text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Trail profit by"
                        className="w-32 p-2 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-400 focus:outline-none transition-all duration-300 backdrop-blur-sm text-sm"
                      />
                    </div>
                  )}
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="profit_trailing"
                    value="lock_and_trail"
                    checked={profitTrailingType === 'lock_and_trail'}
                    onChange={(e) => setProfitTrailingType(e.target.value as any)}
                    className="w-4 h-4 text-orange-600 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-full focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                  />
                  <span className="text-white font-medium">Lock and Trail</span>
                  {profitTrailingType === 'lock_and_trail' && (
                    <div className="flex items-center space-x-2 ml-4">
                      <input
                        type="number"
                        placeholder="If profit reach"
                        className="w-32 p-2 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-400 focus:outline-none transition-all duration-300 backdrop-blur-sm text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Lock profit at"
                        className="w-32 p-2 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-400 focus:outline-none transition-all duration-300 backdrop-blur-sm text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Every profit increase by"
                        className="w-32 p-2 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-400 focus:outline-none transition-all duration-300 backdrop-blur-sm text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Trail profit by"
                        className="w-32 p-2 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-400 focus:outline-none transition-all duration-300 backdrop-blur-sm text-sm"
                      />
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Name */}
        <div className="bg-gradient-to-br from-slate-800/80 to-blue-900/80 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30 shadow-xl">
          <label className="block text-white text-sm font-medium mb-2">Strategy Name</label>
          <input
            type="text"
            name="name"
            value={timeIndicatorFormData.name}
            onChange={(e) => setTimeIndicatorFormData((prev: any) => ({
              ...prev,
              name: e.target.value
            }))}
            className="w-full p-3 bg-slate-700/50 border border-blue-500/50 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:outline-none backdrop-blur-sm"
            placeholder="Enter strategy name"
            required
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={!isUnderlyingSelected || !timeIndicatorFormData.name.trim() || !timeIndicatorFormData.time_order_product_type}
            className={`px-8 py-3 font-semibold rounded-lg transition-all duration-300 shadow-lg ${
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
  );
};

export default TimeBasedStrategy;
