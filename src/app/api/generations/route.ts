import { getAuthenticatedUser, unauthorized } from '@/lib/api-auth';
import { listGenerations, listAssets } from '@/lib/localdb.server';

export async function GET() {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return unauthorized();

  if (supabase) {
    const [{ data: generations, error }, { data: assets }] = await Promise.all([
      supabase
        .from('generations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('assets')
        .select('id,type,prompt,thumbnail_url,file_url,created_at,metadata')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
    ]);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    const items = (assets ?? []).map((asset: any) => ({
      id: asset.id,
      type: asset.type,
      prompt: asset.prompt,
      thumbnail_url: asset.thumbnail_url ?? asset.file_url,
      created_at: asset.created_at,
    }));

    return Response.json({
      generations: generations ?? [],
      items,
      total: generations?.length ?? 0,
      assets: assets?.length ?? 0,
    });
  }

  // Local-only mode
  const generations = await listGenerations();
  const assets = await listAssets();
  const userGens = (generations ?? []).filter((g: any) => g.user_id === user.id).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const userAssets = (assets ?? []).filter((a: any) => a.user_id === user.id).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const items = userAssets.map((asset: any) => ({
    id: asset.id,
    type: asset.type,
    prompt: asset.prompt,
    thumbnail_url: asset.thumbnail_url ?? asset.file_url,
    created_at: asset.created_at,
  }));

  return Response.json({
    generations: userGens,
    items,
    total: userGens.length,
    assets: userAssets.length,
  });
}
