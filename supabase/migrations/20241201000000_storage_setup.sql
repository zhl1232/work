-- ============================================
-- Supabase Storage 配置
-- ============================================
-- 创建项目图片存储桶并配置权限
-- ============================================

-- 创建 project-images 存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

-- 允许所有人查看图片（因为是公开bucket）
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-images');

-- 允许认证用户上传图片到自己的文件夹
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-images' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 允许用户删除自己上传的图片
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-images'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 允许用户更新自己上传的图片
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'project-images'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- 完成提示
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Storage 配置完成！';
  RAISE NOTICE '📦 已创建 project-images 存储桶';
  RAISE NOTICE '🔒 已配置存储策略';
END $$;
