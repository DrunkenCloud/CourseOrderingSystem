import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { courseName: 'asc' }
    })
    return NextResponse.json(courses)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { courseName, courseCode, details, credits, isElective } = await request.json()
    
    const course = await prisma.course.create({
      data: {
        courseName,
        courseCode,
        details,
        credits: parseInt(credits),
        isElective: isElective || false
      }
    })
    
    return NextResponse.json(course, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Course code already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 })
  }
}