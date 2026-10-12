'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { useState } from 'react'
import {
  LayoutDashboard,
  ImageIcon,
  Video,
  FolderOpen,
  Library,
  Palette,
  Settings,
  Menu,
  X,
  DownloadCloud,
  Box,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarUser {
  name: string
  email: string
  avatar_url: string | null
}

interface SidebarProps {
  user: SidebarUser
}

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Image Studio', href: '/image-studio', icon: ImageIcon },
  { label: 'Video Studio', href: '/video-studio', icon: Video },
  { label: 'Projects', href: '/projects', icon: FolderOpen },
  { label: 'Asset Library', href: '/assets', icon: Library },
  { label: 'Brand Kits', href: '/brand-kits', icon: Palette },
  { label: 'Model Manager', href: '/model-manager', icon: Box },
  { label: 'AI Analytics', href: '/ai-manager', icon: BarChart3 },
  { label: 'Local AI Setup', href: '/ai-setup', icon: DownloadCloud },
  { label: 'Settings', href: '/settings', icon: Settings },
]

const sidebarVariants: Variants = {
  hidden: { x: -280, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
}

const navItemVariants: Variants = {
  hidden: { x: -20, opacity: 0 },
  visible: (i: number) => ({
    x: 0,
    opacity: 1,
    transition: { delay: 0.05 * i, duration: 0.3, ease: 'easeOut' as const },
  }),
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-6 pt-8 pb-6">
        <Link href="/dashboard" className="block">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
            Forge Studio
          </h1>
          <p className="text-xs text-zinc-500 mt-1 tracking-wide">
            AI-Powered Creative Engine
          </p>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-6 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item, i) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <motion.div
              key={item.href}
              custom={i}
              variants={navItemVariants}
              initial="hidden"
              animate="visible"
            >
              <Link
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-violet-500/10 text-violet-400'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                )}
              >
                <item.icon
                  className={cn(
                    'h-[18px] w-[18px] shrink-0 transition-colors duration-200',
                    isActive
                      ? 'text-violet-400'
                      : 'text-zinc-500 group-hover:text-zinc-300'
                  )}
                />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400"
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  />
                )}
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="mx-6 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

      {/* User Section */}
      <div className="px-4 py-5">
        <div className="flex items-center gap-3">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name}
              className="h-9 w-9 rounded-full object-cover ring-2 ring-zinc-800"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center ring-2 ring-zinc-800">
              <span className="text-xs font-semibold text-white">
                {initials}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-200 truncate">
              {user.name}
            </p>
            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
        className="fixed inset-y-0 left-0 z-40 hidden lg:flex w-[280px] flex-col bg-zinc-950 border-r border-zinc-800/50"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-xl bg-zinc-900/80 backdrop-blur-md border border-zinc-800/50 text-zinc-400 hover:text-zinc-200 transition-colors"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col bg-zinc-950 border-r border-zinc-800/50 lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
