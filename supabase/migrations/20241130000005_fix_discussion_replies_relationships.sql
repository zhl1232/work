-- 修复 discussion_replies 表的外键关系
-- 确保 PostgREST 能正确识别关联

DO $$
BEGIN
    -- 1. 修复 discussion_replies 的 discussion_id 外键
    -- 检查并确保外键存在
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'discussion_replies_discussion_id_fkey' 
        AND conrelid = 'public.discussion_replies'::regclass
    ) THEN
        -- 清理孤儿数据
        DELETE FROM public.discussion_replies 
        WHERE discussion_id NOT IN (SELECT id FROM public.discussions);
        
        -- 添加外键
        ALTER TABLE public.discussion_replies
        ADD CONSTRAINT discussion_replies_discussion_id_fkey
        FOREIGN KEY (discussion_id)
        REFERENCES public.discussions(id)
        ON DELETE CASCADE;
        
        RAISE NOTICE '✅ 已添加 discussion_replies.discussion_id 外键';
    ELSE
        RAISE NOTICE '✅ discussion_replies.discussion_id 外键已存在';
    END IF;

    -- 2. 修复 discussion_replies 的 author_id 外键（指向 profiles）
    -- 首先删除旧的指向 auth.users 的外键
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'discussion_replies_author_id_fkey' 
        AND conrelid = 'public.discussion_replies'::regclass
    ) THEN
        ALTER TABLE public.discussion_replies
        DROP CONSTRAINT discussion_replies_author_id_fkey;
        
        RAISE NOTICE '🗑️  已删除旧的 discussion_replies.author_id 外键';
    END IF;
    
    -- 添加新的外键指向 profiles 表
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'discussion_replies_author_id_fkey_profiles' 
        AND conrelid = 'public.discussion_replies'::regclass
    ) THEN
        -- 清理孤儿数据
        DELETE FROM public.discussion_replies 
        WHERE author_id NOT IN (SELECT id FROM public.profiles);
        
        -- 添加外键
        ALTER TABLE public.discussion_replies
        ADD CONSTRAINT discussion_replies_author_id_fkey_profiles
        FOREIGN KEY (author_id)
        REFERENCES public.profiles(id)
        ON DELETE CASCADE;
        
        RAISE NOTICE '✅ 已添加 discussion_replies.author_id 外键指向 profiles';
    ELSE
        RAISE NOTICE '✅ discussion_replies.author_id 外键已存在';
    END IF;

    -- 3. 同时检查 discussions 表的 author_id 外键
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'discussions_author_id_fkey' 
        AND conrelid = 'public.discussions'::regclass
    ) THEN
        ALTER TABLE public.discussions
        DROP CONSTRAINT discussions_author_id_fkey;
        
        RAISE NOTICE '🗑️  已删除旧的 discussions.author_id 外键';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'discussions_author_id_fkey_profiles' 
        AND conrelid = 'public.discussions'::regclass
    ) THEN
        -- 清理孤儿数据
        DELETE FROM public.discussions 
        WHERE author_id NOT IN (SELECT id FROM public.profiles);
        
        -- 添加外键
        ALTER TABLE public.discussions
        ADD CONSTRAINT discussions_author_id_fkey_profiles
        FOREIGN KEY (author_id)
        REFERENCES public.profiles(id)
        ON DELETE CASCADE;
        
        RAISE NOTICE '✅ 已添加 discussions.author_id 外键指向 profiles';
    ELSE
        RAISE NOTICE '✅ discussions.author_id 外键已存在';
    END IF;

    RAISE NOTICE '🎉 discussion_replies 表外键关系修复完成';
END $$;

-- 强制刷新 PostgREST 缓存
NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';
