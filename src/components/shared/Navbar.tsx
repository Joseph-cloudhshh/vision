'use client'

import { Menu, Sparkles, Bell } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

const pageLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/generate/image': 'Image Generator',
  '/generate/video': 'Video Generator',
  '/gallery': 'Gallery',
  '/library': 'Prompt Library',
  '/settings': 'Settings',
}

interface NavbarProps {
  onMenuClick: () => void
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const pathname = usePathname()
  const label = Object.entries(pageLabels).find(([k]) => pathname.startsWith(k))?.[1] ?? 'VisionForge'

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card/60 backdrop-blur-md flex-shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="btn-ghost p-2 rounded-lg lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="w-4 h-4" />
        </button>
        <motion.h1
          key={label}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display font-700 text-lg text-foreground"
        >
          {label}
        </motion.h1>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/generate/image" className="btn-primary text-xs gap-1.5 py-2">
          <Sparkles className="w-3.5 h-3.5" />
          Generate
        </Link>
      </div>
    </header>
  )
}
