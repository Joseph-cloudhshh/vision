'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Sparkles, Zap, Image as ImageIcon, Video, ArrowRight, Star, Shield, Cpu } from 'lucide-react'

const showcaseImages = [
  { src: 'https://picsum.photos/seed/vf10/600/800', style: 'Cinematic' },
  { src: 'https://picsum.photos/seed/vf11/600/600', style: 'Anime' },
  { src: 'https://picsum.photos/seed/vf12/600/900', style: 'Fantasy' },
  { src: 'https://picsum.photos/seed/vf13/600/700', style: 'Cyberpunk' },
  { src: 'https://picsum.photos/seed/vf14/600/650', style: 'Realistic' },
  { src: 'https://picsum.photos/seed/vf15/600/750', style: '3D Render' },
]

const features = [
  { icon: ImageIcon, title: 'Image Generation', desc: '8 style presets, aspect ratios, quality control, and seed-based reproducibility.', color: 'from-violet-500 to-indigo-500' },
  { icon: Video, title: 'Video Generation', desc: 'Text-to-video and image-to-video with cinematic motion presets and queue system.', color: 'from-cyan-500 to-blue-500' },
  { icon: Star, title: 'Prompt Library', desc: 'Save, organize, and reuse your best prompts across sessions with categories.', color: 'from-amber-500 to-orange-500' },
  { icon: Shield, title: 'Cloudinary Storage', desc: 'All generations stored securely with CDN delivery and thumbnail generation.', color: 'from-emerald-500 to-teal-500' },
  { icon: Cpu, title: 'API-Agnostic', desc: 'Plug in any AI provider — Replicate, Stability AI, RunwayML, Kling, and more.', color: 'from-rose-500 to-pink-500' },
  { icon: Zap, title: 'Instant Preview', desc: 'Real-time generation progress, live video player, and one-click download.', color: 'from-yellow-500 to-lime-500' },
]

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 400], [0, -80])
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])

  useEffect(() => { setMounted(true) }, [])

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-8 glass border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))' }}>
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-display font-800 text-base gradient-text">VisionForge</span>
          <span className="text-[10px] font-mono text-muted-foreground tracking-widest ml-1 hidden sm:block">AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="btn-ghost text-sm hidden sm:flex">Dashboard</Link>
          <Link href="/generate/image" className="btn-primary text-sm py-2">
            <Sparkles className="w-3.5 h-3.5" />
            Start Creating
          </Link>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background orbs */}
        <div className="orb w-[600px] h-[600px] top-[-200px] left-[-200px] opacity-20"
          style={{ background: 'var(--gradient-start)' }} />
        <div className="orb w-[500px] h-[500px] bottom-[-100px] right-[-100px] opacity-15"
          style={{ background: 'var(--gradient-end)' }} />

        {/* Grid overlay */}
        <div className="absolute inset-0 grid-bg opacity-30" />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-border/80 text-xs font-display font-semibold text-muted-foreground mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-glow-pulse" />
            Open Source · No Auth · Plug-in Your API
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-6xl sm:text-7xl lg:text-8xl font-display font-800 tracking-tight mb-6"
          >
            Create Without
            <br />
            <span className="gradient-text">Limits</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            A self-hosted AI studio for image and video generation. Connect any provider,
            generate stunning media, and own everything — no subscriptions, no limits.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link href="/generate/image" className="btn-primary text-base py-3 px-7 gap-2">
              <Sparkles className="w-4 h-4" />
              Generate Images
            </Link>
            <Link href="/generate/video" className="btn-ghost border border-border py-3 px-7 text-base gap-2">
              <Video className="w-4 h-4" />
              Generate Videos
            </Link>
          </motion.div>
        </motion.div>

        {/* Floating cards */}
        {mounted && (
          <div className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none overflow-hidden">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-4 pb-0">
              {showcaseImages.slice(0, 4).map((img, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 80 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="relative flex-shrink-0 w-32 rounded-xl overflow-hidden shadow-2xl border border-border/50"
                  style={{ transform: `rotate(${(i - 1.5) * 3}deg) translateY(${i % 2 === 0 ? -10 : 10}px)` }}
                >
                  <Image src={img.src} alt={img.style} width={128} height={160} className="w-full h-40 object-cover" unoptimized />
                  <div className="absolute bottom-1 left-1 right-1 text-center">
                    <span className="text-[9px] font-display font-semibold px-1.5 py-0.5 rounded-full bg-black/60 text-white/80">{img.style}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── SHOWCASE GALLERY ────────────────────────────────────────────── */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-display font-800 mb-3">Built for Creators</h2>
            <p className="text-muted-foreground">Every style, every ratio, every vision.</p>
          </motion.div>

          <div className="columns-2 md:columns-3 gap-4">
            {showcaseImages.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="break-inside-avoid mb-4 rounded-xl overflow-hidden border border-border/50 relative group cursor-pointer"
              >
                <Image src={img.src} alt={img.style} width={600} height={800} className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="font-display font-semibold text-white text-sm">{img.style}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-display font-800 mb-3">Everything You Need</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">A complete studio, open source and yours to deploy.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="card-surface p-6 group hover:border-primary/30 transition-colors duration-300 gradient-border"
              >
                <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center bg-gradient-to-br ${f.color}`}>
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-display font-700 text-base mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative card-surface p-12 text-center overflow-hidden"
          >
            <div className="orb w-64 h-64 top-[-80px] left-[-80px] opacity-30"
              style={{ background: 'var(--gradient-start)' }} />
            <div className="orb w-48 h-48 bottom-[-40px] right-[-40px] opacity-20"
              style={{ background: 'var(--gradient-end)' }} />

            <div className="relative z-10">
              <h2 className="text-4xl font-display font-800 mb-4">
                Your imagination,<br />
                <span className="gradient-text">rendered.</span>
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Connect your AI provider, deploy in minutes, and start creating stunning media without limits.
              </p>
              <Link href="/dashboard" className="btn-primary text-base py-3 px-8 gap-2 inline-flex">
                Open Studio <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-8 px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))' }}>
            <Zap className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="font-display text-sm font-semibold gradient-text">VisionForge AI</span>
        </div>
        <p className="text-xs text-muted-foreground">Open source · Personal use</p>
      </footer>
    </div>
  )
}
