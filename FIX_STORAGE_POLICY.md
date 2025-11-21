# 🔧 Fix Storage Upload Policy

## The Issue
Your bucket exists ✅, but uploads are failing. This means the **RLS policy** needs to allow **INSERT** operations.

## Current Status
- ✅ Bucket "media" exists
- ✅ Bucket is Public
- ⚠️ Policy exists (shows "1") but might not allow uploads

## Solution: Check and Fix the Policy

### Step 1: View Current Policy
1. In Supabase Storage, click on the **"media"** bucket (click the row or arrow)
2. Click the **"Policies"** tab
3. You should see existing policies listed

### Step 2: Check if INSERT Policy Exists
Look for a policy that:
- Has **"INSERT"** as the allowed operation
- Allows uploads to the `media` bucket

### Step 3: Create INSERT Policy (If Missing)
If you don't see an INSERT policy, create one:

1. Click **"New Policy"**
2. Choose **"For full customization"** (or use template)
3. Fill in:
   - **Policy name:** `Allow public uploads` or `Allow authenticated uploads`
   - **Allowed operation:** Select **"INSERT"**
   - **Policy definition:** Use one of these:

   **Option A: Public Uploads (Easier)**
   ```sql
   (bucket_id = 'media'::text)
   ```

   **Option B: Authenticated Uploads Only (More Secure)**
   ```sql
   (bucket_id = 'media'::text) AND (auth.role() = 'authenticated'::text)
   ```

4. Click **"Review"** then **"Save policy"**

### Step 4: Verify Policy
After creating, you should see:
- The policy in the list
- "INSERT" in the operations column
- Try uploading again!

---

## Alternative: Quick Test with Public Policy

If you want to test quickly, create a simple public policy:

**Policy Name:** `Public uploads`
**Operation:** `INSERT`
**Policy:**
```sql
true
```

This allows anyone to upload (for testing). You can restrict it later.

---

## Still Not Working?

If uploads still fail after adding the INSERT policy:

1. **Check browser console (F12)** for detailed error
2. **Verify you're logged in** to the admin panel
3. **Check the policy** - make sure it's active/enabled
4. **Try the public policy** (`true`) to test if it's a policy issue

---

## Common Policy Mistakes

❌ **Wrong:** Policy only has SELECT (read) but not INSERT (write)
✅ **Correct:** Policy has INSERT operation

❌ **Wrong:** Policy checks for authentication but user isn't logged in
✅ **Correct:** Use public policy OR ensure user is authenticated

❌ **Wrong:** Policy has wrong bucket name
✅ **Correct:** Policy checks `bucket_id = 'media'::text`



