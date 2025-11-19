/**
 * Modern Admin Panel - Complete Overhaul
 * Features: Modern design, purple theme matching main site, improved layout
 */

import React, { useState, useEffect } from 'react';
import { X, LogOut, BarChart3, Video as VideoIcon, User, Eye, EyeOff, KeyRound, Settings as SettingsIcon, MessageSquare, Calendar, TrendingUp, Mail, Music, DollarSign, Target, Bell } from 'lucide-react';
import { AdminChatWidget } from './AdminChatWidget';
import { NotificationSystem } from './NotificationSystem';
import { VideoManager } from './VideoManager';
import { DashboardCharts } from './DashboardCharts';
import { Settings } from './Settings';
import { FanMessagesCenter } from './FanMessagesCenter';
import { SongRequestsManager } from './SongRequestsManager';
import { ContentCalendar } from './ContentCalendar';
import { FinancialDashboard } from './FinancialDashboard';
import { GoalsTracker } from './GoalsTracker';
import AdvancedAnalytics from './AdvancedAnalytics';
import PurpleWebGLBackground from './PurpleWebGLBackground';
import { PWAInstallButton } from './PWAInstallButton';
import { supabase } from '../lib/supabase';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';
import { notificationService } from '../lib/notificationService';
import type { Video, User as UserType, Analytics } from '../types';

