/**
 * Admin Chat Widget - Rebuilt from scratch
 * Features: Fits properly on screen (mobile & PC), video references, emojis, sound, edit/delete
 */

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Smile, Paperclip, Trash2, Edit2, Video as VideoIcon, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User, Video } from '../types';

interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  message: string;
  timestamp: string;
  video_id?: string;
  edited?: boolean;
}

interface AdminChatWidgetProps {
  currentUser: User;
  videos?: Video[];
}

const EMOJIS = ['😊', '😂', '🥰', '😍', '🤗', '😘', '😎', '🤩', '🥳', '👍', '👏', '🙌', '💪', '🙏', '❤️', '💖', '💕', '🎵', '🎶', '🎤', '✨', '⭐', '🌟', '🔥', '💯', '🎉'];

const playNotificationSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const audioContext = new AudioContextClass();
    
    // Resume context if suspended
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
    
    oscillator.onended = () => {
      audioContext.close();
    };
  } catch (error) {
    console.log('Audio notification error:', error);
  }
};

export const AdminChatWidget: React.FC<AdminChatWidgetProps> = ({ currentUser, videos = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showVideoPicker, setShowVideoPicker] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string>('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [unread, setUnread] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const otherUser = currentUser.role === 'artist' ? 'Editor' : 'Esther Reign';

  useEffect(() => {
    loadMessages();
    setupRealtimeSubscription();
  }, []);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setUnread(0);
    }
  }, [messages, isOpen]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('timestamp', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      
      if (!isOpen) {
        const unreadCount = (data || []).filter((m: ChatMessage) => m.sender_id !== currentUser.id).length;
        setUnread(Math.min(unreadCount, 9));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('admin_chat_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as ChatMessage;
            setMessages(prev => {
              if (prev.find(m => m.id === newMessage.id)) return prev;
              return [...prev, newMessage];
            });
            
            if (newMessage.sender_id !== currentUser.id) {
              playNotificationSound();
              if (!isOpen) {
                setUnread(prev => Math.min(prev + 1, 9));
              }
            }
          } else if (payload.eventType === 'DELETE') {
            setMessages(prev => prev.filter(m => m.id !== (payload.old as any).id));
          } else if (payload.eventType === 'UPDATE') {
            setMessages(prev => prev.map(m => 
              m.id === payload.new.id ? payload.new as ChatMessage : m
            ));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!input.trim() && !selectedVideo) return;

    const video = selectedVideo ? videos.find(v => v.id === selectedVideo) : null;
    const messageText = input.trim() || (selectedVideo && video ? `📹 Referencing: ${video.title}` : '📹 Video reference');

    const newMsg: any = {
      sender_id: currentUser.id,
      sender_name: currentUser.name,
      message: messageText,
      timestamp: new Date().toISOString(),
      video_id: selectedVideo || null,
      edited: false
    };

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([newMsg])
        .select()
        .single();

      if (error) throw error;
      
      // Add to local state immediately
      if (data) {
        setMessages(prev => [...prev, data as ChatMessage]);
      }
      
      setInput('');
      setSelectedVideo('');
      setShowVideoPicker(false);
      
      // Play sound for sent message (optional)
      // playNotificationSound();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  };

  const startEdit = (message: ChatMessage) => {
    setEditingMessageId(message.id);
    setEditText(message.message);
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditText('');
  };

  const saveEdit = async (messageId: string) => {
    if (!editText.trim()) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ 
          message: editText.trim(),
          edited: true,
          timestamp: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) throw error;
      setEditingMessageId(null);
      setEditText('');
    } catch (error) {
      console.error('Error editing message:', error);
      alert('Failed to edit message');
    }
  };

  const insertEmoji = (emoji: string) => {
    setInput(prev => prev + emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  const getVideoById = (videoId: string) => {
    return videos.find(v => v.id === videoId);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  // Floating Button
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-4 bottom-4 w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-purple-500/50 transition-all z-50 hover:scale-110"
      >
        <MessageSquare size={24} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
            {unread}
          </span>
        )}
      </button>
    );
  }

  // Chat Window - Fits properly on screen (mobile: full screen, desktop: fixed widget)
  return (
    <div className="fixed inset-0 lg:inset-auto lg:fixed lg:right-4 lg:bottom-4 lg:w-[380px] lg:h-[580px] max-w-full max-h-full bg-gradient-to-br from-[#2d1b4e] to-[#1a0a2e] backdrop-blur-2xl rounded-none lg:rounded-3xl shadow-2xl flex flex-col border-0 lg:border border-purple-500/30 z-50">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-purple-600/30 to-purple-700/30 p-4 flex items-center justify-between border-b border-purple-500/30 rounded-t-2xl lg:rounded-t-3xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
            {otherUser.charAt(0)}
          </div>
          <div>
            <h3 className="text-white font-bold text-sm md:text-base">{otherUser}</h3>
            <p className="text-xs text-purple-300">Online</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="w-8 h-8 flex items-center justify-center text-white hover:bg-purple-500/20 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.map((msg) => {
          const isOwn = msg.sender_id === currentUser.id;
          const video = msg.video_id ? getVideoById(msg.video_id) : null;

          if (editingMessageId === msg.id) {
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[85%] bg-purple-500/20 rounded-xl p-3 border border-purple-500/30">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full bg-transparent text-white outline-none text-sm mb-2"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(msg.id);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(msg.id)}
                      className="px-3 py-1 bg-purple-600 rounded-lg text-white text-xs hover:bg-purple-700"
                    >
                      <Check size={12} />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1 bg-gray-600 rounded-lg text-white text-xs hover:bg-gray-700"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${isOwn ? 'bg-gradient-to-br from-purple-600 to-purple-700' : 'bg-purple-500/20'} rounded-xl p-3 border ${isOwn ? 'border-purple-500/50' : 'border-purple-500/30'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-purple-100">{msg.sender_name}</span>
                  {msg.edited && (
                    <span className="text-xs text-purple-300">(edited)</span>
                  )}
                </div>
                
                {video && (
                  <div className="mb-2 p-2 bg-white/10 rounded-lg flex items-center gap-2">
                    <VideoIcon size={14} className="text-purple-200" />
                    <span className="text-xs text-purple-200 truncate">{video.title}</span>
                  </div>
                )}
                
                <p className="text-white text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-purple-200">{formatTime(msg.timestamp)}</span>
                  {isOwn && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(msg)}
                        className="p-1 hover:bg-purple-500/30 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={12} className="text-purple-200" />
                      </button>
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="p-1 hover:bg-red-500/30 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={12} className="text-red-300" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="flex-shrink-0 p-3 border-t border-purple-500/30 bg-[#2d1b4e]/80 rounded-b-2xl lg:rounded-b-3xl">
        {/* Video Picker */}
        {showVideoPicker && (
          <div className="mb-3 p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 max-h-32 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-purple-200">Select Video</span>
              <button
                onClick={() => setShowVideoPicker(false)}
                className="text-purple-300 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>
            <div className="space-y-1">
              {videos.length === 0 ? (
                <p className="text-xs text-purple-300">No videos available</p>
              ) : (
                videos.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => {
                      setSelectedVideo(video.id);
                      setShowVideoPicker(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-colors ${
                      selectedVideo === video.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-500/10 text-purple-200 hover:bg-purple-500/20'
                    }`}
                  >
                    {video.title}
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Emoji Picker */}
        {showEmoji && (
          <div className="mb-3 p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 grid grid-cols-8 gap-1 max-h-32 overflow-y-auto">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => insertEmoji(emoji)}
                className="text-xl hover:bg-purple-500/20 rounded-lg p-1 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Selected Video Display */}
        {selectedVideo && (
          <div className="mb-2 p-2 bg-purple-600/20 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <VideoIcon size={14} className="text-purple-300" />
              <span className="text-xs text-purple-200 truncate">
                {getVideoById(selectedVideo)?.title || 'Video selected'}
              </span>
            </div>
            <button
              onClick={() => setSelectedVideo('')}
              className="text-purple-300 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Input Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVideoPicker(!showVideoPicker)}
            className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
            title="Attach Video"
          >
            <Paperclip size={18} className="text-purple-300" />
          </button>
          
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
            title="Emoji"
          >
            <Smile size={18} className="text-purple-300" />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 text-sm focus:outline-none focus:border-purple-500"
          />

          <button
            onClick={sendMessage}
            disabled={!input.trim() && !selectedVideo}
            className="p-2 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/50 transition-all"
          >
            <Send size={18} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

