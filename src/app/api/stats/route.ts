import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getStorageUsage } from '@/lib/cloudinary'

export async function GET() {
  try {
    const [totalImages, totalVideos, recentGenerations, favoriteGenerations] = await Promise.all([
      prisma.generation.count({ where: { type: 'image', status: 'completed' } }),
      prisma.generation.count({ where: { type: 'video', status: 'completed' } }),
      prisma.generation.findMany({
        where: { status: 'completed' },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      prisma.generation.findMany({
        where: { favorite: true, status: 'completed' },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
    ])

    let totalStorage = 0
    try {
      totalStorage = await getStorageUsage()
    } catch {}

    return NextResponse.json({
      totalImages,
      totalVideos,
      totalStorage,
      recentGenerations,
      favoriteGenerations,
    })
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
