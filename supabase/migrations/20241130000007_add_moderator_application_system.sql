-- ============================================
-- 审核员申请系统迁移
-- ============================================
-- 创建日期: 2024-11-30
-- 说明: 创建审核员申请表和行为日志表
-- ============================================

-- ============================================
-- 1. 审核员申请表
-- ============================================
CREATE TABLE IF NOT EXISTS public.moderator_applications (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- 申请时的用户数据快照（用于审核参考）
  level_at_application int NOT NULL,
  xp_at_application int NOT NULL,
  projects_published int NOT NULL,
  projects_completed int NOT NULL,
  comments_count int NOT NULL,
  badges_count int NOT NULL,
  account_age_days int NOT NULL,
  
  -- 申请信息
  motivation text NOT NULL, -- 申请动机（为什么想成为审核员）
  
  -- 审核信息
  status text DEFAULT 'pending', -- pending, approved, rejected
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamp with time zone,
  rejection_reason text,
  
  -- 时间戳
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT status_check CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_moderator_applications_user 
  ON public.moderator_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_moderator_applications_status 
  ON public.moderator_applications(status);
CREATE INDEX IF NOT EXISTS idx_moderator_applications_created_at 
  ON public.moderator_applications(created_at DESC);

-- 注释
COMMENT ON TABLE public.moderator_applications IS '审核员申请表';
COMMENT ON COLUMN public.moderator_applications.level_at_application IS '申请时的等级';
COMMENT ON COLUMN public.moderator_applications.xp_at_application IS '申请时的经验值';
COMMENT ON COLUMN public.moderator_applications.motivation IS '申请动机说明';
COMMENT ON COLUMN public.moderator_applications.status IS '申请状态: pending/approved/rejected';

-- ============================================
-- 2. 审核员行为日志表
-- ============================================
CREATE TABLE IF NOT EXISTS public.moderator_actions (
  id bigserial PRIMARY KEY,
  moderator_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_type text NOT NULL, -- approve_project, reject_project, delete_comment, verify_completion, reject_completion
  target_type text NOT NULL, -- project, comment, completion
  target_id bigint NOT NULL,
  reason text,
  metadata jsonb, -- 额外的元数据
  created_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT action_type_check CHECK (
    action_type IN (
      'approve_project', 
      'reject_project', 
      'delete_comment', 
      'delete_discussion_reply',
      'verify_completion', 
      'reject_completion'
    )
  ),
  CONSTRAINT target_type_check CHECK (
    target_type IN ('project', 'comment', 'discussion_reply', 'completion')
  )
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_moderator_actions_moderator 
  ON public.moderator_actions(moderator_id);
CREATE INDEX IF NOT EXISTS idx_moderator_actions_created_at 
  ON public.moderator_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moderator_actions_action_type 
  ON public.moderator_actions(action_type);

-- 注释
COMMENT ON TABLE public.moderator_actions IS '审核员行为日志表';
COMMENT ON COLUMN public.moderator_actions.action_type IS '操作类型';
COMMENT ON COLUMN public.moderator_actions.target_type IS '目标类型';
COMMENT ON COLUMN public.moderator_actions.target_id IS '目标ID';
COMMENT ON COLUMN public.moderator_actions.metadata IS '额外元数据（JSON格式）';

-- ============================================
-- 3. RLS 策略
-- ============================================

-- moderator_applications 表的 RLS
ALTER TABLE public.moderator_applications ENABLE ROW LEVEL SECURITY;

-- 用户可以查看自己的申请
CREATE POLICY "Users can view own applications"
  ON public.moderator_applications FOR SELECT
  USING (auth.uid() = user_id);

-- 用户可以创建申请（但有限制：每人只能有一个pending申请）
CREATE POLICY "Users can create applications"
  ON public.moderator_applications FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND NOT EXISTS (
      SELECT 1 FROM public.moderator_applications
      WHERE user_id = auth.uid() AND status = 'pending'
    )
  );

-- 管理员可以查看所有申请
CREATE POLICY "Admins can view all applications"
  ON public.moderator_applications FOR SELECT
  USING (is_admin());

-- 管理员可以更新申请状态
CREATE POLICY "Admins can update applications"
  ON public.moderator_applications FOR UPDATE
  USING (is_admin());

-- moderator_actions 表的 RLS
ALTER TABLE public.moderator_actions ENABLE ROW LEVEL SECURITY;

-- 审核员和管理员可以查看所有行为日志
CREATE POLICY "Moderators can view all actions"
  ON public.moderator_actions FOR SELECT
  USING (is_moderator_or_admin());

-- 审核员和管理员可以创建行为日志
CREATE POLICY "Moderators can create actions"
  ON public.moderator_actions FOR INSERT
  WITH CHECK (
    is_moderator_or_admin() AND auth.uid() = moderator_id
  );

-- ============================================
-- 4. 辅助函数
-- ============================================

-- 记录审核员行为
CREATE OR REPLACE FUNCTION public.log_moderator_action(
  p_action_type text,
  p_target_type text,
  p_target_id bigint,
  p_reason text DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- 检查权限
  IF NOT is_moderator_or_admin() THEN
    RAISE EXCEPTION 'Permission denied: only moderators and admins can log actions';
  END IF;

  -- 插入日志
  INSERT INTO public.moderator_actions (
    moderator_id,
    action_type,
    target_type,
    target_id,
    reason,
    metadata
  ) VALUES (
    auth.uid(),
    p_action_type,
    p_target_type,
    p_target_id,
    p_reason,
    p_metadata
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.log_moderator_action IS '记录审核员行为日志';

-- 检查用户是否有待审核的申请
CREATE OR REPLACE FUNCTION public.has_pending_moderator_application(p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.moderator_applications
    WHERE user_id = p_user_id AND status = 'pending'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.has_pending_moderator_application IS '检查用户是否有待审核的审核员申请';

-- ============================================
-- 完成提示
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ 审核员申请系统迁移完成！';
  RAISE NOTICE '📝 创建了 moderator_applications 表';
  RAISE NOTICE '📊 创建了 moderator_actions 日志表';
  RAISE NOTICE '🔒 配置了 RLS 策略';
  RAISE NOTICE '🚀 可以开始接受审核员申请了！';
END $$;
