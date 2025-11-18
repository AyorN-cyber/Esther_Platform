/**
 * Esther Reign Platform - Rebuilt with Dark Purple Gradient Theme
 * Features: WebGL background, modern design, video hover previews
 */

import { useState, useEffect, lazy, Suspense } from 'react';
import { Menu, X, Instagram, Youtube, Mail, Play, ChevronRight, Sparkles } from 'lucide-react';
import { FaTiktok, FaFacebook } from 'react-icons/fa';
import { Loader } from './components/Loader';
import PurpleWebGLBackground from './components/PurpleWebGLBackground';
import { FanMessageForm } from './components/FanMessageForm';
import type { Video } from './types';

// Lazy load AdminPanel
const AdminPanel = lazy(() => import('./components/AdminPanel'));

const EstherPlatform = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [loading, setLoading] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
  const [logoTapCount, setLogoTapCount] = useState(0);
  const [lastLogoTap, setLastLogoTap] = useState(0);

  useEffect(() => {
    loadData();
    setTimeout(() => setLoading(false), 400);

    // Subscribe to real-time changes
    import('./lib/supabaseData').then(({ subscribeToVideos, subscribeToSettings, trackVisit }) => {
      trackVisit();
      
      const unsubVideos = subscribeToVideos((videos) => {
        setVideos(videos.filter(v => v.status === 'completed'));
      });
      
      const unsubSettings = subscribeToSettings((settings) => {
        setSettings(settings);
      });

      return () => {
        unsubVideos();
        unsubSettings();
      };
    });
  }, []);

  const loadData = async () => {
    const { getCompletedVideos, getSettings } = await import('./lib/supabaseData');
    const [videosData, settingsData] = await Promise.all([
      getCompletedVideos(),
      getSettings()
    ]);
    setVideos(videosData);
    setSettings(settingsData);
  };

  const handleLogoTap = () => {
    const now = Date.now();
    if (now - lastLogoTap < 1000) {
      const newCount = logoTapCount + 1;
      setLogoTapCount(newCount);
      if (newCount >= 3) {
        setShowAdmin(true);
        setLogoTapCount(0);
        window.location.hash = '#admin';
      }
    } else {
      setLogoTapCount(1);
    }
    setLastLogoTap(now);
  };

  const getVideoThumbnail = (url: string): string => {
    if (!url) return '';
    
    if (url.includes('cloudinary.com')) {
      if (url.includes('/upload/')) {
        return url.replace('/upload/', '/upload/so_0,w_640,h_360,c_fill,f_jpg/');
      }
      if (url.includes('/video/')) {
        return url.replace('/video/', '/image/').replace(/\.(mp4|mov|avi|webm|mkv)$/i, '.jpg');
      }
      return url.replace('/upload/', '/upload/so_0,f_jpg/');
    }
    
    let videoId = '';
    const watchMatch = url.match(/[?&]v=([^&]+)/);
    if (watchMatch) videoId = watchMatch[1];
    
    const shortMatch = url.match(/youtu\.be\/([^?]+)/);
    if (shortMatch) videoId = shortMatch[1];
    
    const embedMatch = url.match(/embed\/([^?]+)/);
    if (embedMatch) videoId = embedMatch[1];
    
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    
    return '';
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'videos', 'contact'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (window.location.hash === '#admin') {
      setShowAdmin(true);
    }
  }, []);

  if (showAdmin) {
    return (
      <Suspense fallback={<Loader />}>
        <AdminPanel onClose={() => {
          setShowAdmin(false);
          window.location.hash = '';
          loadData();
        }} />
      </Suspense>
    );
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="bg-black text-white min-h-screen relative overflow-hidden">
      {/* WebGL Background */}
      <PurpleWebGLBackground />

      {/* Top Navigation */}
      <nav className="fixed top-0 w-full backdrop-blur-xl bg-black/90 border-b border-purple-500/30 z-[100]">
        <div className="container mx-auto px-4 md:px-6 lg:px-12">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo - Triple tap to access admin */}
            <div 
              className="flex items-center gap-1 md:gap-2 flex-shrink-0 cursor-pointer max-w-[60%] md:max-w-none"
              onClick={handleLogoTap}
              title="Triple tap for admin access"
            >
              <img
                src="https://res.cloudinary.com/dtynqpjye/image/upload/v1761948158/ESTHER-REIGN-LOGO.-Photoroom_nj506d.png"
                alt="Esther Reign Logo"
                className="h-8 md:h-12 lg:h-14 w-auto flex-shrink-0"
                loading="eager"
              />
              <span className="text-[8px] sm:text-[9px] md:text-xs lg:text-sm font-bold text-purple-300 truncate">
                @officialEstherReign
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
              {[
                { id: 'home', label: 'Home' },
                { id: 'about', label: 'About' },
                { id: 'videos', label: 'Videos' },
                { id: 'contact', label: 'Contact' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-xs md:text-sm font-medium transition-all relative group ${
                    activeSection === item.id
                      ? 'text-purple-300'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item.label}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-purple-600 transition-all ${
                    activeSection === item.id ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}></span>
                </button>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden backdrop-blur-xl bg-black/95 border-t border-purple-500/30">
            <nav className="container mx-auto px-6 py-6 space-y-4">
              {[
                { id: 'home', label: 'Home' },
                { id: 'about', label: 'About' },
                { id: 'videos', label: 'Videos' },
                { id: 'contact', label: 'Contact' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left py-2 text-gray-300 hover:text-purple-300 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center relative overflow-hidden pt-16 md:pt-20 bg-black" style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
        <div className="container mx-auto px-3 md:px-6 lg:px-12 relative z-10 max-w-7xl" style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
          <div className="grid lg:grid-cols-2 gap-4 md:gap-8 lg:gap-12 items-center">
            
            {/* Image - Mobile First (shows at top on mobile) */}
            <div className="relative w-[160px] sm:w-[200px] md:w-[280px] mx-auto lg:max-w-none lg:order-2">
              {/* Glow effect around image */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/50 via-purple-600/40 to-purple-700/30 rounded-full lg:rounded-3xl blur-2xl md:blur-3xl opacity-60 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/40 to-purple-600/30 rounded-full lg:rounded-3xl blur-xl md:blur-2xl opacity-50"></div>
              
              {/* Image with frame */}
              <div className="relative border border-purple-500/40 md:border-2 shadow-2xl rounded-full lg:rounded-3xl overflow-hidden aspect-square lg:aspect-auto" style={{
                boxShadow: '0 0 30px rgba(168, 85, 247, 0.5), 0 0 60px rgba(168, 85, 247, 0.3)'
              }}>
                <img
                  src={settings?.hero_image || "/Estherreign.jpg"}
                  alt="Esther Reign"
                  className="w-full h-full object-cover"
                  style={{
                    filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.6))'
                  }}
                  loading="eager"
                />
              </div>
            </div>

            {/* Text Content */}
            <div className="space-y-2 md:space-y-4 text-center lg:text-left lg:order-1 px-2">
              <div className="inline-flex items-center gap-1 px-2 py-1 md:px-2.5 md:py-1.5 bg-purple-500/20 rounded-full mx-auto lg:mx-0 border border-purple-500/30">
                <Sparkles size={10} className="text-purple-300 animate-pulse flex-shrink-0" />
                <span className="text-[9px] md:text-[10px] text-purple-200 font-medium whitespace-nowrap">Gospel Singer • Worship Leader</span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight">
                <span className="text-white">
                  Esther
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                  Reign
                </span>
              </h1>

              <p className="text-[11px] sm:text-xs md:text-sm lg:text-base text-gray-200 leading-relaxed max-w-xl mx-auto lg:mx-0">
                {settings?.hero_description || 'Lifting voices in worship through powerful gospel music. Experience the presence of God through every note.'}
              </p>

              <div className="flex flex-col sm:flex-row gap-1.5 md:gap-2 justify-center lg:justify-start w-full max-w-[260px] sm:max-w-sm mx-auto lg:max-w-none" style={{ maxWidth: window.innerWidth <= 640 ? '90vw' : undefined }}>
                <button
                  onClick={() => scrollToSection('videos')}
                  className="group bg-gradient-to-r from-purple-600 to-purple-700 px-2.5 py-1 md:px-4 md:py-2 rounded-full font-semibold flex items-center justify-center gap-0.5 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all text-[9px] md:text-xs whitespace-nowrap flex-1 sm:flex-initial"
                  style={{ fontSize: window.innerWidth <= 640 ? '9px' : undefined, padding: window.innerWidth <= 640 ? '4px 10px' : undefined, maxWidth: '100%' }}
                >
                  Watch Videos
                  <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform flex-shrink-0 md:w-3.5 md:h-3.5" />
                </button>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="px-2.5 py-1 md:px-4 md:py-2 rounded-full font-semibold border border-purple-500/30 text-purple-300 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all text-[9px] md:text-xs whitespace-nowrap flex-1 sm:flex-initial"
                  style={{ fontSize: window.innerWidth <= 640 ? '9px' : undefined, padding: window.innerWidth <= 640 ? '4px 10px' : undefined, maxWidth: '100%' }}
                >
                  Get In Touch
                </button>
              </div>

              {/* Social Links */}
              <div className="flex gap-2 md:gap-2.5 pt-2 md:pt-3 pb-3 md:pb-5 lg:pb-0 justify-center lg:justify-start">
                <a href={settings?.social_links?.instagram || "https://instagram.com/estherreign"} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 md:w-9 md:h-9 bg-purple-500/20 border border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/30 rounded-full flex items-center justify-center text-purple-300 transition-all flex-shrink-0">
                  <Instagram size={14} className="md:w-4 md:h-4" />
                </a>
                <a href={settings?.social_links?.youtube || "https://youtube.com/@estherreign"} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 md:w-9 md:h-9 bg-purple-500/20 border border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/30 rounded-full flex items-center justify-center text-purple-300 transition-all flex-shrink-0">
                  <Youtube size={14} className="md:w-4 md:h-4" />
                </a>
                <a href={settings?.social_links?.tiktok || "https://tiktok.com/@estherreign"} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 md:w-9 md:h-9 bg-purple-500/20 border border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/30 rounded-full flex items-center justify-center text-purple-300 transition-all flex-shrink-0">
                  <FaTiktok size={14} className="md:w-4 md:h-4" />
                </a>
                <a href={settings?.social_links?.facebook || "https://facebook.com/estherreign"} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 md:w-9 md:h-9 bg-purple-500/20 border border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/30 rounded-full flex items-center justify-center text-purple-300 transition-all flex-shrink-0">
                  <FaFacebook size={14} className="md:w-4 md:h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 md:py-20 lg:py-28 relative overflow-hidden bg-black">
        <div className="container mx-auto px-3 md:px-6 lg:px-12 relative z-10 max-w-6xl">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4">
                <span className="bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
                  About Me
                </span>
              </h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-purple-600/30 rounded-3xl blur-2xl opacity-30"></div>
                <div className="relative border-4 border-white/20 shadow-2xl rounded-3xl overflow-hidden">
                  <img
                    src={settings?.about_image || "/IMG-20250915-WA0023.jpg"}
                    alt="About Esther"
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="space-y-4 md:space-y-6">
                {(settings?.about_text || 'I am an emerging gospel artist with a deep passion for worship and praise. Through powerful cover songs, I aim to create an atmosphere where people can encounter God\'s presence.\n\nEvery song I sing is a testimony of God\'s faithfulness and love. My mission is to use my voice as an instrument of worship, touching hearts and transforming lives through gospel music.\n\nJoin me on this journey as I share my gift with the world, one song at a time, bringing glory to God through music.').split('\n\n').map((paragraph: string, index: number) => (
                  <p key={index} className="text-base md:text-lg text-gray-200 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Videos Section */}
      <section id="videos" className="py-12 md:py-20 lg:py-28 relative overflow-hidden bg-black">
        <div className="container mx-auto px-3 md:px-6 lg:px-12 relative z-10 max-w-7xl">
          <div className="text-center mb-8 md:mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full mb-4">
              <Play size={12} className="text-purple-300 animate-pulse flex-shrink-0" />
              <span className="text-[10px] md:text-xs text-purple-200 font-medium">Watch</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 md:mb-5">
              <span className="bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
                Videos
              </span>
            </h2>
            <p className="text-gray-200 max-w-2xl mx-auto text-xs md:text-sm lg:text-base px-3">
              Experience powerful gospel worship that will uplift your spirit
            </p>
          </div>

          {videos.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Play size={48} className="text-purple-300" />
              </div>
              <p className="text-gray-300 text-xl">New videos coming soon...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 max-w-7xl mx-auto">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="group relative overflow-hidden rounded-2xl bg-purple-500/10 backdrop-blur-xl border border-purple-500/20 hover:border-purple-500/40 transition-all"
                >
                  <div 
                    className="aspect-video bg-gradient-to-br from-purple-900/50 to-purple-800/50 flex items-center justify-center relative overflow-hidden cursor-pointer"
                    onClick={() => setPlayingVideo(video)}
                    onMouseEnter={(e) => {
                      const videoEl = e.currentTarget.querySelector('video');
                      if (videoEl && video.video_link && !video.video_link.includes('youtube.com') && !video.video_link.includes('youtu.be')) {
                        videoEl.currentTime = 0;
                        videoEl.play().catch(() => {});
                      }
                    }}
                    onMouseLeave={(e) => {
                      const videoEl = e.currentTarget.querySelector('video');
                      if (videoEl) {
                        videoEl.pause();
                        videoEl.currentTime = 0;
                      }
                    }}
                  >
                    <img
                      src={video.thumbnail_url || getVideoThumbnail(video.video_link || '')}
                      alt={video.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="640" height="360"%3E%3Crect fill="%23374151" width="640" height="360"/%3E%3Ctext fill="%239CA3AF" font-family="Arial" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3E' + encodeURIComponent(video.title) + '%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    
                    {video.video_link && !video.video_link.includes('youtube.com') && !video.video_link.includes('youtu.be') && (
                      <video
                        src={video.video_link}
                        className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20"
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-center justify-center transition-all duration-300 group-hover:bg-black/30">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlayingVideo(video);
                        }}
                        className="w-20 h-20 bg-purple-600/80 hover:bg-purple-600 rounded-full flex items-center justify-center transform transition-all shadow-lg group-hover:scale-125"
                      >
                        <Play size={32} className="text-white ml-1" fill="currentColor" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6 bg-purple-500/5">
                    <h3 className="text-lg font-bold mb-2 line-clamp-2 text-white">{video.title}</h3>
                    {video.template_type && (
                      <p className="text-sm text-purple-300">{video.template_type}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 md:py-20 lg:py-28 relative overflow-hidden bg-black">
        <div className="container mx-auto px-3 md:px-6 lg:px-12 relative z-10 max-w-4xl">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 md:mb-16">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full mb-4">
                <Mail size={12} className="text-purple-300 animate-pulse flex-shrink-0" />
                <span className="text-[10px] md:text-xs text-purple-200 font-medium">Contact</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 md:mb-5">
                <span className="bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
                  Let's Connect
                </span>
              </h2>
              <p className="text-gray-200 max-w-2xl mx-auto text-xs md:text-sm lg:text-base px-3">
                For bookings, collaborations, or inquiries
              </p>
            </div>

            <div className="mb-8 md:mb-12">
              <FanMessageForm />
            </div>

            {/* Social Media Links */}
            <div className="flex justify-center gap-2.5 md:gap-3">
              <a href={settings?.social_links?.instagram || "https://instagram.com/estherreign"} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 md:w-10 md:h-10 bg-purple-500/20 border border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/30 rounded-full flex items-center justify-center text-purple-300 transition-all flex-shrink-0">
                <Instagram size={16} className="md:w-[18px] md:h-[18px]" />
              </a>
              <a href={settings?.social_links?.youtube || "https://youtube.com/@estherreign"} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 md:w-10 md:h-10 bg-purple-500/20 border border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/30 rounded-full flex items-center justify-center text-purple-300 transition-all flex-shrink-0">
                <Youtube size={16} className="md:w-[18px] md:h-[18px]" />
              </a>
              <a href={settings?.social_links?.tiktok || "https://tiktok.com/@estherreign"} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 md:w-10 md:h-10 bg-purple-500/20 border border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/30 rounded-full flex items-center justify-center text-purple-300 transition-all flex-shrink-0">
                <FaTiktok size={16} className="md:w-[18px] md:h-[18px]" />
              </a>
              <a href={settings?.social_links?.facebook || "https://facebook.com/estherreign"} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 md:w-10 md:h-10 bg-purple-500/20 border border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/30 rounded-full flex items-center justify-center text-purple-300 transition-all flex-shrink-0">
                <FaFacebook size={16} className="md:w-[18px] md:h-[18px]" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-purple-500/30 bg-black/80">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center">
            <p className="text-gray-300 text-sm font-medium">
              © 2025 Esther Reign. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Video Player Modal */}
      {playingVideo && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setPlayingVideo(null)}
            className="absolute top-6 right-6 w-12 h-12 bg-purple-500/20 hover:bg-purple-500/30 rounded-full flex items-center justify-center transition-colors z-10"
          >
            <X size={24} className="text-white" />
          </button>
          
          <div className="w-full max-w-5xl">
            <div className="mb-4">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{playingVideo.title}</h2>
              {playingVideo.template_type && (
                <p className="text-purple-300 text-sm">{playingVideo.template_type}</p>
              )}
            </div>
            
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
              {playingVideo.video_link?.includes('youtube.com') || playingVideo.video_link?.includes('youtu.be') ? (
                <iframe
                  src={`https://www.youtube.com/embed/${playingVideo.video_link.match(/[?&]v=([^&]+)/)?.[1] || playingVideo.video_link.match(/youtu\.be\/([^?]+)/)?.[1]}`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={playingVideo.title}
                />
              ) : (
                <video
                  src={playingVideo.video_link}
                  controls
                  autoPlay
                  className="w-full h-full"
                  controlsList="nodownload"
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
            
            <div className="mt-4 flex justify-center gap-4">
              <a
                href={playingVideo.video_link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-3 rounded-full text-white font-medium flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                Open in New Tab
                <ChevronRight size={18} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EstherPlatform;
