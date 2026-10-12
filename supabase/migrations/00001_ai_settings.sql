-- AI Settings table

CREATE TABLE public.ai_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL DEFAULT 'nvidia',
  image_model TEXT DEFAULT 'flux',
  video_model TEXT DEFAULT 'cosmos',
  default_aspect_ratio TEXT DEFAULT '16:9',
  default_quality TEXT DEFAULT 'standard',
  default_style TEXT DEFAULT 'none',
  negative_prompt TEXT DEFAULT '',
  provider_api_key TEXT DEFAULT NULL,
  auto_save BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX ON public.ai_settings (user_id);
CREATE INDEX ON public.ai_settings (provider);

-- Row Level Security
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ai settings" ON public.ai_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ai settings" ON public.ai_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ai settings" ON public.ai_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ai settings" ON public.ai_settings FOR DELETE USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ai_settings_update_timestamp
BEFORE UPDATE ON public.ai_settings
FOR EACH ROW EXECUTE PROCEDURE public.update_timestamp();
