import { getAuthenticatedUser, unauthorized } from '@/lib/api-auth';

export async function GET(request: Request) {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const projectId = searchParams.get('projectId');

  if (supabase) {
    let query = supabase
      .from('assets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (type) query = query.eq('type', type);
    if (projectId) query = query.eq('project_id', projectId);

    const { data, error } = await query;
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ assets: data ?? [], items: data ?? [], total: data?.length ?? 0 });
  }

  // Local-only mode
  const { listAssets } = await import('@/lib/localdb.server');
  const allAssets = await listAssets();
  let userAssets = (allAssets ?? []).filter((a: any) => a.user_id === user.id);
  if (type) userAssets = userAssets.filter((a: any) => a.type === type);
  if (projectId) userAssets = userAssets.filter((a: any) => a.project_id === projectId);
  
  userAssets.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  return Response.json({ assets: userAssets, items: userAssets, total: userAssets.length });
}

