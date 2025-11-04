-- Complete Supabase Schema for Esther Reign Platform
-- Run this in your Supabase SQL Editor

-- 1. Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  video_id TEXT,
  edited BOOLEAN DEFAULT FALSE,
  is_approval_request BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Videos Table
CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  video_link TEXT,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'pending',
  template_type TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  hero_image TEXT,
  hero_description TEXT,
  about_image TEXT,
  about_text TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  social_links JSONB,
  total_visits INTEGER DEFAULT 0,
  artist_logins INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (simple app)
CREATE POLICY "Allow all on chat_messages" ON chat_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on videos" ON videos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on site_settings" ON site_settings FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_videos_order ON videos(order_index ASC);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);

-- Enable real-time for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE videos;
ALTER PUBLICATION supabase_realtime ADD TABLE site_settings;

-- Insert default settings if not exists
INSERT INTO site_settings (id, hero_description, about_text)
VALUES (
  'main',
  'Lifting voices in worship through powerful gospel music. Experience the presence of God through every note.',
  'I am an emerging gospel artist with a deep passion for worship and praise. Through powerful cover songs, I aim to create an atmosphere where people can encounter God''s presence.'
)
ON CONFLICT (id) DO NOTHING;
