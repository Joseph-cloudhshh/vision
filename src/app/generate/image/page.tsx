'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Heart, Save, ChevronDown, ChevronUp, Sliders } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import PromptBox from '@/components/shared/PromptBox'
import StyleSelector from '@/components/shared/StyleSelector'
import GenerateButton from '@/components/shared/GenerateButton'
import { GeneratingOverlay } from '@/components/shared/Loader'
import type { ImageSettings, ImageStyle, AspectRatio, ImageQuality, Generation } from '@/types'

const aspectRatios: { id: AspectRatio; label: string; w: number; h: number }[] = [
  { id: '1:1', label: 'Square', w: 1, h: 1 },
  { id: '16:9', label: 'Wide', w: 16, h: 9 },
  { id: '9:16', label: 'Portrait', w: 9, h: 16 },
  { id: '4:3', label: '4:3', w: 4, h: 3 },
  { id: '3:4', label: '3:4', w: 3, h: 4 },
  { id: '21:9', label: 'Cinema', w: 21, h: 9 },
]

const qualities: { id: ImageQuality; label: string; desc: string }[] = [
  { id: 'standard', label: 'Standard', desc: '~20 steps' },
  { id: 'hd', label: 'HD', desc: '~35 steps' },
  { id: 'ultra', label: 'Ultra', desc: '~50 steps' },
]

const defaultSettings: ImageSettings = {
  style: 'realistic',
  aspectRatio: '1:1',
  quality: 'hd',
  numOutputs: 1,
  seed: undefined,
  guidanceScale: 7.5,
}

