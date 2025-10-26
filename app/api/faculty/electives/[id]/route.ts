import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { courseName, description, credits } = await request.json()
    const electiveId = params.id
    
    // Get the elective to check ownership and status
    const existingElective = await prisma.electiveCourse.findUnique({
      where: { id: electiveId }
    })
    
    if (!existingElective) {
      return NextResponse.json({ error: 'Elective not found' }, { status: 404 })
    }
    
    if (existingElective.status !== 'PENDING') {
      return NextResponse.json({ error: 'Cannot edit elective that has been reviewed' }, { status: 400 })
    }
    
    const elective = await prisma.electiveCourse.update({
      where: { id: electiveId },
      data: {
        courseName,
        description,
        credits: parseInt(credits)
      },
      include: {
        faculty: {
          include: {
            position: true
          }
        },
        session: true
      }
    })
    
    return NextResponse.json(elective)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update elective' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const electiveId = params.id
    
    // Get the elective to check status
    const existingElective = await prisma.electiveCourse.findUnique({
      where: { id: electiveId }
    })
    
    if (!existingElective) {
      return NextResponse.json({ error: 'Elective not found' }, { status: 404 })
    }
    
    if (existingElective.status === 'APPROVED') {
      return NextResponse.json({ error: 'Cannot delete approved elective' }, { status: 400 })
    }
    
    await prisma.electiveCourse.delete({
      where: { id: electiveId }
    })
    
    return NextResponse.json({ message: 'Elective deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete elective' }, { status: 500 })
  }
}