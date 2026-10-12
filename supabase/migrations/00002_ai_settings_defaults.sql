-- Insert default AI settings for new users

CREATE OR REPLACE FUNCTION public.handle_new_user_ai_settings()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.ai_settings (user_id, provider, image_model, video_model, default_aspect_ratio, default_quality, default_style, negative_prompt)
  VALUES (NEW.id, 'nvidia', 'flux', 'cosmos', '16:9', 'standard', 'none', '');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_ai_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_ai_settings();
