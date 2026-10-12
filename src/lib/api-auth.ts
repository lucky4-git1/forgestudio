import type { SupabaseClient } from '@supabase/supabase-js';
import { getLocalUser } from './localdb.server';
import { createClient } from './supabase/server';

export async function getAuthenticatedUser(): Promise<{
  supabase: SupabaseClient | null;
  user: any;
}> {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        return { supabase, user };
      }
    }
  } catch {
    // Fall back to local user
  }

  const user = await getLocalUser();
  return { supabase: null, user };
}

export function unauthorized() {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
