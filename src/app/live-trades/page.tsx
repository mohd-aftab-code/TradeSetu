'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../components/Layout/Sidebar';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { mockLiveTrades } from '../../data/mockData';
import { mockStrategies } from '../../data/mockData';

const LiveTradesPage = () => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('userToken')
    const userData = localStorage.getItem('userData')
    if (!token || !userData) {
      router.push('/auth/login')
      return
    }
    try {
      setUser(JSON.parse(userData))
    } catch (error) {
      router.push('/auth/login')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white text-xl">Loading...</div>;
  }
  if (!user) return null;

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      <div className="fixed left-0 top-0 h-full z-10">
        <Sidebar activeTab="live-trades" onTabChange={() => {}} />
      </div>
      <div className="flex-1 flex min-w-0 md:ml-64">
        <main className="flex-1 p-6 space-y-6 md:ml-0 overflow-x-hidden">
        <h1 className="text-3xl font-bold text-white">Live Trades</h1>
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mt-6">
          {mockLiveTrades.length === 0 ? (
            <div className="text-blue-200 text-center">No live trades at the moment.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockLiveTrades.map((trade, idx) => {
                // Mock values for strike_price and option_type
                const strike_price = 21500 + idx * 100;
                const option_type = idx % 2 === 0 ? 'CE' : 'PE';
                const target_price = trade.entry_price + 100;
                const stoploss = trade.entry_price - 50;
                const trailing_stoploss = 30;
                const trailing_profit = 60;
                return (
                  <div key={trade.id} className="bg-white/5 rounded-2xl p-6 shadow-lg flex flex-col gap-3 border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                      {trade.side === 'BUY' ? (
                        <TrendingUp className="text-green-400 animate-bounce" size={22} />
                      ) : (
                        <TrendingDown className="text-red-400 animate-bounce" size={22} />
                      )}
                      <h2 className="text-xl font-bold text-white">{trade.symbol} Live Trade</h2>
                    </div>
                    <div className="mb-2 text-lg font-bold bg-gradient-to-r from-red-500 via-pink-500 to-yellow-500 bg-clip-text text-transparent tracking-wide">
                      Strategy: {mockStrategies.find(s => s.id === trade.strategy_id)?.name || 'N/A'}
                    </div>
                    <div className="flex flex-col gap-1 text-white text-sm">
                      <div className="flex justify-between"><span>Symbol</span><span>{trade.symbol}</span></div>
                      <div className="flex justify-between"><span>Strike Price</span><span>{strike_price}</span></div>
                      <div className="flex justify-between"><span>Option Type</span><span>{option_type}</span></div>
                      <div className="flex justify-between"><span>Side</span><span className={trade.side === 'BUY' ? 'text-green-400' : 'text-red-400'}>{trade.side}</span></div>
                      <div className="flex justify-between"><span>Quantity</span><span>{trade.quantity}</span></div>
                      <div className="flex justify-between"><span>Entry Price</span><span>₹{trade.entry_price}</span></div>
                      <div className="flex justify-between"><span>Target Price</span><span>₹{target_price}</span></div>
                      <div className="flex justify-between"><span>Stoploss</span><span>₹{stoploss}</span></div>
                      <div className="flex justify-between"><span>Trailing Stoploss</span><span>₹{trailing_stoploss}</span></div>
                      <div className="flex justify-between"><span>Trailing Profit</span><span>₹{trailing_profit}</span></div>
                      <div className="flex justify-between"><span>P&L</span><span className={trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>₹{trade.pnl}</span></div>
                    </div>
                    <button
                      onClick={() => alert('Exit Trade clicked!')}
                      className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 via-pink-500 to-yellow-500 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all duration-300 focus:outline-none hover:scale-105 hover:shadow-2xl animate-pulse"
                    >
                      <TrendingDown size={20} className="text-white drop-shadow" />
                      Exit Trade
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        </main>
      </div>
    </div>
  );
};

export default LiveTradesPage; 