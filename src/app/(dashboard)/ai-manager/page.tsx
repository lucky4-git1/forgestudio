'use client';

import { useEffect, useState } from 'react';

export default function AIManagerPage() {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetch('/api/ai-manager/analytics').then((r) => r.ok ? r.json() : Promise.reject(r)), fetch('/api/ai-manager/providers').then((r) => r.ok ? r.json() : Promise.reject(r))])
      .then(([a, p]) => {
        setAnalytics(a);
        setProviders(p);
      })
      .catch(async (err) => {
        try {
          const body = await (err.json ? err.json() : Promise.resolve({}));
          setError(body?.error ?? 'Unable to load');
        } catch {
          setError('Unable to load');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading AI Manager…</div>;
  if (error) return <div className="p-8 text-red-400">{error}</div>;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">AI Manager</h1>
        <p className="mt-1 text-zinc-400">Provider & model management, usage, and analytics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-5">
          <h2 className="font-semibold text-white">Summary</h2>
          <div className="mt-3 text-sm text-zinc-300">
            <div>Total requests: {analytics?.totalRequests ?? '—'}</div>
            <div>Successful: {analytics?.successfulRequests ?? '—'}</div>
            <div>Failed: {analytics?.failedRequests ?? '—'}</div>
            <div>Images: {analytics?.imagesGenerated ?? '—'}</div>
            <div>Videos: {analytics?.videosGenerated ?? '—'}</div>
            <div>Credits used: {analytics?.creditsUsed ?? '—'}</div>
            <div>Avg generation time: {analytics?.avgGenerationTime ? `${Math.round(analytics.avgGenerationTime)}s` : 'N/A'}</div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-5">
          <h2 className="font-semibold text-white">Providers</h2>
          <div className="mt-3 text-sm text-zinc-300">
            {providers.map((p) => (
              <div key={p.id} className="mb-3">
                <div className="font-medium text-white">{p.name}</div>
                <div className="text-zinc-400">Image models: {p.models.image.map((m: any) => m.name).join(', ') || '—'}</div>
                <div className="text-zinc-400">Video models: {p.models.video.map((m: any) => m.name).join(', ') || '—'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-5">
        <h2 className="font-semibold text-white">Provider Usage</h2>
        <div className="mt-3 text-sm text-zinc-300">
          {analytics && Object.entries(analytics.providerUsage || {}).map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <div>{k}</div>
              <div>{String(v)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-5">
        <h2 className="font-semibold text-white">Recent Generations</h2>
        <div className="mt-3 text-sm text-zinc-300">
          <table className="w-full table-fixed text-sm">
            <thead>
              <tr className="text-zinc-400">
                <th className="text-left">ID</th>
                <th className="text-left">Type</th>
                <th className="text-left">Status</th>
                <th className="text-left">Provider</th>
                <th className="text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {analytics?.recentGenerations?.map((g: any) => (
                <tr key={g.id} className="border-t border-zinc-800/40">
                  <td className="truncate py-2">{g.id}</td>
                  <td className="py-2">{g.generation_type}</td>
                  <td className="py-2">{g.status}</td>
                  <td className="py-2">{g.provider ?? '—'}</td>
                  <td className="py-2">{new Date(g.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
