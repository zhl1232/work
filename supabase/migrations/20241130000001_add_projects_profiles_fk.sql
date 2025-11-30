-- 修复 PostgREST 缺失的关系并保留孤儿项目

DO $$
DECLARE
  -- ⚠️⚠️⚠️ 请将下面的 ID 替换为您的真实 User ID (作为管理员接收所有孤儿项目) ⚠️⚠️⚠️
  -- 您可以在 Supabase Dashboard -> Authentication -> Users 中找到您的 ID
  target_admin_id uuid := 'fc9f4384-2bb5-418e-a2e2-8c29bff6e7c5'; 
BEGIN
  -- 1. 检查是否替换了 ID
  IF target_admin_id = '00000000-0000-0000-0000-000000000000'::uuid THEN
     RAISE EXCEPTION '❌ 请先在脚本第 6 行填入有效的管理员 User ID！';
  END IF;

  -- 2. 尝试为目标管理员回填 profile (确保管理员有 profile)
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  SELECT 
    id, 
    raw_user_meta_data->>'username', 
    raw_user_meta_data->>'full_name', 
    raw_user_meta_data->>'avatar_url'
  FROM auth.users
  WHERE id = target_admin_id
  ON CONFLICT (id) DO NOTHING;

  -- 3. 将孤儿项目（作者不存在的项目）重新分配给管理员
  UPDATE public.projects
  SET author_id = target_admin_id
  WHERE author_id NOT IN (SELECT id FROM public.profiles);

  RAISE NOTICE '✅ 已将所有孤儿项目重新分配给用户: %', target_admin_id;
END $$;

-- 4. 添加外键约束
-- 现在所有项目都有有效的 author_id 了，可以安全添加约束
ALTER TABLE public.projects
ADD CONSTRAINT projects_author_id_fkey_profiles
FOREIGN KEY (author_id)
REFERENCES public.profiles(id);
