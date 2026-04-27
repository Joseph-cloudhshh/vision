'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Plus, Trash2, Edit2, Copy, Check, BookOpen,
  ArrowRight, Tag, X, Save
} from 'lucide-react'
import type { SavedPrompt } from '@/types'
import { toast } from '@/hooks/use-toast'
import { cn, formatRelativeTime, truncate } from '@/lib/utils'

const CATEGORIES = ['all', 'general', 'image', 'video', 'portrait', 'landscape', 'abstract', 'character']

export default function LibraryPage() {
  const router = useRouter()
  const [prompts, setPrompts] = useState<SavedPrompt[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState({ title: '', prompt: '', category: '' })
  const [showAdd, setShowAdd] = useState(false)
  const [newPrompt, setNewPrompt] = useState({ title: '', prompt: '', category: 'general' })

  const fetchPrompts = async () => {
    const params = new URLSearchParams()
    if (category !== 'all') params.set('category', category)
    if (search) params.set('search', search)

    try {
      const res = await fetch(`/api/prompts?${params}`)
      const data = await res.json()
      setPrompts(data.prompts || [])
    } catch {
      toast({ title: 'Failed to load prompts', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPrompts() }, [category, search])

  const handleCopy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/prompts/${id}`, { method: 'DELETE' })
    setPrompts((prev) => prev.filter((p) => p.id !== id))
    toast({ title: 'Prompt deleted' })
  }

  const handleStartEdit = (p: SavedPrompt) => {
    setEditingId(p.id)
    setEditValues({ title: p.title, prompt: p.prompt, category: p.category })
  }

  const handleSaveEdit = async (id: string) => {
    await fetch(`/api/prompts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editValues),
    })
    setPrompts((prev) => prev.map((p) => p.id === id ? { ...p, ...editValues } : p))
    setEditingId(null)
    toast({ title: 'Prompt updated' })
  }

  const handleAdd = async () => {
    if (!newPrompt.title.trim() || !newPrompt.prompt.trim()) {
      toast({ title: 'Fill in all fields', variant: 'destructive' })
      return
    }
    const res = await fetch('/api/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPrompt),
    })
    const data = await res.json()
    setPrompts((prev) => [data.prompt, ...prev])
    setNewPrompt({ title: '', prompt: '', category: 'general' })
    setShowAdd(false)
    toast({ title: 'Prompt saved!' })
  }

  const handleUsePrompt = (prompt: SavedPrompt) => {
    router.push(`/generate/image?prompt=${encodeURIComponent(prompt.prompt)}`)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-800">Prompt Library</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{prompts.length} saved prompt{prompts.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary gap-2 text-sm">
          <Plus className="w-4 h-4" />
          Add Prompt
        </button>
      </div>

      {/* Add prompt modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="card-surface p-5 space-y-4 border-primary/30"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-700 text-sm">New Prompt</h3>
              <button onClick={() => setShowAdd(false)} className="btn-ghost p-1.5">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label className="label-text block mb-1">Title</label>
                <input
                  value={newPrompt.title}
                  onChange={(e) => setNewPrompt((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Sunset over city..."
                  className="input-field"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="label-text block mb-1">Category</label>
                <select
                  value={newPrompt.category}
                  onChange={(e) => setNewPrompt((p) => ({ ...p, category: e.target.value }))}
                  className="input-field"
                >
                  {CATEGORIES.filter((c) => c !== 'all').map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="label-text block mb-1">Prompt</label>
                <textarea
                  value={newPrompt.prompt}
                  onChange={(e) => setNewPrompt((p) => ({ ...p, prompt: e.target.value }))}
                  placeholder="A cinematic sunset over a futuristic city skyline..."
                  rows={3}
                  className="textarea-field"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowAdd(false)} className="btn-ghost">Cancel</button>
              <button onClick={handleAdd} className="btn-primary gap-2 text-sm">
                <Save className="w-3.5 h-3.5" />
                Save Prompt
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompts..."
            className="input-field pl-9 text-sm"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-display font-semibold border transition-all',
                category === cat
                  ? 'border-primary/60 bg-primary/10 text-foreground'
                  : 'border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Prompts list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-surface p-4 space-y-2 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-3 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : prompts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card-surface p-16 text-center"
        >
          <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="font-display font-700 text-base mb-1">No prompts yet</p>
          <p className="text-muted-foreground text-sm mb-4">
            {search ? 'No prompts match your search' : 'Save your best prompts for quick reuse'}
          </p>
          <button onClick={() => setShowAdd(true)} className="btn-primary text-sm gap-2">
            <Plus className="w-4 h-4" />
            Add your first prompt
          </button>
        </motion.div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {prompts.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="card-surface p-4 hover:border-border/80 transition-colors group gradient-border"
              >
                {editingId === p.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label-text block mb-1">Title</label>
                        <input
                          value={editValues.title}
                          onChange={(e) => setEditValues((v) => ({ ...v, title: e.target.value }))}
                          className="input-field text-sm"
                        />
                      </div>
                      <div>
                        <label className="label-text block mb-1">Category</label>
                        <select
                          value={editValues.category}
                          onChange={(e) => setEditValues((v) => ({ ...v, category: e.target.value }))}
                          className="input-field text-sm"
                        >
                          {CATEGORIES.filter((c) => c !== 'all').map((c) => (
                            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="label-text block mb-1">Prompt</label>
                      <textarea
                        value={editValues.prompt}
                        onChange={(e) => setEditValues((v) => ({ ...v, prompt: e.target.value }))}
                        rows={3}
                        className="textarea-field text-sm"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditingId(null)} className="btn-ghost text-sm">Cancel</button>
                      <button onClick={() => handleSaveEdit(p.id)} className="btn-primary text-sm gap-1.5">
                        <Save className="w-3.5 h-3.5" /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="font-display font-700 text-sm truncate">{p.title}</h3>
                        <span className="tag bg-secondary text-muted-foreground text-[10px] flex-shrink-0">
                          <Tag className="w-2.5 h-2.5" />
                          {p.category}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{p.prompt}</p>
                      <span className="text-[10px] text-muted-foreground/50 mt-2 block">{formatRelativeTime(p.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={() => handleCopy(p.id, p.prompt)}
                        className="btn-ghost p-1.5"
                        title="Copy prompt"
                      >
                        {copiedId === p.id
                          ? <Check className="w-3.5 h-3.5 text-green-400" />
                          : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleUsePrompt(p)}
                        className="btn-ghost p-1.5"
                        title="Use in generator"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleStartEdit(p)}
                        className="btn-ghost p-1.5"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="btn-ghost p-1.5 hover:text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
