import React, { useState, useEffect } from 'react';
import { Menu, X, Instagram, Youtube, Facebook, Twitter, Mail, Phone, MapPin, Send, Music, Award, Users } from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';
import { MinimalBackground } from './components/MinimalBackground';
import { LightBackground } from './components/LightBackground';
import { Loader } from './components/Loader';

const EstherPlatform = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 2000);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'music', 'videos', 'contact'];
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

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="bg-gray-950 text-white">
      {/* Side Navigation - Desktop */}
      <nav className="hidden lg:flex fixed left-0 top-0 h-screen w-20 bg-gray-900/95 backdrop-blur-sm z-50 flex-col items-center justify-between py-8 border-r border-gray-800">
        <div className="text-2xl font-bold text-purple-500 rotate-0">
          ER
        </div>
        
        <div className="flex flex-col gap-8">
          {[
            { id: 'home', label: 'Home', icon: '🏠' },
            { id: 'about', label: 'About', icon: '👤' },
            { id: 'music', label: 'Music', icon: '🎵' },
            { id: 'videos', label: 'Videos', icon: '🎬' },
            { id: 'contact', label: 'Contact', icon: '✉️' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`group relative text-2xl transition-all ${
                activeSection === item.id ? 'scale-125' : 'opacity-50 hover:opacity-100'
              }`}
              title={item.label}
            >
              {item.icon}
              <span className="absolute left-full ml-4 px-3 py-1 bg-gray-800 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <a href="https://instagram.com/estherreign" target="_blank" rel="noopener noreferrer"
             className="text-gray-400 hover:text-purple-500 transition-colors">
            <Instagram size={20} />
          </a>
          <a href="https://youtube.com/@estherreign" target="_blank" rel="noopener noreferrer"
             className="text-gray-400 hover:text-purple-500 transition-colors">
            <Youtube size={20} />
          </a>
          <a href="https://tiktok.com/@estherreign" target="_blank" rel="noopener noreferrer"
             className="text-gray-400 hover:text-purple-500 transition-colors">
            <FaTiktok size={20} />
          </a>
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 w-full bg-gray-900/95 backdrop-blur-sm z-50 border-b border-gray-800">
        <div className="flex justify-between items-center px-6 h-16">
          <div className="text-2xl font-bold text-purple-500">Esther Reign</div>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
        
        {isMenuOpen && (
          <div className="bg-gray-800 border-t border-gray-700">
            <nav className="px-6 py-6 space-y-4">
              {['home', 'about', 'music', 'videos', 'contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className="block w-full text-left capitalize py-2 text-gray-300 hover:text-white"
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content - Offset for side nav */}
      <div className="lg:ml-20">
        {/* Hero Section */}
        <section id="home" className="min-h-screen flex items-center relative overflow-hidden bg-gray-950">
          <div className="absolute inset-0 overflow-hidden">
            <MinimalBackground />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/80 to-transparent"></div>
          
          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="animate-fade-in-left">
                <p className="text-purple-400 text-sm font-semibold mb-4 uppercase tracking-wider animate-fade-in-up stagger-1">
                  Singer • Songwriter • Artist
                </p>
                <h1 className="text-6xl lg:text-8xl font-bold mb-6 leading-tight neon-text text-3d animate-fade-in-up stagger-2">
                  Esther<br />Reign
                </h1>
                <p className="text-xl text-gray-400 mb-8 leading-relaxed animate-fade-in-up stagger-3">
                  Creating music that touches hearts and inspires souls. Experience the journey through sound.
                </p>
                <div className="flex flex-wrap gap-4 animate-fade-in-up stagger-4">
                  <button
                    onClick={() => scrollToSection('music')}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-md font-medium transition-all neon-glow hover-lift"
                  >
                    Listen Now
                  </button>
                  <button
                    onClick={() => scrollToSection('contact')}
                    className="border-2 border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white px-8 py-4 rounded-md font-medium transition-all neon-border hover-lift"
                  >
                    Get In Touch
                  </button>
                </div>
              </div>

              <div className="relative animate-fade-in-right">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                <img
                  src="/Estherreign.jpg"
                  alt="Esther Reign"
                  className="relative rounded-2xl w-full shadow-2xl shadow-purple-600/30 hover-lift"
                />
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-purple-500 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-purple-500 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="min-h-screen flex items-center py-20 bg-white relative overflow-hidden">
          <div className="absolute inset-0">
            <LightBackground />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/90 to-white"></div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16 animate-fade-in-down">
                <p className="text-purple-600 text-sm font-semibold mb-2 uppercase tracking-wider">About Me</p>
                <h2 className="text-5xl lg:text-6xl font-bold mb-6 text-gray-900 text-3d-static">
                  My Story
                </h2>
              </div>

              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="animate-fade-in-left">
                  <img
                    src="/IMG-20250915-WA0023.jpg"
                    alt="About Esther"
                    className="rounded-2xl w-full shadow-2xl hover-lift"
                  />
                </div>

                <div className="space-y-6 animate-fade-in-right">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Music has been my passion since childhood. Every note I sing, every song I write, comes from a place of deep emotion and genuine connection with my audience.
                  </p>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    With years of experience performing on stages around the world, I've learned that music is more than entertainment—it's a universal language that brings people together.
                  </p>
                  
                  <div className="grid grid-cols-3 gap-6 pt-8">
                    <div className="text-center animate-scale-in stagger-1">
                      <Music className="w-12 h-12 mx-auto mb-3 text-purple-600" />
                      <div className="text-3xl font-bold text-purple-600 mb-1">150+</div>
                      <div className="text-sm text-gray-600">Songs</div>
                    </div>
                    <div className="text-center animate-scale-in stagger-2">
                      <Award className="w-12 h-12 mx-auto mb-3 text-purple-600" />
                      <div className="text-3xl font-bold text-purple-600 mb-1">25+</div>
                      <div className="text-sm text-gray-600">Awards</div>
                    </div>
                    <div className="text-center animate-scale-in stagger-3">
                      <Users className="w-12 h-12 mx-auto mb-3 text-purple-600" />
                      <div className="text-3xl font-bold text-purple-600 mb-1">50K+</div>
                      <div className="text-sm text-gray-600">Fans</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Music Section */}
        <section id="music" className="min-h-screen flex items-center py-20 bg-gray-950 relative overflow-hidden">
          <div className="absolute inset-0">
            <MinimalBackground />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950/70 via-gray-950/80 to-gray-950/90"></div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            <div className="text-center mb-16 animate-fade-in-down">
              <p className="text-purple-500 text-sm font-semibold mb-2 uppercase tracking-wider">Latest Releases</p>
              <h2 className="text-5xl lg:text-6xl font-bold mb-6 neon-text text-3d">My Music</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Explore my latest tracks and albums
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className={`group relative overflow-hidden rounded-xl bg-gray-900 hover-lift neon-border animate-scale-in stagger-${item}`}
                >
                  <div className="aspect-square bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center">
                    <Music size={64} className="text-white/30" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">Track {item}</h3>
                    <p className="text-gray-400 text-sm mb-4">Album Name • 2024</p>
                    <button className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-2">
                      <span>Play Now</span>
                      <span>▶</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Videos Section */}
        <section id="videos" className="min-h-screen flex items-center py-20 bg-white relative overflow-hidden">
          <div className="absolute inset-0">
            <LightBackground />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/90 to-white"></div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            <div className="text-center mb-16 animate-fade-in-down">
              <p className="text-purple-600 text-sm font-semibold mb-2 uppercase tracking-wider">Watch</p>
              <h2 className="text-5xl lg:text-6xl font-bold mb-6 text-gray-900 text-3d-static">Music Videos</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Experience my music through stunning visuals
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className={`group relative overflow-hidden rounded-xl bg-white shadow-xl hover-lift animate-fade-in-up stagger-${item}`}
                >
                  <div className="aspect-video bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center relative">
                    <img
                      src={`/IMG-20250915-WA0${23 + (item % 2) * 12}.jpg`}
                      alt={`Video ${item}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="text-purple-600 text-2xl ml-1">▶</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-900">Video Title {item}</h3>
                    <p className="text-gray-600 text-sm">Released 2024 • 2.5M views</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="min-h-screen flex items-center py-20 bg-gray-950 relative overflow-hidden">
          <div className="absolute inset-0">
            <MinimalBackground />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950/70 via-gray-950/80 to-gray-950/90"></div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16 animate-fade-in-down">
                <p className="text-purple-500 text-sm font-semibold mb-2 uppercase tracking-wider">Contact</p>
                <h2 className="text-5xl lg:text-6xl font-bold mb-6 neon-text text-3d">Let's Connect</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Have a project in mind? Let's create something amazing together
                </p>
              </div>

              <div className="grid lg:grid-cols-3 gap-8 mb-12">
                <div className="text-center animate-fade-in-up stagger-1">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 neon-glow">
                    <Phone size={24} className="text-white" />
                  </div>
                  <h3 className="font-bold mb-2">Phone</h3>
                  <p className="text-gray-400">+1 (555) 123-4567</p>
                </div>

                <div className="text-center animate-fade-in-up stagger-2">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 neon-glow">
                    <Mail size={24} className="text-white" />
                  </div>
                  <h3 className="font-bold mb-2">Email</h3>
                  <p className="text-gray-400">contact@estherreign.com</p>
                </div>

                <div className="text-center animate-fade-in-up stagger-3">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 neon-glow">
                    <MapPin size={24} className="text-white" />
                  </div>
                  <h3 className="font-bold mb-2">Location</h3>
                  <p className="text-gray-400">Los Angeles, CA</p>
                </div>
              </div>

              <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 neon-border animate-scale-in">
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <input
                      type="text"
                      placeholder="Your Name"
                      className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white"
                    />
                    <input
                      type="email"
                      placeholder="Your Email"
                      className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Subject"
                    className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white"
                  />
                  <textarea
                    rows={6}
                    placeholder="Your Message"
                    className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors resize-none text-white"
                  ></textarea>
                  <button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 neon-glow hover-lift"
                  >
                    Send Message
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-black py-8 border-t border-gray-800">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-500 text-sm">
                © 2024 Esther Reign. All rights reserved.
              </p>
              <div className="flex gap-6">
                <a href="https://instagram.com/estherreign" className="text-gray-500 hover:text-purple-500 transition-colors">
                  <Instagram size={20} />
                </a>
                <a href="https://youtube.com/@estherreign" className="text-gray-500 hover:text-purple-500 transition-colors">
                  <Youtube size={20} />
                </a>
                <a href="https://facebook.com/estherreign" className="text-gray-500 hover:text-purple-500 transition-colors">
                  <Facebook size={20} />
                </a>
                <a href="https://twitter.com/estherreign" className="text-gray-500 hover:text-purple-500 transition-colors">
                  <Twitter size={20} />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default EstherPlatform;
