/**
 * Supabase-Powered Chat - Real-time sync across all devices
 * Uses PostgreSQL + Real-time subscriptions
 */

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Smile, Paperclip, Video as VideoIcon, Trash2, Edit2 } from 'lucide-react';
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
  is_approval_request?: boolean;
}

interface SupabaseChatProps {
  currentUser: User;
}

const EMOJIS = ['😊', '😂', '🥰', '😍', '🤗', '😘', '😎', '🤩', '🥳', '👍', '👏', '🙌', '💪', '🙏', '❤️', '💖', '💕', '🎵', '🎶', '🎤', '✨', '⭐', '🌟', '🔥', '💯', '🎉'];

export const SupabaseChat: React.FC<SupabaseChatProps> = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showVideos, setShowVideos] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearApprovalPending, setClearApprovalPending] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [unread, setUnread] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const otherUser = currentUser.role === 'artist' ? 'Manager' : 'Esther Reign';

  // Load initial data and setup real-time subscriptions
  useEffect(() => {
    loadMessages();
    loadVideos();
    setupRealtimeSubscription();
  }, []);

  // Auto-scroll
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

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('timestamp', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading messages:', error);
      setIsLoading(false);
    }
  };

  const loadVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error loading videos:', error);
      // Fallback to localStorage
      const saved = localStorage.getItem('videos');
      if (saved) {
        setVideos(JSON.parse(saved));
      }
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('chat_realtime')
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
            setMessages(prev => {
              // Avoid duplicates
              if (prev.find(m => m.id === payload.new.id)) {
                return prev;
              }
              return [...prev, payload.new as ChatMessage];
            });
            playSound();
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

    const newMsg: ChatMessage = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sender_id: currentUser.id,
      sender_name: currentUser.name,
      message: input.trim() || '📹 Video',
      timestamp: new Date().toISOString(),
      video_id: selectedVideo || undefined
    };

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([newMsg]);

      if (error) throw error;

      setInput('');
      setSelectedVideo('');
      setShowVideos(false);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please check your connection.');
    }
  };

  const requestClearChat = async () => {
    const approvalMsg: ChatMessage = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sender_id: currentUser.id,
      sender_name: currentUser.name,
      message: `🗑️ ${currentUser.name} wants to clear all chat messages. Please approve or deny.`,
      timestamp: new Date().toISOString(),
      is_approval_request: true
    };

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([approvalMsg]);

      if (error) throw error;
      
      localStorage.setItem('clear_chat_pending', currentUser.id);
      setClearApprovalPending(true);
      setShowClearConfirm(false);
    } catch (error) {
      console.error('Error requesting clear:', error);
      alert('Failed to send clear request.');
    }
  };

  const handleClearApproval = async (approve: boolean) => {
    if (approve) {
      try {
        // Delete all messages
        const { error } = await supabase
          .from('chat_messages')
          .delete()
          .neq('id', ''); // Delete all

        if (error) throw error;

        setMessages([]);
        localStorage.removeItem('clear_chat_pending');
        setClearApprovalPending(false);
        alert('Chat cleared successfully!');
      } catch (error) {
        console.error('Error clearing chat:', error);
        alert('Failed to clear chat.');
      }
    } else {
      try {
        // Remove approval requests
        await supabase
          .from('chat_messages')
          .delete()
          .eq('is_approval_request', true);

        // Send denial message
        const denialMsg: ChatMessage = {
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          sender_id: currentUser.id,
          sender_name: currentUser.name,
          message: `❌ ${currentUser.name} denied the request to clear chat.`,
          timestamp: new Date().toISOString()
        };

        const { error } = await supabase
          .from('chat_messages')
          .insert([denialMsg]);

        if (error) throw error;

        localStorage.removeItem('clear_chat_pending');
        setClearApprovalPending(false);
      } catch (error) {
        console.error('Error denying clear:', error);
      }
    }
  };

  const canEditOrDelete = (msgTimestamp: string) => {
    const messageTime = new Date(msgTimestamp).getTime();
    const now = Date.now();
    return (now - messageTime) <= 5 * 60 * 1000;
  };

  const startEdit = (msg: ChatMessage) => {
    setEditingMessageId(msg.id);
    setEditText(msg.message);
  };

  const saveEdit = async () => {
    if (!editText.trim() || !editingMessageId) return;
    
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ message: editText.trim(), edited: true })
        .eq('id', editingMessageId);

      if (error) throw error;

      setEditingMessageId(null);
      setEditText('');
    } catch (error) {
      console.error('Error editing message:', error);
      alert('Failed to edit message.');
    }
  };

  const deleteMessage = async (msgId: string) => {
    if (!confirm('Delete this message?')) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', msgId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message.');
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

  // Check for pending clear approval
  useEffect(() => {
    const pending = localStorage.getItem('clear_chat_pending');
    if (pending && pending !== currentUser.id) {
      setClearApprovalPending(true);
    }
  }, [messages]);

  if (isLoading) {
    return null; // Or a loading spinner
  }

  // Update PWA badge
  useEffect(() => {
    if ('setAppBadge' in navigator) {
      if (unread > 0) {
        (navigator as any).setAppBadge(unread);
      } else {
        (navigator as any).clearAppBadge();
      }
    }
  }, [unread]);

  return (
    <>
      {/* Float Button - Fixed positioning to avoid overlaps */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-32 right-4 lg:bottom-6 lg:right-6 w-14 h-14 lg:w-16 lg:h-16 rounded-full shadow-2xl flex items-center justify-center transition-all z-[100] ${
          isOpen ? 'scale-0' : 'bg-gradient-to-br from-cyan-500 via-royal-600 to-blue-500 hover:scale-110 hover:shadow-royal-500/50'
        }`}
      >
        <MessageCircle size={28} className="text-white" />
        {unread > 0 && !isOpen && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
            {unread > 9 ? '9+' : unread}
          </div>
        )}
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-0 right-0 lg:bottom-6 lg:right-6 w-full lg:w-[420px] h-full lg:h-[650px] bg-white rounded-t-2xl lg:rounded-2xl shadow-2xl flex flex-col transition-all z-[100] ${
          isOpen ? 'scale-100' : 'scale-0 pointer-events-none'
        }`}
        style={{ transformOrigin: 'bottom right' }}
      >
        {/* Header - Royal purple gradient */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-cyan-500 via-royal-600 to-blue-500 p-4 rounded-t-2xl flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-royal-600 font-bold">
              {otherUser[0]}
            </div>
            <div>
              <h3 className="font-semibold text-white drop-shadow-md">{otherUser}</h3>
              <p className="text-xs text-white/90">Online</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowClearConfirm(true)} className="p-2 hover:bg-white/20 rounded-full transition-colors" title="Clear chat">
              <Trash2 size={18} className="text-white" />
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
                
                <div className={`group flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col relative`}>
                    {!isOwn && (
                      <span className="text-xs text-gray-600 mb-1 ml-1 font-medium">{msg.sender_name}</span>
                    )}
                    
                    {isOwn && !msg.is_approval_request && canEditOrDelete(msg.timestamp) && (
                      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                        <button
                          onClick={() => startEdit(msg)}
                          className="w-6 h-6 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg"
                          title="Edit"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => deleteMessage(msg.id)}
                          className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg"
                          title="Delete"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                    
                    <div className={`rounded-2xl px-4 py-3 shadow-lg ${
                      isOwn ? 'bg-gradient-to-br from-royal-600 via-violet-600 to-royal-600 text-white' : 'bg-white text-gray-900'
                    }`}>
                      {msg.is_approval_request && !isOwn && (
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => handleClearApproval(false)}
                            className="flex-1 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg text-xs font-medium transition-colors"
                          >
                            Deny
                          </button>
                          <button
                            onClick={() => handleClearApproval(true)}
                            className="flex-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 rounded-lg text-white text-xs font-medium transition-colors"
                          >
                            Approve
                          </button>
                        </div>
                      )}
                      
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
                      
                      {editingMessageId === msg.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && saveEdit()}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm focus:outline-none"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button onClick={saveEdit} className="px-3 py-1 bg-green-500 rounded text-xs text-white">
                              Save
                            </button>
                            <button onClick={() => setEditingMessageId(null)} className="px-3 py-1 bg-gray-500 rounded text-xs text-white">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-[15px] whitespace-pre-wrap break-words">{msg.message}</p>
                          {msg.edited && <span className={`text-[10px] italic ${isOwn ? 'text-white/60' : 'text-gray-400'}`}> (edited)</span>}
                        </>
                      )}
                      
                      {editingMessageId !== msg.id && (
                        <div className={`text-[11px] mt-1 ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>
                          {formatTime(msg.timestamp)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t rounded-b-2xl">
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
            <div className="relative">
              <button onClick={() => setShowVideos(!showVideos)} className={`p-2 rounded-full ${selectedVideo ? 'bg-purple-100' : 'hover:bg-gray-100'}`}>
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

            <div className="relative">
              <button onClick={() => setShowEmoji(!showEmoji)} className="p-2 hover:bg-gray-100 rounded-full">
                <Smile size={20} />
              </button>
              
              {showEmoji && (
                <div className="absolute bottom-full mb-2 left-0 w-64 bg-white rounded-xl border shadow-2xl p-3">
                  <div className="grid grid-cols-6 gap-2">
                    {EMOJIS.map(e => (
                      <button key={e} onClick={() => { setInput(input + e); setShowEmoji(false); }} className="text-2xl hover:bg-cyan-50 rounded p-2 transition-colors">
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
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
            />

            <button
              onClick={sendMessage}
              disabled={!input.trim() && !selectedVideo}
              className="p-2 bg-gradient-to-r from-royal-600 via-violet-600 to-royal-600 rounded-full disabled:opacity-50 shadow-md hover:shadow-lg hover:shadow-royal-500/50 transition-all"
            >
              <Send size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* Clear Confirm Modal */}
        {showClearConfirm && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl">
            <div className="bg-white rounded-xl p-6 m-4 max-w-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Clear All Chat?</h3>
              <p className="text-sm text-gray-600 mb-4">
                This will send an approval request to {otherUser}. The chat will only be cleared if they approve.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setShowClearConfirm(false)} className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg">
                  Cancel
                </button>
                <button onClick={requestClearChat} className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white">
                  Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clear Approval Modal */}
        {clearApprovalPending && localStorage.getItem('clear_chat_pending') !== currentUser.id && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl">
            <div className="bg-white rounded-xl p-6 m-4 max-w-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Clear Chat Request</h3>
              <p className="text-sm text-gray-600 mb-4">
                {otherUser} wants to clear all chat messages. Do you approve?
              </p>
              <div className="flex gap-2">
                <button onClick={() => handleClearApproval(false)} className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg">
                  Deny
                </button>
                <button onClick={() => handleClearApproval(true)} className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white">
                  Approve
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
