import React, { useState, useEffect, useRef } from 'react';
import { Send, Reply, Smile, Mic, Video as VideoIcon, X, CheckCheck } from 'lucide-react';
import type { ChatMessage, User, Video } from '../types';

interface ChatSystemProps {
  currentUser: User;
  videos: Video[];
  onNewMessage?: () => void;
}

const EMOJI_CATEGORIES = {
  'Smileys': ['😊', '😂', '🥰', '😍', '🤗', '😘', '😎', '🤩', '😇', '🙏'],
  'Gestures': ['👍', '👏', '🙌', '👌', '✌️', '🤝', '💪', '🙏', '👋', '🤲'],
  'Hearts': ['❤️', '💖', '💕', '💗', '💓', '💝', '💘', '💞', '💟', '❣️'],
  'Music': ['🎵', '🎶', '🎤', '🎧', '🎼', '🎹', '🎸', '🥁', '🎺', '🎷'],
  'Symbols': ['✨', '⭐', '🌟', '💫', '🔥', '💯', '🎉', '🎊', '🎈', '🎁']
};

// Voice Message Player Component
const VoiceMessagePlayer: React.FC<{
  messageId: string;
  duration: string;
  isPlaying: boolean;
  progress: number;
  onPlay: () => void;
  onPause: () => void;
}> = ({ duration, isPlaying, progress, onPlay, onPause }) => {
  return (
    <div className="flex items-center gap-3 py-2">
      <button
        onClick={isPlaying ? onPause : onPlay}
        className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
      >
        {isPlaying ? (
          <div className="w-3 h-3 bg-white rounded-sm" />
        ) : (
          <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent ml-0.5" />
        )}
      </button>
      
      <div className="flex-1">
        <div className="flex items-center gap-1 mb-1">
          {[...Array(25)].map((_, i) => {
            const height = Math.sin(i * 0.5) * 8 + 12;
            const isActive = (i / 25) <= progress;
            return (
              <div
                key={i}
                className={`w-1 rounded-full transition-colors ${
                  isActive ? 'bg-white' : 'bg-white/40'
                }`}
                style={{ height: `${height}px` }}
              />
            );
          })}
        </div>
        <div className="text-xs text-white/70">
          {isPlaying ? 'Playing...' : `Voice message • ${duration}s`}
        </div>
      </div>
    </div>
  );
};

