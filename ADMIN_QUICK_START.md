# 🚀 Admin Features - Quick Start Guide

## ⚡ 3-Minute Setup

### Step 1: Set Up Database (2 minutes)

1. **Open Supabase**
   - Go to https://supabase.com
   - Open your project

2. **Run SQL Schema**
   - Click **SQL Editor** in left sidebar
   - Click **New Query**
   - Open `supabase_admin_schema.sql` from your project
   - Copy all contents
   - Paste into SQL Editor
   - Click **Run** (or press Ctrl+Enter)

3. **Verify Tables**
   - Click **Table Editor** in left sidebar
   - You should see:
     - ✅ `videos` table
     - ✅ `site_settings` table

### Step 2: Access Admin Panel (1 minute)

1. **Open Your Site**
   - Go to your deployed site URL
   - Or run locally: `npm run dev`

2. **Access Admin**
   - Add `#admin` to URL
   - Example: `https://yoursite.com/#admin`

3. **Login**
   - **Artist Account:**
     - Email: `artist@estherreign.com`
     - Password: `artist2024`
   
   - **Editor Account:**
     - Email: `editor@estherreign.com`
     - Password: `editor2024`

### Step 3: Start Managing (30 seconds)

**Manage Videos:**
1. Click **"Manage Videos"** tab
2. Click **"+ Add Video"**
3. Fill in title, link, thumbnail
4. Click **"Add Video"**

**Edit Content:**
1. Click **"Content Editor"** tab
2. Drag images into upload areas
3. Edit text fields
4. Click **"Save Changes"**

---

## 🎯 Quick Actions

### Add a Video:
```
1. Manage Videos tab
2. + Add Video button
3. Enter title (required)
4. Add video link (optional)
5. Add thumbnail URL (optional)
6. Select status
7. Save
```

### Upload Hero Image:
```
1. Content Editor tab
2. Hero Section
3. Drag image or click to upload
4. Wait for preview
5. Save Changes
```

### Reorder Videos:
```
1. Manage Videos tab
2. Grab video by grip icon (⋮⋮)
3. Drag to new position
4. Release
5. Order saves automatically
```

### Update About Text:
```
1. Content Editor tab
2. About Section
3. Edit text in textarea
4. Save Changes
```

---

## 📱 Mobile Access

**Same steps work on mobile!**

1. Open site on phone
2. Add `#admin` to URL
3. Login
4. Use bottom navigation:
   - 🏠 Home
   - 🎬 Videos
   - 📝 Content
   - ⚙️ Settings

---

## ✅ Verification

### Check if it's working:

**Videos:**
- [ ] Can add new video
- [ ] Can edit video
- [ ] Can delete video
- [ ] Can drag to reorder
- [ ] Changes appear in Supabase

**Content:**
- [ ] Can upload images
- [ ] Can edit text
- [ ] Can update contact info
- [ ] Can save changes
- [ ] Changes appear in Supabase

**Supabase:**
- [ ] Open Table Editor
- [ ] Check `videos` table has data
- [ ] Check `site_settings` table has data
- [ ] Refresh page, data persists

---

## 🆘 Quick Fixes

### "Cannot find table"
→ Run the SQL schema in Supabase

### "Failed to save"
→ Check Supabase credentials in `.env`

### "Images not uploading"
→ Check file size (<5MB) and type (JPG/PNG/GIF)

### "Changes not saving"
→ Click "Save Changes" button, check console for errors

---

## 🎊 You're Ready!

Your admin panel is now fully functional with:
- ✅ Video management
- ✅ Content editing
- ✅ Image uploads
- ✅ Real-time sync

Start adding your content! 🚀

---

## 📚 Full Documentation

For detailed information, see:
- `ADMIN_FEATURES_COMPLETE.md` - Complete feature guide
- `supabase_admin_schema.sql` - Database schema
- `ADMIN_ACCESS_GUIDE.md` - Access instructions
