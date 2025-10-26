import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { sessionFacultyId, coursePreferences } = await request.json()
    
    if (!sessionFacultyId || !Array.isArray(coursePreferences)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }
    
    // Get session faculty with session and faculty details for validation
    const sessionFaculty = await prisma.sessionFaculty.findUnique({
      where: { id: sessionFacultyId },
      include: {
        session: true,
        faculty: {
          include: {
            position: true
          }
        }
      }
    })
    
    if (!sessionFaculty) {
      return NextResponse.json({ error: 'Session faculty not found' }, { status: 404 })
    }
    
    // Validate maximum courses limit
    if (coursePreferences.length > sessionFaculty.session.maxCourses) {
      return NextResponse.json({ 
        error: `Cannot select more than ${sessionFaculty.session.maxCourses} courses for this session` 
      }, { status: 400 })
    }
    
    // Get course details to calculate total credits
    const sessionCourseIds = coursePreferences.map(pref => pref.sessionCourseId)
    const sessionCourses = await prisma.sessionCourse.findMany({
      where: {
        id: { in: sessionCourseIds }
      },
      include: {
        course: true
      }
    })
    
    // Calculate total credits
    const totalCredits = sessionCourses.reduce((sum, sc) => sum + sc.course.credits, 0)
    
    // Validate minimum credits requirement
    if (totalCredits < sessionFaculty.faculty.position.minCredits) {
      return NextResponse.json({ 
        error: `Selected courses (${totalCredits} credits) do not meet minimum requirement of ${sessionFaculty.faculty.position.minCredits} credits for ${sessionFaculty.faculty.position.name} position` 
      }, { status: 400 })
    }
    
    // Delete existing preferences for this session-faculty combination
    await prisma.courseChoice.deleteMany({
      where: { sessionFacultyId }
    })
    
    // Create new preferences
    const preferences = await Promise.all(
      coursePreferences.map((pref: { sessionCourseId: string; preferenceOrder: number }) =>
        prisma.courseChoice.create({
          data: {
            sessionFacultyId,
            sessionCourseId: pref.sessionCourseId,
            preferenceOrder: pref.preferenceOrder
          },
          include: {
            sessionCourse: {
              include: {
                course: true
              }
            }
          }
        })
      )
    )
    
    return NextResponse.json(preferences, { status: 201 })
  } catch (error) {
    console.error('Error saving preferences:', error)
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 })
  }
}