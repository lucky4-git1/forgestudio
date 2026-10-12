import { handleGeneration } from '@/lib/generation-handler';
import type { GenerationRequest } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(request: Request) {
  const body = await request.json();
  const brandName = typeof body.brandName === 'string' ? body.brandName.trim() : '';
  const payload: GenerationRequest = {
    type: 'logo',
    prompt:
      (typeof body.prompt === 'string' ? body.prompt.trim() : '') ||
      (brandName ? `Logo for ${brandName}` : ''),
    options: {
      brandName: body.brandName,
      industry: body.industry,
      style: body.style,
      projectId: body.projectId,
      negativePrompt: 'mockup, photo of business card, busy background',
    },
  };

  return handleGeneration(payload);
}