export default function ImageGeneratorPage() {
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [settings, setSettings] = useState<ImageSettings>(defaultSettings)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Generation | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const update = <K extends keyof ImageSettings>(key: K, val: ImageSettings[K]) =>
    setSettings((s) => ({ ...s, [key]: val }))

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      toast({ title: 'Enter a prompt', description: 'Describe what you want to generate.', variant: 'destructive' })
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/generate/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, negativePrompt, settings }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data.generation)
      toast({ title: 'Image generated!', variant: 'default' })
    } catch (err: any) {
      toast({ title: 'Generation failed', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [prompt, negativePrompt, settings])

  const handleFavorite = async () => {
    if (!result) return
    await fetch(`/api/history/${result.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ favorite: !result.favorite }),
    })
    setResult((r) => r ? { ...r, favorite: !r.favorite } : r)
  }

  const handleDownload = () => {
    if (!result?.outputUrl) return
    const a = document.createElement('a')
    a.href = result.outputUrl
    a.download = `visionforge-${result.id}.png`
    a.click()
  }

  const handleSavePrompt = async () => {
    if (!prompt.trim()) return
    await fetch('/api/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: prompt.slice(0, 50), prompt, category: 'image' }),
    })
    toast({ title: 'Prompt saved!', description: 'Find it in your Prompt Library.' })
  }

  const currentRatio = aspectRatios.find((r) => r.id === settings.aspectRatio)!

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 h-full">
        {/* ── LEFT: Controls ── */}
        <div className="space-y-5 overflow-y-auto pr-1 scrollbar-none max-h-[calc(100vh-7rem)]">
          <PromptBox
            value={prompt}
            onChange={setPrompt}
            negativeValue={negativePrompt}
            onNegativeChange={setNegativePrompt}
            onSavePrompt={handleSavePrompt}
            disabled={loading}
          />

          <StyleSelector
            value={settings.style as ImageStyle}
            onChange={(s) => update('style', s)}
            disabled={loading}
          />

          {/* Aspect Ratio */}
          <div className="space-y-2">
            <label className="label-text">Aspect Ratio</label>
            <div className="grid grid-cols-3 gap-1.5">
              {aspectRatios.map((ratio) => (
                <button
                  key={ratio.id}
                  onClick={() => update('aspectRatio', ratio.id)}
                  disabled={loading}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg border text-xs font-display font-semibold transition-all disabled:opacity-40
                    ${settings.aspectRatio === ratio.id
                      ? 'border-primary/60 bg-primary/10 text-foreground'
                      : 'border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                >
                  <div className="border-2 border-current rounded-sm"
                    style={{ width: `${Math.min(ratio.w, 20) * (20 / Math.max(ratio.w, ratio.h))}px`, height: `${Math.min(ratio.h, 20) * (20 / Math.max(ratio.w, ratio.h))}px` }} />
                  {ratio.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quality */}
          <div className="space-y-2">
            <label className="label-text">Quality</label>
            <div className="grid grid-cols-3 gap-1.5">
              {qualities.map((q) => (
                <button
                  key={q.id}
                  onClick={() => update('quality', q.id)}
                  disabled={loading}
                  className={`flex flex-col items-center gap-0.5 p-2.5 rounded-lg border text-xs font-display font-semibold transition-all disabled:opacity-40
                    ${settings.quality === q.id
                      ? 'border-primary/60 bg-primary/10 text-foreground'
                      : 'border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                >
                  {q.label}
                  <span className="text-[10px] font-normal opacity-60">{q.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Outputs count */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="label-text">Number of Outputs</label>
              <span className="text-xs font-mono text-primary">{settings.numOutputs}</span>
            </div>
            <input
              type="range" min={1} max={4} step={1}
              value={settings.numOutputs}
              onChange={(e) => update('numOutputs', parseInt(e.target.value))}
              disabled={loading}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>1</span><span>2</span><span>3</span><span>4</span>
            </div>
          </div>

          {/* Advanced options */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
            >
              <Sliders className="w-3 h-3" />
              Advanced Options
              {showAdvanced ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="label-text">Guidance Scale</label>
                        <span className="text-xs font-mono text-primary">{settings.guidanceScale}</span>
                      </div>
                      <input
                        type="range" min={1} max={20} step={0.5}
                        value={settings.guidanceScale ?? 7.5}
                        onChange={(e) => update('guidanceScale', parseFloat(e.target.value))}
                        disabled={loading}
                        className="w-full accent-primary"
                      />
                    </div>
                    <div>
                      <label className="label-text block mb-1">Seed (optional)</label>
                      <input
                        type="number"
                        value={settings.seed ?? ''}
                        onChange={(e) => update('seed', e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="Random"
                        disabled={loading}
                        className="input-field"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <GenerateButton
            onClick={handleGenerate}
            loading={loading}
            disabled={!prompt.trim()}
            onRegenerate={handleGenerate}
            hasResult={!!result}
            label="Generate Image"
          />
        </div>

        {/* ── RIGHT: Preview ── */}
        <div className="flex flex-col gap-4">
          <div
            className="relative card-surface overflow-hidden flex items-center justify-center bg-muted/30"
            style={{ aspectRatio: `${currentRatio.w}/${currentRatio.h}`, maxHeight: 'calc(100vh - 10rem)' }}
          >
            {loading && <GeneratingOverlay prompt={prompt} />}

            <AnimatePresence mode="wait">
              {result?.outputUrl ? (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={result.outputUrl}
                    alt={result.prompt}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </motion.div>
              ) : !loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center px-8"
                >
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))', opacity: 0.3 }}>
                    <span className="text-3xl">🖼️</span>
                  </div>
                  <p className="text-muted-foreground text-sm">Your generated image will appear here</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Enter a prompt and click Generate</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Action bar */}
          {result?.outputUrl && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2"
            >
              <button onClick={handleDownload} className="btn-ghost border border-border gap-2 flex-1">
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={handleFavorite}
                className={`btn-ghost border border-border gap-2 ${result.favorite ? 'text-red-400 border-red-400/30' : ''}`}
              >
                <Heart className={`w-4 h-4 ${result.favorite ? 'fill-current' : ''}`} />
                {result.favorite ? 'Saved' : 'Favorite'}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
