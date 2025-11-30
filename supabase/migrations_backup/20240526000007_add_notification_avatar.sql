-- Migration: Add avatar URL to notifications
-- This allows notifications to display the correct user avatar

-- Add from_avatar column to notifications table
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS from_avatar TEXT;

-- Add comment
COMMENT ON COLUMN notifications.from_avatar IS 'Avatar URL of the user who triggered the notification';
