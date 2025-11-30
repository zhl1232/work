-- ============================================
-- 拆分点赞与收藏功能
-- ============================================
-- 创建日期: 2024-11-30
-- 说明: 创建 collections 表，并迁移现有的 likes 数据
-- ============================================

-- 1. 创建 collections 表
CREATE TABLE IF NOT EXISTS public.collections (
    id bigserial PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    project_id bigint REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, project_id)
);

-- 2. 添加索引
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON public.collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_project_id ON public.collections(project_id);

-- 3. 启用 RLS
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- 4. 添加 RLS 策略
-- 用户可以查看自己的收藏
CREATE POLICY "Users can view own collections"
    ON public.collections FOR SELECT
    USING (auth.uid() = user_id);

-- 用户可以添加收藏
CREATE POLICY "Users can create collections"
    ON public.collections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 用户可以取消收藏
CREATE POLICY "Users can delete own collections"
    ON public.collections FOR DELETE
    USING (auth.uid() = user_id);

-- 5. 数据迁移：将现有的 likes 数据复制到 collections
-- 这样用户之前点赞的项目会自动成为收藏
INSERT INTO public.collections (user_id, project_id, created_at)
SELECT user_id, project_id, created_at
FROM public.likes
ON CONFLICT (user_id, project_id) DO NOTHING;

-- 6. 添加注释
COMMENT ON TABLE public.collections IS '用户收藏表';
