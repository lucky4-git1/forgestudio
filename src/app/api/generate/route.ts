import { handleGeneration } from '@/lib/generation-handler';
import type { GenerationRequest } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(request: Request) {
  let body: GenerationRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  return handleGeneration(body);
}
