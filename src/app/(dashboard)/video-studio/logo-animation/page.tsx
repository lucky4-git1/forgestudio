"use client";

import { useState, useRef, useCallback, type DragEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowLeft,
  Loader2,
  Download,
  FolderPlus,
  Upload,
  Play,
  AlertCircle,
  X,
  Eye,
  RotateCw,
  Zap,
  Crown,
  Minus,
  Bookmark,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types & Data                                                       */
/* ------------------------------------------------------------------ */

type Status = "idle" | "generating" | "complete" | "error";

interface Preset {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const presets: Preset[] = [
  { id: "reveal", name: "Reveal", description: "Elegant fade-in reveal", icon: Eye },
  { id: "rotation", name: "Rotation", description: "Smooth 3D rotation", icon: RotateCw },
  { id: "energy-burst", name: "Energy Burst", description: "Dynamic particle explosion", icon: Zap },
  { id: "premium-intro", name: "Premium Intro", description: "Cinematic brand entrance", icon: Crown },
  { id: "minimal-motion", name: "Minimal Motion", description: "Subtle, clean movement", icon: Minus },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function LogoAnimationPage() {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>("reveal");
  const [status, setStatus] = useState<Status>("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [generatedAsset, setGeneratedAsset] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /* ── File handling ──────────────────────────────────────────── */
  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragOver(false), []);

  const removeLogo = useCallback(() => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  /* ── Generate ───────────────────────────────────────────────── */
  const handleGenerate = useCallback(async () => {
    if (!logoFile) return;
    setStatus("generating");
    setErrorMsg(null);
    setVideoUrl(null);
    setGeneratedAsset(null);

    try {
      const formData = new FormData();
      formData.append("logo", logoFile);
      formData.append("preset", selectedPreset);

      const res = await fetch("/api/generate/logo-animation", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Generation failed");
      }

      const data = await res.json();
      setVideoUrl(data.videoUrl ?? data.url ?? "");
      setGeneratedAsset(data.asset);
      setStatus("complete");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }, [logoFile, selectedPreset]);

  /* ── Download ───────────────────────────────────────────────── */
  const handleDownload = useCallback(() => {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = "forge-logo-animation.mp4";
    a.click();
  }, [videoUrl]);

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* ── Header ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/video-studio"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Video Studio
          </Link>
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-2.5">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-50">
                Logo Animation
              </h1>
              <p className="text-sm text-zinc-400">
                Create premium animated intros for your brand
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Two-column layout ──────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          {/* ── Left panel ────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card flex flex-col gap-6 p-6"
          >
            {/* Upload zone */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Upload Logo
              </label>

              {!logoPreview ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-zinc-800/30 px-4 py-14 text-center transition-colors",
                    isDragOver
                      ? "border-violet-500 bg-violet-500/5"
                      : "border-zinc-700 hover:border-violet-500/60",
                  )}
                >
                  <div className="rounded-full bg-zinc-800/70 p-3">
                    <Upload className="h-5 w-5 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-300">
                      Drag & drop or click to upload
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      PNG, SVG, or WebP with transparency
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative flex items-center justify-center overflow-hidden rounded-xl border border-zinc-700/50 bg-zinc-800/30 p-6">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="max-h-32 max-w-full object-contain"
                  />
                  <button
                    onClick={removeLogo}
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-zinc-300 backdrop-blur-sm transition-colors hover:bg-black/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) processFile(f);
                }}
              />
            </div>

            {/* Animation presets */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Animation Preset
              </label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {presets.map((preset) => {
                  const Icon = preset.icon;
                  const isSelected = selectedPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedPreset(preset.id)}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border p-3 text-left transition-all",
                        isSelected
                          ? "border-violet-500/60 bg-violet-600/15 ring-1 ring-violet-500/30"
                          : "border-zinc-700/50 bg-zinc-800/40 hover:border-zinc-600 hover:bg-zinc-800/60",
                      )}
                    >
                      <div
                        className={cn(
                          "mt-0.5 rounded-lg p-1.5",
                          isSelected
                            ? "bg-violet-600/30 text-violet-300"
                            : "bg-zinc-700/50 text-zinc-400",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p
                          className={cn(
                            "text-sm font-medium",
                            isSelected ? "text-violet-200" : "text-zinc-300",
                          )}
                        >
                          {preset.name}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {preset.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generate */}
            <button
              onClick={handleGenerate}
              disabled={!logoFile || status === "generating"}
              className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-opacity disabled:opacity-50"
            >
              {status === "generating" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Animation
                </>
              )}
            </button>
          </motion.div>

          {/* ── Right panel ───────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card flex flex-col items-center justify-center p-6"
          >
            <AnimatePresence mode="wait">
              {/* idle */}
              {status === "idle" && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-3 py-20 text-center"
                >
                  <div className="rounded-full bg-zinc-800/60 p-4">
                    <Play className="h-8 w-8 text-zinc-600" />
                  </div>
                  <p className="text-sm text-zinc-500">
                    Upload your logo and choose a preset to generate
                  </p>
                </motion.div>
              )}

              {/* generating */}
              {status === "generating" && (
                <motion.div
                  key="generating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex w-full flex-col items-center gap-4 py-10"
                >
                  <div className="aspect-video w-full animate-pulse rounded-xl bg-zinc-800/60" />
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating your logo animation…
                  </div>
                </motion.div>
              )}

              {/* complete */}
              {status === "complete" && videoUrl && (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full"
                >
                  <video
                    src={videoUrl}
                    controls
                    loop
                    className="aspect-video w-full rounded-xl bg-black"
                  />
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center gap-2 rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700/50"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                    {generatedAsset && (
                      <Link
                        href={`/editor?assetId=${generatedAsset.id}&type=${generatedAsset.type}&url=${encodeURIComponent(generatedAsset.file_url)}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700/50"
                      >
                        <Wand2 className="h-4 w-4" />
                        Iterate
                      </Link>
                    )}
                    <button className="inline-flex items-center gap-2 rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700/50">
                      <FolderPlus className="h-4 w-4" />
                      Save to Project
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700/50">
                      <Bookmark className="h-4 w-4" />
                      Save to Brand Kit
                    </button>
                  </div>
                </motion.div>
              )}

              {/* error */}
              {status === "error" && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-3 py-16 text-center"
                >
                  <div className="rounded-full bg-red-900/30 p-3">
                    <AlertCircle className="h-6 w-6 text-red-400" />
                  </div>
                  <p className="text-sm text-red-400">
                    {errorMsg ?? "Something went wrong"}
                  </p>
                  <button
                    onClick={handleGenerate}
                    className="mt-2 rounded-lg bg-zinc-800/60 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-700/60"
                  >
                    Try again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
