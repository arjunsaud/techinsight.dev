-- Add description and color columns to categories table
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS color text;
