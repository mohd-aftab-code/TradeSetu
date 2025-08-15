import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db';
import jwt from 'jsonwebtoken';

// GET /api/admin/users - Get all users for admin panel
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

    // Get all users from the database
    const [rows] = await pool.execute(
      'SELECT id, email, name, phone, created_at, updated_at, is_active, subscription_plan, city, state, pincode, role FROM users ORDER BY created_at DESC'
    );
    
    const users = rows as any[];
    
    // Convert the database response to match our expected format
    const userData = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone || '',
      created_at: user.created_at,
      updated_at: user.updated_at,
      is_active: Boolean(user.is_active),
      subscription_plan: user.subscription_plan || 'FREE',
      city: user.city || '',
      state: user.state || '',
      pincode: user.pincode || '',
      role: user.role || 'USER',
      // Add default values for fields not in database
      balance: 0, // Not in database
      total_trades: 0, // Not in database
      total_pnl: 0, // Not in database
      last_login: user.updated_at, // Use updated_at as last login
      emailVerified: true, // Default to true
      status: user.is_active ? 'Active' : 'Inactive'
    }));
    
    return NextResponse.json({
      success: true,
      data: userData,
      total: userData.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
