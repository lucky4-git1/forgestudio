import { handleGeneration } from '@/lib/generation-handler';
import type { GenerationOptions, GenerationRequest } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 300;

async function fileToBase64(file: File) {
  return Buffer.from(await file.arrayBuffer()).toString('base64');
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const logo = formData.get('logo');

  if (!(logo instanceof File)) {
    return Response.json({ error: 'Logo file is required' }, { status: 400 });
  }

  const preset = formData.get('preset')?.toString() ?? 'reveal';
  const payload: GenerationRequest = {
    type: 'logo-animation',
    prompt: `Analyze this logo and create a ${preset} animation prompt.`,
    options: {
      sourceImage: await fileToBase64(logo),
      animationPreset: preset as GenerationOptions['animationPreset'],
      projectId: formData.get('projectId')?.toString(),
    },
  };

  return handleGeneration(payload);
}
