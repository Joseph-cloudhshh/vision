'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Key, Palette, Database, Globe, CheckCircle2,
  ExternalLink, ChevronRight, Shield, Zap
} from 'lucide-react'
import { useTheme } from '@/lib/theme-context'
import type { Theme } from '@/types'
import { cn } from '@/lib/utils'
import ThemeSwitcher from '@/components/shared/ThemeSwitcher'

const aiProviders = [
  { id: 'replicate', name: 'Replicate', desc: 'Access hundreds of AI models including SD, SDXL, and more.', url: 'https://replicate.com', supported: true },
  { id: 'stability', name: 'Stability AI', desc: 'Direct access to Stable Diffusion and SDXL APIs.', url: 'https://stability.ai', supported: true },
  { id: 'runway', name: 'RunwayML', desc: 'Gen-3 Alpha video generation with high quality output.', url: 'https://runwayml.com', supported: true },
  { id: 'kling', name: 'Kling AI', desc: 'High-quality video generation up to 2 minutes.', url: 'https://klingai.com', supported: true },
  { id: 'openai', name: 'OpenAI DALL·E', desc: 'DALL·E 3 image generation via OpenAI API.', url: 'https://openai.com', supported: true },
  { id: 'midjourney', name: 'Midjourney', desc: 'Not yet supported via API. Check back soon.', url: 'https://midjourney.com', supported: false },
]

const envVars = [
  { key: 'AI_API_KEY', desc: 'Your AI provider API key', required: true },
  { key: 'AI_API_BASE_URL', desc: 'API base URL (e.g. https://api.replicate.com/v1)', required: true },
  { key: 'CLOUDINARY_CLOUD_NAME', desc: 'Cloudinary cloud name for media storage', required: false },
  { key: 'CLOUDINARY_API_KEY', desc: 'Cloudinary API key', required: false },
  { key: 'CLOUDINARY_API_SECRET', desc: 'Cloudinary API secret', required: false },
  { key: 'DATABASE_URL', desc: 'PostgreSQL connection string', required: false },
]

