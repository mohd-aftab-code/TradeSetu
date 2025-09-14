'use client'

import React from 'react';
import { ArrowLeft, Code, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProgrammingStrategyProps {
  programmingFormData: any;
  setProgrammingFormData: (data: any) => void;
  setStrategyCreationType: (type: any) => void;
  handleProgrammingSubmit: (e: React.FormEvent) => void;
  handleProgrammingChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  validationErrors: string[];
}

const ProgrammingStrategy: React.FC<ProgrammingStrategyProps> = ({
  programmingFormData,
  setProgrammingFormData,
  setStrategyCreationType,
  handleProgrammingSubmit,
  handleProgrammingChange,
  validationErrors
}) => {
  const router = useRouter();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setStrategyCreationType('selection')}
            className="group relative p-4 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 text-white hover:from-white/20 hover:to-white/10 transition-all duration-500 transform hover:scale-110 hover:rotate-12 shadow-2xl hover:shadow-purple-500/25"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <ArrowLeft size={24} className="relative z-10" />
          </button>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-purple-500 to-pink-600 p-4 rounded-2xl shadow-2xl">
                <Code size={28} className="text-white drop-shadow-2xl" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Programming Strategy</h2>
              <p className="text-blue-200 text-sm mt-1">Write custom algorithms in Python</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleProgrammingSubmit} className="space-y-6">
        {/* Required Fields Notice */}
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl p-4 border border-orange-500/20">
          <div className="flex items-center space-x-3">
            <AlertTriangle size={20} className="text-orange-400" />
            <div>
              <h4 className="text-white font-semibold">Required Fields</h4>
              <p className="text-orange-200 text-sm">
                Fields marked with <span className="text-red-400 font-bold">*</span> are required to save your strategy
              </p>
            </div>
          </div>
        </div>

        {/* Validation Errors Display */}
        {validationErrors.length > 0 && (
          <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-2xl p-4 border border-red-500/20">
            <div className="flex items-start space-x-3">
              <AlertTriangle size={20} className="text-red-400 mt-1" />
              <div className="flex-1">
                <h4 className="text-white font-semibold mb-2">Please fix the following errors:</h4>
                <ul className="space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-red-200 text-sm flex items-center space-x-2">
                      <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="transform hover:scale-105 transition-all duration-300">
            <label className="block text-blue-200 text-sm font-medium mb-2">
              Strategy Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={programmingFormData.name}
              onChange={handleProgrammingChange}
              className="w-full p-3 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-purple-500/30 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
              placeholder="e.g., Custom Algorithm Strategy"
              required
            />
          </div>

          <div className="transform hover:scale-105 transition-all duration-300">
            <label className="block text-blue-200 text-sm font-medium mb-2">Programming Language</label>
            <select
              name="programming_language"
              value={programmingFormData.programming_language}
              onChange={handleProgrammingChange}
              className="w-full p-3 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-purple-500/30 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
            >
              <option value="PYTHON">Python</option>
              <option value="JAVASCRIPT">JavaScript</option>
            </select>
          </div>
        </div>

        <div className="transform hover:scale-105 transition-all duration-300">
          <label className="block text-blue-200 text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={programmingFormData.description}
            onChange={handleProgrammingChange}
            rows={3}
            className="w-full p-3 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-purple-500/30 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
            placeholder="Describe your algorithm..."
          />
        </div>

        <div className="transform hover:scale-105 transition-all duration-300">
          <label className="block text-blue-200 text-sm font-medium mb-2">
            Strategy Code <span className="text-red-400">*</span>
          </label>
          <textarea
            name="code"
            value={programmingFormData.code}
            onChange={handleProgrammingChange}
            rows={15}
            className="w-full p-3 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-purple-500/30 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono text-sm transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
            placeholder={`# Example Python Strategy Code
def strategy(data):
    # Your trading logic here
    if data['rsi'] < 30:
        return 'BUY'
    elif data['rsi'] > 70:
        return 'SELL'
    return 'HOLD'`}
            required
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="transform hover:scale-105 transition-all duration-300">
            <label className="block text-blue-200 text-sm font-medium mb-2">
              Stop Loss <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="stop_loss"
              value={programmingFormData.stop_loss}
              onChange={handleProgrammingChange}
              className="w-full p-3 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-purple-500/30 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
              placeholder="e.g., 50 points"
            />
          </div>

          <div className="transform hover:scale-105 transition-all duration-300">
            <label className="block text-blue-200 text-sm font-medium mb-2">
              Take Profit <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="take_profit"
              value={programmingFormData.take_profit}
              onChange={handleProgrammingChange}
              className="w-full p-3 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-purple-500/30 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
              placeholder="e.g., 100 points"
            />
          </div>

          <div className="transform hover:scale-105 transition-all duration-300">
            <label className="block text-blue-200 text-sm font-medium mb-2">
              Position Size <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="position_size"
              value={programmingFormData.position_size}
              onChange={handleProgrammingChange}
              className="w-full p-3 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-purple-500/30 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
              placeholder="e.g., 1 lot"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="group relative px-8 py-4 bg-gradient-to-r from-white/10 to-white/5 text-white rounded-2xl hover:from-white/20 hover:to-white/10 transition-all duration-500 transform hover:scale-105 hover:-rotate-2 shadow-2xl hover:shadow-red-500/25 backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-orange-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10 font-semibold">Cancel</span>
          </button>
          <button
            type="submit"
            className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl font-bold hover:from-purple-600 hover:to-pink-700 transition-all duration-500 flex items-center space-x-3 transform hover:scale-110 hover:rotate-2 shadow-2xl hover:shadow-purple-500/50 backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center space-x-3">
              <div className="relative">
                <Code size={24} className="text-white drop-shadow-2xl animate-pulse" />
                <div className="absolute inset-0 bg-purple-400 rounded-full blur-sm animate-ping"></div>
              </div>
              <span className="text-lg">Create Strategy</span>
            </div>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProgrammingStrategy;
