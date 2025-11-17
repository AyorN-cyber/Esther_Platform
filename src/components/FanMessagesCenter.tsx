import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Mail, Heart, Music, Calendar, MessageCircle, Check, X, Send, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FanMessage {
  id: string;
  from_name: string;
  from_email?: string;
  message_type: 'prayer_request' | 'testimony' | 'song_request' | 'general' | 'booking_inquiry';
  subject?: string;
  message: string;
  status: 'unread' | 'read' | 'responded' | 'archived' | 'flagged';
  is_anonymous: boolean;
  is_prayed_for: boolean;
  is_featured: boolean;
  response?: string;
  responded_at?: string;
  responded_by?: string;
  follow_up_date?: string;
  tags?: string[];
  created_at: string;
}

export const FanMessagesCenter = () => {
  const [messages, setMessages] = useState<FanMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<FanMessage | null>(null);
  const [response, setResponse] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'prayer_request' | 'testimony'>('all');
  const [modalScrollPosition, setModalScrollPosition] = useState(0);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('fan_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
    setLoading(false);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('fan_messages')
        .update({ status: 'read' })
        .eq('id', id);

      if (error) throw error;
      setMessages(messages.map(m => m.id === id ? { ...m, status: 'read' as const } : m));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAsPrayed = async (id: string) => {
    try {
      const { error } = await supabase
        .from('fan_messages')
        .update({ is_prayed_for: true })
        .eq('id', id);

      if (error) throw error;
      setMessages(messages.map(m => m.id === id ? { ...m, is_prayed_for: true } : m));
    } catch (error) {
      console.error('Error marking as prayed:', error);
    }
  };

  const handleSendResponse = async () => {
    if (!selectedMessage || !response.trim()) return;

    try {
      const { error } = await supabase
        .from('fan_messages')
        .update({
          status: 'responded',
          response: response,
          responded_at: new Date().toISOString()
        })
        .eq('id', selectedMessage.id);

      if (error) throw error;
      
      setMessages(messages.map(m => 
        m.id === selectedMessage.id 
          ? { ...m, status: 'responded' as const, response, responded_at: new Date().toISOString() }
          : m
      ));
      
      setSelectedMessage(null);
      setResponse('');
      alert('Response sent!');
    } catch (error) {
      console.error('Error sending response:', error);
      alert('Failed to send response');
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      prayer_request: Heart,
      testimony: MessageCircle,
      song_request: Music,
      booking_inquiry: Calendar,
      general: Mail
    };
    return icons[type] || Mail;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      prayer_request: 'pink',
      testimony: 'green',
      song_request: 'purple',
      booking_inquiry: 'blue',
      general: 'gray'
    };
    return colors[type] || 'gray';
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('fan_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setMessages(messages.filter(m => m.id !== id));
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
      alert('Message deleted successfully');
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  };

  const filteredMessages = messages.filter(m => {
    if (filter === 'all') return true;
    if (filter === 'unread') return m.status === 'unread';
    return m.message_type === filter;
  });

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white">
            Fan Messages
          </h2>
          <p className="text-sm text-purple-300">
            {unreadCount} unread messages
          </p>
        </div>

        <div className="flex gap-2">
          {(['all', 'unread', 'prayer_request', 'testimony'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                filter === f
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border border-purple-500/30'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredMessages.map((message) => {
          const Icon = getTypeIcon(message.message_type);
          const color = getTypeColor(message.message_type);

          return (
            <div
              key={message.id}
              className={`p-6 rounded-xl border transition-all cursor-pointer ${
                message.status === 'unread'
                  ? 'bg-purple-900/30 border-purple-500/50'
                  : 'bg-purple-500/10 border-purple-500/20'
              }`}
              onClick={() => {
                // Capture current scroll position
                const mainContent = document.querySelector('.flex-1.overflow-y-auto');
                if (mainContent) {
                  setModalScrollPosition(mainContent.scrollTop);
                }
                setSelectedMessage(message);
                if (message.status === 'unread') {
                  handleMarkAsRead(message.id);
                }
              }}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg bg-${color}-100`}>
                  <Icon size={24} className={`text-${color}-600`} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize bg-${color}-100 text-${color}-700`}>
                      {message.message_type.replace('_', ' ')}
                    </span>
                    {message.status === 'unread' && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                        New
                      </span>
                    )}
                    {message.is_prayed_for && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                        🙏 Prayed
                      </span>
                    )}
                    {message.is_featured && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
                        ⭐ Featured
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold mb-1 text-white">
                    {message.subject || 'No Subject'}
                  </h3>

                  <p className="text-sm mb-2 text-purple-300">
                    From: {message.is_anonymous ? 'Anonymous' : message.from_name}
                  </p>

                  <p className="text-sm line-clamp-2 text-purple-200">
                    {message.message}
                  </p>

                  <p className="text-xs mt-2 text-purple-400">
                    {new Date(message.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  {message.message_type === 'prayer_request' && !message.is_prayed_for && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsPrayed(message.id);
                      }}
                      className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Mark Prayed
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMessage(message.id);
                    }}
                    className="p-2 rounded hover:bg-red-500/20 transition-colors"
                    title="Delete message"
                  >
                    <Trash2 size={18} className="text-red-400 hover:text-red-300" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredMessages.length === 0 && (
          <div className="text-center py-12">
            <Mail size={48} className="mx-auto mb-4 text-purple-400" />
            <p className="text-lg font-medium text-purple-300">
              No messages yet
            </p>
          </div>
        )}
      </div>
    </div>

      {/* Message Detail Modal */}
      {selectedMessage && createPortal(
        <div className="message-modal-overlay fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] overflow-y-auto">
          <div className="flex justify-center" style={{ paddingTop: `${modalScrollPosition}px`, paddingBottom: '2rem' }}>
            <div className="w-full max-w-2xl bg-[#2d1b4e] backdrop-blur-xl rounded-2xl shadow-xl border border-purple-500/30">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {selectedMessage.subject || 'Message Details'}
                </h3>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="p-1 rounded hover:bg-purple-500/20 transition-colors"
                >
                  <X size={20} className="text-purple-300" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-purple-200">
                    From
                  </label>
                  <p className="text-white">
                    {selectedMessage.is_anonymous ? 'Anonymous' : selectedMessage.from_name}
                    {selectedMessage.from_email && ` (${selectedMessage.from_email})`}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-purple-200">
                    Message
                  </label>
                  <p className="whitespace-pre-wrap text-purple-100">
                    {selectedMessage.message}
                  </p>
                </div>

                {selectedMessage.response && (
                  <div>
                    <label className="block text-sm font-medium mb-1 text-purple-200">
                      Your Response
                    </label>
                    <p className="whitespace-pre-wrap text-purple-100">
                      {selectedMessage.response}
                    </p>
                  </div>
                )}

                {selectedMessage.status !== 'responded' && (
                  <div>
                    <label className="block text-sm font-medium mb-1 text-purple-200">
                      Send Response
                    </label>
                    <textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg resize-none text-white placeholder-purple-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Type your response..."
                    />
                    <button
                      onClick={handleSendResponse}
                      disabled={!response.trim()}
                      className="mt-2 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                    >
                      <Send size={16} />
                      Send Response
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="flex-1 px-4 py-2 border border-purple-500/30 rounded-lg text-purple-200 hover:bg-purple-500/20 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
