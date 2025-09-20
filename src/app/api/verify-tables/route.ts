import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const [connectionTest] = await pool.execute('SELECT 1 as test');
    console.log('Database connection test:', connectionTest);

    // Check if tables exist
    const [tables] = await pool.execute("SHOW TABLES");
    const tableNames = (tables as any[]).map(table => Object.values(table)[0]);
    
    console.log('Existing tables:', tableNames);

    // Check strategies table structure
    const [strategiesColumns] = await pool.execute("DESCRIBE strategies");
    console.log('Strategies table columns:', strategiesColumns);

    // Check time_based_strategies table structure
    const [timeBasedColumns] = await pool.execute("DESCRIBE time_based_strategies");
    console.log('Time-based strategies table columns:', timeBasedColumns);

    // Check indicator_based_strategies table structure
    const [indicatorBasedColumns] = await pool.execute("DESCRIBE indicator_based_strategies");
    console.log('Indicator-based strategies table columns:', indicatorBasedColumns);

    return NextResponse.json({ 
      message: 'Database verification successful',
      connectionTest: connectionTest,
      tables: tableNames,
      strategiesColumns: strategiesColumns,
      timeBasedColumns: timeBasedColumns,
      indicatorBasedColumns: indicatorBasedColumns
    });
  } catch (error) {
    console.error('Database verification error:', error);
    return NextResponse.json({ 
      error: 'Database verification failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
