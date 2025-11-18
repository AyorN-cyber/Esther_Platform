/**
 * Mobile-Specific Layout - Optimized for touch and small screens
 * Features: Bottom navigation, full-screen sections, large touch targets
 */

import { useState, useEffect } from 'react';
import { Home, Video, Mail, User, Menu, X } from 'lucide-react';
import { FanMessageForm } from './FanMessageForm';
import type { Video as VideoType } from '../types';

export const MobileLayout = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { getCompletedVideos, getSettings } = await import('../lib/supabaseData');
    const [videosData, settingsData] = await Promise.all([
      getCompletedVideos(),
      getSettings()
    ]);
    setVideos(videosData);
    setSettings(settingsData);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col" style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
      {/* Mobile Header - Fixed */}
      <header className="fixed top-0 w-full bg-black/95 backdrop-blur-xl border-b border-purple-500/30 z-40 px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="https://res.cloudinary.com/dtynqpjye/image/upload/v1761948158/ESTHER-REIGN-LOGO.-Photoroom_nj506d.png"
              alt="Logo"
              className="h-8 w-auto"
            />
            <span className="text-purple-300 text-xs font-bold">Esther Reign</span>
          </div>
          <button onClick={() => setShowMenu(!showMenu)} className="p-2">
            {showMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {showMenu && (
        <div className="fixed inset-0 bg-black/95 z-50 pt-16">
          <nav className="p-6 space-y-4">
            <button
              onClick={() => { setActiveTab('home'); setShowMenu(false); }}
              className="block w-full text-left py-3 text-lg text-purple-300"
            >
              Home
            </button>
            <button
              onClick={() => { setActiveTab('videos'); setShowMenu(false); }}
              className="block w-full text-left py-3 text-lg text-purple-300"
            >
              Videos
            </button>
            <button
              onClick={() => { setActiveTab('about'); setShowMenu(false); }}
              className="block w-full text-left py-3 text-lg text-purple-300"
            >
              About
            </button>
            <button
              onClick={() => { setActiveTab('contact'); setShowMenu(false); }}
              className="block w-full text-left py-3 text-lg text-purple-300"
            >
              Contact
            </button>
          </nav>
        </div>
      )}

      {/* Mobile Content - Scrollable */}
      <main className="flex-1 pt-14 pb-16 overflow-y-auto" style={{ maxWidth: '100vw' }}>
        {activeTab === 'home' && (
          <div className="p-4 space-y-6">
            <div className="text-center space-y-3">
              <img
                src={settings?.hero_image || "/Estherreign.jpg"}
                alt="Esther Reign"
                className="w-40 h-40 rounded-full mx-auto object-cover border-2 border-purple-500"
              />
              <h1 className="text-3xl font-black">
                <span className="text-white">Esther</span>
                <br />
                <span className="text-purple-400">Reign</span>
              </h1>
              <p className="text-sm text-gray-300 px-4">
                {settings?.hero_description || 'Gospel Singer • Worship Leader'}
              </p>
              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={() => setActiveTab('videos')}
                  className="bg-purple-600 px-6 py-2 rounded-full text-sm font-semibold"
                >
                  Watch Videos
                </button>
                <button
                  onClick={() => setActiveTab('contact')}
                  className="border border-purple-500 px-6 py-2 rounded-full text-sm font-semibold"
                >
                  Contact
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="p-4 space-y-4">
            <h2 className="text-2xl font-black text-center text-purple-400 mb-4">Videos</h2>
            {videos.length === 0 ? (
              <p className="text-center text-gray-400">No videos yet</p>
            ) : (
              <div className="space-y-4">
                {videos.map((video) => (
                  <div key={video.id} className="bg-purple-500/10 rounded-xl overflow-hidden border border-purple-500/20">
                    <div className="aspect-video bg-purple-900/50 flex items-center justify-center">
                      <Video size={48} className="text-purple-400" />
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-sm">{video.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="p-4 space-y-4">
            <h2 className="text-2xl font-black text-center text-purple-400 mb-4">About Me</h2>
            <img
              src={settings?.about_image || "/IMG-20250915-WA0023.jpg"}
              alt="About"
              className="w-full rounded-xl"
            />
            <div className="space-y-3 text-sm text-gray-300">
              {(settings?.about_text || 'Gospel artist with a passion for worship.').split('\n\n').map((p: string, i: number) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="p-4">
            <h2 className="text-2xl font-black text-center text-purple-400 mb-4">Contact</h2>
            <FanMessageForm />
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation - Fixed */}
      <nav className="fixed bottom-0 w-full bg-black/95 backdrop-blur-xl border-t border-purple-500/30 z-40">
        <div className="flex justify-around py-2">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center p-2 min-w-[60px] ${
              activeTab === 'home' ? 'text-purple-400' : 'text-gray-400'
            }`}
          >
            <Home size={20} />
            <span className="text-[10px] mt-1">Home</span>
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex flex-col items-center p-2 min-w-[60px] ${
              activeTab === 'videos' ? 'text-purple-400' : 'text-gray-400'
            }`}
          >
            <Video size={20} />
            <span className="text-[10px] mt-1">Videos</span>
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`flex flex-col items-center p-2 min-w-[60px] ${
              activeTab === 'about' ? 'text-purple-400' : 'text-gray-400'
            }`}
          >
            <User size={20} />
            <span className="text-[10px] mt-1">About</span>
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`flex flex-col items-center p-2 min-w-[60px] ${
              activeTab === 'contact' ? 'text-purple-400' : 'text-gray-400'
            }`}
          >
            <Mail size={20} />
            <span className="text-[10px] mt-1">Contact</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
