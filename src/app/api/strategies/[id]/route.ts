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
    // Parse JSON fields for strategy-specific details
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
        strategy_data: strategyData,
        advance_features: advanceFeatures,
        performance_metrics: performanceMetrics,
        details: strategyData, // Use strategy_data as details
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

    // Update strategy-specific details if provided (store in strategy_data JSON field)
    if (detailsData) {
      // Get existing strategy_data
      const [existingRows] = await pool.execute(
        'SELECT strategy_data FROM strategies WHERE id = ?',
        [strategyId]
      );
      
      let existingStrategyData = {};
      if ((existingRows as any[]).length > 0) {
        const existingData = (existingRows as any[])[0].strategy_data;
        if (existingData) {
          existingStrategyData = typeof existingData === 'string' 
            ? JSON.parse(existingData) 
            : existingData;
        }
      }
      
      // Merge new details with existing strategy_data
      const updatedStrategyData = {
        ...existingStrategyData,
        ...detailsData
      };
      
      // Update the strategy_data JSON field
      await pool.execute(
        'UPDATE strategies SET strategy_data = ?, updated_at = NOW() WHERE id = ?',
        [JSON.stringify(updatedStrategyData), strategyId]
      );
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

    // Check if strategy exists
    const [strategyRows] = await pool.execute(
      'SELECT id FROM strategies WHERE id = ?',
      [strategyId]
    );

    if ((strategyRows as any[]).length === 0) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
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