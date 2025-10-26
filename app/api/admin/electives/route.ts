import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    let whereClause = {}
    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      whereClause = { status }
    }
    
    const electives = await prisma.electiveCourse.findMany({
      where: whereClause,
      include: {
        faculty: {
          include: {
            position: true
          }
        },
        course: true
      },
      orderBy: [
        { status: 'asc' }, // PENDING first
        { createdAt: 'desc' }
      ]
    })
    
    return NextResponse.json(electives)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch electives' }, { status: 500 })
  }
}