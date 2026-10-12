import { AI_PROVIDERS } from '@/lib/ai/providers';
import { getAuthenticatedUser, unauthorized } from '@/lib/api-auth';

export async function GET() {
  const { user } = await getAuthenticatedUser();
  if (!user) return unauthorized();

  return Response.json(AI_PROVIDERS);
}
