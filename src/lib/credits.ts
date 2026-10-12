import type { GenerationType, CreditCostMap } from '@/types';
import {
  listGenerations,
  createPendingGeneration,
  finalizeGeneration,
  recordFailedLocalGeneration,
} from './localdb.server';

// ──────────────────────────────────────────────
// Credit cost per generation type
// ──────────────────────────────────────────────
export const CREDIT_COSTS: CreditCostMap = {
  'text-to-image': 1,
  logo: 2,
  'marketing-creative': 2,
  'image-to-video': 10,
  'text-to-video': 15,
  'logo-animation': 8,
};

const DEFAULT_CREDITS = 100;

/**
 * Return the current credit balance for a user.
 */
export async function getUserCredits(userId: string): Promise<number> {
  const gens = await listGenerations();
  const userGens = (gens ?? []).filter((g: any) => g.user_id === userId && g.status === 'completed');
  const totalUsed = userGens.reduce((sum: number, row: any) => sum + (row.credits_used ?? 0), 0);
  return DEFAULT_CREDITS - totalUsed;
}

export async function hasEnoughCredits(userId: string, type: GenerationType): Promise<boolean> {
  const balance = await getUserCredits(userId);
  return balance >= CREDIT_COSTS[type];
}

export async function deductCredits(
  userId: string,
  type: GenerationType,
  provider = 'nvidia',
  generationId?: string,
): Promise<string> {
  const cost = CREDIT_COSTS[type];

  const canAfford = await hasEnoughCredits(userId, type);
  if (!canAfford) {
    throw new Error('Insufficient credits');
  }

  if (generationId) {
    const row = await finalizeGeneration(generationId, { provider, generation_type: type, credits_used: cost, status: 'completed' });
    return row.id as string;
  }

  const pending = await createPendingGeneration(userId, type);
  const finalized = await finalizeGeneration(pending.id, { provider, generation_type: type, credits_used: cost, status: 'completed' });
  return finalized.id as string;
}

export async function recordFailedGeneration(
  userId: string,
  type: GenerationType,
  provider = 'nvidia',
  generationId?: string,
): Promise<void> {
  if (generationId) {
    await recordFailedLocalGeneration(generationId, type, provider);
    return;
  }
  await recordFailedLocalGeneration(userId, type, provider);
}
