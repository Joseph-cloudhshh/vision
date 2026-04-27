'use client'

import { useState } from 'react'
import { Sparkles, ChevronDown, ChevronUp, BookOpen, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PromptBoxProps {
  value: string
  onChange: (val: string) => void
  negativeValue?: string
  onNegativeChange?: (val: string) => void
  onSavePrompt?: () => void
  placeholder?: string
  disabled?: boolean
}

export default function PromptBox({
  value,
  onChange,
  negativeValue = '',
  onNegativeChange,
  onSavePrompt,
  placeholder = 'Describe your vision in vivid detail...',
  disabled,
}: PromptBoxProps) {
  const [showNegative, setShowNegative] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const charCount = value.length
  const maxChars = 1000

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="label-text">Prompt</label>
        <div className="flex items-center gap-1">
          {value && (
            <button onClick={handleCopy} className="btn-ghost py-1 px-2 text-xs gap-1">
              {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
          {onSavePrompt && value && (
            <button onClick={onSavePrompt} className="btn-ghost py-1 px-2 text-xs gap-1">
              <BookOpen className="w-3 h-3" />
              Save
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxChars}
          rows={4}
          className={cn(
            'textarea-field pr-12 resize-none',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
        <div className="absolute bottom-2 right-3 flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground font-mono">
            {charCount}/{maxChars}
          </span>
          <Sparkles className="w-3.5 h-3.5 text-primary/50" />
        </div>
      </div>

      {/* Negative prompt toggle */}
      {onNegativeChange && (
        <div>
          <button
            onClick={() => setShowNegative(!showNegative)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showNegative ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            Negative prompt
          </button>

          {showNegative && (
            <div className="mt-2">
              <textarea
                value={negativeValue}
                onChange={(e) => onNegativeChange(e.target.value)}
                placeholder="Things to exclude: blurry, distorted, low quality..."
                rows={2}
                className="textarea-field text-xs"
                disabled={disabled}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
