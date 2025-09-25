import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// Simple UUID generator function
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// POST - Run backtest for a strategy
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const strategyId = params.id;
    const body = await request.json();
    const { start_date, end_date, initial_capital = 100000 } = body;

    if (!start_date || !end_date) {
      return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 });
    }

    // Get strategy details
    const [strategyRows] = await pool.execute(
      'SELECT * FROM strategies WHERE id = ?',
      [strategyId]
    );

    if (!strategyRows || (strategyRows as any[]).length === 0) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
    }

    const strategy = (strategyRows as any[])[0];

    // Simulate backtesting logic
    const backtestId = generateUUID();
    const now = new Date();
    
    // Mock backtest results (in real implementation, this would use actual market data)
    const totalTrades = Math.floor(Math.random() * 50) + 10;
    const winningTrades = Math.floor(totalTrades * 0.6);
    const losingTrades = totalTrades - winningTrades;
    const totalPnl = (winningTrades * 1000) - (losingTrades * 500);
    const finalValue = initial_capital + totalPnl;
    const maxDrawdown = Math.random() * 5000;
    const sharpeRatio = Math.random() * 2 + 0.5;

    // Create backtest record
    await pool.execute(
      `INSERT INTO backtests (
        id, strategy_id, user_id, start_date, end_date, initial_capital,
        final_value, total_trades, winning_trades, losing_trades,
        total_pnl, max_drawdown, sharpe_ratio, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        backtestId,
        strategyId,
        strategy.user_id,
        new Date(start_date),
        new Date(end_date),
        initial_capital,
        finalValue,
        totalTrades,
        winningTrades,
        losingTrades,
        totalPnl,
        maxDrawdown,
        sharpeRatio,
        now
      ]
    );

    // Generate mock trade logs
    const tradeLogs = [];
    for (let i = 0; i < totalTrades; i++) {
      const tradeId = generateUUID();
      const isWinning = i < winningTrades;
      const entryPrice = 100 + Math.random() * 50;
      const exitPrice = isWinning ? entryPrice + Math.random() * 20 : entryPrice - Math.random() * 15;
      const quantity = Math.floor(Math.random() * 100) + 1;
      const pnl = (exitPrice - entryPrice) * quantity;
      const fees = quantity * 0.5;

      tradeLogs.push({
        id: tradeId,
        backtest_id: backtestId,
        symbol: strategy.symbol,
        side: Math.random() > 0.5 ? 'BUY' : 'SELL',
        quantity,
        entry_price: entryPrice,
        exit_price: exitPrice,
        entry_time: new Date(Date.now() - Math.random() * 86400000),
        exit_time: new Date(),
        pnl,
        fees,
        created_at: now
      });

      await pool.execute(
        `INSERT INTO backtest_trades (
          id, backtest_id, symbol, side, quantity, entry_price, exit_price,
          entry_time, exit_time, pnl, fees, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          tradeId, backtestId, strategy.symbol, 
          Math.random() > 0.5 ? 'BUY' : 'SELL',
          quantity, entryPrice, exitPrice,
          new Date(Date.now() - Math.random() * 86400000),
          new Date(), pnl, fees, now
        ]
      );
    }

    // Update strategy statistics
    const successRate = (winningTrades / totalTrades) * 100;
    await pool.execute(
      `UPDATE strategies SET 
        total_executions = total_executions + 1,
        success_rate = ?,
        last_executed = ?
       WHERE id = ?`,
      [successRate, now, strategyId]
    );

    return NextResponse.json({
      message: 'Backtest completed successfully',
      backtest_id: backtestId,
      results: {
        initial_capital,
        final_value: finalValue,
        total_trades: totalTrades,
        winning_trades: winningTrades,
        losing_trades: losingTrades,
        total_pnl: totalPnl,
        max_drawdown: maxDrawdown,
        sharpe_ratio: sharpeRatio,
        success_rate: successRate
      }
    });
  } catch (error) {
    console.error('Error running backtest:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
