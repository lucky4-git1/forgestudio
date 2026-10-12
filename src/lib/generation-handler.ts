import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { CREDIT_COSTS, recordFailedGeneration } from '@/lib/credits';
import { generateWithAI } from '@/lib/ai/orchestrator';
import { getAuthenticatedUser, unauthorized } from '@/lib/api-auth';
import { createPendingGeneration, storeLocalAsset } from '@/lib/localdb.server';
import type { GenerationRequest, GenerationType } from '@/types';

const VALID_TYPES: GenerationType[] = [
  'text-to-image',
  'logo',
  'marketing-creative',
  'text-to-video',
  'image-to-video',
  'logo-animation',
];

function parseDataUrl(value: string) {
  const match = value.match(/^data:(.+?);base64,(.+)$/);
  return match ? match[2] : value;
}

function extensionFor(mimeType: string) {
  if (mimeType.includes('video')) return 'mp4';
  if (mimeType.includes('jpeg')) return 'jpg';
  if (mimeType.includes('webp')) return 'webp';
  return 'png';
}

async function downloadRemoteFile(url: string): Promise<{ buffer: Buffer; mimeType: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download remote asset: ${res.statusText}`);
  const arrayBuffer = await res.arrayBuffer();
  const mimeType = res.headers.get('content-type') || 'application/octet-stream';
  return { buffer: Buffer.from(arrayBuffer), mimeType };
}

async function storeAsset(
  supabase: any,
  userId: string,
  result: Awaited<ReturnType<typeof generateWithAI>>,
  request: GenerationRequest,
) {
  const isRemoteUrl = typeof result.data === 'string' && /^https?:\/\//.test(result.data);
  let fileUrl: string;

  const metadata = {
    provider: result.provider,
    generation_type: request.type,
    options: request.options ?? {},
    generated_at: new Date().toISOString(),
  };

  if (supabase) {
    if (isRemoteUrl) {
      // Download the remote file and re-upload to Supabase so it persists
      const { buffer, mimeType } = await downloadRemoteFile(result.data as string);
      const ext = extensionFor(mimeType || result.mimeType);
      const uploadPath = `${userId}/${randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(uploadPath, buffer, { contentType: mimeType || result.mimeType, upsert: false });
      if (uploadError) throw new Error(`Unable to upload generated asset: ${uploadError.message}`);
      const { data } = supabase.storage.from('assets').getPublicUrl(uploadPath);
      fileUrl = data.publicUrl;
    } else {
      const bytes =
        typeof result.data === 'string'
          ? Buffer.from(parseDataUrl(result.data), 'base64')
          : result.data;
      const uploadPath = `${userId}/${randomUUID()}.${extensionFor(result.mimeType)}`;
      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(uploadPath, bytes, { contentType: result.mimeType, upsert: false });
      if (uploadError) throw new Error(`Unable to upload generated asset: ${uploadError.message}`);
      const { data } = supabase.storage.from('assets').getPublicUrl(uploadPath);
      fileUrl = data.publicUrl;
    }
  } else if (isRemoteUrl) {
    // Local mode: download the remote file so it persists on disk
    const { buffer, mimeType } = await downloadRemoteFile(result.data as string);
    const outDir = path.join(process.cwd(), 'public', 'generated', userId);
    await fs.mkdir(outDir, { recursive: true });
    const ext = extensionFor(mimeType || result.mimeType);
    const filename = `${randomUUID()}.${ext}`;
    await fs.writeFile(path.join(outDir, filename), buffer);
    fileUrl = `/generated/${userId}/${filename}`;
  } else {
    const bytes =
      typeof result.data === 'string'
        ? Buffer.from(parseDataUrl(result.data), 'base64')
        : result.data;
    const outDir = path.join(process.cwd(), 'public', 'generated', userId);
    await fs.mkdir(outDir, { recursive: true });
    const filename = `${randomUUID()}.${extensionFor(result.mimeType)}`;
    await fs.writeFile(path.join(outDir, filename), bytes);
    fileUrl = `/generated/${userId}/${filename}`;
  }

  // For videos, use the file URL itself as the thumbnail (browser can render first frame)
  const thumbnailUrl = result.assetType === 'video' ? fileUrl : fileUrl;

  if (supabase) {
    const { data: asset, error } = await supabase
      .from('assets')
      .insert({
        user_id: userId,
        project_id: request.options?.projectId ?? null,
        type: result.assetType,
        prompt: result.prompt,
        metadata,
        file_url: fileUrl,
        thumbnail_url: thumbnailUrl,
      })
      .select('*')
      .single();

    if (error) throw new Error(`Unable to save asset record: ${error.message}`);
    return asset;
  }

  return storeLocalAsset(userId, {
    project_id: request.options?.projectId ?? null,
    type: result.assetType,
    prompt: result.prompt,
    metadata,
    file_url: fileUrl,
    thumbnail_url: thumbnailUrl,
  });
}

export async function handleGeneration(body: GenerationRequest) {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return unauthorized();

  if (!VALID_TYPES.includes(body.type) || !body.prompt?.trim()) {
    return Response.json(
      { error: 'A valid generation type and prompt are required' },
      { status: 400 },
    );
  }

  let pendingGenerationId: string | undefined;
  try {
    if (supabase) {
      const { data: pending, error: pendingError } = await supabase
        .from('generations')
        .insert({
          user_id: user.id,
          provider: null,
          generation_type: body.type,
          credits_used: 0,
          status: 'pending',
        })
        .select('id')
        .single();
      pendingGenerationId = pending?.id as string | undefined;
      if (pendingError) {
        console.error('[generate] Failed to create pending generation:', pendingError.message);
      }
    } else {
      const pending = await createPendingGeneration(user.id, body.type);
      pendingGenerationId = pending.id;
    }
  } catch (e) {
    console.error('[generate] Pending generation creation error', e);
  }

  console.log('[generate] request received:', {
    type: body.type,
    prompt: body.prompt,
    userId: user.id,
    provider: process.env.AI_PROVIDER ?? 'huggingface',
    model: process.env.HUGGINGFACE_MODEL ?? 'black-forest-labs/FLUX.1-schnell',
  });

  try {
    const result = await generateWithAI(body, { supabase, userId: user.id });
    console.log('[generate] provider returned:', {
      provider: result.provider,
      mimeType: result.mimeType,
      dataSize: Buffer.isBuffer(result.data) ? result.data.length : typeof result.data,
    });

    const asset = await storeAsset(supabase, user.id, result, body);
    console.log('[generate] asset saved:', { id: asset.id, fileUrl: asset.file_url });

    const finalizedId = pendingGenerationId ?? randomUUID();

    return Response.json({
      id: finalizedId,
      asset,
      assetId: asset.id,
      fileUrl: asset.file_url,
      imageUrl: asset.file_url,
      videoUrl: asset.file_url,
      thumbnailUrl: asset.thumbnail_url,
      creditsUsed: CREDIT_COSTS[body.type],
      generationType: body.type,
      status: 'completed',
      createdAt: asset.created_at,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Generation failed';
    console.error('[generate] generation failed:', message);
    await recordFailedGeneration(user.id, body.type, undefined, pendingGenerationId).catch(
      () => undefined,
    );
    return Response.json({ error: message }, { status: 500 });
  }
}
