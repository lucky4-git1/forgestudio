import type { AIProvider, AIProviderResult, GenerationOptions } from '@/types';

// ──────────────────────────────────────────────
// NVIDIA AI Provider
// ──────────────────────────────────────────────

const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1_500;
const REQUEST_TIMEOUT_MS = 120_000; // 2 minutes

function getApiKey(override?: string): string {
  const key = override ?? process.env.NVIDIA_API_KEY;
  if (!key) {
    throw new Error('NVIDIA API key is not set; provide it via environment or user settings');
  }
  return key;
}

/**
 * Map user-facing aspect ratio to pixel dimensions used by Stable Diffusion.
 */
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

/**
 * Sleep helper for retry back-off.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Make an HTTP request to the NVIDIA API with retries, timeout and proper
 * error handling.
 */
async function nvidiaFetch(
  path: string,
  body: Record<string, unknown>,
  accept = 'application/json',
  apiKeyOverride?: string,
): Promise<Response> {
  const url = `${NVIDIA_BASE_URL}${path}`;
  const apiKey = getApiKey(apiKeyOverride);

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          Accept: accept,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        return response;
      }

      // Parse error body for logging
      const errorText = await response.text().catch(() => 'unknown');
      lastError = new Error(
        `NVIDIA API ${response.status}: ${errorText}`,
      );

      // Only retry on server errors (5xx) or rate limits (429)
      if (response.status >= 500 || response.status === 429) {
        console.warn(
          `[nvidia] Attempt ${attempt}/${MAX_RETRIES} failed (${response.status}). Retrying…`,
        );
        await sleep(RETRY_DELAY_MS * attempt);
        continue;
      }

      // Client error – don't retry
      throw lastError;
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        lastError = new Error('NVIDIA API request timed out');
      } else if (!(err instanceof Error) || !err.message.startsWith('NVIDIA API')) {
        lastError = err instanceof Error ? err : new Error(String(err));
      } else {
        throw err; // re-throw client errors immediately
      }

      if (attempt < MAX_RETRIES) {
        console.warn(
          `[nvidia] Attempt ${attempt}/${MAX_RETRIES} failed. Retrying…`,
        );
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw lastError ?? new Error('NVIDIA API request failed after retries');
}

/**
 * Poll a NVIDIA async result endpoint until completion or timeout.
 */
async function pollForResult(
  requestId: string,
  pollUrl: string,
  timeoutMs = 300_000,
  apiKeyOverride?: string,
): Promise<Response> {
  const apiKey = getApiKey(apiKeyOverride);
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
      const response = await fetch(pollUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'unknown');
      throw new Error(
        `NVIDIA polling failed (${response.status}): ${errorText}`,
      );
    }

    const data = await response.json();

    if (data.status === 'COMPLETED' || data.status === 'completed') {
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (data.status === 'FAILED' || data.status === 'failed') {
      throw new Error(`NVIDIA generation failed: ${JSON.stringify(data)}`);
    }

    // Still processing – wait before polling again
    await sleep(5_000);
  }

  throw new Error(
    `NVIDIA generation timed out after ${timeoutMs / 1000}s (requestId: ${requestId})`,
  );
}

// ──────────────────────────────────────────────
// Provider Implementation
// ──────────────────────────────────────────────

