import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db'
import { ResultSetHeader } from 'mysql2'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone } = await request.json()

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

    // For demo purposes, simulate database operations
    // In production, you would use the actual database queries below:
    
    // Check if user already exists (demo: only check for demo@tradesetu.com)
    if (email === 'demo@tradesetu.com') {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10)

    // Insert user into database
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (name, email, password_hash, phone) VALUES (?, ?, ?, ?)',
      [name, email, hash, phone || null]
    )

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: result.insertId,
        name,
        email,
        phone: phone || null,
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