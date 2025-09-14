import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Fetch all strategies with their details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const strategyType = searchParams.get('strategy_type');
    const limit = searchParams.get('limit') || '50';

    console.log('Fetching strategies for user_id:', userId);

    let query = `
      SELECT s.*, sp.total_trades, sp.winning_trades, sp.total_pnl, sp.win_rate, sp.max_drawdown
      FROM strategies s
      LEFT JOIN strategy_performance sp ON s.id = sp.strategy_id
    `;
    
    const params = [];
    const conditions = [];
    
    if (userId) {
      conditions.push('s.user_id = ?');
      params.push(userId);
    }
    
    if (strategyType) {
      conditions.push('s.strategy_type = ?');
      params.push(strategyType);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ` ORDER BY s.created_at DESC LIMIT ${parseInt(limit)}`;

    const [rows] = await pool.execute(query, params);
    const strategies = rows as any[];

    console.log('Found strategies:', strategies.length);

    // Fetch strategy-specific details for each strategy
    const strategiesWithDetails = await Promise.all(
      strategies.map(async (strategy) => {
        let details = null;
        
        switch (strategy.strategy_type) {
          case 'TIME_BASED':
            const [timeBasedRows] = await pool.execute(
              'SELECT * FROM time_based_strategies WHERE strategy_id = ?',
              [strategy.id]
            );
            details = (timeBasedRows as any[])[0] || null;
            break;
            
          case 'INDICATOR_BASED':
            const [indicatorRows] = await pool.execute(
              'SELECT * FROM indicator_based_strategies WHERE strategy_id = ?',
              [strategy.id]
            );
            details = (indicatorRows as any[])[0] || null;
            break;
            
          case 'PROGRAMMING':
            const [programmingRows] = await pool.execute(
              'SELECT * FROM programming_strategies WHERE strategy_id = ?',
              [strategy.id]
            );
            details = (programmingRows as any[])[0] || null;
            break;
        }

        return {
          ...strategy,
          details: details
        };
      })
    );
    
    return NextResponse.json({ 
      strategies: strategiesWithDetails,
      count: strategiesWithDetails.length 
    });
  } catch (error) {
    console.error('Error fetching strategies:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Create a new strategy (main strategy record only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      name,
      description,
      strategy_type,
      symbol,
      asset_type = 'STOCK',
      entry_conditions,
      exit_conditions,
      risk_management,
      is_active = false,
      is_paper_trading = true
    } = body;

    const strategyId = `strategy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Insert into main strategies table
    const [result] = await pool.execute(
      `INSERT INTO strategies (
        id, user_id, name, description, strategy_type, symbol, asset_type,
        entry_conditions, exit_conditions, risk_management,
        is_active, is_paper_trading
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        strategyId,
        user_id,
        name,
        description,
        strategy_type,
        symbol,
        asset_type,
        entry_conditions,
        exit_conditions,
        JSON.stringify(risk_management),
        is_active,
        is_paper_trading
      ]
    );

    // Initialize performance record
    const performanceId = `perf_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    await pool.execute(
      `INSERT INTO strategy_performance (
        id, strategy_id, user_id, total_trades, winning_trades, losing_trades,
        total_pnl, max_drawdown, sharpe_ratio, win_rate, avg_win, avg_loss,
        profit_factor, max_consecutive_losses, total_runtime_hours,
        avg_trade_duration_minutes, max_position_size, max_daily_loss, max_daily_profit
      ) VALUES (?, ?, ?, 0, 0, 0, 0.00, 0.00, 0.0000, 0.00, 0.00, 0.00, 0.0000, 0, 0.00, 0.00, 0.00, 0.00, 0.00)`,
      [performanceId, strategyId, user_id]
    );

    return NextResponse.json({ 
      message: 'Strategy created successfully',
      strategy_id: strategyId 
    });
  } catch (error) {
    console.error('Error creating strategy:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
