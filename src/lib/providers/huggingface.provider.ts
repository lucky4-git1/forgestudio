import { InferenceClient, type InferenceProviderOrPolicy } from '@huggingface/inference';
import type { AIProvider, AIProviderResult, GenerationOptions } from '@/types';

const DEFAULT_IMAGE_MODEL = 'black-forest-labs/FLUX.1-schnell';
const DEFAULT_VIDEO_MODEL = 'meituan-longcat/LongCat-Video';
const DEFAULT_PROVIDER = 'nscale';

function getApiKey(override?: string): string {
  const key =
    override ?? process.env.HUGGINGFACE_API_KEY ?? process.env.HF_TOKEN;
  if (!key) {
    throw new Error(
      'Hugging Face API key is not set; set HUGGINGFACE_API_KEY or HF_TOKEN',
    );
  }
  return key;
}

function getImageModel(override?: string): string {
  return override ?? process.env.HUGGINGFACE_IMAGE_MODEL ?? process.env.HUGGINGFACE_MODEL ?? DEFAULT_IMAGE_MODEL;
}

function getVideoModel(override?: string): string {
  return override ?? process.env.HUGGINGFACE_VIDEO_MODEL ?? DEFAULT_VIDEO_MODEL;
}

function getImageProvider(override?: string): InferenceProviderOrPolicy {
  return (override ?? process.env.HUGGINGFACE_IMAGE_PROVIDER ?? process.env.HUGGINGFACE_INFERENCE_PROVIDER ??
    DEFAULT_PROVIDER) as InferenceProviderOrPolicy;
}

function getVideoProvider(override?: string): InferenceProviderOrPolicy {
  return (override ?? process.env.HUGGINGFACE_VIDEO_PROVIDER ?? 'fal-ai') as InferenceProviderOrPolicy;
}

function aspectToDimensions(ratio?: string): { width: number; height: number } {
  switch (ratio) {
    case '16:9':
      return { width: 1344, height: 768 };
    case '9:16':
      return { width: 768, height: 1344 };
    case '4:3':
      return { width: 1152, height: 896 };
    case '3:4':
      return { width: 896, height: 1152 };
    case '1:1':
    default:
      return { width: 1024, height: 1024 };
  }
}

async function toBufferAndMime(
  input: Blob | string | any,
  defaultMime: string,
): Promise<{ data: Buffer; mimeType: string }> {
  if (typeof input === 'string') {
    if (input.startsWith('data:')) {
      const match = input.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        return { data: Buffer.from(match[2], 'base64'), mimeType: match[1] };
      }
    }
    if (input.startsWith('http://') || input.startsWith('https://')) {
      const res = await fetch(input);
      const ab = await res.arrayBuffer();
      return {
        data: Buffer.from(ab),
        mimeType: res.headers.get('content-type') || defaultMime,
      };
    }
    return { data: Buffer.from(input, 'utf-8'), mimeType: defaultMime };
  }

  if (input && typeof input.arrayBuffer === 'function') {
    const arrayBuffer = await input.arrayBuffer();
    return {
      data: Buffer.from(arrayBuffer),
      mimeType: (input as Blob).type || defaultMime,
    };
  }

  return { data: Buffer.from(input), mimeType: defaultMime };
}

export const huggingFaceProvider: AIProvider = {
  name: 'huggingface',

  async generateImage(
    prompt: string,
    options?: GenerationOptions,
  ): Promise<AIProviderResult> {
    const client = new InferenceClient(getApiKey(options?.providerApiKey));
    const { width, height } = aspectToDimensions(options?.aspectRatio);

    const image = await client.textToImage({
      provider: getImageProvider(),
      model: getImageModel(options?.image_model),
      inputs: prompt,
      parameters: {
        num_inference_steps: options?.steps ?? 5,
        width,
        height,
        ...(options?.negativePrompt && {
          negative_prompt: options.negativePrompt,
        }),
        ...(options?.seed != null && { seed: options.seed }),
        ...(options?.cfgScale != null && {
          guidance_scale: options.cfgScale,
        }),
      },
    });

    const { data, mimeType } = await toBufferAndMime(image, 'image/png');

    return {
      data,
      mimeType,
    };
  },

  async generateVideo(
    prompt: string,
    options?: GenerationOptions,
  ): Promise<AIProviderResult> {
    const client = new InferenceClient(getApiKey(options?.providerApiKey));

    const video = await client.textToVideo({
      provider: getVideoProvider(),
      model: getVideoModel(options?.video_model),
      inputs: prompt,
    });

    const { data, mimeType } = await toBufferAndMime(video, 'video/mp4');

    return {
      data,
      mimeType,
    };
  },

  async imageToVideo(): Promise<AIProviderResult> {
    throw new Error('Hugging Face provider does not support image-to-video');
  },

  async animateLogo(): Promise<AIProviderResult> {
    throw new Error('Hugging Face provider does not support logo animation');
  },
};
