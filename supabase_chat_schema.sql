-- Simple Chat Messages Table
-- Run this in your Supabase SQL Editor

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  voice_data TEXT,
  voice_duration INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since this is a simple app)
CREATE POLICY "Allow all operations on chat_messages" 
ON chat_messages 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp 
ON chat_messages(timestamp DESC);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
