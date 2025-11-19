# 🚀 Quick Fix: Create Supabase Storage Bucket

## The Problem
Error: **"Storage bucket 'media' does not exist"**

## The Solution (5 Minutes)

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Login to your account
3. Click on your project: **`ciawsbarwhhebghhyjub`**

### Step 2: Navigate to Storage
1. In the left sidebar, click **"Storage"** (it has a folder icon)
2. You should see a page with "Buckets" section

### Step 3: Create the Bucket
1. Click the **"New bucket"** button (usually top right)
2. Fill in the form:
   - **Name:** `media` (must be exactly this, lowercase)
   - **Public bucket:** ✅ **Check this box** (IMPORTANT!)
   - **File size limit:** `5242880` (5 MB) or leave default
   - **Allowed MIME types:** Leave empty (allows all image types)
3. Click **"Create bucket"**

### Step 4: Verify It Works
1. You should now see "media" in your buckets list
2. Go back to your app and try uploading the profile picture again
3. It should work now! ✅

---

## If Upload Still Fails After Creating Bucket

### Check RLS Policies:
1. Click on the **"media"** bucket you just created
2. Click the **"Policies"** tab
3. If you see "No policies", click **"New Policy"**
4. Create this policy:
   - **Policy name:** `Allow public uploads`
   - **Allowed operation:** Select **"INSERT"**
   - **Policy definition:** 
     ```sql
     (bucket_id = 'media'::text)
     ```
   - Click **"Review"** then **"Save policy"**

---

## Quick Checklist
- [ ] Bucket name is exactly `media` (lowercase)
- [ ] "Public bucket" is checked ✅
- [ ] Bucket appears in the Storage buckets list
- [ ] Try uploading again

---

## Need Help?
If you still get errors after creating the bucket:
1. Check browser console (F12) for detailed error messages
2. Make sure you're logged into the admin panel
3. Verify the bucket name is exactly `media` (not `Media` or `MEDIA`)


