import { getUserCredits } from '@/lib/credits';
import { getAuthenticatedUser, unauthorized } from '@/lib/api-auth';
import { getLocalUser, updateLocalUser } from '@/lib/localdb.server';

export async function GET() {
  const { user } = await getAuthenticatedUser();
  if (!user) return unauthorized();

  const profile = await getLocalUser();

  return Response.json({
    id: user.id,
    email: profile?.email ?? user.email,
    name: profile?.name ?? user.user_metadata?.full_name ?? null,
    avatar_url: profile?.avatar_url ?? user.user_metadata?.avatar_url ?? null,
    credits: await getUserCredits(user.id),
  });
}

export async function PATCH(request: Request) {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return unauthorized();
  const { supabase: _, user: _u } = await getAuthenticatedUser();
  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const updates: Record<string, any> = {};
  if (typeof body.name === 'string') {
    const trimmed = body.name.trim();
    if (trimmed.length === 0 || trimmed.length > 100) {
      return Response.json({ error: 'Name must be between 1 and 100 characters' }, { status: 400 });
    }
    updates.name = trimmed;
  }
  if (typeof body.avatar_url === 'string') {
    updates.avatar_url = body.avatar_url || null;
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  try {
    const updated = await updateLocalUser(updates);
    return Response.json({ success: true, user: updated });
  } catch (err: any) {
    return Response.json({ error: err?.message ?? 'Unable to update' }, { status: 500 });
  }
}
