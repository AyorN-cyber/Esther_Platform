-- Supabase Schema for Esther Reign Platform
-- Run this in your Supabase SQL Editor

-- Create sync_data table
CREATE TABLE IF NOT EXISTS public.sync_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id TEXT UNIQUE NOT NULL,
    site_settings TEXT,
    videos TEXT,
    hero_description TEXT,
    chat_messages TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.sync_data ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since we're not using auth)
CREATE POLICY "Allow all operations" ON public.sync_data
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_sync_data_updated_at ON public.sync_data(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_data_device_id ON public.sync_data(device_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.sync_data;

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_sync_data_updated_at BEFORE UPDATE ON public.sync_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
