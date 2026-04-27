'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-lg', className)} />
}

export function CardSkeleton() {
  return (
    <div className="card-surface p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}

export function MediaCardSkeleton() {
  return (
    <div className="masonry-item">
      <div className="card-surface overflow-hidden">
        <Skeleton className="w-full aspect-square rounded-none" />
      </div>
    </div>
  )
}

interface PageLoaderProps {
  text?: string
}

export function PageLoader({ text = 'Loading...' }: PageLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="relative w-12 h-12">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/20"
        />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  )
}

export function GeneratingOverlay({ prompt }: { prompt: string }) {
  const dots = ['●', '●', '●']
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl z-10"
    >
      <div className="text-center space-y-4 px-6">
        <div className="flex items-center gap-1 justify-center">
          {dots.map((d, i) => (
            <motion.span
              key={i}
              className="text-primary text-lg"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            >
              {d}
            </motion.span>
          ))}
        </div>
        <p className="text-sm font-display font-semibold">Generating your vision</p>
        <p className="text-xs text-muted-foreground max-w-48 leading-relaxed line-clamp-2">
          {prompt}
        </p>
      </div>
    </motion.div>
  )
}
