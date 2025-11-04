# 🔧 Database Update Required

## ⚠️ IMPORTANT: Run This SQL Now!

Your Supabase database needs to be updated to support the new features.

---

## 📋 SQL to Run in Supabase

Go to your Supabase Dashboard → SQL Editor and run this:

```sql
-- Add new fields to site_settings table
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS total_visits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS artist_logins INTEGER DEFAULT 0;

-- Update existing record to have default values
UPDATE site_settings 
SET 
  total_visits = COALESCE(total_visits, 0),
  artist_logins = COALESCE(artist_logins, 0)
WHERE id = 'main';

-- Ensure main settings record exists
INSERT INTO site_settings (
  id, 
  hero_description, 
  about_text,
  total_visits,
  artist_logins
)
VALUES (
  'main',
  'Lifting voices in worship through powerful gospel music. Experience the presence of God through every note.',
  'I am an emerging gospel artist with a deep passion for worship and praise. Through powerful cover songs, I aim to create an atmosphere where people can encounter God''s presence.',
  0,
  0
)
ON CONFLICT (id) DO UPDATE SET
  hero_description = COALESCE(site_settings.hero_description, EXCLUDED.hero_description),
  about_text = COALESCE(site_settings.about_text, EXCLUDED.about_text);

-- Verify the update
SELECT * FROM site_settings WHERE id = 'main';
```

---

## ✅ What This Does

### Adds New Fields:
1. **`total_visits`** - Tracks total page visits
2. **`artist_logins`** - Tracks artist login count

### Creates Default Record:
- Ensures `site_settings` table has a 'main' record
- Sets default hero description
- Sets default about text
- Initializes counters to 0

---

## 🔍 Verify It Worked

After running the SQL, you should see output like:

```
id    | hero_description                    | about_text                          | total_visits | artist_logins
------|-------------------------------------|-------------------------------------|--------------|---------------
main  | Lifting voices in worship...        | I am an emerging gospel artist...   | 0            | 0
```

---

## 📱 What's Now in Supabase

### All Data is Now Stored in PostgreSQL:

#### Site Settings Table:
- ✅ Hero image
- ✅ Hero description
- ✅ About image
- ✅ About text
- ✅ Contact email
- ✅ Contact phone
- ✅ Social links (Instagram, YouTube, TikTok, Facebook)
- ✅ Total visits counter
- ✅ Artist logins counter

#### Videos Table:
- ✅ All video data
- ✅ Title, link, thumbnail
- ✅ Status (pending/completed)
- ✅ Order index
- ✅ Timestamps

#### Chat Messages Table:
- ✅ All messages
- ✅ Sender info
- ✅ Timestamps
- ✅ Video references
- ✅ Voice messages

---

## 🚀 After Running SQL

### 1. Test Settings:
1. Go to Admin Panel → Settings
2. Update hero description
3. Upload hero image
4. Upload about image
5. Update about text
6. Click "Save"
7. Refresh page → Changes should persist!

### 2. Test Videos:
1. Go to Admin Panel → Videos
2. Add a new video
3. Update video status
4. Refresh page → Video should still be there!

### 3. Test Chat:
1. Open chat widget
2. Click video attach button (📹)
3. Select a video
4. Send message
5. Video reference should appear!

---

## 🔄 Data Migration (If Needed)

If you had data in localStorage before, it's NOT automatically migrated.

### Option 1: Manual Re-entry (Recommended)
1. Go to Admin Panel → Settings
2. Re-upload your hero image
3. Re-upload your about image
4. Re-enter your about text
5. Click "Save"

### Option 2: One-Time Migration Script

If you have a lot of data, run this in browser console:

```javascript
(async function migrateToSupabase() {
  console.log('🔄 Starting migration...');
  
  // Get old localStorage data
  const oldSettings = localStorage.getItem('site_settings');
  const oldHeroDesc = localStorage.getItem('hero_description');
  const oldVideos = localStorage.getItem('videos');
  
  if (oldSettings || oldHeroDesc) {
    console.log('📦 Found settings to migrate');
    
    const settings = oldSettings ? JSON.parse(oldSettings) : {};
    const heroDesc = oldHeroDesc || '';
    
    // Import supabase functions
    const { updateSettings } = await import('./lib/supabaseData.js');
    
    // Migrate settings
    await updateSettings({
      hero_image: settings.hero_image,
      hero_description: heroDesc,
      about_image: settings.about_image,
      about_text: settings.about_text,
      contact_email: settings.email,
      contact_phone: settings.phone,
      social_links: settings.social_links
    });
    
    console.log('✅ Settings migrated!');
  }
  
  if (oldVideos) {
    console.log('📦 Found videos to migrate');
    
    const videos = JSON.parse(oldVideos);
    const { addVideo } = await import('./lib/supabaseData.js');
    
    for (const video of videos) {
      await addVideo(video);
    }
    
    console.log(`✅ ${videos.length} videos migrated!`);
  }
  
  console.log('🎉 Migration complete!');
  console.log('You can now clear localStorage if you want.');
})();
```

---

## 🐛 Troubleshooting

### Settings Not Saving?
1. Check Supabase connection
2. Verify SQL was run successfully
3. Check browser console for errors
4. Ensure RLS policies allow updates

### Videos Not Loading?
1. Verify videos table exists
2. Check if videos were added
3. Run: `SELECT * FROM videos;` in Supabase
4. Check browser console

### Images Not Showing?
1. Images are stored as base64 or URLs
2. Check if hero_image and about_image fields have data
3. Run: `SELECT hero_image, about_image FROM site_settings WHERE id = 'main';`
4. If empty, re-upload images in Settings

### Chat Video Attach Not Working?
1. Verify videos exist in database
2. Check browser console for errors
3. Ensure video selector dropdown appears
4. Try adding a video first in Admin Panel

---

## 📊 Database Schema

### Complete Schema:

```sql
-- Videos Table
CREATE TABLE videos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  video_link TEXT,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'pending',
  template_type TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site Settings Table
CREATE TABLE site_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  hero_image TEXT,
  hero_description TEXT,
  about_image TEXT,
  about_text TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  social_links JSONB,
  total_visits INTEGER DEFAULT 0,
  artist_logins INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages Table
CREATE TABLE chat_messages (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  video_id TEXT,
  video_reference TEXT,
  voice_data TEXT,
  voice_duration INTEGER,
  edited BOOLEAN DEFAULT FALSE,
  is_approval_request BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## ✅ Verification Checklist

After running SQL and testing:

- [ ] SQL executed without errors
- [ ] site_settings table has 'main' record
- [ ] total_visits and artist_logins fields exist
- [ ] Settings save and persist
- [ ] Hero image uploads and shows
- [ ] About image uploads and shows
- [ ] About text saves and shows
- [ ] Videos load in admin panel
- [ ] Video attach button works in chat
- [ ] Video selector shows videos
- [ ] Can send messages with video references
- [ ] Changes sync across devices
- [ ] No localStorage usage (check console)

---

## 🎉 Success!

Once all checks pass, your app is fully migrated to Supabase!

**Benefits:**
- ✅ No more localStorage
- ✅ Data never lost
- ✅ Real-time sync across devices
- ✅ Professional database
- ✅ Scalable architecture
- ✅ Automatic backups

---

## 📞 Need Help?

If you encounter issues:
1. Check browser console for errors
2. Verify SQL ran successfully
3. Check Supabase dashboard for data
4. Ensure RLS policies are set correctly
5. Try clearing browser cache

Your app is now production-ready with a professional database backend! 🚀
