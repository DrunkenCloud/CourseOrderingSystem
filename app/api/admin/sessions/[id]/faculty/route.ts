import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { facultyIds } = await request.json()
    const sessionId = params.id
    
    // Create session-faculty relationships
    const sessionFaculties = await Promise.all(
      facultyIds.map((facultyId: string) =>
        prisma.sessionFaculty.create({
          data: {
            sessionId,
            facultyId
          },
          include: {
            faculty: {
              include: {
                position: true
              }
            }
          }
        })
      )
    )
    
    return NextResponse.json(sessionFaculties, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Faculty already added to session' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to add faculty to session' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { facultyId } = await request.json()
    const sessionId = params.id
    
    await prisma.sessionFaculty.delete({
      where: {
        sessionId_facultyId: {
          sessionId,
          facultyId
        }
      }
    })
    
    return NextResponse.json({ message: 'Faculty removed from session' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove faculty from session' }, { status: 500 })
  }
}