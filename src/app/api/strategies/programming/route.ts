import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// POST - Create a new programming strategy using normalized structure
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      strategy_id,
      code = '',
      language = 'python',
      dependencies = [],
      environment_variables = {},
      execution_config = {}
    } = body;

    const programmingStrategyId = `prog_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    // Insert into programming_strategies table using normalized structure
    const [result] = await pool.execute(
      `INSERT INTO programming_strategies (
        id, strategy_id, user_id, code, language, dependencies, environment_variables, execution_config
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        programmingStrategyId,
        strategy_id,
        user_id,
        code,
        language,
        JSON.stringify(dependencies),
        JSON.stringify(environment_variables),
        JSON.stringify(execution_config)
      ]
    );

    return NextResponse.json({ 
      message: 'Programming strategy created successfully',
      programming_strategy_id: programmingStrategyId,
      strategy_id: strategy_id
    });
  } catch (error) {
    console.error('Error creating programming strategy:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET - Fetch programming strategies using normalized structure
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const strategyId = searchParams.get('strategy_id');

    let query = `
      SELECT 
        ps.*, 
        s.name as strategy_name, s.description, s.symbol, s.is_active, s.is_paper_trading,
        sc.selected_instrument_symbol, sc.selected_instrument_name, sc.selected_instrument_segment, sc.selected_instrument_lot_size,
        sc.order_type, sc.start_time, sc.square_off_time, sc.working_days,
        sc.daily_profit_limit, sc.daily_loss_limit, sc.max_trade_cycles, sc.no_trade_after,
        srm.stop_loss_type, srm.stop_loss_value, srm.stop_loss_on_price,
        srm.take_profit_type, srm.take_profit_value, srm.take_profit_on_price, srm.position_size,
        spt.trailing_type, spt.lock_fix_profit_reach, spt.lock_fix_profit_at,
        spt.trail_profit_increase, spt.trail_profit_by, spt.lock_and_trail_reach, spt.lock_and_trail_at,
        spt.lock_and_trail_increase, spt.lock_and_trail_by
      FROM programming_strategies ps
      JOIN strategies s ON ps.strategy_id = s.id
      LEFT JOIN strategy_config sc ON s.id = sc.strategy_id
      LEFT JOIN strategy_risk_management srm ON s.id = srm.strategy_id
      LEFT JOIN strategy_profit_trailing spt ON s.id = spt.strategy_id
    `;
    
    const params = [];
    const conditions = [];
    
    if (userId) {
      conditions.push('ps.user_id = ?');
      params.push(userId);
    }
    
    if (strategyId) {
      conditions.push('ps.strategy_id = ?');
      params.push(strategyId);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY ps.created_at DESC';

    const [rows] = await pool.execute(query, params);
    const strategies = rows as any[];

    // Parse JSON fields
    const strategiesWithDetails = strategies.map((strategy) => {
      const dependencies = strategy.dependencies 
        ? (typeof strategy.dependencies === 'string' ? JSON.parse(strategy.dependencies) : strategy.dependencies)
        : null;
      
      const environmentVariables = strategy.environment_variables 
        ? (typeof strategy.environment_variables === 'string' ? JSON.parse(strategy.environment_variables) : strategy.environment_variables)
        : null;
      
      const executionConfig = strategy.execution_config 
        ? (typeof strategy.execution_config === 'string' ? JSON.parse(strategy.execution_config) : strategy.execution_config)
        : null;

      const workingDays = strategy.working_days 
        ? (typeof strategy.working_days === 'string' ? JSON.parse(strategy.working_days) : strategy.working_days)
        : null;

      return {
        ...strategy,
        dependencies: dependencies,
        environment_variables: environmentVariables,
        execution_config: executionConfig,
        working_days: workingDays,
        details: {
          dependencies: dependencies,
          environment_variables: environmentVariables,
          execution_config: executionConfig
        }
      };
    });

    return NextResponse.json({ 
      strategies: strategiesWithDetails,
      count: strategiesWithDetails.length 
    });
  } catch (error) {
    console.error('Error fetching programming strategies:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Update programming strategy using normalized structure
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, code, language, dependencies, environment_variables, execution_config } = body;

    if (!id) {
      return NextResponse.json({ error: 'Strategy ID is required' }, { status: 400 });
    }

    // Build dynamic update query
    const updateFields: string[] = [];
    const values: any[] = [];
    
    if (code !== undefined) {
      updateFields.push('code = ?');
      values.push(code);
    }
    
    if (language !== undefined) {
      updateFields.push('language = ?');
      values.push(language);
    }
    
    if (dependencies !== undefined) {
      updateFields.push('dependencies = ?');
      values.push(JSON.stringify(dependencies));
    }
    
    if (environment_variables !== undefined) {
      updateFields.push('environment_variables = ?');
      values.push(JSON.stringify(environment_variables));
    }
    
    if (execution_config !== undefined) {
      updateFields.push('execution_config = ?');
      values.push(JSON.stringify(execution_config));
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(id);

    const [result] = await pool.execute(
      `UPDATE programming_strategies SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );

    return NextResponse.json({ 
      message: 'Programming strategy updated successfully',
      affected_rows: (result as any).affectedRows
    });
  } catch (error) {
    console.error('Error updating programming strategy:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Delete programming strategy
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Strategy ID is required' }, { status: 400 });
    }

    const [result] = await pool.execute(
      'DELETE FROM programming_strategies WHERE id = ?',
      [id]
    );

    return NextResponse.json({ 
      message: 'Programming strategy deleted successfully',
      affected_rows: (result as any).affectedRows
    });
  } catch (error) {
    console.error('Error deleting programming strategy:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
