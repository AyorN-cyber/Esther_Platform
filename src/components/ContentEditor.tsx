import { useState, useEffect } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { getSettings, updateSettings } from '../lib/supabaseData';
import { useTheme } from '../contexts/ThemeContext';
import { ImageUploader } from './ImageUploader';
import type { SiteSettings } from '../lib/supabaseData';

interface ContentEditorProps {
  onContentChange?: () => void;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({ onContentChange }) => {
  const { theme } = useTheme();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Form state
  const [heroImage, setHeroImage] = useState('');
  const [heroDescription, setHeroDescription] = useState('');
  const [aboutImage, setAboutImage] = useState('');
  const [aboutText, setAboutText] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    youtube: '',
    tiktok: '',
    facebook: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getSettings();
      if (data) {
        setSettings(data);
        setHeroImage(data.hero_image || '');
        setHeroDescription(data.hero_description || 'Lifting voices in worship through powerful gospel music.');
        setAboutImage(data.about_image || '');
        setAboutText(data.about_text || 'I am an emerging gospel artist with a deep passion for worship and praise.');
        setContactEmail(data.contact_email || 'contact@estherreign.com');
        setContactPhone(data.contact_phone || '+234 818 019 4269');
        setSocialLinks(data.social_links || {
          instagram: 'https://instagram.com/estherreign',
          youtube: 'https://youtube.com/@estherreign',
          tiktok: 'https://tiktok.com/@estherreign',
          facebook: 'https://facebook.com/estherreign'
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await updateSettings({
        hero_image: heroImage,
        hero_description: heroDescription,
        about_image: aboutImage,
        about_text: aboutText,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        social_links: socialLinks
      });

      if (success) {
        setHasChanges(false);
        onContentChange?.();
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings. Please try again.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please check console for details.');
    }
    setSaving(false);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all changes?')) {
      loadSettings();
      setHasChanges(false);
    }
  };

  const markAsChanged = () => {
    if (!hasChanges) setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Content Management
        </h2>
        <div className="flex gap-2">
          {hasChanges && (
            <button
              onClick={handleReset}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <RotateCcw size={16} />
              Reset
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Hero Section */}
        <div className={`p-6 border rounded-lg ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Hero Section
          </h3>
          
          <div className="space-y-4">
            <ImageUploader
              label="Hero Image"
              currentImage={heroImage}
              onImageChange={(image) => {
                setHeroImage(image);
                markAsChanged();
              }}
              aspectRatio="16:9"
            />
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Hero Description
              </label>
              <textarea
                value={heroDescription}
                onChange={(e) => {
                  setHeroDescription(e.target.value);
                  markAsChanged();
                }}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Enter hero description..."
              />
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className={`p-6 border rounded-lg ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            About Section
          </h3>
          
          <div className="space-y-4">
            <ImageUploader
              label="About Image"
              currentImage={aboutImage}
              onImageChange={(image) => {
                setAboutImage(image);
                markAsChanged();
              }}
              aspectRatio="4:3"
            />
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                About Text
              </label>
              <textarea
                value={aboutText}
                onChange={(e) => {
                  setAboutText(e.target.value);
                  markAsChanged();
                }}
                rows={6}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Enter about text..."
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className={`p-6 border rounded-lg ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Contact Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => {
                  setContactEmail(e.target.value);
                  markAsChanged();
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="contact@example.com"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Phone
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => {
                  setContactPhone(e.target.value);
                  markAsChanged();
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className={`p-6 border rounded-lg ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Social Media Links
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(socialLinks).map(([platform, url]) => (
              <div key={platform}>
                <label className={`block text-sm font-medium mb-2 capitalize ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {platform}
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setSocialLinks({ ...socialLinks, [platform]: e.target.value });
                    markAsChanged();
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder={`https://${platform}.com/username`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
