import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db';
import jwt from 'jsonwebtoken';

// GET /api/admin/stats - Get admin dashboard statistics
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

    // Get user statistics
    const [userStats] = await pool.execute(
      'SELECT COUNT(*) as total_users, SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_users FROM users'
    );
    
    const [roleStats] = await pool.execute(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role'
    );

    // Mock additional statistics (in a real app, these would come from actual data)
    const adminStats = {
      totalUsers: (userStats as any[])[0]?.total_users || 0,
      activeUsers: (userStats as any[])[0]?.active_users || 0,
      totalRevenue: 250000,
      monthlyRevenue: 125000,
      totalStrategies: 45,
      activeStrategies: 32,
      totalTrades: 1250,
      successfulTrades: 980,
      systemUptime: 99.9,
      lastBackup: new Date().toISOString(),
      userGrowth: [
        { month: 'Jan', users: 120 },
        { month: 'Feb', users: 145 },
        { month: 'Mar', users: 167 },
        { month: 'Apr', users: 189 },
        { month: 'May', users: 210 },
        { month: 'Jun', users: 235 }
      ],
      roleDistribution: (roleStats as any[]).map(stat => ({
        role: stat.role,
        count: stat.count
      })),
      subscriptionPlans: [
        { plan: 'FREE', count: 45 },
        { plan: 'BASIC', count: 23 },
        { plan: 'PREMIUM', count: 12 },
        { plan: 'ENTERPRISE', count: 5 }
      ]
    };
    
    return NextResponse.json({
      success: true,
      data: adminStats
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
}
