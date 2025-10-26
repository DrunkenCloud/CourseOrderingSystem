import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { courseIds } = await request.json()
    const sessionId = params.id
    
    // Create session-course relationships
    const sessionCourses = await Promise.all(
      courseIds.map((courseId: string) =>
        prisma.sessionCourse.create({
          data: {
            sessionId,
            courseId
          },
          include: {
            course: true
          }
        })
      )
    )
    
    return NextResponse.json(sessionCourses, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Course already added to session' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to add courses to session' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { courseId } = await request.json()
    const sessionId = params.id
    
    await prisma.sessionCourse.delete({
      where: {
        sessionId_courseId: {
          sessionId,
          courseId
        }
      }
    })
    
    return NextResponse.json({ message: 'Course removed from session' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove course from session' }, { status: 500 })
  }
}