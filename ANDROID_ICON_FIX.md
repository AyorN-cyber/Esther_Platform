# 🤖 Android Icon Fix - Maskable Icons

## Issue
The app icon on Android appears cut off at the edges due to the adaptive icon system. Android uses circular/rounded masks that can crop the icon.

## Solution: Maskable Icons

### What are Maskable Icons?
Maskable icons have a "safe zone" in the center where important content stays visible, with padding around the edges that can be cropped.

### Safe Zone Guidelines
- **Total Icon Size:** 512x512px
- **Safe Zone:** 360x360px (center)
- **Padding:** 76px on all sides
- **Safe Zone Percentage:** 70% of total size

### Current Status
✅ Manifest already has maskable icons defined:
```json
{
  "src": "/icons/android/android-launchericon-192-192.png",
  "sizes": "192x192",
  "type": "image/png",
  "purpose": "maskable"
},
{
  "src": "/icons/android/android-launchericon-512-512.png",
  "sizes": "512x512",
  "type": "image/png",
  "purpose": "maskable"
}
```

## How to Create Proper Maskable Icons

### Option 1: Use Online Tool (Easiest)
1. Go to https://maskable.app/editor
2. Upload your logo
3. Adjust size to fit safe zone (green circle)
4. Download maskable icons
5. Replace files in `/public/icons/android/`

### Option 2: Manual Creation (Photoshop/Figma)

#### Step 1: Create Canvas
- Size: 512x512px
- Background: Transparent or brand color

#### Step 2: Add Safe Zone Guide
- Draw circle: 360x360px
- Center it: 76px from all edges
- This is your safe zone

#### Step 3: Place Logo
- Keep logo within safe zone
- Add padding around logo
- Logo should be ~280x280px max

#### Step 4: Add Background
- Fill area outside logo
- Use brand colors
- Can use gradient

#### Step 5: Export
- Format: PNG
- Sizes: 192x192px and 512x512px
- Save as maskable versions

### Option 3: Use Icon Generator
```bash
# Install PWA Asset Generator
npm install -g pwa-asset-generator

# Generate icons with safe zone
pwa-asset-generator logo.svg ./public/icons \
  --padding "20%" \
  --background "#0f172a" \
  --maskable true
```

## Recommended Icon Design

### For Esther Reign:
```
┌─────────────────────┐
│                     │ ← 76px padding
│   ┌───────────┐     │
│   │           │     │
│   │   LOGO    │     │ ← Logo in safe zone
│   │           │     │
│   └───────────┘     │
│                     │ ← 76px padding
└─────────────────────┘
```

### Design Tips:
1. **Center the logo** - Keep it in the middle
2. **Add padding** - At least 20% on all sides
3. **Use background** - Fill with brand color
4. **Test shapes** - Check circle, squircle, rounded square
5. **Keep it simple** - Avoid fine details at edges

## Testing Maskable Icons

### Online Test:
1. Go to https://maskable.app
2. Upload your icon
3. Try different mask shapes
4. Ensure logo stays visible

### On Device:
1. Install PWA on Android
2. Check home screen icon
3. Try different launchers
4. Verify no cropping

## Quick Fix for Current Icons

If your current icons are being cropped:

### Temporary Solution:
1. Open icon in image editor
2. Add 20% padding on all sides
3. Scale logo down to 70% of canvas
4. Add background color (#0f172a)
5. Export and replace

### Example Sizes:
- **512x512 icon:** Logo should be ~360x360px
- **192x192 icon:** Logo should be ~135x135px

## Color Scheme for Icons

### Updated Brand Colors:
```css
Primary: #06b6d4 (Cyan)
Secondary: #3b82f6 (Blue)
Accent: #7c3aed (Royal Purple)
Background: #0f172a (Slate)
```

### Icon Background Options:
1. **Solid:** `#0f172a` (slate)
2. **Gradient:** `linear-gradient(135deg, #06b6d4, #7c3aed)`
3. **Transparent:** With logo having background

## Implementation Checklist

- [ ] Create 512x512 maskable icon
- [ ] Create 192x192 maskable icon
- [ ] Add 20% padding around logo
- [ ] Use brand colors for background
- [ ] Test on https://maskable.app
- [ ] Replace files in `/public/icons/android/`
- [ ] Test on Android device
- [ ] Verify in different launchers

## Files to Update

```
/public/icons/android/
├── android-launchericon-192-192.png (maskable)
└── android-launchericon-512-512.png (maskable)
```

## Manifest Configuration

Already configured correctly:
```json
{
  "purpose": "maskable"
}
```

This tells Android to use the safe zone guidelines.

## Additional Resources

- [Maskable Icon Editor](https://maskable.app/editor)
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [Android Adaptive Icons Guide](https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive)
- [Web.dev Maskable Icons](https://web.dev/maskable-icon/)

## Result

After fixing, your icon will:
- ✅ Display perfectly on all Android devices
- ✅ Work with any launcher
- ✅ Look professional in all shapes
- ✅ No cropping or cutoff
- ✅ Consistent branding

---

**Note:** The manifest is already configured correctly. You just need to create proper maskable icon images with adequate padding.
