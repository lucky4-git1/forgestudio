import type { SupabaseClient } from '@supabase/supabase-js';

export type AISettings = {
  id: string;
  user_id: string;
  provider: string;
  image_model: string | null;
  video_model: string | null;
  default_aspect_ratio: string | null;
  default_quality: string | null;
  default_style: string | null;
  negative_prompt: string | null;
  provider_api_key?: string | null;
  inference_mode?: 'cloud' | 'local' | string | null;
  auto_save: boolean;
  created_at: string;
  updated_at: string;
};

export async function getUserAISettings(supabase: SupabaseClient, userId: string): Promise<AISettings | null> {
  const { data, error } = await supabase
    .from('ai_settings')
    .select('*')
    .eq('user_id', userId)
    .limit(1)
    .single();

  if (error) return null;
  return data as AISettings;
}

export async function upsertUserAISettings(supabase: SupabaseClient, userId: string, payload: Partial<AISettings>) {
  const insert = {
    user_id: userId,
    provider: payload.provider ?? 'huggingface',
    image_model: payload.image_model ?? 'FLUX.1-schnell',
    video_model: payload.video_model ?? 'cosmos',
    default_aspect_ratio: payload.default_aspect_ratio ?? '16:9',
    default_quality: payload.default_quality ?? 'standard',
    default_style: payload.default_style ?? 'none',
    negative_prompt: payload.negative_prompt ?? '',
    provider_api_key: (payload as any).provider_api_key ?? (payload as any).providerApiKey ?? null,
    auto_save: payload.auto_save ?? true,
  } as any;

  const { data, error } = await supabase
    .from('ai_settings')
    .upsert(insert, { onConflict: 'user_id' })
    .select('*')
    .single();

  if (error) throw error;
  return data as AISettings;
}
