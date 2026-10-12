import type { AIProvider, AIProviderResult, GenerationOptions } from '@/types';

function getApiKey(override?: string): string {
  const key = override ?? process.env.TOGETHER_API_KEY;
  if (!key) {
    throw new Error('Together API key is not set; set TOGETHER_API_KEY or provide it in settings');
  }
  return key;
}

export const togetherProvider: AIProvider = {
  name: 'together',

  async generateImage(prompt: string, options?: GenerationOptions): Promise<AIProviderResult> {
    const model = options?.image_model ?? 'black-forest-labs/FLUX.1-schnell-Free';
    const res = await fetch(`https://api.together.xyz/v1/images/generations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getApiKey(options?.providerApiKey)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model,
        steps: options?.steps ?? 4,
        n: 1,
        response_format: 'b64_json',
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Together Image Generation failed: ${res.statusText} ${err}`);
    }

    const data = await res.json();
    return {
      data: Buffer.from(data.data[0].b64_json, 'base64'),
      mimeType: 'image/jpeg',
    };
  },

  async generateVideo(prompt: string, options?: GenerationOptions): Promise<AIProviderResult> {
    throw new Error('Together AI provider does not currently support direct Text-to-Video generation in this version.');
  },

  async imageToVideo(imageBase64: string, prompt: string, options?: GenerationOptions): Promise<AIProviderResult> {
    throw new Error('Together AI provider does not support image-to-video');
  },

  async animateLogo(logoBase64: string, preset: string, options?: GenerationOptions): Promise<AIProviderResult> {
    throw new Error('Together AI provider does not support logo animation');
  },
};
