'use client'

import { motion } from 'framer-motion'
import { Bell, Coins, ChevronDown, User } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface TopbarProps {
  title: string
  user?: {
    name: string
    email: string
    avatar_url: string | null
  }
}

export function Topbar({ title, user }: TopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initials = user
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' as const }}
      className="sticky top-0 z-30 w-full border-b border-zinc-800/50 bg-zinc-950/60 backdrop-blur-xl"
    >
      <div className="flex h-16 items-center justify-between px-6 lg:px-8">
        {/* Page Title — left-padded on mobile to avoid hamburger overlap */}
        <h2 className="text-lg font-semibold text-zinc-100 pl-12 lg:pl-0">
          {title}
        </h2>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <button className="relative p-2.5 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors duration-200">
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-violet-500 ring-2 ring-zinc-950" />
          </button>

          {/* User Avatar Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-zinc-800/50 transition-colors duration-200"
            >
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-zinc-800"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center ring-2 ring-zinc-800">
                  <span className="text-xs font-semibold text-white">
                    {initials}
                  </span>
                </div>
              )}
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 text-zinc-500 transition-transform duration-200',
                  dropdownOpen && 'rotate-180'
                )}
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-zinc-800/50 bg-zinc-900/95 backdrop-blur-xl shadow-2xl shadow-black/40 py-1.5"
              >
                {user && (
                  <div className="px-3.5 py-2.5 border-b border-zinc-800/50">
                    <p className="text-sm font-medium text-zinc-200 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">
                      {user.email}
                    </p>
                  </div>
                )}
                <div className="py-1">
                  <a
                    href="/settings"
                    className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Profile & Settings
                  </a>
                </div>
                <div className="border-t border-zinc-800/50 py-1">
                  <form action="/login/actions" method="post">
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-zinc-800/50 transition-colors"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  )
}
