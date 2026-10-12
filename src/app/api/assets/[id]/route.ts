import { getAuthenticatedUser, unauthorized } from '@/lib/api-auth';

export async function PATCH(request: Request, ctx: RouteContext<'/api/assets/[id]'>) {
  const { id } = await ctx.params;
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return unauthorized();

  const body = await request.json();

  if (supabase) {
    const { data, error } = await supabase
      .from('assets')
      .update({
        ...(body.project_id !== undefined && { project_id: body.project_id || null }),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ asset: data });
  }

  // Local-only mode
  const { updateLocalAsset, listAssets } = await import('@/lib/localdb.server');
  const allAssets = await listAssets();
  const asset = allAssets.find((a: any) => a.id === id && a.user_id === user.id);
  if (!asset) return Response.json({ error: 'Asset not found' }, { status: 404 });
  
  const updated = await updateLocalAsset(id, {
    ...(body.project_id !== undefined && { project_id: body.project_id || null }),
  });
  return Response.json({ asset: updated });
}

export async function DELETE(_request: Request, ctx: RouteContext<'/api/assets/[id]'>) {
  const { id } = await ctx.params;
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return unauthorized();

  if (supabase) {
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true });
  }

  // Local-only mode
  const { deleteLocalAsset, listAssets } = await import('@/lib/localdb.server');
  const allAssets = await listAssets();
  const asset = allAssets.find((a: any) => a.id === id && a.user_id === user.id);
  if (!asset) return Response.json({ error: 'Asset not found' }, { status: 404 });
  
  await deleteLocalAsset(id);
  return Response.json({ ok: true });
}

