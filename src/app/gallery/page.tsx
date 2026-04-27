'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Heart, Image, Video, X, Loader2 } from 'lucide-react'
import type { Generation } from '@/types'
import MediaCard from '@/components/shared/MediaCard'
import { MediaCardSkeleton } from '@/components/shared/Loader'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

type FilterType = 'all' | 'image' | 'video'

export default function GalleryPage() {
  const searchParams = useSearchParams()
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [favoritesOnly, setFavoritesOnly] = useState(searchParams.get('favorites') === 'true')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchGenerations = useCallback(async (reset = false) => {
    const currentPage = reset ? 1 : page
    if (reset) setLoading(true); else setLoadingMore(true)

    const params = new URLSearchParams()
    if (filter !== 'all') params.set('type', filter)
    if (favoritesOnly) params.set('favorites', 'true')
    params.set('limit', '20')
    params.set('page', currentPage.toString())

    try {
      const res = await fetch(`/api/history?${params}`)
      const data = await res.json()
      setTotal(data.total)
      if (reset) {
        setGenerations(data.generations)
        setPage(1)
      } else {
        setGenerations((prev) => [...prev, ...data.generations])
      }
    } catch {
      toast({ title: 'Failed to load gallery', variant: 'destructive' })
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [filter, favoritesOnly, page])

  useEffect(() => {
    fetchGenerations(true)
  }, [filter, favoritesOnly])

  const handleLoadMore = () => {
    setPage((p) => p + 1)
    fetchGenerations()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/history/${id}`, { method: 'DELETE' })
    setGenerations((prev) => prev.filter((g) => g.id !== id))
    toast({ title: 'Deleted' })
  }

  const handleFavorite = async (id: string, val: boolean) => {
    await fetch(`/api/history/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ favorite: val }),
    })
    setGenerations((prev) => prev.map((g) => g.id === id ? { ...g, favorite: val } : g))
  }

  const filtered = search
    ? generations.filter((g) => g.prompt.toLowerCase().includes(search.toLowerCase()))
    : generations

  const filterBtns = [
    { id: 'all' as FilterType, label: 'All', icon: Filter },
    { id: 'image' as FilterType, label: 'Images', icon: Image },
    { id: 'video' as FilterType, label: 'Videos', icon: Video },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-display font-800">Gallery</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {total} creation{total !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompts..."
            className="input-field pl-9 pr-8 py-2 text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {filterBtns.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-semibold border transition-all',
              filter === id
                ? 'border-primary/60 bg-primary/10 text-foreground'
                : 'border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary'
            )}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}

        <button
          onClick={() => setFavoritesOnly(!favoritesOnly)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-semibold border transition-all',
            favoritesOnly
              ? 'border-red-400/60 bg-red-400/10 text-red-400'
              : 'border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary'
          )}
        >
          <Heart className={cn('w-3 h-3', favoritesOnly && 'fill-current')} />
          Favorites
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="masonry">
          {Array.from({ length: 8 }).map((_, i) => <MediaCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card-surface p-16 text-center"
        >
          <div className="text-4xl mb-4">🖼️</div>
          <p className="font-display font-700 text-base mb-1">No creations found</p>
          <p className="text-muted-foreground text-sm">
            {search ? 'Try a different search term' : favoritesOnly ? 'No favorites yet' : 'Generate something to get started'}
          </p>
        </motion.div>
      ) : (
        <>
          <AnimatePresence>
            <div className="masonry">
              {filtered.map((gen) => (
                <MediaCard
                  key={gen.id}
                  generation={gen}
                  onDelete={handleDelete}
                  onFavorite={handleFavorite}
                />
              ))}
            </div>
          </AnimatePresence>

          {/* Load more */}
          {filtered.length < total && !search && (
            <div className="flex justify-center pt-4">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="btn-ghost border border-border px-6 py-2.5 gap-2"
              >
                {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loadingMore ? 'Loading...' : `Load more (${total - filtered.length} remaining)`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
