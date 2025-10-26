import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { courseName, courseCode, details, credits, isElective } = await request.json()
    const courseId = params.id
    
    const course = await prisma.course.update({
      where: { id: courseId },
      data: {
        courseName,
        courseCode,
        details,
        credits: parseInt(credits),
        isElective: isElective || false
      }
    })
    
    return NextResponse.json(course)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Course code already exists' }, { status: 400 })
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id
    
    // Check if course is used in any sessions
    const sessionCourses = await prisma.sessionCourse.findMany({
      where: { courseId }
    })
    
    if (sessionCourses.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete course that is assigned to sessions. Remove from sessions first.' 
      }, { status: 400 })
    }
    
    await prisma.course.delete({
      where: { id: courseId }
    })
    
    return NextResponse.json({ message: 'Course deleted successfully' })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 })
  }
}