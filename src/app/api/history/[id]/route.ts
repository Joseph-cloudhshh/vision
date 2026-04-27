import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.generation.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const updated = await prisma.generation.update({
      where: { id: params.id },
      data: body,
    })
    return NextResponse.json({ generation: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
