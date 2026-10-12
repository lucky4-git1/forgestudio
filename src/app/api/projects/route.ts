import { getAuthenticatedUser, unauthorized } from '@/lib/api-auth';
import { listProjects, createLocalProject } from '@/lib/localdb.server';

export async function GET() {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return unauthorized();

  if (supabase) {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*, assets(id)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    const items = (projects ?? []).map((project: any) => ({
      ...project,
      asset_count: Array.isArray(project.assets) ? project.assets.length : 0,
      assets: undefined,
    }));

    return Response.json({ projects: items, items, total: items.length });
  }

  // Local-only mode
  const projects = await listProjects();
  const userProjects = (projects ?? []).filter((p: any) => p.user_id === user.id).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const items = userProjects.map((project: any) => ({
    ...project,
    asset_count: 0,
    assets: undefined,
  }));
  return Response.json({ projects: items, items, total: items.length });
}

export async function POST(request: Request) {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return unauthorized();

  const body = await request.json();
  if (!body.name?.trim()) {
    return Response.json({ error: 'Project name is required' }, { status: 400 });
  }

  if (supabase) {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: body.name.trim(),
        description: body.description?.trim() || null,
      })
      .select('*')
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ project: data }, { status: 201 });
  }

  // Local create
  const project = await createLocalProject(user.id, { name: body.name.trim(), description: body.description?.trim() || null });
  return Response.json({ project }, { status: 201 });
}
