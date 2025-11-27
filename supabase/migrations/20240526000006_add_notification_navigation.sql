-- Migration: Add navigation fields to notifications
-- This allows notifications to include project_id and discussion_id for proper navigation

-- Add project_id and discussion_id columns to notifications table
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS project_id BIGINT,
ADD COLUMN IF NOT EXISTS discussion_id BIGINT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_project ON notifications(project_id);
CREATE INDEX IF NOT EXISTS idx_notifications_discussion ON notifications(discussion_id);

-- Add comments to document the schema
COMMENT ON COLUMN notifications.project_id IS 'Project ID for comment notifications (to enable navigation)';
COMMENT ON COLUMN notifications.discussion_id IS 'Discussion ID for discussion_reply notifications (to enable navigation)';
