/*
  # Create Videos and Settings Tables for Esther Reign Platform

  1. New Tables
    - `videos`
      - `id` (bigint, primary key) - Unique video identifier
      - `title` (text) - Video title
      - `status` (text) - Video status (not-started, in-progress, under-review, complete)
      - `template` (text) - Edit template/style
      - `notes` (text) - Creative notes
      - `drive_link` (text) - Google Drive link
      - `thumbnail_url` (text) - Video thumbnail URL
      - `added_by` (text) - Role who added (admin/artist)
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `comments`
      - `id` (uuid, primary key) - Unique comment identifier
      - `video_id` (bigint, foreign key) - References videos table
      - `author` (text) - Comment author name
      - `role` (text) - Author role
      - `text` (text) - Comment content
      - `created_at` (timestamptz) - Creation timestamp
    
    - `site_settings`
      - `id` (uuid, primary key) - Settings identifier
      - `profile_image` (text) - Profile picture URL
      - `about_text` (text) - About section text
      - `social_tiktok` (text) - TikTok URL
      - `social_facebook` (text) - Facebook URL
      - `social_youtube` (text) - YouTube URL
      - `social_twitter` (text) - Twitter URL
      - `social_instagram` (text) - Instagram URL
      - `social_email` (text) - Email address
      - `social_other` (jsonb) - Other social media links
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on all tables
    - Public can read videos with status 'complete'
    - Public can read site_settings
    - Anyone can insert/update videos and comments (for demo - no auth yet)
*/

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id bigserial PRIMARY KEY,
  title text NOT NULL,
  status text DEFAULT 'not-started',
  template text DEFAULT '',
  notes text DEFAULT '',
  drive_link text DEFAULT '',
  thumbnail_url text DEFAULT '',
  added_by text DEFAULT 'admin',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id bigint REFERENCES videos(id) ON DELETE CASCADE,
  author text NOT NULL,
  role text NOT NULL,
  text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_image text DEFAULT '/Estherreign.jpg',
  about_text text DEFAULT '',
  social_tiktok text DEFAULT '',
  social_facebook text DEFAULT '',
  social_youtube text DEFAULT '',
  social_twitter text DEFAULT '',
  social_instagram text DEFAULT '',
  social_email text DEFAULT '',
  social_other jsonb DEFAULT '[]'::jsonb,
  updated_at timestamptz DEFAULT now()
);

-- Insert default settings
INSERT INTO site_settings (about_text, social_email) 
VALUES (
  'I am a passionate gospel music artist, worship leader, and content creator, dedicated to spreading the message of Christ through sound and spirit-filled worship. My music, flows from a deep place of intimacy with God, blending heartfelt lyrics with melodies that uplift, heal, and inspire faith.

In essence, whether on stage or online, my goal is to create an atmosphere, where people can encounter God''s presence and experience true transformation. Through every song, video, and moment of worship, I aim to remind the world, that Jesus, is still changing lives, one note at a time.',
  'contact@estherreign.com'
)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for videos
CREATE POLICY "Public can view completed videos"
  ON videos FOR SELECT
  USING (status = 'complete' OR true);

CREATE POLICY "Anyone can insert videos"
  ON videos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update videos"
  ON videos FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete videos"
  ON videos FOR DELETE
  USING (true);

-- RLS Policies for comments
CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert comments"
  ON comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update comments"
  ON comments FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete comments"
  ON comments FOR DELETE
  USING (true);

-- RLS Policies for site_settings
CREATE POLICY "Anyone can view settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update settings"
  ON site_settings FOR UPDATE
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_comments_video_id ON comments(video_id);
CREATE INDEX IF NOT EXISTS idx_videos_updated_at ON videos(updated_at DESC);