interface AdminPanelProps {
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'videos' | 'analytics' | 'messages' | 'songs' | 'calendar' | 'financial' | 'goals' | 'settings'>('dashboard');
  const [videos, setVideos] = useState<Video[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    total_visitors: 0,
    page_visits: {},
    artist_logins: 0,
    last_updated: new Date().toISOString()
  });
  const [chartData, setChartData] = useState({
    videoUpdates: [] as Array<{ date: string; value: number }>,
    loginFrequency: [] as Array<{ date: string; value: number }>,
    siteVisits: [] as Array<{ date: string; value: number }>
  });

  // Real-time notifications
  const { unreadCount, updateUnreadCount } = useRealtimeNotifications(currentUser);

  useEffect(() => {
    document.body.classList.add('admin-panel-active');
    return () => {
      document.body.classList.remove('admin-panel-active');
    };
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        // Try to restore Supabase auth session first
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          const email = data.user.email || '';
          let profile: UserType | null = null;

          if (email) {
            const { data: dbUser } = await supabase
              .from('users')
              .select('*')
              .eq('email', email)
              .maybeSingle();

            if (dbUser) {
              profile = {
                id: dbUser.id,
                email: dbUser.email,
                role: dbUser.role,
                phone: dbUser.phone || '',
                name: dbUser.full_name,
                profilePicture: localStorage.getItem('admin_profile_picture') || undefined,
              };
            }
          }

          const fallbackName = data.user.email?.split('@')[0] || 'Admin';
          const user: UserType = profile || {
            id: data.user.id,
            email: email,
            role: 'artist',
            phone: '',
            name: fallbackName,
            profilePicture: localStorage.getItem('admin_profile_picture') || undefined,
          };

          setCurrentUser(user);
          setIsLoggedIn(true);
          localStorage.setItem('admin_session', JSON.stringify({ user }));
        } else {
          // Fallback to legacy local session if it exists
          const savedSession = localStorage.getItem('admin_session');
          if (savedSession) {
            const session = JSON.parse(savedSession);
            const profilePic = localStorage.getItem('admin_profile_picture');
            if (profilePic && !session.user.profilePicture) {
              session.user.profilePicture = profilePic;
            }
            setCurrentUser(session.user);
            setIsLoggedIn(true);
          }
        }
      } catch (error) {
        console.error('Error restoring admin session:', error);
      } finally {
        loadData();
      }
    };

    init();
  }, []);

  const loadData = async () => {
    const { getVideos, getSettings } = await import('../lib/supabaseData');
    const [videosData, settingsData] = await Promise.all([
      getVideos(),
      getSettings()
    ]);
    setVideos(videosData);
    setAnalytics({
      total_visitors: (settingsData as any)?.total_visits || 0,
      page_visits: { home: (settingsData as any)?.total_visits || 0 },
      artist_logins: (settingsData as any)?.artist_logins || 0,
      last_updated: new Date().toISOString()
    });

    // Generate chart data (last 7 days)
    const generateChartData = (baseValue: number, variance: number = 2) => {
      const days = 7;
      const data = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const value = Math.max(0, baseValue + Math.floor(Math.random() * variance * 2 - variance));
        data.push({
          date: date.toISOString(),
          value: value
        });
      }
      return data;
    };

    const completedVideos = videosData.filter(v => v.status === 'completed').length;
    setChartData({
      videoUpdates: generateChartData(Math.floor(completedVideos / 7), 1),
      loginFrequency: generateChartData(Math.floor((settingsData as any)?.artist_logins / 7 || 1), 1),
      siteVisits: generateChartData(Math.floor(((settingsData as any)?.total_visits || 0) / 7), 3)
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        alert('Invalid email or password. Please check your credentials.');
        return;
      }

      // Look up extended profile in users table
      let userProfile: any = null;
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (profile) {
        userProfile = profile;
      }

      const user: UserType = {
        id: userProfile?.id || data.user.id,
        email: email,
        role: (userProfile?.role as any) || 'artist',
        phone: userProfile?.phone || '',
        name: userProfile?.full_name || (email.split('@')[0] || 'Admin'),
        profilePicture: localStorage.getItem('admin_profile_picture') || undefined,
      };

      setCurrentUser(user);
      setIsLoggedIn(true);
      localStorage.setItem('admin_session', JSON.stringify({ user }));

      // Notify other users about login
      notificationService.notifyUserLogin(user.name, user.role);

      const { getSettings, updateSettings } = await import('../lib/supabaseData');
      const settings = await getSettings();
      const currentLogins = (settings as any)?.artist_logins || 0;
      await updateSettings({ artist_logins: currentLogins + 1 });
    } catch (err) {
      console.error('Error during admin login:', err);
      alert('Login failed due to a server error. Please try again.');
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validEmails = ['artist@estherreign.com', 'editor@estherreign.com'];
    
    if (validEmails.includes(resetEmail)) {
      setResetSent(true);
      setTimeout(() => {
        alert(`Password reset instructions have been sent to ${resetEmail}.\n\nFor demo purposes:\n- Artist password: artist2024\n- Editor password: editor2024`);
        setShowForgotPassword(false);
        setResetSent(false);
        setResetEmail('');
      }, 1500);
    } else {
      alert('Email not found. Please check your email address.');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out from Supabase:', error);
    }
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('admin_session');
  };

  // Modern Login Screen
  if (!isLoggedIn) {
    return (
      <div className="admin-panel fixed inset-0 bg-black flex items-center justify-center z-50 overflow-y-auto p-4">
        <PurpleWebGLBackground />
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-3 bg-purple-500/10 hover:bg-purple-500/20 rounded-xl transition-all border border-purple-500/20 backdrop-blur-sm z-10"
        >
          <X size={24} className="text-white" />
        </button>

        <div className="max-w-lg w-full my-auto relative z-10">
          <div className="bg-black/90 backdrop-blur-2xl rounded-3xl p-6 md:p-8 border border-purple-500/30 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/50">
                <User size={48} className="text-white" />
              </div>
              <h2 className="text-4xl font-black text-white mb-3">
                Admin Panel
              </h2>
              <p className="text-purple-200">Enter your credentials to access the admin dashboard</p>
            </div>

            {!showForgotPassword ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-purple-200 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-purple-500/10 border border-purple-500/30 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-white placeholder-purple-400"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-purple-200 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-purple-500/10 border border-purple-500/30 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-white placeholder-purple-400"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-purple-300 hover:text-purple-200 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-purple-300 hover:text-purple-200 transition-colors flex items-center gap-1"
                  >
                    <KeyRound size={16} />
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all hover:shadow-lg hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Sign In
                </button>

                {/* PWA Install Button */}
                <PWAInstallButton />
              </form>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-5">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <KeyRound size={32} className="text-purple-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Reset Password</h3>
                  <p className="text-sm text-purple-200">Enter your email to receive reset instructions</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-purple-200 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-purple-500/10 border border-purple-500/30 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-white placeholder-purple-400"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetEmail('');
                    }}
                    className="flex-1 bg-purple-500/10 border border-purple-500/30 text-purple-200 px-6 py-3 rounded-xl font-semibold transition-all hover:bg-purple-500/20"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={resetSent}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resetSent ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main Admin Panel
  return (
    <div className="admin-panel fixed inset-0 bg-black overflow-hidden z-50 flex flex-col">
      {/* Background - Fixed at z-0 so content stays on top */}
      <div className="fixed inset-0 z-0">
        <PurpleWebGLBackground />
        {/* Dark overlay to reduce background intensity */}
        <div className="absolute inset-0 bg-black/60 z-[1]"></div>
      </div>

      {/* Top Navigation Bar */}
      <nav className="flex-shrink-0 bg-black/95 backdrop-blur-xl border-b border-purple-500/30 relative z-[90]" style={{ zIndex: 90, position: 'relative' }}>
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {currentUser?.profilePicture ? (
              <img 
                src={currentUser.profilePicture} 
                alt="Profile" 
                className="w-12 h-12 rounded-xl object-cover shadow-lg shadow-purple-500/30"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <span className="text-white font-black text-xl">{currentUser?.name?.charAt(0)}</span>
              </div>
            )}
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white">Esther Reign Admin</h1>
              <p className="text-sm text-purple-300">{currentUser?.name} • {currentUser?.role === 'artist' ? 'Artist' : 'Editor'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationSystem currentUser={currentUser} externalUnreadCount={unreadCount} />
            <button
              onClick={onClose}
              className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 rounded-xl transition-all text-purple-200 border border-purple-500/20 flex items-center gap-2"
            >
              <Eye size={18} />
              <span className="hidden md:inline">View Site</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all text-red-300 border border-red-500/20 flex items-center gap-2"
            >
              <LogOut size={18} />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area - Higher z-index to stay above background */}
      <div className="flex-1 overflow-hidden flex relative z-[50]">
        {/* Sidebar Navigation */}
        <aside className="hidden lg:block w-64 bg-[#2d1b4e]/90 backdrop-blur-xl border-r border-purple-500/20 overflow-y-auto relative z-[40]">
          <div className="p-4 space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'videos', label: 'Videos', icon: VideoIcon },
              { id: 'messages', label: 'Messages', icon: Mail },
              { id: 'songs', label: 'Song Requests', icon: Music },
              { id: 'calendar', label: 'Calendar', icon: Calendar },
              { id: 'financial', label: 'Financial', icon: DollarSign },
              { id: 'goals', label: 'Goals', icon: Target },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'settings', label: 'Settings', icon: SettingsIcon }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30'
                      : 'text-purple-200 hover:bg-purple-500/10 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto relative z-[30]">
          <div className="container mx-auto px-4 md:px-6 py-6 relative z-[30]">
            {/* Mobile Tab Navigation */}
            <div className="lg:hidden flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { id: 'videos', label: 'Videos', icon: VideoIcon },
                { id: 'messages', label: 'Messages', icon: Mail },
                { id: 'songs', label: 'Songs', icon: Music },
                { id: 'calendar', label: 'Calendar', icon: Calendar },
                { id: 'financial', label: 'Financial', icon: DollarSign },
                { id: 'goals', label: 'Goals', icon: Target },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                { id: 'settings', label: 'Settings', icon: SettingsIcon }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                        : 'bg-purple-500/10 text-purple-200 hover:bg-purple-500/20'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <DashboardCharts
                  videoUpdates={chartData.videoUpdates}
                  loginFrequency={chartData.loginFrequency}
                  siteVisits={chartData.siteVisits}
                />

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 bg-black/40">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-purple-500/30 rounded-xl flex items-center justify-center">
                        <VideoIcon size={24} className="text-purple-400" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-black text-white text-shadow-strong mb-1">{videos.length}</h3>
                    <p className="text-purple-200 text-shadow text-sm font-semibold">Total Videos</p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30 bg-black/40">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-500/30 rounded-xl flex items-center justify-center">
                        <TrendingUp size={24} className="text-blue-400" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-black text-white text-shadow-strong mb-1">{analytics.total_visitors}</h3>
                    <p className="text-blue-200 text-shadow text-sm font-semibold">Total Visitors</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30 bg-black/40">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-green-500/30 rounded-xl flex items-center justify-center">
                        <MessageSquare size={24} className="text-green-400" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-black text-white text-shadow-strong mb-1">{videos.filter(v => v.status === 'completed').length}</h3>
                    <p className="text-green-200 text-shadow text-sm font-semibold">Published</p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30 bg-black/40">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                        <User size={24} className="text-orange-400" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-black text-white text-shadow-strong mb-1">{analytics.artist_logins}</h3>
                    <p className="text-orange-200 text-shadow text-sm font-semibold">Admin Logins</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30 bg-black/40">
                  <h2 className="text-2xl font-black text-white text-shadow-strong mb-2">Welcome back, {currentUser?.name}! 👋</h2>
                  <p className="text-purple-100 text-shadow mb-6 font-medium">Here's what's happening with your platform today.</p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
                      <p className="text-purple-300 text-sm mb-1">Active Videos</p>
                      <p className="text-2xl font-bold text-white">{videos.filter(v => v.status === 'completed').length}</p>
                    </div>
                    <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
                      <p className="text-purple-300 text-sm mb-1">Pending</p>
                      <p className="text-2xl font-bold text-white">{videos.filter(v => v.status === 'pending').length}</p>
                    </div>
                    <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
                      <p className="text-purple-300 text-sm mb-1">Total Views</p>
                      <p className="text-2xl font-bold text-white">{analytics.total_visitors}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'videos' && (
              <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
                <VideoManager />
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
                <FanMessagesCenter />
              </div>
            )}

            {activeTab === 'songs' && (
              <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
                <SongRequestsManager />
              </div>
            )}

            {activeTab === 'calendar' && (
              <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
                <ContentCalendar />
              </div>
            )}

            {activeTab === 'financial' && (
              <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
                <FinancialDashboard />
              </div>
            )}

            {activeTab === 'goals' && (
              <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
                <GoalsTracker />
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
                <AdvancedAnalytics />
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
                <Settings />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Chat Widget - Fixed Position */}
      {currentUser && <AdminChatWidget currentUser={currentUser} videos={videos} />}
    </div>
  );
};

export default AdminPanel;

