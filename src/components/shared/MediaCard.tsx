'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Download, Trash2, Play, Copy, Check } from 'lucide-react'
import { cn, formatRelativeTime, truncate } from '@/lib/utils'
import type { Generation } from '@/types'

interface MediaCardProps {
  generation: Generation
  onFavorite?: (id: string, val: boolean) => void
  onDelete?: (id: string) => void
  onPromptClick?: (prompt: string) => void
  className?: string
}

export default function MediaCard({ generation, onFavorite, onDelete, onPromptClick, className }: MediaCardProps) {
  const [hovered, setHovered] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!generation.outputUrl) return
    const a = document.createElement('a')
    a.href = generation.outputUrl
    a.download = `visionforge-${generation.id}.${generation.type === 'video' ? 'mp4' : 'png'}`
    a.click()
  }

  const handleCopyPrompt = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(generation.prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    onFavorite?.(generation.id, !generation.favorite)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(generation.id)
  }

  const isVideo = generation.type === 'video'
  const thumbUrl = generation.thumbnailUrl || generation.outputUrl

  return (
    <motion.div
      layout
      className={cn('masonry-item', className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative card-surface overflow-hidden group cursor-pointer">
        {/* Media */}
        {thumbUrl ? (
          <div className="relative overflow-hidden bg-muted">
            <Image
              src={thumbUrl}
              alt={generation.prompt}
              width={400}
              height={400}
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
            {isVideo && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm">
                  <Play className="w-4 h-4 text-white ml-0.5" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full aspect-square skeleton" />
        )}

        {/* Overlay on hover */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
            >
              {/* Action buttons */}
              <div className="absolute top-2 right-2 flex gap-1.5">
                <button
                  onClick={handleFavorite}
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm transition-all',
                    generation.favorite
                      ? 'bg-red-500/90 text-white'
                      : 'bg-black/40 text-white/70 hover:text-white hover:bg-black/60'
                  )}
                >
                  <Heart className={cn('w-3.5 h-3.5', generation.favorite && 'fill-current')} />
                </button>
                <button
                  onClick={handleCopyPrompt}
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-black/40 text-white/70 hover:text-white hover:bg-black/60 backdrop-blur-sm transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleDownload}
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-black/40 text-white/70 hover:text-white hover:bg-black/60 backdrop-blur-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-black/40 text-white/70 hover:text-red-400 hover:bg-black/60 backdrop-blur-sm transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Prompt */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p
                  className="text-white text-xs leading-relaxed cursor-pointer hover:underline"
                  onClick={() => onPromptClick?.(generation.prompt)}
                >
                  {truncate(generation.prompt, 80)}
                </p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className={cn(
                    'tag text-[10px]',
                    isVideo
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-primary/20 text-primary'
                  )}>
                    {isVideo ? '🎬 Video' : '🖼 Image'}
                  </span>
                  <span className="text-white/50 text-[10px]">{formatRelativeTime(generation.createdAt)}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status badge */}
        {generation.status !== 'completed' && (
          <div className={cn(
            'absolute top-2 left-2 tag text-[10px]',
            generation.status === 'processing' && 'bg-yellow-500/20 text-yellow-300',
            generation.status === 'pending' && 'bg-muted text-muted-foreground',
            generation.status === 'failed' && 'bg-red-500/20 text-red-300',
          )}>
            {generation.status}
          </div>
        )}
      </div>
    </motion.div>
  )
}
