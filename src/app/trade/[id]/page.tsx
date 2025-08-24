'use client'

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { TrendingUp, TrendingDown } from 'lucide-react';

const TradeDetailsPage = () => {
  const params = useParams();
  const { id } = params;
  const [trade, setTrade] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch trade data from API
    // For now, we'll use empty state
    setTrade(null);
    setIsLoading(false);
  }, [id]);

  // Mock values for demo
  const strike_price = 21500;
  const option_type = 'CE';
  const target_price = trade ? trade.entry_price + 100 : 0;
  const stoploss = trade ? trade.entry_price - 50 : 0;
  const trailing_stoploss = 30;
  const trailing_profit = 60;

  if (!trade) {
    return <div className="min-h-screen flex items-center justify-center text-white text-xl">Trade not found</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-lg w-full border border-white/20 shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          {trade.side === 'BUY' ? (
            <TrendingUp className="text-green-400 animate-bounce" size={28} />
          ) : (
            <TrendingDown className="text-red-400 animate-bounce" size={28} />
          )}
          Trade Details
        </h1>
        <div className="space-y-4 text-white">
          <div className="flex justify-between">
            <span className="font-semibold">Symbol</span>
            <span>{trade.symbol}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Strike Price</span>
            <span>{strike_price}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Option Type</span>
            <span>{option_type}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Side</span>
            <span className={trade.side === 'BUY' ? 'text-green-400' : 'text-red-400'}>{trade.side}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Quantity</span>
            <span>{trade.quantity}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Entry Price</span>
            <span>₹{trade.entry_price}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Target Price</span>
            <span>₹{target_price}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Stoploss</span>
            <span>₹{stoploss}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Trailing Stoploss</span>
            <span>₹{trailing_stoploss}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Trailing Profit</span>
            <span>₹{trailing_profit}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">P&L</span>
            <span className={trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>₹{trade.pnl}</span>
          </div>
        </div>
        <button
          onClick={() => alert('Exit Trade clicked!')}
          className="mt-8 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 via-pink-500 to-yellow-500 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all duration-300 focus:outline-none hover:scale-105 hover:shadow-2xl animate-pulse"
        >
          <TrendingDown size={20} className="text-white drop-shadow" />
          Exit Trade
        </button>
      </div>
    </div>
  );
};

export default TradeDetailsPage; 