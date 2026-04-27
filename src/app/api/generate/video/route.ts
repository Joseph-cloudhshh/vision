import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { submitVideoJob, pollVideoJob } from '@/lib/ai-api'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'

const schema = z.object({
  prompt: z.string().min(1).max(1000),
  settings: z.object({
    duration: z.number().min(2).max(16),
    resolution: z.string(),
    motionIntensity: z.string(),
    motionType: z.string(),
    cinematicMovement: z.string().optional(),
    sourceImage: z.string().url().optional(),
  }),
})

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const { success } = rateLimit(`video:${ip}`, 5, 60_000)
    if (!success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
    }

    const { prompt, settings } = parsed.data

    // Create pending record
    const generation = await prisma.generation.create({
      data: {
        type: 'video',
        prompt,
        status: 'pending',
        settings: settings as any,
      },
    })

    // Submit job to AI API
    const { jobId } = await submitVideoJob(prompt, settings as any)

    // Update to processing
    await prisma.generation.update({
      where: { id: generation.id },
      data: { status: 'processing' },
    })

    // Poll until complete (with timeout)
    const maxAttempts = 60
    const pollIntervalMs = 5000
    let attempts = 0
    let videoUrl: string | undefined

    while (attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, pollIntervalMs))
      const job = await pollVideoJob(jobId)

      if (job.status === 'completed' && job.outputUrl) {
        videoUrl = job.outputUrl
        break
      } else if (job.status === 'failed') {
        await prisma.generation.update({
          where: { id: generation.id },
          data: { status: 'failed' },
        })
        return NextResponse.json({ error: 'Video generation failed' }, { status: 500 })
      }

      attempts++
    }

    if (!videoUrl) {
      await prisma.generation.update({
        where: { id: generation.id },
        data: { status: 'failed' },
      })
      return NextResponse.json({ error: 'Generation timed out' }, { status: 500 })
    }

    // Upload to Cloudinary
    let cloudinaryUrl = videoUrl
    let thumbnailUrl: string | undefined

    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      const uploaded = await uploadToCloudinary(videoUrl, 'visionforge/videos', 'video')
      cloudinaryUrl = uploaded.url
      thumbnailUrl = uploaded.thumbnailUrl
    }

    const updated = await prisma.generation.update({
      where: { id: generation.id },
      data: {
        status: 'completed',
        outputUrl: cloudinaryUrl,
        thumbnailUrl,
      },
    })

    return NextResponse.json({ generation: updated })
  } catch (error) {
    console.error('Video API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
