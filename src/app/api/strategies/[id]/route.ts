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

    // Get strategy-specific details based on strategy type
    let strategyDetails = null;
    
    switch (strategy.strategy_type) {
      case 'TIME_BASED':
        const [timeBasedRows] = await pool.execute(
          'SELECT * FROM time_based_strategies WHERE strategy_id = ?',
          [strategyId]
        );
        strategyDetails = (timeBasedRows as any[])[0] || null;
        break;
        
      case 'INDICATOR_BASED':
        const [indicatorRows] = await pool.execute(
          'SELECT * FROM indicator_based_strategies WHERE strategy_id = ?',
          [strategyId]
        );
        strategyDetails = (indicatorRows as any[])[0] || null;
        break;
        
      case 'PROGRAMMING':
        const [programmingRows] = await pool.execute(
          'SELECT * FROM programming_strategies WHERE strategy_id = ?',
          [strategyId]
        );
        strategyDetails = (programmingRows as any[])[0] || null;
        break;
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
      const [strategyRows] = await pool.execute(
        'SELECT strategy_type FROM strategies WHERE id = ?',
        [strategyId]
      );
      
      if ((strategyRows as any[]).length > 0) {
        const strategyType = (strategyRows as any[])[0].strategy_type;
        let tableName = '';
        
        switch (strategyType) {
          case 'TIME_BASED':
            tableName = 'time_based_strategies';
            break;
          case 'INDICATOR_BASED':
            tableName = 'indicator_based_strategies';
            break;
          case 'PROGRAMMING':
            tableName = 'programming_strategies';
            break;
        }

        if (tableName) {
          const detailUpdateFields: string[] = [];
          const detailValues: any[] = [];
          
          Object.keys(detailsData).forEach(key => {
            if (detailsData[key] !== undefined) {
              detailUpdateFields.push(`${key} = ?`);
              detailValues.push(
                ['trigger_weekly_days', 'working_days', 'long_conditions', 'short_conditions', 'selected_indicators', 'dependencies', 'environment_variables'].includes(key)
                  ? JSON.stringify(detailsData[key])
                  : detailsData[key]
              );
            }
          });

          if (detailUpdateFields.length > 0) {
            detailValues.push(strategyId);
            await pool.execute(
              `UPDATE ${tableName} SET ${detailUpdateFields.join(', ')}, updated_at = NOW() WHERE strategy_id = ?`,
              detailValues
            );
          }
        }
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

// DELETE - Delete a strategy and all related data
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const strategyId = params.id;

    // Get strategy type to know which detail table to clean up
    const [strategyRows] = await pool.execute(
      'SELECT strategy_type FROM strategies WHERE id = ?',
      [strategyId]
    );

    if ((strategyRows as any[]).length === 0) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
    }

    const strategyType = (strategyRows as any[])[0].strategy_type;

    // Delete from strategy-specific table
    let detailTableName = '';
    switch (strategyType) {
      case 'TIME_BASED':
        detailTableName = 'time_based_strategies';
        break;
      case 'INDICATOR_BASED':
        detailTableName = 'indicator_based_strategies';
        break;
      case 'PROGRAMMING':
        detailTableName = 'programming_strategies';
        break;
    }

    if (detailTableName) {
      await pool.execute(
        `DELETE FROM ${detailTableName} WHERE strategy_id = ?`,
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