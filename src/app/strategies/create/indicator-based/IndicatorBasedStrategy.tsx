'use client'

import React from 'react';
import { ArrowLeft, BarChart3, CheckCircle, AlertTriangle, Search, X, Plus, Clock, Save, Info } from 'lucide-react';

interface IndicatorBasedStrategyProps {
  timeIndicatorFormData: any;
  setTimeIndicatorFormData: (data: any) => void;
  setStrategyCreationType: (type: any) => void;
  handleTimeIndicatorSubmit: (e: React.FormEvent) => void;
  instrumentSearch: any;
  handleInstrumentSearch: (query: string) => void;
  handleInstrumentSelect: (instrument: any) => void;
  handleInstrumentRemove: () => void;
  availableInstruments: any[];
  isUnderlyingSelected: boolean;
  conditionBlocks: number;
  setConditionBlocks: (blocks: any) => void;
  logicalOperator: 'AND' | 'OR';
  setLogicalOperator: (operator: 'AND' | 'OR') => void;
  longComparator: string;
  shortComparator: string;
  handleLongComparatorChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleShortComparatorChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  selectedIndicators: any;
  openIndicatorModal: (position: 'long1' | 'long2' | 'short1' | 'short2') => void;
  indicators: any[];
  strikeType: string;
  setStrikeType: (type: string) => void;
  customPrice: string;
  setCustomPrice: (price: string) => void;
  profitTrailingType: string;
  setProfitTrailingType: (type: any) => void;
  handleTimeIndicatorChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  addConditionBlock: () => void;
}

