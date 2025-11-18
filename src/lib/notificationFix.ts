/**
 * Fixed Notification System with proper error handling
 */

export const requestNotificationPermission = async (): Promise<'granted' | 'denied' | 'unsupported' | 'error'> => {
  try {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.log('[Notifications] Not supported in this browser');
      return 'unsupported';
    }

    // Check current permission
    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    // Request permission
    const permission = await Notification.requestPermission();
    return permission === 'granted' ? 'granted' : 'denied';
  } catch (error) {
    console.error('[Notifications] Permission request error:', error);
    return 'error';
  }
};

export const showNotification = (title: string, options?: NotificationOptions): boolean => {
  try {
    if (!('Notification' in window)) {
      console.log('[Notifications] Not supported');
      return false;
    }

    if (Notification.permission !== 'granted') {
      console.log('[Notifications] Permission not granted');
      return false;
    }

    new Notification(title, {
      icon: '/Esther_Platform/icons/icon-192x192.png',
      badge: '/Esther_Platform/icons/badge-72x72.png',
      vibrate: [200, 100, 200],
      ...options
    });

    return true;
  } catch (error) {
    console.error('[Notifications] Show notification error:', error);
    return false;
  }
};

export const checkNotificationSupport = (): boolean => {
  return 'Notification' in window;
};

export const getNotificationPermission = (): NotificationPermission | 'unsupported' => {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
};
