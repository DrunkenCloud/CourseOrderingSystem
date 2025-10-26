import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const faculty = await prisma.faculty.findMany({
      include: {
        position: true
      },
      orderBy: { name: 'asc' }
    })
    
    // Remove password from response
    const facultyWithoutPassword = faculty.map(({ password, ...rest }) => rest)
    
    return NextResponse.json(facultyWithoutPassword)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch faculty' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, positionId } = await request.json()
    
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const faculty = await prisma.faculty.create({
      data: {
        name,
        email,
        password: hashedPassword,
        positionId
      },
      include: {
        position: true
      }
    })
    
    // Remove password from response
    const { password: _, ...facultyWithoutPassword } = faculty
    
    return NextResponse.json(facultyWithoutPassword, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create faculty' }, { status: 500 })
  }
}