import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const facultyId = searchParams.get('facultyId')
    
    if (!facultyId) {
      return NextResponse.json({ error: 'Faculty ID is required' }, { status: 400 })
    }
    
    // Get active sessions where this faculty is assigned
    const sessionFaculties = await prisma.sessionFaculty.findMany({
      where: {
        facultyId,
        session: {
          isActive: true
        }
      },
      include: {
        session: {
          include: {
            sessionCourses: {
              include: {
                course: true
              }
            }
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
      }
    })
    
    return NextResponse.json(sessionFaculties)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }
}