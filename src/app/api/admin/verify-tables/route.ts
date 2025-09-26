import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication token required' },
        { status: 401 }
      );
    }

    // Verify the token and get user ID
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if the user is an admin
    const [adminRows] = await pool.execute(
      'SELECT role FROM users WHERE id = ?',
      [userId]
    );
    
    const adminUsers = adminRows as any[];
    if (adminUsers.length === 0 || adminUsers[0].role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

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
      success: true,
      message: 'Database verification successful',
      data: {
        connectionTest: connectionTest,
        tables: tableNames,
        strategiesColumns: strategiesColumns,
        timeBasedColumns: timeBasedColumns,
        indicatorBasedColumns: indicatorBasedColumns
      }
    });
  } catch (error) {
    console.error('Database verification error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Database verification failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
