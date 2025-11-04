-- Enhanced Supabase Schema for Admin Features
-- Run this in your Supabase SQL Editor

-- ==================== VIDEOS TABLE ====================
CREATE TABLE IF NOT EXISTS public.videos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    video_link TEXT,
    thumbnail_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    template_type TEXT DEFAULT 'default',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (drop if exists)
DROP POLICY IF EXISTS "Allow all operations on videos" ON public.videos;
CREATE POLICY "Allow all operations on videos" ON public.videos
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_videos_order ON public.videos(order_index ASC);
CREATE INDEX IF NOT EXISTS idx_videos_status ON public.videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_updated_at ON public.videos(updated_at DESC);

-- Enable realtime (skip if already added)
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.videos;
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Table already in publication, skip
END $$;

-- ==================== SITE SETTINGS TABLE ====================
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'main',
    hero_image TEXT,
    hero_description TEXT,
    about_image TEXT,
    about_text TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    social_links JSONB DEFAULT '{"instagram": "", "youtube": "", "tiktok": "", "facebook": ""}'::jsonb,
    total_visits INTEGER DEFAULT 0,
    artist_logins INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (drop if exists)
DROP POLICY IF EXISTS "Allow all operations on site_settings" ON public.site_settings;
CREATE POLICY "Allow all operations on site_settings" ON public.site_settings
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Enable realtime (skip if already added)
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Table already in publication, skip
END $$;

-- Insert default settings if not exists
INSERT INTO public.site_settings (id, hero_description, about_text, contact_email, contact_phone)
VALUES (
    'main',
    'Lifting voices in worship through powerful gospel music. Experience the presence of God through every note.',
    'I am an emerging gospel artist with a deep passion for worship and praise. Through powerful cover songs, I aim to create an atmosphere where people can encounter God''s presence.',
    'contact@estherreign.com',
    '+234 818 019 4269'
)
ON CONFLICT (id) DO NOTHING;

-- ==================== AUTO-UPDATE TRIGGERS ====================
-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for videos
DROP TRIGGER IF EXISTS update_videos_updated_at ON public.videos;
CREATE TRIGGER update_videos_updated_at 
    BEFORE UPDATE ON public.videos
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for site_settings
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER update_site_settings_updated_at 
    BEFORE UPDATE ON public.site_settings
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ==================== HELPER FUNCTIONS ====================
-- Function to reorder videos
CREATE OR REPLACE FUNCTION reorder_videos(video_ids TEXT[])
RETURNS void AS $$
DECLARE
    vid TEXT;
    idx INTEGER := 0;
BEGIN
    FOREACH vid IN ARRAY video_ids
    LOOP
        UPDATE public.videos 
        SET order_index = idx, updated_at = NOW()
        WHERE id = vid;
        idx := idx + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ==================== VERIFICATION ====================
-- Check if tables exist
SELECT 
    'videos' as table_name, 
    COUNT(*) as row_count 
FROM public.videos
UNION ALL
SELECT 
    'site_settings' as table_name, 
    COUNT(*) as row_count 
FROM public.site_settings;
