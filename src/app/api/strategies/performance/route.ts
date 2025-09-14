import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// POST - Create or update strategy performance
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      strategy_id,
      user_id,
      total_trades = 0,
      winning_trades = 0,
      losing_trades = 0,
      total_pnl = 0.00,
      max_drawdown = 0.00,
      sharpe_ratio = 0.0000,
      win_rate = 0.00,
      avg_win = 0.00,
      avg_loss = 0.00,
      profit_factor = 0.0000,
      max_consecutive_losses = 0,
      total_runtime_hours = 0.00,
      avg_trade_duration_minutes = 0.00,
      max_position_size = 0.00,
      max_daily_loss = 0.00,
      max_daily_profit = 0.00
    } = body;

    // Check if performance record exists
    const [existing] = await pool.execute(
      'SELECT id FROM strategy_performance WHERE strategy_id = ? AND user_id = ?',
      [strategy_id, user_id]
    );

    if ((existing as any[]).length > 0) {
      // Update existing record
      const [result] = await pool.execute(
        `UPDATE strategy_performance SET 
          total_trades = ?, winning_trades = ?, losing_trades = ?, total_pnl = ?,
          max_drawdown = ?, sharpe_ratio = ?, win_rate = ?, avg_win = ?,
          avg_loss = ?, profit_factor = ?, max_consecutive_losses = ?,
          total_runtime_hours = ?, avg_trade_duration_minutes = ?, max_position_size = ?,
          max_daily_loss = ?, max_daily_profit = ?, updated_at = NOW()
        WHERE strategy_id = ? AND user_id = ?`,
        [
          total_trades, winning_trades, losing_trades, total_pnl,
          max_drawdown, sharpe_ratio, win_rate, avg_win,
          avg_loss, profit_factor, max_consecutive_losses,
          total_runtime_hours, avg_trade_duration_minutes, max_position_size,
          max_daily_loss, max_daily_profit, strategy_id, user_id
        ]
      );

      return NextResponse.json({ 
        message: 'Strategy performance updated successfully',
        affected_rows: (result as any).affectedRows
      });
    } else {
      // Create new record
      const performanceId = `perf_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      
      const [result] = await pool.execute(
        `INSERT INTO strategy_performance (
          id, strategy_id, user_id, total_trades, winning_trades, losing_trades,
          total_pnl, max_drawdown, sharpe_ratio, win_rate, avg_win, avg_loss,
          profit_factor, max_consecutive_losses, total_runtime_hours,
          avg_trade_duration_minutes, max_position_size, max_daily_loss, max_daily_profit
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          performanceId, strategy_id, user_id, total_trades, winning_trades, losing_trades,
          total_pnl, max_drawdown, sharpe_ratio, win_rate, avg_win, avg_loss,
          profit_factor, max_consecutive_losses, total_runtime_hours,
          avg_trade_duration_minutes, max_position_size, max_daily_loss, max_daily_profit
        ]
      );

      return NextResponse.json({ 
        message: 'Strategy performance created successfully',
        performance_id: performanceId
      });
    }
  } catch (error) {
    console.error('Error creating/updating strategy performance:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET - Fetch strategy performance
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const strategyId = searchParams.get('strategy_id');
    const userId = searchParams.get('user_id');

    let query = `
      SELECT sp.*, s.name as strategy_name, s.strategy_type, s.symbol
      FROM strategy_performance sp
      JOIN strategies s ON sp.strategy_id = s.id
    `;
    
    const params = [];
    const conditions = [];
    
    if (strategyId) {
      conditions.push('sp.strategy_id = ?');
      params.push(strategyId);
    }
    
    if (userId) {
      conditions.push('sp.user_id = ?');
      params.push(userId);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY sp.updated_at DESC';

    const [rows] = await pool.execute(query, params);

    return NextResponse.json({ 
      performance: rows,
      count: (rows as any[]).length 
    });
  } catch (error) {
    console.error('Error fetching strategy performance:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Delete strategy performance
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const strategyId = searchParams.get('strategy_id');
    const userId = searchParams.get('user_id');

    if (!strategyId || !userId) {
      return NextResponse.json({ error: 'Strategy ID and User ID are required' }, { status: 400 });
    }

    const [result] = await pool.execute(
      'DELETE FROM strategy_performance WHERE strategy_id = ? AND user_id = ?',
      [strategyId, userId]
    );

    return NextResponse.json({ 
      message: 'Strategy performance deleted successfully',
      affected_rows: (result as any).affectedRows
    });
  } catch (error) {
    console.error('Error deleting strategy performance:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
