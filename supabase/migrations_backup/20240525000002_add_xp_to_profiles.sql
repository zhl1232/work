-- Add xp column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS xp int DEFAULT 0;

COMMENT ON COLUMN public.profiles.xp IS '用户经验值';
