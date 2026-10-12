'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  FolderOpen,
  Sparkles,
  Coins,
  ImageIcon,
  ArrowRight,
  Video,
  PenTool,
  Wand2,
} from 'lucide-react'
import { Topbar } from '@/components/layout/topbar'
import { cn } from '@/lib/utils'

/* ---------- types ---------- */

interface Stats {
  imagesGenerated: number
  videosGenerated: number
  storageUsed: string
  generationTime: string
}

interface Generation {
  id: string
  thumbnail_url: string
  prompt: string
  type: string
  created_at: string
}

/* ---------- animation helpers ---------- */

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}

/* ---------- stat cards config ---------- */

const statConfig = [
  {
    key: 'imagesGenerated' as const,
    label: 'Images Generated',
    icon: ImageIcon,
    gradient: 'from-violet-600 to-purple-600',
    ring: 'ring-violet-500/20',
  },
  {
    key: 'videosGenerated' as const,
    label: 'Videos Generated',
    icon: Video,
    gradient: 'from-sky-600 to-blue-600',
    ring: 'ring-sky-500/20',
  },
  {
    key: 'storageUsed' as const,
    label: 'Storage Used',
    icon: FolderOpen,
    gradient: 'from-amber-600 to-orange-600',
    ring: 'ring-amber-500/20',
  },
  {
    key: 'generationTime' as const,
    label: 'Generation Time',
    icon: Sparkles,
    gradient: 'from-emerald-600 to-teal-600',
    ring: 'ring-emerald-500/20',
  },
]

/* ---------- quick actions config ---------- */

const quickActions = [
  {
    label: 'Generate Image',
    description: 'Create stunning AI images from text prompts',
    href: '/image-studio/text-to-image',
    icon: ImageIcon,
    gradient: 'from-violet-600 to-purple-700',
    hoverGradient: 'hover:from-violet-500 hover:to-purple-600',
  },
  {
    label: 'Create Logo',
    description: 'Design professional logos with AI assistance',
    href: '/image-studio/logo',
    icon: PenTool,
    gradient: 'from-blue-600 to-cyan-700',
    hoverGradient: 'hover:from-blue-500 hover:to-cyan-600',
  },
  {
    label: 'Make Video',
    description: 'Generate cinematic videos from prompts',
    href: '/video-studio/text-to-video',
    icon: Video,
    gradient: 'from-emerald-600 to-teal-700',
    hoverGradient: 'hover:from-emerald-500 hover:to-teal-600',
  },
  {
    label: 'Animate Logo',
    description: 'Bring your logos to life with motion',
    href: '/video-studio/logo-animation',
    icon: Wand2,
    gradient: 'from-amber-600 to-orange-700',
    hoverGradient: 'hover:from-amber-500 hover:to-orange-600',
  },
]

/* ---------- skeleton components ---------- */

function StatCardSkeleton() {
  return (
    <div className="glass-card p-5 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-11 w-11 rounded-xl bg-zinc-800" />
        <div className="space-y-2">
          <div className="h-6 w-16 rounded bg-zinc-800" />
          <div className="h-3 w-24 rounded bg-zinc-800/60" />
        </div>
      </div>
    </div>
  )
}

function GenerationSkeleton() {
  return (
    <div className="glass-card overflow-hidden animate-pulse">
      <div className="aspect-square bg-zinc-800" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-full rounded bg-zinc-800" />
        <div className="h-3 w-2/3 rounded bg-zinc-800/60" />
      </div>
    </div>
  )
}

