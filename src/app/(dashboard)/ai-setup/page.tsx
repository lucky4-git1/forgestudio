'use client';

import { useState, useEffect } from 'react';
import { Download, Play, CheckCircle2, Server, DownloadCloud, Box, HardDrive } from 'lucide-react';

type StepStatus = 'idle' | 'running' | 'completed' | 'error';

export default function LocalAISetup() {
  const [status, setStatus] = useState<StepStatus>('idle');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/local-services');
        const data = await res.json();
        if (data.comfyui === 'running') {
          setStatus('completed');
        } else {
          setStatus('idle');
        }
      } catch (err) {
        setStatus('idle');
      }
    };
    
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Local AI Setup</h1>
        <p className="mt-1 text-zinc-400">Install and configure ComfyUI and Ollama to run models entirely on your own hardware.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ComfyUI Installer */}
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">ComfyUI Integration</h2>
              <p className="text-sm text-zinc-400 mt-1">Image & Video generation engine</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
              }`}>
                {status === 'completed' ? 'Connected' : 'Waiting for connection...'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-zinc-300">
              We now require a manual setup for ComfyUI to ensure you get the best performance and flexibility for your hardware.
            </p>
            
            <div className="space-y-4 mt-4">
              <div className="flex items-start gap-3">
                <div className="bg-violet-500/20 text-violet-400 p-2 rounded-lg">
                  <DownloadCloud size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white">1. Download ComfyUI</h4>
                  <p className="text-xs text-zinc-400 mt-1 mb-2">Download the latest standalone version from the official repository.</p>
                  <a href="https://github.com/comfyanonymous/ComfyUI/releases/latest" target="_blank" rel="noreferrer" className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded inline-flex items-center gap-2 transition-colors">
                    Download ComfyUI
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-violet-500/20 text-violet-400 p-2 rounded-lg">
                  <Box size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white">2. Extract & Install Models</h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Extract the downloaded zip. For basic functionality, you will need to place Stable Diffusion checkpoints (like v1-5-pruned-emaonly.ckpt) into the <code>ComfyUI/models/checkpoints</code> folder.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-violet-500/20 text-violet-400 p-2 rounded-lg">
                  <Play size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white">3. Run ComfyUI</h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Run the <code>run_nvidia_gpu.bat</code> (or equivalent for your system) to start the server. It will run on <strong>http://127.0.0.1:8188</strong> by default.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-violet-500/20 text-violet-400 p-2 rounded-lg">
                  <Server size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white">4. Auto-Connect</h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Once ComfyUI is running on port 8188, this app will automatically detect it and connect.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ollama Installer */}
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-6 opacity-60">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">Ollama Integration</h2>
              <p className="text-sm text-zinc-400 mt-1">Local LLM engine for prompt enhancement</p>
            </div>
            <button className="bg-zinc-800 text-white px-4 py-2 rounded-md font-medium text-sm cursor-not-allowed">
              Coming Soon
            </button>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Run large language models like LLaMA 3, Gemma, and Qwen entirely on your local machine to automatically refine, enhance, and structure your image and video prompts before generation.
          </p>
        </div>

      </div>
    </div>
  );
}
