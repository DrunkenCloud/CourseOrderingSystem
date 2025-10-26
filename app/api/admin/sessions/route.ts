import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const sessions = await prisma.session.findMany({
      include: {
        sessionCourses: {
          include: {
            course: true
          }
        },
        sessionFaculties: {
          include: {
            faculty: {
              include: {
                position: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(sessions)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, details, isActive, maxCourses } = await request.json()
    
    const session = await prisma.session.create({
      data: {
        name,
        details,
        isActive: isActive !== undefined ? isActive : true,
        maxCourses: maxCourses ? parseInt(maxCourses) : 5
      }
    })
    
    return NextResponse.json(session, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}