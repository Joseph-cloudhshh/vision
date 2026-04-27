'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Video } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import PromptBox from '@/components/shared/PromptBox'
import GenerateButton from '@/components/shared/GenerateButton'
import ProgressTracker from '@/components/shared/ProgressTracker'
import VideoPlayer from '@/components/shared/VideoPlayer'
import type { VideoSettings, MotionType, MotionIntensity, VideoResolution, CinematicMovement, Generation, GenerationStatus } from '@/types'

const motionTypes: { id: MotionType; label: string; emoji: string }[] = [
  { id: 'zoom', label: 'Zoom', emoji: '🔭' },
  { id: 'pan', label: 'Pan', emoji: '↔️' },
  { id: 'rotate', label: 'Rotate', emoji: '🔄' },
  { id: 'dolly', label: 'Dolly', emoji: '🎬' },
  { id: 'orbit', label: 'Orbit', emoji: '🌐' },
  { id: 'float', label: 'Float', emoji: '🎈' },
]

const cinematicMovements: { id: CinematicMovement; label: string }[] = [
  { id: 'push-in', label: 'Push In' },
  { id: 'pull-out', label: 'Pull Out' },
  { id: 'crane-up', label: 'Crane Up' },
  { id: 'crane-down', label: 'Crane Down' },
  { id: 'truck-left', label: 'Truck Left' },
  { id: 'truck-right', label: 'Truck Right' },
]

const defaultSettings: VideoSettings = {
  duration: 4,
  resolution: '720p',
  motionIntensity: 'moderate',
  motionType: 'dolly',
}

