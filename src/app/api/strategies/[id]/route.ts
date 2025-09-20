import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Fetch a specific strategy with its details
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const strategyId = params.id;

    // Get main strategy info
    const [strategyRows] = await pool.execute(
      'SELECT * FROM strategies WHERE id = ?',
      [strategyId]
    );

    if ((strategyRows as any[]).length === 0) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
    }

    const strategy = (strategyRows as any[])[0];
    
    // Parse JSON fields
    const riskManagement = typeof strategy.risk_management === 'string' 
      ? JSON.parse(strategy.risk_management) 
      : strategy.risk_management;

    // Get strategy-specific details based on type
    let strategyDetails = null;
    if (strategy.strategy_type === 'TIME_BASED') {
      const [timeBasedRows] = await pool.execute(
        'SELECT * FROM time_based_strategies WHERE strategy_id = ?',
        [strategyId]
      );
      if ((timeBasedRows as any[]).length > 0) {
        const timeBasedData = (timeBasedRows as any[])[0];
        // Parse JSON fields
        timeBasedData.trigger_weekly_days = timeBasedData.trigger_weekly_days 
          ? (typeof timeBasedData.trigger_weekly_days === 'string' 
              ? JSON.parse(timeBasedData.trigger_weekly_days) 
              : timeBasedData.trigger_weekly_days)
          : null;
        timeBasedData.working_days = timeBasedData.working_days 
          ? (typeof timeBasedData.working_days === 'string' 
              ? JSON.parse(timeBasedData.working_days) 
              : timeBasedData.working_days)
          : null;
        strategyDetails = timeBasedData;
      }
    } else if (strategy.strategy_type === 'INDICATOR_BASED') {
      const [indicatorBasedRows] = await pool.execute(
        'SELECT * FROM indicator_based_strategies WHERE strategy_id = ?',
        [strategyId]
      );
      if ((indicatorBasedRows as any[]).length > 0) {
        const indicatorBasedData = (indicatorBasedRows as any[])[0];
        // Parse JSON fields
        indicatorBasedData.long_conditions = indicatorBasedData.long_conditions 
          ? (typeof indicatorBasedData.long_conditions === 'string' 
              ? JSON.parse(indicatorBasedData.long_conditions) 
              : indicatorBasedData.long_conditions)
          : null;
        indicatorBasedData.short_conditions = indicatorBasedData.short_conditions 
          ? (typeof indicatorBasedData.short_conditions === 'string' 
              ? JSON.parse(indicatorBasedData.short_conditions) 
              : indicatorBasedData.short_conditions)
          : null;
        indicatorBasedData.selected_indicators = indicatorBasedData.selected_indicators 
          ? (typeof indicatorBasedData.selected_indicators === 'string' 
              ? JSON.parse(indicatorBasedData.selected_indicators) 
              : indicatorBasedData.selected_indicators)
          : null;
        indicatorBasedData.working_days = indicatorBasedData.working_days 
          ? (typeof indicatorBasedData.working_days === 'string' 
              ? JSON.parse(indicatorBasedData.working_days) 
              : indicatorBasedData.working_days)
          : null;
        strategyDetails = indicatorBasedData;
      }
    }

    // Get performance data
    const [performanceRows] = await pool.execute(
      'SELECT * FROM strategy_performance WHERE strategy_id = ?',
      [strategyId]
    );
    const performance = (performanceRows as any[])[0] || null;

    return NextResponse.json({
      strategy: {
        ...strategy,
        risk_management: riskManagement,
        details: strategyDetails,
        performance: performance
      }
    });
  } catch (error) {
    console.error('Error fetching strategy:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Update a strategy
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const strategyId = params.id;
    const body = await request.json();
    const { strategyData, detailsData, ...updateData } = body;

    // Define allowed fields for strategies table
    const allowedFields = [
      'user_id', 'name', 'description', 'strategy_type', 'symbol', 'asset_type',
      'entry_conditions', 'exit_conditions', 'risk_management', 'is_active',
      'is_paper_trading', 'last_executed', 'total_executions', 'success_rate'
    ];

    // Update main strategy record
    const updateFields: string[] = [];
    const values: any[] = [];
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        values.push(
          key === 'risk_management' ? JSON.stringify(updateData[key]) : updateData[key]
        );
      }
    });

    if (updateFields.length > 0) {
      values.push(strategyId);
      await pool.execute(
        `UPDATE strategies SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
        values
      );
    }

    // Update strategy-specific details if provided
    if (detailsData) {
      // Get strategy type to determine which table to update
      const [strategyRows] = await pool.execute(
        'SELECT strategy_type FROM strategies WHERE id = ?',
        [strategyId]
      );
      
      if ((strategyRows as any[]).length === 0) {
        return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
      }
      
      const strategyType = (strategyRows as any[])[0].strategy_type;
      
      if (strategyType === 'TIME_BASED') {
        // Update time_based_strategies table
        await updateTimeBasedStrategy(strategyId, detailsData);
      } else if (strategyType === 'INDICATOR_BASED') {
        // Update indicator_based_strategies table
        await updateIndicatorBasedStrategy(strategyId, detailsData);
      }
    }

    return NextResponse.json({
      message: 'Strategy updated successfully'
    });
  } catch (error) {
    console.error('Error updating strategy:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to update time-based strategy
async function updateTimeBasedStrategy(strategyId: string, detailsData: any) {
  const timeBasedFields = [
    'trigger_type', 'trigger_time', 'trigger_timezone', 'trigger_recurrence',
    'trigger_weekly_days', 'trigger_monthly_day', 'trigger_monthly_type',
    'trigger_after_open_minutes', 'trigger_before_close_minutes',
    'trigger_candle_interval', 'trigger_candle_delay_minutes',
    'action_type', 'order_transaction_type', 'order_type', 'order_quantity',
    'order_product_type', 'order_price', 'working_days', 'start_time',
    'square_off_time', 'strategy_start_date', 'strategy_start_time',
    'strategy_validity_date', 'deactivate_after_first_trigger',
    'stop_loss_type', 'stop_loss_value', 'take_profit_type', 'take_profit_value',
    'position_size', 'profit_trailing_type', 'trailing_stop',
    'trailing_stop_percentage', 'trailing_profit', 'trailing_profit_percentage',
    'daily_loss_limit', 'daily_profit_limit', 'max_trade_cycles', 'no_trade_after'
  ];

  const updateFields: string[] = [];
  const values: any[] = [];
  
  Object.keys(detailsData).forEach(key => {
    if (detailsData[key] !== undefined && timeBasedFields.includes(key)) {
      updateFields.push(`${key} = ?`);
      values.push(
        ['trigger_weekly_days', 'working_days'].includes(key)
          ? JSON.stringify(detailsData[key])
          : detailsData[key]
      );
    }
  });

  if (updateFields.length > 0) {
    values.push(strategyId);
    await pool.execute(
      `UPDATE time_based_strategies SET ${updateFields.join(', ')}, updated_at = NOW() WHERE strategy_id = ?`,
      values
    );
  }
}

// Helper function to update indicator-based strategy
async function updateIndicatorBasedStrategy(strategyId: string, detailsData: any) {
  const indicatorBasedFields = [
    'chart_type', 'time_interval', 'transaction_type', 'long_conditions',
    'short_conditions', 'condition_blocks', 'logical_operator', 'selected_indicators',
    'stop_loss_type', 'stop_loss_value', 'take_profit_type', 'take_profit_value',
    'position_size', 'profit_trailing_type', 'trailing_stop',
    'trailing_stop_percentage', 'trailing_profit', 'trailing_profit_percentage',
    'daily_loss_limit', 'daily_profit_limit', 'max_trade_cycles', 'no_trade_after',
    'working_days', 'start_time', 'square_off_time'
  ];

  const updateFields: string[] = [];
  const values: any[] = [];
  
  Object.keys(detailsData).forEach(key => {
    if (detailsData[key] !== undefined && indicatorBasedFields.includes(key)) {
      updateFields.push(`${key} = ?`);
      values.push(
        ['long_conditions', 'short_conditions', 'selected_indicators', 'working_days'].includes(key)
          ? JSON.stringify(detailsData[key])
          : detailsData[key]
      );
    }
  });

  if (updateFields.length > 0) {
    values.push(strategyId);
    await pool.execute(
      `UPDATE indicator_based_strategies SET ${updateFields.join(', ')}, updated_at = NOW() WHERE strategy_id = ?`,
      values
    );
  }
}

// DELETE - Delete a strategy and all related data
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const strategyId = params.id;

    // Check if strategy exists and get type
    const [strategyRows] = await pool.execute(
      'SELECT id, strategy_type FROM strategies WHERE id = ?',
      [strategyId]
    );

    if ((strategyRows as any[]).length === 0) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
    }

    const strategyType = (strategyRows as any[])[0].strategy_type;

    // Delete from specific strategy table
    if (strategyType === 'TIME_BASED') {
      await pool.execute(
        'DELETE FROM time_based_strategies WHERE strategy_id = ?',
        [strategyId]
      );
    } else if (strategyType === 'INDICATOR_BASED') {
      await pool.execute(
        'DELETE FROM indicator_based_strategies WHERE strategy_id = ?',
        [strategyId]
      );
    }

    // Delete performance data
    await pool.execute(
      'DELETE FROM strategy_performance WHERE strategy_id = ?',
      [strategyId]
    );

    // Delete main strategy record
    await pool.execute(
      'DELETE FROM strategies WHERE id = ?',
      [strategyId]
    );

    return NextResponse.json({
      message: 'Strategy deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting strategy:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}