-- ============================================
-- 完成项目验证机制迁移
-- ============================================
-- 创建日期: 2024-11-30
-- 说明: 为 completed_projects 表添加证明字段，防止无限刷经验
-- ============================================

DO $$
BEGIN
    -- 1. 添加 ID 主键（如果还没有）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'completed_projects' 
        AND column_name = 'id'
    ) THEN
        -- 先删除旧的主键约束
        ALTER TABLE public.completed_projects DROP CONSTRAINT IF EXISTS completed_projects_pkey;
        
        -- 添加 ID 列
        ALTER TABLE public.completed_projects ADD COLUMN id bigserial;
        
        -- 设置为主键
        ALTER TABLE public.completed_projects ADD PRIMARY KEY (id);
        
        -- 添加唯一约束（user_id, project_id）
        ALTER TABLE public.completed_projects 
        ADD CONSTRAINT completed_projects_user_project_unique 
        UNIQUE (user_id, project_id);
        
        RAISE NOTICE '✅ 已添加 ID 主键列';
    END IF;

    -- 2. 添加证明图片字段（数组）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'completed_projects' 
        AND column_name = 'proof_images'
    ) THEN
        ALTER TABLE public.completed_projects 
        ADD COLUMN proof_images text[];
        
        RAISE NOTICE '✅ 已添加 proof_images 字段';
    END IF;

    -- 3. 添加证明视频字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'completed_projects' 
        AND column_name = 'proof_video_url'
    ) THEN
        ALTER TABLE public.completed_projects 
        ADD COLUMN proof_video_url text;
        
        RAISE NOTICE '✅ 已添加 proof_video_url 字段';
    END IF;

    -- 4. 添加完成笔记字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'completed_projects' 
        AND column_name = 'notes'
    ) THEN
        ALTER TABLE public.completed_projects 
        ADD COLUMN notes text;
        
        RAISE NOTICE '✅ 已添加 notes 字段';
    END IF;

    -- 5. 添加验证状态字段（可选）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'completed_projects' 
        AND column_name = 'is_verified'
    ) THEN
        ALTER TABLE public.completed_projects 
        ADD COLUMN is_verified boolean DEFAULT false;
        
        RAISE NOTICE '✅ 已添加 is_verified 字段';
    END IF;

    -- 6. 添加验证人字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'completed_projects' 
        AND column_name = 'verified_by'
    ) THEN
        ALTER TABLE public.completed_projects 
        ADD COLUMN verified_by uuid REFERENCES auth.users(id);
        
        RAISE NOTICE '✅ 已添加 verified_by 字段';
    END IF;

    -- 7. 添加点赞数字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'completed_projects' 
        AND column_name = 'likes_count'
    ) THEN
        ALTER TABLE public.completed_projects 
        ADD COLUMN likes_count int DEFAULT 0;
        
        RAISE NOTICE '✅ 已添加 likes_count 字段';
    END IF;

    -- 8. 添加举报数字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'completed_projects' 
        AND column_name = 'report_count'
    ) THEN
        ALTER TABLE public.completed_projects 
        ADD COLUMN report_count int DEFAULT 0;
        
        RAISE NOTICE '✅ 已添加 report_count 字段';
    END IF;

END $$;

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_completed_projects_user 
ON public.completed_projects(user_id);

CREATE INDEX IF NOT EXISTS idx_completed_projects_project 
ON public.completed_projects(project_id);

CREATE INDEX IF NOT EXISTS idx_completed_projects_verified 
ON public.completed_projects(is_verified);

-- 添加注释
COMMENT ON COLUMN public.completed_projects.id IS '主键ID';
COMMENT ON COLUMN public.completed_projects.proof_images IS '完成证明图片数组';
COMMENT ON COLUMN public.completed_projects.proof_video_url IS '完成证明视频URL';
COMMENT ON COLUMN public.completed_projects.notes IS '完成笔记或心得';
COMMENT ON COLUMN public.completed_projects.is_verified IS '是否已验证（审核员）';
COMMENT ON COLUMN public.completed_projects.verified_by IS '验证人ID';
COMMENT ON COLUMN public.completed_projects.likes_count IS '点赞数';
COMMENT ON COLUMN public.completed_projects.report_count IS '举报数';

-- ============================================
-- 完成提示
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '🎉 完成项目验证机制迁移完成！';
  RAISE NOTICE '📸 现在需要上传证明图片才能完成项目';
  RAISE NOTICE '🛡️ 可选的审核员验证机制已就绪';
  RAISE NOTICE '❤️ 支持社区点赞和举报';
END $$;
