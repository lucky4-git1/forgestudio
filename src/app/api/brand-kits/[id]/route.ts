import { getAuthenticatedUser, unauthorized } from '@/lib/api-auth';

function parseList(value: unknown) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

export async function PATCH(request: Request, ctx: RouteContext<'/api/brand-kits/[id]'>) {
  const { id } = await ctx.params;
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return unauthorized();

  const body = await request.json();

  if (supabase) {
    const { data, error } = await supabase
      .from('brand_kits')
      .update({
        ...(body.name != null && { name: body.name }),
        ...(body.colors !== undefined && { colors: parseList(body.colors) }),
        ...(body.fonts !== undefined && { fonts: parseList(body.fonts) }),
        ...(body.logos !== undefined && { logos: parseList(body.logos) }),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ brandKit: data });
  }

  // Local-only mode
  const { updateLocalBrandKit, listBrandKits } = await import('@/lib/localdb.server');
  const allKits = await listBrandKits();
  const kit = allKits.find((k: any) => k.id === id && k.user_id === user.id);
  if (!kit) return Response.json({ error: 'Brand kit not found' }, { status: 404 });

  const updated = await updateLocalBrandKit(id, {
    ...(body.name != null && { name: body.name }),
    ...(body.colors !== undefined && { colors: parseList(body.colors) }),
    ...(body.fonts !== undefined && { fonts: parseList(body.fonts) }),
    ...(body.logos !== undefined && { logos: parseList(body.logos) }),
  });
  return Response.json({ brandKit: updated });
}

export async function DELETE(_request: Request, ctx: RouteContext<'/api/brand-kits/[id]'>) {
  const { id } = await ctx.params;
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return unauthorized();

  if (supabase) {
    const { error } = await supabase
      .from('brand_kits')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true });
  }

  // Local-only mode
  const { deleteLocalBrandKit, listBrandKits } = await import('@/lib/localdb.server');
  const allKits = await listBrandKits();
  const kit = allKits.find((k: any) => k.id === id && k.user_id === user.id);
  if (!kit) return Response.json({ error: 'Brand kit not found' }, { status: 404 });

  await deleteLocalBrandKit(id);
  return Response.json({ ok: true });
}
