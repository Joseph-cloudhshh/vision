import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  title: z.string().min(1).max(100),
  prompt: z.string().min(1).max(1000),
  category: z.string().default('general'),
})

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get('category')
  const search = req.nextUrl.searchParams.get('search')

  try {
    const where: any = {}
    if (category && category !== 'all') where.category = category
    if (search) where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { prompt: { contains: search, mode: 'insensitive' } },
    ]

    const prompts = await prisma.savedPrompt.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ prompts })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    const prompt = await prisma.savedPrompt.create({ data: parsed.data })
    return NextResponse.json({ prompt })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save prompt' }, { status: 500 })
  }
}
