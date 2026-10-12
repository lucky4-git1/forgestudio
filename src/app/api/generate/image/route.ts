import { handleGeneration } from '@/lib/generation-handler';
import type { GenerationRequest } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(request: Request) {
  const body = await request.json();
  const payload: GenerationRequest = {
    type: 'text-to-image',
    prompt: body.prompt,
    options: {
      aspectRatio: body.aspectRatio,
      style: body.style,
      projectId: body.projectId,
    },
  };

  return handleGeneration(payload);
}
