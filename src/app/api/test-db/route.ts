import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const connection = await pool.getConnection();
    
    // Check if strategies table exists
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'strategies'"
    );
    
    // Check table structure
    const [columns] = await connection.execute(
      "DESCRIBE strategies"
    );
    
    // Check if there are any strategies
    const [strategies] = await connection.execute(
      "SELECT COUNT(*) as count FROM strategies"
    );
    
    connection.release();
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      tables_exist: (tables as any[]).length > 0,
      table_structure: columns,
      strategy_count: (strategies as any[])[0]?.count || 0
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Create a test strategy
export async function POST(request: NextRequest) {
  try {
    const connection = await pool.getConnection();
    
    const testStrategyId = `test_strategy_${Date.now()}`;
    
    // Create a test strategy
    await connection.execute(
      `INSERT INTO strategies (
        id, user_id, name, description, strategy_type, symbol,
        entry_conditions, exit_conditions, risk_management,
        is_active, is_paper_trading, total_executions, success_rate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        testStrategyId,
        'tradesetu001',
        'Test Momentum Strategy',
        'A test strategy for demonstration purposes',
        'SCALPING',
        'NIFTY50',
        'RSI > 70 and Volume > 1.5x average',
        'RSI < 30 or Stop Loss hit',
        JSON.stringify({
          stop_loss: 0.5,
          take_profit: 1.5,
          position_size: 100
        }),
        1, // is_active
        1, // is_paper_trading
        25, // total_executions
        68.5 // success_rate
      ]
    );
    
    connection.release();
    
    return NextResponse.json({
      status: 'success',
      message: 'Test strategy created successfully',
      strategy_id: testStrategyId
    });
  } catch (error) {
    console.error('Error creating test strategy:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to create test strategy',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
