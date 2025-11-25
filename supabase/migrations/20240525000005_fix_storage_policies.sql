-- ============================================
-- 修复存储桶 (Storage Buckets)
-- ============================================

-- 1. 创建存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. 设置 Avatars 桶权限

-- 允许公开读取
DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible." ON storage.objects FOR SELECT USING ( bucket_id = 'avatars' );

-- 允许登录用户上传
DROP POLICY IF EXISTS "Anyone can upload an avatar." ON storage.objects;
CREATE POLICY "Anyone can upload an avatar." ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

-- 允许登录用户更新 (覆盖)
DROP POLICY IF EXISTS "Anyone can update their own avatar." ON storage.objects;
CREATE POLICY "Anyone can update their own avatar." ON storage.objects FOR UPDATE USING ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

-- 3. 设置 Project Images 桶权限

-- 允许公开读取
DROP POLICY IF EXISTS "Project images are publicly accessible." ON storage.objects;
CREATE POLICY "Project images are publicly accessible." ON storage.objects FOR SELECT USING ( bucket_id = 'project-images' );

-- 允许登录用户上传
DROP POLICY IF EXISTS "Anyone can upload project images." ON storage.objects;
CREATE POLICY "Anyone can upload project images." ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'project-images' AND auth.role() = 'authenticated' );

-- 4. 提示
DO $$
BEGIN
  RAISE NOTICE '✅ 存储桶修复完成！';
  RAISE NOTICE '📦 已确保 avatars 和 project-images 桶存在';
  RAISE NOTICE '🔒 已重置访问策略';
END $$;
