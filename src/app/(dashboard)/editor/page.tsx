'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Download, Scissors, Maximize, Save,
  RotateCcw, Loader2, Play, Pause, Crop, Type, AlertCircle
} from 'lucide-react';
import Link from 'next/link';

function EditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const assetId = searchParams.get('assetId');
  const type = searchParams.get('type');
  const fileUrl = searchParams.get('url');

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Image State
  const [imgWidth, setImgWidth] = useState<number>(0);
  const [imgHeight, setImgHeight] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Video State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!fileUrl) return;

    if (type === 'image' && canvasRef.current) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setImgWidth(img.width);
        setImgHeight(img.height);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
          canvasRef.current!.width = img.width;
          canvasRef.current!.height = img.height;
          ctx.drawImage(img, 0, 0);
        }
      };
      img.src = fileUrl;
    }
  }, [fileUrl, type]);

  const handleDownload = () => {
    if (!fileUrl) return;
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = `edited_${type}_${assetId}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleUpscale = async () => {
    if (!canvasRef.current) return;
    setIsProcessing(true);
    setError(null);

    try {
      const base64 = canvasRef.current.toDataURL('image/png');
      const res = await fetch('/api/generate/upscale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, scale: 2 }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upscale failed');
      }

      const { imageUrl } = await res.json();
      router.push(`/assets`); // Go back to assets to see the new upscaled image
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!fileUrl) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-zinc-400">
        No asset selected for editing. Return to the <Link href="/assets" className="ml-1 text-violet-400 hover:underline">Asset Library</Link>.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/assets" className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to Library
          </Link>
          <h1 className="text-3xl font-bold text-white capitalize">{type} Editor</h1>
          <p className="mt-1 text-zinc-400">Refine and enhance your generated content.</p>
        </div>
        
        <div className="flex gap-3">
          <button onClick={handleDownload} className="flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700">
            <Download className="h-4 w-4" /> Download Original
          </button>
        </div>
      </motion.div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-lg bg-red-500/10 p-4 text-red-400 border border-red-500/20">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main Canvas/Player Area */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card flex min-h-[600px] flex-col items-center justify-center overflow-hidden p-8 bg-zinc-900/50">
          {type === 'image' ? (
            <div className="relative max-h-full max-w-full overflow-auto rounded-xl border border-zinc-800 bg-black/50 shadow-2xl">
              <canvas ref={canvasRef} className="max-w-full object-contain" />
            </div>
          ) : (
            <div className="relative w-full overflow-hidden rounded-xl border border-zinc-800 bg-black/50 shadow-2xl">
              <video 
                ref={videoRef}
                src={fileUrl}
                controls
                className="w-full max-h-[70vh] object-contain"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            </div>
          )}
        </motion.div>

        {/* Tools Panel */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card flex flex-col gap-6 p-6">
          <h3 className="text-lg font-semibold text-white">Tools</h3>
          
          {type === 'image' ? (
            <>
              {/* Image specific tools */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-zinc-400">Dimensions</label>
                  <div className="mt-2 flex items-center gap-2">
                    <input type="number" value={imgWidth} readOnly className="w-full rounded-md border border-zinc-700 bg-zinc-800/50 p-2 text-sm text-white" />
                    <span className="text-zinc-500">x</span>
                    <input type="number" value={imgHeight} readOnly className="w-full rounded-md border border-zinc-700 bg-zinc-800/50 p-2 text-sm text-white" />
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800">
                  <label className="text-sm font-medium text-zinc-400 block mb-3">Actions</label>
                  <button 
                    onClick={handleUpscale} 
                    disabled={isProcessing}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Maximize className="h-4 w-4" />}
                    {isProcessing ? 'Upscaling...' : 'AI Upscale (2x)'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Video specific tools */}
              <div className="space-y-4">
                <div className="rounded-lg bg-zinc-800/50 p-4 border border-zinc-700/50 text-center">
                  <Scissors className="mx-auto h-6 w-6 text-zinc-500 mb-2" />
                  <p className="text-sm text-zinc-400">Trimming requires local FFmpeg backend integration (coming soon).</p>
                </div>
                
                <div className="pt-4 border-t border-zinc-800 flex gap-2 justify-center">
                  <button 
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = 0;
                        videoRef.current.play();
                      }
                    }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
                  >
                    <RotateCcw className="h-4 w-4" /> Replay
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-zinc-400">Loading editor...</div>}>
      <EditorContent />
    </Suspense>
  );
}
