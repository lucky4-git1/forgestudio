"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Film,
  ArrowLeft,
  Loader2,
  Download,
  FolderPlus,
  Play,
  AlertCircle,
  Sparkles,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Status = "idle" | "generating" | "complete" | "error";
type Duration = "3s" | "5s" | "10s";

const durations: { value: Duration; label: string }[] = [
  { value: "3s", label: "3s" },
  { value: "5s", label: "5s" },
  { value: "10s", label: "10s" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function TextToVideoPage() {
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState<Duration>("5s");
  const [status, setStatus] = useState<Status>("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [generatedAsset, setGeneratedAsset] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  /* ── Generate handler ───────────────────────────────────────── */
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;
    setStatus("generating");
    setErrorMsg(null);
    setVideoUrl(null);
    setGeneratedAsset(null);

    try {
      const res = await fetch("/api/generate/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, duration }),
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
  }, [prompt, duration]);

  /* ── Download handler ───────────────────────────────────────── */
  const handleDownload = useCallback(() => {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = "forge-video.mp4";
    a.click();
  }, [videoUrl]);

  /* ── UI ─────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* ── Back link + header ─────────────────────────────── */}
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
            <div className="inline-flex rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 p-2.5">
              <Film className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-50">
                Text to Video
              </h1>
              <p className="text-sm text-zinc-400">
                Describe your scene and let AI bring it to life
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
            {/* Prompt */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A cinematic shot of a golden retriever running through a field of wildflowers at sunset…"
                rows={5}
                className="w-full resize-none rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-shadow focus:ring-2 focus:ring-violet-500/50"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Duration
              </label>
              <div className="flex gap-2">
                {durations.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDuration(d.value)}
                    className={cn(
                      "rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                      duration === d.value
                        ? "border-violet-500/60 bg-violet-600/20 text-violet-300"
                        : "border-zinc-700/50 bg-zinc-800/40 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300",
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || status === "generating"}
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
                  Generate Video
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
                    Your generated video will appear here
                  </p>
                </motion.div>
              )}

              {/* generating skeleton */}
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
                    Generating your video…
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
                    ref={videoRef}
                    src={videoUrl}
                    controls
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
