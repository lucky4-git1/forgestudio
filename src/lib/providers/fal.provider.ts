import type { AIProvider, AIProviderResult, GenerationOptions } from '@/types';

function getApiKey(override?: string): string {
  const key = override ?? process.env.FAL_KEY;
  if (!key) {
    throw new Error('Fal API key is not set; set FAL_KEY or provide it in settings');
  }
  return key;
}

export const falProvider: AIProvider = {
  name: 'fal',

  async generateImage(prompt: string, options?: GenerationOptions): Promise<AIProviderResult> {
    const model = options?.image_model ?? 'fal-ai/flux-pro';
    const res = await fetch(`https://fal.run/${model}`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${getApiKey(options?.providerApiKey)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image_size: options?.aspectRatio === '16:9' ? 'landscape_16_9' : 'square_hd',
        num_inference_steps: options?.steps ?? 28,
        guidance_scale: options?.cfgScale ?? 3.5,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Fal Image Generation failed: ${res.statusText} ${err}`);
    }

    const data = await res.json();
    return {
      data: data.images[0].url,
      mimeType: data.images[0].content_type ?? 'image/jpeg',
    };
  },

  async generateVideo(prompt: string, options?: GenerationOptions): Promise<AIProviderResult> {
    const model = options?.video_model ?? 'fal-ai/kling-video/v1/standard/text-to-video';
    const res = await fetch(`https://fal.run/${model}`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${getApiKey(options?.providerApiKey)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        aspect_ratio: options?.aspectRatio ?? '16:9',
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Fal Video Generation failed: ${res.statusText} ${err}`);
    }

    const data = await res.json();
    return {
      data: data.video.url,
      mimeType: data.video.content_type ?? 'video/mp4',
    };
  },

  async imageToVideo(imageBase64: string, prompt: string, options?: GenerationOptions): Promise<AIProviderResult> {
    // imageBase64 could be a data URI or a URL. 
    // Fal requires a public URL or a base64 Data URI.
    const imageUrl = imageBase64.startsWith('http') ? imageBase64 : (imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`);
    const model = 'fal-ai/kling-video/v1/standard/image-to-video';

    const res = await fetch(`https://fal.run/${model}`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${getApiKey(options?.providerApiKey)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image_url: imageUrl,
        aspect_ratio: options?.aspectRatio ?? '16:9',
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Fal Image-to-Video failed: ${res.statusText} ${err}`);
    }

    const data = await res.json();
    return {
      data: data.video.url,
      mimeType: data.video.content_type ?? 'video/mp4',
    };
  },

  async animateLogo(logoBase64: string, preset: string, options?: GenerationOptions): Promise<AIProviderResult> {
    const imageUrl = logoBase64.startsWith('http') ? logoBase64 : (logoBase64.startsWith('data:') ? logoBase64 : `data:image/png;base64,${logoBase64}`);
    const model = 'fal-ai/fast-svd/image-to-video';

    const res = await fetch(`https://fal.run/${model}`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${getApiKey(options?.providerApiKey)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: imageUrl,
        motion_bucket_id: 127,
        cond_aug: 0.02,
        steps: 20
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Fal Logo Animation failed: ${res.statusText} ${err}`);
    }

    const data = await res.json();
    // Fast-SVD returns array of video frames or a single video depending on endpoint.
    // wait, fast-svd might return { video: { url: ... } } or { url: ... }
    return {
      data: data.video?.url ?? data.url,
      mimeType: 'video/mp4',
    };
  },
};
