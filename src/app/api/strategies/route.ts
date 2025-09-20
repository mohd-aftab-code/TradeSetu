import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Fetch all strategies with their details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const strategyType = searchParams.get('strategy_type');
    const limit = searchParams.get('limit') || '50';


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


    // Parse JSON fields and add strategy-specific details
    const strategiesWithDetails = strategies.map((strategy) => {
      // Parse JSON fields
      const riskManagement = typeof strategy.risk_management === 'string' 
        ? JSON.parse(strategy.risk_management) 
        : strategy.risk_management;
      
      const strategyData = strategy.strategy_data 
        ? (typeof strategy.strategy_data === 'string' 
            ? JSON.parse(strategy.strategy_data) 
            : strategy.strategy_data)
        : null;
      
      const advanceFeatures = strategy.advance_features 
        ? (typeof strategy.advance_features === 'string' 
            ? JSON.parse(strategy.advance_features) 
            : strategy.advance_features)
        : null;
      
      const performanceMetrics = strategy.performance_metrics 
        ? (typeof strategy.performance_metrics === 'string' 
            ? JSON.parse(strategy.performance_metrics) 
            : strategy.performance_metrics)
        : null;

      return {
        ...strategy,
        risk_management: riskManagement,
        strategy_data: strategyData,
        advance_features: advanceFeatures,
        performance_metrics: performanceMetrics,
        details: strategyData // Use strategy_data as details
      };
    });
    
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
