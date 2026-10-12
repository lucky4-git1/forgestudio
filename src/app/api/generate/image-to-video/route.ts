import { handleGeneration } from '@/lib/generation-handler';
import type { GenerationRequest } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 300;

async function fileToBase64(file: File) {
  return Buffer.from(await file.arrayBuffer()).toString('base64');
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const image = formData.get('image');

  if (!(image instanceof File)) {
    return Response.json({ error: 'Image file is required' }, { status: 400 });
  }

  const prompt =
    formData.get('motion_prompt')?.toString() ||
    'Animate this image with tasteful cinematic motion.';
  const payload: GenerationRequest = {
    type: 'image-to-video',
    prompt,
    options: {
      sourceImage: await fileToBase64(image),
      projectId: formData.get('projectId')?.toString(),
    },
  };

  return handleGeneration(payload);
}
