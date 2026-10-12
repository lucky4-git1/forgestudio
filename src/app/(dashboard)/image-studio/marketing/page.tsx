"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone,
  ArrowLeft,
  Download,
  FolderPlus,
  Loader2,
  Sparkles,
  ChevronDown,
  Coins,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const goals = [
  "Brand Awareness",
  "Sales",
  "Engagement",
  "Launch",
  "Promotion",
];

const formats = [
  {
    id: "social-post",
    label: "Social Post",
    sublabel: "1080×1080",
    aspect: "aspect-square",
  },
  {
    id: "story",
    label: "Story",
    sublabel: "1080×1920",
    aspect: "aspect-[9/16]",
  },
  {
    id: "banner",
    label: "Banner",
    sublabel: "1200×628",
    aspect: "aspect-[1200/628]",
  },
  {
    id: "ad",
    label: "Ad",
    sublabel: "1080×1080",
    aspect: "aspect-square",
  },
];

export default function MarketingPage() {
  const [productName, setProductName] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [goal, setGoal] = useState("");
  const [format, setFormat] = useState("social-post");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCreative, setGeneratedCreative] = useState<string | null>(
    null
  );
  const [generatedAsset, setGeneratedAsset] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showGoalDropdown, setShowGoalDropdown] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  const selectedFormat = formats.find((f) => f.id === format) || formats[0];

  const handleGenerate = useCallback(async () => {
    if (!productName.trim() || !targetAudience.trim() || !goal) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedCreative(null);
    setGeneratedAsset(null);

    try {
      const res = await fetch("/api/generate/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          targetAudience,
          goal,
          format,
        }),
      });

      if (!res.ok) {
        throw new Error("Creative generation failed. Please try again.");
      }

      const data = await res.json();
      setGeneratedCreative(data.imageUrl || "/placeholder-marketing.png");
      setGeneratedAsset(data.asset);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsGenerating(false);
    }
  }, [productName, targetAudience, goal, format]);

  const handleDownload = useCallback(() => {
    if (!generatedCreative) return;
    const a = document.createElement("a");
    a.href = generatedCreative;
    a.download = "forge-marketing.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [generatedCreative]);

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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-600 to-orange-500">
              <Megaphone className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Marketing Creative
              </h1>
              <p className="text-sm text-zinc-400">
                Generate scroll-stopping ad creatives and banners
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          {/* Left Panel - Controls */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card space-y-6 p-6"
          >
            {/* Product / Service Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Product / Service Name
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Forge Studio Pro"
                className="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-3 text-sm text-white placeholder-zinc-500 transition-all focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              />
            </div>

            {/* Target Audience */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Target Audience
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. Startup founders, ages 25-40"
                className="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-3 text-sm text-white placeholder-zinc-500 transition-all focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              />
            </div>

            {/* Goal Dropdown */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Goal
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowGoalDropdown(!showGoalDropdown)}
                  className="flex w-full items-center justify-between rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-3 text-sm transition-all focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                >
                  <span className={goal ? "text-white" : "text-zinc-500"}>
                    {goal || "Select a goal"}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-zinc-500 transition-transform",
                      showGoalDropdown && "rotate-180"
                    )}
                  />
                </button>
                <AnimatePresence>
                  {showGoalDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute left-0 top-full z-20 mt-2 w-full overflow-hidden rounded-xl border border-zinc-700/50 bg-zinc-900 shadow-xl backdrop-blur-lg"
                    >
                      {goals.map((g) => (
                        <button
                          key={g}
                          onClick={() => {
                            setGoal(g);
                            setShowGoalDropdown(false);
                          }}
                          className={cn(
                            "w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-zinc-800/80",
                            goal === g
                              ? "text-rose-300 bg-rose-500/10"
                              : "text-zinc-300 hover:text-white"
                          )}
                        >
                          {g}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Format */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                {formats.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl border px-3 py-3 text-xs font-medium transition-all",
                      format === f.id
                        ? "border-rose-500/50 bg-rose-500/10 text-rose-300"
                        : "border-zinc-700/50 bg-zinc-800/30 text-zinc-400 hover:border-zinc-600/50 hover:text-zinc-300"
                    )}
                  >
                    <span>{f.label}</span>
                    <span className="text-[10px] opacity-60">{f.sublabel}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={
                isGenerating ||
                !productName.trim() ||
                !targetAudience.trim() ||
                !goal
              }
              className={cn(
                "relative w-full rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 transition-all",
                isGenerating ||
                  !productName.trim() ||
                  !targetAudience.trim() ||
                  !goal
                  ? "cursor-not-allowed opacity-60"
                  : "hover:shadow-xl hover:shadow-rose-500/30"
              )}
            >
              <span className="flex items-center justify-center gap-2">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Creative...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Creative
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
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full max-w-lg"
                >
                  <div
                    className={cn(
                      "relative animate-pulse rounded-2xl bg-zinc-800/60 overflow-hidden",
                      selectedFormat.aspect,
                      selectedFormat.id === "story" && "max-h-[520px]"
                    )}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-rose-400" />
                      <p className="text-sm text-zinc-400">
                        Crafting your creative...
                      </p>
                    </div>
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                  </div>
                </motion.div>
              ) : generatedCreative ? (
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
                      selectedFormat.aspect,
                      selectedFormat.id === "story" && "max-h-[520px]"
                    )}
                  >
                    <img
                      src={generatedCreative}
                      alt="Generated creative"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
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
                  </div>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                    <Megaphone className="h-6 w-6 text-red-400" />
                  </div>
                  <p className="text-sm text-red-400">{error}</p>
                  <button
                    onClick={handleGenerate}
                    className="mt-3 text-sm font-medium text-rose-400 hover:text-rose-300"
                  >
                    Try again
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800/60">
                    <Megaphone className="h-8 w-8 text-zinc-600" />
                  </div>
                  <h3 className="mb-1 text-lg font-medium text-zinc-300">
                    Create a marketing creative
                  </h3>
                  <p className="text-sm text-zinc-500">
                    Fill in your product details and generate stunning ad
                    creatives
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
