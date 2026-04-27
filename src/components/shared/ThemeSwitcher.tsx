'use client'

import { useTheme } from '@/lib/theme-context'
import { cn } from '@/lib/utils'
import type { Theme } from '@/types'

const themes: { id: Theme; label: string; colors: string[] }[] = [
  { id: 'obsidian', label: 'Obsidian', colors: ['#7c3aed', '#6366f1', '#3b82f6'] },
  { id: 'neon', label: 'Neon Pink', colors: ['#f72585', '#b5179e', '#7209b7'] },
  { id: 'emerald', label: 'Emerald', colors: ['#10b981', '#06b6d4', '#3b82f6'] },
]

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="px-1 py-2">
      <div className="label-text mb-2 px-1">Theme</div>
      <div className="flex gap-1.5">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            title={t.label}
            className={cn(
              'relative w-7 h-7 rounded-full transition-all duration-200 overflow-hidden',
              'ring-offset-background ring-offset-1',
              theme === t.id ? 'ring-2 ring-foreground scale-110' : 'hover:scale-105'
            )}
            style={{
              background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[2]})`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
