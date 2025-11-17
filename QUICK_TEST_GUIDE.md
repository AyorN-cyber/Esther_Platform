# 🧪 Quick Test Guide

## Before Testing - Deploy First!

```bash
# 1. Commit changes
git add .
git commit -m "Fix: Chat sending, PWA badge, and clear chat feature"

# 2. Push to deploy
git push origin main

# 3. Wait 2-3 minutes for GitHub Actions deployment

# 4. Run SQL in Supabase
# Open Supabase SQL Editor and run: ADD_CLEAR_CHAT_TABLE.sql
```

---

## Test 1: Chat Widget Sending ✅

### Steps:
1. Open admin panel as Artist
2. Click chat widget (bottom right)
3. Type a message: "Test message 1"
4. Click send button
5. Open browser console (F12)

### Expected Results:
- ✅ Message appears in chat
- ✅ Console shows: "📤 Sending message:"
- ✅ Console shows: "✅ Message sent successfully:"
- ✅ No errors in console

### If It Fails:
- Check if `chat_messages` table exists in Supabase
- Verify Supabase connection
- Check console for error details

---

## Test 2: Notifications ✅

### Steps:
1. Login as Artist
2. Open chat widget
3. In another browser/incognito, login as Editor
4. Editor sends a message
5. Check Artist's notification bell (top right)

### Expected Results:
- ✅ Sound plays when message received
- ✅ Red badge appears on bell icon
- ✅ Click bell to see notification
- ✅ Notification shows in dropdown

### If It Fails:
- Check browser notification permissions
- Verify real-time is enabled in Supabase
- Check console for subscription errors

---

## Test 3: PWA Badge 🔔

### Steps:
1. Install PWA (if not already)
2. Trigger a notification (send message, etc.)
3. Check app icon on desktop/home screen
4. Open browser console (F12)

### Expected Results:
- ✅ Console shows: "🔔 Updating badge to: X"
- ✅ Console shows: "✅ Badge set via navigator.setAppBadge"
- ✅ Console shows: "✅ Badge update message sent to service worker"
- ✅ Console shows: "✅ Favicon badge updated"
- ✅ Favicon shows red badge with number

### Browser Support:
- **Chrome/Edge:** Full badge support on icon
- **Firefox/Safari:** Favicon badge only
- **Mobile:** Depends on OS (Android better than iOS)

### If Badge Doesn't Show:
- Check console logs for errors
- Verify service worker is active
- Try reinstalling PWA
- Favicon badge should always work

---

## Test 4: Clear Chat Feature 🗑️

### Setup:
- Need 2 browsers/devices
- Browser 1: Artist
- Browser 2: Editor (or incognito)

### Steps:

#### Part A - Request Clear:
1. **Artist:** Login and open chat widget
2. **Artist:** Click "Clear Chat" button (top right)
3. **Artist:** Confirm the dialog
4. **Artist:** See "Waiting for approval" message

#### Part B - Approve Clear:
5. **Editor:** Login and open chat widget
6. **Editor:** See yellow approval banner
7. **Editor:** Click "Approve" button
8. **Editor:** Confirm the dialog

#### Part C - Verify:
9. **Both:** All messages should disappear
10. **Both:** Chat should be empty
11. **Both:** No errors in console

### Expected Results:
- ✅ Clear request sent successfully
- ✅ Other user sees approval banner
- ✅ On approval, all messages deleted
- ✅ Real-time update (both see empty chat)
- ✅ Sound plays on approval

### Test Rejection:
1. **Artist:** Request clear
2. **Editor:** Click "Reject" instead
3. **Both:** Messages remain
4. **Both:** Request dismissed

---

## Console Debugging 🔍

### Open Console:
- **Windows/Linux:** F12 or Ctrl+Shift+I
- **Mac:** Cmd+Option+I

### What to Look For:

#### Good Signs ✅:
```
📤 Sending message: {...}
✅ Message sent successfully: {...}
🔔 Updating badge to: 1
✅ Badge set via navigator.setAppBadge
✅ Badge update message sent to service worker
✅ Favicon badge updated
[SW] Message received: {type: 'UPDATE_BADGE', count: 1}
```

#### Bad Signs ❌:
```
❌ Error sending message: {...}
❌ navigator.setAppBadge error: {...}
❌ Service worker message error: {...}
Error: relation "chat_messages" does not exist
```

---

## Common Issues & Fixes

### Issue: Messages Not Sending
**Fix:** 
- Check if `chat_messages` table exists
- Run `supabase_chat_schema.sql` in Supabase
- Verify Supabase URL and key in `.env`

### Issue: Notifications Not Showing
**Fix:**
- Allow browser notifications
- Check real-time is enabled
- Verify subscription in console

### Issue: Badge Not Visible
**Fix:**
- Check console logs
- Verify service worker is active
- Favicon badge should always work
- Try different browser

### Issue: Clear Chat Not Working
**Fix:**
- Run `ADD_CLEAR_CHAT_TABLE.sql` in Supabase
- Check real-time is enabled for table
- Verify both users are logged in

---

## Quick Verification Checklist

Before reporting issues, verify:

- [ ] Changes deployed (check GitHub Actions)
- [ ] SQL tables created in Supabase
- [ ] Browser cache cleared (Ctrl+F5)
- [ ] Console open to see logs
- [ ] No errors in console
- [ ] Real-time enabled in Supabase
- [ ] Correct Supabase credentials

---

## Success Criteria ✅

All tests pass when:

1. **Chat:** Messages send and receive instantly
2. **Notifications:** Sound plays, badge shows, panel updates
3. **Badge:** Console shows all 3 methods working
4. **Clear Chat:** Request/approve workflow completes

---

## Need Help?

Check these files:
- `SESSION_FIXES_COMPLETE.md` - Detailed fix documentation
- `REMAINING_FIXES_NEEDED.md` - Original issue descriptions
- Console logs - Most helpful for debugging

---

**Created:** November 17, 2025
**Status:** Ready for Testing
**Estimated Test Time:** 15-20 minutes

