import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// POST - Create a new programming strategy
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      strategy_id,
      programming_language = 'PYTHON',
      code = '',
      code_version = '1.0.0',
      execution_frequency = 'real_time',
      max_execution_time = 30,
      dependencies = [],
      environment_variables = {},
      stop_loss_type = 'SL %',
      stop_loss_value = 2.0,
      take_profit_type = 'TP %',
      take_profit_value = 4.0,
      position_size = '1'
    } = body;

    const programmingStrategyId = `prog_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    // Insert into programming_strategies table
    const [result] = await pool.execute(
      `INSERT INTO programming_strategies (
        id, strategy_id, user_id, programming_language, code, code_version,
        execution_frequency, max_execution_time, dependencies, environment_variables,
        stop_loss_type, stop_loss_value, take_profit_type, take_profit_value, position_size
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        programmingStrategyId,
        strategy_id,
        user_id,
        programming_language,
        code,
        code_version,
        execution_frequency,
        max_execution_time,
        JSON.stringify(dependencies),
        JSON.stringify(environment_variables),
        stop_loss_type,
        stop_loss_value,
        take_profit_type,
        take_profit_value,
        position_size
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

// GET - Fetch programming strategies
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    let query = `
      SELECT ps.*, s.name as strategy_name, s.description, s.symbol, s.is_active, s.is_paper_trading
      FROM programming_strategies ps
      JOIN strategies s ON ps.strategy_id = s.id
    `;
    
    const params = [];
    if (userId) {
      query += ' WHERE ps.user_id = ?';
      params.push(userId);
    }
    
    query += ' ORDER BY ps.created_at DESC';

    const [rows] = await pool.execute(query, params);

    return NextResponse.json({ 
      strategies: rows,
      count: (rows as any[]).length 
    });
  } catch (error) {
    console.error('Error fetching programming strategies:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Update programming strategy
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
          ['dependencies', 'environment_variables'].includes(key) 
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
