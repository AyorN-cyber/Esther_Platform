/*
  # Add Public Comments, Notifications, and Image Storage

  1. New Tables
    - `public_comments`
      - `id` (uuid, primary key)
      - `video_id` (bigint, foreign key)
      - `author_name` (text) - Visitor's name
      - `author_email` (text) - Optional email
      - `text` (text) - Comment content
      - `created_at` (timestamptz)
    
    - `notifications`
      - `id` (uuid, primary key)
      - `user_role` (text) - Target role (artist/admin)
      - `title` (text) - Notification title
      - `message` (text) - Notification message
      - `type` (text) - Type: update, comment, status_change
      - `reference_id` (bigint) - Related video/item ID
      - `is_read` (boolean) - Read status
      - `created_at` (timestamptz)
    
    - `comment_replies`
      - `id` (uuid, primary key)
      - `comment_id` (uuid/text, foreign key)
      - `author` (text)
      - `role` (text)
      - `text` (text)
      - `created_at` (timestamptz)

  2. Updates
    - Add `about_image` column to site_settings
    - Add `parent_comment_id` to comments for threading

  3. Security
    - Enable RLS on all new tables
    - Public can read and insert public_comments
    - Anyone can read notifications
*/

-- Create public_comments table
CREATE TABLE IF NOT EXISTS public_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id bigint REFERENCES videos(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_email text DEFAULT '',
  text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_role text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'update',
  reference_id bigint DEFAULT 0,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create comment_replies table
CREATE TABLE IF NOT EXISTS comment_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL,
  author text NOT NULL,
  role text NOT NULL,
  text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add about_image to site_settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'about_image'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN about_image text DEFAULT '/IMG-20250915-WA0023.jpg';
  END IF;
END $$;

-- Add parent_comment_id to comments for threading
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'parent_comment_id'
  ) THEN
    ALTER TABLE comments ADD COLUMN parent_comment_id uuid DEFAULT NULL;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public_comments
CREATE POLICY "Anyone can view public comments"
  ON public_comments FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert public comments"
  ON public_comments FOR INSERT
  WITH CHECK (true);

-- RLS Policies for notifications
CREATE POLICY "Anyone can view notifications"
  ON notifications FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update notifications"
  ON notifications FOR UPDATE
  USING (true);

-- RLS Policies for comment_replies
CREATE POLICY "Anyone can view comment replies"
  ON comment_replies FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert comment replies"
  ON comment_replies FOR INSERT
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_public_comments_video_id ON public_comments(video_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_role ON notifications(user_role, is_read);
CREATE INDEX IF NOT EXISTS idx_comment_replies_comment_id ON comment_replies(comment_id);
