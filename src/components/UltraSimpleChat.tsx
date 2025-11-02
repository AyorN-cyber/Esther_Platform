/**
 * Ultra Simple Chat - Works immediately, no setup required
 * Uses localStorage + storage events for instant sync
 */

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Smile, Paperclip, Video as VideoIcon } from 'lucide-react';
import type { User, Video } from '../types';

interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  message: string;
  timestamp: string;
  video_id?: string;
}

interface UltraSimpleChatProps {
  currentUser: User;
}

const EMOJIS = ['😊', '😂', '🥰', '😍', '🤗', '😘', '😎', '🤩', '🥳', '👍', '👏', '🙌', '💪', '🙏', '❤️', '💖', '💕', '🎵', '🎶', '🎤', '✨', '⭐', '🌟', '🔥', '💯', '🎉'];

export const UltraSimpleChat: React.FC<UltraSimpleChatProps> = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showVideos, setShowVideos] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [unread, setUnread] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const otherUser = currentUser.role === 'artist' ? 'Manager' : 'Esther Reign';

  // Load messages and videos
  useEffect(() => {
    loadMessages();
    loadVideos();
    
    // Listen for new messages from other tabs/devices
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'ultra_chat_messages') {
        loadMessages();
      }
    };
    
    window.addEventListener('storage', handleStorage);
    
    // Poll for updates every 500ms (simple and reliable)
    const interval = setInterval(loadMessages, 500);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const container = containerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      if (isNearBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages, isOpen]);

  // Update unread count
  useEffect(() => {
    if (!isOpen) {
      const unreadCount = messages.filter(m => m.sender_id !== currentUser.id).length;
      setUnread(Math.min(unreadCount, 9));
    } else {
      setUnread(0);
    }
  }, [messages, isOpen, currentUser.id]);

  const loadMessages = () => {
    const saved = localStorage.getItem('ultra_chat_messages');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        setMessages([]);
      }
    }
  };

  const loadVideos = () => {
    const saved = localStorage.getItem('videos');
    if (saved) {
      try {
        setVideos(JSON.parse(saved));
      } catch (e) {
        setVideos([]);
      }
    }
  };

  const sendMessage = () => {
    if (!input.trim() && !selectedVideo) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString() + Math.random(),
      sender_id: currentUser.id,
      sender_name: currentUser.name,
      message: input.trim() || '📹 Video',
      timestamp: new Date().toISOString(),
      video_id: selectedVideo || undefined
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    localStorage.setItem('ultra_chat_messages', JSON.stringify(updated));
    
    // Trigger storage event for other tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'ultra_chat_messages',
      newValue: JSON.stringify(updated),
      url: window.location.href
    }));

    setInput('');
    setSelectedVideo('');
    setShowVideos(false);
    playSound();
  };

  const clearChat = () => {
    if (confirm('Clear all messages? This cannot be undone.')) {
      setMessages([]);
      localStorage.setItem('ultra_chat_messages', JSON.stringify([]));
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'ultra_chat_messages',
        newValue: '[]',
        url: window.location.href
      }));
    }
  };

  const playSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (ts: string) => {
    const d = new Date(ts);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (d.toDateString() === today) return 'Today';
    if (d.toDateString() === yesterday) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getVideo = (id: string) => videos.find(v => v.id === id);

  return (
    <>
      {/* Float Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-20 right-4 md:bottom-6 md:right-6 w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl flex items-center justify-center transition-all z-[100] ${
          isOpen ? 'scale-0' : 'bg-gradient-to-br from-purple-600 to-pink-600 hover:scale-110'
        }`}
      >
        <MessageCircle size={28} className="text-white" />
        {unread > 0 && !isOpen && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {unread > 9 ? '9+' : unread}
          </div>
        )}
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-0 right-0 md:bottom-6 md:right-6 w-full md:w-[400px] h-full md:h-[600px] bg-white md:rounded-2xl shadow-2xl flex flex-col transition-all z-[100] ${
          isOpen ? 'scale-100' : 'scale-0 pointer-events-none'
        }`}
        style={{ transformOrigin: 'bottom right' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-pink-600 p-4 md:rounded-t-2xl flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-purple-600 font-bold">
              {otherUser[0]}
            </div>
            <div>
              <h3 className="font-semibold text-white">{otherUser}</h3>
              <p className="text-xs text-white/80">Online</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={clearChat} className="p-2 hover:bg-white/20 rounded-full" title="Clear chat">
              <X size={18} className="text-white" />
            </button>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full">
              <X size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto p-4 space-y-3"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='b' x='0' y='0' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='10' cy='10' r='1.5' fill='%23d1d7db' opacity='0.4'/%3E%3Ccircle cx='30' cy='25' r='1' fill='%23d1d7db' opacity='0.3'/%3E%3Ccircle cx='50' cy='15' r='1.2' fill='%23d1d7db' opacity='0.35'/%3E%3Ccircle cx='20' cy='40' r='0.8' fill='%23d1d7db' opacity='0.3'/%3E%3Ccircle cx='45' cy='50' r='1.3' fill='%23d1d7db' opacity='0.4'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='60' height='60' fill='%23e5ddd5'/%3E%3Crect width='60' height='60' fill='url(%23b)'/%3E%3C/svg%3E")`,
            backgroundColor: '#e5ddd5'
          }}
        >
          {messages.map((msg, i) => {
            const isOwn = msg.sender_id === currentUser.id;
            const showDate = i === 0 || new Date(messages[i-1].timestamp).toDateString() !== new Date(msg.timestamp).toDateString();
            const video = msg.video_id ? getVideo(msg.video_id) : null;

            return (
              <React.Fragment key={msg.id}>
                {showDate && (
                  <div className="flex justify-center my-3">
                    <div className="px-3 py-1 bg-white/80 rounded-full text-xs text-gray-600 font-medium shadow-sm">
                      {formatDate(msg.timestamp)}
                    </div>
                  </div>
                )}
                
                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                    {!isOwn && (
                      <span className="text-xs text-gray-600 mb-1 ml-1 font-medium">{msg.sender_name}</span>
                    )}
                    <div className={`rounded-2xl px-4 py-3 shadow-lg ${
                      isOwn ? 'bg-gradient-to-br from-purple-600 to-pink-500 text-white' : 'bg-white text-gray-900'
                    }`}>
                      {video && (
                        <div className={`mb-2 p-2 rounded-lg flex items-center gap-2 ${
                          isOwn ? 'bg-white/20' : 'bg-purple-50'
                        }`}>
                          <VideoIcon size={16} className={isOwn ? 'text-white' : 'text-purple-600'} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold ${isOwn ? 'text-white' : 'text-purple-600'}`}>
                              Video Reference
                            </p>
                            <p className={`text-xs truncate ${isOwn ? 'text-white/90' : 'text-gray-600'}`}>
                              {video.title}
                            </p>
                          </div>
                        </div>
                      )}
                      <p className="text-[15px] whitespace-pre-wrap break-words">{msg.message}</p>
                      <div className={`text-[11px] mt-1 ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t md:rounded-b-2xl">
          {selectedVideo && (
            <div className="mb-2 p-2 bg-purple-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <VideoIcon size={16} className="text-purple-600" />
                <span className="text-sm text-gray-700 truncate">{getVideo(selectedVideo)?.title}</span>
              </div>
              <button onClick={() => setSelectedVideo('')} className="p-1 hover:bg-purple-100 rounded">
                <X size={16} />
              </button>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            {/* Attach Video */}
            <div className="relative">
              <button
                onClick={() => setShowVideos(!showVideos)}
                className={`p-2 rounded-full ${selectedVideo ? 'bg-purple-100 text-purple-600' : 'hover:bg-gray-100'}`}
              >
                <Paperclip size={20} />
              </button>
              
              {showVideos && videos.length > 0 && (
                <div className="absolute bottom-full mb-2 left-0 w-72 bg-white rounded-xl border shadow-2xl max-h-64 overflow-y-auto">
                  <div className="p-2 bg-purple-50 border-b">
                    <p className="text-xs font-semibold text-purple-600">Attach Video</p>
                  </div>
                  {videos.map(v => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedVideo(v.id);
                        setShowVideos(false);
                      }}
                      className="w-full p-3 hover:bg-purple-50 text-left flex items-center gap-2 border-b last:border-0"
                    >
                      <VideoIcon size={16} className="text-purple-600" />
                      <span className="text-sm truncate">{v.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Emoji */}
            <div className="relative">
              <button onClick={() => setShowEmoji(!showEmoji)} className="p-2 hover:bg-gray-100 rounded-full">
                <Smile size={20} />
              </button>
              
              {showEmoji && (
                <div className="absolute bottom-full mb-2 left-0 w-64 bg-white rounded-xl border shadow-2xl p-3">
                  <div className="grid grid-cols-6 gap-2">
                    {EMOJIS.map(e => (
                      <button
                        key={e}
                        onClick={() => {
                          setInput(input + e);
                          setShowEmoji(false);
                        }}
                        className="text-2xl hover:bg-purple-50 rounded p-2"
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />

            {/* Send */}
            <button
              onClick={sendMessage}
              disabled={!input.trim() && !selectedVideo}
              className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full disabled:opacity-50 shadow-md"
            >
              <Send size={18} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
