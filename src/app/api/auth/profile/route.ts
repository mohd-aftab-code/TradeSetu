import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

// GET /api/auth/profile - Get user profile
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

    // Get the specific user by ID
    const [rows] = await pool.execute(
      'SELECT id, email, name, phone, created_at, updated_at, is_active, subscription_plan, city, state, pincode FROM users WHERE id = ?',
      [userId]
    );
    
    const users = rows as any[];
    
    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
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
      // Add default values for fields not in database
      address: '', // Not in database
      balance: 0, // Not in database
      kyc_status: 'PENDING', // Not in database
      pan_card: '', // Not in database
      subscription_expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // Default to 1 year from now
    };
    
    return NextResponse.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

// PUT /api/auth/profile - Update user profile
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
    
    // Update the specific user by ID
    await pool.execute(
      'UPDATE users SET name = ?, email = ?, phone = ?, city = ?, state = ?, pincode = ?, updated_at = NOW() WHERE id = ?',
      [name, email, phone, city || null, state || null, pincode || null, userId]
    );
    
    // Fetch the updated user data
    const [rows] = await pool.execute(
      'SELECT id, email, name, phone, created_at, updated_at, is_active, subscription_plan, city, state, pincode FROM users WHERE id = ?',
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
      // Add default values for fields not in database
      address: '', // Not in database
      balance: 0, // Not in database
      kyc_status: 'PENDING', // Not in database
      pan_card: '', // Not in database
      subscription_expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // Default to 1 year from now
    };

    return NextResponse.json({
      success: true,
      data: userData,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}
