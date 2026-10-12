import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import https from 'https';

export const dynamic = 'force-dynamic';

const MODEL_URLS: Record<string, { url: string; filename: string }> = {
  'flux-schnell': { url: 'https://huggingface.co/black-forest-labs/FLUX.1-schnell/resolve/main/flux1-schnell.safetensors', filename: 'flux1-schnell.safetensors' },
  'sdxl': { url: 'https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0.safetensors', filename: 'sd_xl_base_1.0.safetensors' },
  'juggernaut': { url: 'https://huggingface.co/RunDiffusion/Juggernaut-XL-v9/resolve/main/Juggernaut-XL_v9_RunDiffusionPhoto_v2.safetensors', filename: 'juggernaut_xl_v9.safetensors' },
  // Just placeholders for video/llm to show architecture
  'wan-2-2': { url: 'https://huggingface.co/Wan-AI/Wan2.2-T2V-1.3B/resolve/main/model.safetensors', filename: 'wan_2_2.safetensors' }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const modelId = searchParams.get('modelId');

  if (!modelId || !MODEL_URLS[modelId]) {
    return new Response('Invalid model ID', { status: 400 });
  }

  const modelInfo = MODEL_URLS[modelId];

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function sendEvent(data: any) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      const rootDir = process.cwd();
      const modelsDir = path.join(rootDir, '.comfyui', 'models', 'checkpoints');

      try {
        await fs.promises.mkdir(modelsDir, { recursive: true });
        const filePath = path.join(modelsDir, modelInfo.filename);

        sendEvent({ status: 'running', progress: 0 });

        await new Promise<void>((resolve, reject) => {
          const file = fs.createWriteStream(filePath);

          function fetchUrl(url: string) {
            https.get(url, (response) => {
              if (response.statusCode === 301 || response.statusCode === 302) {
                fetchUrl(response.headers.location!);
                return;
              }

              if (response.statusCode !== 200) {
                reject(new Error(`Failed to download: ${response.statusCode}`));
                return;
              }

              const totalBytes = parseInt(response.headers['content-length'] || '0', 10);
              let downloadedBytes = 0;
              let lastReport = 0;

              response.on('data', (chunk) => {
                downloadedBytes += chunk.length;
                if (totalBytes > 0) {
                  const percent = Math.round((downloadedBytes / totalBytes) * 100);
                  if (percent > lastReport) {
                    lastReport = percent;
                    sendEvent({ status: 'running', progress: percent });
                  }
                }
              });

              response.pipe(file);
              file.on('finish', () => { file.close(); resolve(); });
            }).on('error', reject);
          }

          fetchUrl(modelInfo.url);
        });

        sendEvent({ status: 'completed', progress: 100 });
        controller.close();
      } catch (err: any) {
        sendEvent({ status: 'error', message: err.message, progress: 0 });
        controller.close();
      }
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
