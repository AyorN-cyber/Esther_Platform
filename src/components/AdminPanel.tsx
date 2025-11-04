import React, { useState, useEffect } from 'react';
import { X, LogOut, Save, BarChart3, Video as VideoIcon, User, Eye, TrendingUp, Users, Clock, CheckCircle, Edit2, Settings as SettingsIcon, Key, Upload } from 'lucide-react';
import { SupabaseChat } from './SupabaseChat';
import { Settings } from './Settings';
import { NotificationCenter, addNotification } from './NotificationCenter';
import { VideoChart } from './VideoChart';
import { WebGLBackground } from './WebGLBackground';
import type { Video, User as UserType, Analytics } from '../types';

interface AdminPanelProps {
  onClose: () => void;
}

const INITIAL_VIDEOS = [
  'Oba Eri (Audio) Visualizer Video', 'Oni Bu Ore (1)', 'Agbara Olorun po - Fi Agabara Han',
  'Oh Glorious God', 'Ogo Re Po', 'Oba Eri (Video)', "He's ALIVE", 'Igba Iranwo',
  'Excerpt from Group Worship x 2', 'BTS COMPILATION', 'Intro Video', 'Olorun Agabaye',
  'Ta lo da bi re (Tope Alabi) Freestyle Audio', 'Generation (Dunsi) Freestyle Audio',
  'Pius Elizabeth Cover parting', 'Ka se re bere (Video done with Black Dress Gown) with TG',
  'You are Wonderful/E si mi lo ju emi (Video done with Black Dress Gown) with TG',
  "Bi o tin sise re ko s'eni to ye (Video done with Black Dress Gown) with TG",
  'Oni bu ore part II', 'Low light (Olorun Agabaye)', "A'lamo ire Cover", 'Chants (Audio)',
  'The other part TG merged into it, the God is able to do, and kabiesi olorun ayo',
  'Breathe Cover With Dunsin', 'Imole Kọ tàn (1) Iri by Ṣọla Allyson',
  'Imole Kọ tàn (2) Iri by Ṣọla Allyson', 'Aigbagbọ Bila (Audio) #Mimo medley live... Ṣọla Allyson'
];

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'videos' | 'analytics' | 'chat' | 'settings'>('dashboard');
  const [videos, setVideos] = useState<Video[]>([]);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [analytics, setAnalytics] = useState<Analytics>({
    total_visitors: 0,
    page_visits: {},
    artist_logins: 0,
    last_updated: new Date().toISOString()
  });

  useEffect(() => {
    // Check for saved session
    const savedSession = localStorage.getItem('admin_session');
    if (savedSession) {
      const session = JSON.parse(savedSession);
      setCurrentUser(session.user);
      setIsLoggedIn(true);
    }
    loadData();
  }, []);

  const loadData = async () => {
    await loadVideos();
    await loadAnalytics();
  };

  const loadVideos = async () => {
    const { getVideos } = await import('../lib/supabaseData');
    const videosData = await getVideos();
    
    if (videosData.length > 0) {
      setVideos(videosData);
    } else {
      // Initialize with default videos if database is empty
      const initialVideos: Video[] = INITIAL_VIDEOS.map((title, index) => ({
        id: `video-${index}`,
        title,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        order_index: index
      }));
      
      // Save to Supabase
      const { addVideo } = await import('../lib/supabaseData');
      for (const video of initialVideos) {
        await addVideo(video);
      }
      setVideos(initialVideos);
    }
  };

  const loadAnalytics = async () => {
    const { getSettings } = await import('../lib/supabaseData');
    const settings = await getSettings();
    
    setAnalytics({
      total_visitors: (settings as any)?.total_visits || 0,
      page_visits: { home: (settings as any)?.total_visits || 0 },
      artist_logins: (settings as any)?.artist_logins || 0,
      last_updated: new Date().toISOString()
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    let user: UserType | null = null;
    
    if (email === 'artist@estherreign.com' && password === 'artist2024') {
      user = {
        id: '1',
        email,
        role: 'artist',
        phone: '+234 818 019 4269',
        name: 'Esther Reign'
      };
      
      // Track login in Supabase
      (async () => {
        const { getSettings, updateSettings } = await import('../lib/supabaseData');
        const settings = await getSettings();
        const currentLogins = (settings as any)?.artist_logins || 0;
        await updateSettings({ artist_logins: currentLogins + 1 });
      })();
      
      sendNotification('+234 805 596 4955', 'Artist has logged into the system');
    } else if (email === 'editor@estherreign.com' && password === 'editor2024') {
      user = {
        id: '2',
        email,
        role: 'editor',
        phone: '+234 805 596 4955',
        name: 'Video Editor'
      };
    }

    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      // Save session
      localStorage.setItem('admin_session', JSON.stringify({ user, timestamp: Date.now() }));
      
      // Send login notification
      if (user.role === 'artist') {
        addNotification('system', 'Artist Login', 'Esther Reign has logged into the admin panel');
      } else if (user.role === 'editor') {
        addNotification('system', 'Editor Login', 'Video Editor has logged into the admin panel');
        sendNotification('+234 818 019 4269', 'Video Editor has logged into the system');
      }
    } else {
      alert('Invalid credentials');
    }
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, send email with reset link
    alert(`Password reset link sent to ${resetEmail}`);
    setShowPasswordReset(false);
    setResetEmail('');
  };

  const sendNotification = (phone: string, message: string) => {
    console.log(`Notification to ${phone}: ${message}`);
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.push({
      id: Date.now().toString(),
      recipient_phone: phone,
      message,
      sent_at: new Date().toISOString(),
      type: currentUser?.role === 'artist' ? 'artist_login' : 'video_update'
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));
  };

  const getVideoThumbnail = (url: string): string => {
    if (!url) return '';
    
    // Check if it's a Cloudinary video
    if (url.includes('cloudinary.com')) {
      // Method 1: Use Cloudinary transformation to get video thumbnail
      // Add transformation parameters to get first frame as JPG
      if (url.includes('/upload/')) {
        // Insert transformation after /upload/
        const thumbnailUrl = url.replace('/upload/', '/upload/so_0,w_640,h_360,c_fill,f_jpg/');
        return thumbnailUrl;
      }
      
      // Method 2: If video path exists, convert to image
      if (url.includes('/video/')) {
        const thumbnailUrl = url
          .replace('/video/', '/image/')
          .replace(/\.(mp4|mov|avi|webm|mkv)$/i, '.jpg');
        return thumbnailUrl;
      }
      
      // Method 3: Just add transformation parameters
      return url.replace('/upload/', '/upload/so_0,f_jpg/');
    }
    
    // Extract YouTube video ID from various URL formats
    let videoId = '';
    
    // Standard watch URL
    const watchMatch = url.match(/[?&]v=([^&]+)/);
    if (watchMatch) {
      videoId = watchMatch[1];
    }
    
    // Short URL (youtu.be)
    const shortMatch = url.match(/youtu\.be\/([^?]+)/);
    if (shortMatch) {
      videoId = shortMatch[1];
    }
    
    // Embed URL
    const embedMatch = url.match(/embed\/([^?]+)/);
    if (embedMatch) {
      videoId = embedMatch[1];
    }
    
    // Return high quality thumbnail if video ID found
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    
    return '';
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>, videoId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      
      // Update the editing video with the new thumbnail
      if (editingVideo && editingVideo.id === videoId) {
        setEditingVideo({ ...editingVideo, thumbnail_url: base64String });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveVideo = async () => {
    if (!editingVideo) return;

    try {
      const { updateVideo, addVideo } = await import('../lib/supabaseData');
      
      // Check if this is a new video or existing one
      const existingIndex = videos.findIndex(v => v.id === editingVideo.id);
      
      if (existingIndex >= 0) {
        // Update existing video in Supabase
        const success = await updateVideo(editingVideo.id, editingVideo);
        
        if (success) {
          // Update local state
          const updatedVideos = videos.map(v => 
            v.id === editingVideo.id ? { ...editingVideo, updated_at: new Date().toISOString() } : v
          );
          setVideos(updatedVideos);
          
          if (currentUser?.role === 'editor') {
            sendNotification('+234 818 019 4269', `Video "${editingVideo.title}" has been updated`);
            addNotification('video_update', 'Video Updated', `"${editingVideo.title}" updated in the gallery`);
          }
          
          alert('Video updated successfully!');
        } else {
          alert('Failed to update video. Please try again.');
        }
      } else {
        // Add new video to Supabase
        const { created_at, updated_at, id, ...videoData } = editingVideo;
        const newVideo = await addVideo(videoData);
        
        if (newVideo) {
          // Update local state
          setVideos([...videos, newVideo]);
          
          if (currentUser?.role === 'editor') {
            sendNotification('+234 818 019 4269', `Video "${editingVideo.title}" has been added`);
            addNotification('video_update', 'Video Added', `"${editingVideo.title}" added to the gallery`);
          }
          
          alert('Video added successfully!');
        } else {
          alert('Failed to add video. Please try again.');
        }
      }
      
      setEditingVideo(null);
      
      // Reload videos from Supabase
      await loadVideos();
    } catch (error) {
      console.error('Error saving video:', error);
      alert('Error saving video. Please check console for details.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setEmail('');
    setPassword('');
    localStorage.removeItem('admin_session');
  };

  const completedCount = videos.filter(v => v.status === 'completed').length;
  const pendingCount = videos.filter(v => v.status === 'pending').length;

  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 flex items-center justify-center z-50">
        <WebGLBackground />
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X size={32} />
        </button>

        {showPasswordReset ? (
          <div className="max-w-md w-full mx-4">
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20 shadow-2xl">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Key size={40} className="text-white" />
                </div>
                <h2 className="text-3xl font-black mb-2">
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Reset Password
                  </span>
                </h2>
                <p className="text-gray-400">Enter your email to receive reset link</p>
              </div>
              
              <form onSubmit={handlePasswordReset} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Email</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 transition-colors text-white"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105"
                >
                  Send Reset Link
                </button>

                <button
                  type="button"
                  onClick={() => setShowPasswordReset(false)}
                  className="w-full text-gray-400 hover:text-white transition-colors"
                >
                  Back to Login
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="max-w-md w-full mx-4">
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20 shadow-2xl">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <User size={40} className="text-white" />
                </div>
                <h2 className="text-3xl font-black mb-2">
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Admin Login
                  </span>
                </h2>
                <p className="text-gray-400">Content Management System</p>
              </div>
              
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 transition-colors text-white"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 transition-colors text-white"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowPasswordReset(true)}
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Forgot password?
                </button>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105"
                >
                  Login
                </button>
              </form>


            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 overflow-y-auto z-50">
      <WebGLBackground />
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gray-900/80 backdrop-blur-xl border-r border-purple-500/20 p-6 hidden lg:block z-50">
        <div className="mb-8">
          <h1 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Admin Panel
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <User size={14} />
            <span className="text-white">{currentUser?.name}</span>
          </div>
          <div className="text-xs text-purple-400 capitalize">{currentUser?.role}</div>
        </div>

        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-white ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg'
                : 'hover:bg-gray-800/50'
            }`}
          >
            <BarChart3 size={20} />
            <span className="font-medium">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('videos')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-white ${
              activeTab === 'videos'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg'
                : 'hover:bg-gray-800/50'
            }`}
          >
            <VideoIcon size={20} />
            <span className="font-medium">Videos</span>
            <span className="ml-auto bg-purple-500/20 px-2 py-1 rounded-full text-xs">
              {videos.length}
            </span>
          </button>

          {currentUser?.role === 'editor' && (
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-white ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg'
                  : 'hover:bg-gray-800/50'
              }`}
            >
              <TrendingUp size={20} />
              <span className="font-medium">Analytics</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-white ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg'
                : 'hover:bg-gray-800/50'
            }`}
          >
            <SettingsIcon size={20} />
            <span className="font-medium">Settings</span>
          </button>
        </nav>

        <div className="absolute bottom-6 left-6 right-6 space-y-2">
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800/50 hover:bg-gray-800 rounded-xl transition-all text-white"
          >
            <Eye size={20} />
            <span>View Site</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600/20 hover:bg-red-600 rounded-xl transition-all text-red-400 hover:text-white"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-b border-purple-500/20 p-3 flex justify-between items-center z-50">
        <h1 className="text-base font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex-shrink-0">
          Admin Panel
        </h1>
        <div className="flex items-center gap-1 flex-shrink-0">
          <NotificationCenter />
          <button
            onClick={onClose}
            className="p-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-all text-white"
          >
            <Eye size={18} />
          </button>
        </div>
      </div>

      {/* Desktop Top Bar with Notifications */}
      <div className="hidden lg:block fixed top-0 right-0 left-64 bg-gray-900/80 backdrop-blur-xl border-b border-purple-500/20 p-4 flex justify-end z-40">
        <NotificationCenter />
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-purple-500/20 p-2 z-40">
        <div className="flex justify-around">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
              activeTab === 'dashboard' ? 'text-purple-400' : 'text-gray-400'
            }`}
          >
            <BarChart3 size={20} />
            <span className="text-xs">Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
              activeTab === 'videos' ? 'text-purple-400' : 'text-gray-400'
            }`}
          >
            <VideoIcon size={20} />
            <span className="text-xs">Videos</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
              activeTab === 'settings' ? 'text-purple-400' : 'text-gray-400'
            }`}
          >
            <SettingsIcon size={20} />
            <span className="text-xs">Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all text-red-400"
          >
            <LogOut size={20} />
            <span className="text-xs">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 p-4 md:p-8 pt-20 lg:pt-20 pb-24 lg:pb-8">

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-black mb-2 text-white">Dashboard Overview</h2>
              <p className="text-gray-400">Welcome back, {currentUser?.name}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                    <VideoIcon size={24} className="text-purple-400" />
                  </div>
                  <span className="text-2xl">📹</span>
                </div>
                <div className="text-3xl font-black mb-1 text-white">{videos.length}</div>
                <div className="text-sm text-gray-400">Total Videos</div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-green-500/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
                    <CheckCircle size={24} className="text-green-400" />
                  </div>
                  <span className="text-2xl">✅</span>
                </div>
                <div className="text-3xl font-black mb-1 text-white">{completedCount}</div>
                <div className="text-sm text-gray-400">Completed</div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-yellow-500/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-600/20 rounded-xl flex items-center justify-center">
                    <Clock size={24} className="text-yellow-400" />
                  </div>
                  <span className="text-2xl">⏳</span>
                </div>
                <div className="text-3xl font-black mb-1 text-white">{pendingCount}</div>
                <div className="text-sm text-gray-400">Pending</div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                    <Users size={24} className="text-blue-400" />
                  </div>
                  <span className="text-2xl">👥</span>
                </div>
                <div className="text-3xl font-black mb-1 text-white">{analytics.total_visitors}</div>
                <div className="text-sm text-gray-400">Visitors</div>
              </div>
            </div>

            {/* Video Progress Chart */}
            <VideoChart videos={videos} />

            {/* Current Status - Donut Chart */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-6 text-white">Current Status Distribution</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-48 h-48">
                  <svg className="transform -rotate-90 w-48 h-48">
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="rgba(234, 179, 8, 0.2)"
                      strokeWidth="32"
                      fill="none"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="rgb(234, 179, 8)"
                      strokeWidth="32"
                      fill="none"
                      strokeDasharray={`${videos.length > 0 ? (pendingCount / videos.length) * 502.4 : 0} 502.4`}
                      className="transition-all duration-1000 ease-out"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="rgb(34, 197, 94)"
                      strokeWidth="32"
                      fill="none"
                      strokeDasharray={`${videos.length > 0 ? (completedCount / videos.length) * 502.4 : 0} 502.4`}
                      strokeDashoffset={`-${videos.length > 0 ? (pendingCount / videos.length) * 502.4 : 0}`}
                      className="transition-all duration-1000 ease-out"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <div className="text-3xl font-bold text-white">{videos.length}</div>
                    <div className="text-sm text-gray-400">Total</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center p-4 bg-yellow-600/10 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-400">{pendingCount}</div>
                  <div className="text-xs text-gray-400">Pending</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {videos.length > 0 ? Math.round((pendingCount / videos.length) * 100) : 0}%
                  </div>
                </div>
                <div className="text-center p-4 bg-green-600/10 rounded-xl">
                  <div className="text-2xl font-bold text-green-400">{completedCount}</div>
                  <div className="text-xs text-gray-400">Completed</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {videos.length > 0 ? Math.round((completedCount / videos.length) * 100) : 0}%
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 text-white">Recent Videos</h3>
              <div className="space-y-3">
                {videos.slice(0, 5).map((video) => (
                  <div key={video.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${video.status === 'completed' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                      <div>
                        <div className="font-medium text-white">{video.title}</div>
                        <div className="text-sm text-gray-400 capitalize">{video.status}</div>
                      </div>
                    </div>
                    {currentUser?.role === 'editor' && (
                      <button
                        onClick={() => setEditingVideo(video)}
                        className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600 rounded-lg transition-all text-sm text-white"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-3xl font-black mb-2 text-white">Video Management</h2>
                <p className="text-gray-400">Manage all video content</p>
              </div>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => {
                    setEditingVideo({
                      id: `video-${Date.now()}`,
                      title: '',
                      video_link: '',
                      thumbnail_url: '',
                      status: 'pending',
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                      order_index: videos.length
                    });
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2"
                >
                  <Upload size={20} />
                  Add New Video
                </button>
                <div className="px-4 py-2 bg-green-600/20 rounded-xl text-green-400 text-sm flex items-center">
                  {completedCount} Completed
                </div>
                <div className="px-4 py-2 bg-yellow-600/20 rounded-xl text-yellow-400 text-sm flex items-center">
                  {pendingCount} Pending
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/50 transition-all"
                >
                  <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                    <div className="flex-1 w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                        <h3 className="text-base md:text-lg font-bold text-white break-words">{video.title}</h3>
                        <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium self-start ${
                          video.status === 'completed' 
                            ? 'bg-green-600/20 text-green-400' 
                            : 'bg-yellow-600/20 text-yellow-400'
                        }`}>
                          {video.status}
                        </span>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-xs md:text-sm text-gray-400">
                        {video.template_type && (
                          <span>📝 {video.template_type}</span>
                        )}
                        {video.video_link && (
                          <a href={video.video_link} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">
                            🔗 View Link
                          </a>
                        )}
                      </div>
                    </div>

                    {currentUser?.role === 'editor' && (
                      <button
                        onClick={() => setEditingVideo(video)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl transition-all flex items-center gap-2 text-white"
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                    )}
                  </div>

                  {video.thumbnail_url && (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-48 object-cover rounded-xl mt-4"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && currentUser?.role === 'editor' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-black mb-2 text-white">Analytics</h2>
              <p className="text-gray-400">Track performance and engagement</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm text-gray-400">Total Visitors</h3>
                  <TrendingUp className="text-purple-400" size={20} />
                </div>
                <p className="text-4xl font-black mb-2 text-white">{analytics.total_visitors}</p>
                <p className="text-sm text-green-400">↑ Growing</p>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm text-gray-400">Artist Logins</h3>
                  <User className="text-purple-400" size={20} />
                </div>
                <p className="text-4xl font-black mb-2 text-white">{analytics.artist_logins}</p>
                <p className="text-sm text-gray-400">Total sessions</p>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm text-gray-400">Completion Rate</h3>
                  <CheckCircle className="text-purple-400" size={20} />
                </div>
                <p className="text-4xl font-black mb-2 text-white">
                  {videos.length > 0 ? Math.round((completedCount / videos.length) * 100) : 0}%
                </p>
                <p className="text-sm text-gray-400">{completedCount} of {videos.length}</p>
              </div>
            </div>

            {/* Visitor Trend Chart */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-6 text-white">Visitor Trend (Last 7 Days)</h3>
              <div className="h-64 flex items-end justify-between gap-2">
                {[65, 80, 75, 90, 85, 95, analytics.total_visitors % 100].map((value, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-gradient-to-t from-purple-600 to-pink-400 rounded-t-xl transition-all hover:opacity-80"
                      style={{ height: `${value}%` }}
                    ></div>
                    <div className="mt-2 text-xs text-gray-400">
                      Day {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <Settings />
        )}
      </div>

      {/* Edit Modal */}
      {editingVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-20">
          <div className="bg-gray-900 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-white">Edit Video</h2>
              <button
                onClick={() => setEditingVideo(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Title</label>
                <input
                  type="text"
                  value={editingVideo.title}
                  onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white">Status</label>
                <select
                  value={editingVideo.status}
                  onChange={(e) => setEditingVideo({ ...editingVideo, status: e.target.value as 'pending' | 'completed' })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white">Template Type</label>
                <input
                  type="text"
                  value={editingVideo.template_type || ''}
                  onChange={(e) => setEditingVideo({ ...editingVideo, template_type: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white"
                  placeholder="e.g., Cinematic, Lyric Video, Performance"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white">Video Link</label>
                <input
                  type="url"
                  value={editingVideo.video_link || ''}
                  onChange={(e) => setEditingVideo({ ...editingVideo, video_link: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white"
                  placeholder="https://youtube.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white">Thumbnail</label>
                <div className="space-y-3">
                  {/* Current Thumbnail Preview */}
                  {(editingVideo.thumbnail_url || editingVideo.video_link) && (
                    <div className="relative w-full h-48 bg-gray-800 rounded-xl overflow-hidden">
                      <img
                        src={editingVideo.thumbnail_url || getVideoThumbnail(editingVideo.video_link || '')}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/640x360/1a1a1a/666666?text=No+Thumbnail';
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Thumbnail URL Input */}
                  <input
                    type="url"
                    value={editingVideo.thumbnail_url || ''}
                    onChange={(e) => setEditingVideo({ ...editingVideo, thumbnail_url: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white"
                    placeholder="Thumbnail URL (optional - auto-extracts from YouTube)"
                  />
                  
                  {/* Upload from Device */}
                  <div className="flex gap-2">
                    <label className="flex-1 cursor-pointer">
                      <div className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 border border-purple-500 rounded-xl transition-colors text-white text-center font-medium flex items-center justify-center gap-2">
                        <Upload size={18} />
                        Upload from Device
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleThumbnailUpload(e, editingVideo.id)}
                        className="hidden"
                      />
                    </label>
                    
                    {editingVideo.thumbnail_url && (
                      <button
                        onClick={() => setEditingVideo({ ...editingVideo, thumbnail_url: '' })}
                        className="px-4 py-3 bg-red-600 hover:bg-red-700 rounded-xl transition-colors text-white font-medium"
                        title="Remove custom thumbnail"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-400">
                    💡 Leave empty to auto-extract thumbnail from YouTube link
                  </p>
                </div>
              </div>

              <button
                onClick={handleSaveVideo}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/50 flex items-center justify-center gap-2"
              >
                <Save size={20} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Widget */}
      {currentUser && (
        <SupabaseChat currentUser={currentUser} />
      )}
    </div>
  );
};

export default AdminPanel;
