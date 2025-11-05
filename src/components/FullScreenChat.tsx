/**
 * FullScreenChat - Reliable mobile-first chat
 * Takes full screen on mobile, works perfectly with keyboard
 */

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Smile, Trash2, Video as VideoIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getVideos } from '../lib/supabaseData';
import type { User, Video } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  message: string;
  timestamp: string;
  voice_data?: string;
  voice_duration?: number;
  video_reference?: string;
}

interface FullScreenChatProps {
  currentUser: User;
}

// Emoji list moved inline to avoid unused warning

export const FullScreenChat: React.FC<FullScreenChatProps> = ({ currentUser }) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showVideoSelector, setShowVideoSelector] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string>('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [unreadCount] = useState(0); // Removed setUnreadCount as it's unused
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const otherUser = currentUser.role === 'artist' ? 'Manager' : 'Esther Reign';

  useEffect(() => {
    loadMessages();
    loadVideos();
    setupRealtimeSubscription();
  }, []);

  const loadVideos = async () => {
    const videosData = await getVideos();
    setVideos(videosData);
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('timestamp', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('chat_messages_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, () => {
        loadMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && !selectedVideo) return;

    const message: Message = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sender_id: currentUser.id,
      sender_name: currentUser.name,
      message: newMessage.trim() || '📹 Video reference',
      timestamp: new Date().toISOString(),
      video_reference: selectedVideo || undefined
    };

    try {
      const { error } = await supabase.from('chat_messages').insert([message]);
      if (error) throw error;

      setNewMessage('');
      setSelectedVideo('');
      setShowVideoSelector(false);
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const clearAllMessages = async () => {
    try {
      const { error } = await supabase.from('chat_messages').delete().neq('id', '');
      if (error) throw error;
      setMessages([]);
    } catch (error) {
      console.error('Error clearing messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 right-4 md:bottom-6 md:right-6 w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 z-[100] ${
          theme === 'dark' 
            ? 'bg-gradient-to-br from-purple-600 to-pink-600' 
            : 'bg-gradient-to-br from-[#008069] to-[#00a884]'
        } hover:scale-110`}
      >
        <MessageCircle size={28} className="text-white" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>
    );
  }

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header - Fixed */}
      <div className={`flex-shrink-0 ${theme === 'dark' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gradient-to-r from-purple-600 to-pink-600'} p-4 flex items-center justify-between shadow-md`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
            {otherUser[0]}
          </div>
          <div>
            <h3 className="font-semibold text-white text-base">{otherUser}</h3>
            <p className="text-xs text-white/80">Online</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm('Clear all messages?')) clearAllMessages();
            }}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <Trash2 size={18} className="text-white" />
          </button>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} className="text-white" />
          </button>
        </div>
      </div>

      {/* Messages - Scrollable */}
      <div
        ref={messagesContainerRef}
        className={`flex-1 overflow-y-auto p-4 space-y-3 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {messages.map((msg) => {
          const isOwn = msg.sender_id === currentUser.id;
          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${isOwn ? 'items-end' : 'items-start'}`}>
                {!isOwn && <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1 ml-1`}>{msg.sender_name}</span>}
                <div className={`rounded-2xl px-4 py-3 shadow ${
                  isOwn 
                    ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white' 
                    : theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                }`}>
                  {msg.video_reference && (
                    <div className={`mb-2 p-2 rounded-lg ${isOwn ? 'bg-white/20' : theme === 'dark' ? 'bg-gray-600' : 'bg-purple-50'}`}>
                      <div className="flex items-center gap-2">
                        <VideoIcon size={16} className={isOwn ? 'text-white' : theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} />
                        <span className={`text-xs font-medium ${isOwn ? 'text-white' : theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                          Video Reference
                        </span>
                      </div>
                    </div>
                  )}
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>
                  <div className={`text-[11px] mt-1 ${isOwn ? 'text-white/70' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Fixed */}
      <div className={`flex-shrink-0 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t p-4`}>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowEmoji(!showEmoji)} className={`p-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full`}>
            <Smile size={22} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
          </button>
          
          <button onClick={() => setShowVideoSelector(!showVideoSelector)} className={`p-2 rounded-full ${selectedVideo ? 'bg-purple-100' : theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
            <VideoIcon size={22} className={selectedVideo ? 'text-purple-600' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className={`flex-1 px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-100 text-gray-900 placeholder-gray-500'} border-none rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm`}
          />

          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() && !selectedVideo}
            className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <Send size={18} className="text-white" />
          </button>
        </div>

        {showVideoSelector && videos.length > 0 && (
          <div className={`mt-2 max-h-40 overflow-y-auto ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-2`}>
            {videos.map((video) => (
              <button
                key={video.id}
                onClick={() => {
                  setSelectedVideo(video.id);
                  setShowVideoSelector(false);
                  setNewMessage(`📹 ${video.title}`);
                }}
                className={`w-full text-left p-2 rounded ${selectedVideo === video.id ? 'bg-purple-100 text-purple-700' : theme === 'dark' ? 'hover:bg-gray-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                <div className="text-sm font-medium truncate">{video.title}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
