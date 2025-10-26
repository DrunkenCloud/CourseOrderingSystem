import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const positions = await prisma.position.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(positions)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch positions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, details, minCredits } = await request.json()
    
    const position = await prisma.position.create({
      data: {
        name,
        details,
        minCredits: parseInt(minCredits)
      }
    })
    
    return NextResponse.json(position, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Position name already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create position' }, { status: 500 })
  }
}