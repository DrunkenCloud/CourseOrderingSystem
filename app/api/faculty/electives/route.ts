import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const facultyId = searchParams.get('facultyId')
    
    if (!facultyId) {
      return NextResponse.json({ error: 'Faculty ID is required' }, { status: 400 })
    }
    
    const electives = await prisma.electiveCourse.findMany({
      where: { facultyId },
      include: {
        faculty: {
          include: {
            position: true
          }
        },
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
    const { facultyId, courseName, courseCode, description, credits } = await request.json()
    
    if (!facultyId || !courseName || !courseCode || !description || !credits) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }
    
    // Check if course code already exists in electives for this faculty
    const existingElective = await prisma.electiveCourse.findUnique({
      where: {
        facultyId_courseCode: {
          facultyId,
          courseCode
        }
      }
    })
    
    if (existingElective) {
      return NextResponse.json({ error: 'You have already proposed an elective with this course code' }, { status: 400 })
    }
    
    // Check if course code exists in main courses
    const existingCourse = await prisma.course.findUnique({
      where: { courseCode }
    })
    
    if (existingCourse) {
      return NextResponse.json({ error: 'A course with this code already exists in the system' }, { status: 400 })
    }
    
    const elective = await prisma.electiveCourse.create({
      data: {
        facultyId,
        courseName,
        courseCode,
        description,
        credits: parseInt(credits),
        status: 'PENDING'
      },
      include: {
        faculty: {
          include: {
            position: true
          }
        }
      }
    })
    
    return NextResponse.json(elective, { status: 201 })
  } catch (error) {
    console.error('Error creating elective:', error)
    return NextResponse.json({ error: 'Failed to create elective proposal' }, { status: 500 })
  }
}