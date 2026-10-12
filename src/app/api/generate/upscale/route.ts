import { getAuthenticatedUser } from '@/lib/api-auth';
import { generateWithAI } from '@/lib/ai/orchestrator';
import { randomUUID } from 'crypto';
import path from 'path';
import { promises as fs } from 'fs';
import { storeLocalAsset } from '@/lib/localdb.server';
import type { GenerationRequest } from '@/types';

function parseDataUrl(value: string) {
  const match = value.match(/^data:(.+?);base64,(.+)$/);
  return match ? match[2] : value;
}

export async function POST(request: Request) {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { imageBase64, scale = 2 } = await request.json();

    if (!imageBase64) {
      return Response.json({ error: 'imageBase64 is required' }, { status: 400 });
    }

    // Mock generation request since orchestrator expects one
    const genReq: GenerationRequest = {
      type: 'text-to-image', // Upscale modifies an image
      prompt: 'upscale',
      options: {
        sourceImage: imageBase64,
        // we can pass scale through options or if we add a dedicated method we call it directly
      }
    };

    // We'll call the provider directly here since the orchestrator doesn't natively expose upscale yet
    let settings: any = null;
    if (supabase) {
      const { getUserAISettings } = await import('@/lib/ai/settings');
      settings = await getUserAISettings(supabase, user.id);
    } else {
      const { getLocalAISettings } = await import('@/lib/localdb.server');
      settings = await getLocalAISettings(user.id);
    }
    const providerName = settings?.provider ?? process.env.AI_PROVIDER ?? 'comfyui';

    // To keep it simple, let's load the provider
    const { comfyuiProvider } = await import('@/lib/providers/comfyui.provider');
    const { huggingFaceProvider } = await import('@/lib/providers/huggingface.provider');
    const providers: Record<string, any> = {
      comfyui: comfyuiProvider,
      huggingface: huggingFaceProvider,
    };

    const provider = providers[providerName] || comfyuiProvider;

    if (!provider.upscaleImage) {
      throw new Error(`Provider ${providerName} does not support upscaling`);
    }

    const result = await provider.upscaleImage(imageBase64, scale, genReq.options);

    // Save the result
    const ext = result.mimeType.includes('png') ? 'png' : 'jpg';
    const filename = `${randomUUID()}_upscaled.${ext}`;
    
    let fileUrl: string;

    if (supabase) {
      const bytes = typeof result.data === 'string' ? Buffer.from(parseDataUrl(result.data), 'base64') : result.data;
      const uploadPath = `${user.id}/${filename}`;
      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(uploadPath, bytes, { contentType: result.mimeType });
      if (uploadError) throw new Error(uploadError.message);
      
      const { data } = supabase.storage.from('assets').getPublicUrl(uploadPath);
      fileUrl = data.publicUrl;

      // store metadata
      await supabase.from('assets').insert({
        user_id: user.id,
        type: 'image',
        prompt: 'Upscaled Image',
        file_url: fileUrl,
        thumbnail_url: fileUrl,
        metadata: { provider: providerName, upscaled: true, scale }
      });
    } else {
      const bytes = typeof result.data === 'string' ? Buffer.from(parseDataUrl(result.data), 'base64') : result.data;
      const outDir = path.join(process.cwd(), 'public', 'generated', user.id);
      await fs.mkdir(outDir, { recursive: true });
      await fs.writeFile(path.join(outDir, filename), bytes);
      fileUrl = `/generated/${user.id}/${filename}`;

      await storeLocalAsset(user.id, {
        project_id: null,
        type: 'image',
        prompt: 'Upscaled Image',
        file_url: fileUrl,
        thumbnail_url: fileUrl,
        metadata: { provider: providerName, upscaled: true, scale }
      });
    }

    return Response.json({ imageUrl: fileUrl });
  } catch (error: any) {
    console.error('Upscale failed:', error);
    return Response.json({ error: error.message || 'Upscale failed' }, { status: 500 });
  }
}
