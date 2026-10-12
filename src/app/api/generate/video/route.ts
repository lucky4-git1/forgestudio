import { handleGeneration } from '@/lib/generation-handler';
import type { GenerationRequest } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 300;

function seconds(value: string | number | undefined) {
  if (typeof value === 'number') return value;
  if (!value) return 5;
  return Number(value.replace('s', '')) || 5;
}

export async function POST(request: Request) {
  const body = await request.json();
  const payload: GenerationRequest = {
    type: 'text-to-video',
    prompt: body.prompt,
    options: {
      duration: seconds(body.duration),
      projectId: body.projectId,
    },
  };

  return handleGeneration(payload);
}
