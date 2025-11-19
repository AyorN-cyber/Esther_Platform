import React, { useState, useEffect } from 'react';
import { Save, Upload } from 'lucide-react';
import type { SiteSettings } from '../types';
import { uploadImageToSupabase } from '../lib/supabase';

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
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [imageUploading, setImageUploading] = useState<{ hero: boolean; about: boolean }>({ hero: false, about: false });

  useEffect(() => {
    const cached = localStorage.getItem('admin_profile_picture');
    if (cached) {
      setProfilePicture(cached);
    }
  }, []);

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    try {
      setUploadingProfile(true);
      const publicUrl = await uploadImageToSupabase(file, 'profile');
      if (!publicUrl) {
        alert('Upload failed. Please try again.');
        return;
      }
      setProfilePicture(publicUrl);
      localStorage.setItem('admin_profile_picture', publicUrl);

      // Update current user session
      const session = localStorage.getItem('admin_session');
      if (session) {
        const parsed = JSON.parse(session);
        parsed.user.profilePicture = publicUrl;
        localStorage.setItem('admin_session', JSON.stringify(parsed));
      }

      alert('Profile picture updated! Refresh the page to see changes.');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploadingProfile(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { getSettings } = await import('../lib/supabaseData');
    const data = await getSettings();
    
    if (data) {
      setSettings({
        hero_image: data.hero_image || '/Estherreign.jpg',
        about_image: data.about_image || '/IMG-20250915-WA0023.jpg',
        about_text: data.about_text || 'I am an emerging gospel artist with a deep passion for worship and praise...',
        phone: data.contact_phone || '+234 818 019 4269',
        email: data.contact_email || 'contact@estherreign.com',
        location: 'Lagos, Nigeria',
        social_links: data.social_links || {
          instagram: 'https://instagram.com/estherreign',
          youtube: 'https://youtube.com/@estherreign',
          tiktok: 'https://tiktok.com/@estherreign',
          facebook: 'https://facebook.com/estherreign',
          twitter: 'https://twitter.com/estherreign'
        }
      });
      setHeroDescription(data.hero_description || 'Lifting voices in worship through powerful gospel music. Experience the presence of God through every note.');
    }
  };

  const handleSave = async () => {
    try {
      const { updateSettings } = await import('../lib/supabaseData');
      
      const success = await updateSettings({
        hero_image: settings.hero_image,
        hero_description: heroDescription,
        about_image: settings.about_image,
        about_text: settings.about_text,
        contact_email: settings.email,
        contact_phone: settings.phone,
        social_links: settings.social_links
      });
      
      if (success) {
        alert('Settings saved successfully! Changes will appear immediately.');
        // Trigger a storage event to notify other components
        window.dispatchEvent(new Event('storage'));
      } else {
        alert('Failed to save settings. Please try again.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please check console for details.');
    }
  };

  const handleImageUpload = async (type: 'hero' | 'about', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    try {
      setImageUploading((prev) => ({ ...prev, [type]: true }));
      const publicUrl = await uploadImageToSupabase(file, type);
      if (!publicUrl) {
        alert('Upload failed. Please try again.');
        return;
      }

      if (type === 'hero') {
        setSettings({ ...settings, hero_image: publicUrl });
      } else {
        setSettings({ ...settings, about_image: publicUrl });
      }
      alert('Image uploaded! Remember to hit "Save All Settings".');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setImageUploading((prev) => ({ ...prev, [type]: false }));
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black mb-2 text-white">Site Settings</h2>
        <p className="text-gray-400">Manage your website content and appearance</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Picture */}
        <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
          <h3 className="text-xl font-bold mb-4 text-white">Profile Picture</h3>
          <div className="flex items-center gap-6">
            <div className="relative">
              {profilePicture || localStorage.getItem('admin_profile_picture') ? (
                <img 
                  src={profilePicture || localStorage.getItem('admin_profile_picture') || ''} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-xl object-cover shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-black text-4xl">E</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2 text-white">Upload Profile Picture</label>
              <input
                type="file"
                accept="image/*"
                disabled={uploadingProfile}
                onChange={handleProfilePictureUpload}
                className={`w-full px-4 py-3 bg-gray-800 border border-purple-500/20 rounded-xl focus:outline-none focus:border-purple-500 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-purple-600 file:to-blue-600 file:text-white hover:file:shadow-lg file:cursor-pointer ${uploadingProfile ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
              <p className="text-xs text-gray-400 mt-2">
                {uploadingProfile ? 'Uploading image...' : 'Max size: 5MB. Recommended: Square image (500x500px)'}
              </p>
            </div>
          </div>
        </div>

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
                  disabled={imageUploading.hero}
                  onChange={(e) => handleImageUpload('hero', e)}
                  className={`w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer ${imageUploading.hero ? 'opacity-60 cursor-not-allowed' : ''}`}
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
                  disabled={imageUploading.about}
                  onChange={(e) => handleImageUpload('about', e)}
                  className={`w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer ${imageUploading.about ? 'opacity-60 cursor-not-allowed' : ''}`}
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


        {/* Sync Data Across Devices */}
        <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
            <Upload size={20} className="text-purple-400" />
            Sync Data Across Devices
          </h3>
          
          {/* Auto-Sync URL */}
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
            <p className="text-sm text-green-300 mb-2">
              <strong>✨ Auto-Sync Enabled!</strong>
            </p>
            <p className="text-xs text-gray-300 mb-3">
              Open this URL on your other devices to automatically sync all data:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={(() => {
                  const code = localStorage.getItem('current_sync_code') || Math.random().toString(36).substring(2, 8).toUpperCase();
                  if (!localStorage.getItem('current_sync_code')) {
                    localStorage.setItem('current_sync_code', code);
                  }
                  return `${window.location.origin}${window.location.pathname}?sync=${code}`;
                })()}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={() => {
                  const code = localStorage.getItem('current_sync_code') || Math.random().toString(36).substring(2, 8).toUpperCase();
                  const url = `${window.location.origin}${window.location.pathname}?sync=${code}`;
                  navigator.clipboard.writeText(url);
                  alert('Sync URL copied! Open this on your other device.');
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              💡 Tip: Bookmark this URL on all your devices for instant sync!
            </p>
          </div>
          
          <p className="text-gray-300 mb-4 text-sm">
            Or manually export/import data between devices:
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                const data = {
                  settings: localStorage.getItem('site_settings'),
                  videos: localStorage.getItem('videos'),
                  hero_description: localStorage.getItem('hero_description'),
                  messages: localStorage.getItem('chat_messages'),
                  timestamp: Date.now()
                };
                const dataStr = JSON.stringify(data);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `esther-reign-data-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
                alert('Data exported! Transfer this file to your other device.');
              }}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Upload size={18} />
              Export Data
            </button>
            
            <label className="px-6 py-3 bg-pink-600 hover:bg-pink-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer">
              <Upload size={18} className="rotate-180" />
              Import Data
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const data = JSON.parse(event.target?.result as string);
                        if (data.settings) localStorage.setItem('site_settings', data.settings);
                        if (data.videos) localStorage.setItem('videos', data.videos);
                        if (data.hero_description) localStorage.setItem('hero_description', data.hero_description);
                        if (data.messages) localStorage.setItem('chat_messages', data.messages);
                        alert('Data imported successfully! Reloading page...');
                        setTimeout(() => window.location.reload(), 1000);
                      } catch (error) {
                        alert('Error importing data. Please check the file.');
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
              />
            </label>
          </div>
          
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-sm text-blue-300">
              <strong>How to sync:</strong><br/>
              1. On your computer: Click "Export Data" and save the file<br/>
              2. Transfer the file to your phone (email, WhatsApp, etc.)<br/>
              3. On your phone: Open admin panel, click "Import Data" and select the file<br/>
              4. All your settings, images, and videos will sync!
            </p>
          </div>
        </div>
