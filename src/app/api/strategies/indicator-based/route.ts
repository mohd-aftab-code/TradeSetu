import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// POST - Create a new indicator-based strategy
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      strategy_id,
      name,
      description,
      selected_instrument_symbol,
      selected_instrument_name,
      selected_instrument_segment,
      selected_instrument_lot_size,
      order_type = 'MIS',
      start_time = '09:15:00',
      square_off_time = '15:15:00',
      working_days = {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false
      },
      chart_type = 'Candle',
      time_interval = '5 Min',
      transaction_type = 'Both Side',
      condition_blocks = 1,
      logical_operator = 'AND',
      long_conditions = [],
      long_comparator = 'higher_than',
      short_conditions = [],
      short_comparator = 'lower_than',
      selected_indicators = {},
      strike_type = 'ATM pt',
      strike_value = '',
      custom_price = null,
      action_type = 'BUY',
      quantity = 1,
      expiry_type = 'WEEKLY',
      sl_type = 'SL Points',
      sl_value = 2.0,
      sl_on_price = 'On Price',
      tp_type = 'TP Points',
      tp_value = 4.0,
      tp_on_price = 'On Price',
      daily_profit_limit = 10000,
      daily_loss_limit = 5000,
      max_trade_cycles = 3,
      no_trade_after = '15:15:00',
      profit_trailing_type = 'no_trailing',
      profit_trailing_config = {}
    } = body;

    const indicatorStrategyId = `ind_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    // Insert into comprehensive indicator_based_strategies_complete table
    const [result] = await pool.execute(
      `INSERT INTO indicator_based_strategies_complete (
        id, strategy_id, user_id, name, description,
        selected_instrument_symbol, selected_instrument_name, selected_instrument_segment, selected_instrument_lot_size,
        order_type, start_time, square_off_time, working_days,
        chart_type, time_interval, transaction_type,
        condition_blocks, logical_operator,
        long_conditions, long_comparator, short_conditions, short_comparator,
        selected_indicators,
        strike_type, strike_value, custom_price,
        action_type, quantity, expiry_type,
        sl_type, sl_value, sl_on_price,
        tp_type, tp_value, tp_on_price,
        daily_profit_limit, daily_loss_limit, max_trade_cycles, no_trade_after,
        profit_trailing_type, profit_trailing_config
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        indicatorStrategyId,
        strategy_id,
        user_id,
        name || 'Indicator Strategy',
        description || '',
        selected_instrument_symbol || 'NIFTY',
        selected_instrument_name || 'NIFTY 50',
        selected_instrument_segment || 'INDEX',
        selected_instrument_lot_size || 25,
        order_type,
        start_time,
        square_off_time,
        JSON.stringify(working_days),
        chart_type,
        time_interval,
        transaction_type,
        condition_blocks,
        logical_operator,
        JSON.stringify(long_conditions),
        long_comparator,
        JSON.stringify(short_conditions),
        short_comparator,
        JSON.stringify(selected_indicators),
        strike_type,
        strike_value,
        custom_price,
        action_type,
        quantity,
        expiry_type,
        'SL pt',
        sl_value || 2.0,
        sl_on_price || 'On Price',
        'TP pt',
        tp_value || 4.0,
        tp_on_price || 'On Price',
        daily_profit_limit || null,
        daily_loss_limit || null,
        max_trade_cycles || null,
        no_trade_after || null,
        profit_trailing_type || 'no_trailing',
        JSON.stringify(profit_trailing_config || {})
      ]
    );

    // TODO: Add related table inserts later
    // For now, just store in the main comprehensive table

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
      FROM indicator_based_strategies_complete ibs
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
          ['long_conditions', 'short_conditions', 'selected_indicators', 'working_days', 'profit_trailing_config'].includes(key) 
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
      `UPDATE indicator_based_strategies_complete SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
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

    // Delete from comprehensive table (cascade deletes will handle related tables)
    const [result] = await pool.execute(
      'DELETE FROM indicator_based_strategies_complete WHERE id = ?',
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
