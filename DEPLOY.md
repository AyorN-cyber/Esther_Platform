# 🚀 Deployment Instructions

## GitHub Pages Deployment

Your site is configured to deploy automatically to GitHub Pages!

### Automatic Deployment (Recommended)

Every time you push to the `main` branch, GitHub Actions will automatically:
1. Build your project
2. Deploy to GitHub Pages
3. Make it live at: https://ayorn-cyber.github.io/Esther_Platform

### Manual Deployment (Alternative)

If you prefer to deploy manually:

```bash
npm run deploy
```

This will:
1. Build the production version
2. Push to the `gh-pages` branch
3. Deploy automatically

## First Time Setup

### Step 1: Enable GitHub Pages

1. Go to your repository: https://github.com/AyorN-cyber/Esther_Platform
2. Click **Settings** → **Pages**
3. Under "Build and deployment":
   - Source: **GitHub Actions**
4. Save

### Step 2: Commit and Push

```bash
# Add all files
git add .

# Commit changes
git commit -m "Setup GitHub Pages deployment"

# Push to GitHub
git push origin main
```

### Step 3: Wait for Deployment

- Go to **Actions** tab in your repository
- Watch the deployment progress
- Once complete, your site will be live!

## Your Live URL

After deployment, your site will be available at:
**https://ayorn-cyber.github.io/Esther_Platform**

## Important: Before Going Live

### 🔐 Security Checklist

1. **Change Admin Passwords** in `src/components/AdminPanel.tsx`
   - Current: admin/admin123 and moderator/mod123
   - Change to strong passwords!

2. **Update Content**
   - Hero image and text
   - About section
   - Contact information
   - Social media links

3. **Test Everything**
   - Admin login
   - Video uploads
   - Chat system
   - Settings

## Updating Your Site

After the initial deployment, any changes you push to `main` will automatically deploy:

```bash
# Make your changes
git add .
git commit -m "Your update message"
git push origin main
```

Wait 2-3 minutes for GitHub Actions to rebuild and deploy.

## Troubleshooting

### Deployment Failed?

1. Check the **Actions** tab for error messages
2. Ensure all dependencies are in `package.json`
3. Make sure the build succeeds locally: `npm run build`

### Site Not Loading?

1. Check GitHub Pages settings are correct
2. Wait 5-10 minutes after first deployment
3. Clear browser cache and try again
4. Check the Actions tab for deployment status

### 404 Errors?

- Make sure `base: '/Esther_Platform/'` is in `vite.config.ts`
- Verify the repository name matches exactly

## Custom Domain (Optional)

To use your own domain:

1. Go to **Settings** → **Pages**
2. Add your custom domain
3. Update DNS records with your domain provider
4. Update `vite.config.ts`: change `base: '/'`

## Support

If you encounter issues:
- Check GitHub Actions logs
- Review build errors
- Ensure all files are committed
- Try manual deployment: `npm run deploy`

---

**Ready to deploy?** Just commit and push! 🎉
