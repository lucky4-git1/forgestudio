'use client';

import { useState, useEffect } from 'react';
import { Download, Trash2, RefreshCw, HardDrive, Cpu, Image as ImageIcon, Video, Search } from 'lucide-react';

type ModelStatus = 'ready' | 'downloading' | 'missing';
type ModelCategory = 'image' | 'video' | 'llm';

interface AIModel {
  id: string;
  name: string;
  version: string;
  size: string;
  type: ModelCategory;
  status: ModelStatus;
  progress?: number;
  url?: string;
  filename?: string;
}

const INITIAL_MODELS: AIModel[] = [
  // Image Models
  { id: 'flux-schnell', name: 'FLUX.1-schnell', version: 'v1.0', size: '23.8 GB', type: 'image', status: 'missing', url: 'https://huggingface.co/black-forest-labs/FLUX.1-schnell/resolve/main/flux1-schnell.safetensors', filename: 'flux1-schnell.safetensors' },
  { id: 'flux-dev', name: 'FLUX.1-dev', version: 'v1.0', size: '23.8 GB', type: 'image', status: 'missing', url: 'https://huggingface.co/black-forest-labs/FLUX.1-dev/resolve/main/flux1-dev.safetensors', filename: 'flux1-dev.safetensors' },
  { id: 'sdxl', name: 'SDXL Base 1.0', version: '1.0', size: '6.9 GB', type: 'image', status: 'missing', url: 'https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0.safetensors', filename: 'sd_xl_base_1.0.safetensors' },
  { id: 'juggernaut', name: 'Juggernaut XL', version: 'v9', size: '6.5 GB', type: 'image', status: 'missing', url: 'https://huggingface.co/RunDiffusion/Juggernaut-XL-v9/resolve/main/Juggernaut-XL_v9_RunDiffusionPhoto_v2.safetensors', filename: 'Juggernaut-XL_v9_RunDiffusionPhoto_v2.safetensors' },
  { id: 'sd15', name: 'SD 1.5 (Base)', version: '1.5', size: '4.2 GB', type: 'image', status: 'missing', url: 'https://huggingface.co/runwayml/stable-diffusion-v1-5/resolve/main/v1-5-pruned-emaonly.ckpt', filename: 'v1-5-pruned-emaonly.ckpt' },
  // Video Models
  { id: 'wan-2-2', name: 'Wan 2.2', version: 'TI2V-5B', size: '14.2 GB', type: 'video', status: 'missing', url: 'https://huggingface.co/Wan-AI/Wan2.2-T2V-1.3B/resolve/main/model.safetensors', filename: 'wan_2_2.safetensors' },
  { id: 'hunyuan', name: 'Hunyuan Video', version: 'v1.0', size: '18.5 GB', type: 'video', status: 'missing', url: 'https://huggingface.co/tencent/HunyuanVideo/resolve/main/hunyuan_video.safetensors', filename: 'hunyuan_video.safetensors' },
  { id: 'animatediff', name: 'AnimateDiff V2', version: 'v15_v2', size: '1.8 GB', type: 'video', status: 'missing', url: 'https://huggingface.co/guoyww/animatediff/resolve/main/mm_sd_v15_v2.ckpt', filename: 'mm_sd_v15_v2.ckpt' },
  // LLMs
  { id: 'qwen', name: 'Qwen 2.5', version: '7B-Instruct', size: '4.7 GB', type: 'llm', status: 'missing', url: 'https://ollama.com/library/qwen2.5', filename: 'qwen2.5' },
  { id: 'gemma', name: 'Gemma 2', version: '9B-It', size: '5.5 GB', type: 'llm', status: 'missing', url: 'https://ollama.com/library/gemma2', filename: 'gemma2' },
  { id: 'llama', name: 'Llama 3.1', version: '8B-Instruct', size: '4.9 GB', type: 'llm', status: 'missing', url: 'https://ollama.com/library/llama3.1', filename: 'llama3.1' },
];

