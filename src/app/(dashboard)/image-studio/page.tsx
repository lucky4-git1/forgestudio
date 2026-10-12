"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ImagePlus,
  Hexagon,
  Megaphone,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    title: "Text to Image",
    description:
      "Transform your words into stunning visuals with state-of-the-art AI models.",
    icon: ImagePlus,
    gradient: "from-violet-600 to-purple-600",
    glowColor: "violet",
    href: "/image-studio/text-to-image",
    credits: 1,
  },
  {
    title: "Logo Generator",
    description:
      "Create professional brand logos instantly. Perfect for startups and rebrands.",
    icon: Hexagon,
    gradient: "from-blue-600 to-cyan-500",
    glowColor: "blue",
    href: "/image-studio/logo",
    credits: 2,
  },
  {
    title: "Marketing Creative",
    description:
      "Generate scroll-stopping ad creatives, banners, and social media assets.",
    icon: Megaphone,
    gradient: "from-rose-600 to-orange-500",
    glowColor: "rose",
    href: "/image-studio/marketing",
    credits: 2,
  },
];

// Removed hardcoded mockups

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export default function ImageStudioPage() {
  const [recentGenerations, setRecentGenerations] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAssets() {
      try {
        const res = await fetch('/api/assets');
        if (res.ok) {
          const data = await res.json();
          const filtered = (data.assets || [])
            .filter((a: any) => a.type === 'image' || a.type === 'logo' || a.type === 'marketing')
            .slice(0, 4);
          setRecentGenerations(filtered);
        }
      } catch (err) {
        console.error('Failed to fetch assets', err);
      }
    }
    fetchAssets();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" as const }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Image Studio
            </h1>
          </div>
          <p className="text-lg text-zinc-400 ml-[52px]">
            Create stunning visuals with AI
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:grid-cols-3 mb-16"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} variants={itemVariants}>
                <Link href={feature.href} className="group block h-full">
                  <div className="glass-card relative h-full overflow-hidden p-8 transition-all duration-300 hover:border-zinc-700/80 hover:shadow-2xl">
                    {/* Gradient glow behind icon */}
                    <div
                      className={`absolute -top-12 -right-12 h-40 w-40 rounded-full bg-gradient-to-br ${feature.gradient} opacity-10 blur-3xl transition-opacity duration-500 group-hover:opacity-25`}
                    />

                    {/* Icon */}
                    <div
                      className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg`}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="mb-2 text-xl font-semibold text-white">
                      {feature.title}
                    </h3>
                    <p className="mb-6 text-sm leading-relaxed text-zinc-400">
                      {feature.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center rounded-full bg-zinc-800/80 px-3 py-1 text-xs font-medium text-zinc-300">
                        {feature.credits}{" "}
                        {feature.credits === 1 ? "credit" : "credits"}
                      </span>
                      <span className="flex items-center gap-1 text-sm font-medium text-zinc-400 transition-colors group-hover:text-white">
                        Create
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Recent Generations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Recent Generations
            </h2>
            <button className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">
              View all
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recentGenerations.length === 0 ? (
              <div className="col-span-full flex h-48 items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30">
                <p className="text-sm text-zinc-500">
                  No images generated yet. Start creating!
                </p>
              </div>
            ) : (
              recentGenerations.map((gen, i) => (
                <motion.div
                  key={gen.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + i * 0.08 }}
                  className="group glass-card cursor-pointer overflow-hidden transition-all duration-300 hover:border-zinc-700/80"
                >
                  {/* image area */}
                  <div className="relative aspect-square bg-zinc-800/60 overflow-hidden">
                    {gen.file_url ? (
                      <img src={gen.file_url} alt={gen.prompt || 'Generated'} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImagePlus className="h-8 w-8 text-zinc-600" />
                      </div>
                    )}
                    {/* Type badge */}
                    <div className="absolute left-3 top-3">
                      <span className="rounded-md bg-zinc-900/80 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-zinc-400 backdrop-blur-sm">
                        {gen.type}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <p className="mb-2 text-sm font-medium text-zinc-200 line-clamp-1">
                      {gen.prompt || 'Untitled'}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <Clock className="h-3 w-3" />
                      {new Date(gen.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
