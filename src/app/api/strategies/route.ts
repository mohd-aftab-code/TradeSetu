import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Fetch all strategies
export async function GET(request: NextRequest) {
  try {
    const [rows] = await pool.execute('SELECT * FROM strategies LIMIT 10');
    
    return NextResponse.json({ 
      strategies: rows,
      count: (rows as any[]).length 
    });
  } catch (error) {
    console.error('Error fetching strategies:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Create a new strategy
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      name,
      description,
      strategy_type,
      symbol,
      entry_conditions,
      exit_conditions,
      risk_management,
      is_active = false,
      is_paper_trading = true
    } = body;

    const strategyId = `strategy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const [result] = await pool.execute(
      `INSERT INTO strategies (
        id, user_id, name, description, strategy_type, symbol,
        entry_conditions, exit_conditions, risk_management,
        is_active, is_paper_trading
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        strategyId,
        user_id,
        name,
        description,
        strategy_type,
        symbol,
        entry_conditions,
        exit_conditions,
        JSON.stringify(risk_management),
        is_active,
        is_paper_trading
      ]
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
