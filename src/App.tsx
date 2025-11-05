import { useState, useEffect, lazy, Suspense } from 'react';
import { Menu, X, Instagram, Youtube, Mail, Play, ChevronRight, Sparkles } from 'lucide-react';
import { FaTiktok, FaFacebook } from 'react-icons/fa';
import { Loader } from './components/Loader';
import { WebGLBackground } from './components/WebGLBackground';
import { FanMessageForm } from './components/FanMessageForm';
import type { Video } from './types';

// Lazy load AdminPanel for better performance
const AdminPanel = lazy(() => import('./components/AdminPanel'));

const EstherPlatform = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [loading, setLoading] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);

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
          // Reload all data when returning from admin
          loadData();
          // Force re-render
          window.location.reload();
        }} />
      </Suspense>
    );
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="bg-gradient-to-br from-black via-gray-950 to-black text-white">
      {/* WebGL Animated Background - Only on desktop for performance */}
      <div className="hidden md:block">
        <WebGLBackground />
      </div>

      {/* Floating particles background overlay */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-purple-600/10 rounded-full blur-3xl top-0 -left-20 animate-blob"></div>
        <div className="absolute w-96 h-96 bg-pink-600/10 rounded-full blur-3xl top-20 right-20 animate-blob animation-delay-2000"></div>
        <div className="absolute w-96 h-96 bg-blue-600/10 rounded-full blur-3xl bottom-20 left-40 animate-blob animation-delay-4000"></div>
      </div>

      {/* Top Navigation */}
      <nav className="fixed top-0 w-full bg-black/95 md:bg-black/90 md:backdrop-blur-xl z-40 border-b border-purple-500/30">
        <div className="container mx-auto px-4 md:px-6 lg:px-12">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo - Triple tap to access admin */}
            <div 
              className="flex items-center gap-2 md:gap-4 flex-shrink-0 cursor-pointer"
              onClick={() => {
                const now = Date.now();
                const lastTap = parseInt(localStorage.getItem('lastLogoTap') || '0');
                const tapCount = parseInt(localStorage.getItem('logoTapCount') || '0');
                
                if (now - lastTap < 500) {
                  const newCount = tapCount + 1;
                  localStorage.setItem('logoTapCount', newCount.toString());
                  
                  if (newCount >= 3) {
                    localStorage.removeItem('logoTapCount');
                    localStorage.removeItem('lastLogoTap');
                    setShowAdmin(true);
                    window.location.hash = '#admin';
                  }
                } else {
                  localStorage.setItem('logoTapCount', '1');
                }
                
                localStorage.setItem('lastLogoTap', now.toString());
              }}
              title="Triple tap for admin access"
            >
              <img
                src="https://res.cloudinary.com/dtynqpjye/image/upload/v1761948158/ESTHER-REIGN-LOGO.-Photoroom_nj506d.png"
                alt="Esther Reign Logo"
                className="h-12 md:h-16 lg:h-20 w-auto"
                loading="eager"
              />
              <span className="text-[10px] sm:text-xs md:text-base lg:text-lg font-bold bg-gradient-to-r from-royal-400 via-violet-400 to-royal-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] whitespace-nowrap drop-shadow-lg">
                @officialEstherReign
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {[
                { id: 'home', label: 'Home' },
                { id: 'about', label: 'About' },
                { id: 'videos', label: 'Videos' },
                { id: 'contact', label: 'Contact' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-sm font-medium transition-all relative group ${activeSection === item.id
                    ? 'text-royal-400'
                    : 'text-gray-300 hover:text-white'
                    }`}
                >
                  {item.label}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-royal-500 via-violet-500 to-royal-500 transition-all ${activeSection === item.id ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}></span>
                </button>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/98 backdrop-blur-xl border-t border-purple-500/30">
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
                  className="block w-full text-left py-2 text-gray-300 hover:text-royal-400 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center relative overflow-hidden pt-16 md:pt-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Text Content - Order 2 on mobile, 1 on desktop */}
            <div className="space-y-6 md:space-y-8 animate-fade-in-left order-2 lg:order-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full backdrop-blur-sm mx-auto lg:mx-0">
                <Sparkles size={16} className="text-purple-400" />
                <span className="text-sm text-purple-300">Gospel Singer • Worship Leader</span>
              </div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-tight drop-shadow-2xl">
                <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent animate-text-reveal">
                  Esther
                </span>
                <br />
                <span className="bg-gradient-to-r from-royal-400 via-violet-400 to-royal-400 bg-clip-text text-transparent animate-gradient animate-text-reveal stagger-delay-2">
                  Reign
                </span>
              </h1>

              <p className="text-base md:text-lg lg:text-xl text-white/95 leading-relaxed max-w-xl animate-text-reveal stagger-delay-3 drop-shadow-lg">
                {settings?.hero_description || localStorage.getItem('hero_description') || 'Lifting voices in worship through powerful gospel music. Experience the presence of God through every note.'}
              </p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start animate-bounce-in stagger-delay-4">
                <button
                  onClick={() => scrollToSection('videos')}
                  className="group px-8 py-4 bg-gradient-to-r from-royal-600 via-violet-600 to-royal-600 rounded-full font-semibold transition-all hover:shadow-2xl hover:shadow-royal-500/50 hover:scale-110 flex items-center gap-2 animate-glow-pulse text-white"
                >
                  Watch Videos
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full font-semibold hover:bg-white/10 hover:scale-105 transition-all text-white"
                >
                  Get In Touch
                </button>
              </div>

              {/* Social Links */}
              <div className="flex gap-4 pt-6 pb-8 md:pb-0 justify-center lg:justify-start animate-slide-in-left stagger-delay-5">
                <a href={settings?.social_links?.instagram || "https://instagram.com/estherreign"} target="_blank" rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center hover:bg-royal-600 hover:border-royal-600 hover:shadow-lg hover:shadow-royal-500/50 transition-all hover:scale-110 text-white">
                  <Instagram size={20} />
                </a>
                <a href={settings?.social_links?.youtube || "https://youtube.com/@estherreign"} target="_blank" rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center hover:bg-royal-600 hover:border-royal-600 hover:shadow-lg hover:shadow-royal-500/50 transition-all hover:scale-110 text-white">
                  <Youtube size={20} />
                </a>
                <a href={settings?.social_links?.tiktok || "https://tiktok.com/@estherreign"} target="_blank" rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center hover:bg-royal-600 hover:border-royal-600 hover:shadow-lg hover:shadow-royal-500/50 transition-all hover:scale-110 text-white">
                  <FaTiktok size={20} />
                </a>
                <a href={settings?.social_links?.facebook || "https://facebook.com/estherreign"} target="_blank" rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center hover:bg-royal-600 hover:border-royal-600 hover:shadow-lg hover:shadow-royal-500/50 transition-all hover:scale-110 text-white">
                  <FaFacebook size={20} />
                </a>
              </div>
            </div>

            {/* Image - Order 1 on mobile, 2 on desktop - Circular on mobile */}
            <div className="relative animate-zoom-in order-1 lg:order-2 max-w-sm mx-auto lg:max-w-none">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full lg:rounded-3xl blur-3xl opacity-30 animate-pulse"></div>
              <div className="relative rounded-full lg:rounded-3xl overflow-hidden border-4 lg:border-2 border-purple-500/30 lg:border-white/10 backdrop-blur-sm aspect-square lg:aspect-auto animate-glow-pulse">
                <img
                  src={settings?.hero_image || "/Estherreign.jpg"}
                  alt="Esther Reign"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent"></div>
              </div>
            </div>
          </div>
        </div>


      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-24 lg:py-32 relative overflow-hidden bg-black/60">
        <div className="container mx-auto px-4 md:px-6 lg:px-12 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 md:mb-20 animate-fade-in-down">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-6">
                <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  About Me
                </span>
              </h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
              <div className="relative animate-fade-in-left">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-20"></div>
                <div className="relative rounded-3xl overflow-hidden border border-white/10">
                  <img
                    src={settings?.about_image || "/IMG-20250915-WA0023.jpg"}
                    alt="About Esther"
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="space-y-4 md:space-y-6 animate-fade-in-right">
                {(settings?.about_text || 'I am an emerging gospel artist with a deep passion for worship and praise. Through powerful cover songs, I aim to create an atmosphere where people can encounter God\'s presence.\n\nEvery song I sing is a testimony of God\'s faithfulness and love. My mission is to use my voice as an instrument of worship, touching hearts and transforming lives through gospel music.\n\nJoin me on this journey as I share my gift with the world, one song at a time, bringing glory to God through music.').split('\n\n').map((paragraph: string, index: number) => (
                  <p key={index} className="text-base md:text-lg text-white leading-relaxed">
                    {paragraph}
                  </p>
                ))}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 pt-6 md:pt-8">
                  <div className="text-center p-4 md:p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 group">
                    <div className="text-4xl md:text-5xl mb-2 md:mb-3 group-hover:scale-110 transition-transform duration-300">
                      🎤
                    </div>
                    <div className="text-base md:text-lg font-bold text-white mb-1">Authentic Worship</div>
                    <div className="text-xs md:text-sm text-gray-400">Spirit-led songs from the heart</div>
                  </div>
                  <div className="text-center p-4 md:p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 group">
                    <div className="text-4xl md:text-5xl mb-2 md:mb-3 group-hover:scale-110 transition-transform duration-300">
                      ✨
                    </div>
                    <div className="text-base md:text-lg font-bold text-white mb-1">Fresh Sound</div>
                    <div className="text-xs md:text-sm text-gray-400">Contemporary gospel music</div>
                  </div>
                  <div className="text-center p-4 md:p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 group">
                    <div className="text-4xl md:text-5xl mb-2 md:mb-3 group-hover:scale-110 transition-transform duration-300">
                      🙏
                    </div>
                    <div className="text-base md:text-lg font-bold text-white mb-1">Kingdom Impact</div>
                    <div className="text-xs md:text-sm text-gray-400">Music that transforms lives</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Videos Section */}
      <section id="videos" className="py-16 md:py-24 lg:py-32 relative overflow-hidden bg-black/90">
        <div className="container mx-auto px-4 md:px-6 lg:px-12 relative z-10">
          <div className="text-center mb-12 md:mb-20 animate-fade-in-down">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full backdrop-blur-sm mb-6">
              <Play size={16} className="text-purple-400" />
              <span className="text-sm text-purple-300">Watch</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-6">
              <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Videos
              </span>
            </h2>
            <p className="text-white max-w-2xl mx-auto text-base md:text-lg px-4">
              Experience powerful gospel worship that will uplift your spirit
            </p>
          </div>

          {videos.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Play size={48} className="text-purple-400" />
              </div>
              <p className="text-gray-400 text-xl">New videos coming soon...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 max-w-7xl mx-auto">
              {videos.map((video, index) => (
                <div
                  key={video.id}
                  className={`group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-purple-500/50 transition-all animate-scale-in stagger-${(index % 6) + 1}`}
                >
                  <div 
                    className="aspect-video bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center relative overflow-hidden cursor-pointer"
                    onClick={() => setPlayingVideo(video)}
                    onMouseEnter={(e) => {
                      // Start video preview on hover (desktop)
                      const videoEl = e.currentTarget.querySelector('video');
                      if (videoEl) {
                        videoEl.currentTime = 0;
                        videoEl.play().catch(() => {});
                      }
                    }}
                    onMouseLeave={(e) => {
                      // Stop video preview on mouse leave (desktop)
                      const videoEl = e.currentTarget.querySelector('video');
                      if (videoEl) {
                        videoEl.pause();
                        videoEl.currentTime = 0;
                      }
                    }}
                    onTouchStart={(e) => {
                      // Start video preview on touch (mobile)
                      const videoEl = e.currentTarget.querySelector('video');
                      if (videoEl && !videoEl.paused) {
                        // If already playing, stop it (toggle behavior)
                        videoEl.pause();
                        videoEl.currentTime = 0;
                      } else if (videoEl) {
                        videoEl.currentTime = 0;
                        videoEl.play().catch(() => {});
                      }
                    }}
                  >
                    {/* Thumbnail Image - Always visible */}
                    <img
                      src={video.thumbnail_url || getVideoThumbnail(video.video_link || '')}
                      alt={video.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        // If thumbnail fails, try to show a placeholder
                        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="640" height="360"%3E%3Crect fill="%23374151" width="640" height="360"/%3E%3Ctext fill="%239CA3AF" font-family="Arial" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3E' + encodeURIComponent(video.title) + '%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    
                    {/* Preview Video (for non-YouTube videos) - Plays on hover/touch */}
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
                    
                    {/* Dark Overlay with Play Button */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-center justify-center transition-all duration-300 group-hover:bg-black/40">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlayingVideo(video);
                        }}
                        className="w-20 h-20 bg-white/95 hover:bg-white rounded-full flex items-center justify-center transform transition-all shadow-2xl group-hover:scale-125"
                      >
                        <Play size={32} className="text-purple-600 ml-1" fill="currentColor" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-2 line-clamp-2">{video.title}</h3>
                    {video.template_type && (
                      <p className="text-sm text-purple-400 mb-2">{video.template_type}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 md:py-24 lg:py-32 relative overflow-hidden bg-black/60">
        <div className="container mx-auto px-4 md:px-6 lg:px-12 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 md:mb-20 animate-fade-in-down">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full backdrop-blur-sm mb-6">
                <Mail size={16} className="text-purple-400" />
                <span className="text-sm text-purple-300">Contact</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-6">
                <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Let's Connect
                </span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg px-4">
                For bookings, collaborations, or inquiries
              </p>
            </div>

            {/* Fan Message Form */}
            <div className="mb-12 md:mb-16">
              <FanMessageForm />
            </div>

            {/* Social Media Links */}
            <div className="flex justify-center gap-6 animate-fade-in-up">
              <a href={settings?.social_links?.instagram || "https://instagram.com/estherreign"} target="_blank" rel="noopener noreferrer"
                className="w-14 h-14 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600 hover:border-transparent transition-all hover:scale-110">
                <Instagram size={24} />
              </a>
              <a href={settings?.social_links?.youtube || "https://youtube.com/@estherreign"} target="_blank" rel="noopener noreferrer"
                className="w-14 h-14 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600 hover:border-transparent transition-all hover:scale-110">
                <Youtube size={24} />
              </a>
              <a href={settings?.social_links?.tiktok || "https://tiktok.com/@estherreign"} target="_blank" rel="noopener noreferrer"
                className="w-14 h-14 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600 hover:border-transparent transition-all hover:scale-110">
                <FaTiktok size={24} />
              </a>
              <a href={settings?.social_links?.facebook || "https://facebook.com/estherreign"} target="_blank" rel="noopener noreferrer"
                className="w-14 h-14 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600 hover:border-transparent transition-all hover:scale-110">
                <FaFacebook size={24} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10 backdrop-blur-sm bg-black/90">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center">
            <p className="text-white text-sm font-medium">
              © 2025 Esther Reign. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Video Player Modal */}
      {playingVideo && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <button
            onClick={() => setPlayingVideo(null)}
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-10"
          >
            <X size={24} className="text-white" />
          </button>
          
          <div className="w-full max-w-5xl animate-scale-in">
            <div className="mb-4">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{playingVideo.title}</h2>
              {playingVideo.template_type && (
                <p className="text-purple-400 text-sm">{playingVideo.template_type}</p>
              )}
            </div>
            
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
              {playingVideo.video_link?.includes('youtube.com') || playingVideo.video_link?.includes('youtu.be') ? (
                // YouTube embed
                <iframe
                  src={`https://www.youtube.com/embed/${playingVideo.video_link.match(/[?&]v=([^&]+)/)?.[1] || playingVideo.video_link.match(/youtu\.be\/([^?]+)/)?.[1]}`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={playingVideo.title}
                />
              ) : (
                // Direct video (Cloudinary, etc.)
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
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-full text-white font-medium transition-colors flex items-center gap-2"
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
