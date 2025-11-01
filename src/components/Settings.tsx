import React, { useState, useEffect } from 'react';
import { Save, Upload } from 'lucide-react';
import type { SiteSettings } from '../types';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>({
    hero_image: '/Estherreign.jpg',
    about_image: '/IMG-20250915-WA0023.jpg',
    about_text: 'I am an emerging gospel artist with a deep passion for worship and praise...',
    phone: '+234 818 019 4269',
    email: 'contact@estherreign.com',
    location: 'Lagos, Nigeria',
    social_links: {
      instagram: 'https://instagram.com/estherreign',
      youtube: 'https://youtube.com/@estherreign',
      tiktok: 'https://tiktok.com/@estherreign',
      facebook: 'https://facebook.com/estherreign',
      twitter: 'https://twitter.com/estherreign'
    }
  });
  const [heroDescription, setHeroDescription] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('site_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
    const savedHeroDesc = localStorage.getItem('hero_description');
    if (savedHeroDesc) {
      setHeroDescription(savedHeroDesc);
    } else {
      setHeroDescription('Lifting voices in worship through powerful gospel music. Experience the presence of God through every note.');
    }
  }, []);

  const handleSave = () => {
    const updatedSettings = {
      ...settings,
      hero_description: heroDescription
    };
    
    localStorage.setItem('site_settings', JSON.stringify(updatedSettings));
    localStorage.setItem('hero_description', heroDescription);
    
    // Trigger a storage event to notify other components
    window.dispatchEvent(new Event('storage'));
    
    // Force reload to show changes
    setTimeout(() => {
      window.location.reload();
    }, 500);
    
    alert('Settings saved successfully! The page will reload to show changes.');
  };

  const handleImageUpload = (type: 'hero' | 'about', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (type === 'hero') {
          setSettings({ ...settings, hero_image: base64String });
        } else {
          setSettings({ ...settings, about_image: base64String });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black mb-2 text-white">Site Settings</h2>
        <p className="text-gray-400">Manage your website content and appearance</p>
      </div>

      <div className="grid gap-6">
        {/* Images */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4 text-white">Images</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Hero Image</label>
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload('hero', e)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer"
                />
                <input
                  type="url"
                  value={settings.hero_image.startsWith('data:') ? '' : settings.hero_image}
                  onChange={(e) => setSettings({ ...settings, hero_image: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white"
                  placeholder="Or paste image URL..."
                />
              </div>
              {settings.hero_image && (
                <img src={settings.hero_image} alt="Hero" className="mt-2 w-full h-32 object-cover rounded-lg" />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">About Image</label>
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload('about', e)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer"
                />
                <input
                  type="url"
                  value={settings.about_image.startsWith('data:') ? '' : settings.about_image}
                  onChange={(e) => setSettings({ ...settings, about_image: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white"
                  placeholder="Or paste image URL..."
                />
              </div>
              {settings.about_image && (
                <img src={settings.about_image} alt="About" className="mt-2 w-full h-32 object-cover rounded-lg" />
              )}
            </div>
          </div>
        </div>

        {/* Hero Description */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4 text-white">Hero Section</h3>
          <label className="block text-sm font-medium mb-2 text-white">Hero Description</label>
          <textarea
            value={heroDescription}
            onChange={(e) => setHeroDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white resize-none"
            placeholder="Brief description for hero section..."
          />
        </div>

        {/* About Text */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4 text-white">About Section</h3>
          <label className="block text-sm font-medium mb-2 text-white">About Text</label>
          <textarea
            value={settings.about_text}
            onChange={(e) => setSettings({ ...settings, about_text: e.target.value })}
            rows={6}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white resize-none"
            placeholder="Tell your story..."
          />
        </div>

        {/* Contact Information */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4 text-white">Contact Information</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Phone</label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white"
                placeholder="+234..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white"
                placeholder="contact@..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Location</label>
              <input
                type="text"
                value={settings.location}
                onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white"
                placeholder="City, Country"
              />
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4 text-white">Social Media Links</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Instagram</label>
              <input
                type="url"
                value={settings.social_links.instagram}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  social_links: { ...settings.social_links, instagram: e.target.value }
                })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white"
                placeholder="https://instagram.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">YouTube</label>
              <input
                type="url"
                value={settings.social_links.youtube}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  social_links: { ...settings.social_links, youtube: e.target.value }
                })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white"
                placeholder="https://youtube.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">TikTok</label>
              <input
                type="url"
                value={settings.social_links.tiktok}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  social_links: { ...settings.social_links, tiktok: e.target.value }
                })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white"
                placeholder="https://tiktok.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Facebook</label>
              <input
                type="url"
                value={settings.social_links.facebook}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  social_links: { ...settings.social_links, facebook: e.target.value }
                })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white"
                placeholder="https://facebook.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Twitter</label>
              <input
                type="url"
                value={settings.social_links.twitter}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  social_links: { ...settings.social_links, twitter: e.target.value }
                })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white"
                placeholder="https://twitter.com/..."
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/50 flex items-center justify-center gap-2"
        >
          <Save size={20} />
          Save All Settings
        </button>
      </div>
    </div>
  );
};
