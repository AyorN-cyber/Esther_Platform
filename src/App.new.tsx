import React, { useState, useEffect } from 'react';
import { Menu, X, Instagram, Youtube, Music, Mail, ChevronDown } from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';

const EstherPlatform = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'portfolio', 'contact'];
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

  return (
    <div className="bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-gray-900/95 backdrop-blur-sm z-50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Esther Reign
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8">
              {['home', 'about', 'portfolio', 'contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className={`capitalize transition-colors ${
                    activeSection === item
                      ? 'text-purple-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-800 border-t border-gray-700">
            <div className="px-4 py-4 space-y-3">
              {['home', 'about', 'portfolio', 'contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className="block w-full text-left capitalize py-2 text-gray-300 hover:text-white"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center pt-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <img
              src="/Estherreign.jpg"
              alt="Esther Reign"
              className="w-48 h-48 rounded-full mx-auto object-cover border-4 border-purple-500 shadow-2xl shadow-purple-500/50"
            />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Hi, I'm <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Esther Reign</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-8">
            Singer • Songwriter • Creative Artist
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-12">
            Creating music that touches hearts and inspires souls. Join me on this creative journey.
          </p>
          <div className="flex justify-center gap-6 mb-12">
            <a href="https://instagram.com/estherreign" target="_blank" rel="noopener noreferrer" 
               className="p-3 bg-gray-800 rounded-full hover:bg-purple-600 transition-colors">
              <Instagram size={24} />
            </a>
            <a href="https://youtube.com/@estherreign" target="_blank" rel="noopener noreferrer"
               className="p-3 bg-gray-800 rounded-full hover:bg-purple-600 transition-colors">
              <Youtube size={24} />
            </a>
            <a href="https://tiktok.com/@estherreign" target="_blank" rel="noopener noreferrer"
               className="p-3 bg-gray-800 rounded-full hover:bg-purple-600 transition-colors">
              <FaTiktok size={24} />
            </a>
            <a href="https://music.apple.com" target="_blank" rel="noopener noreferrer"
               className="p-3 bg-gray-800 rounded-full hover:bg-purple-600 transition-colors">
              <Music size={24} />
            </a>
          </div>
          <button
            onClick={() => scrollToSection('portfolio')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
          >
            View My Work
          </button>
          <div className="mt-16 animate-bounce">
            <ChevronDown size={32} className="mx-auto text-gray-600" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="min-h-screen flex items-center py-20 px-4 bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
            About <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Me</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="/IMG-20250915-WA0023.jpg"
                alt="Esther Reign"
                className="rounded-2xl shadow-2xl"
              />
            </div>
            <div className="space-y-6">
              <p className="text-lg text-gray-300 leading-relaxed">
                I'm a passionate singer and songwriter dedicated to creating music that resonates with the soul. 
                My journey in music has been one of constant growth, exploration, and connection with audiences worldwide.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed">
                Through my art, I aim to inspire, uplift, and bring people together. Every song tells a story, 
                and I'm honored to share mine with you.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-6">
                <div className="bg-gray-900 p-6 rounded-xl text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">100+</div>
                  <div className="text-gray-400">Songs Written</div>
                </div>
                <div className="bg-gray-900 p-6 rounded-xl text-center">
                  <div className="text-3xl font-bold text-pink-400 mb-2">50K+</div>
                  <div className="text-gray-400">Followers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="min-h-screen py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            My <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Portfolio</span>
          </h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Explore my latest music videos, performances, and creative projects
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="group relative overflow-hidden rounded-xl bg-gray-800 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
                <div className="aspect-video bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <Music size={48} className="text-white/50" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Project Title {item}</h3>
                  <p className="text-gray-400 mb-4">A beautiful musical journey that captures emotions and tells a story.</p>
                  <button className="text-purple-400 hover:text-purple-300 font-semibold">
                    Watch Now →
                  </button>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="min-h-screen flex items-center py-20 px-4 bg-gray-800/50">
        <div className="max-w-4xl mx-auto w-full">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            Get In <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Touch</span>
          </h2>
          <p className="text-center text-gray-400 mb-12">
            Have a project in mind? Let's work together!
          </p>
          
          <div className="bg-gray-900 rounded-2xl p-8 md:p-12">
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Message</label>
                <textarea
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  placeholder="Tell me about your project..."
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                Send Message
              </button>
            </form>
          </div>

          <div className="mt-12 flex justify-center gap-6">
            <a href="mailto:contact@estherreign.com" className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors">
              <Mail size={20} />
              <span>contact@estherreign.com</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 py-8 px-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500">
            © 2024 Esther Reign. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default EstherPlatform;
