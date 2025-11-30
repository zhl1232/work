-- 确保 project_materials 和 project_steps 与 projects 的外键关系存在
-- 同时也强制刷新 PostgREST schema 缓存

DO $$
BEGIN
    -- 0. 清理孤儿数据 (防止添加外键时报错)
    -- 删除那些指向不存在项目的材料和步骤
    DELETE FROM public.project_materials WHERE project_id NOT IN (SELECT id FROM public.projects);
    DELETE FROM public.project_steps WHERE project_id NOT IN (SELECT id FROM public.projects);

    -- 1. 检查并修复 project_materials 的外键
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'project_materials_project_id_fkey'
    ) THEN
        -- 如果约束不存在（可能是自动生成的名称不同，或者根本没有），尝试添加
        -- 先尝试删除可能存在的旧约束（为了安全）
        BEGIN
            ALTER TABLE public.project_materials DROP CONSTRAINT IF EXISTS project_materials_project_id_fkey;
        EXCEPTION WHEN OTHERS THEN NULL; END;

        ALTER TABLE public.project_materials
        ADD CONSTRAINT project_materials_project_id_fkey
        FOREIGN KEY (project_id)
        REFERENCES public.projects(id)
        ON DELETE CASCADE;
        
        RAISE NOTICE '✅ 已修复 project_materials 外键';
    ELSE
        RAISE NOTICE 'ℹ️ project_materials 外键已存在';
    END IF;

    -- 2. 检查并修复 project_steps 的外键
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'project_steps_project_id_fkey'
    ) THEN
        BEGIN
            ALTER TABLE public.project_steps DROP CONSTRAINT IF EXISTS project_steps_project_id_fkey;
        EXCEPTION WHEN OTHERS THEN NULL; END;

        ALTER TABLE public.project_steps
        ADD CONSTRAINT project_steps_project_id_fkey
        FOREIGN KEY (project_id)
        REFERENCES public.projects(id)
        ON DELETE CASCADE;

        RAISE NOTICE '✅ 已修复 project_steps 外键';
    ELSE
        RAISE NOTICE 'ℹ️ project_steps 外键已存在';
    END IF;

END $$;

-- 3. 强制刷新 PostgREST 缓存
NOTIFY pgrst, 'reload config';
