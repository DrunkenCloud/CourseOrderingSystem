import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, details, isActive, maxCourses, maxElectives } = await request.json()
    const sessionId = params.id
    
    const session = await prisma.session.update({
      where: { id: sessionId },
      data: {
        name,
        details,
        isActive: isActive !== undefined ? isActive : true,
        maxCourses: maxCourses ? parseInt(maxCourses) : 5,
        maxElectives: maxElectives ? parseInt(maxElectives) : 2
      },
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
      }
    })
    
    return NextResponse.json(session)
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id
    
    // Check if session has any faculty assignments or course assignments
    const sessionFaculties = await prisma.sessionFaculty.findMany({
      where: { sessionId }
    })
    
    const sessionCourses = await prisma.sessionCourse.findMany({
      where: { sessionId }
    })
    
    const electiveCourses = await prisma.electiveCourse.findMany({
      where: { sessionId }
    })
    
    if (sessionFaculties.length > 0 || sessionCourses.length > 0 || electiveCourses.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete session that has faculty assignments, course assignments, or elective proposals. Remove all assignments first.' 
      }, { status: 400 })
    }
    
    await prisma.session.delete({
      where: { id: sessionId }
    })
    
    return NextResponse.json({ message: 'Session deleted successfully' })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 })
  }
}