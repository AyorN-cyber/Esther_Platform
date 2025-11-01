/**
 * FloatingChat Component
 * 
 * A clean, modern floating chat widget for real-time communication between Artist and Manager.
 * 
 * Features:
 * - Fixed position circular button in bottom-right corner
 * - Expands to chat interface with smooth animation
 * - Simple, clean UI design
 * - Text messages, emojis, and voice notes
 * - Real-time typing indicators
 * - Online/offline status display
 * - Unread message count badge
 * - Voice note recording with MediaRecorder API
 * - Responsive design
 */

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Smile, Mic, Video as VideoIcon, Paperclip } from 'lucide-react';
import type { ChatMessage, User, Video } from '../types';

interface FloatingChatProps {
  currentUser: User;
  onNewMessage?: () => void;
}

const EMOJI_LIST = ['😊', '😂', '🥰', '😍', '🤗', '😘', '😎', '🤩', '🥳', '😋', '😜', '🤪', '👍', '👏', '🙌', '🤝', '💪', '🙏', '❤️', '💖', '💕', '💗', '💙', '💚', '💛', '🧡', '💜', '🎵', '🎶', '🎤', '🎧', '✨', '⭐', '🌟', '💫', '🔥', '💯', '🎉', '🎊', '🎈', '🎁', '🏆', '🌸', '🌺', '🌻', '🌹', '🍕', '🍔', '🍰', '🎂'];

