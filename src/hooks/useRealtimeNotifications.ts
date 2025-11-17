import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { notificationService } from '../lib/notificationService';

interface UserType {
  id: string;
  email: string;
  name: string;
  role: 'artist' | 'editor';
}

export const useRealtimeNotifications = (currentUser: UserType | null) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUser) return;

    // Subscribe to new fan messages
    const messagesSubscription = supabase
      .channel('fan_messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'fan_messages'
        },
        (payload) => {
          const newMessage = payload.new as any;
          notificationService.notifyNewFanMessage(
            newMessage.message_type,
            newMessage.from_name || 'Anonymous'
          );
          updateUnreadCount();
        }
      )
      .subscribe();

    // Subscribe to new song requests
    const songRequestsSubscription = supabase
      .channel('song_requests_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'song_requests'
        },
        (payload) => {
          const newRequest = payload.new as any;
          notificationService.notifyNewSongRequest(
            newRequest.song_title,
            newRequest.requested_by_name || 'Anonymous'
          );
          updateUnreadCount();
        }
      )
      .subscribe();

    // Initial count
    updateUnreadCount();

    // Cleanup
    return () => {
      messagesSubscription.unsubscribe();
      songRequestsSubscription.unsubscribe();
    };
  }, [currentUser]);

  const updateUnreadCount = async () => {
    try {
      // Count unread messages
      const { count: messageCount } = await supabase
        .from('fan_messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'unread');

      // Count new song requests
      const { count: requestCount } = await supabase
        .from('song_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new');

      const total = (messageCount || 0) + (requestCount || 0);
      setUnreadCount(total);
      await notificationService.updateBadge(total);
    } catch (error) {
      console.error('Error updating unread count:', error);
    }
  };

  return { unreadCount, updateUnreadCount };
};
