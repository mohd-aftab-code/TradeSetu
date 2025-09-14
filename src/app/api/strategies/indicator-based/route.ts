import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// POST - Create a new indicator-based strategy
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      strategy_id,
      chart_type = 'Candle',
      time_interval = '5 Min',
      transaction_type = 'Both Side',
      long_conditions = [],
      short_conditions = [],
      condition_blocks = 1,
      logical_operator = 'AND',
      selected_indicators = {},
      stop_loss_type = 'SL %',
      stop_loss_value = 2.0,
      take_profit_type = 'TP %',
      take_profit_value = 4.0,
      position_size = '1',
      profit_trailing_type = 'no_trailing',
      trailing_stop = false,
      trailing_stop_percentage = 1.5,
      trailing_profit = false,
      trailing_profit_percentage = 2.0,
      daily_loss_limit = 5000,
      daily_profit_limit = 10000,
      max_trade_cycles = 3,
      no_trade_after = '15:15:00',
      working_days = {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false
      },
      start_time = '09:15:00',
      square_off_time = '15:15:00'
    } = body;

    const indicatorStrategyId = `ind_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    // Insert into indicator_based_strategies table
    const [result] = await pool.execute(
      `INSERT INTO indicator_based_strategies (
        id, strategy_id, user_id, chart_type, time_interval, transaction_type,
        long_conditions, short_conditions, condition_blocks, logical_operator,
        selected_indicators, stop_loss_type, stop_loss_value, take_profit_type,
        take_profit_value, position_size, profit_trailing_type, trailing_stop,
        trailing_stop_percentage, trailing_profit, trailing_profit_percentage,
        daily_loss_limit, daily_profit_limit, max_trade_cycles, no_trade_after,
        working_days, start_time, square_off_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        indicatorStrategyId,
        strategy_id,
        user_id,
        chart_type,
        time_interval,
        transaction_type,
        JSON.stringify(long_conditions),
        JSON.stringify(short_conditions),
        condition_blocks,
        logical_operator,
        JSON.stringify(selected_indicators),
        stop_loss_type,
        stop_loss_value,
        take_profit_type,
        take_profit_value,
        position_size,
        profit_trailing_type,
        trailing_stop,
        trailing_stop_percentage,
        trailing_profit,
        trailing_profit_percentage,
        daily_loss_limit,
        daily_profit_limit,
        max_trade_cycles,
        no_trade_after,
        JSON.stringify(working_days),
        start_time,
        square_off_time
      ]
    );

    return NextResponse.json({ 
      message: 'Indicator-based strategy created successfully',
      indicator_strategy_id: indicatorStrategyId,
      strategy_id: strategy_id
    });
  } catch (error) {
    console.error('Error creating indicator-based strategy:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET - Fetch indicator-based strategies
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    let query = `
      SELECT ibs.*, s.name as strategy_name, s.description, s.symbol, s.is_active, s.is_paper_trading
      FROM indicator_based_strategies ibs
      JOIN strategies s ON ibs.strategy_id = s.id
    `;
    
    const params = [];
    if (userId) {
      query += ' WHERE ibs.user_id = ?';
      params.push(userId);
    }
    
    query += ' ORDER BY ibs.created_at DESC';

    const [rows] = await pool.execute(query, params);

    return NextResponse.json({ 
      strategies: rows,
      count: (rows as any[]).length 
    });
  } catch (error) {
    console.error('Error fetching indicator-based strategies:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Update indicator-based strategy
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Strategy ID is required' }, { status: 400 });
    }

    // Build dynamic update query
    const updateFields: string[] = [];
    const values: any[] = [];
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        values.push(
          ['long_conditions', 'short_conditions', 'selected_indicators', 'working_days'].includes(key) 
            ? JSON.stringify(updateData[key]) 
            : updateData[key]
        );
      }
    });

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(id);

    const [result] = await pool.execute(
      `UPDATE indicator_based_strategies SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );

    return NextResponse.json({ 
      message: 'Indicator-based strategy updated successfully',
      affected_rows: (result as any).affectedRows
    });
  } catch (error) {
    console.error('Error updating indicator-based strategy:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Delete indicator-based strategy
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Strategy ID is required' }, { status: 400 });
    }

    const [result] = await pool.execute(
      'DELETE FROM indicator_based_strategies WHERE id = ?',
      [id]
    );

    return NextResponse.json({ 
      message: 'Indicator-based strategy deleted successfully',
      affected_rows: (result as any).affectedRows
    });
  } catch (error) {
    console.error('Error deleting indicator-based strategy:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
