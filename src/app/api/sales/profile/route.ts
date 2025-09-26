import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

// GET /api/sales/profile - Get sales executive profile
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

    // Get the specific user by ID and verify they are a sales executive
    const [rows] = await pool.execute(
      'SELECT id, email, name, phone, created_at, updated_at, is_active, subscription_plan, city, state, pincode, role FROM users WHERE id = ? AND role = ?',
      [userId, 'SALES_EXECUTIVE']
    );
    
    const users = rows as any[];
    
    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Sales executive not found or unauthorized' },
        { status: 404 }
      );
    }
    
    const user = users[0];
    
    // Convert the database response to match our expected format
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      created_at: user.created_at,
      updated_at: user.updated_at,
      is_active: Boolean(user.is_active),
      subscription_plan: user.subscription_plan,
      city: user.city || '',
      state: user.state || '',
      pincode: user.pincode || '',
      role: user.role,
      // Add sales-specific default values
      address: '',
      balance: 0,
      kyc_status: 'PENDING',
      pan_card: '',
      subscription_expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    };
    
    return NextResponse.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Error fetching sales executive profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sales executive profile' },
      { status: 500 }
    );
  }
}

// PUT /api/sales/profile - Update sales executive profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { name, email, phone, city, state, pincode } = body;
    
    if (!name || !email || !phone) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and phone are required' },
        { status: 400 }
      );
    }

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

    // Verify user is a sales executive
    const [checkRows] = await pool.execute(
      'SELECT role FROM users WHERE id = ?',
      [userId]
    );
    
    const checkUsers = checkRows as any[];
    if (checkUsers.length === 0 || checkUsers[0].role !== 'SALES_EXECUTIVE') {
      return NextResponse.json(
        { success: false, error: 'Sales executive access required' },
        { status: 403 }
      );
    }
    
    // Update the specific user by ID
    await pool.execute(
      'UPDATE users SET name = ?, email = ?, phone = ?, city = ?, state = ?, pincode = ?, updated_at = NOW() WHERE id = ?',
      [name, email, phone, city || null, state || null, pincode || null, userId]
    );
    
    // Fetch the updated user data
    const [rows] = await pool.execute(
      'SELECT id, email, name, phone, created_at, updated_at, is_active, subscription_plan, city, state, pincode, role FROM users WHERE id = ?',
      [userId]
    );
    
    const updatedUsers = rows as any[];
    const updatedUser = updatedUsers[0];
    
    // Convert the database response to match our expected format
    const userData = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      phone: updatedUser.phone,
      created_at: updatedUser.created_at,
      updated_at: updatedUser.updated_at,
      is_active: Boolean(updatedUser.is_active),
      subscription_plan: updatedUser.subscription_plan,
      city: updatedUser.city || '',
      state: updatedUser.state || '',
      pincode: updatedUser.pincode || '',
      role: updatedUser.role,
      // Add sales-specific default values
      address: '',
      balance: 0,
      kyc_status: 'PENDING',
      pan_card: '',
      subscription_expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    };

    return NextResponse.json({
      success: true,
      data: userData,
      message: 'Sales executive profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating sales executive profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update sales executive profile' },
      { status: 500 }
    );
  }
}
