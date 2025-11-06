/**
 * Modern Admin Panel - Rebuilt from scratch
 * Inspired by premium finance website design
 * Features: Dark theme, purple/blue gradients, clean cards, smooth animations
 */

import React, { useState, useEffect } from 'react';
import { X, LogOut, BarChart3, Video as VideoIcon, User, Eye, Settings as SettingsIcon, Key, MessageSquare, Calendar, TrendingUp, Mail, Music, DollarSign, Target, Package } from 'lucide-react';
import { ModernChat } from './ModernChat';
import { VideoManager } from './VideoManager';
import { Settings } from './Settings';
import { FanMessagesCenter } from './FanMessagesCenter';
import { SongRequestsManager } from './SongRequestsManager';
import { ContentCalendar } from './ContentCalendar';
import { FinancialDashboard } from './FinancialDashboard';
import { GoalsTracker } from './GoalsTracker';
import AdvancedAnalytics from './AdvancedAnalytics';
import DarkLuxuryBackground from './DarkLuxuryBackground';
import type { Video, User as UserType, Analytics } from '../types';

interface AdminPanelProps {
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'videos' | 'analytics' | 'messages' | 'songs' | 'calendar' | 'financial' | 'goals' | 'settings'>('dashboard');
  const [videos, setVideos] = useState<Video[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    total_visitors: 0,
    page_visits: {},
    artist_logins: 0,
    last_updated: new Date().toISOString()
  });

  useEffect(() => {
    const savedSession = localStorage.getItem('admin_session');
    if (savedSession) {
      const session = JSON.parse(savedSession);
      setCurrentUser(session.user);
      setIsLoggedIn(true);
    }
    loadData();
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
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email === 'artist@estherreign.com' && password === 'artist2024') {
      const user: UserType = {
        id: '1',
        email,
        role: 'artist',
        phone: '+234 818 019 4269',
        name: 'Esther Reign'
      };
      
      setCurrentUser(user);
      setIsLoggedIn(true);
      localStorage.setItem('admin_session', JSON.stringify({ user }));
      
      const { getSettings, updateSettings } = await import('../lib/supabaseData');
      const settings = await getSettings();
      const currentLogins = (settings as any)?.artist_logins || 0;
      await updateSettings({ artist_logins: currentLogins + 1 });
    } else {
      alert('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('admin_session');
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 flex items-center justify-center z-50">
        <DarkLuxuryBackground />
        
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 backdrop-blur-sm"
        >
          <X size={24} className="text-white" />
        </button>

        <div className="max-w-md w-full mx-4 relative z-10">
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-2xl rounded-3xl p-8 border border-purple-500/20 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/50">
                <User size={40} className="text-white" />
              </div>
              <h2 className="text-3xl font-black text-white mb-2">
                Admin Login
              </h2>
              <p className="text-gray-400">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-purple-500/20 rounded-xl focus:outline-none focus:border-purple-500 transition-all text-white placeholder-gray-500"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-purple-500/20 rounded-xl focus:outline-none focus:border-purple-500 transition-all text-white placeholder-gray-500"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-bold transition-all hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Main Admin Panel
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 overflow-y-auto z-50">
      <DarkLuxuryBackground />

      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-xl border-b border-purple-500/20 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-lg">{currentUser?.name?.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-white">Esther Reign Admin</h1>
              <p className="text-sm text-gray-400">{currentUser?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-white border border-white/10 flex items-center gap-2"
            >
              <Eye size={18} />
              <span className="hidden md:inline">View Site</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all text-red-400 border border-red-500/20 flex items-center gap-2"
            >
              <LogOut size={18} />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 pt-24 pb-12">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
          >
            <BarChart3 size={20} />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'videos'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
          >
            <VideoIcon size={20} />
            Videos
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'messages'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
          >
            <Mail size={20} />
            Messages
          </button>
          <button
            onClick={() => setActiveTab('songs')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'songs'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
          >
            <Music size={20} />
            Song Requests
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
          >
            <Calendar size={20} />
            Calendar
          </button>
          <button
            onClick={() => setActiveTab('financial')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'financial'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
          >
            <DollarSign size={20} />
            Financial
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'goals'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
          >
            <Target size={20} />
            Goals
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
          >
            <TrendingUp size={20} />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
          >
            <SettingsIcon size={20} />
            Settings
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <VideoIcon size={24} className="text-purple-400" />
                  </div>
                  <span className="text-2xl">📹</span>
                </div>
                <h3 className="text-3xl font-black text-white mb-1">{videos.length}</h3>
                <p className="text-gray-400 text-sm">Total Videos</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <TrendingUp size={24} className="text-blue-400" />
                  </div>
                  <span className="text-2xl">👥</span>
                </div>
                <h3 className="text-3xl font-black text-white mb-1">{analytics.total_visitors}</h3>
                <p className="text-gray-400 text-sm">Total Visitors</p>
              </div>

              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl rounded-2xl p-6 border border-green-500/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <MessageSquare size={24} className="text-green-400" />
                  </div>
                  <span className="text-2xl">✅</span>
                </div>
                <h3 className="text-3xl font-black text-white mb-1">{videos.filter(v => v.status === 'completed').length}</h3>
                <p className="text-gray-400 text-sm">Published</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <Key size={24} className="text-orange-400" />
                  </div>
                  <span className="text-2xl">🔐</span>
                </div>
                <h3 className="text-3xl font-black text-white mb-1">{analytics.artist_logins}</h3>
                <p className="text-gray-400 text-sm">Admin Logins</p>
              </div>
            </div>

            {/* Welcome Card */}
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/20">
              <h2 className="text-2xl font-black text-white mb-2">Welcome back, {currentUser?.name}! 👋</h2>
              <p className="text-gray-400 mb-6">Here's what's happening with your platform today.</p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-gray-400 text-sm mb-1">Active Videos</p>
                  <p className="text-2xl font-bold text-white">{videos.filter(v => v.status === 'completed').length}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-gray-400 text-sm mb-1">Pending</p>
                  <p className="text-2xl font-bold text-white">{videos.filter(v => v.status === 'pending').length}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-gray-400 text-sm mb-1">Total Views</p>
                  <p className="text-2xl font-bold text-white">{analytics.total_visitors}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div>
            <VideoManager />
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div>
            <FanMessagesCenter />
          </div>
        )}

        {/* Song Requests Tab */}
        {activeTab === 'songs' && (
          <div>
            <SongRequestsManager />
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div>
            <ContentCalendar />
          </div>
        )}

        {/* Financial Tab */}
        {activeTab === 'financial' && (
          <div>
            <FinancialDashboard />
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div>
            <GoalsTracker />
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <AdvancedAnalytics />
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            <Settings />
          </div>
        )}
      </div>

      {/* Chat Widget */}
      {currentUser && <ModernChat currentUser={currentUser} />}
    </div>
  );
};

export default AdminPanel;