export default function ModelManager() {
  const [models, setModels] = useState<AIModel[]>(INITIAL_MODELS);
  const [filter, setFilter] = useState<ModelCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const checkModels = async () => {
    try {
      const res = await fetch('/api/comfyui/models');
      let availableCheckpoints: string[] = [];
      if (res.ok) {
        const data = await res.json();
        availableCheckpoints = [
          ...(data.checkpoints || []),
          ...(data.video_models || []),
          // For animatediff, some nodes put it in other lists, but let's assume checkpoints for now or check all
        ];
      }
      
      let ollamaTags: string[] = [];
      try {
        const ollamaRes = await fetch('http://127.0.0.1:11434/api/tags');
        if (ollamaRes.ok) {
          const ollamaData = await ollamaRes.json();
          ollamaTags = ollamaData.models?.map((m: any) => m.name.split(':')[0]) || [];
        }
      } catch (e) {
        // ignore
      }

      setModels(prev => prev.map(m => {
        if (m.type === 'llm') {
          const isReady = ollamaTags.includes(m.filename || '');
          return { ...m, status: isReady ? 'ready' : 'missing' };
        } else {
          // If the model filename is found in any of ComfyUI's model arrays
          const isReady = availableCheckpoints.some(c => m.filename && c.includes(m.filename));
          return { ...m, status: isReady ? 'ready' : 'missing' };
        }
      }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    checkModels();
    const interval = setInterval(checkModels, 10000);
    return () => clearInterval(interval);
  }, []);

  const installModel = (modelId: string) => {
    const model = models.find(m => m.id === modelId);
    if (!model || !model.url) return;
    
    if (model.type === 'llm') {
      alert(`To install this model, run the following command in your terminal:\n\nollama run ${model.filename}\n\nThe dashboard will automatically update once installed.`);
      return;
    }
    
    window.open(model.url, '_blank');
    alert(`Downloading ${model.name}.\n\nOnce downloaded, place the file in your ComfyUI models/checkpoints folder (or appropriate custom node folder). It will automatically show as installed here once placed.`);
  };

  const removeModel = (modelId: string) => {
    const model = models.find(m => m.id === modelId);
    if (model?.type === 'llm') {
      alert(`To remove this model, run:\n\nollama rm ${model.filename}`);
    } else {
      alert(`To remove this model, manually delete '${model?.filename}' from your ComfyUI models folder.`);
    }
  };

  const filteredModels = models
    .filter(m => filter === 'all' || m.type === filter)
    .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const CategoryIcon = ({ type }: { type: ModelCategory }) => {
    switch (type) {
      case 'image': return <ImageIcon size={16} className="text-violet-400" />;
      case 'video': return <Video size={16} className="text-blue-400" />;
      case 'llm': return <Cpu size={16} className="text-emerald-400" />;
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Model Manager</h1>
          <p className="mt-1 text-zinc-400">Install, update, and remove local inference models.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={checkModels}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
          >
            <RefreshCw size={16} /> Refresh Registry
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        <div className="flex gap-2 p-1 bg-zinc-900 rounded-lg border border-zinc-800">
          {(['all', 'image', 'video', 'llm'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${filter === cat ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search models..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModels.map(model => (
          <div key={model.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-zinc-800">
                  <CategoryIcon type={model.type} />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-100">{model.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span>{model.version}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><HardDrive size={12} /> {model.size}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div>
                {model.status === 'ready' && <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">Installed</span>}
                {model.status === 'missing' && <span className="text-xs font-medium text-zinc-500 bg-zinc-800 px-2 py-1 rounded">Not Installed</span>}
                {model.status === 'downloading' && <span className="text-xs font-medium text-violet-400 bg-violet-500/10 px-2 py-1 rounded">Downloading {model.progress}%</span>}
              </div>

              <div className="flex gap-2">
                {model.status === 'missing' && (
                  <button onClick={() => installModel(model.id)} className="p-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors">
                    <Download size={16} />
                  </button>
                )}
                {model.status === 'ready' && (
                  <button onClick={() => removeModel(model.id)} className="p-2 bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-400 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
                {model.status === 'downloading' && (
                  <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                )}
              </div>
            </div>
            
            {model.status === 'downloading' && (
              <div className="mt-4 h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 transition-all duration-300" style={{ width: `${model.progress}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>
      
      {filteredModels.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-500">No models found matching your search.</p>
        </div>
      )}
    </div>
  );
}

