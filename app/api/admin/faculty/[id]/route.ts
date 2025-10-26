import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, email, password, positionId } = await request.json()
    const facultyId = params.id
    
    const updateData: any = {
      name,
      email,
      positionId
    }
    
    // Only update password if provided
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10)
    }
    
    const faculty = await prisma.faculty.update({
      where: { id: facultyId },
      data: updateData,
      include: {
        position: true
      }
    })
    
    // Remove password from response
    const { password: _, ...facultyWithoutPassword } = faculty
    
    return NextResponse.json(facultyWithoutPassword)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update faculty' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const facultyId = params.id
    
    // Check if faculty is assigned to any sessions
    const sessionFaculties = await prisma.sessionFaculty.findMany({
      where: { facultyId }
    })
    
    if (sessionFaculties.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete faculty that is assigned to sessions. Remove from sessions first.' 
      }, { status: 400 })
    }
    
    await prisma.faculty.delete({
      where: { id: facultyId }
    })
    
    return NextResponse.json({ message: 'Faculty deleted successfully' })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete faculty' }, { status: 500 })
  }
}