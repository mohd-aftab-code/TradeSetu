import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// POST - Create a new indicator-based strategy using normalized structure
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      user_id,
      strategy_id,
      chart_config = {},
      condition_blocks = [],
      selected_indicators = {},
      strike_config = {},
      form_state = {}
    } = body;

    console.log('Extracted values:');
    console.log('- user_id:', user_id);
    console.log('- strategy_id:', strategy_id);
    console.log('- chart_config:', JSON.stringify(chart_config, null, 2));
    console.log('- condition_blocks:', JSON.stringify(condition_blocks, null, 2));
    console.log('- selected_indicators:', JSON.stringify(selected_indicators, null, 2));
    console.log('- strike_config:', JSON.stringify(strike_config, null, 2));
    console.log('- form_state:', JSON.stringify(form_state, null, 2));

    const indicatorStrategyId = `ind_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    console.log('Generated indicatorStrategyId:', indicatorStrategyId);

    // Insert into indicator_based_strategies table using normalized structure
    const insertValues = [
      indicatorStrategyId,
      strategy_id,
      user_id,
      JSON.stringify(chart_config),
      JSON.stringify(condition_blocks),
      JSON.stringify(selected_indicators),
      JSON.stringify(strike_config),
      JSON.stringify(form_state)
    ];
    
    console.log('Insert values:', insertValues);
    console.log('SQL Query: INSERT INTO indicator_based_strategies (id, strategy_id, user_id, chart_config, condition_blocks, selected_indicators, strike_config, form_state) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    
    const [result] = await pool.execute(
      `INSERT INTO indicator_based_strategies (
        id, strategy_id, user_id, chart_config, condition_blocks, selected_indicators, strike_config, form_state
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      insertValues
    );
    
    console.log('Insert result:', result);

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

// GET - Fetch indicator-based strategies using normalized structure
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const strategyId = searchParams.get('strategy_id');

    let query = `
      SELECT 
        ibs.*, 
        s.name as strategy_name, s.description, s.symbol, s.is_active, s.is_paper_trading,
        sc.selected_instrument_symbol, sc.selected_instrument_name, sc.selected_instrument_segment, sc.selected_instrument_lot_size,
        sc.order_type, sc.start_time, sc.square_off_time, sc.working_days,
        sc.daily_profit_limit, sc.daily_loss_limit, sc.max_trade_cycles, sc.no_trade_after,
        srm.stop_loss_type, srm.stop_loss_value, srm.stop_loss_on_price,
        srm.take_profit_type, srm.take_profit_value, srm.take_profit_on_price, srm.position_size,
        spt.trailing_type, spt.lock_fix_profit_reach, spt.lock_fix_profit_at,
        spt.trail_profit_increase, spt.trail_profit_by, spt.lock_and_trail_reach, spt.lock_and_trail_at,
        spt.lock_and_trail_increase, spt.lock_and_trail_by
      FROM indicator_based_strategies ibs
      JOIN strategies s ON ibs.strategy_id = s.id
      LEFT JOIN strategy_config sc ON s.id = sc.strategy_id
      LEFT JOIN strategy_risk_management srm ON s.id = srm.strategy_id
      LEFT JOIN strategy_profit_trailing spt ON s.id = spt.strategy_id
    `;
    
    const params = [];
    const conditions = [];
    
    if (userId) {
      conditions.push('ibs.user_id = ?');
      params.push(userId);
    }
    
    if (strategyId) {
      conditions.push('ibs.strategy_id = ?');
      params.push(strategyId);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY ibs.created_at DESC';

    const [rows] = await pool.execute(query, params);
    const strategies = rows as any[];

    // Parse JSON fields
    const strategiesWithDetails = strategies.map((strategy) => {
      const chartConfig = strategy.chart_config 
        ? (typeof strategy.chart_config === 'string' ? JSON.parse(strategy.chart_config) : strategy.chart_config)
        : null;
      
      const conditionBlocks = strategy.condition_blocks 
        ? (typeof strategy.condition_blocks === 'string' ? JSON.parse(strategy.condition_blocks) : strategy.condition_blocks)
        : null;
      
      const selectedIndicators = strategy.selected_indicators 
        ? (typeof strategy.selected_indicators === 'string' ? JSON.parse(strategy.selected_indicators) : strategy.selected_indicators)
        : null;
      
      const strikeConfig = strategy.strike_config 
        ? (typeof strategy.strike_config === 'string' ? JSON.parse(strategy.strike_config) : strategy.strike_config)
        : null;
      
      const formState = strategy.form_state 
        ? (typeof strategy.form_state === 'string' ? JSON.parse(strategy.form_state) : strategy.form_state)
        : null;

      const workingDays = strategy.working_days 
        ? (typeof strategy.working_days === 'string' ? JSON.parse(strategy.working_days) : strategy.working_days)
        : null;

      return {
        ...strategy,
        chart_config: chartConfig,
        condition_blocks: conditionBlocks,
        selected_indicators: selectedIndicators,
        strike_config: strikeConfig,
        form_state: formState,
        working_days: workingDays,
        details: {
          chart_config: chartConfig,
          condition_blocks: conditionBlocks,
          selected_indicators: selectedIndicators,
          strike_config: strikeConfig,
          form_state: formState
        }
      };
    });

    return NextResponse.json({ 
      strategies: strategiesWithDetails,
      count: strategiesWithDetails.length 
    });
  } catch (error) {
    console.error('Error fetching indicator-based strategies:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Update indicator-based strategy using normalized structure
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, chart_config, condition_blocks, selected_indicators, strike_config, form_state } = body;

    if (!id) {
      return NextResponse.json({ error: 'Strategy ID is required' }, { status: 400 });
    }

    // Build dynamic update query
    const updateFields: string[] = [];
    const values: any[] = [];
    
    if (chart_config !== undefined) {
      updateFields.push('chart_config = ?');
      values.push(JSON.stringify(chart_config));
    }
    
    if (condition_blocks !== undefined) {
      updateFields.push('condition_blocks = ?');
      values.push(JSON.stringify(condition_blocks));
    }
    
    if (selected_indicators !== undefined) {
      updateFields.push('selected_indicators = ?');
      values.push(JSON.stringify(selected_indicators));
    }
    
    if (strike_config !== undefined) {
      updateFields.push('strike_config = ?');
      values.push(JSON.stringify(strike_config));
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
