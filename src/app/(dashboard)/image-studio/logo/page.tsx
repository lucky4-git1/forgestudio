"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hexagon,
  ArrowLeft,
  Download,
  FolderPlus,
  Bookmark,
  Loader2,
  Sparkles,
  ChevronDown,
  Coins,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const industries = [
  "Tech",
  "Food",
  "Fashion",
  "Health",
  "Finance",
  "Education",
  "Entertainment",
  "Sports",
  "Other",
];

const logoStyles = [
  "Minimalist",
  "Modern",
  "Classic",
  "Playful",
  "Corporate",
  "Bold",
];

const colorPresets = [
  { name: "Violet", value: "#7c3aed", bg: "bg-violet-600" },
  { name: "Blue", value: "#2563eb", bg: "bg-blue-600" },
  { name: "Cyan", value: "#06b6d4", bg: "bg-cyan-500" },
  { name: "Emerald", value: "#10b981", bg: "bg-emerald-500" },
  { name: "Rose", value: "#f43f5e", bg: "bg-rose-500" },
  { name: "Orange", value: "#f97316", bg: "bg-orange-500" },
  { name: "Amber", value: "#f59e0b", bg: "bg-amber-500" },
  { name: "Zinc", value: "#71717a", bg: "bg-zinc-500" },
];

export default function LogoPage() {
  const [brandName, setBrandName] = useState("");
  const [industry, setIndustry] = useState("");
  const [logoStyle, setLogoStyle] = useState("Modern");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLogo, setGeneratedLogo] = useState<string | null>(null);
  const [generatedAsset, setGeneratedAsset] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!brandName.trim() || !industry) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedLogo(null);
    setGeneratedAsset(null);

    try {
      const res = await fetch("/api/generate/logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName,
          industry,
          style: logoStyle,
          colorPreference: selectedColor,
        }),
      });

      if (!res.ok) {
        throw new Error("Logo generation failed. Please try again.");
      }

      const data = await res.json();
      setGeneratedLogo(data.imageUrl || "/placeholder-logo.png");
      setGeneratedAsset(data.asset);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsGenerating(false);
    }
  }, [brandName, industry, logoStyle, selectedColor]);

  const handleDownload = useCallback(() => {
    if (!generatedLogo) return;
    const a = document.createElement("a");
    a.href = generatedLogo;
    a.download = "forge-logo.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [generatedLogo]);

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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500">
              <Hexagon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Logo Generator</h1>
              <p className="text-sm text-zinc-400">
                Create professional brand logos in seconds
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
            {/* Brand Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Brand Name
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. NovaByte"
                className="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-3 text-sm text-white placeholder-zinc-500 transition-all focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              />
            </div>

            {/* Industry Dropdown */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Industry
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowIndustryDropdown(!showIndustryDropdown)}
                  className="flex w-full items-center justify-between rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-3 text-sm transition-all focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                >
                  <span className={industry ? "text-white" : "text-zinc-500"}>
                    {industry || "Select industry"}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-zinc-500 transition-transform",
                      showIndustryDropdown && "rotate-180"
                    )}
                  />
                </button>
                <AnimatePresence>
                  {showIndustryDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute left-0 top-full z-20 mt-2 w-full overflow-hidden rounded-xl border border-zinc-700/50 bg-zinc-900 shadow-xl backdrop-blur-lg"
                    >
                      {industries.map((ind) => (
                        <button
                          key={ind}
                          onClick={() => {
                            setIndustry(ind);
                            setShowIndustryDropdown(false);
                          }}
                          className={cn(
                            "w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-zinc-800/80",
                            industry === ind
                              ? "text-violet-300 bg-violet-500/10"
                              : "text-zinc-300 hover:text-white"
                          )}
                        >
                          {ind}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Logo Style */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {logoStyles.map((s) => (
                  <button
                    key={s}
                    onClick={() => setLogoStyle(s)}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-xs font-medium transition-all",
                      logoStyle === s
                        ? "border-blue-500/50 bg-blue-500/10 text-blue-300"
                        : "border-zinc-700/50 bg-zinc-800/30 text-zinc-400 hover:border-zinc-600/50 hover:text-zinc-300"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Preference */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Color Preference{" "}
                <span className="text-zinc-500">(optional)</span>
              </label>
              <div className="flex flex-wrap gap-2.5">
                {colorPresets.map((color) => (
                  <button
                    key={color.value}
                    onClick={() =>
                      setSelectedColor(
                        selectedColor === color.value ? null : color.value
                      )
                    }
                    title={color.name}
                    className={cn(
                      "h-8 w-8 rounded-full transition-all",
                      color.bg,
                      selectedColor === color.value
                        ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110"
                        : "hover:scale-110 opacity-70 hover:opacity-100"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={isGenerating || !brandName.trim() || !industry}
              className={cn(
                "relative w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all",
                isGenerating || !brandName.trim() || !industry
                  ? "cursor-not-allowed opacity-60"
                  : "hover:shadow-xl hover:shadow-blue-500/30"
              )}
            >
              <span className="flex items-center justify-center gap-2">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Logo...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Logo
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
                  className="w-full max-w-md"
                >
                  <div className="relative aspect-square animate-pulse rounded-2xl bg-zinc-800/60">
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                      <p className="text-sm text-zinc-400">
                        Designing your logo...
                      </p>
                    </div>
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                  </div>
                </motion.div>
              ) : generatedLogo ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full max-w-md"
                >
                  <div className="aspect-square overflow-hidden rounded-2xl border border-zinc-700/50 bg-zinc-800/40">
                    <img
                      src={generatedLogo}
                      alt="Generated logo"
                      className="h-full w-full object-contain p-8"
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
                      Download PNG
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

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center gap-2 rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700/50 hover:text-white"
                    >
                      <Bookmark className="h-4 w-4" />
                      Save to Brand Kit
                    </motion.button>
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
                    <Hexagon className="h-6 w-6 text-red-400" />
                  </div>
                  <p className="text-sm text-red-400">{error}</p>
                  <button
                    onClick={handleGenerate}
                    className="mt-3 text-sm font-medium text-blue-400 hover:text-blue-300"
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
                    <Hexagon className="h-8 w-8 text-zinc-600" />
                  </div>
                  <h3 className="mb-1 text-lg font-medium text-zinc-300">
                    Design your logo
                  </h3>
                  <p className="text-sm text-zinc-500">
                    Enter your brand name and preferences to generate a
                    professional logo
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
