# Esther Reign - Gospel Artist Portfolio & Admin Platform

A modern, full-featured portfolio website and admin management system for gospel artist Esther Reign.

## 🎵 Features

### Public Website
- **Hero Section** - Stunning introduction with animated background
- **About Section** - Artist biography and story
- **Videos Gallery** - Showcase of music videos and performances
- **Contact Section** - Get in touch with social media links
- **Responsive Design** - Perfect on all devices
- **WebGL Animations** - Beautiful animated backgrounds
- **Dark Theme** - Modern, eye-catching design

### Admin Panel
- **Dashboard** - Analytics and overview
- **Video Management** - Upload, edit, and manage videos
- **Analytics** - Track visitors and engagement
- **Settings** - Customize site content and images
- **Floating Chat** - Real-time communication between artist and manager
- **Notifications** - Stay updated on important events

### Chat System
- **Real-time Messaging** - Instant communication
- **Voice Notes** - Record and send audio messages
- **Video References** - Attach video links to messages
- **Typing Indicators** - See when someone is typing
- **Online Status** - Know when users are active
- **Emoji Support** - Express yourself with emojis
- **Notification Sounds** - Audio alerts for new messages

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/esther-reign.git

# Navigate to project directory
cd esther-reign

# Install dependencies
npm install

# Start development server
npm run dev
```

The site will be available at `http://localhost:5173`

## 📦 Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

The build files will be in the `dist` folder.

## 🔐 Admin Access

Access the admin panel by clicking "Admin" in the navigation menu.

**Default Credentials** (⚠️ CHANGE IMMEDIATELY):
- Artist: `artist@estherreign.com` / `artist2024`
- Manager: `editor@estherreign.com` / `editor2024`

## 📱 Mobile Optimization

The entire platform is fully optimized for mobile devices:
- Responsive layouts
- Touch-friendly controls
- Optimized images
- Fast loading times
- Mobile-friendly chat widget

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React, React Icons
- **Animations**: CSS Animations + WebGL
- **State Management**: React Hooks
- **Storage**: LocalStorage (ready for backend integration)

## 📂 Project Structure

```
esther-reign/
├── src/
│   ├── components/
│   │   ├── AdminPanel.tsx       # Admin dashboard
│   │   ├── FloatingChat.tsx     # Chat widget
│   │   ├── Settings.tsx         # Settings management
│   │   ├── VideoChart.tsx       # Analytics charts
│   │   ├── NotificationCenter.tsx
│   │   ├── WebGLBackground.tsx  # Animated background
│   │   └── Loader.tsx           # Loading screen
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   ├── lib/
│   │   └── supabase.ts          # Database config (optional)
│   ├── App.tsx                  # Main app component
│   ├── index.css                # Global styles
│   └── main.tsx                 # App entry point
├── public/                      # Static assets
├── DEPLOYMENT_GUIDE.md          # Deployment instructions
└── package.json
```

## 🎨 Customization

### Update Site Content
1. Login to admin panel
2. Go to Settings tab
3. Update images, text, and social links
4. Click "Save Changes"

### Add Videos
1. Login to admin panel
2. Go to Videos tab
3. Click "Add New Video"
4. Fill in video details
5. Save

### Manage Chat
- Click the floating chat button (bottom-right)
- Send messages, voice notes, or video references
- Real-time communication between artist and manager

## 🔧 Configuration

### Environment Variables
Create `.env` file:
```env
VITE_APP_NAME=Esther Reign
VITE_API_URL=your-api-url
```

### Update Admin Credentials
Edit `src/components/AdminPanel.tsx`:
```typescript
const USERS = [
  {
    email: 'your-email@domain.com',
    password: 'your-secure-password',
    name: 'Your Name',
    role: 'artist'
  }
];
```

## 📊 Analytics

The platform tracks:
- Total visitors
- Page visits
- Admin logins
- Video views
- User engagement

## 🔒 Security

- Change default passwords immediately
- Use HTTPS in production
- Regular backups recommended
- Keep dependencies updated
- Monitor for suspicious activity

## 🚀 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Quick Deploy Options:
- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod --dir=dist`
- **GitHub Pages**: `npm run deploy`

## 🐛 Troubleshooting

### Common Issues

**Chat not working**
- Check browser permissions for microphone
- Ensure localStorage is enabled

**Images not loading**
- Verify image paths in Settings
- Check file permissions

**Admin login fails**
- Clear browser cache
- Verify credentials
- Check localStorage

## 📝 License

This project is proprietary software for Esther Reign.

## 👥 Support

For technical support:
- Email: support@estherreign.com
- Phone: +234 818 019 4269

## 🎉 Acknowledgments

Built with ❤️ for Esther Reign's ministry

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Status**: Production Ready ✅
