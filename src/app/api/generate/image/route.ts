import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateImage } from '@/lib/ai-api'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'

const schema = z.object({
  prompt: z.string().min(1).max(1000),
  negativePrompt: z.string().max(500).optional(),
  settings: z.object({
    style: z.string(),
    aspectRatio: z.string(),
    quality: z.string(),
    numOutputs: z.number().min(1).max(4),
    seed: z.number().optional(),
    guidanceScale: z.number().optional(),
    steps: z.number().optional(),
  }),
})

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const { success } = rateLimit(`image:${ip}`, 20, 60_000)
    if (!success) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please wait.' }, { status: 429 })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
    }

    const { prompt, negativePrompt, settings } = parsed.data

    // Create a pending record
    const generation = await prisma.generation.create({
      data: {
        type: 'image',
        prompt,
        negativePrompt,
        status: 'processing',
        settings: settings as any,
      },
    })

    // Call the AI API
    let outputUrl: string
    let thumbnailUrl: string | undefined
    let cloudinaryUrl: string | undefined

    try {
      outputUrl = await generateImage(prompt, settings as any, negativePrompt)

      // Upload to Cloudinary if configured
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        const uploaded = await uploadToCloudinary(outputUrl, 'visionforge/images', 'image')
        cloudinaryUrl = uploaded.url
        thumbnailUrl = uploaded.thumbnailUrl
      } else {
        cloudinaryUrl = outputUrl
        thumbnailUrl = outputUrl
      }

      // Update record as completed
      const updated = await prisma.generation.update({
        where: { id: generation.id },
        data: {
          status: 'completed',
          outputUrl: cloudinaryUrl,
          thumbnailUrl,
        },
      })

      return NextResponse.json({ generation: updated })
    } catch (aiError) {
      await prisma.generation.update({
        where: { id: generation.id },
        data: { status: 'failed' },
      })
      console.error('AI generation error:', aiError)
      return NextResponse.json({ error: 'Generation failed. Please try again.' }, { status: 500 })
    }
  } catch (error) {
    console.error('Image API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
