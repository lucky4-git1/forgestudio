'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Download, FolderOpen, ImageIcon, Video } from 'lucide-react';

interface Asset {
  id: string;
  type: 'image' | 'video' | 'logo';
  prompt: string | null;
  file_url: string;
  thumbnail_url: string | null;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  assets: Asset[];
}

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects/${params.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setProject(data?.project ?? null))
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <div className="p-8">
      <Link href="/projects" className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Projects
      </Link>

      {loading ? (
        <div className="h-48 animate-pulse rounded-xl bg-zinc-800/40" />
      ) : !project ? (
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-12 text-center">
          <FolderOpen className="mx-auto mb-4 h-10 w-10 text-zinc-600" />
          <h1 className="text-xl font-semibold text-white">Project not found</h1>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">{project.name}</h1>
            <p className="mt-1 text-zinc-400">{project.description || 'Creative workspace'}</p>
          </div>

          {project.assets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-12 text-center">
              <ImageIcon className="mx-auto mb-4 h-10 w-10 text-zinc-600" />
              <p className="text-sm text-zinc-500">No assets saved to this project yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {project.assets.map((asset) => (
                <div key={asset.id} className="overflow-hidden rounded-xl border border-zinc-800/50 bg-zinc-900/50">
                  <div className="relative aspect-square bg-zinc-950">
                    {asset.type === 'video' ? (
                      <video src={asset.file_url} controls className="h-full w-full object-cover" />
                    ) : (
                      <Image src={asset.thumbnail_url ?? asset.file_url} alt={asset.prompt ?? 'Project asset'} fill className="object-cover" />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-500">
                      {asset.type === 'video' ? <Video className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}
                      {asset.type}
                    </div>
                    <p className="line-clamp-2 text-sm text-zinc-300">{asset.prompt || 'Untitled asset'}</p>
                    <a href={asset.file_url} download className="mt-4 inline-flex items-center gap-2 text-sm text-violet-300 hover:text-violet-200">
                      <Download className="h-4 w-4" />
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
