'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Image, Video, LayoutDashboard,
  BookOpen, Images, Settings, ChevronLeft, Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import ThemeSwitcher from '@/components/shared/ThemeSwitcher'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/generate/image', label: 'Image Gen', icon: Image },
  { href: '/generate/video', label: 'Video Gen', icon: Video },
  { href: '/gallery', label: 'Gallery', icon: Images },
  { href: '/library', label: 'Prompt Library', icon: BookOpen },
  { href: '/settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  open: boolean
  onToggle: () => void
}

export default function Sidebar({ open, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence initial={false}>
      <motion.aside
        animate={{ width: open ? 240 : 64 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="relative flex flex-col h-full bg-card border-r border-border z-20 flex-shrink-0 overflow-hidden"
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center glow-sm"
              style={{ background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))' }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="min-w-0"
                >
                  <div className="font-display font-800 text-sm gradient-text leading-none">
                    VisionForge
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono tracking-widest mt-0.5">
                    AI STUDIO
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto scrollbar-none">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'sidebar-link relative',
                  active && 'active'
                )}
                title={!open ? label : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <AnimatePresence>
                  {open && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                      className="truncate"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-lg bg-primary/10"
                    style={{ zIndex: -1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="p-2 border-t border-border space-y-2">
          {open && <ThemeSwitcher />}
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center h-8 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          >
            <motion.div animate={{ rotate: open ? 0 : 180 }} transition={{ duration: 0.3 }}>
              <ChevronLeft className="w-4 h-4" />
            </motion.div>
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  )
}
