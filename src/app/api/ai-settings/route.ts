import { getAuthenticatedUser, unauthorized } from '@/lib/api-auth';
import { getLocalAISettings, upsertLocalAISettings } from '@/lib/localdb.server';

export async function GET() {
  const { user } = await getAuthenticatedUser();
  if (!user) return unauthorized();

  const settings = await getLocalAISettings(user.id);
  return Response.json(settings ?? {});
}

export async function PUT(request: Request) {
  const { user } = await getAuthenticatedUser();
  if (!user) return unauthorized();

  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const settings = await upsertLocalAISettings(user.id, body);
    return Response.json(settings);
  } catch (err: any) {
    return Response.json({ error: err?.message ?? 'Unable to save' }, { status: 500 });
  }
}
