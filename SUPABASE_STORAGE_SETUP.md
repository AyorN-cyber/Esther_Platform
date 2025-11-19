# 🔧 Supabase Storage Setup Guide

## Issue: Profile Picture Upload Failing

The upload is failing because the Supabase Storage bucket needs to be configured. Follow these steps:

## Step 1: Create the Storage Bucket

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Login and select your project: `ciawsbarwhhebghhyjub`

2. **Navigate to Storage:**
   - Click "Storage" in the left sidebar
   - Click "New bucket"

3. **Create Bucket:**
   - **Name:** `media`
   - **Public bucket:** ✅ **Enable this** (check the box)
   - **File size limit:** 5 MB (or higher if needed)
   - **Allowed MIME types:** `image/*` (or leave empty for all types)
   - Click "Create bucket"

## Step 2: Configure Bucket Policies (RLS)

After creating the bucket, you need to set up Row Level Security policies:

1. **Go to Storage Policies:**
   - Click on the `media` bucket
   - Click "Policies" tab
   - Click "New Policy"

2. **Create Upload Policy:**
   - **Policy name:** `Allow authenticated uploads`
   - **Allowed operation:** `INSERT`
   - **Policy definition:**
   ```sql
   (bucket_id = 'media'::text) AND (auth.role() = 'authenticated'::text)
   ```
   - Click "Review" then "Save policy"

3. **Create Read Policy (if bucket is not public):**
   - **Policy name:** `Allow public reads`
   - **Allowed operation:** `SELECT`
   - **Policy definition:**
   ```sql
   (bucket_id = 'media'::text)
   ```
   - Click "Review" then "Save policy"

## Step 3: Alternative - Make Bucket Fully Public (Easier)

If you want to allow uploads without authentication:

1. **Go to Storage:**
   - Click on `media` bucket
   - Click "Settings"
   - Enable "Public bucket" ✅

2. **Create Public Upload Policy:**
   - **Policy name:** `Allow public uploads`
   - **Allowed operation:** `INSERT`
   - **Policy definition:**
   ```sql
   (bucket_id = 'media'::text)
   ```
   - Click "Save policy"

## Step 4: Verify Setup

After setup, try uploading again. The error message will now be more specific if something is still wrong.

## Common Issues & Solutions

### Issue: "Bucket not found"
**Solution:** Make sure the bucket is named exactly `media` (lowercase)

### Issue: "Permission denied" or "RLS policy violation"
**Solution:** 
- Check that RLS policies are created (Step 2)
- Make sure the policy allows the operation you're trying to do
- If using authenticated uploads, ensure user is logged in

### Issue: "File too large"
**Solution:** 
- Increase the file size limit in bucket settings
- Or compress the image before uploading

### Issue: "Invalid file type"
**Solution:** 
- Check bucket MIME type restrictions
- Ensure you're uploading an image file (JPG, PNG, etc.)

## Testing

After setup, the upload should work. If you still get errors, check the browser console for detailed error messages.


