import React from 'react';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';

const LiveTradesPage: React.FC = () => {
  // Empty arrays since mock data was removed
  const marketData: any[] = [];
  const liveTrades: any[] = [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Activity size={32} className="text-blue-400" />
        <h1 className="text-3xl font-bold text-white">Live Trades</h1>
      </div>

      {/* Market Status */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-4">Market Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {marketData.length === 0 ? (
            <div className="col-span-2 text-center text-blue-200 py-8">
              No market data available
            </div>
          ) : (
            marketData.map((data) => (
              <div key={data.symbol} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{data.symbol}</h3>
                    <p className="text-2xl font-bold text-white">₹{data.price.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center space-x-1 ${data.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {data.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      <span className="font-semibold">{data.change_percent.toFixed(2)}%</span>
                    </div>
                    <p className="text-sm text-blue-200">₹{data.change.toFixed(2)}</p>
                  </div>
                </div>
                <div className="mt-2 text-sm text-blue-200">
                  Volume: {data.volume.toLocaleString()} | High: ₹{data.high} | Low: ₹{data.low}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Active Trades */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-4">Active Trades</h2>
        <div className="space-y-4">
          {liveTrades.length === 0 ? (
            <div className="text-center text-blue-200 py-8">
              No active trades
            </div>
          ) : (
            liveTrades.map((trade) => (
              <div key={trade.id} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${trade.status === 'OPEN' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <div>
                      <h3 className="font-semibold text-white">{trade.symbol}</h3>
                      <p className="text-sm text-blue-200">
                        {trade.side} {trade.quantity} @ ₹{trade.entry_price}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">₹{trade.current_price.toLocaleString()}</p>
                    <p className={`text-sm font-semibold ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {trade.pnl >= 0 ? '+' : ''}₹{trade.pnl.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-2 text-sm text-blue-200">
                  Entry: {trade.created_at.toLocaleTimeString()} | 
                  Status: {trade.status} | 
                  Fees: ₹{trade.fees}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Trading Controls */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-green-500/20 text-green-400 p-4 rounded-lg hover:bg-green-500/30 transition-all duration-200">
            <TrendingUp size={24} className="mx-auto mb-2" />
            <p className="font-semibold">Buy Position</p>
          </button>
          <button className="bg-red-500/20 text-red-400 p-4 rounded-lg hover:bg-red-500/30 transition-all duration-200">
            <TrendingDown size={24} className="mx-auto mb-2" />
            <p className="font-semibold">Sell Position</p>
          </button>
          <button className="bg-blue-500/20 text-blue-400 p-4 rounded-lg hover:bg-blue-500/30 transition-all duration-200">
            <Activity size={24} className="mx-auto mb-2" />
            <p className="font-semibold">Close All</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveTradesPage;