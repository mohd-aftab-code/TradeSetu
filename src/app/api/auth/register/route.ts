import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db'
import { ResultSetHeader } from 'mysql2'
import { generateUserId } from '@/lib/id-generator'

export async function POST(request: NextRequest) {
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      city, 
      state, 
      pincode,
      role = 'USER' // Default role for direct registration
    } = await request.json()

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Password validation (minimum 6 characters)
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Get the next user ID
    const [userCountResult] = await pool.query('SELECT COUNT(*) as count FROM users');
    const userCount = Array.isArray(userCountResult) && userCountResult.length > 0 
      ? (userCountResult[0] as any).count 
      : 0;
    
    const customUserId = generateUserId(userCount + 1);

    // Hash password
    const hash = await bcrypt.hash(password, 10)

    // Insert user into database with all required fields
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
      [customUserId, email, hash, name, phone || null, city || null, state || null, pincode || null, role]
    )

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: customUserId,
        name,
        email,
        phone: phone || null,
        city: city || null,
        state: state || null,
        pincode: pincode || null,
        subscription_plan: 'FREE',
        is_active: true,
        role: role,
        createdAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 