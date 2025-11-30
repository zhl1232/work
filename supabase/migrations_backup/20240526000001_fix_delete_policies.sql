-- ============================================
-- 修复删除权限和 RLS 策略
-- ============================================
-- 创建日期: 2025-11-26
-- 说明: 补全缺失的 RLS 策略,支持安全的删除操作
-- ============================================

-- ============================================
-- 1. 更新评论删除策略
-- ============================================

-- 删除旧策略(如果存在)
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments or moderators can delete any" ON public.comments;

-- 创建新的删除策略:作者或管理员/版主可以删除
CREATE POLICY "Authors and moderators can delete comments"
  ON public.comments FOR DELETE
  USING (
    auth.uid() = author_id 
    OR is_moderator_or_admin()
  );

COMMENT ON POLICY "Authors and moderators can delete comments" ON public.comments 
  IS '评论作者或管理员/版主可以删除评论';

-- ============================================
-- 2. 讨论回复删除策略
-- ============================================

-- 检查表是否存在
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'discussion_replies'
  ) THEN
    -- 删除旧策略
    DROP POLICY IF EXISTS "Users can delete own replies" ON public.discussion_replies;
    DROP POLICY IF EXISTS "Authors and moderators can delete replies" ON public.discussion_replies;
    
    -- 创建新策略
    EXECUTE 'CREATE POLICY "Authors and moderators can delete discussion replies"
      ON public.discussion_replies FOR DELETE
      USING (
        auth.uid() = author_id 
        OR is_moderator_or_admin()
      )';
    
    EXECUTE 'COMMENT ON POLICY "Authors and moderators can delete discussion replies" ON public.discussion_replies 
      IS ''讨论回复作者或管理员/版主可以删除回复''';
  END IF;
END $$;

-- ============================================
-- 3. 补全 user_badges 策略
-- ============================================

-- UPDATE 策略:用户可以更新自己的徽章
DROP POLICY IF EXISTS "Users can update own badges" ON public.user_badges;
CREATE POLICY "Users can update own badges"
  ON public.user_badges FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE 策略:只有管理员可以删除徽章
DROP POLICY IF EXISTS "Admins can delete badges" ON public.user_badges;
CREATE POLICY "Admins can delete badges"
  ON public.user_badges FOR DELETE
  USING (is_admin());

COMMENT ON POLICY "Users can update own badges" ON public.user_badges 
  IS '用户可以更新自己的徽章记录';
COMMENT ON POLICY "Admins can delete badges" ON public.user_badges 
  IS '只有管理员可以删除徽章';

-- ============================================
-- 4. Storage 删除策略 (需要手动在 Dashboard 配置)
-- ============================================
-- 注意: storage.objects 表属于 storage schema,需要在 Supabase Dashboard 中配置  
-- 无法通过普通迁移脚本直接修改
--
-- 请在 Supabase Dashboard 中手动配置以下策略:
-- 
-- Storage → Policies → avatars bucket:
--   1. 添加 DELETE 策略
--      名称: Users can delete own avatars
--      操作: DELETE
--      策略表达式: bucket_id = 'avatars' AND auth.role() = 'authenticated'
--
-- Storage → Policies → project-images bucket:
--   1. 添加 DELETE 策略  
--      名称: Users can delete project images
--      操作: DELETE
--      策略表达式: bucket_id = 'project-images' AND auth.role() = 'authenticated'

-- ============================================
-- 5. 验证关键策略
-- ============================================

-- 检查 is_moderator_or_admin 函数是否存在
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'is_moderator_or_admin'
  ) THEN
    RAISE WARNING '警告: is_moderator_or_admin() 函数不存在,请先运行权限系统迁移脚本';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'is_admin'
  ) THEN
    RAISE WARNING '警告: is_admin() 函数不存在,请先运行权限系统迁移脚本';
  END IF;
END $$;

-- ============================================
-- 完成提示
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ RLS 策略修复完成！';
  RAISE NOTICE '🗑️  已更新评论和讨论回复的删除策略';
  RAISE NOTICE '🏅 已补全 user_badges 的 UPDATE 和 DELETE 策略';
  RAISE NOTICE '⚠️  Storage DELETE 策略需要在 Supabase Dashboard 中手动配置';
  RAISE NOTICE '🔒 现在可以安全地移除 API 中的 admin 客户端使用';
  RAISE NOTICE '';
  RAISE NOTICE '📋 下一步操作:';
  RAISE NOTICE '   1. 登录 Supabase Dashboard';
  RAISE NOTICE '   2. 进入 Storage → Policies';
  RAISE NOTICE '   3. 为 avatars 和 project-images 添加 DELETE 策略';
  RAISE NOTICE '   详见迁移脚本中的注释说明';
END $$;
