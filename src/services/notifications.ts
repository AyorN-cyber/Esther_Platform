import { supabase } from '../lib/supabase';

export const createNotification = async (
  userRole: string,
  title: string,
  message: string,
  type: string = 'update',
  referenceId: number = 0
) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        user_role: userRole,
        title,
        message,
        type,
        reference_id: referenceId,
        is_read: false
      }]);

    if (error) throw error;
  } catch (error) {
    console.error('Create notification error:', error);
  }
};

export const getUnreadNotifications = async (userRole: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_role', userRole)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get notifications error:', error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error('Mark notification as read error:', error);
  }
};

export const markAllNotificationsAsRead = async (userRole: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_role', userRole)
      .eq('is_read', false);

    if (error) throw error;
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
  }
};
