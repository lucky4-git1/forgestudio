import { nvidiaProvider } from '@/lib/providers/nvidia.provider';
import { huggingFaceProvider } from '@/lib/providers/huggingface.provider';
import { comfyuiProvider } from '@/lib/providers/comfyui.provider';
import { falProvider } from '@/lib/providers/fal.provider';
import { togetherProvider } from '@/lib/providers/together.provider';
import { replicateProvider } from '@/lib/providers/replicate.provider';
import { getUserAISettings } from './settings';
import { getLocalAISettings } from '@/lib/localdb.server';
import type {
  AIProvider,
  AIProviderResult,
  GenerationRequest,
  GenerationType,
} from '@/types';

export interface OrchestratedGeneration extends AIProviderResult {
  provider: string;
  assetType: 'image' | 'video' | 'logo';
  prompt: string;
}

const providers: Record<string, AIProvider> = {
  nvidia: nvidiaProvider,
  huggingface: huggingFaceProvider,
  comfyui: comfyuiProvider,
  fal: falProvider,
  together: togetherProvider,
  replicate: replicateProvider,
};

function getProvider(name = process.env.AI_PROVIDER ?? 'huggingface'): AIProvider {
  const provider = providers[name];
  if (!provider) {
    throw new Error(`AI provider "${name}" is not configured`);
  }
  return provider;
}

function buildPrompt(request: GenerationRequest): string {
  const options = request.options ?? {};

  switch (request.type) {
    case 'logo':
      return [
        `Create a premium transparent PNG logo for ${options.brandName ?? 'a brand'}.`,
        `Industry: ${options.industry ?? 'general business'}.`,
        `Style: ${options.style ?? 'modern'}.`,
        request.prompt,
        'Centered mark, clean typography, no mockup, no background.',
      ]
        .filter(Boolean)
        .join(' ');
    case 'marketing-creative':
      return [
        `Create a production-ready marketing creative for ${options.product ?? 'a product'}.`,
        `Audience: ${options.audience ?? 'target customers'}.`,
        `Goal: ${options.goal ?? 'conversion'}.`,
        request.prompt,
        'High quality advertising visual, polished composition, usable for social media.',
      ]
        .filter(Boolean)
        .join(' ');
    default:
      return request.prompt;
  }
}

export async function generateWithAI(
  request: GenerationRequest,
  context?: { supabase?: any; userId?: string },
): Promise<OrchestratedGeneration> {
  // Load user settings if available to determine provider and models
  let providerName = process.env.AI_PROVIDER ?? 'huggingface';
  let userProviderApiKey: string | undefined = undefined;
  if (context?.supabase && context?.userId) {
    try {
      const settings = await getUserAISettings(context.supabase, context.userId);
      if (settings?.inference_mode === 'local') {
        providerName = 'comfyui';
      } else if (settings?.provider) {
        providerName = settings.provider;
      }
      // capture user's provider API key (do not expose to client)
      if (settings?.provider_api_key) {
        // we'll attach this to options below
        userProviderApiKey = settings.provider_api_key as any;
      }
    } catch (err) {
      // fallback to env/provider defaults
    }
  } else if (context?.userId) {
    // local-only mode: try local DB for AI settings
    try {
      const settings = await getLocalAISettings(context.userId);
      if (settings?.inference_mode === 'local') {
        providerName = 'comfyui';
      } else if (settings?.provider) {
        providerName = settings.provider;
      }
      if (settings?.provider_api_key) userProviderApiKey = settings.provider_api_key as any;
    } catch (err) {
      // ignore and fall back to env
    }
  }

  const provider = getProvider(providerName);
  const prompt = buildPrompt(request);
  const model =
    providerName === 'huggingface'
      ? process.env.HUGGINGFACE_MODEL ?? 'black-forest-labs/FLUX.1-schnell'
      : undefined;

  console.log('[orchestrator] provider selected:', providerName);
  console.log('[orchestrator] model selected:', model ?? '(provider default)');
  console.log('[orchestrator] prompt received:', prompt);
  console.log('[orchestrator] generation type:', request.type);
  const options = request.options ?? {};
  // attach user's stored provider API key if present (overrides server env)
  if ((userProviderApiKey as any) && !options.providerApiKey) {
    options.providerApiKey = (userProviderApiKey as any) as any;
  }

  switch (request.type) {
    case 'text-to-image':
      return {
        ...(await provider.generateImage(prompt, options)),
        provider: provider.name,
        assetType: 'image',
        prompt,
      };
    case 'logo':
      return {
        ...(await provider.generateImage(prompt, {
          ...options,
          aspectRatio: '1:1',
        })),
        provider: provider.name,
        assetType: 'logo',
        prompt,
      };
    case 'marketing-creative':
      return {
        ...(await provider.generateImage(prompt, options)),
        provider: provider.name,
        assetType: 'image',
        prompt,
      };
    case 'text-to-video':
      return {
        ...(await provider.generateVideo(prompt, options)),
        provider: provider.name,
        assetType: 'video',
        prompt,
      };
    case 'image-to-video':
      if (!options.sourceImage) {
        throw new Error('A source image is required for image-to-video');
      }
      return {
        ...(await provider.imageToVideo(options.sourceImage, prompt, options)),
        provider: provider.name,
        assetType: 'video',
        prompt,
      };
    case 'logo-animation':
      if (!options.sourceImage) {
        throw new Error('A source logo is required for logo animation');
      }
      return {
        ...(await provider.animateLogo(
          options.sourceImage,
          options.animationPreset ?? 'reveal',
          options,
        )),
        provider: provider.name,
        assetType: 'video',
        prompt,
      };
    default: {
      const exhaustive: never = request.type;
      throw new Error(`Unsupported generation type: ${exhaustive}`);
    }
  }
}

export function getGenerationAssetType(type: GenerationType) {
  if (type === 'logo') return 'logo';
  if (type.includes('video') || type === 'logo-animation') return 'video';
  return 'image';
}
