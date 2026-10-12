-- Add completed_at to generations to enable timing analytics

ALTER TABLE public.generations
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS ON public.generations (completed_at);
