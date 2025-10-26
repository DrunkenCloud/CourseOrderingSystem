import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status, courseCode } = await request.json()
    const electiveId = params.id
    
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    
    if (status === 'APPROVED' && !courseCode) {
      return NextResponse.json({ error: 'Course code is required for approval' }, { status: 400 })
    }
    
    const existingElective = await prisma.electiveCourse.findUnique({
      where: { id: electiveId }
    })
    
    if (!existingElective) {
      return NextResponse.json({ error: 'Elective not found' }, { status: 404 })
    }
    
    // If approving, create the course in the main courses table
    let courseId = null
    let assignedCourseCode = null
    
    if (status === 'APPROVED') {
      // Check if course code already exists
      const existingCourse = await prisma.course.findUnique({
        where: { courseCode }
      })
      
      if (existingCourse) {
        return NextResponse.json({ error: 'Course code already exists in system' }, { status: 400 })
      }
      
      const newCourse = await prisma.course.create({
        data: {
          courseName: existingElective.courseName,
          courseCode,
          details: existingElective.description,
          credits: existingElective.credits,
          isElective: true
        }
      })
      
      courseId = newCourse.id
      assignedCourseCode = courseCode
    }
    
    const elective = await prisma.electiveCourse.update({
      where: { id: electiveId },
      data: {
        status,
        courseCode: assignedCourseCode,
        courseId,
        updatedAt: new Date()
      },
      include: {
        faculty: {
          include: {
            position: true
          }
        },
        session: true,
        course: true
      }
    })
    
    return NextResponse.json(elective)
  } catch (error) {
    console.error('Error updating elective status:', error)
    return NextResponse.json({ error: 'Failed to update elective status' }, { status: 500 })
  }
}