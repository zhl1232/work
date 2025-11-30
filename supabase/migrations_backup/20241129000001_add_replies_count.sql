-- 添加回复计数和最后回复时间字段到discussions表
-- 这将提高"回复最多"和"回复最新"排序的性能

-- 1. 添加回复计数字段和最后回复时间字段
ALTER TABLE discussions ADD COLUMN IF NOT EXISTS replies_count INTEGER DEFAULT 0;
ALTER TABLE discussions ADD COLUMN IF NOT EXISTS last_reply_at TIMESTAMP WITH TIME ZONE;

-- 2. 初始化现有数据的回复数和最后回复时间
-- 统计每个讨论的回复数并更新
UPDATE discussions SET replies_count = (
    SELECT COUNT(*) FROM discussion_replies 
    WHERE discussion_replies.discussion_id = discussions.id
);

-- 更新最后回复时间为该讨论最新回复的创建时间
UPDATE discussions SET last_reply_at = (
    SELECT MAX(created_at) FROM discussion_replies 
    WHERE discussion_replies.discussion_id = discussions.id
);

-- 3. 创建触发器函数:新增回复时增加计数并更新最后回复时间
CREATE OR REPLACE FUNCTION increment_discussion_replies_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE discussions 
    SET replies_count = replies_count + 1,
        last_reply_at = NEW.created_at
    WHERE id = NEW.discussion_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. 创建触发器函数:删除回复时减少计数并重新计算最后回复时间
CREATE OR REPLACE FUNCTION decrement_discussion_replies_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE discussions 
    SET replies_count = replies_count - 1,
        last_reply_at = (
            SELECT MAX(created_at) FROM discussion_replies 
            WHERE discussion_id = OLD.discussion_id
        )
    WHERE id = OLD.discussion_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 5. 绑定触发器到discussion_replies表
DROP TRIGGER IF EXISTS discussion_replies_insert_trigger ON discussion_replies;
CREATE TRIGGER discussion_replies_insert_trigger
    AFTER INSERT ON discussion_replies
    FOR EACH ROW
    EXECUTE FUNCTION increment_discussion_replies_count();

DROP TRIGGER IF EXISTS discussion_replies_delete_trigger ON discussion_replies;
CREATE TRIGGER discussion_replies_delete_trigger
    AFTER DELETE ON discussion_replies
    FOR EACH ROW
    EXECUTE FUNCTION decrement_discussion_replies_count();

-- 6. 添加索引以优化排序性能
CREATE INDEX IF NOT EXISTS idx_discussions_replies_count ON discussions(replies_count DESC);
CREATE INDEX IF NOT EXISTS idx_discussions_likes_count ON discussions(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_discussions_created_at ON discussions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_discussions_last_reply_at ON discussions(last_reply_at DESC NULLS LAST);

-- 说明:
-- - replies_count字段会自动通过触发器保持同步
-- - last_reply_at字段记录最后一次回复的时间,用于"回复最新"排序
-- - 添加了索引以优化四种排序方式的性能(最新发布、最热门、回复最多、回复最新)
-- - 触发器确保数据一致性
-- - 删除回复时会重新计算last_reply_at,确保准确性
