'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GenerationStatus } from '@/types'

interface ProgressTrackerProps {
  status: GenerationStatus
  progress?: number
  label?: string
}

export default function ProgressTracker({ status, progress = 0, label }: ProgressTrackerProps) {
  const stages = [
    { key: 'pending', label: 'Queued' },
    { key: 'processing', label: 'Generating' },
    { key: 'completed', label: 'Complete' },
  ]

  const stageIndex = stages.findIndex((s) => s.key === status)

  return (
    <div className="space-y-4">
      {/* Stage indicators */}
      <div className="flex items-center gap-2">
        {stages.map((stage, i) => {
          const done = stageIndex > i
          const active = stageIndex === i
          return (
            <div key={stage.key} className="flex items-center gap-2 flex-1">
              <div className={cn(
                'flex items-center gap-1.5 text-xs font-display font-semibold transition-colors duration-300',
                done ? 'text-primary' : active ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {done ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                ) : active && status !== 'failed' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : status === 'failed' && active ? (
                  <XCircle className="w-3.5 h-3.5 text-destructive" />
                ) : (
                  <Clock className="w-3.5 h-3.5" />
                )}
                {stage.label}
              </div>
              {i < stages.length - 1 && (
                <div className="flex-1 h-px bg-border overflow-hidden rounded-full">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: '0%' }}
                    animate={{ width: done ? '100%' : '0%' }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Progress bar */}
      {(status === 'processing' || status === 'pending') && (
        <div>
          <div className="progress-bar">
            <motion.div
              className="progress-bar-fill"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted-foreground">{label || 'Processing...'}</span>
            <span className="text-xs font-mono text-primary">{progress}%</span>
          </div>
        </div>
      )}

      {status === 'failed' && (
        <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg border border-destructive/20">
          <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
          Generation failed. Please try again.
        </div>
      )}

      {status === 'completed' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 text-xs text-primary bg-primary/10 px-3 py-2 rounded-lg border border-primary/20"
        >
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          Generation complete!
        </motion.div>
      )}
    </div>
  )
}
