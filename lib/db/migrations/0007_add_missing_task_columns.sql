-- Add missing task columns to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "task_social_reddit" boolean DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "task_friends_pro_subscribed" integer DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "task_post_likes_10" boolean DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "task_all_completed" boolean DEFAULT false;
