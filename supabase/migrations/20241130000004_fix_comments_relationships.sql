-- 修复 comments 表缺失的外键关系
-- 确保 Supabase PostgREST 能正确识别关系

DO $$
BEGIN
    -- 1. 修复 comments 表的 project_id 外键（如果不存在则添加）
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'comments_project_id_fkey' 
        AND conrelid = 'public.comments'::regclass
    ) THEN
        -- 清理孤儿数据
        DELETE FROM public.comments 
        WHERE project_id NOT IN (SELECT id FROM public.projects);
        
        -- 添加外键
        ALTER TABLE public.comments
        ADD CONSTRAINT comments_project_id_fkey
        FOREIGN KEY (project_id)
        REFERENCES public.projects(id)
        ON DELETE CASCADE;
        
        RAISE NOTICE '✅ 已添加 comments.project_id 外键';
    ELSE
        RAISE NOTICE '✅ comments.project_id 外键已存在';
    END IF;

    -- 2. 确保 comments 表的 author_id 外键指向 profiles（不是 auth.users）
    -- 这样 PostgREST 才能通过 profiles 关联查询
    
    -- 首先删除旧的指向 auth.users 的外键（如果存在）
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'comments_author_id_fkey' 
        AND conrelid = 'public.comments'::regclass
    ) THEN
        ALTER TABLE public.comments
        DROP CONSTRAINT comments_author_id_fkey;
        
        RAISE NOTICE '🗑️  已删除旧的 comments.author_id 外键';
    END IF;
    
    -- 添加新的外键指向 profiles 表
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'comments_author_id_fkey_profiles' 
        AND conrelid = 'public.comments'::regclass
    ) THEN
        -- 清理孤儿数据
        DELETE FROM public.comments 
        WHERE author_id NOT IN (SELECT id FROM public.profiles);
        
        -- 添加外键
        ALTER TABLE public.comments
        ADD CONSTRAINT comments_author_id_fkey_profiles
        FOREIGN KEY (author_id)
        REFERENCES public.profiles(id)
        ON DELETE CASCADE;
        
        RAISE NOTICE '✅ 已添加 comments.author_id 外键指向 profiles';
    ELSE
        RAISE NOTICE '✅ comments.author_id 外键已存在';
    END IF;

    RAISE NOTICE '🎉 comments 表外键关系修复完成';
END $$;

-- 刷新 PostgREST 缓存
NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';
