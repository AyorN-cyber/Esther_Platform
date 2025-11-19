import { createClient } from '@supabase/supabase-js'

// Supabase configuration
// NOTE: these point to your live Supabase project.
// If you later want to hide them, move to Vite env vars (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).
const supabaseUrl = 'https://ciawsbarwhhebghhyjub.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpYXdzYmFyd2hoZWJnaGh5anViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NTI1MTYsImV4cCI6MjA3NzUyODUxNn0.XQIlffM2nzb_qQpe9BD7P55NccPEHr9XwOE4od6U3B8'

// Create Supabase client (single source of truth for auth, database & storage)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // keep Supabase auth session in local storage
  },
})

export const extractGoogleDriveThumbnail = (url: string): string => {
  // Extract file ID from Google Drive URL
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w400`
  }
  return url
}

// Helper for uploading images to Supabase Storage.
// Requires a bucket named \"media\" in Supabase.
export const uploadImageToSupabase = async (
  file: File,
  folder: 'hero' | 'about' | 'profile'
): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop() || 'jpg'
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

    // Check if bucket exists first
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('Error listing buckets:', listError)
      throw new Error(`Storage access error: ${listError.message}`)
    }

    const mediaBucket = buckets?.find(b => b.name === 'media')
    if (!mediaBucket) {
      console.error('Media bucket not found. Available buckets:', buckets?.map(b => b.name))
      throw new Error('Storage bucket "media" does not exist. Please create it in Supabase Storage settings.')
    }

    // Upload the file
    const { data, error } = await supabase.storage
      .from('media')
      .upload(path, file, { 
        upsert: true,
        cacheControl: '3600',
        contentType: file.type || 'image/jpeg'
      })

    if (error) {
      console.error('Upload error details:', error)
      // Provide more specific error messages
      if (error.message?.includes('new row violates row-level security')) {
        throw new Error('Permission denied: Storage bucket RLS policy is blocking uploads. Please check bucket policies in Supabase.')
      } else if (error.message?.includes('Bucket not found')) {
        throw new Error('Storage bucket "media" not found. Please create it in Supabase Storage settings.')
      } else if (error.message?.includes('JWT')) {
        throw new Error('Authentication required: Please ensure you are logged in.')
      } else {
        throw new Error(`Upload failed: ${error.message || 'Unknown error'}`)
      }
    }

    if (!data) {
      throw new Error('Upload failed: No data returned from storage')
    }

    // Get public URL
    const { data: publicData } = supabase.storage.from('media').getPublicUrl(data.path)
    
    if (!publicData?.publicUrl) {
      throw new Error('Failed to get public URL for uploaded file')
    }

    return publicData.publicUrl
  } catch (error: any) {
    console.error('Error uploading image to Supabase Storage:', error)
    // Return the error message so it can be displayed to the user
    throw error
  }
}
