import { getAuthenticatedUser, unauthorized } from '@/lib/api-auth';

export async function GET(_request: Request, ctx: RouteContext<'/api/projects/[id]'>) {
  const { id } = await ctx.params;
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return unauthorized();

  if (supabase) {
    const { data, error } = await supabase
      .from('projects')
      .select('*, assets(*)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 404 });
    }

    return Response.json({ project: data });
  }

  // Local-only mode
  const { listProjects, listAssets } = await import('@/lib/localdb.server');
  const allProjects = await listProjects();
  const project = allProjects.find((p: any) => p.id === id && p.user_id === user.id);
  if (!project) return Response.json({ error: 'Project not found' }, { status: 404 });
  
  const allAssets = await listAssets();
  const projectAssets = allAssets.filter((a: any) => a.project_id === id);
  return Response.json({ project: { ...project, assets: projectAssets } });
}

export async function PATCH(request: Request, ctx: RouteContext<'/api/projects/[id]'>) {
  const { id } = await ctx.params;
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return unauthorized();

  const body = await request.json();

  if (supabase) {
    const { data, error } = await supabase
      .from('projects')
      .update({
        ...(body.name != null && { name: body.name }),
        ...(body.description !== undefined && { description: body.description || null }),
        ...(body.archived !== undefined && { archived: body.archived }),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ project: data });
  }

  // Local-only mode
  const { listProjects, updateLocalProject } = await import('@/lib/localdb.server');
  const allProjects = await listProjects();
  const project = allProjects.find((p: any) => p.id === id && p.user_id === user.id);
  if (!project) return Response.json({ error: 'Project not found' }, { status: 404 });
  
  const updated = await updateLocalProject(id, {
    ...(body.name != null && { name: body.name }),
    ...(body.description !== undefined && { description: body.description || null }),
    ...(body.archived !== undefined && { archived: body.archived }),
  });
  return Response.json({ project: updated });
}

export async function DELETE(_request: Request, ctx: RouteContext<'/api/projects/[id]'>) {
  const { id } = await ctx.params;
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return unauthorized();

  if (supabase) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true });
  }

  // Local-only mode
  const { listProjects, deleteLocalProject } = await import('@/lib/localdb.server');
  const allProjects = await listProjects();
  const project = allProjects.find((p: any) => p.id === id && p.user_id === user.id);
  if (!project) return Response.json({ error: 'Project not found' }, { status: 404 });
  
  await deleteLocalProject(id);
  return Response.json({ ok: true });
}

