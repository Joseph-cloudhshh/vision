import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type')
  const favorites = req.nextUrl.searchParams.get('favorites') === 'true'
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50')
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1')

  try {
    const where: any = {}
    if (type) where.type = type
    if (favorites) where.favorite = true

    const [generations, total] = await Promise.all([
      prisma.generation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.generation.count({ where }),
    ])

    return NextResponse.json({ generations, total, page, limit })
  } catch (error) {
    console.error('History API error:', error)
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
  }
}
