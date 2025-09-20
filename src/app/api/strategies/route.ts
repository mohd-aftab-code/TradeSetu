import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Fetch all strategies with their details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const strategyType = searchParams.get('strategy_type');
    const limit = searchParams.get('limit') || '50';


    let query = `
      SELECT s.*, sp.total_trades, sp.winning_trades, sp.total_pnl, sp.win_rate, sp.max_drawdown
      FROM strategies s
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


    // Parse JSON fields and add strategy-specific details
    const strategiesWithDetails = strategies.map((strategy) => {
      // Parse JSON fields
      const riskManagement = typeof strategy.risk_management === 'string' 
        ? JSON.parse(strategy.risk_management) 
        : strategy.risk_management;
      
      const strategyData = strategy.strategy_data 
        ? (typeof strategy.strategy_data === 'string' 
            ? JSON.parse(strategy.strategy_data) 
            : strategy.strategy_data)
        : null;
      
      const advanceFeatures = strategy.advance_features 
        ? (typeof strategy.advance_features === 'string' 
            ? JSON.parse(strategy.advance_features) 
            : strategy.advance_features)
        : null;
      
      const performanceMetrics = strategy.performance_metrics 
        ? (typeof strategy.performance_metrics === 'string' 
            ? JSON.parse(strategy.performance_metrics) 
            : strategy.performance_metrics)
        : null;

      return {
        ...strategy,
        risk_management: riskManagement,
        strategy_data: strategyData,
        advance_features: advanceFeatures,
        performance_metrics: performanceMetrics,
        details: strategyData // Use strategy_data as details
      };
    });
    
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

// POST - Create a new strategy (main strategy record only)
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
      entry_conditions,
      exit_conditions,
      risk_management,
      is_active = false,
      is_paper_trading = true,
      strategyData // Additional strategy-specific data
    } = body;

    const strategyId = `strategy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Insert into main strategies table
    const [result] = await pool.execute(
      `INSERT INTO strategies (
        id, user_id, name, description, strategy_type, symbol, asset_type,
        entry_conditions, exit_conditions, risk_management,
        is_active, is_paper_trading
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        strategyId,
        user_id,
        name,
        description,
        strategy_type,
        symbol,
        asset_type,
        entry_conditions,
        exit_conditions,
        JSON.stringify(risk_management),
        is_active,
        is_paper_trading
      ]
    );

        // Create strategy-specific record based on type
        if (strategy_type === 'TIME_BASED' && strategyData) {
          await createTimeBasedStrategyComplete(strategyId, user_id, strategyData);
        } else if (strategy_type === 'INDICATOR_BASED' && strategyData) {
          await createIndicatorBasedStrategy(strategyId, user_id, strategyData);
        }

    // Initialize performance record
    const performanceId = `perf_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    await pool.execute(
      `INSERT INTO strategy_performance (
        id, strategy_id, user_id, total_trades, winning_trades, losing_trades,
        total_pnl, max_drawdown, sharpe_ratio, win_rate, avg_win, avg_loss,
        profit_factor, max_consecutive_losses, total_runtime_hours,
        avg_trade_duration_minutes, max_position_size, max_daily_loss, max_daily_profit
      ) VALUES (?, ?, ?, 0, 0, 0, 0.00, 0.00, 0.0000, 0.00, 0.00, 0.00, 0.0000, 0, 0.00, 0.00, 0.00, 0.00, 0.00)`,
      [performanceId, strategyId, user_id]
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

// Helper function to create comprehensive time-based strategy
async function createTimeBasedStrategyComplete(strategyId: string, userId: string, data: any) {
  const timeBasedId = `time_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  
  // Extract form data
  const {
    name,
    description,
    selectedInstrument,
    time_order_product_type,
    start_time,
    square_off_time,
    working_days,
    orderLegs = [],
    advanceFeatures = {},
    daily_profit_limit = 0,
    daily_loss_limit = 0,
    max_trade_cycles = 1,
    noTradeAfter,
    profitTrailingType = 'no_trailing',
    profitTrailingConfig = {}
  } = data;

  // Create main time-based strategy record
  await pool.execute(
    `INSERT INTO time_based_strategies_complete (
      id, strategy_id, user_id, name, description,
      selected_instrument_symbol, selected_instrument_name, selected_instrument_segment, selected_instrument_lot_size,
      order_product_type, start_time, square_off_time, working_days, order_legs, advance_features,
      daily_profit_limit, daily_loss_limit, max_trade_cycles, no_trade_after,
      profit_trailing_type, profit_trailing_config
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      timeBasedId, strategyId, userId, name, description,
      selectedInstrument?.symbol || '',
      selectedInstrument?.name || '',
      selectedInstrument?.segment || '',
      selectedInstrument?.lotSize || 0,
      time_order_product_type,
      start_time,
      square_off_time,
      JSON.stringify(working_days),
      JSON.stringify(orderLegs),
      JSON.stringify(advanceFeatures),
      daily_profit_limit,
      daily_loss_limit,
      max_trade_cycles,
      noTradeAfter,
      profitTrailingType,
      JSON.stringify(profitTrailingConfig)
    ]
  );

  // Create individual order legs
  for (let i = 0; i < orderLegs.length; i++) {
    const leg = orderLegs[i];
    const legId = `leg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    await pool.execute(
      `INSERT INTO time_based_order_legs (
        id, time_based_strategy_id, leg_order, action, quantity, option_type, expiry,
        atm_pt, atm_value, sl_type, sl_value, sl_on_price, tp_type, tp_value, tp_on_price,
        wait_and_trade_enabled, wait_and_trade_type, wait_and_trade_value,
        re_entry_enabled, re_entry_type, re_entry_value, re_entry_condition,
        trail_sl_enabled, tsl_type, tsl_value1, tsl_value2
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        legId, timeBasedId, i + 1,
        leg.action || 'buy',
        leg.quantity || 0,
        leg.optionType || 'ce',
        leg.expiry || 'Weekly',
        leg.atmPt || 'ATM pt',
        leg.atm || '0',
        leg.slType || 'SL %',
        leg.slValue || 0,
        leg.slOnPrice || 'On Price',
        leg.tpType || 'TP %',
        leg.tpValue || 0,
        leg.tpOnPrice || 'On Price',
        leg.waitAndTradeEnabled || false,
        leg.waitAndTradeType || '%↑',
        leg.waitAndTradeValue || 0,
        leg.reEntryEnabled || false,
        leg.reEntryType || 'ReEntry On Cost',
        leg.reEntryValue || 5,
        leg.reEntryCondition || 'On Close',
        leg.trailSLEnabled || false,
        leg.tslType || 'TSL %',
        leg.tslValue1 || 0,
        leg.tslValue2 || 0
      ]
    );
  }

  // Create advance features record
  const advanceFeaturesId = `adv_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  await pool.execute(
    `INSERT INTO time_based_advance_features (
      id, time_based_strategy_id, move_sl_to_cost, exit_all_on_sl_tgt,
      pre_punch_sl, wait_and_trade, re_entry_execute, trail_sl
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      advanceFeaturesId, timeBasedId,
      advanceFeatures.moveSLToCost || false,
      advanceFeatures.exitAllOnSLTgt || false,
      advanceFeatures.prePunchSL || false,
      advanceFeatures.waitAndTrade || false,
      advanceFeatures.reEntryExecute || false,
      advanceFeatures.trailSL || false
    ]
  );

  // Create profit trailing record
  const profitTrailingId = `trail_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  await pool.execute(
    `INSERT INTO time_based_profit_trailing (
      id, time_based_strategy_id, trailing_type,
      lock_fix_profit_reach, lock_fix_profit_at,
      trail_profit_increase, trail_profit_by,
      lock_and_trail_reach, lock_and_trail_at, lock_and_trail_increase, lock_and_trail_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      profitTrailingId, timeBasedId, profitTrailingType,
      profitTrailingConfig.lockFixProfitReach || null,
      profitTrailingConfig.lockFixProfitAt || null,
      profitTrailingConfig.trailProfitIncrease || null,
      profitTrailingConfig.trailProfitBy || null,
      profitTrailingConfig.lockAndTrailReach || null,
      profitTrailingConfig.lockAndTrailAt || null,
      profitTrailingConfig.lockAndTrailIncrease || null,
      profitTrailingConfig.lockAndTrailBy || null
    ]
  );

  // Create form state record
  const formStateId = `state_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  await pool.execute(
    `INSERT INTO time_based_form_states (
      id, time_based_strategy_id, time_indicator_form_data, instrument_search_state,
      order_legs_state, advance_features_state, profit_trailing_type_state,
      is_underlying_selected, show_advance_features
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      formStateId, timeBasedId,
      JSON.stringify(data),
      JSON.stringify({ selectedInstrument }),
      JSON.stringify(orderLegs),
      JSON.stringify(advanceFeatures),
      profitTrailingType,
      true, // is_underlying_selected
      false // show_advance_features
    ]
  );
}

