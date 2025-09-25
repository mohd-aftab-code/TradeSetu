import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db';
import jwt from 'jsonwebtoken';

// GET /api/sales/dashboard - Get sales dashboard data
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

    // Check if the user is a sales executive
    const [userRows] = await pool.execute(
      'SELECT role FROM users WHERE id = ?',
      [userId]
    );
    
    const users = userRows as any[];
    if (users.length === 0 || users[0].role !== 'SALES_EXECUTIVE') {
      return NextResponse.json(
        { success: false, error: 'Sales executive access required' },
        { status: 403 }
      );
    }

    // Mock sales data - in a real application, this would come from database queries
    const salesData = {
      totalLeads: 156,
      convertedLeads: 89,
      conversionRate: 57.1,
      monthlyRevenue: 125000,
      targetRevenue: 200000,
      activeDeals: 23,
      pendingFollowUps: 12,
      thisMonthSales: 15,
      lastMonthSales: 12,
      salesExecutiveId: userId,
      lastUpdated: new Date().toISOString()
    };

    // Mock recent leads data
    const recentLeads = [
      { 
        id: 1, 
        name: 'John Smith', 
        email: 'john@example.com', 
        status: 'Contacted', 
        date: '2024-01-15',
        phone: '+91 9876543210',
        source: 'Website'
      },
      { 
        id: 2, 
        name: 'Sarah Johnson', 
        email: 'sarah@example.com', 
        status: 'Qualified', 
        date: '2024-01-14',
        phone: '+91 9876543211',
        source: 'Referral'
      },
      { 
        id: 3, 
        name: 'Mike Wilson', 
        email: 'mike@example.com', 
        status: 'Proposal Sent', 
        date: '2024-01-13',
        phone: '+91 9876543212',
        source: 'Cold Call'
      },
      { 
        id: 4, 
        name: 'Lisa Brown', 
        email: 'lisa@example.com', 
        status: 'Negotiation', 
        date: '2024-01-12',
        phone: '+91 9876543213',
        source: 'Social Media'
      },
      { 
        id: 5, 
        name: 'David Lee', 
        email: 'david@example.com', 
        status: 'Closed', 
        date: '2024-01-11',
        phone: '+91 9876543214',
        source: 'Website'
      }
    ];

    // Mock upcoming tasks
    const upcomingTasks = [
      { 
        id: 1, 
        title: 'Follow up with John Smith', 
        priority: 'High', 
        dueDate: '2024-01-16',
        leadId: 1,
        type: 'Call'
      },
      { 
        id: 2, 
        title: 'Send proposal to Sarah Johnson', 
        priority: 'Medium', 
        dueDate: '2024-01-17',
        leadId: 2,
        type: 'Email'
      },
      { 
        id: 3, 
        title: 'Call Mike Wilson', 
        priority: 'High', 
        dueDate: '2024-01-16',
        leadId: 3,
        type: 'Call'
      },
      { 
        id: 4, 
        title: 'Prepare demo for Lisa Brown', 
        priority: 'Medium', 
        dueDate: '2024-01-18',
        leadId: 4,
        type: 'Demo'
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        salesMetrics: salesData,
        recentLeads,
        upcomingTasks,
        salesExecutive: {
          id: userId,
          name: 'Sales Executive', // This would come from user profile
          role: 'SALES_EXECUTIVE'
        }
      }
    });
  } catch (error) {
    console.error('Error fetching sales dashboard data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sales dashboard data' },
      { status: 500 }
    );
  }
}