/* ---------- dashboard page ---------- */

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [generations, setGenerations] = useState<Generation[]>([])
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [userRes, projectsRes, generationsRes] = await Promise.allSettled(
          [
            fetch('/api/user'),
            fetch('/api/projects'),
            fetch('/api/generations'),
          ]
        )

        if (userRes.status === 'fulfilled' && userRes.value.ok) {
          const userData = await userRes.value.json()
          setUserName(userData.name || userData.email?.split('@')[0] || 'User')
        }

        if (
          generationsRes.status === 'fulfilled' &&
          generationsRes.value.ok
        ) {
          const genData = await generationsRes.value.json()
          setGenerations(genData.items?.slice(0, 8) ?? [])
          
          const items = genData.items || [];
          const images = items.filter((g: any) => g.type === 'image' || g.type === 'logo' || g.generation_type?.includes('image') || g.generation_type === 'logo').length;
          const videos = items.filter((g: any) => g.type === 'video' || g.generation_type?.includes('video') || g.generation_type === 'logo-animation').length;
          
          setStats({
            imagesGenerated: images,
            videosGenerated: videos,
            storageUsed: `${((images * 4.2) + (videos * 15.5)).toFixed(1)} MB`,
            generationTime: `${((images * 8) + (videos * 45))}s`,
          })
        }
      } catch {
        // APIs may not exist yet — show defaults
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Fallback stats while APIs are not yet wired
  const displayStats: Stats = stats ?? {
    imagesGenerated: 0,
    videosGenerated: 0,
    storageUsed: '0 MB',
    generationTime: '0s',
  }

  return (
    <>
      <Topbar title="Dashboard" />
      <div className="p-6 lg:p-8 space-y-10">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-zinc-100">
            Welcome back
            {userName ? `, ${userName}` : ''}
            <span className="inline-block ml-2 animate-[wave_2s_ease-in-out_infinite]">
              👋
            </span>
          </h1>
          <p className="mt-1.5 text-zinc-500 text-sm">
            Here&apos;s an overview of your creative workspace.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
        >
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <StatCardSkeleton key={i} />
              ))
            : statConfig.map((s) => (
                <motion.div key={s.key} variants={cardVariants}>
                  <div className="glass-card p-5 group hover:border-zinc-700/60 transition-colors duration-300">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'h-11 w-11 rounded-xl bg-gradient-to-br flex items-center justify-center ring-1',
                          s.gradient,
                          s.ring
                        )}
                      >
                        <s.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-zinc-100">
                          {typeof displayStats[s.key] === 'number' ? displayStats[s.key].toLocaleString() : displayStats[s.key]}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {s.label}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
        </motion.div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">
            Quick Actions
          </h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
          >
            {quickActions.map((action) => (
              <motion.div key={action.label} variants={cardVariants}>
                <Link href={action.href} className="block group">
                  <div
                    className={cn(
                      'relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br transition-all duration-300 shadow-lg',
                      action.gradient,
                      action.hoverGradient,
                      'hover:shadow-xl hover:scale-[1.02]'
                    )}
                  >
                    {/* Subtle glow overlay */}
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <action.icon className="h-8 w-8 text-white/90 mb-4" />
                    <h3 className="text-base font-semibold text-white mb-1">
                      {action.label}
                    </h3>
                    <p className="text-sm text-white/70 mb-4 leading-relaxed">
                      {action.description}
                    </p>
                    <div className="flex items-center gap-1 text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                      Get started
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Recent Generations */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-100">
              Recent Generations
            </h2>
            <Link
              href="/assets"
              className="text-sm text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <GenerationSkeleton key={i} />
              ))}
            </div>
          ) : generations.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {generations.map((gen) => (
                <motion.div key={gen.id} variants={cardVariants}>
                  <div className="glass-card overflow-hidden group cursor-pointer hover:border-zinc-700/60 transition-colors duration-300">
                    <div className="aspect-square relative overflow-hidden">
                      {gen.type === 'video' ? (
                        <video
                          src={gen.thumbnail_url}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          muted
                          playsInline
                        />
                      ) : (
                        <img
                          src={gen.thumbnail_url}
                          alt={gen.prompt}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-[10px] font-medium text-zinc-300 uppercase tracking-wider">
                        {gen.type}
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {gen.prompt}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="glass-card p-12 text-center">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-zinc-800/80 flex items-center justify-center mb-4">
                <Sparkles className="h-7 w-7 text-zinc-600" />
              </div>
              <h3 className="text-sm font-medium text-zinc-300 mb-1">
                No generations yet
              </h3>
              <p className="text-xs text-zinc-500 mb-5 max-w-xs mx-auto">
                Start creating with AI — generate your first image, logo, or
                video using the quick actions above.
              </p>
              <Link
                href="/image-studio/text-to-image"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-medium text-white transition-colors duration-200"
              >
                <Sparkles className="h-4 w-4" />
                Create your first generation
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
