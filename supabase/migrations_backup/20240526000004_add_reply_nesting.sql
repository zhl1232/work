-- Migration: Add reply nesting support for discussions and comments
-- This allows users to reply to specific comments/replies and shows conversation threads

-- Add reply relationship fields to discussion_replies table
ALTER TABLE discussion_replies
ADD COLUMN IF NOT EXISTS parent_id BIGINT REFERENCES discussion_replies(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS reply_to_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS reply_to_username TEXT;

-- Add reply relationship fields to comments table
ALTER TABLE comments
ADD COLUMN IF NOT EXISTS parent_id BIGINT REFERENCES comments(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS reply_to_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS reply_to_username TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_discussion_replies_parent ON discussion_replies(parent_id);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_discussion ON discussion_replies(discussion_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_project ON comments(project_id);

-- Add comments to document the schema
COMMENT ON COLUMN discussion_replies.parent_id IS 'ID of the parent reply if this is a nested reply';
COMMENT ON COLUMN discussion_replies.reply_to_user_id IS 'User ID being replied to';
COMMENT ON COLUMN discussion_replies.reply_to_username IS 'Username being replied to (denormalized for display)';
COMMENT ON COLUMN comments.parent_id IS 'ID of the parent comment if this is a nested reply';
COMMENT ON COLUMN comments.reply_to_user_id IS 'User ID being replied to';
COMMENT ON COLUMN comments.reply_to_username IS 'Username being replied to (denormalized for display)';
