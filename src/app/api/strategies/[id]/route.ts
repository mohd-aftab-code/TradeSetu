import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Fetch a specific strategy
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const strategyId = params.id;

    const [rows] = await pool.execute(
      'SELECT * FROM strategies WHERE id = ?',
      [strategyId]
    );

    if (!rows || (rows as any[]).length === 0) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
    }

    return NextResponse.json({ strategy: (rows as any[])[0] });
  } catch (error) {
    console.error('Error fetching strategy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update a strategy
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const strategyId = params.id;
    const body = await request.json();
    const {
      name,
      description,
      strategy_type,
      symbol,
      entry_conditions,
      exit_conditions,
      risk_management,
      is_active,
      is_paper_trading
    } = body;

    const now = new Date();

    const [result] = await pool.execute(
      `UPDATE strategies SET 
        name = ?, description = ?, strategy_type = ?, symbol = ?,
        entry_conditions = ?, exit_conditions = ?, risk_management = ?,
        is_active = ?, is_paper_trading = ?, updated_at = ?
       WHERE id = ?`,
      [
        name,
        description,
        strategy_type,
        symbol,
        entry_conditions,
        exit_conditions,
        JSON.stringify(risk_management),
        is_active,
        is_paper_trading,
        now,
        strategyId
      ]
    );

    return NextResponse.json({ message: 'Strategy updated successfully' });
  } catch (error) {
    console.error('Error updating strategy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a strategy
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const strategyId = params.id;

    // First delete related backtest trades
    await pool.execute(
      'DELETE FROM backtest_trades WHERE backtest_id IN (SELECT id FROM backtests WHERE strategy_id = ?)',
      [strategyId]
    );

    // Then delete backtests
    await pool.execute(
      'DELETE FROM backtests WHERE strategy_id = ?',
      [strategyId]
    );

    // Finally delete the strategy
    const [result] = await pool.execute(
      'DELETE FROM strategies WHERE id = ?',
      [strategyId]
    );

    return NextResponse.json({ message: 'Strategy deleted successfully' });
  } catch (error) {
    console.error('Error deleting strategy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
