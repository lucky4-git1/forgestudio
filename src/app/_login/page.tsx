"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { login, signup } from "./actions";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      if (mode === "login") {
        await login(formData);
      } else {
        await signup(formData);
      }
    } catch (error) {
      console.error("Auth error:", error);
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });
    } catch {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950">
      {/* Animated gradient mesh background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-mesh-1 absolute -left-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="animate-mesh-2 absolute -right-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-purple-600/15 blur-[120px]" />
        <div className="animate-mesh-3 absolute -bottom-1/4 left-1/3 h-[550px] w-[550px] rounded-full bg-indigo-600/15 blur-[120px]" />
        <div className="animate-mesh-4 absolute right-1/3 top-1/2 h-[400px] w-[400px] rounded-full bg-fuchsia-600/10 blur-[100px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-8 shadow-2xl shadow-violet-500/5 backdrop-blur-xl">
          {/* Logo / Brand */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-8 text-center"
          >
            <div className="mb-4 inline-flex items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 p-3">
              <Sparkles className="h-6 w-6 text-violet-400" />
            </div>
            <h1 className="bg-gradient-to-r from-violet-400 via-purple-400 to-violet-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
              Forge Studio
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              {mode === "login"
                ? "Welcome back. Sign in to continue creating."
                : "Create an account to start generating."}
            </p>
          </motion.div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mode toggle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6"
          >
            <div className="flex rounded-lg border border-white/[0.06] bg-zinc-800/50 p-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`relative flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  mode === "login" ? "text-white" : "text-zinc-400 hover:text-zinc-300"
                }`}
              >
                {mode === "login" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-md bg-zinc-700/60"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`relative flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  mode === "signup" ? "text-white" : "text-zinc-400 hover:text-zinc-300"
                }`}
              >
                {mode === "signup" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-md bg-zinc-700/60"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">Sign Up</span>
              </button>
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            action={handleSubmit}
            className="space-y-4"
          >
            {/* Email */}
            <div className="group relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-violet-400" />
              <input
                type="email"
                name="email"
                placeholder="Email address"
                required
                className="w-full rounded-lg border border-white/[0.06] bg-zinc-800/50 py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 transition-all focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
              />
            </div>

            {/* Password */}
            <div className="group relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-violet-400" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                minLength={6}
                className="w-full rounded-lg border border-white/[0.06] bg-zinc-800/50 py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 transition-all focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
              />
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all hover:shadow-violet-500/30 disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="relative z-10 flex items-center gap-2">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {mode === "login" ? "Sign In" : "Create Account"}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </span>
            </motion.button>
          </motion.form>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="my-6 flex items-center gap-3"
          >
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
            <span className="text-xs text-zinc-500">Or continue with</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
          </motion.div>

          {/* Google OAuth */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/[0.06] bg-zinc-800/50 py-3 text-sm font-medium text-zinc-300 transition-all hover:border-white/[0.12] hover:bg-zinc-800/80 hover:text-white disabled:opacity-50"
          >
            {isGoogleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </motion.button>

          {/* Footer text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-6 text-center text-xs text-zinc-500"
          >
            By continuing, you agree to our{" "}
            <span className="text-zinc-400 hover:text-white cursor-pointer transition-colors">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="text-zinc-400 hover:text-white cursor-pointer transition-colors">
              Privacy Policy
            </span>
          </motion.p>
        </div>

        {/* Glow effect under card */}
        <div className="absolute -bottom-4 left-1/2 h-8 w-3/4 -translate-x-1/2 rounded-full bg-violet-500/10 blur-2xl" />
      </motion.div>


    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950" />}>
      <LoginForm />
    </Suspense>
  );
}
