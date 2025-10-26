import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json()

    if (!email || !password || !role) {
      return NextResponse.json(
        { message: 'Email, password, and role are required' },
        { status: 400 }
      )
    }

    let user = null

    if (role === 'admin') {
      user = await prisma.admin.findUnique({
        where: { email },
      })
    } else if (role === 'faculty') {
      user = await prisma.faculty.findUnique({
        where: { email },
        include: {
          position: true,
        },
      })
    }

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'Login successful',
      user: {
        ...userWithoutPassword,
        role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}