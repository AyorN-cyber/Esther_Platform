import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://ciawsbarwhhebghhyjub.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpYXdzYmFyd2hoZWJnaGh5anViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NTI1MTYsImV4cCI6MjA3NzUyODUxNn0.XQIlffM2nzb_qQpe9BD7P55NccPEHr9XwOE4od6U3B8'

// Mock Supabase client for development
const createMockClient = () => {
  const mockData = {
    videos: [],
    site_settings: {
      id: 1,
      site_title: 'Esther Reign Platform',
      site_description: 'Welcome to Esther Reign\'s creative workspace',
      hero_image: '/Estherreign.jpg',
      about_text: 'Singer, Songwriter & Creative Artist',
      social_links: {
        instagram: 'https://instagram.com/estherreign',
        youtube: 'https://youtube.com/@estherreign',
        tiktok: 'https://tiktok.com/@estherreign',
        twitter: 'https://twitter.com/estherreign',
        facebook: 'https://facebook.com/estherreign'
      }
    },
    comments: [],
    public_comments: []
  };

  return {
    from: (table: string) => ({
      select: () => {
        const data = mockData[table as keyof typeof mockData];
        return {
          order: () => Promise.resolve({ data: data || [], error: null }),
          limit: () => ({
            maybeSingle: () => Promise.resolve({ data, error: null })
          }),
          then: (resolve: (value: any) => void) => resolve({ data: data || [], error: null })
        };
      },
      insert: (data: unknown) => Promise.resolve({ data, error: null }),
      upsert: (data: unknown) => Promise.resolve({ data, error: null }),
      update: (data: unknown) => ({
        eq: () => Promise.resolve({ data, error: null })
      }),
      delete: () => ({
        eq: () => Promise.resolve({ data: null, error: null })
      })
    }),
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: { path: 'mock-path' }, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '/mock-image.jpg' } })
      })
    }
  };
};

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false // We're not using auth, just storage
  }
})

export const extractGoogleDriveThumbnail = (url: string): string => {
  // Extract file ID from Google Drive URL
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w400`
  }
  return url
}
