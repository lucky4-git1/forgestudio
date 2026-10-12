'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Plus, Trash2, Type, ImageIcon } from 'lucide-react';

interface BrandKit {
  id: string;
  name: string;
  colors: string[] | null;
  fonts: string[] | null;
  logos: string[] | null;
  created_at: string;
}

export default function BrandKitsPage() {
  const [items, setItems] = useState<BrandKit[]>([]);
  const [name, setName] = useState('');
  const [colors, setColors] = useState('#7c3aed,#06b6d4,#f8fafc');
  const [fonts, setFonts] = useState('Inter');

  async function load() {
    const res = await fetch('/api/brand-kits');
    if (res.ok) {
      const data = await res.json();
      setItems(data.brandKits ?? []);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createKit() {
    if (!name.trim()) return;
    const res = await fetch('/api/brand-kits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, colors, fonts }),
    });
    if (res.ok) {
      setName('');
      load();
    }
  }

  async function deleteKit(id: string) {
    await fetch(`/api/brand-kits/${id}`, { method: 'DELETE' });
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Brand Kits</h1>
        <p className="mt-1 text-zinc-400">Reusable colors, fonts, logos, and brand assets.</p>
      </div>

      <div className="mb-8 grid gap-4 rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-5 lg:grid-cols-[1fr_1fr_1fr_auto]">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Brand kit name" className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40" />
        <input value={colors} onChange={(e) => setColors(e.target.value)} placeholder="#111827,#7c3aed" className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40" />
        <input value={fonts} onChange={(e) => setFonts(e.target.value)} placeholder="Inter, Satoshi" className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40" />
        <button onClick={createKit} className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-500">
          <Plus className="h-4 w-4" />
          Create
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((kit, index) => (
          <motion.div key={kit.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-5">
            <div className="mb-5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-violet-500/10 p-2 text-violet-300">
                  <Palette className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">{kit.name}</h2>
                  <p className="text-xs text-zinc-500">{new Date(kit.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <button onClick={() => deleteKit(kit.id)} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-red-400">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-4 flex gap-2">
              {(kit.colors ?? []).map((color) => (
                <span key={color} title={color} className="h-8 w-8 rounded-full border border-white/10" style={{ backgroundColor: color }} />
              ))}
            </div>
            <div className="space-y-2 text-sm text-zinc-400">
              <p className="flex items-center gap-2"><Type className="h-4 w-4" /> {(kit.fonts ?? []).join(', ') || 'No fonts saved'}</p>
              <p className="flex items-center gap-2"><ImageIcon className="h-4 w-4" /> {(kit.logos ?? []).length} saved logos</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
