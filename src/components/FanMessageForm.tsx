import { useState } from 'react';
import { Send, Heart, Music, Calendar, MessageCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const FanMessageForm = () => {
  const [formData, setFormData] = useState({
    from_name: '',
    from_email: '',
    message_type: 'general' as 'prayer_request' | 'testimony' | 'song_request' | 'general' | 'booking_inquiry',
    subject: '',
    message: '',
    is_anonymous: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('fan_messages')
        .insert([{
          ...formData,
          status: 'unread',
          is_prayed_for: false,
          is_featured: false
        }]);

      if (error) throw error;

      setSubmitted(true);
      setFormData({
        from_name: '',
        from_email: '',
        message_type: 'general',
        subject: '',
        message: '',
        is_anonymous: false
      });

      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Error submitting message:', error);
      alert('Failed to send message. Please try again.');
    }
    setSubmitting(false);
  };

  const messageTypes = [
    { value: 'prayer_request', label: 'Prayer Request', icon: Heart, color: 'pink' },
    { value: 'testimony', label: 'Testimony', icon: MessageCircle, color: 'green' },
    { value: 'song_request', label: 'Song Request', icon: Music, color: 'purple' },
    { value: 'booking_inquiry', label: 'Booking Inquiry', icon: Calendar, color: 'blue' },
    { value: 'general', label: 'General Message', icon: MessageCircle, color: 'gray' }
  ];

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="bg-purple-500/20 border-2 border-purple-500/30 rounded-2xl p-8 backdrop-blur-xl">
          <CheckCircle size={64} className="mx-auto mb-4 text-purple-400" />
          <h2 className="text-2xl font-bold text-white mb-2">Message Sent!</h2>
          <p className="text-purple-200">
            Thank you for reaching out. We'll get back to you soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <div className="bg-black/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 md:p-8 border-2 border-purple-500/30">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-2">
            Send a Message
          </h2>
          <p className="text-purple-200">
            Share your prayer request, testimony, or get in touch with Esther Reign
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Message Type */}
          <div>
            <label className="block text-sm font-semibold text-purple-200 mb-3">
              What would you like to share? *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {messageTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, message_type: type.value as any })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.message_type === type.value
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-purple-500/20 hover:border-purple-500/40 bg-purple-500/5'
                    }`}
                  >
                    <Icon size={24} className={`mx-auto mb-2 ${formData.message_type === type.value ? 'text-purple-300' : 'text-purple-400'}`} />
                    <p className={`text-xs font-medium ${formData.message_type === type.value ? 'text-white' : 'text-purple-200'}`}>{type.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-purple-200 mb-2">
              Your Name {!formData.is_anonymous && '*'}
            </label>
            <input
              type="text"
              value={formData.from_name}
              onChange={(e) => setFormData({ ...formData, from_name: e.target.value })}
              disabled={formData.is_anonymous}
              required={!formData.is_anonymous}
              className="w-full px-4 py-3 bg-purple-500/10 text-white border-2 border-purple-500/30 rounded-xl focus:border-purple-500 focus:outline-none transition-colors disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="Enter your name"
            />
            <label className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={formData.is_anonymous}
                onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked, from_name: e.target.checked ? 'Anonymous' : '' })}
                className="rounded"
              />
              <span className="text-sm text-purple-200">Send anonymously</span>
            </label>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-purple-200 mb-2">
              Email (optional)
            </label>
            <input
              type="email"
              value={formData.from_email}
              onChange={(e) => setFormData({ ...formData, from_email: e.target.value })}
              className="w-full px-4 py-3 bg-purple-500/10 text-white border-2 border-purple-500/30 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="your@email.com"
            />
            <p className="text-xs text-purple-300 mt-1">We'll only use this to respond to you</p>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold text-purple-200 mb-2">
              Subject (optional)
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-3 bg-purple-500/10 text-white border-2 border-purple-500/30 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="Brief subject line"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-purple-200 mb-2">
              Your Message *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              rows={6}
              className="w-full px-4 py-3 bg-purple-500/10 text-white border-2 border-purple-500/30 rounded-xl focus:border-purple-500 focus:outline-none transition-colors resize-none"
              placeholder="Share your message, prayer request, testimony, or inquiry..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !formData.message.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-purple-500/50"
          >
            <Send size={20} />
            {submitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
};
