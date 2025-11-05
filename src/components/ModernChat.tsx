/**
 * Modern Chat Widget - Completely Redesigned
 * Features: Glassmorphism, unique placement, better contrast
 */

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Smile, Paperclip, Sparkles, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  message: string;
  timestamp: string;
}

interface ModernChatProps {
  currentUser: User;
}

const EMOJIS = ['😊', '😂', '🥰', '😍', '🤗', '😘', '😎', '🤩', '🥳', '👍', '👏', '🙌', '💪', '🙏', '❤️', '💖', '💕', '🎵', '🎶', '🎤', '✨', '⭐', '🌟', '🔥', '💯', '🎉'];

export const ModernChat: React.FC<ModernChatProps> = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [unread, setUnread] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const otherUser = currentUser.role === 'artist' ? 'Manager' : 'Esther Reign';

  useEffect(() => {
    loadMessages();
    setupRealtimeSubscription();
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('chat_messages_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, () => {
        loadMessages();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMsg: ChatMessage = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sender_id: currentUser.id,
      sender_name: currentUser.name,
      message: input.trim(),
      timestamp: new Date().toISOString()
    };

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([newMsg]);

      if (error) throw error;
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating Button - New Position: Left Side */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed left-6 bottom-6 w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-500 z-[100] ${
          isOpen 
            ? 'scale-0 rotate-180' 
            : 'bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 hover:scale-110 hover:rotate-12 shadow-emerald-500/50'
        }`}
      >
        <MessageSquare size={28} className="text-white drop-shadow-lg" />
        {unread > 0 && !isOpen && (
          <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-black animate-bounce shadow-lg">
            {unread > 9 ? '9+' : unread}
          </div>
        )}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-400/20 animate-pulse" />
      </button>

      {/* Chat Window - Glassmorphism Design, Left Side */}
      <div
        className={`fixed left-6 bottom-24 w-[380px] h-[600px] backdrop-blur-2xl bg-gradient-to-br from-gray-900/90 via-emerald-950/80 to-gray-900/90 rounded-3xl shadow-2xl flex flex-col transition-all duration-500 z-[100] border-2 border-emerald-400/30 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
        style={{ transformOrigin: 'bottom left' }}
      >
        {/* Header - Glassmorphism */}
        <div className="relative overflow-hidden rounded-t-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 backdrop-blur-xl" />
          <div className="relative p-5 flex items-center justify-between border-b border-emerald-400/30">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-gray-900 font-black text-lg shadow-lg">
                  {otherUser[0]}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900 animate-pulse" />
              </div>
              <div>
                <h3 className="font-black text-white text-lg drop-shadow-lg">{otherUser}</h3>
                <p className="text-xs text-emerald-300 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Online
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2.5 hover:bg-white/10 rounded-xl transition-all backdrop-blur-sm border border-white/10 hover:border-emerald-400/50"
              >
                <X size={20} className="text-white drop-shadow" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages - Better Contrast */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto p-5 space-y-4"
          style={{
            background: 'linear-gradient(180deg, rgba(16,185,129,0.05) 0%, rgba(20,184,166,0.05) 100%)'
          }}
        >
          {messages.map((msg) => {
            const isOwn = msg.sender_id === currentUser.id;
            
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  {!isOwn && (
                    <span className="text-xs font-bold text-emerald-300 px-3 drop-shadow">{msg.sender_name}</span>
                  )}
                  
                  <div className={`rounded-2xl px-5 py-3 shadow-xl backdrop-blur-sm border-2 ${
                    isOwn 
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-gray-900 border-emerald-400/50 font-semibold' 
                      : 'bg-white/95 text-gray-900 border-white/50 font-medium'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.message}</p>
                  </div>
                  
                  <span className={`text-xs font-medium px-3 drop-shadow ${
                    isOwn ? 'text-emerald-200' : 'text-gray-400'
                  }`}>
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Glassmorphism */}
        <div className="p-4 border-t border-emerald-400/30 bg-gradient-to-r from-gray-900/50 to-emerald-950/50 backdrop-blur-xl rounded-b-3xl">
          <div className="flex items-center gap-3">
            <div className="relative">
              <button 
                onClick={() => setShowEmoji(!showEmoji)} 
                className="p-2.5 hover:bg-emerald-500/20 rounded-xl transition-all border border-emerald-400/30"
              >
                <Smile size={20} className="text-emerald-300" />
              </button>
              
              {showEmoji && (
                <div className="absolute bottom-full mb-2 left-0 w-72 bg-gray-900/95 backdrop-blur-xl rounded-2xl border-2 border-emerald-400/30 shadow-2xl p-4">
                  <div className="grid grid-cols-6 gap-2">
                    {EMOJIS.map(e => (
                      <button 
                        key={e} 
                        onClick={() => { setInput(input + e); setShowEmoji(false); }} 
                        className="text-2xl hover:bg-emerald-500/20 rounded-xl p-2 transition-all hover:scale-125"
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border-2 border-emerald-400/30 rounded-2xl focus:outline-none focus:border-emerald-400 text-white placeholder-gray-400 font-medium transition-all"
            />

            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-emerald-500/50 transition-all hover:scale-110 disabled:hover:scale-100"
            >
              <Send size={20} className="text-gray-900" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
};
