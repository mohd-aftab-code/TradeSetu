'use client';

import React from 'react';

interface TradingViewWidgetProps {
  symbol: string;
  width?: number;
  height?: number;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ 
  symbol, 
  width = 800, 
  height = 400 
}) => {
  const tradingViewUrl = `https://www.tradingview.com/symbols/NSE-${symbol}/`;

  return (
    <div 
      className="tradingview-widget-container bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6"
      style={{ height: height, width: width }}
    >
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="mb-4">
          <svg className="w-16 h-16 text-blue-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">
          {symbol} Live Chart
        </h3>
        
        <p className="text-gray-300 mb-6 max-w-md">
          Click below to view the complete {symbol} chart with real-time data, technical indicators, and advanced analysis tools on TradingView.
        </p>
        
        <div className="space-y-3">
          <a 
            href={tradingViewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Open TradingView Chart
          </a>
          
          <div className="text-sm text-gray-400">
            Features: Real-time data • Technical indicators • Multiple timeframes • Drawing tools
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-3 gap-4 text-xs text-gray-400">
          <div className="text-center">
            <div className="text-blue-400 font-semibold">Real-time</div>
            <div>Live prices</div>
          </div>
          <div className="text-center">
            <div className="text-green-400 font-semibold">Analysis</div>
            <div>Technical tools</div>
          </div>
          <div className="text-center">
            <div className="text-purple-400 font-semibold">Professional</div>
            <div>Advanced charts</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingViewWidget;