export const FloatingChat: React.FC<FloatingChatProps> = ({ currentUser, onNewMessage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showVideoSelector, setShowVideoSelector] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string>('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<Record<string, number>>({});
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearApprovalPending, setClearApprovalPending] = useState(false);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const otherUser = currentUser.role === 'artist' ? 'Manager' : 'Esther Reign';

  useEffect(() => {
    loadMessages();
    loadVideos();
    
    // Real-time message polling - check every 2 seconds
    const messagePolling = setInterval(() => {
      const savedMessages = localStorage.getItem('chat_messages');
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        if (JSON.stringify(parsedMessages) !== JSON.stringify(messages)) {
          setMessages(parsedMessages);
        }
      }
    }, 2000); // Check every 2 seconds
    
    // Listen for storage changes from other tabs/devices
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'chat_messages' && e.newValue) {
        setMessages(JSON.parse(e.newValue));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Simulate WebSocket connection
    const onlineInterval = setInterval(() => {
      setIsOnline(Math.random() > 0.1); // 90% online
    }, 30000);

    return () => {
      clearInterval(messagePolling);
      clearInterval(onlineInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [messages]);

  const loadVideos = () => {
    const savedVideos = localStorage.getItem('videos');
    if (savedVideos) {
      const allVideos: Video[] = JSON.parse(savedVideos);
      // Show all videos (completed and pending)
      setVideos(allVideos);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target as Node)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadMessages = () => {
    const saved = localStorage.getItem('chat_messages');
    if (saved) {
      const allMessages = JSON.parse(saved);
      setMessages(allMessages);
      
      // Count unread messages (simplified - in real app would track read status)
      if (!isOpen) {
        const unread = allMessages.filter((m: ChatMessage) => 
          m.sender_id !== currentUser.id
        ).length;
        setUnreadCount(Math.min(unread, 9));
      }
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() && !selectedVideo) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender_id: currentUser.id,
      sender_name: currentUser.name,
      sender_role: currentUser.role,
      message: newMessage,
      video_reference: selectedVideo || undefined,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    localStorage.setItem('chat_messages', JSON.stringify(updatedMessages));

    // Immediately sync to cloud
    import('../lib/cloudSync').then(({ pushToCloud }) => {
      pushToCloud().catch(console.error);
    });

    // Play notification sound
    playNotificationSound();

    if (onNewMessage) onNewMessage();

    setNewMessage('');
    setSelectedVideo('');
    setShowVideoSelector(false);
    
    // Clear typing indicator when message is sent
    localStorage.removeItem(`typing_${currentUser.id}`);
    window.dispatchEvent(new Event('storage'));
  };

  const playNotificationSound = () => {
    // Create a more prominent notification sound
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
  };

  const getReferencedVideo = (videoId: string) => {
    return videos.find(v => v.id === videoId);
  };

  const deleteMessage = (messageId: string, deleteFor: 'me' | 'everyone') => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    // Check if within 5 minutes
    const messageTime = new Date(message.timestamp).getTime();
    const now = new Date().getTime();
    const fiveMinutes = 5 * 60 * 1000;

    if (now - messageTime > fiveMinutes) {
      alert('Messages can only be deleted within 5 minutes of sending.');
      return;
    }

    if (deleteFor === 'everyone') {
      // Delete for everyone
      const updatedMessages = messages.filter(m => m.id !== messageId);
      setMessages(updatedMessages);
      localStorage.setItem('chat_messages', JSON.stringify(updatedMessages));
      
      // Also delete voice note if exists
      localStorage.removeItem(`voice_${messageId}`);
    } else {
      // Delete for me only - mark as deleted for current user
      const updatedMessages = messages.map(m => 
        m.id === messageId 
          ? { ...m, deletedFor: [...(m.deletedFor || []), currentUser.id] }
          : m
      );
      setMessages(updatedMessages);
      localStorage.setItem('chat_messages', JSON.stringify(updatedMessages));
    }
  };

  const startEditMessage = (messageId: string, currentText: string) => {
    setEditingMessage(messageId);
    setEditText(currentText);
  };

  const saveEditMessage = (messageId: string) => {
    if (!editText.trim()) return;

    const updatedMessages = messages.map(m => 
      m.id === messageId 
        ? { ...m, message: editText, edited: true }
        : m
    );
    setMessages(updatedMessages);
    localStorage.setItem('chat_messages', JSON.stringify(updatedMessages));
    setEditingMessage(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setEditText('');
  };

  const requestClearChat = () => {
    // Send approval request to other user
    const approvalMessage: ChatMessage = {
      id: Date.now().toString(),
      sender_id: currentUser.id,
      sender_name: currentUser.name,
      sender_role: currentUser.role,
      message: `🗑️ ${currentUser.name} wants to clear all chat messages. Please approve or deny.`,
      timestamp: new Date().toISOString(),
      isApprovalRequest: true
    };

    const updatedMessages = [...messages, approvalMessage];
    setMessages(updatedMessages);
    localStorage.setItem('chat_messages', JSON.stringify(updatedMessages));
    localStorage.setItem('clear_chat_pending', currentUser.id);
    setClearApprovalPending(true);
    setShowClearConfirm(false);
  };

  const handleClearApproval = (approve: boolean) => {
    if (approve) {
      // Clear all messages
      setMessages([]);
      localStorage.setItem('chat_messages', JSON.stringify([]));
      localStorage.removeItem('clear_chat_pending');
      setClearApprovalPending(false);
      
      // Clear all voice notes
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('voice_')) {
          localStorage.removeItem(key);
        }
      });
      
      alert('Chat cleared successfully!');
    } else {
      // Send denial message
      const denialMessage: ChatMessage = {
        id: Date.now().toString(),
        sender_id: currentUser.id,
        sender_name: currentUser.name,
        sender_role: currentUser.role,
        message: `❌ ${currentUser.name} denied the request to clear chat.`,
        timestamp: new Date().toISOString()
      };
      
      const updatedMessages = [...messages, denialMessage];
      setMessages(updatedMessages);
      localStorage.setItem('chat_messages', JSON.stringify(updatedMessages));
      localStorage.removeItem('clear_chat_pending');
      setClearApprovalPending(false);
    }
  };

  useEffect(() => {
    // Check if there's a pending clear request
    const pending = localStorage.getItem('clear_chat_pending');
    if (pending && pending !== currentUser.id) {
      setClearApprovalPending(true);
    }
    
    // Listen for typing indicator from other user
    const checkTyping = () => {
      const otherUserId = currentUser.role === 'artist' ? 'manager' : 'artist';
      const typingTimestamp = localStorage.getItem(`typing_${otherUserId}`);
      
      if (typingTimestamp) {
        const timeSinceTyping = Date.now() - parseInt(typingTimestamp);
        setIsTyping(timeSinceTyping < 2000); // Show typing if less than 2 seconds ago
      } else {
        setIsTyping(false);
      }
    };
    
    checkTyping();
    const interval = setInterval(checkTyping, 500); // Check every 500ms
    
    window.addEventListener('storage', checkTyping);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkTyping);
    };
  }, [messages, currentUser]);

  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    // Set typing indicator for other user to see
    if (value.length > 0) {
      localStorage.setItem(`typing_${currentUser.id}`, Date.now().toString());
      window.dispatchEvent(new Event('storage'));
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to clear typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      localStorage.removeItem(`typing_${currentUser.id}`);
      window.dispatchEvent(new Event('storage'));
    }, 1500);
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

        mediaRecorder.onstop = () => {
          const finalDuration = Math.floor((Date.now() - startTime) / 1000);
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const base64Audio = reader.result as string;
            
            const voiceMessage: ChatMessage = {
              id: Date.now().toString(),
              sender_id: currentUser.id,
              sender_name: currentUser.name,
              sender_role: currentUser.role,
              message: `🎤 Voice message (${finalDuration}s)`,
              timestamp: new Date().toISOString()
            };
            
            const updatedMessages = [...messages, voiceMessage];
            setMessages(updatedMessages);
            localStorage.setItem('chat_messages', JSON.stringify(updatedMessages));
            localStorage.setItem(`voice_${voiceMessage.id}`, base64Audio);
            
            if (onNewMessage) onNewMessage();
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

  const handleVoicePlay = (messageId: string) => {
    const audioData = localStorage.getItem(`voice_${messageId}`);
    if (!audioData) return;

    Object.values(audioRefs.current).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    setPlayingAudio(null);

    if (!audioRefs.current[messageId]) {
      const audio = new Audio(audioData);
      audioRefs.current[messageId] = audio;

      audio.addEventListener('timeupdate', () => {
        const progress = audio.currentTime / audio.duration;
        setAudioProgress(prev => ({ ...prev, [messageId]: progress }));
      });

      audio.addEventListener('ended', () => {
        setPlayingAudio(null);
        setAudioProgress(prev => ({ ...prev, [messageId]: 0 }));
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

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
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
        className={`fixed bottom-0 right-0 md:bottom-6 md:right-6 w-full md:w-[380px] h-full md:h-[550px] md:max-h-[90vh] bg-white md:rounded-2xl shadow-2xl flex flex-col transition-all duration-300 z-[100] ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
        style={{ transformOrigin: 'bottom right' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative">
              <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center text-purple-600 font-bold text-lg shadow-md">
                {otherUser[0]}
              </div>
              {isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white text-base">{otherUser}</h3>
              {isTyping ? (
                <p className="text-xs text-white/90 italic">typing...</p>
              ) : (
                <p className="text-xs text-white/80">
                  {isOnline ? 'Active now' : 'Offline'}
                </p>
              )}
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Messages Area */}
        <div 
          className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide bg-gradient-to-b from-gray-50 to-gray-100"
        >
          {messages.map((msg, index) => {
            const isOwn = msg.sender_id === currentUser.id;
            const isDeleted = msg.deletedFor?.includes(currentUser.id);
            
            if (isDeleted) return null;

            // Check if message can be deleted (within 5 minutes)
            const messageTime = new Date(msg.timestamp).getTime();
            const now = new Date().getTime();
            const canDelete = isOwn && (now - messageTime) <= 5 * 60 * 1000;
            
            // Check if we need a date divider
            const currentDate = new Date(msg.timestamp).toDateString();
            const previousDate = index > 0 ? new Date(messages[index - 1].timestamp).toDateString() : null;
            const showDateDivider = currentDate !== previousDate;
            
            const formatDate = (dateString: string) => {
              const date = new Date(dateString);
              const today = new Date().toDateString();
              const yesterday = new Date(Date.now() - 86400000).toDateString();
              
              if (date.toDateString() === today) return 'Today';
              if (date.toDateString() === yesterday) return 'Yesterday';
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            };
            
            return (
              <React.Fragment key={msg.id}>
                {/* Date Divider */}
                {showDateDivider && (
                  <div className="flex items-center justify-center my-4">
                    <div className="px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-600 font-medium shadow-sm">
                      {formatDate(msg.timestamp)}
                    </div>
                  </div>
                )}
                
                {/* Message */}
              <div 
                key={msg.id} 
                className={`group flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in-up relative`}
              >
                <div className={`max-w-[80%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                  {!isOwn && (
                    <span className="text-xs text-gray-500 mb-1 ml-1 font-medium">{msg.sender_name}</span>
                  )}
                  <div className={`relative rounded-2xl px-4 py-3 shadow-lg ${
                    isOwn 
                      ? 'bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 text-white' 
                      : 'bg-white text-gray-900 border border-gray-100'
                  }`}>
                    {/* Edit/Delete Buttons (shows on hover for own messages within 5 min) */}
                    {canDelete && !msg.isApprovalRequest && (
                      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        {/* Edit Button - Only for text messages */}
                        {!msg.message.startsWith('🎤') && (
                          <button
                            onClick={() => startEditMessage(msg.id, msg.message)}
                            className="w-6 h-6 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
                            title="Edit message"
                          >
                            ✎
                          </button>
                        )}
                        
                        {/* Delete Button - For all messages including voice notes */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const menu = e.currentTarget.nextElementSibling;
                              menu?.classList.toggle('hidden');
                            }}
                            className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
                            title="Delete message"
                          >
                            ×
                          </button>
                          <div className="hidden absolute right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-10 min-w-[140px]">
                            <button
                              onClick={() => {
                                deleteMessage(msg.id, 'me');
                                const menu = document.querySelector('.hidden');
                                menu?.classList.add('hidden');
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Delete for me
                            </button>
                            <button
                              onClick={() => {
                                deleteMessage(msg.id, 'everyone');
                                const menu = document.querySelector('.hidden');
                                menu?.classList.add('hidden');
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                            >
                              Delete for everyone
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Approval Request Buttons */}
                    {msg.isApprovalRequest && !isOwn && (
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
                    {/* Video Reference */}
                    {msg.video_reference && (
                      <div className={`mb-2 p-2.5 rounded-lg flex items-center gap-2 ${
                        isOwn ? 'bg-white/20' : 'bg-purple-50'
                      }`}>
                        <VideoIcon size={16} className={isOwn ? 'text-white' : 'text-purple-600'} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold ${isOwn ? 'text-white' : 'text-purple-600'}`}>
                            Video Reference
                          </p>
                          <p className={`text-xs truncate ${isOwn ? 'text-white/90' : 'text-gray-600'}`}>
                            {getReferencedVideo(msg.video_reference)?.title || 'Video'}
                          </p>
                        </div>
                      </div>
                    )}

                    {msg.message.startsWith('🎤 Voice message') ? (
                      <div className={`flex items-center gap-3 py-2 px-2 rounded-xl ${
                        isOwn ? 'bg-white/10' : 'bg-gray-50'
                      }`}>
                        <button
                          onClick={() => playingAudio === msg.id ? handleVoicePause(msg.id) : handleVoicePlay(msg.id)}
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
                          <div className="flex items-center gap-0.5 mb-1.5">
                            {[...Array(30)].map((_, i) => {
                              const height = Math.sin(i * 0.4) * 8 + 12;
                              const isActive = (i / 30) <= (audioProgress[msg.id] || 0);
                              return (
                                <div
                                  key={i}
                                  className={`w-1 rounded-full transition-all ${
                                    isActive 
                                      ? (isOwn ? 'bg-white' : 'bg-purple-600')
                                      : (isOwn ? 'bg-white/30' : 'bg-gray-300')
                                  }`}
                                  style={{ height: `${height}px` }}
                                />
                              );
                            })}
                          </div>
                          <div className={`text-xs font-medium ${isOwn ? 'text-white/90' : 'text-gray-600'}`}>
                            {playingAudio === msg.id ? 'Playing...' : `${msg.message.match(/\((\d+)s\)/)?.[1] || '0'}s`}
                          </div>
                        </div>
                      </div>
                    ) : editingMessage === msg.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') saveEditMessage(msg.id);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEditMessage(msg.id)}
                            className="px-3 py-1 bg-green-500 hover:bg-green-600 rounded text-xs text-white font-medium"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1 bg-gray-500 hover:bg-gray-600 rounded text-xs text-white font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words font-medium">{msg.message}</p>
                        {msg.edited && (
                          <span className={`text-[10px] italic ${isOwn ? 'text-white/60' : 'text-gray-400'}`}> (edited)</span>
                        )}
                      </div>
                    )}
                    
                    {editingMessage !== msg.id && (
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
          
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex flex-col items-start">
                <span className="text-xs text-gray-500 mb-1 ml-1 font-medium">{otherUser}</span>
                <div className="bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200 rounded-b-2xl">
          {/* Selected Video Display */}
          {selectedVideo && (
            <div className="mb-3 p-3 bg-purple-50 rounded-xl flex items-center justify-between border border-purple-200">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <VideoIcon size={18} className="text-purple-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-purple-600 font-semibold">Video Reference</p>
                  <p className="text-sm text-gray-700 truncate">{getReferencedVideo(selectedVideo)?.title}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedVideo('')}
                className="p-1 hover:bg-purple-100 rounded-full transition-colors"
              >
                <X size={16} className="text-gray-600" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Video Selector */}
            <div className="relative">
              <button
                onClick={() => setShowVideoSelector(!showVideoSelector)}
                className={`p-2 rounded-full transition-colors ${
                  selectedVideo ? 'bg-purple-100 text-purple-600' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <Paperclip size={22} className="hover:text-purple-600" />
              </button>
              
              {showVideoSelector && videos.length > 0 && (
                <div className="absolute bottom-full mb-2 left-0 w-72 bg-white rounded-xl border border-gray-200 shadow-2xl animate-scale-in overflow-hidden max-h-64">
                  <div className="p-2 bg-purple-50 border-b border-purple-100">
                    <p className="text-xs font-semibold text-purple-600">Select Video Reference</p>
                  </div>
                  <div className="max-h-52 overflow-y-auto scrollbar-hide">
                    {videos.map((video) => (
                      <button
                        key={video.id}
                        onClick={() => {
                          setSelectedVideo(video.id);
                          setShowVideoSelector(false);
                        }}
                        className="w-full p-3 hover:bg-purple-50 transition-colors text-left flex items-center gap-2 border-b border-gray-100 last:border-0"
                      >
                        <VideoIcon size={16} className="text-purple-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate">{video.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Emoji Picker */}
            <div className="relative" ref={emojiRef}>
              <button
                onClick={() => {
                  setShowEmoji(!showEmoji);
                  setShowVideoSelector(false);
                }}
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
              onChange={(e) => handleTyping(e.target.value)}
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
              disabled={!newMessage.trim() && !selectedVideo}
              className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg disabled:hover:shadow-md flex-shrink-0"
            >
              <Send size={18} className="text-white" />
            </button>
          </div>

          {/* Clear Chat Button */}
          <div className="mt-2 flex justify-center">
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-xs text-gray-500 hover:text-red-500 transition-colors"
            >
              Clear Chat
            </button>
          </div>
        </div>

        {/* Clear Chat Confirmation Modal */}
        {showClearConfirm && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl">
            <div className="bg-white rounded-xl p-6 m-4 max-w-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Clear All Chat?</h3>
              <p className="text-sm text-gray-600 mb-4">
                This will send an approval request to {otherUser}. The chat will only be cleared if they approve.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={requestClearChat}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white font-medium transition-colors"
                >
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
                <button
                  onClick={() => handleClearApproval(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-medium transition-colors"
                >
                  Deny
                </button>
                <button
                  onClick={() => handleClearApproval(true)}
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white font-medium transition-colors"
                >
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
