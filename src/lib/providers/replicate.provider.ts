import type { AIProvider, AIProviderResult, GenerationOptions } from '@/types';

function getApiKey(override?: string): string {
  const key = override ?? process.env.REPLICATE_API_TOKEN;
  if (!key) {
    throw new Error('Replicate API key is not set; set REPLICATE_API_TOKEN or provide it in settings');
  }
  return key;
}

// Helper to poll replicate
async function pollReplicate(url: string, token: string): Promise<any> {
  while (true) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`Replicate polling failed: ${res.statusText}`);
    const data = await res.json();
    if (data.status === 'succeeded') return data.output;
    if (data.status === 'failed' || data.status === 'canceled') throw new Error(`Replicate job ${data.status}: ${data.error}`);
    // Wait before polling again
    await new Promise(r => setTimeout(r, 2000));
  }
}

export const replicateProvider: AIProvider = {
  name: 'replicate',

  async generateImage(prompt: string, options?: GenerationOptions): Promise<AIProviderResult> {
    const token = getApiKey(options?.providerApiKey);
    const modelVersion = '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b'; // generic stable diffusion default
    
    const res = await fetch(`https://api.replicate.com/v1/predictions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: modelVersion,
        input: {
          prompt,
          num_inference_steps: options?.steps ?? 25,
          guidance_scale: options?.cfgScale ?? 7.5,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Replicate Image Generation failed: ${res.statusText} ${err}`);
    }

    const data = await res.json();
    const output = await pollReplicate(data.urls.get, token);
    
    // Output is usually an array of URLs for images
    const outputUrl = Array.isArray(output) ? output[0] : output;

    return {
      data: outputUrl,
      mimeType: 'image/png',
    };
  },

  async generateVideo(prompt: string, options?: GenerationOptions): Promise<AIProviderResult> {
    const token = getApiKey(options?.providerApiKey);
    // fallback to zeroscope
    const modelVersion = '9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351'; 

    const res = await fetch(`https://api.replicate.com/v1/predictions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: modelVersion,
        input: { prompt },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Replicate Video Generation failed: ${res.statusText} ${err}`);
    }

    const data = await res.json();
    const output = await pollReplicate(data.urls.get, token);

    return {
      data: Array.isArray(output) ? output[0] : output,
      mimeType: 'video/mp4',
    };
  },

  async imageToVideo(imageBase64: string, prompt: string, options?: GenerationOptions): Promise<AIProviderResult> {
    const token = getApiKey(options?.providerApiKey);
    const imageUrl = imageBase64.startsWith('http') ? imageBase64 : (imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`);
    
    // Stability AI SVD
    const modelVersion = 'e22e77495f2fb83c34d5fc567eb922ea2d2241516faa1c4abfe32ecea0e4dec5'; 

    const res = await fetch(`https://api.replicate.com/v1/predictions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: modelVersion,
        input: {
          cond_aug: 0.02,
          decoding_t: 7,
          image: imageUrl,
          video_length: "14_frames_with_svd"
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Replicate Image-to-Video failed: ${res.statusText} ${err}`);
    }

    const data = await res.json();
    const output = await pollReplicate(data.urls.get, token);

    return {
      data: output,
      mimeType: 'video/mp4',
    };
  },

  async animateLogo(logoBase64: string, preset: string, options?: GenerationOptions): Promise<AIProviderResult> {
    return this.imageToVideo(logoBase64, "", options);
  },
};
