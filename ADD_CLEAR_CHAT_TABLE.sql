-- Add Clear Chat Requests Table
-- Run this in Supabase SQL Editor

-- Create the table
CREATE TABLE IF NOT EXISTS public.chat_clear_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requested_by TEXT NOT NULL,
    requested_by_name TEXT NOT NULL,
    requested_by_role TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.chat_clear_requests ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
DROP POLICY IF EXISTS "Allow all operations on chat_clear_requests" ON public.chat_clear_requests;
CREATE POLICY "Allow all operations on chat_clear_requests" ON public.chat_clear_requests
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_chat_clear_requests_status ON public.chat_clear_requests(status);

-- Enable realtime
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_clear_requests;
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Table already in publication, skip
END $$;

-- Add auto-update trigger (if function exists)
DROP TRIGGER IF EXISTS update_chat_clear_requests_updated_at ON public.chat_clear_requests;
CREATE TRIGGER update_chat_clear_requests_updated_at 
    BEFORE UPDATE ON public.chat_clear_requests
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Verify table was created
SELECT 
    'chat_clear_requests' as table_name,
    COUNT(*) as row_count
FROM public.chat_clear_requests;

-- Success message
SELECT '✅ Clear chat requests table created successfully!' as status;
