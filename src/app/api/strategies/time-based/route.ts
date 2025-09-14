import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// POST - Create a new time-based strategy
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      strategy_id,
      trigger_type = 'specific_time',
      trigger_time = '09:20:00',
      trigger_timezone = 'IST',
      trigger_recurrence = 'daily',
      trigger_weekly_days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      trigger_monthly_day = 1,
      trigger_monthly_type = 'day_of_month',
      trigger_after_open_minutes = 5,
      trigger_before_close_minutes = 15,
      trigger_candle_interval = 5,
      trigger_candle_delay_minutes = 1,
      action_type = 'place_order',
      order_transaction_type = 'BUY',
      order_type = 'MARKET',
      order_quantity = 1,
      order_product_type = 'MIS',
      order_price = null,
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
      square_off_time = '15:15:00',
      strategy_start_date = null,
      strategy_start_time = '09:15:00',
      strategy_validity_date = null,
      deactivate_after_first_trigger = false,
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
      no_trade_after = '15:15:00'
    } = body;

    const timeBasedStrategyId = `time_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    // Insert into time_based_strategies table
    const [result] = await pool.execute(
      `INSERT INTO time_based_strategies (
        id, strategy_id, user_id, trigger_type, trigger_time, trigger_timezone,
        trigger_recurrence, trigger_weekly_days, trigger_monthly_day, trigger_monthly_type,
        trigger_after_open_minutes, trigger_before_close_minutes, trigger_candle_interval,
        trigger_candle_delay_minutes, action_type, order_transaction_type, order_type,
        order_quantity, order_product_type, order_price, working_days, start_time,
        square_off_time, strategy_start_date, strategy_start_time, strategy_validity_date,
        deactivate_after_first_trigger, stop_loss_type, stop_loss_value, take_profit_type,
        take_profit_value, position_size, profit_trailing_type, trailing_stop,
        trailing_stop_percentage, trailing_profit, trailing_profit_percentage,
        daily_loss_limit, daily_profit_limit, max_trade_cycles, no_trade_after
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        timeBasedStrategyId,
        strategy_id,
        user_id,
        trigger_type,
        trigger_time,
        trigger_timezone,
        trigger_recurrence,
        JSON.stringify(trigger_weekly_days),
        trigger_monthly_day,
        trigger_monthly_type,
        trigger_after_open_minutes,
        trigger_before_close_minutes,
        trigger_candle_interval,
        trigger_candle_delay_minutes,
        action_type,
        order_transaction_type,
        order_type,
        order_quantity,
        order_product_type,
        order_price,
        JSON.stringify(working_days),
        start_time,
        square_off_time,
        strategy_start_date,
        strategy_start_time,
        strategy_validity_date,
        deactivate_after_first_trigger,
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
        no_trade_after
      ]
    );

    return NextResponse.json({ 
      message: 'Time-based strategy created successfully',
      time_based_strategy_id: timeBasedStrategyId,
      strategy_id: strategy_id
    });
  } catch (error) {
    console.error('Error creating time-based strategy:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET - Fetch time-based strategies
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    let query = `
      SELECT tbs.*, s.name as strategy_name, s.description, s.symbol, s.is_active, s.is_paper_trading
      FROM time_based_strategies tbs
      JOIN strategies s ON tbs.strategy_id = s.id
    `;
    
    const params = [];
    if (userId) {
      query += ' WHERE tbs.user_id = ?';
      params.push(userId);
    }
    
    query += ' ORDER BY tbs.created_at DESC';

    const [rows] = await pool.execute(query, params);

    return NextResponse.json({ 
      strategies: rows,
      count: (rows as any[]).length 
    });
  } catch (error) {
    console.error('Error fetching time-based strategies:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Update time-based strategy
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
          ['trigger_weekly_days', 'working_days'].includes(key) 
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
      `UPDATE time_based_strategies SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );

    return NextResponse.json({ 
      message: 'Time-based strategy updated successfully',
      affected_rows: (result as any).affectedRows
    });
  } catch (error) {
    console.error('Error updating time-based strategy:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Delete time-based strategy
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Strategy ID is required' }, { status: 400 });
    }

    const [result] = await pool.execute(
      'DELETE FROM time_based_strategies WHERE id = ?',
      [id]
    );

    return NextResponse.json({ 
      message: 'Time-based strategy deleted successfully',
      affected_rows: (result as any).affectedRows
    });
  } catch (error) {
    console.error('Error deleting time-based strategy:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
