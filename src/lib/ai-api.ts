/**
 * AI API Integration Layer
 * Replace these placeholder functions with your actual AI provider calls.
 * Supported providers: Replicate, Stability AI, RunwayML, Kling, etc.
 */

import type { ImageSettings, VideoSettings } from '@/types'

const AI_API_KEY = process.env.AI_API_KEY
const AI_API_BASE_URL = process.env.AI_API_BASE_URL || 'https://api.replicate.com/v1'

// ─── IMAGE GENERATION ────────────────────────────────────────────────────────

export async function generateImage(
  prompt: string,
  settings: ImageSettings,
  negativePrompt?: string
): Promise<string> {
  /**
   * TODO: Replace with your image generation API call.
   *
   * Example with Replicate (Stable Diffusion):
   *   const response = await fetch(`${AI_API_BASE_URL}/predictions`, {
   *     method: 'POST',
   *     headers: {
   *       Authorization: `Token ${AI_API_KEY}`,
   *       'Content-Type': 'application/json',
   *     },
   *     body: JSON.stringify({
   *       version: 'YOUR_MODEL_VERSION',
   *       input: {
   *         prompt: buildPromptWithStyle(prompt, settings.style),
   *         negative_prompt: negativePrompt,
   *         width: getWidthFromAspectRatio(settings.aspectRatio),
   *         height: getHeightFromAspectRatio(settings.aspectRatio),
   *         num_outputs: settings.numOutputs,
   *         seed: settings.seed,
   *         guidance_scale: settings.guidanceScale ?? 7.5,
   *         num_inference_steps: getStepsFromQuality(settings.quality),
   *       },
   *     }),
   *   })
   *   const prediction = await response.json()
   *   // Poll until complete, then return prediction.output[0]
   *
   * Example with Stability AI:
   *   const response = await fetch(`${AI_API_BASE_URL}/generation/stable-diffusion-xl-1024-v1-0/text-to-image`, {
   *     method: 'POST',
   *     headers: {
   *       Authorization: `Bearer ${AI_API_KEY}`,
   *       'Content-Type': 'application/json',
   *     },
   *     body: JSON.stringify({
   *       text_prompts: [{ text: prompt, weight: 1 }, { text: negativePrompt, weight: -1 }],
   *       cfg_scale: 7,
   *       width: 1024, height: 1024,
   *       steps: 30,
   *       samples: settings.numOutputs,
   *       seed: settings.seed ?? 0,
   *     }),
   *   })
   */

  // PLACEHOLDER — returns a demo image URL
  // Remove this and implement your API call above
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const demoImages = [
    'https://picsum.photos/seed/vf1/1024/1024',
    'https://picsum.photos/seed/vf2/1024/768',
    'https://picsum.photos/seed/vf3/768/1024',
    'https://picsum.photos/seed/vf4/1024/576',
  ]

  const seed = settings.seed ?? Math.floor(Math.random() * 1000)
  return `https://picsum.photos/seed/${seed}/1024/1024`
}

// ─── VIDEO GENERATION ────────────────────────────────────────────────────────

export interface VideoJob {
  jobId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  outputUrl?: string
  progress?: number
  error?: string
}

export async function submitVideoJob(
  prompt: string,
  settings: VideoSettings
): Promise<{ jobId: string }> {
  /**
   * TODO: Replace with your video generation API call.
   *
   * Example with RunwayML Gen-3:
   *   const response = await fetch(`${AI_API_BASE_URL}/v1/image_to_video`, {
   *     method: 'POST',
   *     headers: {
   *       Authorization: `Bearer ${AI_API_KEY}`,
   *       'Content-Type': 'application/json',
   *     },
   *     body: JSON.stringify({
   *       promptText: prompt,
   *       promptImage: settings.sourceImage,
   *       model: 'gen3a_turbo',
   *       duration: settings.duration,
   *       ratio: '1280:768',
   *     }),
   *   })
   *   const data = await response.json()
   *   return { jobId: data.id }
   *
   * Example with Kling AI:
   *   const response = await fetch(`${AI_API_BASE_URL}/kling/v1/videos/text2video`, {
   *     method: 'POST',
   *     headers: { Authorization: `Bearer ${AI_API_KEY}` },
   *     body: JSON.stringify({ prompt, duration: settings.duration, mode: 'std' }),
   *   })
   *   const data = await response.json()
   *   return { jobId: data.data.task_id }
   */

  // PLACEHOLDER — returns a fake job ID
  await new Promise((resolve) => setTimeout(resolve, 500))
  return { jobId: `job_${Date.now()}_${Math.random().toString(36).slice(2)}` }
}

export async function pollVideoJob(jobId: string): Promise<VideoJob> {
  /**
   * TODO: Replace with your video polling API call.
   *
   * Example with RunwayML:
   *   const response = await fetch(`${AI_API_BASE_URL}/v1/tasks/${jobId}`, {
   *     headers: { Authorization: `Bearer ${AI_API_KEY}` },
   *   })
   *   const data = await response.json()
   *   return {
   *     jobId,
   *     status: data.status === 'SUCCEEDED' ? 'completed' : data.status === 'FAILED' ? 'failed' : 'processing',
   *     outputUrl: data.output?.[0],
   *     progress: data.progressRatio * 100,
   *   }
   */

  // PLACEHOLDER — simulates a job progressing over ~15s
  const createdAt = parseInt(jobId.split('_')[1] || '0')
  const elapsed = Date.now() - createdAt
  const totalDuration = 15000

  if (elapsed < totalDuration) {
    return {
      jobId,
      status: 'processing',
      progress: Math.min(95, Math.floor((elapsed / totalDuration) * 100)),
    }
  }

  return {
    jobId,
    status: 'completed',
    outputUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    progress: 100,
  }
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

export function buildPromptWithStyle(prompt: string, style: string): string {
  const styleModifiers: Record<string, string> = {
    realistic: 'photorealistic, 8k uhd, dslr, soft lighting, high quality',
    anime: 'anime style, cel shading, vibrant colors, detailed linework',
    cinematic: 'cinematic, dramatic lighting, film grain, anamorphic lens, movie still',
    fantasy: 'fantasy art, magical, ethereal, epic, detailed environment, artstation',
    cyberpunk: 'cyberpunk, neon lights, rain-slicked streets, futuristic, dark atmosphere',
    '3d-render': '3d render, octane render, cinema 4d, subsurface scattering, pbr materials',
    watercolor: 'watercolor painting, soft edges, color bleeding, artistic, brush strokes',
    'oil-painting': 'oil painting, impasto technique, rich colors, canvas texture, museum quality',
  }
  return `${prompt}, ${styleModifiers[style] || ''}`
}

export function getWidthFromAspectRatio(ratio: string): number {
  const map: Record<string, number> = {
    '1:1': 1024, '16:9': 1024, '9:16': 576, '4:3': 1024, '3:4': 768, '21:9': 1024,
  }
  return map[ratio] || 1024
}

export function getHeightFromAspectRatio(ratio: string): number {
  const map: Record<string, number> = {
    '1:1': 1024, '16:9': 576, '9:16': 1024, '4:3': 768, '3:4': 1024, '21:9': 440,
  }
  return map[ratio] || 1024
}

export function getStepsFromQuality(quality: string): number {
  return { standard: 20, hd: 35, ultra: 50 }[quality] || 20
}