// Helper function to create time-based strategy (legacy)
async function createTimeBasedStrategy(strategyId: string, userId: string, data: any) {
  const timeBasedId = `time_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  
  await pool.execute(
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
      timeBasedId, strategyId, userId,
      data.trigger_type || 'specific_time',
      data.trigger_time || '09:20:00',
      data.trigger_timezone || 'IST',
      data.trigger_recurrence || 'daily',
      JSON.stringify(data.trigger_weekly_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']),
      data.trigger_monthly_day || 1,
      data.trigger_monthly_type || 'day_of_month',
      data.trigger_after_open_minutes || 0,
      data.trigger_before_close_minutes || 0,
      data.trigger_candle_interval || 0,
      data.trigger_candle_delay_minutes || 0,
      data.action_type || 'place_order',
      data.order_transaction_type || 'BOTH',
      data.order_type || 'MARKET',
      data.order_quantity || 1,
      data.order_product_type || 'MIS',
      data.order_price || 0.00,
      JSON.stringify(data.working_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']),
      data.start_time || '09:15:00',
      data.square_off_time || '15:15:00',
      data.strategy_start_date || null,
      data.strategy_start_time || null,
      data.strategy_validity_date || null,
      data.deactivate_after_first_trigger || 0,
      data.stop_loss_type || 'SL %',
      data.stop_loss_value || 2.00,
      data.take_profit_type || 'TP %',
      data.take_profit_value || 4.00,
      data.position_size || '1 lot',
      data.profit_trailing_type || 'no_trailing',
      data.trailing_stop || 0,
      data.trailing_stop_percentage || 0.00,
      data.trailing_profit || 0,
      data.trailing_profit_percentage || 0.00,
      data.daily_loss_limit || 0.00,
      data.daily_profit_limit || 0.00,
      data.max_trade_cycles || 0,
      data.no_trade_after || null
    ]
  );
}

// Helper function to create indicator-based strategy
async function createIndicatorBasedStrategy(strategyId: string, userId: string, data: any) {
  const indicatorBasedId = `ind_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  
  await pool.execute(
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
      indicatorBasedId, strategyId, userId,
      data.chart_type || 'Candle',
      data.time_interval || '5 Min',
      data.transaction_type || 'Both Side',
      JSON.stringify(data.long_conditions || []),
      JSON.stringify(data.short_conditions || []),
      data.condition_blocks || 0,
      data.logical_operator || 'AND',
      JSON.stringify(data.selected_indicators || []),
      data.stop_loss_type || 'SL %',
      data.stop_loss_value || 2.00,
      data.take_profit_type || 'TP %',
      data.take_profit_value || 4.00,
      data.position_size || '1 lot',
      data.profit_trailing_type || 'no_trailing',
      data.trailing_stop || 0,
      data.trailing_stop_percentage || 0.00,
      data.trailing_profit || 0,
      data.trailing_profit_percentage || 0.00,
      data.daily_loss_limit || 0.00,
      data.daily_profit_limit || 0.00,
      data.max_trade_cycles || 0,
      data.no_trade_after || null,
      JSON.stringify(data.working_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']),
      data.start_time || '09:15:00',
      data.square_off_time || '15:15:00'
    ]
  );
}
