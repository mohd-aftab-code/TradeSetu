import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Fetch all strategies with their details using normalized structure
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const strategyType = searchParams.get('strategy_type');
    const limit = searchParams.get('limit') || '50';

    let query = `
      SELECT 
        s.*,
        sc.selected_instrument_symbol, sc.selected_instrument_name, sc.selected_instrument_segment, sc.selected_instrument_lot_size,
        sc.order_type, sc.start_time, sc.square_off_time, sc.working_days,
        sc.daily_profit_limit, sc.daily_loss_limit, sc.max_trade_cycles, sc.no_trade_after,
        srm.stop_loss_type, srm.stop_loss_value, srm.stop_loss_on_price,
        srm.take_profit_type, srm.take_profit_value, srm.take_profit_on_price, srm.position_size,
        spt.trailing_type, spt.lock_fix_profit_reach, spt.lock_fix_profit_at,
        spt.trail_profit_increase, spt.trail_profit_by, spt.lock_and_trail_reach, spt.lock_and_trail_at,
        spt.lock_and_trail_increase, spt.lock_and_trail_by,
        sp.total_trades, sp.winning_trades, sp.losing_trades, sp.total_pnl, sp.max_drawdown,
        sp.sharpe_ratio, sp.win_rate, sp.avg_win, sp.avg_loss, sp.profit_factor,
        sp.max_consecutive_losses, sp.total_runtime_hours, sp.avg_trade_duration_minutes,
        sp.max_position_size, sp.max_daily_loss, sp.max_daily_profit
      FROM strategies s
      LEFT JOIN strategy_config sc ON s.id = sc.strategy_id
      LEFT JOIN strategy_risk_management srm ON s.id = srm.strategy_id
      LEFT JOIN strategy_profit_trailing spt ON s.id = spt.strategy_id
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

    console.log('Raw strategies from database:', strategies);
    console.log('Number of strategies found:', strategies.length);

    // Get strategy-specific data for each strategy
    const strategiesWithDetails = await Promise.all(strategies.map(async (strategy) => {
      let strategySpecificData = null;
      
      // Get strategy-specific configuration based on type
      if (strategy.strategy_type === 'TIME_BASED') {
        const [timeBasedRows] = await pool.execute(
          'SELECT * FROM time_based_strategies WHERE strategy_id = ?',
          [strategy.id]
        );
        strategySpecificData = (timeBasedRows as any[])[0] || null;
      } else if (strategy.strategy_type === 'INDICATOR_BASED') {
        const [indicatorRows] = await pool.execute(
          'SELECT * FROM indicator_based_strategies WHERE strategy_id = ?',
          [strategy.id]
        );
        strategySpecificData = (indicatorRows as any[])[0] || null;
      } else if (strategy.strategy_type === 'PROGRAMMING') {
        const [programmingRows] = await pool.execute(
          'SELECT * FROM programming_strategies WHERE strategy_id = ?',
          [strategy.id]
        );
        strategySpecificData = (programmingRows as any[])[0] || null;
      }

      // Parse JSON fields
      const workingDays = strategy.working_days 
        ? (typeof strategy.working_days === 'string' ? JSON.parse(strategy.working_days) : strategy.working_days)
        : null;
      
      // Parse strategy-specific JSON fields
      let parsedStrategyData = null;
      if (strategySpecificData) {
        if (strategy.strategy_type === 'TIME_BASED') {
          parsedStrategyData = {
            trigger_config: strategySpecificData.trigger_config 
              ? (typeof strategySpecificData.trigger_config === 'string' ? JSON.parse(strategySpecificData.trigger_config) : strategySpecificData.trigger_config)
              : null,
            order_legs: strategySpecificData.order_legs 
              ? (typeof strategySpecificData.order_legs === 'string' ? JSON.parse(strategySpecificData.order_legs) : strategySpecificData.order_legs)
              : null,
            advance_features: strategySpecificData.advance_features 
              ? (typeof strategySpecificData.advance_features === 'string' ? JSON.parse(strategySpecificData.advance_features) : strategySpecificData.advance_features)
              : null,
            form_state: strategySpecificData.form_state 
              ? (typeof strategySpecificData.form_state === 'string' ? JSON.parse(strategySpecificData.form_state) : strategySpecificData.form_state)
              : null
          };
        } else if (strategy.strategy_type === 'INDICATOR_BASED') {
          parsedStrategyData = {
            chart_config: strategySpecificData.chart_config 
              ? (typeof strategySpecificData.chart_config === 'string' ? JSON.parse(strategySpecificData.chart_config) : strategySpecificData.chart_config)
              : null,
            condition_blocks: strategySpecificData.condition_blocks 
              ? (typeof strategySpecificData.condition_blocks === 'string' ? JSON.parse(strategySpecificData.condition_blocks) : strategySpecificData.condition_blocks)
              : null,
            selected_indicators: strategySpecificData.selected_indicators 
              ? (typeof strategySpecificData.selected_indicators === 'string' ? JSON.parse(strategySpecificData.selected_indicators) : strategySpecificData.selected_indicators)
              : null,
            strike_config: strategySpecificData.strike_config 
              ? (typeof strategySpecificData.strike_config === 'string' ? JSON.parse(strategySpecificData.strike_config) : strategySpecificData.strike_config)
              : null,
            form_state: strategySpecificData.form_state 
              ? (typeof strategySpecificData.form_state === 'string' ? JSON.parse(strategySpecificData.form_state) : strategySpecificData.form_state)
              : null,
            option_config: strategySpecificData.option_config 
              ? (typeof strategySpecificData.option_config === 'string' ? JSON.parse(strategySpecificData.option_config) : strategySpecificData.option_config)
              : null
          };
        } else if (strategy.strategy_type === 'PROGRAMMING') {
          parsedStrategyData = {
            dependencies: strategySpecificData.dependencies 
              ? (typeof strategySpecificData.dependencies === 'string' ? JSON.parse(strategySpecificData.dependencies) : strategySpecificData.dependencies)
              : null,
            environment_variables: strategySpecificData.environment_variables 
              ? (typeof strategySpecificData.environment_variables === 'string' ? JSON.parse(strategySpecificData.environment_variables) : strategySpecificData.environment_variables)
              : null
          };
        }
      }

      // Get risk management data
      const [riskRows] = await pool.execute(
        'SELECT * FROM strategy_risk_management WHERE strategy_id = ?',
        [strategy.id]
      );
      const riskManagement = (riskRows as any[])[0] || null;
      
      // Get config data
      const [configRows] = await pool.execute(
        'SELECT * FROM strategy_config WHERE strategy_id = ?',
        [strategy.id]
      );
      const config = (configRows as any[])[0] || null;
      
      console.log('Risk management data for strategy', strategy.id, ':', riskManagement);
      console.log('Config data for strategy', strategy.id, ':', config);

      return {
        ...strategy,
        working_days: workingDays,
        details: parsedStrategyData,
        risk_management: riskManagement,
        config: config,
        performance: {
          total_trades: strategy.total_trades || 0,
          winning_trades: strategy.winning_trades || 0,
          losing_trades: strategy.losing_trades || 0,
          total_pnl: strategy.total_pnl || 0,
          max_drawdown: strategy.max_drawdown || 0,
          sharpe_ratio: strategy.sharpe_ratio || 0,
          win_rate: strategy.win_rate || 0,
          avg_win: strategy.avg_win || 0,
          avg_loss: strategy.avg_loss || 0,
          profit_factor: strategy.profit_factor || 0,
          max_consecutive_losses: strategy.max_consecutive_losses || 0,
          total_runtime_hours: strategy.total_runtime_hours || 0,
          avg_trade_duration_minutes: strategy.avg_trade_duration_minutes || 0,
          max_position_size: strategy.max_position_size || 0,
          max_daily_loss: strategy.max_daily_loss || 0,
          max_daily_profit: strategy.max_daily_profit || 0
        }
      };
    }));
    
    console.log('Final strategies with details:', strategiesWithDetails);
    console.log('Final count:', strategiesWithDetails.length);
    
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

// POST - Create a new strategy using normalized structure
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
      is_active = false,
      is_paper_trading = true,
      // Common configuration
      config = {},
      // Risk management
      risk_management = {},
      // Profit trailing
      profit_trailing = {},
      // Strategy-specific data
      strategy_specific_data = {}
    } = body;

    const strategyId = `strategy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log('=== STRATEGY CREATION DEBUG ===');
    console.log('Request body:', JSON.stringify(body, null, 2));
    console.log('Config data:', JSON.stringify(config, null, 2));
    console.log('Risk management data:', JSON.stringify(risk_management, null, 2));
    console.log('Strategy specific data:', JSON.stringify(strategy_specific_data, null, 2));
    
    // Debug specific config values
    console.log('=== CONFIG VALUES DEBUG ===');
    console.log('config.daily_profit_limit:', config.daily_profit_limit);
    console.log('config.daily_loss_limit:', config.daily_loss_limit);
    console.log('config.max_trade_cycles:', config.max_trade_cycles);
    console.log('config.order_type:', config.order_type);
    console.log('config.start_time:', config.start_time);
    console.log('config.square_off_time:', config.square_off_time);

    // Get a connection from the pool for transaction
    const connection = await pool.getConnection();
    
    try {
      // Start transaction
      await connection.beginTransaction();

      // 1. Insert into main strategies table
      await connection.execute(
      `INSERT INTO strategies (
        id, user_id, name, description, strategy_type, symbol, asset_type,
        is_active, is_paper_trading
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        strategyId,
        user_id,
        name,
        description,
        strategy_type,
        symbol,
        asset_type,
        is_active,
        is_paper_trading
      ]
    );

      // 2. Insert common configuration
      const configId = `config_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const configValues = [
        configId, strategyId,
        config.selected_instrument_symbol || '',
        config.selected_instrument_name || '',
        config.selected_instrument_segment || '',
        config.selected_instrument_lot_size || 0,
        config.order_type || 'MIS',
        config.start_time || '09:15:00',
        config.square_off_time || '15:15:00',
        JSON.stringify(config.working_days || {}),
        config.daily_profit_limit || null,
        config.daily_loss_limit || null,
        config.max_trade_cycles || null,
        config.no_trade_after || null
      ];
      
      console.log('Config insert values:', configValues);
      
      await connection.execute(
        `INSERT INTO strategy_config (
          id, strategy_id, selected_instrument_symbol, selected_instrument_name, 
          selected_instrument_segment, selected_instrument_lot_size, order_type,
          start_time, square_off_time, working_days, daily_profit_limit, 
          daily_loss_limit, max_trade_cycles, no_trade_after
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        configValues
      );

      // 3. Insert risk management
      const riskId = `risk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      await connection.execute(
        `INSERT INTO strategy_risk_management (
          id, strategy_id, stop_loss_type, stop_loss_value, stop_loss_on_price,
          take_profit_type, take_profit_value, take_profit_on_price, position_size
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          riskId, strategyId,
          risk_management.stop_loss_type || 'SL pt',
          risk_management.stop_loss_value || 2.00,
          risk_management.stop_loss_on_price || 'On Price',
          risk_management.take_profit_type || 'TP pt',
          risk_management.take_profit_value || 4.00,
          risk_management.take_profit_on_price || 'On Price',
          risk_management.position_size || '1'
        ]
      );

      // 4. Insert profit trailing
      const trailingId = `trail_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      await connection.execute(
        `INSERT INTO strategy_profit_trailing (
          id, strategy_id, trailing_type, lock_fix_profit_reach, lock_fix_profit_at,
          trail_profit_increase, trail_profit_by, lock_and_trail_reach, lock_and_trail_at,
          lock_and_trail_increase, lock_and_trail_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          trailingId, strategyId,
          profit_trailing.trailing_type || 'no_trailing',
          profit_trailing.lock_fix_profit_reach || null,
          profit_trailing.lock_fix_profit_at || null,
          profit_trailing.trail_profit_increase || null,
          profit_trailing.trail_profit_by || null,
          profit_trailing.lock_and_trail_reach || null,
          profit_trailing.lock_and_trail_at || null,
          profit_trailing.lock_and_trail_increase || null,
          profit_trailing.lock_and_trail_by || null
        ]
      );

      // 5. Insert strategy-specific data
      if (strategy_type === 'TIME_BASED' && strategy_specific_data) {
        await createTimeBasedStrategyWithConnection(connection, strategyId, user_id, strategy_specific_data);
      } else if (strategy_type === 'INDICATOR_BASED' && strategy_specific_data) {
        await createIndicatorBasedStrategyWithConnection(connection, strategyId, user_id, strategy_specific_data);
      } else if (strategy_type === 'PROGRAMMING' && strategy_specific_data) {
        await createProgrammingStrategyWithConnection(connection, strategyId, user_id, strategy_specific_data);
      }

      // 6. Initialize performance record
    const performanceId = `perf_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    await connection.execute(
      `INSERT INTO strategy_performance (
        id, strategy_id, total_trades, winning_trades, losing_trades,
        total_pnl, max_drawdown, sharpe_ratio, win_rate, avg_win, avg_loss,
        profit_factor, max_consecutive_losses, total_runtime_hours,
        avg_trade_duration_minutes, max_position_size, max_daily_loss, max_daily_profit
      ) VALUES (?, ?, 0, 0, 0, 0.00, 0.00, 0.0000, 0.00, 0.00, 0.00, 0.0000, 0, 0.00, 0.00, 0.00, 0.00, 0.00)`,
      [performanceId, strategyId]
    );

      // Commit transaction
      await connection.commit();

    return NextResponse.json({ 
      message: 'Strategy created successfully',
      strategy_id: strategyId 
    });
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      throw error;
    } finally {
      // Release connection back to pool
      connection.release();
    }
  } catch (error) {
    console.error('Error creating strategy:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to create time-based strategy using normalized structure
async function createTimeBasedStrategyWithConnection(connection: any, strategyId: string, userId: string, data: any) {
  const timeBasedId = `time_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  
  // Extract form data
  const {
    trigger_config = {},
    order_legs = [],
    advance_features = {},
    form_state = {}
  } = data;

  // Create time-based strategy record
  await connection.execute(
    `INSERT INTO time_based_strategies (
      id, strategy_id, trigger_config, order_legs, advance_features, form_state
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      timeBasedId, strategyId,
      JSON.stringify(trigger_config),
      JSON.stringify(order_legs),
      JSON.stringify(advance_features),
      JSON.stringify(form_state)
    ]
  );
}

// Helper function to create indicator-based strategy using normalized structure
async function createIndicatorBasedStrategyWithConnection(connection: any, strategyId: string, userId: string, data: any) {
  console.log('=== CREATE INDICATOR-BASED STRATEGY DEBUG ===');
  console.log('strategyId:', strategyId);
  console.log('userId:', userId);
  console.log('data:', JSON.stringify(data, null, 2));
  
  const indicatorBasedId = `ind_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  console.log('Generated indicatorBasedId:', indicatorBasedId);
  
  // Extract form data
  const {
    chart_config = {},
    condition_blocks = [],
    selected_indicators = {},
    strike_config = {},
    form_state = {}
  } = data;

  console.log('Extracted values:');
  console.log('- chart_config:', JSON.stringify(chart_config, null, 2));
  console.log('- condition_blocks:', JSON.stringify(condition_blocks, null, 2));
  console.log('- selected_indicators:', JSON.stringify(selected_indicators, null, 2));
  console.log('- strike_config:', JSON.stringify(strike_config, null, 2));
  console.log('- form_state:', JSON.stringify(form_state, null, 2));

  // Create indicator-based strategy record
  const insertValues = [
    indicatorBasedId, strategyId,
    JSON.stringify(chart_config),
    JSON.stringify(condition_blocks),
    JSON.stringify(selected_indicators),
    JSON.stringify(strike_config),
    JSON.stringify(form_state)
  ];
  
  console.log('Insert values for indicator_based_strategies:', insertValues);
  console.log('SQL Query: INSERT INTO indicator_based_strategies (id, strategy_id, chart_config, condition_blocks, selected_indicators, strike_config, form_state) VALUES (?, ?, ?, ?, ?, ?, ?)');
  
  const result = await connection.execute(
    `INSERT INTO indicator_based_strategies (
      id, strategy_id, chart_config, condition_blocks, selected_indicators, strike_config, form_state
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    insertValues
  );
  
  console.log('Insert result for indicator_based_strategies:', result);
  console.log('=== END CREATE INDICATOR-BASED STRATEGY DEBUG ===');
}

// Helper function to create programming strategy using normalized structure
async function createProgrammingStrategyWithConnection(connection: any, strategyId: string, userId: string, data: any) {
  const programmingId = `prog_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  
  // Extract form data
  const {
    dependencies = [],
    environment_variables = {},
    execution_config = {}
  } = data;
  
  // Create programming strategy record
  await connection.execute(
    `INSERT INTO programming_strategies (
      id, strategy_id, dependencies, environment_variables, execution_config
    ) VALUES (?, ?, ?, ?, ?)`,
    [
      programmingId, strategyId,
      JSON.stringify(dependencies),
      JSON.stringify(environment_variables),
      JSON.stringify(execution_config)
    ]
  );
}

// DELETE method to delete a strategy
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const strategyId = searchParams.get('id');
    
    if (!strategyId) {
      return NextResponse.json({ error: 'Strategy ID is required' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Delete from strategy-specific tables first (foreign key constraints)
      await connection.execute('DELETE FROM time_based_strategies WHERE strategy_id = ?', [strategyId]);
      await connection.execute('DELETE FROM indicator_based_strategies WHERE strategy_id = ?', [strategyId]);
      await connection.execute('DELETE FROM programming_strategies WHERE strategy_id = ?', [strategyId]);
      
      // Delete from related tables
      await connection.execute('DELETE FROM strategy_performance WHERE strategy_id = ?', [strategyId]);
      await connection.execute('DELETE FROM strategy_profit_trailing WHERE strategy_id = ?', [strategyId]);
      await connection.execute('DELETE FROM strategy_risk_management WHERE strategy_id = ?', [strategyId]);
      await connection.execute('DELETE FROM strategy_config WHERE strategy_id = ?', [strategyId]);
      
      // Finally delete from main strategies table
      const result = await connection.execute('DELETE FROM strategies WHERE id = ?', [strategyId]);
      
      if ((result as any).affectedRows === 0) {
        await connection.rollback();
        return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
      }

      await connection.commit();
      
      return NextResponse.json({ 
        message: 'Strategy deleted successfully',
        strategy_id: strategyId 
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error deleting strategy:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

