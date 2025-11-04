-- ==========================================
-- ESTHER REIGN PLATFORM - COMPLETE DATABASE SCHEMA
-- Production-Ready Supabase PostgreSQL Schema
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. USERS TABLE (Compatible with existing structure)
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('artist', 'manager', 'admin', 'editor', 'prayer_team')),
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    preferences JSONB DEFAULT '{}'::jsonb
);

-- ==========================================
-- 2. VIDEOS TABLE (Compatible with existing TEXT id)
-- ==========================================
-- Note: If videos table already exists with TEXT id, we'll keep it
-- and add new columns if they don't exist

DO $$
BEGIN
    -- Check if videos table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'videos') THEN
        -- Create new table with TEXT id for compatibility
        CREATE TABLE videos (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            category TEXT CHECK (category IN ('cover', 'cover_duet', 'original', 'feature', 'duet', 'worship_moment', 'testimony', 'bts')),
            upload_method TEXT CHECK (upload_method IN ('file', 'link')),
            video_url TEXT,
            video_link TEXT, -- alias for compatibility
            video_file_path TEXT,
            video_size_mb DECIMAL,
            video_duration_seconds INTEGER,
            thumbnail_url TEXT,
            editing_style TEXT,
            template_type TEXT,
            description TEXT,
            scripture_reference TEXT,
            upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            published_date TIMESTAMP WITH TIME ZONE,
            is_draft BOOLEAN DEFAULT FALSE,
            tags TEXT[],
            uploaded_by TEXT,
            views_count INTEGER DEFAULT 0,
            likes_count INTEGER DEFAULT 0,
            order_index INTEGER DEFAULT 0,
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'archived')),
            metadata JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    ELSE
        -- Add new columns if they don't exist
        ALTER TABLE videos ADD COLUMN IF NOT EXISTS category TEXT;
        ALTER TABLE videos ADD COLUMN IF NOT EXISTS upload_method TEXT;
        ALTER TABLE videos ADD COLUMN IF NOT EXISTS video_file_path TEXT;
        ALTER TABLE videos ADD COLUMN IF NOT EXISTS video_size_mb DECIMAL;
        ALTER TABLE videos ADD COLUMN IF NOT EXISTS video_duration_seconds INTEGER;
        ALTER TABLE videos ADD COLUMN IF NOT EXISTS editing_style TEXT;
        ALTER TABLE videos ADD COLUMN IF NOT EXISTS description TEXT;
        ALTER TABLE videos ADD COLUMN IF NOT EXISTS scripture_reference TEXT;
        ALTER TABLE videos ADD COLUMN IF NOT EXISTS upload_date TIMESTAMP WITH TIME ZONE;
        ALTER TABLE videos ADD COLUMN IF NOT EXISTS published_date TIMESTAMP WITH TIME ZONE;
        ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT FALSE;
        ALTER TABLE videos ADD COLUMN IF NOT EXISTS tags TEXT[];
        ALTER TABLE videos ADD COLUMN IF NOT EXISTS uploaded_by TEXT;
        ALTER TABLE videos ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
        ALTER TABLE videos ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
        ALTER TABLE videos ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- ==========================================
-- 3. VIDEO PLATFORMS TABLE (Compatible with TEXT video_id)
-- ==========================================
CREATE TABLE IF NOT EXISTS video_platforms (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    video_id TEXT REFERENCES videos(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('youtube', 'instagram', 'tiktok', 'facebook', 'twitter')),
    platform_url TEXT NOT NULL,
    platform_video_id TEXT,
    published_date TIMESTAMP WITH TIME ZONE,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    last_synced TIMESTAMP WITH TIME ZONE,
    UNIQUE(video_id, platform)
);

-- ==========================================
-- 4. CONVERSATIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE,
    is_archived BOOLEAN DEFAULT FALSE
);

-- ==========================================
-- 5. CONVERSATION PARTICIPANTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS conversation_participants (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE,
    is_muted BOOLEAN DEFAULT FALSE,
    UNIQUE(conversation_id, user_id)
);

