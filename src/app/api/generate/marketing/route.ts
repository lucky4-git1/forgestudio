import { handleGeneration } from '@/lib/generation-handler';
import type { GenerationRequest } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 300;

function aspectForFormat(format?: string) {
  if (format === 'story') return '9:16';
  if (format === 'banner') return '16:9';
  return '1:1';
}

export async function POST(request: Request) {
  const body = await request.json();
  const payload: GenerationRequest = {
    type: 'marketing-creative',
    prompt: body.prompt ?? body.format ?? 'social media creative',
    options: {
      product: body.productName,
      audience: body.targetAudience,
      goal: body.goal,
      aspectRatio: aspectForFormat(body.format),
      projectId: body.projectId,
    },
  };

  return handleGeneration(payload);
}
