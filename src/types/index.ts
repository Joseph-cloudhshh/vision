export type Theme = 'obsidian' | 'neon' | 'emerald'

export type GenerationType = 'image' | 'video'
export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface Generation {
  id: string
  type: GenerationType
  prompt: string
  negativePrompt?: string
  status: GenerationStatus
  outputUrl?: string
  thumbnailUrl?: string
  settings?: ImageSettings | VideoSettings
  favorite: boolean
  createdAt: string
  updatedAt: string
}

export interface ImageSettings {
  style: ImageStyle
  aspectRatio: AspectRatio
  quality: ImageQuality
  numOutputs: number
  seed?: number
  negativePrompt?: string
  guidanceScale?: number
  steps?: number
}

export type ImageStyle =
  | 'realistic'
  | 'anime'
  | 'cinematic'
  | 'fantasy'
  | 'cyberpunk'
  | '3d-render'
  | 'watercolor'
  | 'oil-painting'

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '21:9'
export type ImageQuality = 'standard' | 'hd' | 'ultra'

export interface VideoSettings {
  duration: number
  resolution: VideoResolution
  motionIntensity: MotionIntensity
  motionType: MotionType
  cinematicMovement?: CinematicMovement
  sourceImage?: string
}

export type VideoResolution = '480p' | '720p' | '1080p'
export type MotionIntensity = 'subtle' | 'moderate' | 'dynamic'
export type MotionType = 'zoom' | 'pan' | 'rotate' | 'dolly' | 'orbit' | 'float'
export type CinematicMovement = 'push-in' | 'pull-out' | 'crane-up' | 'crane-down' | 'truck-left' | 'truck-right'

export interface SavedPrompt {
  id: string
  title: string
  prompt: string
  category: string
  createdAt: string
  updatedAt: string
}

export interface Stats {
  totalImages: number
  totalVideos: number
  totalStorage: number
  recentGenerations: Generation[]
  favoriteGenerations: Generation[]
}

export interface GenerateImageRequest {
  prompt: string
  negativePrompt?: string
  settings: ImageSettings
}

export interface GenerateVideoRequest {
  prompt: string
  settings: VideoSettings
}
