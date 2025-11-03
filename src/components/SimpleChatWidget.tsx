/**
 * SimpleChatWidget - Rebuilt from scratch with Supabase real-time
 * 
 * Simple, reliable chat with:
 * - Real-time Supabase subscriptions (no polling)
 * - Instant message delivery
 * - Reliable clear chat
 * - WhatsApp-style design
 * - Mobile optimized
 */

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Smile, Mic, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

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

interface SimpleChatWidgetProps {
  currentUser: User;
}

const EMOJI_LIST = ['😊', '😂', '🥰', '😍', '🤗', '😘', '😎', '🤩', '🥳', '😋', '😜', '🤪', '👍', '👏', '🙌', '🤝', '💪', '🙏', '❤️', '💖', '💕', '💗', '💙', '💚', '💛', '🧡', '💜', '🎵', '🎶', '🎤', '🎧', '✨', '⭐', '🌟', '💫', '🔥', '💯', '🎉', '🎊'];

export const SimpleChatWidget: React.FC<SimpleChatWidgetProps> = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  const otherUser = currentUser.role === 'artist' ? 'Manager' : 'Esther Reign';

  // Load messages from Supabase on mount
  useEffect(() => {
    loadMessages();
    setupRealtimeSubscription();
  }, []);

  // Auto-scroll only when near bottom
  useEffect(() => {
    if (isOpen && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      if (isNearBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages, isOpen]);

  // Update unread count
  useEffect(() => {
    if (!isOpen) {
      const unread = messages.filter(m => m.sender_id !== currentUser.id).length;
      setUnreadCount(Math.min(unread, 9));
    } else {
      setUnreadCount(0);
    }
  }, [messages, isOpen, currentUser.id]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target as Node)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('timestamp', { ascending: true });

      if (error) throw error;
      if (data) {
        setMessages(data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      // Fallback to empty array
      setMessages([]);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('chat_messages_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          console.log('Real-time update:', payload);
          
          if (payload.eventType === 'INSERT') {
            setMessages(prev => [...prev, payload.new as Message]);
          } else if (payload.eventType === 'DELETE') {
            setMessages(prev => prev.filter(m => m.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setMessages(prev => prev.map(m => m.id === payload.new.id ? payload.new as Message : m));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sender_id: currentUser.id,
      sender_name: currentUser.name,
      message: newMessage.trim(),
      timestamp: new Date().toISOString()
    };

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([message]);

      if (error) throw error;

      setNewMessage('');
      playNotificationSound();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const clearAllMessages = async () => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .neq('id', ''); // Delete all rows

      if (error) throw error;

      setMessages([]);
      setShowClearConfirm(false);
      alert('Chat cleared successfully!');
    } catch (error) {
      console.error('Error clearing messages:', error);
      alert('Failed to clear chat. Please try again.');
    }
  };

  const handleVoiceNote = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        const startTime = Date.now();
        let recordingTimer: NodeJS.Timeout;

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const duration = Math.floor((Date.now() - startTime) / 1000);
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            
            const voiceMessage: Message = {
              id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              sender_id: currentUser.id,
              sender_name: currentUser.name,
              message: `🎤 Voice message`,
              timestamp: new Date().toISOString(),
              voice_data: base64Audio,
              voice_duration: duration
            };

            try {
              const { error } = await supabase
                .from('chat_messages')
                .insert([voiceMessage]);

              if (error) throw error;
              playNotificationSound();
            } catch (error) {
              console.error('Error sending voice message:', error);
              alert('Failed to send voice message.');
            }
          };
          
          stream.getTracks().forEach(track => track.stop());
          clearInterval(recordingTimer);
          setRecordingTime(0);
        };

        mediaRecorder.start();
        setIsRecording(true);

        recordingTimer = setInterval(() => {
          setRecordingTime(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);

        setTimeout(() => {
          if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
          }
        }, 60000);

      } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Could not access microphone. Please grant permission.');
      }
    } else {
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    }
  };

  const handleVoicePlay = (messageId: string, voiceData: string) => {
    Object.values(audioRefs.current).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    setPlayingAudio(null);

    if (!audioRefs.current[messageId]) {
      const audio = new Audio(voiceData);
      audioRefs.current[messageId] = audio;

      audio.addEventListener('ended', () => {
        setPlayingAudio(null);
      });
    }

    audioRefs.current[messageId].play();
    setPlayingAudio(messageId);
  };

  const handleVoicePause = (messageId: string) => {
    if (audioRefs.current[messageId]) {
      audioRefs.current[messageId].pause();
    }
    setPlayingAudio(null);
  };

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      // Ignore audio errors
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (date.toDateString() === today) return 'Today';
    if (date.toDateString() === yesterday) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-20 right-4 md:bottom-6 md:right-6 w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 z-[100] ${
          isOpen ? 'bg-gray-200 scale-0' : 'bg-gradient-to-br from-[#008069] to-[#00a884] hover:scale-110'
        }`}
      >
        <MessageCircle size={28} className="text-white" />
        {unreadCount > 0 && !isOpen && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {/* Chat Widget */}
      <div
        className={`fixed bottom-0 right-0 md:bottom-6 md:right-6 w-full md:w-[400px] h-full md:h-[600px] md:max-h-[90vh] bg-white md:rounded-2xl shadow-2xl flex flex-col transition-all duration-300 z-[100] ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
        style={{ transformOrigin: 'bottom right' }}
      >
        {/* Header - Sticky */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-pink-600 p-4 md:rounded-t-2xl flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center text-purple-600 font-bold text-lg shadow-md">
              {otherUser[0]}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white text-base">{otherUser}</h3>
              <p className="text-xs text-white/80">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowClearConfirm(true)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Clear chat"
            >
              <Trash2 size={18} className="text-white" />
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* Messages Area with WhatsApp Wallpaper */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide relative"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='bubble' x='0' y='0' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='10' cy='10' r='1.5' fill='%23d1d7db' opacity='0.4'/%3E%3Ccircle cx='30' cy='25' r='1' fill='%23d1d7db' opacity='0.3'/%3E%3Ccircle cx='50' cy='15' r='1.2' fill='%23d1d7db' opacity='0.35'/%3E%3Ccircle cx='20' cy='40' r='0.8' fill='%23d1d7db' opacity='0.3'/%3E%3Ccircle cx='45' cy='50' r='1.3' fill='%23d1d7db' opacity='0.4'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='60' height='60' fill='%23e5ddd5'/%3E%3Crect width='60' height='60' fill='url(%23bubble)'/%3E%3C/svg%3E")`,
            backgroundColor: '#e5ddd5'
          }}
        >
          {messages.map((msg, index) => {
            const isOwn = msg.sender_id === currentUser.id;
            const showDateDivider = index === 0 || 
              new Date(messages[index - 1].timestamp).toDateString() !== new Date(msg.timestamp).toDateString();

            return (
              <React.Fragment key={msg.id}>
                {/* Date Divider */}
                {showDateDivider && (
                  <div className="flex items-center justify-center my-4">
                    <div className="px-3 py-1 bg-white/80 rounded-full text-xs text-gray-600 font-medium shadow-sm">
                      {formatDate(msg.timestamp)}
                    </div>
                  </div>
                )}

                {/* Message */}
                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                  <div className={`max-w-[80%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                    {!isOwn && (
                      <span className="text-xs text-gray-600 mb-1 ml-1 font-medium">{msg.sender_name}</span>
                    )}
                    <div className={`relative rounded-2xl px-4 py-3 shadow-lg ${
                      isOwn 
                        ? 'bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 text-white' 
                        : 'bg-white text-gray-900'
                    }`}>
                      {/* Voice Message */}
                      {msg.voice_data ? (
                        <div className="flex items-center gap-3 py-1">
                          <button
                            onClick={() => playingAudio === msg.id ? handleVoicePause(msg.id) : handleVoicePlay(msg.id, msg.voice_data!)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
                              isOwn ? 'bg-white/30 hover:bg-white/40' : 'bg-purple-500 hover:bg-purple-600'
                            }`}
                          >
                            {playingAudio === msg.id ? (
                              <div className={`w-3 h-3 rounded ${isOwn ? 'bg-white' : 'bg-white'}`} />
                            ) : (
                              <div className={`w-0 h-0 border-l-[7px] border-y-[5px] border-y-transparent ml-0.5 ${
                                isOwn ? 'border-l-white' : 'border-l-white'
                              }`} />
                            )}
                          </button>
                          <div className="flex-1">
                            <div className={`text-xs font-medium ${isOwn ? 'text-white/90' : 'text-gray-600'}`}>
                              {playingAudio === msg.id ? 'Playing...' : `${msg.voice_duration || 0}s`}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>
                      )}
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

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200 md:rounded-b-2xl">
          <div className="flex items-center gap-2">
            {/* Emoji Picker */}
            <div className="relative" ref={emojiRef}>
              <button
                onClick={() => setShowEmoji(!showEmoji)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Smile size={22} className="text-gray-500 hover:text-purple-600" />
              </button>
              
              {showEmoji && (
                <div className="absolute bottom-full mb-2 left-0 w-72 bg-white rounded-xl border border-gray-200 shadow-2xl animate-scale-in overflow-hidden">
                  <div className="p-3 grid grid-cols-6 gap-2 max-h-52 overflow-y-auto scrollbar-hide">
                    {EMOJI_LIST.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          setNewMessage(newMessage + emoji);
                          setShowEmoji(false);
                        }}
                        className="text-2xl hover:bg-purple-50 rounded-lg p-2 transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Message Input */}
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 min-w-0 px-3 py-2 bg-gray-100 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-500 text-sm transition-all"
            />

            {/* Voice Note Button */}
            <button
              onClick={handleVoiceNote}
              className={`relative p-2 rounded-full transition-all flex-shrink-0 ${
                isRecording ? 'bg-red-500' : 'hover:bg-gray-100'
              }`}
            >
              <Mic size={20} className={isRecording ? 'text-white animate-pulse' : 'text-gray-500 hover:text-purple-600'} />
              {isRecording && (
                <span className="absolute -top-1 -right-1 text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded-full font-semibold animate-pulse">
                  {recordingTime}s
                </span>
              )}
            </button>

            {/* Send Button */}
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg disabled:hover:shadow-md flex-shrink-0"
            >
              <Send size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* Clear Chat Confirmation Modal */}
        {showClearConfirm && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 md:rounded-2xl">
            <div className="bg-white rounded-xl p-6 m-4 max-w-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Clear All Chat?</h3>
              <p className="text-sm text-gray-600 mb-4">
                This will permanently delete all messages. This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={clearAllMessages}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white font-medium transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
