import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// POST - Create a new time-based strategy using normalized structure
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      strategy_id,
      trigger_config = {},
      order_legs = [],
      advance_features = {},
      form_state = {}
    } = body;

    const timeBasedStrategyId = `time_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    // Insert into time_based_strategies table using normalized structure
    const [result] = await pool.execute(
      `INSERT INTO time_based_strategies (
        id, strategy_id, user_id, trigger_config, order_legs, advance_features, form_state
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        timeBasedStrategyId,
        strategy_id,
        user_id,
        JSON.stringify(trigger_config),
        JSON.stringify(order_legs),
        JSON.stringify(advance_features),
        JSON.stringify(form_state)
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

// GET - Fetch time-based strategies using normalized structure
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const strategyId = searchParams.get('strategy_id');

    let query = `
      SELECT 
        tbs.*, 
        s.name as strategy_name, s.description, s.symbol, s.is_active, s.is_paper_trading,
        sc.selected_instrument_symbol, sc.selected_instrument_name, sc.selected_instrument_segment, sc.selected_instrument_lot_size,
        sc.order_type, sc.start_time, sc.square_off_time, sc.working_days,
        sc.daily_profit_limit, sc.daily_loss_limit, sc.max_trade_cycles, sc.no_trade_after,
        srm.stop_loss_type, srm.stop_loss_value, srm.stop_loss_on_price,
        srm.take_profit_type, srm.take_profit_value, srm.take_profit_on_price, srm.position_size,
        spt.trailing_type, spt.lock_fix_profit_reach, spt.lock_fix_profit_at,
        spt.trail_profit_increase, spt.trail_profit_by, spt.lock_and_trail_reach, spt.lock_and_trail_at,
        spt.lock_and_trail_increase, spt.lock_and_trail_by
      FROM time_based_strategies tbs
      JOIN strategies s ON tbs.strategy_id = s.id
      LEFT JOIN strategy_config sc ON s.id = sc.strategy_id
      LEFT JOIN strategy_risk_management srm ON s.id = srm.strategy_id
      LEFT JOIN strategy_profit_trailing spt ON s.id = spt.strategy_id
    `;
    
    const params = [];
    const conditions = [];
    
    if (userId) {
      conditions.push('tbs.user_id = ?');
      params.push(userId);
    }
    
    if (strategyId) {
      conditions.push('tbs.strategy_id = ?');
      params.push(strategyId);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY tbs.created_at DESC';

    const [rows] = await pool.execute(query, params);
    const strategies = rows as any[];

    // Parse JSON fields
    const strategiesWithDetails = strategies.map((strategy) => {
      const triggerConfig = strategy.trigger_config 
        ? (typeof strategy.trigger_config === 'string' ? JSON.parse(strategy.trigger_config) : strategy.trigger_config)
        : null;
      
      const orderLegs = strategy.order_legs 
        ? (typeof strategy.order_legs === 'string' ? JSON.parse(strategy.order_legs) : strategy.order_legs)
        : null;
      
      const advanceFeatures = strategy.advance_features 
        ? (typeof strategy.advance_features === 'string' ? JSON.parse(strategy.advance_features) : strategy.advance_features)
        : null;
      
      const formState = strategy.form_state 
        ? (typeof strategy.form_state === 'string' ? JSON.parse(strategy.form_state) : strategy.form_state)
        : null;

      const workingDays = strategy.working_days 
        ? (typeof strategy.working_days === 'string' ? JSON.parse(strategy.working_days) : strategy.working_days)
        : null;

      return {
        ...strategy,
        trigger_config: triggerConfig,
        order_legs: orderLegs,
        advance_features: advanceFeatures,
        form_state: formState,
        working_days: workingDays,
        details: {
          trigger_config: triggerConfig,
          order_legs: orderLegs,
          advance_features: advanceFeatures,
          form_state: formState
        }
      };
    });

    return NextResponse.json({ 
      strategies: strategiesWithDetails,
      count: strategiesWithDetails.length 
    });
  } catch (error) {
    console.error('Error fetching time-based strategies:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Update time-based strategy using normalized structure
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, trigger_config, order_legs, advance_features, form_state } = body;

    if (!id) {
      return NextResponse.json({ error: 'Strategy ID is required' }, { status: 400 });
    }

    // Build dynamic update query
    const updateFields: string[] = [];
    const values: any[] = [];
    
    if (trigger_config !== undefined) {
      updateFields.push('trigger_config = ?');
      values.push(JSON.stringify(trigger_config));
    }
    
    if (order_legs !== undefined) {
      updateFields.push('order_legs = ?');
      values.push(JSON.stringify(order_legs));
    }
    
    if (advance_features !== undefined) {
      updateFields.push('advance_features = ?');
      values.push(JSON.stringify(advance_features));
    }
    
    if (form_state !== undefined) {
      updateFields.push('form_state = ?');
      values.push(JSON.stringify(form_state));
    }

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
