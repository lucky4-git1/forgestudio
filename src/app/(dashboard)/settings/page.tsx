'use client';

import { useEffect, useState } from 'react';
import { Bell, Coins, History, KeyRound, Shield, User } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  credits: number;
}

type AISettings = {
  provider?: string;
  image_model?: string;
  video_model?: string;
  default_aspect_ratio?: string;
  default_quality?: string;
  default_style?: string;
  negative_prompt?: string;
  auto_save?: boolean;
  provider_api_key?: string | null;
  inference_mode?: 'cloud' | 'local';
};

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [active, setActive] = useState<'profile' | 'ai' | 'defaults'>('profile');
  const [saving, setSaving] = useState(false);
  const [aiSettings, setAISettings] = useState<AISettings | null>(null);
  const [profileForm, setProfileForm] = useState({ name: '', avatar_url: '' });
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [localServices, setLocalServices] = useState<{ comfyui: string; ollama: string }>({ comfyui: 'checking', ollama: 'checking' });

  async function checkLocalServices() {
    setLocalServices({ comfyui: 'checking', ollama: 'checking' });
    try {
      const res = await fetch('/api/local-services');
      if (res.ok) {
        const data = await res.json();
        setLocalServices(data);
      } else {
        setLocalServices({ comfyui: 'offline', ollama: 'offline' });
      }
    } catch {
      setLocalServices({ comfyui: 'offline', ollama: 'offline' });
    }
  }

  useEffect(() => {
    if (active === 'ai') {
      checkLocalServices();
    }
  }, [active]);

  useEffect(() => {
    (async () => {
      try {
        const uRes = await fetch('/api/user');
        if (uRes.ok) {
          const u = await uRes.json();
          setUser({ id: u.id, email: u.email, name: u.name ?? null, avatar_url: u.avatar_url ?? null, credits: u.credits ?? 0 });
          setProfileForm({ name: u.name ?? '', avatar_url: u.avatar_url ?? '' });
        } else {
          setUser(null);
        }

        const sRes = await fetch('/api/ai-settings');
        if (sRes.ok) {
          const s = await sRes.json();
          setAISettings(s ?? null);
        } else {
          setAISettings(null);
        }
      } catch (err) {
        setUser(null);
        setAISettings(null);
      }
    })();
  }, []);

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profileForm.name, avatar_url: profileForm.avatar_url }),
      });
      if (res.ok) {
        const data = await res.json();
        const updated = data.user ?? null;
        if (updated) setUser((u) => (u ? { ...u, name: updated.name, avatar_url: updated.avatar_url } : u));
      }
      // optimistic success
    } catch (err) {
      // ignore — could add toast
    } finally {
      setSaving(false);
    }
  }

  async function saveAISettings() {
    if (!user || !aiSettings) return;
    setSaving(true);
    try {
      const res = await fetch('/api/ai-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiSettings),
      });
      if (res.ok) {
        const saved = await res.json();
        setAISettings(saved);
        // show confirmation modal
        setShowSavedModal(true);
      }
    } catch (err) {
      // ignore for now
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-zinc-400">Profile, AI models, generation defaults, usage and security.</p>
      </div>

      <div className="flex gap-6">
        <aside className="w-64">
          <nav className="space-y-2">
            <button onClick={() => setActive('profile')} className={`w-full text-left rounded-md p-3 ${active === 'profile' ? 'bg-zinc-800' : 'bg-zinc-900/40'}`}>
              Profile
            </button>
            <button onClick={() => setActive('ai')} className={`w-full text-left rounded-md p-3 ${active === 'ai' ? 'bg-zinc-800' : 'bg-zinc-900/40'}`}>
              AI Models
            </button>
            <button onClick={() => setActive('defaults')} className={`w-full text-left rounded-md p-3 ${active === 'defaults' ? 'bg-zinc-800' : 'bg-zinc-900/40'}`}>
              Generation Defaults
            </button>
          </nav>
        </aside>

        <section className="flex-1 rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-6">
          {active === 'profile' && (
            <div>
              <h2 className="text-xl font-semibold text-white">Profile</h2>
              <p className="mt-2 text-sm text-zinc-400">Update your display name and avatar.</p>
              <div className="mt-4 space-y-3">
                <label className="block">
                  <div className="text-sm text-zinc-300">Name</div>
                  <input value={profileForm.name} onChange={(e) => setProfileForm((s) => ({ ...s, name: e.target.value }))} className="mt-1 w-full rounded-md bg-zinc-800 p-2 text-white" />
                </label>
                <label className="block">
                  <div className="text-sm text-zinc-300">Avatar URL</div>
                  <input value={profileForm.avatar_url} onChange={(e) => setProfileForm((s) => ({ ...s, avatar_url: e.target.value }))} className="mt-1 w-full rounded-md bg-zinc-800 p-2 text-white" />
                </label>
                <div className="flex gap-2">
                  <button onClick={saveProfile} disabled={saving} className="rounded bg-violet-600 px-4 py-2 font-medium">Save</button>
                </div>
              </div>
            </div>
          )}

          {active === 'ai' && (
            <div>
              <h2 className="text-xl font-semibold text-white">AI Models</h2>
              <p className="mt-2 text-sm text-zinc-400">Select your preferred provider and models.</p>

              <div className="mt-4 space-y-3 max-w-xl">
                <label className="block mb-6">
                  <div className="text-sm font-medium text-white">Inference Mode</div>
                  <div className="mt-2 flex gap-4">
                    <label className="flex items-center gap-2 text-sm text-zinc-300">
                      <input 
                        type="radio" 
                        name="inference_mode" 
                        value="cloud" 
                        checked={(aiSettings?.inference_mode ?? 'cloud') === 'cloud'} 
                        onChange={() => setAISettings((s) => ({ ...(s ?? {}), inference_mode: 'cloud' }))} 
                      />
                      Cloud
                    </label>
                    <label className="flex items-center gap-2 text-sm text-zinc-300">
                      <input 
                        type="radio" 
                        name="inference_mode" 
                        value="local" 
                        checked={aiSettings?.inference_mode === 'local'} 
                        onChange={() => setAISettings((s) => ({ ...(s ?? {}), inference_mode: 'local' }))} 
                      />
                      Local
                    </label>
                  </div>
                </label>

                {aiSettings?.inference_mode === 'local' && (
                  <div className="mb-6 rounded-md bg-zinc-900/50 border border-zinc-800 p-4">
                    <h3 className="text-sm font-medium text-white mb-3 flex items-center justify-between">
                      Local Services Status
                      <button onClick={checkLocalServices} className="text-xs bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded">Refresh</button>
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400">ComfyUI (Images/Video)</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${localServices.comfyui === 'running' ? 'bg-emerald-500/10 text-emerald-500' : localServices.comfyui === 'checking' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'}`}>
                          {localServices.comfyui === 'running' ? 'Connected' : localServices.comfyui === 'checking' ? 'Checking...' : 'Offline / Not Installed'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400">Ollama (LLMs)</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${localServices.ollama === 'running' ? 'bg-emerald-500/10 text-emerald-500' : localServices.ollama === 'checking' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'}`}>
                          {localServices.ollama === 'running' ? 'Connected' : localServices.ollama === 'checking' ? 'Checking...' : 'Offline / Not Installed'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {(aiSettings?.inference_mode ?? 'cloud') === 'cloud' && (
                  <>
                    <label className="block">
                      <div className="text-sm text-zinc-300">Image Provider</div>
                      <select value={aiSettings?.provider ?? 'huggingface'} onChange={(e) => setAISettings((s) => ({ ...(s ?? {}), provider: e.target.value }))} className="mt-1 w-full rounded-md bg-zinc-800 p-2 text-white">
                        <option value="huggingface">Hugging Face</option>
                        <option value="fal">Fal AI</option>
                        <option value="together">Together AI</option>
                        <option value="replicate">Replicate</option>
                        <option value="nvidia">NVIDIA</option>
                        <option value="openai">OpenAI</option>
                        <option value="stability">Stability</option>
                      </select>
                    </label>
                  </>
                )}

                <label className="block">
                  <div className="text-sm text-zinc-300">Provider API Key</div>
                  <input value={aiSettings?.provider_api_key ?? ''} onChange={(e) => setAISettings((s) => ({ ...(s ?? {}), provider_api_key: e.target.value }))} className="mt-1 w-full rounded-md bg-zinc-800 p-2 text-white" placeholder="Paste provider API key (kept server-side)" />
                </label>

                <label className="block">
                  <div className="text-sm text-zinc-300">Image Model</div>
                  <select value={aiSettings?.image_model ?? 'FLUX.1-schnell'} onChange={(e) => setAISettings((s) => ({ ...(s ?? {}), image_model: e.target.value }))} className="mt-1 w-full rounded-md bg-zinc-800 p-2 text-white">
                    <option value="FLUX.1-schnell">FLUX.1-schnell</option>
                    <option value="sdxl">SDXL</option>
                  </select>
                </label>

                <label className="block">
                  <div className="text-sm text-zinc-300">Video Model</div>
                  <select value={aiSettings?.video_model ?? 'cosmos'} onChange={(e) => setAISettings((s) => ({ ...(s ?? {}), video_model: e.target.value }))} className="mt-1 w-full rounded-md bg-zinc-800 p-2 text-white">
                    <option value="cosmos">Cosmos</option>
                    <option value="wan">Wan</option>
                    <option value="hunyuan">Hunyuan</option>
                  </select>
                </label>

                <div className="flex gap-2 mt-4">
                  <button onClick={saveAISettings} disabled={saving} className="rounded bg-violet-600 px-4 py-2 font-medium">Save AI Settings</button>
                </div>
              </div>
            </div>
          )}

          {active === 'defaults' && (
            <div>
              <h2 className="text-xl font-semibold text-white">Generation Defaults</h2>
              <p className="mt-2 text-sm text-zinc-400">Defaults applied to generation workflows.</p>

              <div className="mt-4 space-y-3 max-w-xl">
                <label className="block">
                  <div className="text-sm text-zinc-300">Aspect Ratio</div>
                  <input value={aiSettings?.default_aspect_ratio ?? '16:9'} onChange={(e) => setAISettings((s) => ({ ...(s ?? {}), default_aspect_ratio: e.target.value }))} className="mt-1 w-full rounded-md bg-zinc-800 p-2 text-white" />
                </label>
                <label className="block">
                  <div className="text-sm text-zinc-300">Quality</div>
                  <select value={aiSettings?.default_quality ?? 'standard'} onChange={(e) => setAISettings((s) => ({ ...(s ?? {}), default_quality: e.target.value }))} className="mt-1 w-full rounded-md bg-zinc-800 p-2 text-white">
                    <option value="low">Low</option>
                    <option value="standard">Standard</option>
                    <option value="high">High</option>
                  </select>
                </label>
                <label className="block">
                  <div className="text-sm text-zinc-300">Style Preset</div>
                  <input value={aiSettings?.default_style ?? ''} onChange={(e) => setAISettings((s) => ({ ...(s ?? {}), default_style: e.target.value }))} className="mt-1 w-full rounded-md bg-zinc-800 p-2 text-white" />
                </label>
                <label className="block">
                  <div className="text-sm text-zinc-300">Negative Prompt Defaults</div>
                  <input value={aiSettings?.negative_prompt ?? ''} onChange={(e) => setAISettings((s) => ({ ...(s ?? {}), negative_prompt: e.target.value }))} className="mt-1 w-full rounded-md bg-zinc-800 p-2 text-white" />
                </label>

                <div className="flex gap-2 mt-4">
                  <button onClick={saveAISettings} disabled={saving} className="rounded bg-violet-600 px-4 py-2 font-medium">Save Defaults</button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
      {showSavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowSavedModal(false)} />
          <div className="relative z-10 w-full max-w-md rounded-xl bg-zinc-900 p-6 text-white">
            <h3 className="text-lg font-semibold">Settings saved</h3>
            <p className="mt-2 text-sm text-zinc-300">Your AI settings and provider API key were saved locally.</p>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setShowSavedModal(false)} className="rounded bg-violet-600 px-4 py-2 font-medium">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
