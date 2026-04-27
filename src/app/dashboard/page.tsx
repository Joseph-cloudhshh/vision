'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Image, Video, HardDrive, Sparkles, TrendingUp, Heart, Clock } from 'lucide-react'
import type { Stats } from '@/types'
import { formatBytes, formatRelativeTime } from '@/lib/utils'
import MediaCard from '@/components/shared/MediaCard'
import { Skeleton } from '@/components/shared/Loader'

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const statCards = [
    { label: 'Images Generated', value: stats?.totalImages ?? 0, icon: Image, color: 'from-violet-500 to-indigo-500', suffix: '' },
    { label: 'Videos Generated', value: stats?.totalVideos ?? 0, icon: Video, color: 'from-cyan-500 to-blue-500', suffix: '' },
    { label: 'Storage Used', value: stats ? formatBytes(stats.totalStorage) : '0 B', icon: HardDrive, color: 'from-emerald-500 to-teal-500', suffix: '', raw: true },
    { label: 'Total Creations', value: (stats?.totalImages ?? 0) + (stats?.totalVideos ?? 0), icon: TrendingUp, color: 'from-amber-500 to-orange-500', suffix: '' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* ── Welcome ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-800 tracking-tight">
            Your Studio
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Welcome back. What will you create today?</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/generate/image" className="btn-primary gap-2">
            <Sparkles className="w-4 h-4" />
            Generate
          </Link>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="card-surface p-5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 -translate-y-8 translate-x-8"
              style={{ background: `linear-gradient(135deg, ${card.color.split(' ').join(',')})` }} />
            <div className={`w-9 h-9 rounded-lg mb-3 flex items-center justify-center bg-gradient-to-br ${card.color}`}>
              <card.icon className="w-4 h-4 text-white" />
            </div>
            {loading ? (
              <Skeleton className="h-7 w-16 mb-1" />
            ) : (
              <div className="text-2xl font-display font-800 mb-0.5">
                {card.raw ? card.value : card.value.toLocaleString()}{card.suffix}
              </div>
            )}
            <div className="text-xs text-muted-foreground font-medium">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { href: '/generate/image', icon: Image, label: 'Generate Image', desc: 'Text to image with style presets', grad: 'from-violet-500 to-indigo-500' },
          { href: '/generate/video', icon: Video, label: 'Generate Video', desc: 'Text-to-video or image-to-video', grad: 'from-cyan-500 to-blue-500' },
          { href: '/gallery', icon: TrendingUp, label: 'Browse Gallery', desc: 'View all your creations', grad: 'from-emerald-500 to-teal-500' },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="card-surface p-4 flex items-center gap-4 hover:border-primary/30 transition-colors group gradient-border"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${action.grad} flex-shrink-0 group-hover:scale-110 transition-transform`}>
              <action.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-display font-700 text-sm">{action.label}</div>
              <div className="text-xs text-muted-foreground">{action.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Recent Generations ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-display font-700 text-base">Recent Creations</h2>
          </div>
          <Link href="/gallery" className="btn-ghost text-xs">View all →</Link>
        </div>

        {loading ? (
          <div className="masonry">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="masonry-item">
                <Skeleton className="w-full h-48 rounded-xl" />
              </div>
            ))}
          </div>
        ) : stats?.recentGenerations?.length ? (
          <div className="masonry">
            {stats.recentGenerations.map((gen) => (
              <MediaCard key={gen.id} generation={gen} />
            ))}
          </div>
        ) : (
          <div className="card-surface p-12 text-center">
            <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No creations yet.</p>
            <Link href="/generate/image" className="btn-primary mt-4 inline-flex text-sm">
              Create your first image
            </Link>
          </div>
        )}
      </div>

      {/* ── Favorites ── */}
      {stats?.favoriteGenerations?.length ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-400" />
              <h2 className="font-display font-700 text-base">Favorites</h2>
            </div>
            <Link href="/gallery?favorites=true" className="btn-ghost text-xs">View all →</Link>
          </div>
          <div className="masonry">
            {stats.favoriteGenerations.map((gen) => (
              <MediaCard key={gen.id} generation={gen} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
