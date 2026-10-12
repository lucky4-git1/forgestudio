'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  Download,
  Trash2,
  FolderOpen,
  ImageIcon,
  Video,
  Hexagon,
  Grid3X3,
  List,
  Copy,
  ArrowRight,
  X,
  Loader2,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface Asset {
  id: string
  project_id: string | null
  user_id: string
  type: 'image' | 'video' | 'logo'
  prompt: string | null
  metadata: Record<string, unknown> | null
  file_url: string
  thumbnail_url: string | null
  created_at: string
}

interface Project {
  id: string
  name: string
}

const typeIcons = {
  image: ImageIcon,
  video: Video,
  logo: Hexagon,
}

const typeColors = {
  image: 'from-violet-500 to-purple-500',
  video: 'from-emerald-500 to-teal-500',
  logo: 'from-blue-500 to-cyan-500',
}

export default function AssetLibraryPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [moveTarget, setMoveTarget] = useState<string>('')

  const fetchAssets = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filterType !== 'all') params.set('type', filterType)
      const res = await fetch(`/api/assets?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setAssets(data.assets || [])
      }
    } catch (error) {
      console.error('Failed to fetch assets:', error)
    } finally {
      setLoading(false)
    }
  }, [filterType])

  useEffect(() => {
    fetchAssets()
    fetchProjects()
  }, [fetchAssets])

  async function fetchProjects() {
    try {
      const res = await fetch('/api/projects')
      if (res.ok) {
        const data = await res.json()
        setProjects(data.projects || [])
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    }
  }

  async function deleteAsset(id: string) {
    try {
      const res = await fetch(`/api/assets/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setAssets(assets.filter((a) => a.id !== id))
        setSelectedAsset(null)
      }
    } catch (error) {
      console.error('Failed to delete asset:', error)
    }
  }

  async function moveAsset(assetId: string, projectId: string) {
    try {
      const res = await fetch(`/api/assets/${assetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId }),
      })
      if (res.ok) {
        fetchAssets()
        setShowMoveModal(false)
        setSelectedAsset(null)
      }
    } catch (error) {
      console.error('Failed to move asset:', error)
    }
  }

  async function downloadAsset(url: string, filename: string) {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const filteredAssets = assets.filter((a) => {
    const matchesSearch = a.prompt
      ? a.prompt.toLowerCase().includes(searchQuery.toLowerCase())
      : true
    const matchesType = filterType === 'all' || a.type === filterType
    return matchesSearch && matchesType
  })

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white">Asset Library</h1>
        <p className="text-zinc-400 mt-1">
          All your generated content in one place
        </p>
      </motion.div>

      {/* Controls Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row gap-4 mb-6"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search assets by prompt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-zinc-500 mr-1" />
          {['all', 'image', 'video', 'logo'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterType === type
                  ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                  : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-700/50'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Assets */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-zinc-800/30 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : filteredAssets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="w-20 h-20 bg-zinc-800/50 rounded-2xl flex items-center justify-center mb-4">
            <ImageIcon className="w-10 h-10 text-zinc-600" />
          </div>
          <h3 className="text-xl font-semibold text-zinc-400 mb-2">
            No assets found
          </h3>
          <p className="text-zinc-500">
            Start generating to build your asset library
          </p>
        </motion.div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredAssets.map((asset, i) => {
              const TypeIcon = typeIcons[asset.type]
              return (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  className="group relative aspect-square bg-zinc-900/50 backdrop-blur-lg border border-zinc-800/50 rounded-2xl overflow-hidden cursor-pointer hover:border-violet-500/30 transition-all duration-300"
                  onClick={() => setSelectedAsset(asset)}
                >
                  {asset.type === 'video' ? (
                    <video
                      src={asset.file_url}
                      className="w-full h-full object-cover"
                      muted
                      onMouseOver={(e) =>
                        (e.target as HTMLVideoElement).play()
                      }
                      onMouseOut={(e) => {
                        const v = e.target as HTMLVideoElement
                        v.pause()
                        v.currentTime = 0
                      }}
                    />
                  ) : (
                    <Image
                      src={asset.thumbnail_url || asset.file_url}
                      alt={asset.prompt || 'Asset'}
                      fill
                      className="object-cover"
                    />
                  )}
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-gradient-to-r ${typeColors[asset.type]} text-white`}
                        >
                          <TypeIcon className="w-3 h-3" />
                          {asset.type}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 line-clamp-2">
                        {asset.prompt || 'No prompt'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      ) : (
        /* List View */
        <div className="space-y-2">
          {filteredAssets.map((asset, i) => {
            const TypeIcon = typeIcons[asset.type]
            return (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 hover:border-violet-500/30 transition-all cursor-pointer"
                onClick={() => setSelectedAsset(asset)}
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0 relative">
                  {asset.type === 'video' ? (
                    <video
                      src={asset.file_url}
                      className="w-full h-full object-cover"
                      muted
                    />
                  ) : (
                    <Image
                      src={asset.thumbnail_url || asset.file_url}
                      alt={asset.prompt || 'Asset'}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">
                    {asset.prompt || 'Untitled'}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-zinc-500">
                      <TypeIcon className="w-3 h-3" />
                      {asset.type}
                    </span>
                    <span className="text-xs text-zinc-600">
                      {new Date(asset.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      downloadAsset(
                        asset.file_url,
                        `forge-${asset.type}-${asset.id}`
                      )
                    }}
                    className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteAsset(asset.id)
                    }}
                    className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Asset Detail Modal */}
      <AnimatePresence>
        {selectedAsset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedAsset(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Preview */}
              <div className="relative aspect-video bg-zinc-950 rounded-t-2xl overflow-hidden">
                {selectedAsset.type === 'video' ? (
                  <video
                    src={selectedAsset.file_url}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Image
                    src={selectedAsset.file_url}
                    alt={selectedAsset.prompt || 'Asset'}
                    fill
                    className="object-contain"
                  />
                )}
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="absolute top-4 right-4 p-2 bg-black/50 rounded-lg hover:bg-black/70 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Details */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium bg-gradient-to-r ${typeColors[selectedAsset.type]} text-white`}
                  >
                    {selectedAsset.type}
                  </span>
                  <span className="text-sm text-zinc-500">
                    {new Date(selectedAsset.created_at).toLocaleString()}
                  </span>
                </div>

                {selectedAsset.prompt && (
                  <div className="mb-4">
                    <p className="text-sm text-zinc-400 mb-1">Prompt</p>
                    <p className="text-white bg-zinc-800/50 rounded-xl p-4 text-sm">
                      {selectedAsset.prompt}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      downloadAsset(
                        selectedAsset.file_url,
                        `forge-${selectedAsset.type}-${selectedAsset.id}`
                      )
                    }
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl text-white text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </motion.button>
                  <button
                    onClick={() => {
                      setShowMoveModal(true)
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 rounded-xl text-zinc-300 text-sm font-medium hover:bg-zinc-700 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Move
                  </button>
                  <Link
                    href={`/editor?assetId=${selectedAsset.id}&type=${selectedAsset.type}&url=${encodeURIComponent(selectedAsset.file_url)}`}
                    className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 rounded-xl text-zinc-300 text-sm font-medium hover:bg-zinc-700 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Edit
                  </Link>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedAsset.file_url)
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 rounded-xl text-zinc-300 text-sm font-medium hover:bg-zinc-700 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Copy URL
                  </button>
                  <button
                    onClick={() => deleteAsset(selectedAsset.id)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 rounded-xl text-red-400 text-sm font-medium hover:bg-zinc-700 transition-colors ml-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Move to Project Modal */}
      <AnimatePresence>
        {showMoveModal && selectedAsset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]"
            onClick={() => setShowMoveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-white mb-4">
                Move to Project
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => setMoveTarget(project.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                      moveTarget === project.id
                        ? 'bg-violet-500/20 border border-violet-500/30 text-violet-300'
                        : 'bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 hover:bg-zinc-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FolderOpen className="w-4 h-4" />
                      {project.name}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowMoveModal(false)}
                  className="flex-1 py-2.5 bg-zinc-800 rounded-xl text-zinc-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (moveTarget) moveAsset(selectedAsset.id, moveTarget)
                  }}
                  disabled={!moveTarget}
                  className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl text-white font-medium disabled:opacity-50"
                >
                  Move
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
