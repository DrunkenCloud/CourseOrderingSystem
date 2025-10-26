import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    
    let whereClause = {}
    if (sessionId) {
      whereClause = {
        session: {
          id: sessionId
        }
      }
    }
    
    const sessionFaculties = await prisma.sessionFaculty.findMany({
      where: whereClause,
      include: {
        session: true,
        faculty: {
          include: {
            position: true
          }
        },
        courseChoices: {
          include: {
            sessionCourse: {
              include: {
                course: true
              }
            }
          },
          orderBy: {
            preferenceOrder: 'asc'
          }
        }
      },
      orderBy: [
        { session: { name: 'desc' } },
        { faculty: { name: 'asc' } }
      ]
    })
    
    return NextResponse.json(sessionFaculties)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
  }
}