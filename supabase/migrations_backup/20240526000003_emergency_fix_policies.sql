-- ============================================
-- 紧急修复: 补充 discussion_replies 的 INSERT 和 SELECT 策略
-- ============================================
-- 说明: 之前的迁移只创建了 DELETE 策略,导致无法插入和查看回复
-- ============================================

-- 1. 允许所有人查看讨论回复 (SELECT)
DROP POLICY IF EXISTS "Anyone can view discussion replies" ON public.discussion_replies;
CREATE POLICY "Anyone can view discussion replies"
  ON public.discussion_replies FOR SELECT
  USING (true);

-- 2. 允许登录用户添加回复 (INSERT)
DROP POLICY IF EXISTS "Authenticated users can add replies" ON public.discussion_replies;
CREATE POLICY "Authenticated users can add replies"
  ON public.discussion_replies FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = author_id);

-- 3. 同时为 comments 表补充策略(如果缺失)
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
CREATE POLICY "Anyone can view comments"
  ON public.comments FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can add comments" ON public.comments;
CREATE POLICY "Authenticated users can add comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = author_id);

-- 完成提示
DO $$
BEGIN
  RAISE NOTICE '✅ 紧急修复完成!';
  RAISE NOTICE '👀 已添加 SELECT 策略 - 允许查看回复和评论';
  RAISE NOTICE '✍️  已添加 INSERT 策略 - 允许登录用户添加回复和评论';
  RAISE NOTICE '🔧 现在应该可以正常回复了';
END $$;
