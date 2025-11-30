-- ============================================
-- 初始数据库 Schema
-- ============================================
-- 从旧项目导出的完整数据库结构
-- 包含所有表、RLS 策略和触发器
-- ============================================

-- ============================================
-- 1. 项目表 (projects)
-- ============================================
CREATE TABLE IF NOT EXISTS public.projects (
  id bigserial PRIMARY KEY,
  title text NOT NULL,
  description text,
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url text,
  category text,
  difficulty text,
  duration int,
  likes_count int DEFAULT 0,
  views_count int DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 启用 RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_projects_author ON public.projects(author_id);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- RLS 策略
CREATE POLICY "Projects are viewable by everyone"
  ON public.projects FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================
-- 2. 项目材料表 (project_materials)
-- ============================================
CREATE TABLE IF NOT EXISTS public.project_materials (
  id bigserial PRIMARY KEY,
  project_id bigint REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  material text NOT NULL,
  sort_order int
);

ALTER TABLE public.project_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Materials viewable by everyone"
  ON public.project_materials FOR SELECT
  USING (true);

CREATE POLICY "Authors can manage their project materials"
  ON public.project_materials FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_materials.project_id
      AND author_id = auth.uid()
    )
  );

-- ============================================
-- 3. 项目步骤表 (project_steps)
-- ============================================
CREATE TABLE IF NOT EXISTS public.project_steps (
  id bigserial PRIMARY KEY,
  project_id bigint REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  image_url text,
  sort_order int
);

ALTER TABLE public.project_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Steps viewable by everyone"
  ON public.project_steps FOR SELECT
  USING (true);

CREATE POLICY "Authors can manage their project steps"
  ON public.project_steps FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_steps.project_id
      AND author_id = auth.uid()
    )
  );

-- ============================================
-- 4. 评论表 (comments)
-- ============================================
CREATE TABLE IF NOT EXISTS public.comments (
  id bigserial PRIMARY KEY,
  project_id bigint REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  parent_id bigint REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_comments_project ON public.comments(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_id);

CREATE POLICY "Comments viewable by everyone"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================
-- 5. 点赞表 (likes)
-- ============================================
CREATE TABLE IF NOT EXISTS public.likes (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id bigint REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (user_id, project_id)
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes viewable by everyone"
  ON public.likes FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own likes"
  ON public.likes FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- 6. 完成项目记录表 (completed_projects)
-- ============================================
CREATE TABLE IF NOT EXISTS public.completed_projects (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id bigint REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  completed_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (user_id, project_id)
);

ALTER TABLE public.completed_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Completed projects viewable by everyone"
  ON public.completed_projects FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own completions"
  ON public.completed_projects FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- 7. 讨论表 (discussions)
-- ============================================
CREATE TABLE IF NOT EXISTS public.discussions (
  id bigserial PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tags text[],
  likes_count int DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_discussions_author ON public.discussions(author_id);
CREATE INDEX IF NOT EXISTS idx_discussions_created_at ON public.discussions(created_at DESC);

CREATE POLICY "Discussions viewable by everyone"
  ON public.discussions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create discussions"
  ON public.discussions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own discussions"
  ON public.discussions FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own discussions"
  ON public.discussions FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================
-- 8. 讨论回复表 (discussion_replies)
-- ============================================
CREATE TABLE IF NOT EXISTS public.discussion_replies (
  id bigserial PRIMARY KEY,
  discussion_id bigint REFERENCES public.discussions(id) ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_discussion_replies_discussion_id ON public.discussion_replies(discussion_id);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_author ON public.discussion_replies(author_id);

CREATE POLICY "Discussion replies viewable by everyone"
  ON public.discussion_replies FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create discussion replies"
  ON public.discussion_replies FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own discussion replies"
  ON public.discussion_replies FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================
-- 9. 挑战表 (challenges)
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

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Challenges viewable by everyone"
  ON public.challenges FOR SELECT
  USING (true);

-- ============================================
-- 10. 挑战参与者表 (challenge_participants)
-- ============================================
CREATE TABLE IF NOT EXISTS public.challenge_participants (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id bigint REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (user_id, challenge_id)
);

ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Challenge participants viewable by everyone"
  ON public.challenge_participants FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own challenge participation"
  ON public.challenge_participants FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- 11. 徽章表 (badges)
-- ============================================
CREATE TABLE IF NOT EXISTS public.badges (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  icon text,
  condition jsonb
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges viewable by everyone"
  ON public.badges FOR SELECT
  USING (true);

-- ============================================
-- 12. 用户徽章表 (user_badges)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_badges (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id text REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  unlocked_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User badges viewable by everyone"
  ON public.user_badges FOR SELECT
  USING (true);

-- ============================================
-- 13. 项目统计函数
-- ============================================

-- 增加项目点赞计数
CREATE OR REPLACE FUNCTION public.increment_project_likes(project_id bigint)
RETURNS void AS $$
BEGIN
  UPDATE public.projects
  SET likes_count = likes_count + 1
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql;

-- 减少项目点赞计数
CREATE OR REPLACE FUNCTION public.decrement_project_likes(project_id bigint)
RETURNS void AS $$
BEGIN
  UPDATE public.projects
  SET likes_count = likes_count - 1
  WHERE id = project_id AND likes_count > 0;
END;
$$ LANGUAGE plpgsql;

-- 增加项目浏览数
CREATE OR REPLACE FUNCTION public.increment_project_views(project_id bigint)
RETURNS void AS $$
BEGIN
  UPDATE public.projects
  SET views_count = views_count + 1
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql;

-- 增加挑战参与者数量
CREATE OR REPLACE FUNCTION public.increment_challenge_participants(challenge_id bigint)
RETURNS void AS $$
BEGIN
  UPDATE public.challenges
  SET participants_count = participants_count + 1
  WHERE id = challenge_id;
END;
$$ LANGUAGE plpgsql;

-- 减少挑战参与者数量
CREATE OR REPLACE FUNCTION public.decrement_challenge_participants(challenge_id bigint)
RETURNS void AS $$
BEGIN
  UPDATE public.challenges
  SET participants_count = participants_count - 1
  WHERE id = challenge_id AND participants_count > 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================
--完成提示
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ 初始数据库结构创建完成！';
  RAISE NOTICE '📊 已创建所有核心表';
  RAISE NOTICE '🔒 已配置 RLS 策略';
  RAISE NOTICE '⚡ 已添加辅助函数';
END $$;
