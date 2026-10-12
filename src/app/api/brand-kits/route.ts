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

export async function GET() {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return unauthorized();

  if (supabase) {
    const { data, error } = await supabase
      .from('brand_kits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ brandKits: data ?? [], items: data ?? [], total: data?.length ?? 0 });
  }

  // Local-only mode
  const { listBrandKits } = await import('@/lib/localdb.server');
  const allKits = await listBrandKits();
  const userKits = allKits.filter((k: any) => k.user_id === user.id);
  userKits.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  return Response.json({ brandKits: userKits, items: userKits, total: userKits.length });
}

export async function POST(request: Request) {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return unauthorized();

  const body = await request.json();
  if (!body.name?.trim()) {
    return Response.json({ error: 'Brand kit name is required' }, { status: 400 });
  }

  if (supabase) {
    const { data, error } = await supabase
      .from('brand_kits')
      .insert({
        user_id: user.id,
        name: body.name.trim(),
        colors: parseList(body.colors),
        fonts: parseList(body.fonts),
        logos: parseList(body.logos),
      })
      .select('*')
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ brandKit: data }, { status: 201 });
  }

  // Local-only mode
  const { createLocalBrandKit } = await import('@/lib/localdb.server');
  const brandKit = await createLocalBrandKit(user.id, {
    name: body.name.trim(),
    colors: parseList(body.colors),
    fonts: parseList(body.fonts),
    logos: parseList(body.logos),
  });
  
  return Response.json({ brandKit }, { status: 201 });
}

