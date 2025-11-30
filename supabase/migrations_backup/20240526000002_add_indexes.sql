-- ============================================
-- 添加性能优化索引
-- ============================================
-- 创建日期: 2025-11-26
-- 说明: 为常用查询字段添加索引,提升查询性能
-- ============================================

-- ============================================
-- 1. Projects 表索引
-- ============================================

-- 作者和状态复合索引(用于用户查看自己的项目)
CREATE INDEX IF NOT EXISTS idx_projects_author_status 
  ON public.projects(author_id, status);

-- 分类和状态复合索引(用于按分类筛选)
CREATE INDEX IF NOT EXISTS idx_projects_category_status 
  ON public.projects(category, status);

-- 创建时间降序索引(用于按时间排序)
CREATE INDEX IF NOT EXISTS idx_projects_created_at_desc 
  ON public.projects(created_at DESC);

-- 状态索引(用于管理员查看待审核项目)
-- 注意: idx_projects_status 已在权限系统迁移中创建,这里跳过

COMMENT ON INDEX idx_projects_author_status IS '项目作者和状态复合索引';
COMMENT ON INDEX idx_projects_category_status IS '项目分类和状态复合索引';
COMMENT ON INDEX idx_projects_created_at_desc IS '项目创建时间降序索引';

-- ============================================
-- 2. Likes 表索引
-- ============================================

-- 用户和项目复合索引(用于检查是否已点赞)
CREATE INDEX IF NOT EXISTS idx_likes_user_project 
  ON public.likes(user_id, project_id);

-- 项目索引(用于统计项目的点赞数)
CREATE INDEX IF NOT EXISTS idx_likes_project 
  ON public.likes(project_id);

COMMENT ON INDEX idx_likes_user_project IS '点赞用户和项目复合索引';
COMMENT ON INDEX idx_likes_project IS '点赞项目索引';

-- ============================================
-- 3. Comments 表索引
-- ============================================

-- 项目和创建时间复合索引(用于按时间排序项目评论)
CREATE INDEX IF NOT EXISTS idx_comments_project_created 
  ON public.comments(project_id, created_at DESC);

-- 作者索引(用于查询用户的所有评论)
CREATE INDEX IF NOT EXISTS idx_comments_author 
  ON public.comments(author_id);

COMMENT ON INDEX idx_comments_project_created IS '评论项目和创建时间复合索引';
COMMENT ON INDEX idx_comments_author IS '评论作者索引';

-- ============================================
-- 4. Discussion Replies 表索引
-- ============================================

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'discussion_replies'
  ) THEN
    -- 讨论和创建时间复合索引
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_discussion_replies_discussion_created 
      ON public.discussion_replies(discussion_id, created_at DESC)';
    
    -- 作者索引
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_discussion_replies_author 
      ON public.discussion_replies(author_id)';
    
    EXECUTE 'COMMENT ON INDEX idx_discussion_replies_discussion_created 
      IS ''讨论回复和创建时间复合索引''';
    EXECUTE 'COMMENT ON INDEX idx_discussion_replies_author 
      IS ''讨论回复作者索引''';
  END IF;
END $$;

-- ============================================
-- 5. User Badges 表索引
-- ============================================

-- 用户索引(用于查询用户的所有徽章)
CREATE INDEX IF NOT EXISTS idx_user_badges_user 
  ON public.user_badges(user_id);

-- 用户和徽章复合唯一索引(防止重复徽章)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_badges_user_badge_unique 
  ON public.user_badges(user_id, badge_id);

COMMENT ON INDEX idx_user_badges_user IS '用户徽章用户索引';
COMMENT ON INDEX idx_user_badges_user_badge_unique IS '用户徽章唯一索引';

-- ============================================
-- 6. Profiles 表索引
-- ============================================

-- username 唯一索引(应该已存在)
-- role 索引(已在权限系统迁移中创建)

-- ============================================
-- 完成提示
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ 性能优化索引创建完成！';
  RAISE NOTICE '📊 为 projects 表添加了 3 个索引';
  RAISE NOTICE '👍 为 likes 表添加了 2 个索引';
  RAISE NOTICE '💬 为 comments 表添加了 2 个索引';
  RAISE NOTICE '🗨️  为 discussion_replies 表添加了 2 个索引';
  RAISE NOTICE '🏅 为 user_badges 表添加了 2 个索引';
  RAISE NOTICE '🚀 查询性能将得到显著提升！';
END $$;
