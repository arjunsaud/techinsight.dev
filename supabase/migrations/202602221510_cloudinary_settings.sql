-- Add Cloudinary settings to app_settings
INSERT INTO public.app_settings (key, value)
VALUES 
  ('CLOUDINARY_CLOUD_NAME', ''),
  ('CLOUDINARY_API_KEY', ''),
  ('CLOUDINARY_API_SECRET', ''),
  ('CLOUDINARY_UPLOAD_PRESET', 'blogs')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
