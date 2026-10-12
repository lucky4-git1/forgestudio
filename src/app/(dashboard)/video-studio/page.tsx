"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Film,
  FileVideo,
  Sparkles,
  ArrowRight,
  Play,
  Clock,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const features = [
  {
    title: "Text to Video",
    description: "Generate stunning videos from text prompts using AI",
    icon: Film,
    gradient: "from-emerald-600 to-teal-500",
    href: "/video-studio/text-to-video",
    credits: 15,
  },
  {
    title: "Image to Video",
    description: "Animate any image with AI-powered motion synthesis",
    icon: FileVideo,
    gradient: "from-sky-600 to-blue-500",
    href: "/video-studio/image-to-video",
    credits: 10,
  },
  {
    title: "Logo Animation",
    description: "Create premium animated intros for your brand",
    icon: Sparkles,
    gradient: "from-amber-500 to-orange-500",
    href: "/video-studio/logo-animation",
    credits: 8,
  },
] as const;

// Removed hardcoded mockups

/* ------------------------------------------------------------------ */
/*  Animations                                                         */
/* ------------------------------------------------------------------ */

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function VideoStudioPage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [recentVideos, setRecentVideos] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAssets() {
      try {
        const res = await fetch('/api/assets?type=video');
        if (res.ok) {
          const data = await res.json();
          setRecentVideos((data.assets || []).slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to fetch video assets', err);
      }
    }
    fetchAssets();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* ── Header ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
            Video Studio
          </h1>
          <p className="mt-2 text-base text-zinc-400">
            Bring your content to life
          </p>
        </motion.div>

        {/* ── Feature cards ─────────────────────────────────────── */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} variants={item}>
                <Link
                  href={feature.href}
                  onMouseEnter={() => setHoveredCard(idx)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="group relative block overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-lg transition-colors hover:border-zinc-700/70"
                >
                  {/* gradient glow */}
                  <div
                    className={cn(
                      "pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br opacity-10 blur-3xl transition-opacity group-hover:opacity-25",
                      feature.gradient,
                    )}
                  />

                  <div
                    className={cn(
                      "mb-4 inline-flex rounded-xl bg-gradient-to-br p-3",
                      feature.gradient,
                    )}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  <h3 className="mb-1 text-lg font-semibold text-zinc-100">
                    {feature.title}
                  </h3>
                  <p className="mb-4 text-sm text-zinc-400">
                    {feature.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-zinc-800/80 px-2.5 py-0.5 text-xs font-medium text-zinc-300">
                      {feature.credits} credits
                    </span>

                    <span className="inline-flex items-center gap-1 text-sm font-medium text-zinc-400 transition-colors group-hover:text-zinc-100">
                      Create
                      <ArrowRight
                        className={cn(
                          "h-4 w-4 transition-transform",
                          hoveredCard === idx && "translate-x-0.5",
                        )}
                      />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Recent generations ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-14"
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-zinc-100">
              Recent Generations
            </h2>
            <button className="text-sm text-zinc-400 transition-colors hover:text-zinc-200">
              View all
            </button>
          </div>

          {recentVideos.length === 0 ? (
            <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30">
              <p className="text-sm text-zinc-500">
                No videos generated yet. Start creating!
              </p>
            </div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {recentVideos.map((video) => (
                <motion.div
                  key={video.id}
                  variants={item}
                  className="group relative overflow-hidden rounded-xl border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-lg"
                >
                  <div className="relative aspect-video bg-zinc-800/60 overflow-hidden">
                    {video.file_url ? (
                      <video src={video.file_url} className="w-full h-full object-cover" muted />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="rounded-full bg-zinc-700/60 p-2.5 backdrop-blur-sm transition-transform group-hover:scale-110">
                          <Play className="h-4 w-4 text-zinc-300" />
                        </div>
                      </div>
                    )}
                    <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-zinc-300 backdrop-blur-sm">
                      {video.type}
                    </span>
                  </div>

                  <div className="p-3">
                    <h4 className="truncate text-sm font-medium text-zinc-200">
                      {video.prompt || "Untitled"}
                    </h4>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                      <Clock className="h-3 w-3" />
                      {new Date(video.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
