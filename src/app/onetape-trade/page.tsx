"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Target, Zap, Settings, Square, Shield, Activity, CheckCircle, Clock, BarChart3, Eye, EyeOff } from "lucide-react";

const OnetapeTrade: React.FC = () => {
  const [selectedUnderlying, setSelectedUnderlying] = useState("BANKNIFTY");
  const [optionType, setOptionType] = useState<"CE" | "PE">("CE");
  const [quantity, setQuantity] = useState(100);
  const [lotSize, setLotSize] = useState(25);
  const [isTradingActive, setIsTradingActive] = useState(false);
  const [lastExecution, setLastExecution] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState(45200);
  const [strikePrice, setStrikePrice] = useState(45200);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingTrade, setPendingTrade] = useState<{side: "BUY" | "SELL"} | null>(null);
  const [tradeLogs, setTradeLogs] = useState<Array<{
    id: number;
    time: string;
    side: "BUY" | "SELL";
    symbol: string;
    quantity: number;
    price: number;
    pnl: number;
  }>>([]);
  const [riskMode, setRiskMode] = useState<"points" | "percentage">("points");
  const [strategyLabel, setStrategyLabel] = useState("");
  const [showUndo, setShowUndo] = useState(false);
  
  // Trailing stop loss and profit states
  const [trailingStopLossPoints, setTrailingStopLossPoints] = useState(30);
  const [trailingStopLossPercentage, setTrailingStopLossPercentage] = useState(1.5);
  const [trailingProfitPoints, setTrailingProfitPoints] = useState(80);
  const [trailingProfitPercentage, setTrailingProfitPercentage] = useState(4);
  const [trailingMovePoints, setTrailingMovePoints] = useState(20);
  const [trailingProfitMovePoints, setTrailingProfitMovePoints] = useState(25);

  // Update strike price and lot size when underlying changes
  useEffect(() => {
    const getDefaultStrike = (underlying: string) => {
      switch (underlying) {
        case "BANKNIFTY":
          return 45200; // Current BANKNIFTY level
        case "NIFTY":
          return 22500; // Current NIFTY level
        case "FINNIFTY":
          return 20200; // Current FINNIFTY level
        case "RELIANCE":
          return 2800; // Current RELIANCE level
        default:
          return 45200;
      }
    };

    const getLotSize = (underlying: string) => {
      switch (underlying) {
        case "BANKNIFTY":
          return 25; // BANKNIFTY lot size
        case "NIFTY":
          return 50; // NIFTY lot size
        case "FINNIFTY":
          return 40; // FINNIFTY lot size
        case "RELIANCE":
          return 250; // Stock options lot size
        default:
          return 25;
      }
    };
    
    setStrikePrice(getDefaultStrike(selectedUnderlying));
    setLotSize(getLotSize(selectedUnderlying));
  }, [selectedUnderlying]);
  const [optionPrice, setOptionPrice] = useState(150);
  const [showPositions, setShowPositions] = useState(true);
  const [positions, setPositions] = useState([
    { id: 1, symbol: "BANKNIFTY 45200 CE", quantity: 2500, lots: 100, lotSize: 25, avgPrice: 150, currentPrice: 165, pnl: 1500, side: "BUY" },
    { id: 2, symbol: "BANKNIFTY 45300 PE", quantity: 1250, lots: 50, lotSize: 25, avgPrice: 120, currentPrice: 95, pnl: -1250, side: "SELL" }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice(prev => prev + (Math.random() - 0.5) * 50);
      setOptionPrice(prev => prev + (Math.random() - 0.5) * 10);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const executeTrade = (side: "BUY" | "SELL") => {
    const totalQuantity = quantity * lotSize;
    const newPosition = {
      id: Date.now(),
      symbol: `${selectedUnderlying} ${strikePrice} ${optionType}`,
      quantity: totalQuantity,
      lots: quantity,
      lotSize: lotSize,
      avgPrice: optionPrice,
      currentPrice: optionPrice,
      pnl: 0,
      side: side
    };
    
    // Add to positions
    setPositions(prev => [...prev, newPosition]);
    
    // Add to trade logs
    const newTradeLog = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      side: side,
      symbol: `${selectedUnderlying} ${strikePrice} ${optionType}`,
      quantity: totalQuantity,
      price: optionPrice,
      pnl: 0
    };
    setTradeLogs(prev => [newTradeLog, ...prev.slice(0, 4)]); // Keep last 5 trades
    
    setLastExecution(`${side} ${quantity} lots (${totalQuantity} units) x ${selectedUnderlying} ${strikePrice} ${optionType} @ ${optionPrice}`);
    setShowUndo(true);
    
    // Auto-hide undo after 10 seconds
    setTimeout(() => setShowUndo(false), 10000);
  };

  const confirmTrade = (side: "BUY" | "SELL") => {
    setPendingTrade({ side });
    setShowConfirmation(true);
  };

  const handleTradeConfirmation = () => {
    if (pendingTrade) {
      executeTrade(pendingTrade.side);
      setShowConfirmation(false);
      setPendingTrade(null);
    }
  };

  const undoLastTrade = () => {
    if (positions.length > 0) {
      setPositions(prev => prev.slice(0, -1));
      setTradeLogs(prev => prev.slice(1));
      setLastExecution("Last trade undone");
      setShowUndo(false);
    }
  };

  const closeAllPositions = () => {
    setPositions([]);
    setLastExecution("All positions closed");
  };

  // Calculate proper strike prices based on underlying
  const getQuickStrikes = () => {
    let interval = 100; // Default interval
    
    // Set proper intervals based on underlying
    switch (selectedUnderlying) {
      case "BANKNIFTY":
        interval = 100; // BANKNIFTY has 100 point intervals
        break;
      case "NIFTY":
        interval = 50; // NIFTY has 50 point intervals
        break;
      case "FINNIFTY":
        interval = 50; // FINNIFTY has 50 point intervals
        break;
      case "RELIANCE":
        interval = 10; // Stock options have smaller intervals
        break;
      default:
        interval = 100;
    }
    
    const baseStrike = Math.round(strikePrice / interval) * interval;
    return [
      baseStrike - (interval * 2),
      baseStrike - interval,
      baseStrike,
      baseStrike + interval,
      baseStrike + (interval * 2)
    ];
  };
  
  // Use useMemo to recalculate when underlying or strike price changes
  const quickStrikes = React.useMemo(() => getQuickStrikes(), [selectedUnderlying, strikePrice]);

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      <div className="flex-1 flex min-w-0">
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-3 lg:p-4 space-y-3 lg:space-y-4 overflow-x-hidden">

            {/* Header */}
            <div className="bg-gradient-to-br from-slate-800 via-blue-900 to-purple-800 rounded-xl p-4 mb-4 shadow-lg border border-blue-800/60">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-full">
                    <Zap className="text-white" size={24} />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white">Advanced Scalping Interface</h1>
                    <p className="text-blue-200 text-sm">Professional options scalping with real-time execution</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${isTradingActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span className="text-white font-semibold">
                      {isTradingActive ? 'TRADING ACTIVE' : 'TRADING INACTIVE'}
                    </span>
                  </div>

                  <button
                    onClick={() => setIsTradingActive(!isTradingActive)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                      isTradingActive
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {isTradingActive ? 'STOP' : 'START'}
                  </button>
                </div>
              </div>
            </div>

            {/* Main Trading Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

              {/* Left Panel - Asset & Strike Selection */}
              <div className="lg:col-span-2 space-y-4">

                {/* Underlying Asset Selector */}
                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Target size={20} />
                    Underlying Asset
                  </h2>

                  <div className="grid grid-cols-2 gap-2">
                    {["BANKNIFTY", "NIFTY", "FINNIFTY", "RELIANCE"].map((asset) => (
                      <button
                        key={asset}
                        onClick={() => setSelectedUnderlying(asset)}
                        className={`p-3 rounded-lg transition-all duration-300 ${
                          selectedUnderlying === asset
                            ? "bg-blue-500 text-white"
                            : "bg-white/5 text-blue-200 hover:bg-white/10"
                        }`}
                      >
                        <span className="font-semibold">{asset}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Strike Price Selection */}
                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart3 size={20} />
                    Strike Price Selection
                  </h2>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={strikePrice}
                        onChange={(e) => setStrikePrice(Number(e.target.value))}
                        className="flex-1 bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
                        placeholder="Strike Price"
                      />
                      <button 
                        onClick={() => setStrikePrice(Number(strikePrice))}
                        className="bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded text-white text-sm"
                      >
                        Set
                      </button>
                    </div>

                    {/* Strike Price Table - Inside the input area */}
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="grid grid-cols-5 gap-2">
                        {/* ATM */}
                        <button
                          onClick={() => setStrikePrice(Math.round(currentPrice / 100) * 100)}
                          className="flex flex-col items-center p-2 rounded bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
                        >
                          <div className="w-2 h-2 bg-blue-500 rounded-full mb-1"></div>
                          <span className="text-white text-xs font-medium">ATM</span>
                          <span className="text-blue-200 text-xs">
                            {Math.round(currentPrice / 100) * 100}
                          </span>
                        </button>

                        {/* ITM 1 */}
                        <button
                          onClick={() => setStrikePrice(Math.round(currentPrice / 100) * 100 - 100)}
                          className="flex flex-col items-center p-2 rounded bg-green-500/20 hover:bg-green-500/30 transition-colors"
                        >
                          <div className="w-2 h-2 bg-green-500 rounded-full mb-1"></div>
                          <span className="text-white text-xs font-medium">ITM 1</span>
                          <span className="text-green-200 text-xs">
                            {Math.round(currentPrice / 100) * 100 - 100}
                          </span>
                        </button>

                        {/* ITM 2 */}
                        <button
                          onClick={() => setStrikePrice(Math.round(currentPrice / 100) * 100 - 200)}
                          className="flex flex-col items-center p-2 rounded bg-green-500/20 hover:bg-green-500/30 transition-colors"
                        >
                          <div className="w-2 h-2 bg-green-500 rounded-full mb-1"></div>
                          <span className="text-white text-xs font-medium">ITM 2</span>
                          <span className="text-green-200 text-xs">
                            {Math.round(currentPrice / 100) * 100 - 200}
                          </span>
                        </button>

                        {/* OTM 1 */}
                        <button
                          onClick={() => setStrikePrice(Math.round(currentPrice / 100) * 100 + 100)}
                          className="flex flex-col items-center p-2 rounded bg-red-500/20 hover:bg-red-500/30 transition-colors"
                        >
                          <div className="w-2 h-2 bg-red-500 rounded-full mb-1"></div>
                          <span className="text-white text-xs font-medium">OTM 1</span>
                          <span className="text-red-200 text-xs">
                            {Math.round(currentPrice / 100) * 100 + 100}
                          </span>
                        </button>

                        {/* OTM 2 */}
                        <button
                          onClick={() => setStrikePrice(Math.round(currentPrice / 100) * 100 + 200)}
                          className="flex flex-col items-center p-2 rounded bg-red-500/20 hover:bg-red-500/30 transition-colors"
                        >
                          <div className="w-2 h-2 bg-red-500 rounded-full mb-1"></div>
                          <span className="text-white text-xs font-medium">OTM 2</span>
                          <span className="text-red-200 text-xs">
                            {Math.round(currentPrice / 100) * 100 + 200}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Strike Buttons */}
                    <div className="grid grid-cols-5 gap-2">
                      {quickStrikes.map((strike) => (
                        <button
                          key={strike}
                          onClick={() => setStrikePrice(strike)}
                          className={`p-2 rounded text-sm transition-all duration-300 ${
                            strikePrice === strike
                              ? "bg-blue-500 text-white"
                              : "bg-white/5 text-blue-200 hover:bg-white/10"
                          }`}
                        >
                          {strike.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Option Type Selection */}
                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Target size={20} />
                    Option Type
                  </h2>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setOptionType("CE")}
                      className={`p-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                        optionType === "CE"
                          ? "bg-green-500 text-white shadow-lg"
                          : "bg-white/10 text-green-400 hover:bg-white/20"
                      }`}
                    >
                      <TrendingUp size={16} />
                      CALL
                    </button>
                    <button
                      onClick={() => setOptionType("PE")}
                      className={`p-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                        optionType === "PE"
                          ? "bg-red-500 text-white shadow-lg"
                          : "bg-white/10 text-red-400 hover:bg-white/20"
                        }`}
                    >
                      <TrendingDown size={16} />
                      PUT
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Panel - Execution & Positions */}
              <div className="lg:col-span-2 space-y-4">

                {/* Quick Execution Panel */}
                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Zap size={20} />
                    Quick Execution
                  </h2>

                                     {/* Price Display */}
                   <div className="bg-white/5 rounded-lg p-3 mb-4">
                     <div className="grid grid-cols-3 gap-4 text-sm">
                       <div>
                         <span className="text-blue-200">Underlying:</span>
                         <div className="text-white font-semibold">₹{currentPrice.toFixed(2)}</div>
                       </div>
                       <div>
                         <span className="text-blue-200">Selected Strike:</span>
                         <div className="text-white font-semibold">₹{strikePrice}</div>
                       </div>
                       <div>
                         <span className="text-blue-200">Option Price:</span>
                         <div className="text-white font-semibold">₹{optionPrice.toFixed(2)}</div>
                       </div>
                     </div>
                   </div>

                   {/* Strategy Label */}
                   <div className="mb-4">
                     <label className="block text-blue-200 text-sm font-semibold mb-2">Strategy Label (Optional)</label>
                     <input
                       type="text"
                       value={strategyLabel}
                       onChange={(e) => setStrategyLabel(e.target.value)}
                       className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
                       placeholder="e.g., Scalping breakout, Trend follow"
                     />
                   </div>

                                     {/* Lot Size & Quantity Input */}
                   <div className="grid grid-cols-2 gap-4 mb-4">
                     <div>
                       <label className="block text-blue-200 text-sm font-semibold mb-2">
                         Lots ({selectedUnderlying} standard: {lotSize})
                       </label>
                       <input
                         type="number"
                         value={quantity}
                         onChange={(e) => setQuantity(Number(e.target.value))}
                         className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
                         placeholder="Enter lots"
                       />
                       <div className="text-blue-200 text-xs mt-1">
                         Total: {quantity * lotSize} units
                       </div>
                     </div>
                   </div>

                                     {/* Execution Buttons */}
                   <div className="grid grid-cols-2 gap-4">
                     <button
                       onClick={() => confirmTrade("BUY")}
                       className="py-4 rounded-lg font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl"
                     >
                       <TrendingUp size={20} />
                       BUY (B)
                     </button>

                     <button
                       onClick={() => confirmTrade("SELL")}
                       className="py-4 rounded-lg font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl"
                     >
                       <TrendingDown size={20} />
                       SELL (S)
                     </button>
                   </div>

                  {/* Close All Button */}
                  <button
                    onClick={closeAllPositions}
                    className="w-full mt-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Square size={20} />
                    CLOSE ALL POSITIONS
                  </button>
                </div>

                {/* Active Positions */}
                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Activity size={20} />
                      Active Positions
                    </h2>
                    <button
                      onClick={() => setShowPositions(!showPositions)}
                      className="text-white hover:text-blue-300"
                    >
                      {showPositions ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                                    {showPositions && (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                             {positions.map((position) => (
                         <div key={position.id} className="bg-white/5 rounded-lg p-3">
                           <div className="flex items-center justify-between">
                             <div>
                               <div className="text-white font-semibold text-sm">{position.symbol}</div>
                               <div className="text-blue-200 text-xs">
                                 {position.side} {position.lots || 1} lots ({position.quantity} units) @ ₹{position.avgPrice}
                               </div>
                             </div>
                             <div className="text-right">
                               <div className={`font-semibold text-sm ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                 ₹{position.pnl.toFixed(2)}
                               </div>
                             </div>
                           </div>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>

                 {/* Trade Logs Panel */}
                 <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
                   <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                     <Clock size={20} />
                     Recent Trades
                   </h2>
                   
                   <div className="space-y-2 max-h-40 overflow-y-auto">
                     {tradeLogs.length === 0 ? (
                       <div className="text-blue-200 text-sm text-center py-4">
                         No trades yet
                       </div>
                     ) : (
                       tradeLogs.map((trade) => (
                         <div key={trade.id} className="bg-white/5 rounded-lg p-3">
                           <div className="flex items-center justify-between">
                             <div>
                               <div className="text-white font-semibold text-sm">{trade.symbol}</div>
                               <div className="text-blue-200 text-xs">
                                 {trade.side} {trade.quantity} units @ ₹{trade.price} | {trade.time}
                               </div>
                             </div>
                             <div className="text-right">
                               <div className={`font-semibold text-sm ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                 ₹{trade.pnl.toFixed(2)}
                               </div>
                             </div>
                           </div>
                         </div>
                       ))
                     )}
                   </div>
                 </div>
               </div>
             </div>

            {/* Advanced Risk Management Panel */}
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield size={20} />
                Advanced Risk Management
              </h2>

                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Risk Mode Toggle */}
                 <div className="lg:col-span-2 mb-4">
                   <div className="flex items-center gap-4">
                     <span className="text-blue-200 text-sm font-semibold">Risk Mode:</span>
                     <div className="flex bg-white/10 rounded-lg p-1">
                       <button
                         onClick={() => setRiskMode("points")}
                         className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                           riskMode === "points"
                             ? "bg-blue-500 text-white"
                             : "text-blue-200 hover:text-white"
                         }`}
                       >
                         Points
                       </button>
                       <button
                         onClick={() => setRiskMode("percentage")}
                         className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                           riskMode === "percentage"
                             ? "bg-blue-500 text-white"
                             : "text-blue-200 hover:text-white"
                         }`}
                       >
                         Percentage
                       </button>
                     </div>
                   </div>
                 </div>

                                   {/* Stop Loss & Take Profit */}
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold text-sm border-b border-white/10 pb-2">
                      Stop Loss & Take Profit
                      <span className="text-blue-300 text-xs ml-2">(Auto exit at loss/profit levels)</span>
                    </h3>
                   
                   <div className="grid grid-cols-2 gap-3">
                     <div>
                       <label className="block text-blue-200 text-xs font-semibold mb-1">
                         Stop Loss ({riskMode === "points" ? "Points" : "%"})
                       </label>
                       <input
                         type="number"
                         defaultValue={riskMode === "points" ? 50 : 2}
                         className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs"
                         placeholder={riskMode === "points" ? "50" : "2"}
                       />
                     </div>
                     <div>
                       <label className="block text-blue-200 text-xs font-semibold mb-1">
                         Take Profit ({riskMode === "points" ? "Points" : "%"})
                       </label>
                       <input
                         type="number"
                         defaultValue={riskMode === "points" ? 100 : 5}
                         className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs"
                         placeholder={riskMode === "points" ? "100" : "5"}
                       />
                     </div>
                   </div>
                 </div>

                                                                   {/* Dynamic SL/TP Settings */}
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold text-sm border-b border-white/10 pb-2">
                      Dynamic SL/TP Settings
                      <span className="text-blue-300 text-xs ml-2">(Trailing stop loss and take profit that moves with price)</span>
                    </h3>
                   
                   <div className="grid grid-cols-2 gap-3">
                     <div>
                       <label className="block text-blue-200 text-xs font-semibold mb-1">Trailing SL (Points)</label>
                       <input
                         type="number"
                         value={trailingStopLossPoints}
                         onChange={(e) => setTrailingStopLossPoints(Number(e.target.value))}
                         className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs"
                         placeholder="30"
                       />
                     </div>
                     <div>
                       <label className="block text-blue-200 text-xs font-semibold mb-1">Trailing SL (%)</label>
                       <input
                         type="number"
                         value={trailingStopLossPercentage}
                         onChange={(e) => setTrailingStopLossPercentage(Number(e.target.value))}
                         className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs"
                         placeholder="1.5"
                       />
                     </div>
                     <div>
                       <label className="block text-blue-200 text-xs font-semibold mb-1">Trailing Profit (Points)</label>
                       <input
                         type="number"
                         value={trailingProfitPoints}
                         onChange={(e) => setTrailingProfitPoints(Number(e.target.value))}
                         className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs"
                         placeholder="80"
                       />
                     </div>
                     <div>
                       <label className="block text-blue-200 text-xs font-semibold mb-1">Trailing Profit (%)</label>
                       <input
                         type="number"
                         value={trailingProfitPercentage}
                         onChange={(e) => setTrailingProfitPercentage(Number(e.target.value))}
                         className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs"
                         placeholder="4"
                       />
                     </div>
                   </div>
                   
                   {/* Trailing Move Points Configuration */}
                   <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                     <h4 className="text-white font-semibold text-xs mb-3 border-b border-white/10 pb-2">
                       Trailing Activation Points
                       <span className="text-blue-300 text-xs ml-2">(How many points price should move to trigger trailing)</span>
                     </h4>
                     
                     <div className="grid grid-cols-2 gap-3">
                       <div>
                         <label className="block text-blue-200 text-xs font-semibold mb-1">
                           Trailing SL Move (Points)
                           <span className="text-blue-300 text-xs ml-1">(Price moves X points → trail SL)</span>
                         </label>
                         <input
                           type="number"
                           value={trailingMovePoints}
                           onChange={(e) => setTrailingMovePoints(Number(e.target.value))}
                           className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs"
                           placeholder="20"
                         />
                         <div className="text-blue-200 text-xs mt-1">
                           When price moves {trailingMovePoints} points, trailing SL activates
                         </div>
                       </div>
                       
                       <div>
                         <label className="block text-blue-200 text-xs font-semibold mb-1">
                           Trailing Profit Move (Points)
                           <span className="text-blue-300 text-xs ml-1">(Price moves X points → trail profit)</span>
                         </label>
                         <input
                           type="number"
                           value={trailingProfitMovePoints}
                           onChange={(e) => setTrailingProfitMovePoints(Number(e.target.value))}
                           className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs"
                           placeholder="25"
                         />
                         <div className="text-blue-200 text-xs mt-1">
                           When price moves {trailingProfitMovePoints} points, trailing profit activates
                         </div>
                       </div>
                     </div>
                     
                     {/* Trailing Status Display */}
                     <div className="mt-3 p-2 bg-white/5 rounded border border-white/10">
                       <div className="grid grid-cols-2 gap-4 text-xs">
                         <div>
                           <span className="text-blue-200">Trailing SL Status:</span>
                           <div className="text-green-400 font-semibold">Active ({trailingStopLossPoints} points behind)</div>
                         </div>
                         <div>
                           <span className="text-blue-200">Trailing Profit Status:</span>
                           <div className="text-yellow-400 font-semibold">Pending ({trailingProfitMovePoints} points to activate)</div>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>

                                                                   {/* Loss & Profit Limits */}
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold text-sm border-b border-white/10 pb-2">
                      Loss & Profit Limits
                      <span className="text-blue-300 text-xs ml-2">(Daily & per-trade limits)</span>
                    </h3>
                   
                   <div className="grid grid-cols-2 gap-3">
                     <div>
                       <label className="block text-blue-200 text-xs font-semibold mb-1">Max Loss per Trade (₹)</label>
                       <input
                         type="number"
                         defaultValue={5000}
                         className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs"
                         placeholder="₹5000"
                       />
                       <div className="text-blue-200 text-xs mt-1">₹5,000</div>
                     </div>
                     <div>
                       <label className="block text-blue-200 text-xs font-semibold mb-1">Max Profit per Trade (₹)</label>
                       <input
                         type="number"
                         defaultValue={15000}
                         className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs"
                         placeholder="₹15000"
                       />
                       <div className="text-blue-200 text-xs mt-1">₹15,000</div>
                     </div>
                     <div>
                       <label className="block text-blue-200 text-xs font-semibold mb-1">Daily Loss Limit (₹)</label>
                       <input
                         type="number"
                         defaultValue={25000}
                         className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs"
                         placeholder="₹25000"
                       />
                       <div className="text-blue-200 text-xs mt-1">₹25,000</div>
                     </div>
                     <div>
                       <label className="block text-blue-200 text-xs font-semibold mb-1">Daily Profit Target (₹)</label>
                       <input
                         type="number"
                         defaultValue={50000}
                         className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs"
                         placeholder="₹50000"
                       />
                       <div className="text-blue-200 text-xs mt-1">₹50,000</div>
                     </div>
                   </div>
                 </div>

                                 
              </div>

                             {/* Advanced Controls */}
               <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                 <div className="flex items-center gap-2">
                   <input type="checkbox" className="rounded" defaultChecked />
                   <label className="text-blue-200 text-xs">
                     Auto Stop Loss
                     <span className="text-blue-300 text-xs ml-1">(Auto exit on loss)</span>
                   </label>
                 </div>
                 <div className="flex items-center gap-2">
                   <input type="checkbox" className="rounded" defaultChecked />
                   <label className="text-blue-200 text-xs">
                     Trailing Stop Loss
                     <span className="text-blue-300 text-xs ml-1">(Dynamic SL)</span>
                   </label>
                 </div>
                 <div className="flex items-center gap-2">
                   <input type="checkbox" className="rounded" defaultChecked />
                   <label className="text-blue-200 text-xs">
                     Trailing Profit
                     <span className="text-blue-300 text-xs ml-1">(Dynamic TP)</span>
                   </label>
                 </div>
                 <div className="flex items-center gap-2">
                   <input type="checkbox" className="rounded" defaultChecked />
                   <label className="text-blue-200 text-xs">
                     Break Even
                     <span className="text-blue-300 text-xs ml-1">(Exit at cost)</span>
                   </label>
                 </div>
                 <div className="flex items-center gap-2">
                   <input type="checkbox" className="rounded" defaultChecked />
                   <label className="text-blue-200 text-xs">
                     Position Monitoring
                     <span className="text-blue-300 text-xs ml-1">(Track positions)</span>
                   </label>
                 </div>
                 <div className="flex items-center gap-2">
                   <input type="checkbox" className="rounded" />
                   <label className="text-blue-200 text-xs">
                     Auto Close
                     <span className="text-blue-300 text-xs ml-1">(Time-based exit)</span>
                   </label>
                 </div>
                 <div className="flex items-center gap-2">
                   <input type="checkbox" className="rounded" />
                   <label className="text-blue-200 text-xs">
                     Risk Alert
                     <span className="text-blue-300 text-xs ml-1">(Risk notifications)</span>
                   </label>
                 </div>
                 <div className="flex items-center gap-2">
                   <input type="checkbox" className="rounded" defaultChecked />
                   <label className="text-blue-200 text-xs">
                     Real-time P&L
                     <span className="text-blue-300 text-xs ml-1">(Live profit/loss)</span>
                   </label>
                 </div>
               </div>
            </div>

                         {/* Execution Feedback & Confirmation */}
             {lastExecution && (
               <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
                 <div className="flex items-center gap-2">
                   <CheckCircle size={16} />
                   <span>{lastExecution}</span>
                 </div>
               </div>
             )}

             {/* Trade Confirmation Modal */}
             {showConfirmation && (
               <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                 <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20 max-w-md w-full mx-4">
                   <h3 className="text-white font-semibold text-lg mb-4">
                     Confirm {pendingTrade?.side} Trade
                   </h3>
                   <div className="text-blue-200 text-sm mb-6">
                     <div>Symbol: {selectedUnderlying} {strikePrice} {optionType}</div>
                     <div>Quantity: {quantity} lots ({quantity * lotSize} units)</div>
                     <div>Price: ₹{optionPrice.toFixed(2)}</div>
                     {strategyLabel && <div>Strategy: {strategyLabel}</div>}
                   </div>
                   <div className="flex gap-3">
                     <button
                       onClick={handleTradeConfirmation}
                       className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded font-semibold"
                     >
                       Confirm {pendingTrade?.side}
                     </button>
                     <button
                       onClick={() => {
                         setShowConfirmation(false);
                         setPendingTrade(null);
                       }}
                       className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded font-semibold"
                     >
                       Cancel
                     </button>
                   </div>
                 </div>
               </div>
             )}

             {/* Undo Last Trade Button */}
             {showUndo && (
               <div className="fixed bottom-4 left-4 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
                 <button
                   onClick={undoLastTrade}
                   className="flex items-center gap-2"
                 >
                   <Square size={16} />
                   <span>Undo Last Trade</span>
                 </button>
               </div>
             )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default OnetapeTrade; 