export const nvidiaProvider: AIProvider = {
  name: 'nvidia',

  // ── Image Generation ────────────────────────
  async generateImage(
    prompt: string,
    options?: GenerationOptions,
  ): Promise<AIProviderResult> {
    const { width, height } = aspectToDimensions(options?.aspectRatio);

    const body: Record<string, unknown> = {
      model: 'stabilityai/stable-diffusion-xl',
      prompt,
      width,
      height,
      steps: options?.steps ?? 30,
      cfg_scale: options?.cfgScale ?? 7,
      sampler: 'K_DPM_2_ANCESTRAL',
      ...(options?.negativePrompt && { negative_prompt: options.negativePrompt }),
      ...(options?.seed != null && { seed: options.seed }),
    };

    const response = await nvidiaFetch('/images/generations', body, 'application/json', options?.providerApiKey);
    const json = await response.json();

    // NVIDIA returns base64 image data in artifacts array
    const artifact = json.artifacts?.[0] ?? json.data?.[0];
    if (!artifact) {
      throw new Error('No image artifact returned from NVIDIA');
    }

    const imageBase64 = artifact.base64 ?? artifact.b64_json;
    if (!imageBase64) {
      throw new Error('NVIDIA returned empty image data');
    }

    return {
      data: Buffer.from(imageBase64, 'base64'),
      mimeType: 'image/png',
    };
  },

  // ── Text-to-Video ───────────────────────────
  async generateVideo(
    prompt: string,
    options?: GenerationOptions,
  ): Promise<AIProviderResult> {
    const body: Record<string, unknown> = {
      model: 'nvidia/cosmos-nemotron-cc-video-generation',
      prompt,
      ...(options?.duration && { duration: options.duration }),
      ...(options?.seed != null && { seed: options.seed }),
    };

    const response = await nvidiaFetch('/video/generations', body, 'application/json', options?.providerApiKey);
    const json = await response.json();

    // Handle async polling if the API returns a request ID
    if (json.reqId || json.request_id) {
      const reqId = json.reqId ?? json.request_id;
      const pollUrl =
        json.pollUrl ??
        `${NVIDIA_BASE_URL}/video/generations/${reqId}`;
      const result = await pollForResult(reqId, pollUrl, undefined, options?.providerApiKey);
      const resultJson = await result.json();

      const videoUrl = resultJson.output?.video_url ?? resultJson.video_url;
      if (videoUrl) {
        return { data: videoUrl, mimeType: 'video/mp4' };
      }

      const videoB64 =
        resultJson.output?.video ?? resultJson.video ?? resultJson.artifacts?.[0]?.base64;
      if (videoB64) {
        return {
          data: Buffer.from(videoB64, 'base64'),
          mimeType: 'video/mp4',
        };
      }

      throw new Error('No video data in NVIDIA polling result');
    }

    // Synchronous response
    const videoUrl = json.output?.video_url ?? json.video_url;
    if (videoUrl) {
      return { data: videoUrl, mimeType: 'video/mp4' };
    }

    const videoB64 =
      json.output?.video ?? json.video ?? json.artifacts?.[0]?.base64;
    if (videoB64) {
      return {
        data: Buffer.from(videoB64, 'base64'),
        mimeType: 'video/mp4',
      };
    }

    throw new Error('No video data returned from NVIDIA');
  },

  // ── Image-to-Video ──────────────────────────
  async imageToVideo(
    imageBase64: string,
    prompt: string,
    options?: GenerationOptions,
  ): Promise<AIProviderResult> {
    const body: Record<string, unknown> = {
      model: 'nvidia/cosmos-nemotron-cc-video-generation',
      prompt,
      image: imageBase64,
      ...(options?.duration && { duration: options.duration }),
      ...(options?.seed != null && { seed: options.seed }),
    };

    const response = await nvidiaFetch('/video/generations', body, 'application/json', options?.providerApiKey);
    const json = await response.json();

    // Handle async polling
    if (json.reqId || json.request_id) {
      const reqId = json.reqId ?? json.request_id;
      const pollUrl =
        json.pollUrl ??
        `${NVIDIA_BASE_URL}/video/generations/${reqId}`;
      const result = await pollForResult(reqId, pollUrl, undefined, options?.providerApiKey);
      const resultJson = await result.json();

      const videoUrl = resultJson.output?.video_url ?? resultJson.video_url;
      if (videoUrl) {
        return { data: videoUrl, mimeType: 'video/mp4' };
      }

      const videoB64 =
        resultJson.output?.video ?? resultJson.video ?? resultJson.artifacts?.[0]?.base64;
      if (videoB64) {
        return {
          data: Buffer.from(videoB64, 'base64'),
          mimeType: 'video/mp4',
        };
      }

      throw new Error('No video data in NVIDIA polling result');
    }

    // Synchronous response
    const videoUrl = json.output?.video_url ?? json.video_url;
    if (videoUrl) {
      return { data: videoUrl, mimeType: 'video/mp4' };
    }

    const videoB64 =
      json.output?.video ?? json.video ?? json.artifacts?.[0]?.base64;
    if (videoB64) {
      return {
        data: Buffer.from(videoB64, 'base64'),
        mimeType: 'video/mp4',
      };
    }

    throw new Error('No video data returned from NVIDIA');
  },

  // ── Logo Animation ──────────────────────────
  async animateLogo(
    logoBase64: string,
    preset: string,
    options?: GenerationOptions,
  ): Promise<AIProviderResult> {
    // Build a motion-descriptive prompt based on the preset
    const motionPrompts: Record<string, string> = {
      reveal: 'Elegant logo reveal animation, clean fade-in with premium lighting and soft depth',
      rotation: 'Smooth 3D rotation animation of a logo, professional spin, studio lighting',
      'energy-burst': 'Dynamic logo animation with refined energy burst, particles, and controlled glow',
      'premium-intro': 'Cinematic premium intro animation for a logo, dramatic reveal, polished brand motion',
      'minimal-motion': 'Minimal logo animation with subtle movement, soft easing, clean modern finish',
      rotate: 'Smooth 360-degree rotation animation of a logo, professional 3D spin, studio lighting',
      pulse: 'Gentle pulsing glow animation of a logo, rhythmic scaling with light emission',
      bounce: 'Elastic bounce animation of a logo, playful vertical bounce with subtle shadow',
      fade: 'Elegant fade-in animation of a logo, gradual opacity reveal with soft bloom effect',
      zoom: 'Dynamic zoom-in animation of a logo, starting from distance to full frame, cinematic',
      slide: 'Smooth slide-in animation of a logo from left to center, professional motion blur',
    };

    const motionPrompt =
      motionPrompts[preset] ??
      `Professional animation of a logo: ${preset}`;

    const body: Record<string, unknown> = {
      model: 'nvidia/cosmos-nemotron-cc-video-generation',
      prompt: motionPrompt,
      image: logoBase64,
      duration: options?.duration ?? 3,
      ...(options?.seed != null && { seed: options.seed }),
    };

    const response = await nvidiaFetch('/video/generations', body, 'application/json', options?.providerApiKey);
    const json = await response.json();

    // Handle async polling
    if (json.reqId || json.request_id) {
      const reqId = json.reqId ?? json.request_id;
      const pollUrl =
        json.pollUrl ??
        `${NVIDIA_BASE_URL}/video/generations/${reqId}`;
      const result = await pollForResult(reqId, pollUrl, undefined, options?.providerApiKey);
      const resultJson = await result.json();

      const videoUrl = resultJson.output?.video_url ?? resultJson.video_url;
      if (videoUrl) {
        return { data: videoUrl, mimeType: 'video/mp4' };
      }

      const videoB64 =
        resultJson.output?.video ?? resultJson.video ?? resultJson.artifacts?.[0]?.base64;
      if (videoB64) {
        return {
          data: Buffer.from(videoB64, 'base64'),
          mimeType: 'video/mp4',
        };
      }

      throw new Error('No video data in NVIDIA polling result');
    }

    const videoUrl = json.output?.video_url ?? json.video_url;
    if (videoUrl) {
      return { data: videoUrl, mimeType: 'video/mp4' };
    }

    const videoB64 =
      json.output?.video ?? json.video ?? json.artifacts?.[0]?.base64;
    if (videoB64) {
      return {
        data: Buffer.from(videoB64, 'base64'),
        mimeType: 'video/mp4',
      };
    }

    throw new Error('No video data returned from NVIDIA');
  },
};
