-- 允许用户插入自己的徽章记录
CREATE POLICY "Users can insert own badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 允许用户更新自己的 XP (在 profiles 表)
-- 注意：现有的 "Users can update own profile" 策略已经覆盖了 UPDATE，
-- 但我们需要确保前端传递的 payload 包含 id 且与 auth.uid() 匹配。
-- 另外，为了安全起见，通常 XP 应该由服务端控制，但目前架构是前端计算。
-- 我们需要检查是否因为 RLS 限制导致 update 失败。

-- 检查现有的 profiles UPDATE 策略：
-- CREATE POLICY "Users can update own profile"
--   ON public.profiles FOR UPDATE
--   USING (auth.uid() = id);

-- 这个策略应该是足够的。
-- 让我们再添加一个针对 user_badges 的策略，因为之前只有 SELECT。
