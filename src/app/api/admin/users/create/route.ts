import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2';
import { generateUserId } from '@/lib/id-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone, city, state, pincode, role } = body;

    // Validation
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Get the next user ID
    const [userCountResult] = await pool.query('SELECT COUNT(*) as count FROM users');
    const userCount = Array.isArray(userCountResult) && userCountResult.length > 0 
      ? (userCountResult[0] as any).count 
      : 0;
    
    const customUserId = generateUserId(userCount + 1);

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user into database
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO users (
        id,
        email,
        password_hash,
        name,
        phone,
        created_at,
        updated_at,
        is_active,
        subscription_plan,
        city,
        state,
        pincode,
        role
      ) VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        NOW(),
        NOW(),
        1,
        'FREE',
        ?,
        ?,
        ?,
        ?
      )`,
      [customUserId, email, passwordHash, name, phone || null, city || null, state || null, pincode || null, role]
    );

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: customUserId,
        name,
        email,
        role,
        created_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
