'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Sparkles,
  ArrowRight,
  ImageIcon,
  Video,
  Palette,
  Cpu,
  Layers,
  Zap,
} from 'lucide-react'

const features = [
  {
    icon: ImageIcon,
    title: 'Text & Marketing Images',
    desc: 'Generate photorealistic concepts, brand banners, and social assets instantly.',
  },
  {
    icon: Video,
    title: 'Cinematic AI Video',
    desc: 'Turn prompts and stills into fluid, high-resolution motion video clips.',
  },
  {
    icon: Palette,
    title: 'Brand Identity Kits',
    desc: 'Lock in official typography, color palettes, and logos across every render.',
  },
  {
    icon: Cpu,
    title: 'Multi-Engine AI Routing',
    desc: 'Seamlessly harness Hugging Face, Fal, NVIDIA, and local ComfyUI nodes.',
  },
]

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-white selection:bg-violet-500/30 selection:text-violet-200">
      {/* Background glowing meshes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-mesh-1 absolute -left-1/4 -top-1/4 h-[650px] w-[650px] rounded-full bg-violet-600/15 blur-[140px]" />
        <div className="animate-mesh-2 absolute -right-1/4 top-1/4 h-[550px] w-[550px] rounded-full bg-purple-600/15 blur-[140px]" />
        <div className="animate-mesh-3 absolute -bottom-1/4 left-1/3 h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[130px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* Navigation bar */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 shadow-lg shadow-violet-500/10">
            <Sparkles className="h-5 w-5 text-violet-400" />
          </div>
          <span className="bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-xl font-bold tracking-tight text-transparent">
            Forge Studio
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-all hover:bg-violet-500 hover:shadow-violet-600/30 active:scale-95"
          >
            <span>Open Studio</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-24 sm:pt-24 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3.5 py-1 text-xs font-medium text-violet-300">
            <Zap className="h-3.5 w-3.5 text-violet-400" />
            <span>Next-Generation AI Creative Studio</span>
          </div>

          <h1 className="bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-6xl">
            Create Stunning Images & Videos at Light Speed
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-zinc-400 sm:text-xl">
            Forge Studio unifies state-of-the-art text-to-image, video generation, and brand assets
            into a fast, intuitive studio environment tailored for creators and teams.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-violet-600/25 transition-all hover:from-violet-500 hover:to-purple-500 hover:shadow-violet-600/35 active:scale-95"
            >
              <span>Launch Studio</span>
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              href="/image-studio"
              className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-6 py-3.5 text-base font-medium text-zinc-300 backdrop-blur-md transition-all hover:border-zinc-700 hover:bg-zinc-800/80 hover:text-white"
            >
              <ImageIcon className="h-5 w-5 text-violet-400" />
              <span>Image Studio</span>
            </Link>

            <Link
              href="/video-studio"
              className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-6 py-3.5 text-base font-medium text-zinc-300 backdrop-blur-md transition-all hover:border-zinc-700 hover:bg-zinc-800/80 hover:text-white"
            >
              <Video className="h-5 w-5 text-purple-400" />
              <span>Video Studio</span>
            </Link>
          </div>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="mt-24 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
              className="group relative rounded-2xl border border-zinc-800/70 bg-zinc-900/40 p-6 backdrop-blur-md transition-all hover:border-violet-500/30 hover:bg-zinc-900/70 hover:shadow-xl hover:shadow-violet-500/5"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-800/50 text-violet-400 transition-colors group-hover:border-violet-500/30 group-hover:bg-violet-500/10">
                <feat.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-white">{feat.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800/50 py-8 text-center text-xs text-zinc-500">
        <p>© Forge Studio. Built for AI-first creative workflows.</p>
      </footer>
    </div>
  )
}
