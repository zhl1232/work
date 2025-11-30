-- ============================================
-- 权限系统迁移脚本
-- ============================================
-- 创建日期: 2025-11-25
-- 说明: 添加用户角色、项目审核状态等权限相关字段
-- ============================================

-- ============================================
-- 1. 用户角色系统
-- ============================================

-- 添加角色字段到 profiles 表
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- 添加角色约束
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'role_check' AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT role_check 
    CHECK (role IN ('user', 'moderator', 'admin'));
  END IF;
END $$;

-- 添加索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

COMMENT ON COLUMN public.profiles.role IS '用户角色: user/moderator/admin';

-- ============================================
-- 2. 项目审核系统
-- ============================================

-- 添加项目状态字段
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- 添加审核信息字段
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES public.profiles(id);

ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone;

ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- 添加状态约束
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'status_check' AND conrelid = 'public.projects'::regclass
  ) THEN
    ALTER TABLE public.projects 
    ADD CONSTRAINT status_check 
    CHECK (status IN ('draft', 'pending', 'approved', 'rejected'));
  END IF;
END $$;

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);

COMMENT ON COLUMN public.projects.status IS '项目状态: draft/pending/approved/rejected';
COMMENT ON COLUMN public.projects.reviewed_by IS '审核人ID';
COMMENT ON COLUMN public.projects.reviewed_at IS '审核时间';
COMMENT ON COLUMN public.projects.rejection_reason IS '拒绝原因';

-- ============================================
-- 3. 标签系统
-- ============================================

-- 标签定义表
CREATE TABLE IF NOT EXISTS public.tags (
  id bigserial PRIMARY KEY,
  name text UNIQUE NOT NULL,
  category text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE public.tags IS '标签定义表';
COMMENT ON COLUMN public.tags.category IS '标签分类（如学科、难度等）';

-- 项目标签关联表
CREATE TABLE IF NOT EXISTS public.project_tags (
  project_id bigint REFERENCES public.projects(id) ON DELETE CASCADE,
  tag_id bigint REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, tag_id)
);

COMMENT ON TABLE public.project_tags IS '项目标签关联表';

-- 启用 RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tags ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. 权限检查函数
-- ============================================

-- 检查用户是否为管理员
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 检查用户是否为审核员或管理员
CREATE OR REPLACE FUNCTION public.is_moderator_or_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('moderator', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.is_admin() IS '检查当前用户是否为管理员';
COMMENT ON FUNCTION public.is_moderator_or_admin() IS '检查当前用户是否为审核员或管理员';

-- ============================================
-- 5. 更新 RLS 策略
-- ============================================

-- 删除旧的项目查看策略
DROP POLICY IF EXISTS "Projects are viewable by everyone" ON public.projects;

-- 新策略：只显示已批准的项目给所有人，作者可以看到自己的所有项目
CREATE POLICY "Approved projects viewable by everyone"
  ON public.projects FOR SELECT
  USING (
    status = 'approved' 
    OR auth.uid() = author_id 
    OR is_moderator_or_admin()
  );

-- 更新评论删除策略
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;

CREATE POLICY "Users can delete own comments or moderators can delete any"
  ON public.comments FOR DELETE
  USING (
    auth.uid() = author_id 
    OR is_moderator_or_admin()
  );

-- 标签策略
CREATE POLICY "Tags viewable by everyone"
  ON public.tags FOR SELECT
  USING (true);

CREATE POLICY "Moderators can manage tags"
  ON public.tags FOR ALL
  USING (is_moderator_or_admin())
  WITH CHECK (is_moderator_or_admin());

-- 项目标签策略
CREATE POLICY "Project tags viewable by everyone"
  ON public.project_tags FOR SELECT
  USING (true);

CREATE POLICY "Project authors can manage their project tags"
  ON public.project_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_tags.project_id 
      AND author_id = auth.uid()
    )
  );

-- ============================================
-- 6. 审核相关函数
-- ============================================

-- 批准项目
CREATE OR REPLACE FUNCTION public.approve_project(
  project_id bigint
)
RETURNS void AS $$
BEGIN
  -- 检查权限
  IF NOT is_moderator_or_admin() THEN
    RAISE EXCEPTION 'Permission denied: only moderators and admins can approve projects';
  END IF;

  -- 更新项目状态
  UPDATE public.projects
  SET 
    status = 'approved',
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    rejection_reason = NULL
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 拒绝项目
CREATE OR REPLACE FUNCTION public.reject_project(
  project_id bigint,
  reason text
)
RETURNS void AS $$
BEGIN
  -- 检查权限
  IF NOT is_moderator_or_admin() THEN
    RAISE EXCEPTION 'Permission denied: only moderators and admins can reject projects';
  END IF;

  -- 更新项目状态
  UPDATE public.projects
  SET 
    status = 'rejected',
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    rejection_reason = reason
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.approve_project(bigint) IS '批准项目（仅审核员/管理员）';
COMMENT ON FUNCTION public.reject_project(bigint, text) IS '拒绝项目（仅审核员/管理员）';

-- ============================================
-- 7. 将现有项目设置为已批准状态
-- ============================================

-- 将所有现有项目设置为 'approved' 状态，避免影响现有内容
UPDATE public.projects
SET status = 'approved'
WHERE status IS NULL OR status = 'pending';

-- ============================================
-- 完成提示
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ 权限系统迁移完成！';
  RAISE NOTICE '📊 添加了用户角色系统';
  RAISE NOTICE '🔍 添加了项目审核流程';
  RAISE NOTICE '🏷️ 添加了标签管理系统';
  RAISE NOTICE '🔒 更新了 RLS 策略';
  RAISE NOTICE '🚀 可以开始使用权限功能了！';
END $$;
