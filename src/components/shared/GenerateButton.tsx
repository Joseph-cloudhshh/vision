'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Loader2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GenerateButtonProps {
  onClick: () => void
  loading?: boolean
  disabled?: boolean
  onRegenerate?: () => void
  hasResult?: boolean
  label?: string
  className?: string
}

export default function GenerateButton({
  onClick,
  loading,
  disabled,
  onRegenerate,
  hasResult,
  label = 'Generate',
  className,
}: GenerateButtonProps) {
  return (
    <div className={cn('flex gap-2', className)}>
      <motion.button
        onClick={onClick}
        disabled={disabled || loading}
        whileTap={{ scale: 0.97 }}
        className={cn(
          'btn-primary flex-1 relative overflow-hidden',
          (disabled || loading) && 'opacity-60 cursor-not-allowed'
        )}
      >
        {/* Shimmer effect when not loading */}
        {!loading && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          />
        )}

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.span
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating…
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {hasResult && onRegenerate && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={onRegenerate}
          disabled={loading}
          className="btn-ghost border border-border px-3 disabled:opacity-50"
          title="Regenerate"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
        </motion.button>
      )}
    </div>
  )
}
