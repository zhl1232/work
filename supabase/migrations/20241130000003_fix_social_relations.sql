-- 修复社交功能表（讨论、评论等）的缺失关系
-- 同样是为了解决 PGRST200 错误，允许查询作者详情

DO $$
BEGIN
    -- 1. 修复 discussions (讨论)
    -- 清理孤儿数据
    DELETE FROM public.discussions WHERE author_id NOT IN (SELECT id FROM public.profiles);
    
    -- 添加外键 (如果不存在)
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'discussions_author_id_fkey_profiles') THEN
        ALTER TABLE public.discussions
        ADD CONSTRAINT discussions_author_id_fkey_profiles
        FOREIGN KEY (author_id)
        REFERENCES public.profiles(id);
    END IF;

    -- 2. 修复 comments (评论)
    DELETE FROM public.comments WHERE author_id NOT IN (SELECT id FROM public.profiles);
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'comments_author_id_fkey_profiles') THEN
        ALTER TABLE public.comments
        ADD CONSTRAINT comments_author_id_fkey_profiles
        FOREIGN KEY (author_id)
        REFERENCES public.profiles(id);
    END IF;

    -- 3. 修复 discussion_replies (讨论回复)
    DELETE FROM public.discussion_replies WHERE author_id NOT IN (SELECT id FROM public.profiles);
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'discussion_replies_author_id_fkey_profiles') THEN
        ALTER TABLE public.discussion_replies
        ADD CONSTRAINT discussion_replies_author_id_fkey_profiles
        FOREIGN KEY (author_id)
        REFERENCES public.profiles(id);
    END IF;

    RAISE NOTICE '✅ 已修复所有社交表的外键关系';
END $$;

-- 强制刷新 PostgREST 缓存
NOTIFY pgrst, 'reload config';
