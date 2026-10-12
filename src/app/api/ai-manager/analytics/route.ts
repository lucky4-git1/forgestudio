import { getAuthenticatedUser } from '@/lib/api-auth';
import { getLocalAnalytics } from '@/lib/localdb.server';

export async function GET() {
  const { user } = await getAuthenticatedUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // For local mode we allow the local user to view analytics.
  const analytics = await getLocalAnalytics();
  return Response.json(analytics);
}
