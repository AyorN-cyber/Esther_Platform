/**
 * Notification System for Admin Panel
 * Features: Login notifications, chat notifications, PWA notifications
 */

import React, { useState, useEffect, useCallback } from 'react';
import { X, Bell, MessageSquare, User, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User as UserType } from '../types';

interface Notification {
  id: string;
  type: 'login' | 'message' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  userId?: string;
}

interface NotificationSystemProps {
  currentUser: UserType | null;
  onNotificationClick?: (notification: Notification) => void;
  externalUnreadCount?: number;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({ 
  currentUser, 
  onNotificationClick,
  externalUnreadCount = 0
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Use external unread count if provided
  useEffect(() => {
    if (externalUnreadCount > 0) {
      setUnreadCount(externalUnreadCount);
    }
  }, [externalUnreadCount]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Add notification to panel
  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => {
      // Check if notification already exists
      const exists = prev.some(n => n.id === notification.id);
      if (exists) return prev;
      return [notification, ...prev].slice(0, 50); // Keep last 50
    });
    setUnreadCount(prev => prev + 1);
  }, []);

  // Show browser notification
  const showBrowserNotification = useCallback((title: string, body: string, icon?: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: icon || '/icons/ios/128.png',
        badge: '/icons/ios/128.png',
        tag: 'esther-reign-admin',
        requireInteraction: false
      });
    }
  }, []);

  // Play notification sound - Fixed to actually play
  const playNotificationSound = useCallback(() => {
    try {
      // Try to create audio context (may need user interaction first)
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const audioContext = new AudioContextClass();
      
      // Resume context if suspended (required after user interaction)
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
      
      // Clean up
      oscillator.onended = () => {
        audioContext.close();
      };
    } catch (error) {
      console.log('Audio notification error:', error);
      // Fallback: try using HTML5 audio
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGW57+OeTQ8MT6Xh8LZjHAY4kdfyzHksBSR3x/DdkEAKFF606euoVRQKRp/g8r5sIQUrgc7y2Yk2CBhlue/jnk0PDE+l4fC2YxwGOJHX8sx5LAUkd8fw3ZBAC');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch (e) {
        console.log('Fallback audio failed');
      }
    }
  }, []);

  // Listen for login events
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel('admin_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_logins'
        },
        (payload) => {
          const loginData = payload.new as any;
          // Only notify if it's not the current user
          if (loginData.user_id !== currentUser.id) {
            const otherUser = loginData.user_role === 'artist' ? 'Esther Reign' : 'Editor';
            const notification: Notification = {
              id: `login_${Date.now()}`,
              type: 'login',
              title: `${otherUser} logged in`,
              message: `${otherUser} just logged into the admin panel`,
              timestamp: new Date(),
              read: false,
              userId: loginData.user_id
            };
            
            addNotification(notification);
            playNotificationSound();
            showBrowserNotification(
              `${otherUser} logged in`,
              `${otherUser} just logged into the admin panel`
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, playNotificationSound, showBrowserNotification, addNotification]);

  // Listen for chat messages
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel('chat_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          const message = payload.new as any;
          // Only notify if it's not from current user
          if (message.sender_id !== currentUser.id) {
            const senderName = message.sender_name || 'Someone';
            const notification: Notification = {
              id: `message_${message.id}`,
              type: 'message',
              title: `New message from ${senderName}`,
              message: message.message.substring(0, 50) + (message.message.length > 50 ? '...' : ''),
              timestamp: new Date(message.timestamp),
              read: false,
              userId: message.sender_id
            };
            
            addNotification(notification);
            playNotificationSound();
            showBrowserNotification(
              `New message from ${senderName}`,
              message.message.substring(0, 100)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, playNotificationSound, showBrowserNotification, addNotification]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      return prev.filter(n => n.id !== id);
    });
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'login':
        return <User size={18} className="text-blue-400" />;
      case 'message':
        return <MessageSquare size={18} className="text-purple-400" />;
      default:
        return <Bell size={18} className="text-green-400" />;
    }
  };

  return (
    <>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
      >
        <Bell size={20} className="text-purple-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 w-80 md:w-96 bg-[#2d1b4e] backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-500/30 z-50 max-h-[500px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-purple-500/30">
              <h3 className="text-lg font-bold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-purple-300 hover:text-purple-200"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell size={48} className="mx-auto mb-4 text-purple-400 opacity-50" />
                  <p className="text-purple-300">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-purple-500/20">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-purple-500/10 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-purple-500/5' : ''
                      }`}
                      onClick={() => {
                        markAsRead(notification.id);
                        onNotificationClick?.(notification);
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-semibold text-white">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-xs text-purple-300 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-purple-400 mt-2">
                            {formatTime(notification.timestamp)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="flex-shrink-0 p-1 hover:bg-purple-500/20 rounded transition-colors"
                        >
                          <X size={14} className="text-purple-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};


