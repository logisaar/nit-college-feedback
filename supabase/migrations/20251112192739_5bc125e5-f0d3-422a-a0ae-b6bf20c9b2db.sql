-- Create app_settings table to store application-wide settings
CREATE TABLE IF NOT EXISTS public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for app_settings
CREATE POLICY "Anyone can read settings"
  ON public.app_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify settings"
  ON public.app_settings
  FOR ALL
  USING (check_is_admin());

-- Insert default setting for registration visibility (enabled by default)
INSERT INTO public.app_settings (setting_key, setting_value)
VALUES ('registration_enabled', 'true')
ON CONFLICT (setting_key) DO NOTHING;