import React, { useState, useEffect, useCallback } from 'react';
import { Lock, LogOut, Plus, MessageSquare, Eye, Music, Instagram, Youtube, Mail, CheckCircle, Clock, AlertCircle, EyeOff, Save, Upload, Facebook, Twitter, Globe } from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';
import { ImageUpload } from './components/ImageUpload';
import { createNotification, getUnreadNotifications } from './services/notifications';
import { supabase, extractGoogleDriveThumbnail } from './lib/supabase';
import type { Video, User, SiteSettings, PublicComment } from './types';

const EstherPlatform = () => {
  const [currentView, setCurrentView] = useState('public');
  const [user, setUser] = useState<User | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [, setNotifications] = useState<PublicComment[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    const unread = await getUnreadNotifications(user.role);
    setNotifications(unread);
  }, [user]);

  const loadData = async () => {
    console.log('Loading data...');
    try {
      const [videosResult, settingsResult, commentsResult, publicCommentsResult] = await Promise.all([
        supabase.from('videos').select('*').order('id', { ascending: true }),
        supabase.from('site_settings').select('*').limit(1).maybeSingle(),
        supabase.from('comments').select('*'),
        supabase.from('public_comments').select('*')
      ]);

      console.log('Data loaded:', { videosResult, settingsResult, commentsResult, publicCommentsResult });

      if (videosResult.data) {
        const videosWithComments = videosResult.data.map(video => ({
          ...video,
          comments: commentsResult.data?.filter((c: PublicComment) => c.video_id === video.id) || [],
          public_comments: publicCommentsResult.data?.filter((c: PublicComment) => c.video_id === video.id) || []
        }));
        setVideos(videosWithComments);
      }

      if (settingsResult.data) {
        setSettings(settingsResult.data);
      }
      
      console.log('Loading complete, setting loading to false');
    } catch (error) {
      console.error('Load error:', error);
    }
    setLoading(false);
  };

  const saveAllChanges = async () => {
    setIsSaving(true);
    try {
      for (const video of videos) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { comments, public_comments, ...videoData } = video;
        await supabase
          .from('videos')
          .upsert({
            ...videoData,
            thumbnail_url: extractGoogleDriveThumbnail(video.drive_link),
            updated_at: new Date().toISOString()
          });
      }

      await createNotification(
        'artist',
        'Videos Updated',
        `Admin has made changes to ${videos.length} video(s).`,
        'update',
        0
      );

      setHasUnsavedChanges(false);
      await loadData();
    } catch (error) {
      console.error('Save error:', error);
      alert('Error saving changes. Please try again.');
    }
    setIsSaving(false);
  };

  const handleLogin = async (username: string, password: string) => {
    const users: Record<string, { password: string; role: string; name: string }> = {
      admin: { password: 'admin2024', role: 'admin', name: 'Video Editor' },
      esther: { password: 'esther2024', role: 'artist', name: 'Esther Reign' }
    };

    if (users[username] && users[username].password === password) {
      const userData = { username, role: users[username].role, name: users[username].name };
      setUser(userData);
      setCurrentView('dashboard');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    if (hasUnsavedChanges) {
      if (!confirm('You have unsaved changes. Are you sure you want to logout?')) {
        return;
      }
    }
    setUser(null);
    setHasUnsavedChanges(false);
    setCurrentView('login');
  };

  const PublicPage = () => {
    const completedVideos = videos.filter(v => v.status === 'complete' && v.drive_link);
    const [publicCommentingId, setPublicCommentingId] = useState<number | null>(null);
    const [publicCommentData, setPublicCommentData] = useState({ name: '', email: '', text: '' });

    const addPublicComment = async (videoId: number) => {
      if (!publicCommentData.name.trim() || !publicCommentData.text.trim()) {
        alert('Please enter your name and comment');
        return;
      }

      try {
        const { error } = await supabase
          .from('public_comments')
          .insert([{
            video_id: videoId,
            author_name: publicCommentData.name,
            author_email: publicCommentData.email,
            text: publicCommentData.text
          }]);

        if (error) throw error;

        await createNotification(
          'admin',
          'New Public Comment',
          `${publicCommentData.name} commented on a video.`,
          'comment',
          videoId
        );

        setPublicCommentData({ name: '', email: '', text: '' });
        setPublicCommentingId(null);
        await loadData();
      } catch (error) {
        console.error('Add public comment error:', error);
        alert('Error adding comment. Please try again.');
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        {/* Hero Section with Video Background */}
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden py-12 px-4">
          {/* Video Slideshow Background */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-black/60 z-10"></div>
            <img
              src="/IMG-20250915-WA0035.jpg"
              alt="Background"
              className="w-full h-full object-cover opacity-30"
            />
          </div>

          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-pink-900/20 animate-pulse-slow z-10"></div>

          <div className="relative z-20 text-center max-w-4xl mx-auto animate-fade-in">
            <div className="mb-8 animate-slide-up">
              <div className="w-48 h-48 md:w-64 md:h-64 mx-auto rounded-full overflow-hidden border-4 border-purple-500 shadow-2xl shadow-purple-500/50 hover:scale-105 transition-transform duration-300">
                <img
                  src={settings?.profile_image || '/Estherreign.jpg'}
                  alt="Esther Reign"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold text-white mb-4 animate-slide-up delay-100">
              OfficialEstherReign
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-purple-300 mb-8 animate-slide-up delay-200">
              Gospel Music • Worship Leader • Content Creator
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 animate-slide-up delay-300">
              <a href="#videos" className="bg-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-purple-700 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/50">
                Watch Videos
              </a>
              <button
                onClick={() => setCurrentView('login')}
                className="bg-gray-800 text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-700 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
              >
                <Lock size={20} />
                Creator Login
              </button>
            </div>
            <div className="flex gap-6 justify-center animate-slide-up delay-400">
              {settings?.social_tiktok && (
                <a href={settings.social_tiktok} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 hover:scale-110 transition-all duration-300">
                  <FaTiktok size={32} />
                </a>
              )}
              {settings?.social_facebook && (
                <a href={settings.social_facebook} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 hover:scale-110 transition-all duration-300">
                  <Facebook size={32} />
                </a>
              )}
              {settings?.social_instagram && (
                <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 hover:scale-110 transition-all duration-300">
                  <Instagram size={32} />
                </a>
              )}
              {settings?.social_youtube && (
                <a href={settings.social_youtube} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 hover:scale-110 transition-all duration-300">
                  <Youtube size={32} />
                </a>
              )}
              {settings?.social_twitter && (
                <a href={settings.social_twitter} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 hover:scale-110 transition-all duration-300">
                  <Twitter size={32} />
                </a>
              )}
              {settings?.social_email && (
                <a href={`mailto:${settings.social_email}`} className="text-purple-400 hover:text-purple-300 hover:scale-110 transition-all duration-300">
                  <Mail size={32} />
                </a>
              )}
              {settings?.social_other && settings.social_other.map((social, idx) => (
                <a key={idx} href={social.url} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 hover:scale-110 transition-all duration-300">
                  <Globe size={32} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center animate-fade-in">About Esther Reign</h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1 animate-slide-left">
                <div className="text-lg md:text-xl text-gray-300 leading-relaxed whitespace-pre-line">
                  {settings?.about_text || ''}
                </div>
              </div>
              <div className="order-1 md:order-2 animate-slide-right">
                <img
                  src={settings?.about_image || '/IMG-20250915-WA0023.jpg'}
                  alt="Esther Reign performing"
                  className="w-full rounded-2xl shadow-2xl shadow-purple-500/20 hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ministry Impact Section */}
        <div className="bg-gradient-to-br from-black to-gray-900 py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">Ministry Impact</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-800/50 border border-purple-500/30 rounded-xl p-6 text-center hover:scale-105 transition-transform">
                <div className="text-4xl font-bold text-purple-400 mb-2">27+</div>
                <div className="text-gray-300">Songs Released</div>
              </div>
              <div className="bg-gray-800/50 border border-purple-500/30 rounded-xl p-6 text-center hover:scale-105 transition-transform">
                <div className="text-4xl font-bold text-purple-400 mb-2">10K+</div>
                <div className="text-gray-300">Lives Touched</div>
              </div>
              <div className="bg-gray-800/50 border border-purple-500/30 rounded-xl p-6 text-center hover:scale-105 transition-transform">
                <div className="text-4xl font-bold text-purple-400 mb-2">100+</div>
                <div className="text-gray-300">Worship Events</div>
              </div>
              <div className="bg-gray-800/50 border border-purple-500/30 rounded-xl p-6 text-center hover:scale-105 transition-transform">
                <div className="text-4xl font-bold text-purple-400 mb-2">∞</div>
                <div className="text-gray-300">God's Faithfulness</div>
              </div>
            </div>
          </div>
        </div>

        {/* Videos Section with Public Comments */}
        <div id="videos" className="bg-gradient-to-br from-gray-900 to-black py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center animate-fade-in">Latest Videos</h2>
            {completedVideos.length === 0 ? (
              <p className="text-center text-gray-400 text-lg">No videos available yet. Check back soon!</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedVideos.slice(0, 6).map((video) => (
                  <div
                    key={video.id}
                    className="bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl hover:shadow-purple-500/20 hover:scale-105 transition-all duration-300"
                  >
                    <div className="aspect-video bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center overflow-hidden">
                      {video.thumbnail_url || extractGoogleDriveThumbnail(video.drive_link) ? (
                        <img
                          src={video.thumbnail_url || extractGoogleDriveThumbnail(video.drive_link)}
                          alt={video.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : <Music size={64} className="text-white" />}
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-lg text-white mb-2 line-clamp-2">{video.title}</h3>
                      {video.drive_link && (
                        <a
                          href={video.drive_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300 font-semibold hover:underline transition-all block mb-4"
                        >
                          Watch Now →
                        </a>
                      )}

                      {/* Public Comments Section */}
                      <div className="border-t border-gray-700 pt-4 mt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <MessageSquare size={16} className="text-gray-400" />
                          <span className="text-sm font-semibold text-gray-300">
                            Comments ({(video.public_comments || []).length})
                          </span>
                        </div>

                        {/* Show recent comments */}
                        <div className="max-h-32 overflow-y-auto space-y-2 mb-3 scrollbar-thin">
                          {(video.public_comments || []).slice(-3).map((comment: PublicComment) => (
                            <div key={comment.id} className="bg-gray-900 rounded p-2 text-xs">
                              <span className="font-semibold text-purple-400">{comment.author_name}</span>
                              <p className="text-gray-300 mt-1">{comment.text}</p>
                            </div>
                          ))}
                        </div>

                        {publicCommentingId === video.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Your name"
                              value={publicCommentData.name}
                              onChange={(e) => setPublicCommentData({ ...publicCommentData, name: e.target.value })}
                              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-white"
                            />
                            <textarea
                              placeholder="Your comment..."
                              value={publicCommentData.text}
                              onChange={(e) => setPublicCommentData({ ...publicCommentData, text: e.target.value })}
                              rows={2}
                              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-white resize-none"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => addPublicComment(video.id)}
                                className="flex-1 bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700"
                              >
                                Post
                              </button>
                              <button
                                onClick={() => {
                                  setPublicCommentingId(null);
                                  setPublicCommentData({ name: '', email: '', text: '' });
                                }}
                                className="flex-1 bg-gray-700 text-gray-300 px-3 py-2 rounded text-sm hover:bg-gray-600"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setPublicCommentingId(video.id)}
                            className="text-purple-400 text-sm font-semibold hover:text-purple-300"
                          >
                            + Add Comment
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-black text-gray-400 py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Stay Connected</h3>
              <p className="text-gray-400 mb-4">Follow the journey of worship and faith</p>
              <div className="flex gap-4 justify-center">
                {settings?.social_tiktok && (
                  <a href={settings.social_tiktok} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition">
                    <FaTiktok size={24} />
                  </a>
                )}
                {settings?.social_facebook && (
                  <a href={settings.social_facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition">
                    <Facebook size={24} />
                  </a>
                )}
                {settings?.social_instagram && (
                  <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition">
                    <Instagram size={24} />
                  </a>
                )}
                {settings?.social_youtube && (
                  <a href={settings.social_youtube} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition">
                    <Youtube size={24} />
                  </a>
                )}
              </div>
            </div>
            <p className="text-sm">&copy; 2025 OfficialEstherReign. All rights reserved.</p>
            <p className="text-xs text-gray-500 mt-2">Spreading the Gospel through Music and Worship</p>
          </div>
        </div>
      </div>
    );
  };
  const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const success = await handleLogin(username, password);
      if (!success) {
        setError('Invalid credentials. Please try again.');
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4 animate-fade-in">
        <button
          onClick={() => setCurrentView('public')}
          className="absolute top-8 left-4 md:left-8 text-purple-400 hover:text-purple-300 transition flex items-center gap-2 hover:scale-105 duration-300"
        >
          ← Back to Home
        </button>

        <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md border border-gray-700 animate-slide-up">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Creator Login</h2>
            <p className="text-gray-400">Access your workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white transition-all"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white transition-all"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-purple-500/50"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  };

  const Dashboard = () => {
    const [newVideo, setNewVideo] = useState({ title: '', notes: '' });
    const [commentText, setCommentText] = useState('');
    const [commentingId, setCommentingId] = useState<number | null>(null);
    const [editingTitleId, setEditingTitleId] = useState<number | null>(null);
    const [editTitleText, setEditTitleText] = useState('');
    const [localVideos, setLocalVideos] = useState<Video[]>(videos);

    useEffect(() => {
      setLocalVideos(videos);
    }, [videos]);

    const stats = {
      total: localVideos.length,
      notStarted: localVideos.filter(v => v.status === 'not-started').length,
      inProgress: localVideos.filter(v => v.status === 'in-progress').length,
      underReview: localVideos.filter(v => v.status === 'under-review').length,
      complete: localVideos.filter(v => v.status === 'complete').length
    };

    const progress = stats.total > 0 ? ((stats.complete / stats.total) * 100).toFixed(0) : '0';

    const updateVideoLocally = useCallback((id: number, field: string, value: string) => {
      setLocalVideos(prev => prev.map(v =>
        v.id === id ? { ...v, [field]: value } : v
      ));
      setVideos(prev => prev.map(v =>
        v.id === id ? { ...v, [field]: value } : v
      ));
      setHasUnsavedChanges(true);
    }, []);

    const addVideo = async () => {
      if (!newVideo.title.trim()) return;

      try {
        const { data, error } = await supabase
          .from('videos')
          .insert([{
            title: newVideo.title,
            status: 'not-started',
            template: '',
            notes: newVideo.notes,
            drive_link: '',
            thumbnail_url: '',
            added_by: user!.role
          }])
          .select()
          .single();

        if (error) throw error;

        if (data) {
          const newVideoWithComments = { ...data, comments: [] };
          setVideos([...videos, newVideoWithComments]);
          setLocalVideos([...localVideos, newVideoWithComments]);
        }

        setNewVideo({ title: '', notes: '' });
        setShowAddModal(false);
      } catch (error) {
        console.error('Add video error:', error);
        alert('Error adding video. Please try again.');
      }
    };

    const addComment = async (videoId: number) => {
      if (!commentText.trim()) return;

      try {
        const { data, error } = await supabase
          .from('comments')
          .insert([{
            video_id: videoId,
            author: user!.name,
            role: user!.role,
            text: commentText
          }])
          .select()
          .single();

        if (error) throw error;

        const updated = localVideos.map(v => {
          if (v.id === videoId) {
            return {
              ...v,
              comments: [...(v.comments || []), data]
            };
          }
          return v;
        });

        setLocalVideos(updated);
        setVideos(updated);
        setCommentText('');
        setCommentingId(null);
      } catch (error) {
        console.error('Add comment error:', error);
        alert('Error adding comment. Please try again.');
      }
    };

    const requestReview = async (videoId: number) => {
      updateVideoLocally(videoId, 'status', 'under-review');
      setHasUnsavedChanges(true);
    };

    const getStatusColor = (status: string) => {
      const colors: Record<string, string> = {
        'not-started': 'bg-gray-700 text-gray-300',
        'in-progress': 'bg-yellow-900/50 text-yellow-300',
        'under-review': 'bg-blue-900/50 text-blue-300',
        'complete': 'bg-green-900/50 text-green-300'
      };
      return colors[status];
    };

    const getStatusIcon = (status: string) => {
      const iconMap = {
        'not-started': <AlertCircle size={16} />,
        'in-progress': <Clock size={16} />,
        'under-review': <Eye size={16} />,
        'complete': <CheckCircle size={16} />
      };
      return iconMap[status as keyof typeof iconMap];
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="bg-gray-800 border-b border-gray-700 shadow-lg sticky top-0 z-40 backdrop-blur-sm bg-gray-800/95">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">OfficialEstherReign</h1>
              <p className="text-sm text-gray-400">Welcome, {user?.name}</p>
            </div>
            <div className="flex gap-2 sm:gap-3 items-center w-full sm:w-auto flex-wrap">
              {hasUnsavedChanges && (
                <button
                  onClick={saveAllChanges}
                  disabled={isSaving}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 active:bg-green-800 transition flex items-center gap-2 text-sm touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-subtle"
                >
                  <Save size={18} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
              <button
                onClick={() => setShowSettingsModal(true)}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition flex items-center gap-2 text-sm touch-manipulation"
              >
                <Upload size={18} />
                <span className="hidden sm:inline">Settings</span>
              </button>
              <button
                onClick={() => setCurrentView('public')}
                className="text-purple-400 hover:text-purple-300 transition flex items-center gap-2 text-sm py-2 px-3 sm:px-0"
              >
                <Eye size={18} />
                <span className="hidden sm:inline">View Public</span>
              </button>
              <button
                onClick={handleLogout}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2 text-sm touch-manipulation"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-4 md:p-6 mb-6 md:mb-8 animate-fade-in">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-300">Overall Progress</span>
                <span className="text-xl md:text-2xl font-bold text-purple-400">{progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 md:h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 md:h-4 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
              <div className="text-center p-3 bg-gray-900 rounded-lg hover:scale-105 transition-transform">
                <div className="text-xl md:text-2xl font-bold text-white">{stats.total}</div>
                <div className="text-xs text-gray-400">Total</div>
              </div>
              <div className="text-center p-3 bg-gray-900 rounded-lg hover:scale-105 transition-transform">
                <div className="text-xl md:text-2xl font-bold text-gray-300">{stats.notStarted}</div>
                <div className="text-xs text-gray-400">Not Started</div>
              </div>
              <div className="text-center p-3 bg-yellow-900/30 rounded-lg hover:scale-105 transition-transform">
                <div className="text-xl md:text-2xl font-bold text-yellow-300">{stats.inProgress}</div>
                <div className="text-xs text-yellow-300">In Progress</div>
              </div>
              <div className="text-center p-3 bg-blue-900/30 rounded-lg hover:scale-105 transition-transform">
                <div className="text-xl md:text-2xl font-bold text-blue-300">{stats.underReview}</div>
                <div className="text-xs text-blue-300">Review</div>
              </div>
              <div className="text-center p-3 bg-green-900/30 rounded-lg col-span-2 md:col-span-1 hover:scale-105 transition-transform">
                <div className="text-xl md:text-2xl font-bold text-green-300">{stats.complete}</div>
                <div className="text-xs text-green-300">Complete</div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 active:bg-purple-800 transition flex items-center gap-2 font-semibold w-full sm:w-auto justify-center touch-manipulation shadow-lg hover:scale-105 duration-300"
            >
              <Plus size={20} />
              Add New Video
            </button>
          </div>

          <div className="grid gap-4 md:gap-6 xl:grid-cols-2">
            {localVideos.map((video) => (
              <div
                key={video.id}
                className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg hover:shadow-purple-500/20 transition-all duration-300 p-4 md:p-5 hover:scale-[1.02]"
              >
                <div className="flex justify-between items-start mb-4 gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-purple-400 font-semibold mb-1">Video #{video.id}</div>
                    {editingTitleId === video.id ? (
                      <div className="flex gap-2 items-center mb-2">
                        <input
                          type="text"
                          value={editTitleText}
                          onChange={(e) => setEditTitleText(e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-purple-500 transition-all"
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            updateVideoLocally(video.id, 'title', editTitleText);
                            setEditingTitleId(null);
                          }}
                          className="bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700 transition"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingTitleId(null)}
                          className="bg-gray-700 text-gray-300 px-3 py-1 rounded text-xs hover:bg-gray-600 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <h3
                        className="font-bold text-base md:text-lg text-white mb-2 break-words cursor-pointer hover:text-purple-400 transition-colors"
                        onClick={() => {
                          setEditingTitleId(video.id);
                          setEditTitleText(video.title);
                        }}
                        title="Click to edit title"
                      >
                        {video.title}
                      </h3>
                    )}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 whitespace-nowrap ${getStatusColor(video.status)} transition-all`}>
                    {getStatusIcon(video.status)}
                    <span className="hidden sm:inline">{video.status.replace('-', ' ')}</span>
                  </div>
                </div>

                {user?.role === 'admin' && (
                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Status</label>
                      <select
                        value={video.status}
                        onChange={(e) => updateVideoLocally(video.id, 'status', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-purple-500 transition-all"
                      >
                        <option value="not-started">Not Started</option>
                        <option value="in-progress">In Progress</option>
                        <option value="under-review">Under Review</option>
                        <option value="complete">Complete</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Edit Template</label>
                      <input
                        type="text"
                        value={video.template}
                        onChange={(e) => updateVideoLocally(video.id, 'template', e.target.value)}
                        placeholder="e.g., Animated Lyrics + Emojis"
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-purple-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Google Drive Link</label>
                      <input
                        type="url"
                        value={video.drive_link}
                        onChange={(e) => updateVideoLocally(video.id, 'drive_link', e.target.value)}
                        placeholder="https://drive.google.com/..."
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-purple-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Edit Notes</label>
                      <textarea
                        value={video.notes}
                        onChange={(e) => updateVideoLocally(video.id, 'notes', e.target.value)}
                        placeholder="Creative ideas, special effects..."
                        rows={2}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-purple-500 resize-none transition-all"
                      />
                    </div>
                  </div>
                )}

                {user?.role === 'artist' && (
                  <div className="space-y-2 mb-4">
                    {video.template && (
                      <div className="text-sm">
                        <span className="font-semibold text-gray-300">Style:</span>
                        <span className="text-gray-400 ml-2">{video.template}</span>
                      </div>
                    )}
                    {video.notes && (
                      <div className="text-sm">
                        <span className="font-semibold text-gray-300">Notes:</span>
                        <p className="text-gray-400 mt-1">{video.notes}</p>
                      </div>
                    )}
                    {video.drive_link && (
                      <a
                        href={video.drive_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-purple-900/50 text-purple-300 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-purple-900 active:bg-purple-800 transition touch-manipulation"
                      >
                        View Video →
                      </a>
                    )}
                    {video.status === 'in-progress' && (
                      <button
                        onClick={() => requestReview(video.id)}
                        className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 transition touch-manipulation"
                      >
                        Request Review
                      </button>
                    )}
                  </div>
                )}

                <div className="border-t border-gray-700 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare size={16} className="text-gray-400" />
                    <span className="text-sm font-semibold text-gray-300">
                      Comments ({(video.comments || []).length})
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-2 mb-3 scrollbar-thin">
                    {(video.comments || []).map(comment => (
                      <div key={comment.id} className="bg-gray-900 rounded-lg p-3 animate-fade-in">
                        <div className="flex justify-between items-start mb-1 gap-2">
                          <span className="text-xs font-semibold text-purple-400">{comment.author}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 break-words">{comment.text}</p>
                      </div>
                    ))}
                  </div>

                  {commentingId === video.id ? (
                    <div className="space-y-2 animate-slide-down">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add your comment..."
                        rows={2}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-purple-500 resize-none transition-all"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => addComment(video.id)}
                          className="flex-1 sm:flex-none bg-purple-600 text-white px-4 py-2.5 rounded-lg text-sm hover:bg-purple-700 active:bg-purple-800 transition touch-manipulation font-semibold"
                        >
                          Post
                        </button>
                        <button
                          onClick={() => {
                            setCommentingId(null);
                            setCommentText('');
                          }}
                          className="flex-1 sm:flex-none bg-gray-700 text-gray-300 px-4 py-2.5 rounded-lg text-sm hover:bg-gray-600 active:bg-gray-500 transition touch-manipulation"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setCommentingId(video.id)}
                      className="text-purple-400 text-sm font-semibold hover:text-purple-300 active:text-purple-200 transition py-2 touch-manipulation"
                    >
                      + Add Comment
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {showAddModal && <AddVideoModal />}
        {showSettingsModal && <SettingsModal />}
      </div>
    );

    function AddVideoModal() {
      return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-5 sm:p-6 md:p-8 max-w-md w-full my-8 animate-slide-up">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-6">Add New Video</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Video Title</label>
                <input
                  type="text"
                  value={newVideo.title}
                  onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                  placeholder="Enter video title"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 text-white transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Initial Notes (Optional)</label>
                <textarea
                  value={newVideo.notes}
                  onChange={(e) => setNewVideo({ ...newVideo, notes: e.target.value })}
                  placeholder="Add any initial notes or ideas..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 text-white resize-none transition-all"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={addVideo}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 active:bg-purple-800 transition touch-manipulation"
                >
                  Add Video
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewVideo({ title: '', notes: '' });
                  }}
                  className="flex-1 bg-gray-700 text-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-600 active:bg-gray-500 transition touch-manipulation"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    function SettingsModal() {
      const [localSettings, setLocalSettings] = useState<SiteSettings>(settings || {
        profile_image: '/Estherreign.jpg',
        about_image: '/IMG-20250915-WA0023.jpg',
        about_text: '',
        social_tiktok: '',
        social_facebook: '',
        social_youtube: '',
        social_twitter: '',
        social_instagram: '',
        social_email: '',
        social_other: []
      });
      const [isSavingSettings, setIsSavingSettings] = useState(false);

      const saveSettings = async () => {
        setIsSavingSettings(true);
        try {
          const { error } = await supabase
            .from('site_settings')
            .update({
              ...localSettings,
              updated_at: new Date().toISOString()
            })
            .eq('id', settings?.id || '');

          if (error) throw error;

          await createNotification(
            'artist',
            'Settings Updated',
            'Profile and site settings have been updated by admin.',
            'update',
            0
          );

          setSettings(localSettings);
          setShowSettingsModal(false);
          await loadData();
        } catch (error) {
          console.error('Save settings error:', error);
          alert('Error saving settings. Please try again.');
        }
        setIsSavingSettings(false);
      };

      return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-5 sm:p-6 md:p-8 max-w-2xl w-full my-8 animate-slide-up max-h-[90vh] overflow-y-auto scrollbar-thin">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-6">Site Settings</h3>

            <div className="space-y-4">
              <ImageUpload
                currentImage={localSettings.profile_image}
                onImageChange={(base64) => setLocalSettings({ ...localSettings, profile_image: base64 })}
                label="Profile Picture (Hero Section)"
              />

              <ImageUpload
                currentImage={localSettings.about_image}
                onImageChange={(base64) => setLocalSettings({ ...localSettings, about_image: base64 })}
                label="About Section Image"
              />

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">About Text</label>
                <textarea
                  value={localSettings.about_text}
                  onChange={(e) => setLocalSettings({ ...localSettings, about_text: e.target.value })}
                  placeholder="About Esther Reign..."
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 text-white resize-none transition-all"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">TikTok URL</label>
                  <input
                    type="url"
                    value={localSettings.social_tiktok}
                    onChange={(e) => setLocalSettings({ ...localSettings, social_tiktok: e.target.value })}
                    placeholder="https://tiktok.com/@username"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 text-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Facebook URL</label>
                  <input
                    type="url"
                    value={localSettings.social_facebook}
                    onChange={(e) => setLocalSettings({ ...localSettings, social_facebook: e.target.value })}
                    placeholder="https://facebook.com/username"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 text-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Instagram URL</label>
                  <input
                    type="url"
                    value={localSettings.social_instagram}
                    onChange={(e) => setLocalSettings({ ...localSettings, social_instagram: e.target.value })}
                    placeholder="https://instagram.com/username"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 text-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">YouTube URL</label>
                  <input
                    type="url"
                    value={localSettings.social_youtube}
                    onChange={(e) => setLocalSettings({ ...localSettings, social_youtube: e.target.value })}
                    placeholder="https://youtube.com/@username"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 text-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Twitter URL</label>
                  <input
                    type="url"
                    value={localSettings.social_twitter}
                    onChange={(e) => setLocalSettings({ ...localSettings, social_twitter: e.target.value })}
                    placeholder="https://twitter.com/username"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 text-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={localSettings.social_email}
                    onChange={(e) => setLocalSettings({ ...localSettings, social_email: e.target.value })}
                    placeholder="contact@example.com"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 text-white transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={saveSettings}
                  disabled={isSavingSettings}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 active:bg-purple-800 transition touch-manipulation disabled:opacity-50"
                >
                  {isSavingSettings ? 'Saving...' : 'Save Settings'}
                </button>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 bg-gray-700 text-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-600 active:bg-gray-500 transition touch-manipulation"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400 font-semibold">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentView === 'public' && <PublicPage />}
      {currentView === 'login' && <LoginPage />}
      {currentView === 'dashboard' && user && <Dashboard />}
    </>
  );
};

export default EstherPlatform;
