'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Code, Save, AlertTriangle } from 'lucide-react';
import Sidebar from '../../../components/Layout/Sidebar';
import { getUserToken, getUserData } from '@/lib/cookies';

const ProgrammingStrategyPage = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  const [programmingFormData, setProgrammingFormData] = useState({
    name: '',
    description: '',
    strategy_type: 'INTRADAY',
    symbol: '',
    programming_language: 'PYTHON',
    code: '',
    stop_loss: '',
    take_profit: '',
    position_size: ''
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleProgrammingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = [];
    
    if (!programmingFormData.name?.trim()) {
      validationErrors.push('Strategy Name is required');
    }
    
    if (!programmingFormData.symbol?.trim()) {
      validationErrors.push('Symbol is required');
    }
    
    if (!programmingFormData.code?.trim()) {
      validationErrors.push('Strategy Code is required');
    }
    
    if (!programmingFormData.stop_loss || programmingFormData.stop_loss.toString().trim() === '') {
      validationErrors.push('Stop Loss is required');
    }
    
    if (!programmingFormData.take_profit || programmingFormData.take_profit.toString().trim() === '') {
      validationErrors.push('Take Profit is required');
    }
    
    if (!programmingFormData.position_size || programmingFormData.position_size.toString().trim() === '') {
      validationErrors.push('Position Size is required');
    }
    
    if (validationErrors.length > 0) {
      setValidationErrors(validationErrors);
      const errorMessage = 'Please fill in the following required fields:\n\n' + validationErrors.join('\n');
      alert(errorMessage);
      return;
    }
    
    setValidationErrors([]);
    
    try {
      const response = await fetch('/api/strategies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: (user as any)?.id || 'tradesetu001',
          name: programmingFormData.name,
          description: programmingFormData.description || 'Custom programming strategy',
          strategy_type: 'PROGRAMMING',
          symbol: programmingFormData.symbol,
          entry_conditions: 'Custom programming logic',
          exit_conditions: 'Custom exit conditions',
          risk_management: {
            stop_loss: programmingFormData.stop_loss,
            take_profit: programmingFormData.take_profit,
            position_size: programmingFormData.position_size
          },
          is_paper_trading: true
        }),
      });

      if (response.ok) {
        console.log('Programming strategy saved successfully');
        router.push('/strategies');
      } else {
        const errorData = await response.json();
        alert(`Error saving strategy: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleProgrammingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProgrammingFormData({
      ...programmingFormData,
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
                  className="group relative p-3 rounded-xl bg-gradient-to-r from-white/10 to-white/5 text-white hover:from-white/20 hover:to-white/10 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
                >
                  <ArrowLeft size={20} className="relative z-10" />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl blur-md opacity-60 animate-pulse"></div>
                    <div className="relative bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-xl shadow-xl">
                      <Code size={24} className="text-white drop-shadow-lg" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Programming Strategy</h2>
                    <p className="text-blue-200 text-xs">Write custom algorithms in Python</p>
                  </div>
                </div>
              </div>
              
              {/* Navigation Options */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.push('/strategies/create')}
                  className="px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg text-blue-200 hover:from-blue-500/30 hover:to-cyan-500/30 transition-all duration-300 text-sm"
                >
                  Main Page
                </button>
                <button
                  onClick={() => router.push('/strategies/create?type=programming')}
                  className="px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-300 text-sm"
                >
                  Integrated Form
                </button>
              </div>
            </div>

            {/* Page Information Notice */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-4 border border-purple-500/20">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <div>
                  <h4 className="text-white font-semibold">Standalone Programming Strategy Page</h4>
                  <p className="text-purple-200 text-sm">
                    This is a dedicated page for Programming strategies. You can also use the integrated form in the main strategy creation page.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleProgrammingSubmit} className="space-y-4">
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
                  <label className="block text-blue-200 text-sm font-medium mb-2">
                    Symbol <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="symbol"
                    value={programmingFormData.symbol}
                    onChange={handleProgrammingChange}
                    className="w-full p-3 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-purple-500/30 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
                    placeholder="e.g., NIFTY 50, BANKNIFTY, RELIANCE"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  <span className="relative z-10 font-semibold">Cancel</span>
                </button>
                <button
                  type="submit"
                  className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl font-bold hover:from-purple-600 hover:to-pink-700 transition-all duration-500 flex items-center space-x-3 transform hover:scale-110 hover:rotate-2 shadow-2xl hover:shadow-purple-500/50 backdrop-blur-sm"
                >
                  <div className="relative z-10 flex items-center space-x-3">
                    <Code size={24} className="text-white drop-shadow-2xl animate-pulse" />
                    <span className="text-lg">Create Strategy</span>
                  </div>
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProgrammingStrategyPage;
