-- ============================================
-- 添加搜索功能相关字段
-- ============================================
-- 创建日期: 2025-11-28
-- 说明: 为 projects 表添加难度、时长、标签和全文搜索支持
-- ============================================

-- ============================================
-- 1. 添加新字段
-- ============================================

-- 添加难度等级字段
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard'));

-- 添加预计时长字段（分钟）
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS duration INTEGER CHECK (duration > 0 AND duration <= 1440);

-- 添加标签数组字段
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 添加全文搜索字段
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

COMMENT ON COLUMN public.projects.difficulty IS '项目难度等级: easy/medium/hard';
COMMENT ON COLUMN public.projects.duration IS '预计完成时长（分钟）';
COMMENT ON COLUMN public.projects.tags IS '项目标签数组';
COMMENT ON COLUMN public.projects.search_vector IS '全文搜索向量';

-- ============================================
-- 2. 创建索引
-- ============================================

-- 创建全文搜索索引（GIN 索引）
CREATE INDEX IF NOT EXISTS idx_projects_search 
  ON public.projects USING GIN(search_vector);

-- 创建难度索引（部分索引，只索引非空值）
CREATE INDEX IF NOT EXISTS idx_projects_difficulty 
  ON public.projects(difficulty) WHERE difficulty IS NOT NULL;

-- 创建时长索引（部分索引）
CREATE INDEX IF NOT EXISTS idx_projects_duration 
  ON public.projects(duration) WHERE duration IS NOT NULL;

-- 创建标签索引（GIN 索引用于数组）
CREATE INDEX IF NOT EXISTS idx_projects_tags 
  ON public.projects USING GIN(tags);

COMMENT ON INDEX idx_projects_search IS '项目全文搜索索引';
COMMENT ON INDEX idx_projects_difficulty IS '项目难度索引';
COMMENT ON INDEX idx_projects_duration IS '项目时长索引';
COMMENT ON INDEX idx_projects_tags IS '项目标签GIN索引';

-- ============================================
-- 3. 创建触发器函数
-- ============================================

-- 创建或替换触发器函数：自动更新搜索向量
CREATE OR REPLACE FUNCTION update_projects_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  -- 组合标题、描述和标签到搜索向量
  -- 标题权重最高 (A)，描述次之 (B)，标签第三 (C)
  NEW.search_vector := 
    setweight(to_tsvector('simple', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_projects_search_vector() IS '自动更新项目搜索向量的触发器函数';

-- ============================================
-- 4. 创建触发器
-- ============================================

-- 删除旧触发器（如果存在）
DROP TRIGGER IF EXISTS projects_search_vector_update ON public.projects;

-- 创建触发器：在插入或更新时自动更新搜索向量
CREATE TRIGGER projects_search_vector_update
  BEFORE INSERT OR UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION update_projects_search_vector();

COMMENT ON TRIGGER projects_search_vector_update ON public.projects IS '自动更新项目搜索向量';

-- ============================================
-- 5. 为现有数据初始化搜索向量
-- ============================================

-- 为所有现有项目生成搜索向量
UPDATE public.projects
SET search_vector = 
  setweight(to_tsvector('simple', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('simple', COALESCE(description, '')), 'B')
WHERE search_vector IS NULL;

-- ============================================
-- 完成提示
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ 搜索功能字段添加完成！';
  RAISE NOTICE '📊 已添加字段: difficulty, duration, tags, search_vector';
  RAISE NOTICE '🔍 已创建 4 个索引';
  RAISE NOTICE '⚡ 已创建自动更新搜索向量的触发器';
  RAISE NOTICE '🚀 搜索功能已就绪！';
END $$;