-- ==========================================
-- 6. MESSAGES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id TEXT REFERENCES users(id),
    message_type TEXT NOT NULL CHECK (message_type IN ('text', 'voice', 'image', 'file', 'video_reference', 'system')),
    content TEXT,
    voice_note_url TEXT,
    voice_duration_seconds INTEGER,
    file_url TEXT,
    file_name TEXT,
    file_size_mb DECIMAL,
    referenced_video_id TEXT REFERENCES videos(id),
    reply_to_message_id TEXT REFERENCES messages(id),
    reactions JSONB DEFAULT '[]'::jsonb,
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    read_by TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 7. ANALYTICS VISITORS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS analytics_visitors (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    visitor_date DATE NOT NULL,
    visitor_count INTEGER DEFAULT 1,
    unique_visitors INTEGER DEFAULT 1,
    page_views INTEGER DEFAULT 1,
    country TEXT,
    city TEXT,
    device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
    browser TEXT,
    referrer_source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(visitor_date, country, device_type)
);

-- ==========================================
-- 8. ANALYTICS LOGINS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS analytics_logins (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT REFERENCES users(id),
    login_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address TEXT,
    device_info JSONB,
    location TEXT,
    session_duration_minutes INTEGER
);

-- ==========================================
-- 9. CONTENT CALENDAR TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS content_calendar (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    content_type TEXT CHECK (content_type IN ('cover', 'original', 'worship_moment', 'testimony', 'bts', 'live', 'collaboration')),
    scripture_reference TEXT,
    target_publish_date DATE,
    platforms TEXT[],
    status TEXT DEFAULT 'idea' CHECK (status IN ('idea', 'planning', 'recording', 'editing', 'review', 'scheduled', 'published', 'cancelled')),
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to TEXT REFERENCES users(id),
    notes TEXT,
    video_id TEXT REFERENCES videos(id),
    created_by TEXT REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 10. SONG REQUESTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS song_requests (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    song_title TEXT NOT NULL,
    original_artist TEXT,
    requested_by_name TEXT,
    requested_by_email TEXT,
    reason TEXT,
    votes INTEGER DEFAULT 1,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'considering', 'planned', 'recording', 'completed', 'declined')),
    priority_score INTEGER DEFAULT 0,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    genre_tags TEXT[],
    youtube_reference_url TEXT,
    estimated_production_days INTEGER,
    notes TEXT,
    content_calendar_id TEXT REFERENCES content_calendar(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 11. FAN MESSAGES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS fan_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    from_name TEXT NOT NULL,
    from_email TEXT,
    message_type TEXT NOT NULL CHECK (message_type IN ('prayer_request', 'testimony', 'song_request', 'general', 'booking_inquiry')),
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'responded', 'archived', 'flagged')),
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_prayed_for BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    response TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    responded_by TEXT REFERENCES users(id),
    follow_up_date DATE,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 12. NOTIFICATIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('message', 'video_upload', 'milestone', 'deadline', 'system', 'prayer_request', 'comment', 'achievement')),
    title TEXT NOT NULL,
    body TEXT,
    icon_url TEXT,
    action_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 13. MILESTONES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS milestones (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    milestone_type TEXT NOT NULL CHECK (milestone_type IN ('subscribers', 'views', 'videos', 'engagement', 'financial', 'ministry', 'custom')),
    title TEXT NOT NULL,
    description TEXT,
    target_value INTEGER NOT NULL,
    current_value INTEGER DEFAULT 0,
    is_achieved BOOLEAN DEFAULT FALSE,
    achieved_at TIMESTAMP WITH TIME ZONE,
    icon TEXT,
    celebration_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 14. COLLABORATION CONTACTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS collaboration_contacts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    contact_type TEXT CHECK (contact_type IN ('church', 'artist', 'producer', 'ministry', 'venue', 'media', 'sponsor')),
    name TEXT NOT NULL,
    organization TEXT,
    email TEXT,
    phone TEXT,
    social_handles JSONB,
    address TEXT,
    relationship_status TEXT CHECK (relationship_status IN ('potential', 'contacted', 'in_discussion', 'active', 'paused', 'completed')),
    notes TEXT,
    last_contacted DATE,
    next_follow_up DATE,
    collaboration_history TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 15. REVENUE EXPENSES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS revenue_expenses (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    transaction_date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('revenue', 'expense')),
    category TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'NGN',
    description TEXT,
    payment_method TEXT,
    receipt_url TEXT,
    related_video_id TEXT REFERENCES videos(id),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_frequency TEXT CHECK (recurring_frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
    tags TEXT[],
    created_by TEXT REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 16. MINISTRY IMPACT TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS ministry_impact (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    impact_type TEXT CHECK (impact_type IN ('testimony', 'salvation', 'healing', 'deliverance', 'baptism', 'life_change', 'other')),
    story_title TEXT NOT NULL,
    story_text TEXT NOT NULL,
    person_name TEXT,
    location TEXT,
    related_video_id TEXT REFERENCES videos(id),
    related_song TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    media_urls TEXT[],
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 17. BOOKINGS EVENTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS bookings_events (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    event_type TEXT CHECK (event_type IN ('church_service', 'concert', 'wedding', 'conference', 'workshop', 'recording_session', 'other')),
    event_name TEXT NOT NULL,
    venue_name TEXT,
    venue_address TEXT,
    contact_person TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    event_date DATE NOT NULL,
    event_time TIME,
    duration_hours DECIMAL,
    status TEXT DEFAULT 'inquiry' CHECK (status IN ('inquiry', 'confirmed', 'contract_sent', 'paid_deposit', 'completed', 'cancelled')),
    fee_amount DECIMAL(10,2),
    deposit_paid DECIMAL(10,2),
    balance_due DECIMAL(10,2),
    setlist_id TEXT,
    technical_requirements TEXT,
    notes TEXT,
    contract_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 18. GOALS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    category TEXT CHECK (category IN ('content', 'growth', 'ministry', 'financial', 'engagement', 'learning', 'personal')),
    target_value DECIMAL,
    current_value DECIMAL DEFAULT 0,
    unit TEXT,
    start_date DATE DEFAULT CURRENT_DATE,
    target_date DATE,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'paused')),
    notes TEXT,
    milestones JSONB DEFAULT '[]'::jsonb,
    created_by TEXT REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 19. SITE SETTINGS TABLE (Enhanced)
-- ==========================================
CREATE TABLE IF NOT EXISTS site_settings (
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
    brand_colors JSONB DEFAULT '{"primary": "#9333ea", "secondary": "#ec4899"}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 20. EMAIL CAMPAIGNS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS email_campaigns (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'cancelled')),
    target_audience TEXT DEFAULT 'all',
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    recipients_count INTEGER DEFAULT 0,
    open_rate DECIMAL(5,2),
    click_rate DECIMAL(5,2),
    created_by TEXT REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 21. MERCHANDISE TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS merchandise (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER DEFAULT 0,
    sold INTEGER DEFAULT 0,
    category TEXT CHECK (category IN ('apparel', 'accessories', 'music', 'posters', 'other')),
    image_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 22. TOUR DATES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS tour_dates (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    venue TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT,
    country TEXT DEFAULT 'USA',
    date DATE NOT NULL,
    time TIME,
    ticket_price DECIMAL(10,2),
    capacity INTEGER,
    tickets_sold INTEGER DEFAULT 0,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'sold_out', 'cancelled', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- Videos indexes
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
CREATE INDEX IF NOT EXISTS idx_videos_published_date ON videos(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_videos_order ON videos(order_index);
CREATE INDEX IF NOT EXISTS idx_videos_uploaded_by ON videos(uploaded_by);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_visitors(visitor_date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_logins_user ON analytics_logins(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_logins_timestamp ON analytics_logins(login_timestamp DESC);

-- Content calendar indexes
CREATE INDEX IF NOT EXISTS idx_content_calendar_date ON content_calendar(target_publish_date);
CREATE INDEX IF NOT EXISTS idx_content_calendar_status ON content_calendar(status);
CREATE INDEX IF NOT EXISTS idx_content_calendar_assigned ON content_calendar(assigned_to);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- Fan messages indexes
CREATE INDEX IF NOT EXISTS idx_fan_messages_status ON fan_messages(status);
CREATE INDEX IF NOT EXISTS idx_fan_messages_type ON fan_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_fan_messages_created ON fan_messages(created_at DESC);

-- Financial indexes
CREATE INDEX IF NOT EXISTS idx_revenue_expenses_date ON revenue_expenses(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_expenses_type ON revenue_expenses(type);
CREATE INDEX IF NOT EXISTS idx_revenue_expenses_category ON revenue_expenses(category);

-- Goals indexes
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_category ON goals(category);
CREATE INDEX IF NOT EXISTS idx_goals_target_date ON goals(target_date);

-- Email campaigns indexes
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled ON email_campaigns(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created ON email_campaigns(created_at DESC);

-- Merchandise indexes
CREATE INDEX IF NOT EXISTS idx_merchandise_category ON merchandise(category);
CREATE INDEX IF NOT EXISTS idx_merchandise_status ON merchandise(status);
CREATE INDEX IF NOT EXISTS idx_merchandise_stock ON merchandise(stock);

-- Tour dates indexes
CREATE INDEX IF NOT EXISTS idx_tour_dates_date ON tour_dates(date);
CREATE INDEX IF NOT EXISTS idx_tour_dates_status ON tour_dates(status);
CREATE INDEX IF NOT EXISTS idx_tour_dates_city ON tour_dates(city);

-- ==========================================
-- AUTO-UPDATE TRIGGERS
-- ==========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at
DROP TRIGGER IF EXISTS update_videos_updated_at ON videos;
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_calendar_updated_at ON content_calendar;
CREATE TRIGGER update_content_calendar_updated_at BEFORE UPDATE ON content_calendar
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_song_requests_updated_at ON song_requests;
CREATE TRIGGER update_song_requests_updated_at BEFORE UPDATE ON song_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_collaboration_contacts_updated_at ON collaboration_contacts;
CREATE TRIGGER update_collaboration_contacts_updated_at BEFORE UPDATE ON collaboration_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_events_updated_at ON bookings_events;
CREATE TRIGGER update_bookings_events_updated_at BEFORE UPDATE ON bookings_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_goals_updated_at ON goals;
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_campaigns_updated_at ON email_campaigns;
CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON email_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_merchandise_updated_at ON merchandise;
CREATE TRIGGER update_merchandise_updated_at BEFORE UPDATE ON merchandise
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tour_dates_updated_at ON tour_dates;
CREATE TRIGGER update_tour_dates_updated_at BEFORE UPDATE ON tour_dates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_logins ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE song_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministry_impact ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchandise ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_dates ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations (you can restrict later with Supabase Auth)
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'users', 'videos', 'video_platforms', 'conversations', 
            'conversation_participants', 'messages', 'analytics_visitors',
            'analytics_logins', 'content_calendar', 'song_requests',
            'fan_messages', 'notifications', 'milestones',
            'collaboration_contacts', 'revenue_expenses', 'ministry_impact',
            'bookings_events', 'goals', 'site_settings', 'email_campaigns',
            'merchandise', 'tour_dates'
        )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Allow all operations" ON %I', tbl);
        EXECUTE format('CREATE POLICY "Allow all operations" ON %I FOR ALL USING (true) WITH CHECK (true)', tbl);
    END LOOP;
END $$;

-- ==========================================
-- REALTIME SUBSCRIPTIONS
-- ==========================================

-- Enable realtime for key tables
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'videos', 'messages', 'notifications', 'analytics_visitors',
            'content_calendar', 'fan_messages', 'goals'
        )
    LOOP
        BEGIN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', tbl);
        EXCEPTION
            WHEN duplicate_object THEN
                NULL; -- Already added, skip
        END;
    END LOOP;
END $$;

-- ==========================================
-- INITIAL DATA
-- ==========================================

-- Insert default site settings
INSERT INTO site_settings (id, hero_description, about_text, contact_email, contact_phone)
VALUES (
    'main',
    'Lifting voices in worship through powerful gospel music. Experience the presence of God through every note.',
    'I am an emerging gospel artist with a deep passion for worship and praise. Through powerful cover songs, I aim to create an atmosphere where people can encounter God''s presence.',
    'contact@estherreign.com',
    '+234 818 019 4269'
)
ON CONFLICT (id) DO NOTHING;

-- Insert default admin user (password should be hashed in production)
INSERT INTO users (email, role, full_name, phone)
VALUES 
    ('artist@estherreign.com', 'artist', 'Esther Reign', '+234 818 019 4269'),
    ('manager@estherreign.com', 'manager', 'Manager', '+234 805 596 4955')
ON CONFLICT (email) DO NOTHING;

-- ==========================================
-- VERIFICATION QUERY
-- ==========================================
SELECT 
    schemaname,
    tablename,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = tablename) as column_count
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
