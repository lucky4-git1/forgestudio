"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ImagePlus,
  ArrowLeft,
  Download,
  FolderPlus,
  Copy,
  Loader2,
  Sparkles,
  RectangleHorizontal,
  RectangleVertical,
  Square,
  ChevronDown,
  Coins,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const aspectRatios = [
  { id: "1:1", label: "Square", sublabel: "1:1", icon: Square },
  { id: "9:16", label: "Portrait", sublabel: "9:16", icon: RectangleVertical },
  {
    id: "16:9",
    label: "Landscape",
    sublabel: "16:9",
    icon: RectangleHorizontal,
  },
];

const styles = [
  "Photorealistic",
  "Digital Art",
  "Illustration",
  "3D Render",
  "Anime",
];

export default function TextToImagePage() {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [style, setStyle] = useState("Photorealistic");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedAsset, setGeneratedAsset] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);
    setGeneratedAsset(null);

    try {
      const res = await fetch("/api/generate/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspectRatio, style }),
      });

      if (!res.ok) {
        throw new Error("Generation failed. Please try again.");
      }

      const data = await res.json();
      setGeneratedImage(data.imageUrl || "/placeholder-generated.png");
      setGeneratedAsset(data.asset);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, aspectRatio, style]);

  const handleDownload = useCallback(() => {
    if (!generatedImage) return;
    const a = document.createElement("a");
    a.href = generatedImage;
    a.download = "forge-image.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [generatedImage]);

  const aspectClass =
    aspectRatio === "1:1"
      ? "aspect-square"
      : aspectRatio === "9:16"
        ? "aspect-[9/16] max-h-[520px]"
        : "aspect-video";

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link
            href="/image-studio"
            className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Image Studio
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-600">
              <ImagePlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Text to Image</h1>
              <p className="text-sm text-zinc-400">
                Describe your vision and watch it come to life
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Content - Two Panels */}
        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          {/* Left Panel - Controls */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card space-y-6 p-6"
          >
            {/* Prompt */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A majestic mountain landscape with aurora borealis, cinematic lighting..."
                rows={5}
                className="w-full resize-none rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-3 text-sm text-white placeholder-zinc-500 transition-all focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              />
              <p className="mt-1.5 text-xs text-zinc-500">
                Be descriptive for best results
              </p>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-3 gap-2">
                {aspectRatios.map((ratio) => {
                  const Icon = ratio.icon;
                  return (
                    <button
                      key={ratio.id}
                      onClick={() => setAspectRatio(ratio.id)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-medium transition-all",
                        aspectRatio === ratio.id
                          ? "border-violet-500/50 bg-violet-500/10 text-violet-300"
                          : "border-zinc-700/50 bg-zinc-800/30 text-zinc-400 hover:border-zinc-600/50 hover:text-zinc-300"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{ratio.label}</span>
                      <span className="text-[10px] opacity-60">
                        {ratio.sublabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Style */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Style
              </label>
              <div className="flex flex-wrap gap-2">
                {styles.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                      style === s
                        ? "border-violet-500/50 bg-violet-500/10 text-violet-300"
                        : "border-zinc-700/50 bg-zinc-800/30 text-zinc-400 hover:border-zinc-600/50 hover:text-zinc-300"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className={cn(
                "relative w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all",
                isGenerating || !prompt.trim()
                  ? "cursor-not-allowed opacity-60"
                  : "hover:shadow-xl hover:shadow-violet-500/30"
              )}
            >
              <span className="flex items-center justify-center gap-2">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Image
                  </>
                )}
              </span>
            </motion.button>
          </motion.div>

          {/* Right Panel - Preview */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card flex flex-col items-center justify-center p-8"
          >
            <AnimatePresence mode="wait">
              {isGenerating ? (
                /* Loading State */
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "w-full max-w-lg overflow-hidden rounded-2xl",
                    aspectClass
                  )}
                >
                  <div className="relative h-full w-full animate-pulse bg-zinc-800/60">
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
                      <p className="text-sm text-zinc-400">
                        Creating your masterpiece...
                      </p>
                    </div>
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                  </div>
                </motion.div>
              ) : generatedImage ? (
                /* Generated Image */
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full max-w-lg"
                >
                  <div
                    className={cn(
                      "overflow-hidden rounded-2xl border border-zinc-700/50 bg-zinc-800/40",
                      aspectClass
                    )}
                  >
                    <img
                      src={generatedImage}
                      alt="Generated"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <motion.button
                      onClick={handleDownload}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center gap-2 rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700/50 hover:text-white"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </motion.button>

                    {generatedAsset && (
                      <Link
                        href={`/editor?assetId=${generatedAsset.id}&type=${generatedAsset.type}&url=${encodeURIComponent(generatedAsset.file_url)}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700/50 hover:text-white"
                      >
                        <Wand2 className="h-4 w-4" />
                        Iterate
                      </Link>
                    )}

                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          setShowProjectDropdown(!showProjectDropdown)
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700/50 hover:text-white"
                      >
                        <FolderPlus className="h-4 w-4" />
                        Save to Project
                        <ChevronDown className="h-3 w-3" />
                      </motion.button>

                      {/* Project Selector Dropdown */}
                      <AnimatePresence>
                        {showProjectDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            className="absolute left-0 top-full z-10 mt-2 w-56 overflow-hidden rounded-xl border border-zinc-700/50 bg-zinc-900 shadow-xl backdrop-blur-lg"
                          >
                            {[
                              "Brand Campaign Q3",
                              "Product Launch",
                              "Social Media Pack",
                              "Website Redesign",
                            ].map((project) => (
                              <button
                                key={project}
                                onClick={() => setShowProjectDropdown(false)}
                                className="w-full px-4 py-2.5 text-left text-sm text-zinc-300 transition-colors hover:bg-zinc-800/80 hover:text-white"
                              >
                                {project}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center gap-2 rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700/50 hover:text-white"
                    >
                      <Copy className="h-4 w-4" />
                      Duplicate
                    </motion.button>
                  </div>
                </motion.div>
              ) : error ? (
                /* Error State */
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                    <ImagePlus className="h-6 w-6 text-red-400" />
                  </div>
                  <p className="text-sm text-red-400">{error}</p>
                  <button
                    onClick={handleGenerate}
                    className="mt-3 text-sm font-medium text-violet-400 hover:text-violet-300"
                  >
                    Try again
                  </button>
                </motion.div>
              ) : (
                /* Empty State */
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800/60">
                    <ImagePlus className="h-8 w-8 text-zinc-600" />
                  </div>
                  <h3 className="mb-1 text-lg font-medium text-zinc-300">
                    Your creation awaits
                  </h3>
                  <p className="text-sm text-zinc-500">
                    Enter a prompt and click Generate to create an image
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