const IndicatorBasedStrategy: React.FC<IndicatorBasedStrategyProps> = ({
  timeIndicatorFormData,
  setTimeIndicatorFormData,
  setStrategyCreationType,
  handleTimeIndicatorSubmit,
  instrumentSearch,
  handleInstrumentSearch,
  handleInstrumentSelect,
  handleInstrumentRemove,
  availableInstruments,
  isUnderlyingSelected,
  conditionBlocks,
  setConditionBlocks,
  logicalOperator,
  setLogicalOperator,
  longComparator,
  shortComparator,
  handleLongComparatorChange,
  handleShortComparatorChange,
  selectedIndicators,
  openIndicatorModal,
  indicators,
  strikeType,
  setStrikeType,
  customPrice,
  setCustomPrice,
  profitTrailingType,
  setProfitTrailingType,
  handleTimeIndicatorChange,
  addConditionBlock
}) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setStrategyCreationType('time-indicator')}
            className="group relative p-4 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 text-white hover:from-white/20 hover:to-white/10 transition-all duration-500 transform hover:scale-110 hover:rotate-12 shadow-2xl hover:shadow-green-500/25"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
      </div>

      {/* Underlying Search & Select Card */}
      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl p-4 border border-blue-500/20">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-3">
          <span>Select Underlying</span>
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

          {/* Trading Configuration */}
          <div className="mt-4 space-y-4">
            {/* Row 1: Order Type, Start Time, Square Off, Days */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Order Type */}
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
                        onChange={(e) => setTimeIndicatorFormData((prev: any) => ({ ...prev, order_type: e.target.value }))}
                        className="w-3 h-3 text-blue-600 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-full focus:ring-1 focus:ring-blue-400"
                      />
                      <span className="text-white text-xs">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-blue-300 text-xs font-semibold mb-2">
                  Start Time <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center space-x-2">
                  {/* Hour Dropdown */}
                  <div className="relative flex-1">
                    <select
                      name="start_time_hour"
                      value={(timeIndicatorFormData.start_time || '09:15').split(':')[0]}
                      onChange={(e) => {
                        const currentMinute = (timeIndicatorFormData.start_time || '09:15').split(':')[1];
                        const newTime = `${e.target.value}:${currentMinute}`;
                        setTimeIndicatorFormData((prev: any) => ({
                          ...prev,
                          start_time: newTime
                        }));
                      }}
                      className="w-full p-2 pr-6 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-blue-500/30 rounded-lg text-white text-xs focus:ring-1 focus:ring-blue-400 focus:outline-none appearance-none cursor-pointer hover:border-blue-400"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i.toString().padStart(2, '0')} className="bg-slate-800 text-white">
                          {i.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <div className="w-0 h-0 border-l-3 border-l-transparent border-r-3 border-r-transparent border-t-3 border-t-blue-300"></div>
                    </div>
                  </div>
                  
                  {/* Separator */}
                  <span className="text-blue-300 font-bold text-sm">:</span>
                  
                  {/* Minute Dropdown */}
                  <div className="relative flex-1">
                    <select
                      name="start_time_minute"
                      value={(timeIndicatorFormData.start_time || '09:15').split(':')[1]}
                      onChange={(e) => {
                        const currentHour = (timeIndicatorFormData.start_time || '09:15').split(':')[0];
                        const newTime = `${currentHour}:${e.target.value}`;
                        setTimeIndicatorFormData((prev: any) => ({
                          ...prev,
                          start_time: newTime
                        }));
                      }}
                      className="w-full p-2 pr-6 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-blue-500/30 rounded-lg text-white text-xs focus:ring-1 focus:ring-blue-400 focus:outline-none appearance-none cursor-pointer hover:border-blue-400"
                    >
                      {Array.from({ length: 60 }, (_, i) => (
                        <option key={i} value={i.toString().padStart(2, '0')} className="bg-slate-800 text-white">
                          {i.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <div className="w-0 h-0 border-l-3 border-l-transparent border-r-3 border-r-transparent border-t-3 border-t-blue-300"></div>
                    </div>
                  </div>
                  
                  {/* Clock Icon */}
                  <div className="flex-shrink-0">
                    <Clock size={12} className="text-blue-300" />
                  </div>
                </div>
              </div>

              {/* Square Off */}
              <div>
                <label className="block text-blue-300 text-xs font-semibold mb-2">
                  Square Off <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center space-x-2">
                  {/* Hour Dropdown */}
                  <div className="relative flex-1">
                    <select
                      name="square_off_time_hour"
                      value={(timeIndicatorFormData.square_off_time || '15:15').split(':')[0]}
                      onChange={(e) => {
                        const currentMinute = (timeIndicatorFormData.square_off_time || '15:15').split(':')[1];
                        const newTime = `${e.target.value}:${currentMinute}`;
                        setTimeIndicatorFormData((prev: any) => ({
                          ...prev,
                          square_off_time: newTime
                        }));
                      }}
                      className="w-full p-2 pr-6 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-blue-500/30 rounded-lg text-white text-xs focus:ring-1 focus:ring-blue-400 focus:outline-none appearance-none cursor-pointer hover:border-blue-400"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i.toString().padStart(2, '0')} className="bg-slate-800 text-white">
                          {i.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <div className="w-0 h-0 border-l-3 border-l-transparent border-r-3 border-r-transparent border-t-3 border-t-blue-300"></div>
                    </div>
                  </div>
                  
                  {/* Separator */}
                  <span className="text-blue-300 font-bold text-sm">:</span>
                  
                  {/* Minute Dropdown */}
                  <div className="relative flex-1">
                    <select
                      name="square_off_time_minute"
                      value={(timeIndicatorFormData.square_off_time || '15:15').split(':')[1]}
                      onChange={(e) => {
                        const currentHour = (timeIndicatorFormData.square_off_time || '15:15').split(':')[0];
                        const newTime = `${currentHour}:${e.target.value}`;
                        setTimeIndicatorFormData((prev: any) => ({
                          ...prev,
                          square_off_time: newTime
                        }));
                      }}
                      className="w-full p-2 pr-6 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-blue-500/30 rounded-lg text-white text-xs focus:ring-1 focus:ring-blue-400 focus:outline-none appearance-none cursor-pointer hover:border-blue-400"
                    >
                      {Array.from({ length: 60 }, (_, i) => (
                        <option key={i} value={i.toString().padStart(2, '0')} className="bg-slate-800 text-white">
                          {i.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <div className="w-0 h-0 border-l-3 border-l-transparent border-r-3 border-r-transparent border-t-3 border-t-blue-300"></div>
                    </div>
                  </div>
                  
                  {/* Clock Icon */}
                  <div className="flex-shrink-0">
                    <Clock size={12} className="text-blue-300" />
                  </div>
                </div>
              </div>

              {/* Days of Week */}
              <div>
                <label className="block text-blue-300 text-xs font-semibold mb-2">Days of Week</label>
                <div className="grid grid-cols-5 gap-1">
                  {['MON', 'TUE', 'WED', 'THU', 'FRI'].map((day) => (
                    <button
                      key={day}
                      onClick={() => {
                        const dayKey = day.toLowerCase() as keyof typeof timeIndicatorFormData.working_days;
                        setTimeIndicatorFormData((prev: any) => ({
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

            {/* Row 2: Transaction Type, Chart Type, Interval */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {/* Transaction Type */}
              <div>
                <label className="block text-blue-300 text-xs font-semibold mb-2">Transaction Type</label>
                <div className="flex space-x-1">
                  {['Both Side', 'Only Long', 'Only Short'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setTimeIndicatorFormData((prev: any) => ({ ...prev, transaction_type: type }))}
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
                <div className="flex items-center justify-end mt-1">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                </div>
              </div>

              {/* Chart Type */}
              <div>
                <label className="block text-blue-300 text-xs font-semibold mb-2">Chart Type</label>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setTimeIndicatorFormData((prev: any) => ({ ...prev, chart_type: 'Candle' }))}
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

              {/* Interval */}
              <div>
                <label className="block text-blue-300 text-xs font-semibold mb-2">Interval</label>
                <div className="flex space-x-1">
                  {['1 Min', '3 Min', '5 Min', '10 Min', '15 Min', '30 Min', '1 H'].map((interval) => (
                    <button
                      key={interval}
                      onClick={() => setTimeIndicatorFormData((prev: any) => ({ ...prev, interval }))}
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
      </div>

      {/* Entry Conditions Card */}
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
          {/* Dynamic Condition Blocks */}
          {Array.from({ length: conditionBlocks }, (_, blockIndex) => (
            <div key={blockIndex}>
              {/* Condition Block */}
              <div className="space-y-4 relative">
                {/* Delete Button - Show only for blocks after the first one */}
                {blockIndex > 0 && (
                  <div className="absolute top-0 right-0 z-10">
                    <button
                      onClick={() => setConditionBlocks((prev: number) => prev - 1)}
                      className="p-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-full transition-all duration-200 hover:scale-110"
                      title="Delete this condition block"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                
                {/* Long Entry condition - Show only if Both Side or Only Long is selected */}
                {(timeIndicatorFormData.transaction_type === 'Both Side' || timeIndicatorFormData.transaction_type === 'Only Long') && (
                  <div>
                    <span className="text-green-400 font-semibold text-sm">Long Entry condition</span>
                    <div className="mt-2 space-y-3">
                      {/* First Indicator */}
                      <div className="grid grid-cols-3 gap-2">
                        <button 
                          type="button"
                          onClick={() => openIndicatorModal('long1')}
                          disabled={!isUnderlyingSelected}
                          className={`p-2 border rounded-lg text-white text-xs focus:outline-none transition-all duration-200 text-left ${
                            isUnderlyingSelected
                              ? 'bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-green-500/30 focus:ring-1 focus:ring-green-400 hover:border-green-400'
                              : 'bg-gradient-to-r from-gray-600/80 to-gray-700/80 border-gray-500/30 cursor-not-allowed opacity-50'
                          }`}
                        >
                          {selectedIndicators.long1?.indicator ? 
                            (indicators || []).find(ind => ind.value === selectedIndicators.long1?.indicator)?.label || 'Select Indicator' 
                            : 'Select Indicator'
                          }
                        </button>
                        
                        <select 
                          value={longComparator}
                          onChange={handleLongComparatorChange}
                          disabled={!isUnderlyingSelected}
                          className={`p-2 border rounded-lg text-white text-xs focus:outline-none appearance-none ${
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
                        
                        <button 
                          type="button"
                          onClick={() => openIndicatorModal('long2')}
                          disabled={!isUnderlyingSelected}
                          className={`p-2 border rounded-lg text-white text-xs focus:outline-none transition-all duration-200 text-left ${
                            isUnderlyingSelected
                              ? 'bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-green-500/30 focus:ring-1 focus:ring-green-400 hover:border-green-400'
                              : 'bg-gradient-to-r from-gray-600/80 to-gray-700/80 border-gray-500/30 cursor-not-allowed opacity-50'
                          }`}
                        >
                          {selectedIndicators.long2?.indicator ? 
                            (indicators || []).find(ind => ind.value === selectedIndicators.long2?.indicator)?.label || 'Select Indicator' 
                            : 'Select Indicator'
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Short Entry condition - Show only if Both Side or Only Short is selected */}
                {(timeIndicatorFormData.transaction_type === 'Both Side' || timeIndicatorFormData.transaction_type === 'Only Short') && (
                  <div>
                    <span className="text-red-400 font-semibold text-sm">Short Entry condition</span>
                    <div className="mt-2 space-y-3">
                      {/* First Indicator */}
                      <div className="grid grid-cols-3 gap-2">
                        <button 
                          type="button"
                          onClick={() => openIndicatorModal('short1')}
                          disabled={!isUnderlyingSelected}
                          className={`p-2 border rounded-lg text-white text-xs focus:outline-none transition-all duration-200 text-left ${
                            isUnderlyingSelected
                              ? 'bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-red-500/30 focus:ring-1 focus:ring-red-400 hover:border-red-400'
                              : 'bg-gradient-to-r from-gray-600/80 to-gray-700/80 border-gray-500/30 cursor-not-allowed opacity-50'
                          }`}
                        >
                          {selectedIndicators.short1?.indicator ? 
                            (indicators || []).find(ind => ind.value === selectedIndicators.short1?.indicator)?.label || 'Select Indicator' 
                            : 'Select Indicator'
                          }
                        </button>
                        
                        <select 
                          value={shortComparator}
                          onChange={handleShortComparatorChange}
                          disabled={!isUnderlyingSelected}
                          className={`p-2 border rounded-lg text-white text-xs focus:outline-none appearance-none ${
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
                        
                        <button 
                          type="button"
                          onClick={() => openIndicatorModal('short2')}
                          disabled={!isUnderlyingSelected}
                          className={`p-2 border rounded-lg text-white text-xs focus:outline-none transition-all duration-200 text-left ${
                            isUnderlyingSelected
                              ? 'bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-red-500/30 focus:ring-1 focus:ring-red-400 hover:border-red-400'
                              : 'bg-gradient-to-r from-gray-600/80 to-gray-700/80 border-gray-500/30 cursor-not-allowed opacity-50'
                          }`}
                        >
                          {selectedIndicators.short2?.indicator ? 
                            (indicators || []).find(ind => ind.value === selectedIndicators.short2?.indicator)?.label || 'Select Indicator' 
                            : 'Select Indicator'
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* AND/OR Toggle - Show only if there are multiple blocks and not the last block */}
              {conditionBlocks > 1 && blockIndex < conditionBlocks - 1 && (
                <div className="flex justify-center my-4">
                  <div className="flex bg-white/10 rounded-lg p-1 border border-blue-500/30">
                    <button 
                      onClick={() => setLogicalOperator('AND')}
                      className={`px-4 py-2 rounded text-xs font-medium transition-colors ${
                        logicalOperator === 'AND' 
                          ? 'bg-blue-500 text-white' 
                          : 'text-blue-300 hover:text-white'
                      }`}
                    >
                      AND
                    </button>
                    <button 
                      onClick={() => setLogicalOperator('OR')}
                      className={`px-4 py-2 rounded text-xs font-medium transition-colors ${
                        logicalOperator === 'OR' 
                          ? 'bg-blue-500 text-white' 
                          : 'text-blue-300 hover:text-white'
                      }`}
                    >
                      OR
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add Condition Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={addConditionBlock}
              disabled={!isUnderlyingSelected}
              className={`px-6 py-3 font-semibold rounded-lg transition-all duration-300 transform ${
                isUnderlyingSelected
                  ? 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-105 hover:shadow-lg cursor-pointer'
                  : 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-50'
              }`}
            >
              Add Condition +
            </button>
          </div>
        </div>
      </div>

      {/* Trading Configuration Card */}
      <div className={`rounded-2xl p-6 border transition-all duration-300 ${
        isUnderlyingSelected 
          ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20' 
          : 'bg-gradient-to-r from-gray-500/10 to-gray-600/10 border-gray-500/20 opacity-50'
      }`}>
        <div className="space-y-6">
          {/* Conditions Section */}
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <span className="text-green-600 font-semibold">When Long Condition</span>
              <div className="flex items-center space-x-1">
                <select 
                  id="long-condition-select"
                  disabled={!isUnderlyingSelected}
                  className={`px-3 py-1 rounded-lg text-sm font-medium border focus:outline-none ${
                    isUnderlyingSelected
                      ? 'bg-green-100 text-green-700 border-green-300 focus:ring-1 focus:ring-green-400'
                      : 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed opacity-50'
                  }`}
                  onChange={(e) => {
                    if (!isUnderlyingSelected) return;
                    const selectedValue = e.target.value;
                    const shortConditionSelect = document.getElementById('short-condition-select') as HTMLSelectElement;
                    if (shortConditionSelect) {
                      // Set the opposite value in the short condition select
                      shortConditionSelect.value = selectedValue === 'CE' ? 'PE' : 'CE';
                    }
                  }}
                >
                  <option value="CE">CE</option>
                  <option value="PE">PE</option>
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-3 ml-8">
              <span className="text-red-600 font-semibold">When Short Condition</span>
              <div className="flex items-center space-x-1">
                <select 
                  id="short-condition-select"
                  disabled={!isUnderlyingSelected}
                  className={`px-3 py-1 rounded-lg text-sm font-medium border focus:outline-none ${
                    isUnderlyingSelected
                      ? 'bg-red-100 text-red-700 border-red-300 focus:ring-1 focus:ring-red-400'
                      : 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed opacity-50'
                  }`}
                  onChange={(e) => {
                    if (!isUnderlyingSelected) return;
                    const selectedValue = e.target.value;
                    const longConditionSelect = document.getElementById('long-condition-select') as HTMLSelectElement;
                    if (longConditionSelect) {
                      // Set the opposite value in the long condition select
                      longConditionSelect.value = selectedValue === 'CE' ? 'PE' : 'CE';
                    }
                  }}
                >
                  <option value="PE">PE</option>
                  <option value="CE">CE</option>
                </select>
              </div>
            </div>
          </div>

          {/* Trading Parameters Row */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <div className="flex flex-col">
              <label className="text-xs text-blue-300 mb-1">Action</label>
              <select 
                value={timeIndicatorFormData.action || 'BUY'}
                disabled={!isUnderlyingSelected}
                onChange={(e) => setTimeIndicatorFormData((prev: any) => ({ ...prev, action: e.target.value }))}
                className={`p-2 rounded text-sm font-medium border focus:outline-none ${
                  isUnderlyingSelected
                    ? 'bg-green-100 text-green-700 border-green-300 focus:ring-1 focus:ring-green-400'
                    : 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed opacity-50'
                }`}
              >
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>
            </div>
          
            <div className="flex flex-col">
              <label className="text-xs text-blue-300 mb-1">Qty</label>
              <input 
                type="number" 
                placeholder="75"
                value={timeIndicatorFormData.qty || ''}
                disabled={!isUnderlyingSelected}
                className={`w-full p-2 border rounded text-sm focus:outline-none ${
                  isUnderlyingSelected
                    ? 'border-gray-300 focus:ring-1 focus:ring-blue-400'
                    : 'border-gray-500 bg-gray-100 text-gray-500 cursor-not-allowed opacity-50'
                }`}
                onChange={(e) => {
                  if (!isUnderlyingSelected) return;
                  setTimeIndicatorFormData((prev: any) => ({ ...prev, qty: e.target.value }));
                }}
              />
            </div>
          
            <div className="flex flex-col">
              <label className="text-xs text-blue-300 mb-1">Expiry</label>
              <select 
                disabled={!isUnderlyingSelected}
                className={`px-2 py-2 rounded text-sm font-medium border focus:outline-none ${
                  isUnderlyingSelected
                    ? 'bg-blue-100 text-blue-700 border-blue-300 focus:ring-1 focus:ring-blue-400'
                    : 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed opacity-50'
                }`}
              >
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-blue-300 mb-1">Strike Configuration</label>
              <div className="flex space-x-1">
                <select 
                  value={strikeType}
                  disabled={!isUnderlyingSelected}
                  className={`px-2 py-2 rounded text-sm font-medium border focus:outline-none ${
                    isUnderlyingSelected
                      ? 'bg-blue-100 text-blue-700 border-blue-300 focus:ring-1 focus:ring-blue-400'
                      : 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed opacity-50'
                  }`}
                  onChange={(e) => {
                    if (!isUnderlyingSelected) return;
                    setStrikeType(e.target.value);
                    setCustomPrice(''); // Reset custom price when strike type changes
                  }}
                >
                  <option value="ATM pt">ATM pt</option>
                  <option value="ATM %">ATM %</option>
                  <option value="SP">SP</option>
                  <option value="SP >=">SP &gt;=</option>
                  <option value="SP <=">SP &lt;=</option>
                </select>
                
                {/* Dynamic strike offset based on strike type */}
                {strikeType === 'ATM pt' && (
                  <select 
                    className="bg-blue-100 text-blue-700 px-2 py-2 rounded text-sm font-medium border border-blue-300 focus:ring-1 focus:ring-blue-400 focus:outline-none"
                    onChange={(e) => {
                      // Handle ATM pt selection
                    }}
                  >
                    <option value="ITM 1500">ITM 1500</option>
                    <option value="ITM 1400">ITM 1400</option>
                    <option value="ITM 1300">ITM 1300</option>
                    <option value="ITM 1200">ITM 1200</option>
                    <option value="ITM 1100">ITM 1100</option>
                    <option value="ITM 1000">ITM 1000</option>
                    <option value="ITM 900">ITM 900</option>
                    <option value="ITM 800">ITM 800</option>
                    <option value="ITM 700">ITM 700</option>
                    <option value="ITM 600">ITM 600</option>
                    <option value="ITM 500">ITM 500</option>
                    <option value="ITM 400">ITM 400</option>
                    <option value="ITM 300">ITM 300</option>
                    <option value="ITM 200">ITM 200</option>
                    <option value="ITM 100">ITM 100</option>
                    <option value="ATM">ATM</option>
                    <option value="OTM 100">OTM 100</option>
                    <option value="OTM 200">OTM 200</option>
                    <option value="OTM 300">OTM 300</option>
                    <option value="OTM 400">OTM 400</option>
                    <option value="OTM 500">OTM 500</option>
                    <option value="OTM 600">OTM 600</option>
                    <option value="OTM 700">OTM 700</option>
                    <option value="OTM 800">OTM 800</option>
                    <option value="OTM 900">OTM 900</option>
                    <option value="OTM 1000">OTM 1000</option>
                    <option value="OTM 1100">OTM 1100</option>
                    <option value="OTM 1200">OTM 1200</option>
                    <option value="OTM 1300">OTM 1300</option>
                    <option value="OTM 1400">OTM 1400</option>
                    <option value="OTM 1500">OTM 1500</option>
                  </select>
                )}
                
                {strikeType === 'ATM %' && (
                  <select 
                    className="bg-blue-100 text-blue-700 px-2 py-2 rounded text-sm font-medium border border-blue-300 focus:ring-1 focus:ring-blue-400 focus:outline-none"
                    onChange={(e) => {
                      // Handle ATM % selection
                    }}
                  >
                    <option value="ITM 20.0%">ITM 20.0%</option>
                    <option value="ITM 19.0%">ITM 19.0%</option>
                    <option value="ITM 18.0%">ITM 18.0%</option>
                    <option value="ITM 17.0%">ITM 17.0%</option>
                    <option value="ITM 16.0%">ITM 16.0%</option>
                    <option value="ITM 15.0%">ITM 15.0%</option>
                    <option value="ITM 14.0%">ITM 14.0%</option>
                    <option value="ITM 13.0%">ITM 13.0%</option>
                    <option value="ITM 12.0%">ITM 12.0%</option>
                    <option value="ITM 11.0%">ITM 11.0%</option>
                    <option value="ITM 10.0%">ITM 10.0%</option>
                    <option value="ITM 9.0%">ITM 9.0%</option>
                    <option value="ITM 8.0%">ITM 8.0%</option>
                    <option value="ITM 7.0%">ITM 7.0%</option>
                    <option value="ITM 6.0%">ITM 6.0%</option>
                    <option value="ITM 5.0%">ITM 5.0%</option>
                    <option value="ITM 4.0%">ITM 4.0%</option>
                    <option value="ITM 3.0%">ITM 3.0%</option>
                    <option value="ITM 2.0%">ITM 2.0%</option>
                    <option value="ITM 1.0%">ITM 1.0%</option>
                    <option value="ATM">ATM</option>
                    <option value="OTM 1.0%">OTM 1.0%</option>
                    <option value="OTM 2.0%">OTM 2.0%</option>
                    <option value="OTM 3.0%">OTM 3.0%</option>
                    <option value="OTM 4.0%">OTM 4.0%</option>
                    <option value="OTM 5.0%">OTM 5.0%</option>
                    <option value="OTM 6.0%">OTM 6.0%</option>
                    <option value="OTM 7.0%">OTM 7.0%</option>
                    <option value="OTM 8.0%">OTM 8.0%</option>
                    <option value="OTM 9.0%">OTM 9.0%</option>
                    <option value="OTM 10.0%">OTM 10.0%</option>
                    <option value="OTM 11.0%">OTM 11.0%</option>
                    <option value="OTM 12.0%">OTM 12.0%</option>
                    <option value="OTM 13.0%">OTM 13.0%</option>
                    <option value="OTM 14.0%">OTM 14.0%</option>
                    <option value="OTM 15.0%">OTM 15.0%</option>
                    <option value="OTM 16.0%">OTM 16.0%</option>
                    <option value="OTM 17.0%">OTM 17.0%</option>
                    <option value="OTM 18.0%">OTM 18.0%</option>
                    <option value="OTM 19.0%">OTM 19.0%</option>
                    <option value="OTM 20.0%">OTM 20.0%</option>
                  </select>
                )}
                
                {(strikeType === 'SP' || strikeType === 'SP >=' || strikeType === 'SP <=') && (
                  <input 
                    type="number" 
                    value={customPrice}
                    placeholder="Enter Premium Value"
                    className="bg-black text-white px-2 py-2 rounded text-sm font-medium border border-gray-600 focus:ring-1 focus:ring-white focus:outline-none"
                    style={{ width: '120px' }}
                    onChange={(e) => setCustomPrice(e.target.value)}
                  />
                )}
              </div>
            </div>
                
            <div className="flex flex-col">
              <label className="text-xs text-blue-300 mb-1">SL Type</label>
              <select className="bg-blue-100 text-blue-700 px-2 py-2 rounded text-sm font-medium border border-blue-300 focus:ring-1 focus:ring-blue-400 focus:outline-none">
                <option value="SL pt">SL pt</option>
                <option value="SL %">SL %</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            <input 
              type="number" 
              placeholder="30" 
              className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
            />
           
            <div className="flex flex-col">
              <label className="text-xs text-blue-300 mb-1">SL On</label>
              <select className="bg-blue-100 text-blue-700 px-2 py-2 rounded text-sm font-medium border border-blue-300 focus:ring-1 focus:ring-blue-400 focus:outline-none">
                <option value="On Price">On Price</option>
                <option value="On Close">On Close</option>
              </select>
            </div>
           
            <div className="flex flex-col">
              <label className="text-xs text-blue-300 mb-1">TP Type</label>
              <select className="bg-blue-100 text-blue-700 px-2 py-2 rounded text-sm font-medium border border-blue-300 focus:ring-1 focus:ring-blue-400 focus:outline-none">
                <option value="TP pt">TP pt</option>
                <option value="TP %">TP %</option>
              </select>
            </div>
           
            <input
              type="number"
              placeholder="0" 
              className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-end">
            <div className="flex flex-col">
              <label className="text-xs text-blue-300 mb-1">TP On</label>
              <select className="bg-blue-100 text-blue-700 px-2 py-2 rounded text-sm font-medium border border-blue-300 focus:ring-1 focus:ring-blue-400 focus:outline-none">
                <option value="On Price">On Price</option>
                <option value="On Close">On Close</option>
              </select>
            </div>
          </div>
        </div>
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
                  onChange={(e) => setTimeIndicatorFormData((prev: any) => ({ ...prev, daily_profit_limit: e.target.value }))}
                  className="w-full p-3 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-400 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                />
              </div>
              
              <div className="flex flex-col">
                <label className="text-xs text-orange-300 mb-2">Exit When Over All Loss In Amount (INR)</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={timeIndicatorFormData.daily_loss_limit || ''}
                  onChange={(e) => setTimeIndicatorFormData((prev: any) => ({ ...prev, daily_loss_limit: e.target.value }))}
                  className="w-full p-3 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-400 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-orange-300 mb-2">Max Trade Cycle</label>
                <input
                  type="number"
                  value={timeIndicatorFormData.max_trade_cycles || ''}
                  onChange={(e) => setTimeIndicatorFormData((prev: any) => ({ ...prev, max_trade_cycles: e.target.value }))}
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
              
              <label className="flex items-center space-x-3 cursor-pointer">
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
              
              <label className="flex items-center space-x-3 cursor-pointer">
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
              
              <label className="flex items-center space-x-3 cursor-pointer">
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

      {/* Strategy Name and Save Buttons */}
      <div className="bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 rounded-2xl p-6 border-2 border-yellow-500/30 shadow-lg shadow-yellow-500/20">
        <div className="space-y-6">
          {/* Strategy Name Input */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <span>Strategy Name</span>
              <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-yellow-900 text-xs font-bold">★</span>
              </div>
            </h3>
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/30 via-orange-500/30 to-red-500/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
              <div className="relative">
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

          {/* Save Strategy Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={!timeIndicatorFormData.name.trim() || !isUnderlyingSelected}
              className={`group relative px-12 py-4 font-bold rounded-2xl transition-all duration-500 transform ${
                timeIndicatorFormData.name.trim() && isUnderlyingSelected
                  ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/25 cursor-pointer'
                  : 'bg-gradient-to-r from-gray-500 to-gray-600 text-gray-300 cursor-not-allowed opacity-50'
              }`}
              onClick={handleTimeIndicatorSubmit}
            >
              <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                timeIndicatorFormData.name.trim() && isUnderlyingSelected
                  ? 'bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20'
                  : ''
              }`}></div>
              <span className="relative z-10 flex items-center space-x-3">
                <Save size={24} className={timeIndicatorFormData.name.trim() && isUnderlyingSelected ? 'animate-pulse' : ''} />
                <span className="text-lg">
                  {!isUnderlyingSelected 
                    ? 'Select Underlying First' 
                    : !timeIndicatorFormData.name.trim() 
                      ? 'Enter Strategy Name First' 
                      : 'Save Strategy'
                  }
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndicatorBasedStrategy;
