'use client'

import { cn } from '@/lib/utils'
import type { ImageStyle } from '@/types'

const styles: { id: ImageStyle; label: string; emoji: string; desc: string }[] = [
  { id: 'realistic', label: 'Realistic', emoji: '📷', desc: 'Photographic realism' },
  { id: 'anime', label: 'Anime', emoji: '⛩️', desc: 'Japanese animation' },
  { id: 'cinematic', label: 'Cinematic', emoji: '🎬', desc: 'Film-quality drama' },
  { id: 'fantasy', label: 'Fantasy', emoji: '🐉', desc: 'Epic fantasy art' },
  { id: 'cyberpunk', label: 'Cyberpunk', emoji: '🌆', desc: 'Neon-drenched future' },
  { id: '3d-render', label: '3D Render', emoji: '🧊', desc: 'CG & 3D graphics' },
  { id: 'watercolor', label: 'Watercolor', emoji: '🎨', desc: 'Soft painted strokes' },
  { id: 'oil-painting', label: 'Oil Paint', emoji: '🖼️', desc: 'Classical canvas' },
]

interface StyleSelectorProps {
  value: ImageStyle
  onChange: (style: ImageStyle) => void
  disabled?: boolean
}

export default function StyleSelector({ value, onChange, disabled }: StyleSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="label-text">Style Preset</label>
      <div className="grid grid-cols-2 gap-1.5">
        {styles.map((style) => (
          <button
            key={style.id}
            onClick={() => !disabled && onChange(style.id)}
            disabled={disabled}
            className={cn(
              'relative flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left transition-all duration-200',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              value === style.id
                ? 'border-primary/60 bg-primary/10 text-foreground'
                : 'border-border bg-secondary/50 text-muted-foreground hover:border-border/80 hover:text-foreground hover:bg-secondary'
            )}
          >
            <span className="text-base leading-none flex-shrink-0">{style.emoji}</span>
            <div className="min-w-0">
              <div className="text-xs font-display font-semibold truncate">{style.label}</div>
              <div className="text-[10px] text-muted-foreground truncate">{style.desc}</div>
            </div>
            {value === style.id && (
              <div className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