const themes: { id: Theme; name: string; desc: string; colors: string[] }[] = [
  { id: 'obsidian', name: 'Dark Obsidian', desc: 'Deep dark with violet-indigo accents', colors: ['#7c3aed', '#6366f1', '#3b82f6'] },
  { id: 'neon', name: 'Neon Pink', desc: 'Dark background with hot pink energy', colors: ['#f72585', '#b5179e', '#7209b7'] },
  { id: 'emerald', name: 'Emerald Green', desc: 'Rich dark with emerald and cyan tones', colors: ['#10b981', '#06b6d4', '#3b82f6'] },
]

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [activeSection, setActiveSection] = useState<'api' | 'theme' | 'storage'>('api')

  const sections = [
    { id: 'api' as const, label: 'API Configuration', icon: Key },
    { id: 'theme' as const, label: 'Theme & Appearance', icon: Palette },
    { id: 'storage' as const, label: 'Storage & Database', icon: Database },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-800">Settings</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Configure your VisionForge AI studio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
        {/* Sidebar nav */}
        <nav className="space-y-1">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-all',
                activeSection === id
                  ? 'bg-primary/10 text-foreground border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="space-y-5">
          {/* ── API Config ── */}
          {activeSection === 'api' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              {/* AI Providers */}
              <div className="card-surface p-5 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <h2 className="font-display font-700 text-sm">Supported AI Providers</h2>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  VisionForge uses placeholder functions in <code className="bg-secondary px-1.5 py-0.5 rounded font-mono text-[11px]">src/lib/ai-api.ts</code> that you replace with your provider's API calls.
                  Detailed integration instructions are in the file comments.
                </p>
                <div className="space-y-2">
                  {aiProviders.map((p) => (
                    <div
                      key={p.id}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-lg border transition-colors',
                        p.supported ? 'border-border hover:border-border/80' : 'border-border/40 opacity-50'
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-700 text-sm">{p.name}</span>
                          {p.supported
                            ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            : <span className="tag bg-muted text-muted-foreground text-[10px]">Soon</span>
                          }
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
                      </div>
                      {p.supported && (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-ghost p-1.5 flex-shrink-0 ml-3"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Environment variables */}
              <div className="card-surface p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <h2 className="font-display font-700 text-sm">Environment Variables</h2>
                </div>
                <p className="text-xs text-muted-foreground">
                  Configure these in your <code className="bg-secondary px-1.5 py-0.5 rounded font-mono text-[11px]">.env.local</code> file or in your deployment platform.
                </p>
                <div className="space-y-2">
                  {envVars.map((v) => (
                    <div key={v.key} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <code className="font-mono text-xs text-primary font-medium">{v.key}</code>
                          {v.required
                            ? <span className="tag bg-primary/10 text-primary text-[9px]">Required</span>
                            : <span className="tag bg-secondary text-muted-foreground text-[9px]">Optional</span>
                          }
                        </div>
                        <p className="text-xs text-muted-foreground">{v.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Security note:</strong> API keys are stored server-side only and never exposed to the client.
                    All AI API calls happen through Next.js API routes.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Theme ── */}
          {activeSection === 'theme' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="card-surface p-5 space-y-5">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-primary" />
                  <h2 className="font-display font-700 text-sm">Color Theme</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={cn(
                        'relative p-4 rounded-xl border-2 text-left transition-all duration-200 overflow-hidden',
                        theme === t.id
                          ? 'border-primary/60 bg-primary/5'
                          : 'border-border hover:border-border/80 bg-card'
                      )}
                    >
                      {/* Color preview */}
                      <div className="flex gap-1.5 mb-3">
                        {t.colors.map((c, i) => (
                          <div key={i} className="w-5 h-5 rounded-full" style={{ background: c }} />
                        ))}
                      </div>
                      <div className="font-display font-700 text-sm mb-0.5">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.desc}</div>
                      {theme === t.id && (
                        <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 text-primary" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Live preview */}
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-border bg-card/60">
                    <span className="text-xs font-display font-semibold text-muted-foreground">Preview</span>
                  </div>
                  <div className="p-4 space-y-3 bg-background">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))' }}>
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-display font-700 gradient-text">VisionForge AI</div>
                        <div className="text-[10px] text-muted-foreground">Your creative studio</div>
                      </div>
                    </div>
                    <button className="btn-primary w-full text-sm py-2">
                      Generate Image
                    </button>
                    <div className="flex gap-2">
                      <div className="flex-1 h-2 rounded-full bg-primary/30 overflow-hidden">
                        <div className="h-full w-2/3 progress-bar-fill rounded-full" />
                      </div>
                      <span className="text-[10px] font-mono text-primary">67%</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Storage ── */}
          {activeSection === 'storage' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="card-surface p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  <h2 className="font-display font-700 text-sm">Cloudinary Storage</h2>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  VisionForge uses Cloudinary for media storage, CDN delivery, and thumbnail generation.
                  Without Cloudinary configured, generated URLs are used directly from your AI provider.
                </p>
                <div className="space-y-3 text-xs">
                  {[
                    { label: 'Image storage', desc: 'Auto-optimized with WebP conversion and CDN' },
                    { label: 'Video storage', desc: 'HLS streaming-ready with adaptive bitrate' },
                    { label: 'Thumbnails', desc: 'Auto-generated at 400×400px for gallery view' },
                    { label: 'Free tier', desc: '25 GB storage, 25 GB bandwidth/month' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-foreground">{item.label}</div>
                        <div className="text-muted-foreground">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <a
                  href="https://cloudinary.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost border border-border gap-2 text-sm inline-flex w-full justify-center mt-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Get Cloudinary account
                </a>
              </div>

              <div className="card-surface p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary" />
                  <h2 className="font-display font-700 text-sm">PostgreSQL Database</h2>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Generation history and saved prompts are stored in a PostgreSQL database via Prisma ORM.
                  Deploy on Neon, Supabase, PlanetScale, or any Postgres host.
                </p>
                <div className="p-3 rounded-lg bg-secondary/50 border border-border font-mono text-xs space-y-2">
                  <div className="text-muted-foreground"># Push schema to database</div>
                  <div className="text-foreground">npm run db:push</div>
                  <div className="text-muted-foreground mt-2"># Open Prisma Studio</div>
                  <div className="text-foreground">npm run db:studio</div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {[
                    { name: 'Neon', url: 'https://neon.tech' },
                    { name: 'Supabase', url: 'https://supabase.com' },
                  ].map((db) => (
                    <a
                      key={db.name}
                      href={db.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/30 transition-colors text-xs font-display font-semibold"
                    >
                      {db.name}
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
