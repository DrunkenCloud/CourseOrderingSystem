import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, details, minCredits } = await request.json()
    const positionId = params.id
    
    const position = await prisma.position.update({
      where: { id: positionId },
      data: {
        name,
        details,
        minCredits: parseInt(minCredits)
      }
    })
    
    return NextResponse.json(position)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Position name already exists' }, { status: 400 })
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Position not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update position' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const positionId = params.id
    
    // Check if position is used by any faculty
    const facultyWithPosition = await prisma.faculty.findMany({
      where: { positionId }
    })
    
    if (facultyWithPosition.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete position that is assigned to faculty members. Reassign faculty first.' 
      }, { status: 400 })
    }
    
    await prisma.position.delete({
      where: { id: positionId }
    })
    
    return NextResponse.json({ message: 'Position deleted successfully' })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Position not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete position' }, { status: 500 })
  }
}