export default function VideoGeneratorPage() {
  const [prompt, setPrompt] = useState('')
  const [settings, setSettings] = useState<VideoSettings>(defaultSettings)
  const [sourceImage, setSourceImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<GenerationStatus>('pending')
  const [result, setResult] = useState<Generation | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  const update = <K extends keyof VideoSettings>(key: K, val: VideoSettings[K]) =>
    setSettings((s) => ({ ...s, [key]: val }))

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSourceImage(data.url)
      update('sourceImage', data.url)
      toast({ title: 'Image uploaded!' })
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' })
    }
  }

  const pollStatus = useCallback(async (jid: string) => {
    try {
      const res = await fetch(`/api/generate/video/status?jobId=${jid}`)
      const job = await res.json()

      setProgress(job.progress ?? 0)
      setStatus(job.status)

      if (job.status === 'completed') {
        setLoading(false)
        if (pollRef.current) clearInterval(pollRef.current)
        // Fetch the saved generation
        const histRes = await fetch('/api/history?limit=1')
        const histData = await histRes.json()
        if (histData.generations?.[0]) setResult(histData.generations[0])
        toast({ title: 'Video generated!' })
      } else if (job.status === 'failed') {
        setLoading(false)
        if (pollRef.current) clearInterval(pollRef.current)
        toast({ title: 'Generation failed', variant: 'destructive' })
      }
    } catch (err) {
      console.error('Poll error:', err)
    }
  }, [])

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: 'Enter a prompt', variant: 'destructive' })
      return
    }
    setLoading(true)
    setProgress(0)
    setStatus('pending')
    setResult(null)

    try {
      const res = await fetch('/api/generate/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, settings }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data.generation)
      setStatus('completed')
      setProgress(100)
      setLoading(false)
      toast({ title: 'Video generated!' })
    } catch (err: any) {
      setLoading(false)
      setStatus('failed')
      toast({ title: 'Generation failed', description: err.message, variant: 'destructive' })
    }
  }

  const btn = (active: boolean, onClick: () => void, label: string) => (
    <button
      onClick={onClick}
      disabled={loading}
      className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold border transition-all disabled:opacity-40
        ${active ? 'border-primary/60 bg-primary/10 text-foreground' : 'border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
    >
      {label}
    </button>
  )

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        {/* ── LEFT: Controls ── */}
        <div className="space-y-5 overflow-y-auto pr-1 scrollbar-none max-h-[calc(100vh-7rem)]">
          <PromptBox
            value={prompt}
            onChange={setPrompt}
            placeholder="A cinematic drone shot over a misty mountain range at sunrise..."
            disabled={loading}
          />

          {/* Source Image (image-to-video) */}
          <div className="space-y-2">
            <label className="label-text">Source Image (optional)</label>
            {sourceImage ? (
              <div className="relative rounded-lg overflow-hidden border border-border">
                <img src={sourceImage} alt="Source" className="w-full h-32 object-cover" />
                <button
                  onClick={() => { setSourceImage(null); update('sourceImage', undefined) }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-20 rounded-lg border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center gap-1.5 transition-colors group"
              >
                <Upload className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">Upload reference image</span>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="label-text">Duration</label>
              <span className="text-xs font-mono text-primary">{settings.duration}s</span>
            </div>
            <input
              type="range" min={2} max={16} step={2}
              value={settings.duration}
              onChange={(e) => update('duration', parseInt(e.target.value))}
              disabled={loading}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>2s</span><span>6s</span><span>10s</span><span>16s</span>
            </div>
          </div>

          {/* Resolution */}
          <div className="space-y-2">
            <label className="label-text">Resolution</label>
            <div className="flex gap-1.5">
              {(['480p', '720p', '1080p'] as VideoResolution[]).map((r) => btn(settings.resolution === r, () => update('resolution', r), r))}
            </div>
          </div>

          {/* Motion Intensity */}
          <div className="space-y-2">
            <label className="label-text">Motion Intensity</label>
            <div className="flex gap-1.5">
              {(['subtle', 'moderate', 'dynamic'] as MotionIntensity[]).map((m) =>
                btn(settings.motionIntensity === m, () => update('motionIntensity', m), m.charAt(0).toUpperCase() + m.slice(1))
              )}
            </div>
          </div>

          {/* Motion Type */}
          <div className="space-y-2">
            <label className="label-text">Motion Type</label>
            <div className="grid grid-cols-3 gap-1.5">
              {motionTypes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => update('motionType', m.id)}
                  disabled={loading}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs font-display font-semibold transition-all disabled:opacity-40
                    ${settings.motionType === m.id
                      ? 'border-primary/60 bg-primary/10 text-foreground'
                      : 'border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                >
                  <span>{m.emoji}</span> {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cinematic Movement */}
          <div className="space-y-2">
            <label className="label-text">Cinematic Movement (optional)</label>
            <div className="grid grid-cols-2 gap-1.5">
              {cinematicMovements.map((c) =>
                btn(settings.cinematicMovement === c.id, () => update('cinematicMovement', c.id), c.label)
              )}
            </div>
          </div>

          <GenerateButton
            onClick={handleGenerate}
            loading={loading}
            disabled={!prompt.trim()}
            hasResult={!!result}
            onRegenerate={handleGenerate}
            label="Generate Video"
          />
        </div>

        {/* ── RIGHT: Preview ── */}
        <div className="space-y-4">
          {/* Status tracker */}
          {(loading || status !== 'pending') && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-surface p-4"
            >
              <ProgressTracker
                status={status}
                progress={progress}
                label="Rendering frames..."
              />
            </motion.div>
          )}

          {/* Video preview */}
          <div className="card-surface overflow-hidden">
            <AnimatePresence mode="wait">
              {result?.outputUrl && status === 'completed' ? (
                <motion.div
                  key="video"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <VideoPlayer
                    src={result.outputUrl}
                    className="w-full"
                    onDownload={() => {
                      const a = document.createElement('a')
                      a.href = result.outputUrl!
                      a.download = `visionforge-${result.id}.mp4`
                      a.click()
                    }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-64 flex flex-col items-center justify-center gap-4 text-center px-8"
                >
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center opacity-30"
                    style={{ background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))' }}>
                    <Video className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Your generated video will appear here</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Video generation typically takes 30–90 seconds</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
