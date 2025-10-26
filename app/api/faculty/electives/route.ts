import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const facultyId = searchParams.get('facultyId')
    const sessionId = searchParams.get('sessionId')
    
    if (!facultyId) {
      return NextResponse.json({ error: 'Faculty ID is required' }, { status: 400 })
    }
    
    let whereClause: any = { facultyId }
    if (sessionId) {
      whereClause.sessionId = sessionId
    }
    
    const electives = await prisma.electiveCourse.findMany({
      where: whereClause,
      include: {
        faculty: {
          include: {
            position: true
          }
        },
        session: true,
        course: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(electives)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch electives' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { facultyId, sessionId, courseName, description, credits } = await request.json()
    
    if (!facultyId || !sessionId || !courseName || !description || !credits) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }
    
    // Get session to check maxElectives limit
    const session = await prisma.session.findUnique({
      where: { id: sessionId }
    })
    
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }
    
    // Check if faculty has reached the maximum electives limit for this session
    const existingElectives = await prisma.electiveCourse.count({
      where: {
        facultyId,
        sessionId
      }
    })
    
    if (existingElectives >= session.maxElectives) {
      return NextResponse.json({ 
        error: `You can only propose up to ${session.maxElectives} electives for this session` 
      }, { status: 400 })
    }
    
    const elective = await prisma.electiveCourse.create({
      data: {
        facultyId,
        sessionId,
        courseName,
        description,
        credits: parseInt(credits),
        status: 'PENDING'
      },
      include: {
        faculty: {
          include: {
            position: true
          }
        },
        session: true
      }
    })
    
    return NextResponse.json(elective, { status: 201 })
  } catch (error) {
    console.error('Error creating elective:', error)
    return NextResponse.json({ error: 'Failed to create elective proposal' }, { status: 500 })
  }
}