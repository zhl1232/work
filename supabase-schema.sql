-- ============================================
-- STEAM Explore & Share 数据库表结构
-- ============================================
-- 创建日期: 2025-11-21
-- 说明: 包含所有核心功能的数据库表和策略
-- ============================================

-- ============================================
-- 1. 用户扩展信息表
-- ============================================
-- Supabase 自带 auth.users 表，这里扩展用户信息
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username text UNIQUE,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  xp int DEFAULT 0
);

COMMENT ON TABLE public.profiles IS '用户扩展信息表';
COMMENT ON COLUMN public.profiles.username IS '用户名（唯一）';
COMMENT ON COLUMN public.profiles.display_name IS '显示名称';
COMMENT ON COLUMN public.profiles.avatar_url IS '头像URL';

-- ============================================
-- 2. 项目表
-- ============================================
CREATE TABLE IF NOT EXISTS public.projects (
  id bigserial PRIMARY KEY,
  title text NOT NULL,
  description text,
  author_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_url text,
  category text,
  difficulty text, -- '简单', '中等', '困难'
  duration int, -- 预计完成时长（分钟）
  likes_count int DEFAULT 0,
  views_count int DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE public.projects IS '项目表';
COMMENT ON COLUMN public.projects.difficulty IS '难度: 简单/中等/困难';
COMMENT ON COLUMN public.projects.duration IS '预计完成时长（分钟）';

-- ============================================
-- 3. 项目材料表
-- ============================================
CREATE TABLE IF NOT EXISTS public.project_materials (
  id bigserial PRIMARY KEY,
  project_id bigint REFERENCES public.projects(id) ON DELETE CASCADE,
  material text NOT NULL,
  sort_order int
);

COMMENT ON TABLE public.project_materials IS '项目所需材料表';

-- ============================================
-- 4. 项目步骤表
-- ============================================
CREATE TABLE IF NOT EXISTS public.project_steps (
  id bigserial PRIMARY KEY,
  project_id bigint REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  image_url text,
  sort_order int
);

COMMENT ON TABLE public.project_steps IS '项目制作步骤表';

-- ============================================
-- 5. 评论表
-- ============================================
CREATE TABLE IF NOT EXISTS public.comments (
  id bigserial PRIMARY KEY,
  project_id bigint REFERENCES public.projects(id) ON DELETE CASCADE,
  author_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  parent_id bigint REFERENCES public.comments(id) ON DELETE CASCADE, -- 支持嵌套回复
  created_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE public.comments IS '评论表（支持嵌套回复）';
COMMENT ON COLUMN public.comments.parent_id IS '父评论ID，用于嵌套回复';

-- ============================================
-- 6. 点赞表
-- ============================================
CREATE TABLE IF NOT EXISTS public.likes (
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id bigint REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (user_id, project_id)
);

COMMENT ON TABLE public.likes IS '项目点赞记录表';

-- ============================================
-- 7. 完成记录表
-- ============================================
CREATE TABLE IF NOT EXISTS public.completed_projects (
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id bigint REFERENCES public.projects(id) ON DELETE CASCADE,
  completed_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (user_id, project_id)
);

COMMENT ON TABLE public.completed_projects IS '用户完成项目记录表';

-- ============================================
-- 8. 讨论表
-- ============================================
CREATE TABLE IF NOT EXISTS public.discussions (
  id bigserial PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  tags text[],
  likes_count int DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE public.discussions IS '社区讨论表';

-- ============================================
-- 9. 讨论回复表
-- ============================================
CREATE TABLE IF NOT EXISTS public.discussion_replies (
  id bigserial PRIMARY KEY,
  discussion_id bigint REFERENCES public.discussions(id) ON DELETE CASCADE,
  author_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE public.discussion_replies IS '讨论回复表';

-- ============================================
-- 10. 挑战赛表
-- ============================================
CREATE TABLE IF NOT EXISTS public.challenges (
  id bigserial PRIMARY KEY,
  title text NOT NULL,
  description text,
  image_url text,
  tags text[],
  participants_count int DEFAULT 0,
  end_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE public.challenges IS '挑战赛表';

-- ============================================
-- 11. 挑战参与记录表
-- ============================================
CREATE TABLE IF NOT EXISTS public.challenge_participants (
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_id bigint REFERENCES public.challenges(id) ON DELETE CASCADE,
  joined_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (user_id, challenge_id)
);

COMMENT ON TABLE public.challenge_participants IS '用户参与挑战记录表';

-- ============================================
-- 12. 徽章表
-- ============================================
CREATE TABLE IF NOT EXISTS public.badges (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  icon text,
  condition jsonb -- 解锁条件，如 {"completed_projects": 3}
);

COMMENT ON TABLE public.badges IS '徽章定义表';
COMMENT ON COLUMN public.badges.condition IS '解锁条件（JSON格式）';

-- ============================================
-- 13. 用户徽章表
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_badges (
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id text REFERENCES public.badges(id) ON DELETE CASCADE,
  unlocked_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
);

COMMENT ON TABLE public.user_badges IS '用户已解锁徽章表';

-- ============================================
-- 创建索引（提升查询性能）
-- ============================================
CREATE INDEX IF NOT EXISTS idx_projects_author ON public.projects(author_id);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_project ON public.comments(project_id);
CREATE INDEX IF NOT EXISTS idx_discussions_created_at ON public.discussions(created_at DESC);

-- ============================================
-- 启用 Row Level Security (RLS)
-- ============================================
-- 这是 Supabase 的核心安全机制，确保数据访问安全
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completed_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 创建 RLS 策略
-- ============================================

-- 用户档案策略
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 项目策略
CREATE POLICY "Projects are viewable by everyone"
  ON public.projects FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = author_id);

-- 项目材料和步骤策略（继承项目权限）
CREATE POLICY "Project materials viewable by everyone"
  ON public.project_materials FOR SELECT
  USING (true);

CREATE POLICY "Project steps viewable by everyone"
  ON public.project_steps FOR SELECT
  USING (true);

-- 评论策略
CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = author_id);

-- 点赞策略
CREATE POLICY "Likes are viewable by everyone"
  ON public.likes FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own likes"
  ON public.likes FOR ALL
  USING (auth.uid() = user_id);

-- 完成记录策略
CREATE POLICY "Users can view own completed projects"
  ON public.completed_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own completed records"
  ON public.completed_projects FOR ALL
  USING (auth.uid() = user_id);

-- 讨论策略
CREATE POLICY "Discussions viewable by everyone"
  ON public.discussions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create discussions"
  ON public.discussions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own discussions"
  ON public.discussions FOR UPDATE
  USING (auth.uid() = author_id);

-- 讨论回复策略
CREATE POLICY "Discussion replies viewable by everyone"
  ON public.discussion_replies FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can reply"
  ON public.discussion_replies FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 挑战赛策略
CREATE POLICY "Challenges viewable by everyone"
  ON public.challenges FOR SELECT
  USING (true);

CREATE POLICY "Challenge participants viewable by everyone"
  ON public.challenge_participants FOR SELECT
  USING (true);

CREATE POLICY "Users can join challenges"
  ON public.challenge_participants FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 徽章策略
CREATE POLICY "Badges viewable by everyone"
  ON public.badges FOR SELECT
  USING (true);

CREATE POLICY "User badges viewable by owner"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- 创建触发器函数
-- ============================================

-- 自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为需要的表添加触发器
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_projects_updated
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- ============================================
-- 创建数据库函数（业务逻辑）
-- ============================================

-- 增加项目点赞数
CREATE OR REPLACE FUNCTION public.increment_project_likes(project_id bigint)
RETURNS void AS $$
BEGIN
  UPDATE public.projects 
  SET likes_count = likes_count + 1 
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 减少项目点赞数
CREATE OR REPLACE FUNCTION public.decrement_project_likes(project_id bigint)
RETURNS void AS $$
BEGIN
  UPDATE public.projects 
  SET likes_count = GREATEST(0, likes_count - 1) 
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 增加项目浏览数
CREATE OR REPLACE FUNCTION public.increment_project_views(project_id bigint)
RETURNS void AS $$
BEGIN
  UPDATE public.projects 
  SET views_count = views_count + 1 
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 增加挑战参与人数
CREATE OR REPLACE FUNCTION public.increment_challenge_participants(challenge_id bigint)
RETURNS void AS $$
BEGIN
  UPDATE public.challenges 
  SET participants_count = participants_count + 1 
  WHERE id = challenge_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 减少挑战参与人数
CREATE OR REPLACE FUNCTION public.decrement_challenge_participants(challenge_id bigint)
RETURNS void AS $$
BEGIN
  UPDATE public.challenges 
  SET participants_count = GREATEST(0, participants_count - 1) 
  WHERE id = challenge_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 自动创建用户档案（新用户注册时）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器：用户注册时自动创建档案
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

-- ============================================
-- 初始化基础徽章数据
-- ============================================
INSERT INTO public.badges (id, name, description, icon, condition)
VALUES
  ('explorer', '初级探索者', '完成 1 个项目', '⭐', '{"completed_projects": 1}'),
  ('scientist', '小小科学家', '完成 3 个项目', '🔬', '{"completed_projects": 3}'),
  ('master', 'STEAM 大师', '完成 5 个项目', '🏆', '{"completed_projects": 5}'),
  ('creator', '创意达人', '发布 3 个项目', '🎨', '{"created_projects": 3}'),
  ('social', '热心助人', '发表 10 条评论', '💬', '{"comments_count": 10}')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 完成提示
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ 数据库表结构创建完成！';
  RAISE NOTICE '📊 共创建 13 个表';
  RAISE NOTICE '🔒 已启用 Row Level Security';
  RAISE NOTICE '🎯 已创建 5 个初始徽章';
  RAISE NOTICE '🚀 可以开始使用了！';
END $$;