export const ChatSystem: React.FC<ChatSystemProps> = ({ currentUser, videos, onNewMessage }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState('Smileys');
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<Record<string, number>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      setMessages(JSON.parse(saved));
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
      reply_to: replyTo?.id,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    localStorage.setItem('chat_messages', JSON.stringify(updatedMessages));

    if (onNewMessage) onNewMessage();

    setNewMessage('');
    setReplyTo(null);
    setSelectedVideo('');
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
          
          // Convert blob to base64 for storage
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
            // Store audio data
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

        // Auto-stop after 60 seconds
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

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handleVoicePlay = (messageId: string) => {
    const audioData = localStorage.getItem(`voice_${messageId}`);
    if (!audioData) return;

    // Stop any currently playing audio
    Object.values(audioRefs.current).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    setPlayingAudio(null);

    // Create or get audio element
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

  const getReferencedVideo = (videoId: string) => {
    return videos.find(v => v.id === videoId);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-12rem)] max-w-3xl mx-auto bg-[#efeae2] rounded-2xl overflow-hidden shadow-2xl">
      {/* WhatsApp Header */}
      <div className="p-2 sm:p-3 bg-[#008069] flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-lg">
            {currentUser.role === 'artist' ? 'E' : 'M'}
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white text-base">Team Chat</h3>
          <p className="text-xs text-white/80">online</p>
        </div>
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <VideoIcon size={22} className="text-white" />
        </button>
      </div>

      {/* Messages - WhatsApp background pattern */}
      <div 
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1 scrollbar-hide" 
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'300\' height=\'300\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'pattern\' x=\'0\' y=\'0\' width=\'100\' height=\'100\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M20 20h60v60H20z\' fill=\'none\' stroke=\'%23d9d9d9\' stroke-width=\'0.5\' opacity=\'0.3\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'300\' height=\'300\' fill=\'%23efeae2\'/%3E%3Crect width=\'300\' height=\'300\' fill=\'url(%23pattern)\'/%3E%3C/svg%3E")',
          backgroundColor: '#efeae2'
        }}
      >
        {messages.map((msg) => {
          const isOwn = msg.sender_id === currentUser.id;
          const replyToMsg = msg.reply_to ? messages.find(m => m.id === msg.reply_to) : null;
          const videoRef = msg.video_reference ? getReferencedVideo(msg.video_reference) : null;

          return (
            <div 
              key={msg.id} 
              className={`group flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in-up mb-1`}
            >
              <div className={`max-w-[85%] sm:max-w-[75%] md:max-w-[65%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                
                <div className={`relative rounded-lg px-3 py-2 shadow-md ${
                  isOwn 
                    ? 'bg-[#d9fdd3] text-[#111b21]' 
                    : 'bg-white text-[#111b21]'
                }`}>
                  {/* WhatsApp Tail */}
                  <div className={`absolute top-0 ${
                    isOwn 
                      ? '-right-[8px]' 
                      : '-left-[8px]'
                  }`}>
                    <svg width="8" height="13" viewBox="0 0 8 13" className={isOwn ? '' : 'transform scale-x-[-1]'}>
                      <path
                        d="M1.533,0.004 L8,0 L8,13 C8,13 4.5,10.5 1.533,8.004 C0.5,7.004 0,6.004 0,4.004 C0,2.004 0.5,1.004 1.533,0.004 Z"
                        fill={isOwn ? '#d9fdd3' : '#ffffff'}
                      />
                    </svg>
                  </div>
                  {replyToMsg && (
                    <div className="mb-2 p-2 bg-black/5 rounded border-l-4 border-[#008069]">
                      <p className="text-xs text-[#008069] font-semibold">{replyToMsg.sender_name}</p>
                      <p className="text-sm text-gray-600 truncate">{replyToMsg.message}</p>
                    </div>
                  )}

                  {videoRef && (
                    <div className="mb-2 p-2 bg-black/5 rounded flex items-center gap-2">
                      <VideoIcon size={14} className="text-[#008069]" />
                      <span className="text-sm truncate">{videoRef.title}</span>
                    </div>
                  )}

                  {msg.message.startsWith('🎤 Voice message') ? (
                    <VoiceMessagePlayer 
                      messageId={msg.id}
                      duration={msg.message.match(/\((\d+)s\)/)?.[1] || '0'}
                      isPlaying={playingAudio === msg.id}
                      progress={audioProgress[msg.id] || 0}
                      onPlay={() => handleVoicePlay(msg.id)}
                      onPause={() => handleVoicePause(msg.id)}
                    />
                  ) : (
                    <p className="text-[15px] leading-[19px] whitespace-pre-wrap break-words">{msg.message}</p>
                  )}
                  
                  <div className="flex items-center justify-end gap-1 mt-0.5 -mb-1">
                    <span className="text-[11px] text-gray-500">{formatTime(msg.timestamp)}</span>
                    {isOwn && (
                      <CheckCheck size={16} className="text-[#53bdeb]" />
                    )}
                  </div>
                </div>

                {/* Reply button for all messages */}
                <button
                  onClick={() => setReplyTo(msg)}
                  className={`text-xs text-gray-600 hover:text-[#008069] mt-0.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 ${
                    isOwn ? 'mr-2 self-end' : 'ml-2 self-start'
                  }`}
                >
                  <Reply size={12} />
                  <span className="hidden sm:inline">Reply</span>
                </button>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - WhatsApp style */}
      <div className="p-2 bg-[#f0f2f5]">
        {replyTo && (
          <div className="mb-2 p-2 bg-white rounded-lg flex items-center justify-between border-l-4 border-[#008069] shadow-sm">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[#008069] font-semibold">{replyTo.sender_name}</p>
                <p className="text-xs text-gray-600 truncate">{replyTo.message}</p>
              </div>
            </div>
            <button onClick={() => setReplyTo(null)} className="text-gray-500 hover:text-gray-700 p-1">
              <X size={16} />
            </button>
          </div>
        )}

        {selectedVideo && (
          <div className="mb-2 p-2 bg-white rounded-lg flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <VideoIcon size={14} className="text-[#008069] flex-shrink-0" />
              <span className="text-sm text-gray-700 truncate">{getReferencedVideo(selectedVideo)?.title}</span>
            </div>
            <button onClick={() => setSelectedVideo('')} className="text-gray-500 hover:text-gray-700 p-1">
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-1 bg-white rounded-full px-2 py-1 shadow-sm">
          {/* Emoji Picker */}
          <div className="relative" ref={emojiRef}>
            <button
              onClick={() => setShowEmoji(!showEmoji)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Smile size={24} className="text-gray-600" />
            </button>
            
            {showEmoji && (
              <div className="absolute bottom-full mb-2 left-0 w-[90vw] max-w-sm bg-white rounded-2xl border border-gray-200 shadow-2xl animate-scale-in overflow-hidden">
                {/* Category Tabs */}
                <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto scrollbar-hide">
                  {Object.keys(EMOJI_CATEGORIES).map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveEmojiCategory(category)}
                      className={`flex-1 px-2 sm:px-3 py-2.5 text-[10px] sm:text-xs font-medium transition-colors whitespace-nowrap ${
                        activeEmojiCategory === category
                          ? 'text-[#008069] border-b-2 border-[#008069]'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                {/* Emoji Grid */}
                <div className="p-3 max-h-64 overflow-y-auto scrollbar-hide bg-white">
                  <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                    {EMOJI_CATEGORIES[activeEmojiCategory as keyof typeof EMOJI_CATEGORIES].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          setNewMessage(newMessage + emoji);
                        }}
                        className="text-2xl hover:bg-gray-100 rounded-lg p-2 transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Message Input */}
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Message"
            className="flex-1 px-3 py-2.5 bg-transparent border-none focus:outline-none text-gray-900 placeholder-gray-500 text-[15px]"
          />

          {/* Voice Note Button */}
          <button
            onClick={handleVoiceNote}
            className={`relative p-2 rounded-full transition-colors ${
              isRecording ? 'bg-red-600' : 'hover:bg-gray-100'
            }`}
          >
            <Mic size={24} className={isRecording ? 'text-white animate-pulse' : 'text-gray-600'} />
            {isRecording && (
              <span className="absolute -top-1 -right-1 text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded-full font-semibold animate-pulse">
                {recordingTime}s
              </span>
            )}
          </button>
        </div>

        {/* Send Button - Separate */}
        <button
          onClick={sendMessage}
          disabled={!newMessage.trim() && !selectedVideo}
          className="ml-2 p-3 bg-[#008069] hover:bg-[#017561] rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          <Send size={20} className="text-white" />
        </button>

        {/* Video Reference Selector */}
        {videos.length > 0 && (
          <select
            value={selectedVideo}
            onChange={(e) => setSelectedVideo(e.target.value)}
            className="mt-2 w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-[#008069] shadow-sm"
          >
            <option value="">📹 Attach video reference (optional)</option>
            {videos.map((video) => (
              <option key={video.id} value={video.id}>{video.title}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};
