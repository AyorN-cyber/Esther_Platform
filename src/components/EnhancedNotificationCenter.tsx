import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '../lib/supabaseEnhanced';
import { useTheme } from '../contexts/ThemeContext';
import type { EnhancedNotification } from '../types';

interface EnhancedNotificationCenterProps {
  userId: string;
}

export const EnhancedNotificationCenter: React.FC<EnhancedNotificationCenterProps> = ({ userId }) => {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<EnhancedNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      loadNotifications();
    }
  }, [userId]);

  const loadNotifications = async () => {
    setLoading(true);
    const data = await getNotifications(userId);
    setNotifications(data);
    setLoading(false);
  };

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, is_read: true } : n
    ));
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead(userId);
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      message: '💬',
      video_upload: '🎬',
      milestone: '🎯',
      deadline: '⏰',
      system: '⚙️',
      prayer_request: '🙏',
      achievement: '🏆'
    };
    return icons[type] || '📢';
  };

  const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = {
      message: 'blue',
      video_upload: 'purple',
      milestone: 'green',
      deadline: 'orange',
      system: 'gray',
      prayer_request: 'pink',
      achievement: 'yellow'
    };
    return colors[type] || 'gray';
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-colors ${
          theme === 'dark'
            ? 'hover:bg-gray-700'
            : 'hover:bg-gray-100'
        }`}
      >
        <Bell size={20} className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Notification Panel */}
          <div className={`absolute right-0 mt-2 w-80 md:w-96 rounded-lg shadow-xl border z-50 max-h-[80vh] overflow-hidden flex flex-col ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            {/* Header */}
            <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Notifications
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X size={18} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} />
                </button>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell size={48} className={`mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    No notifications yet
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 transition-colors ${
                        !notification.is_read
                          ? theme === 'dark'
                            ? 'bg-purple-900/20'
                            : 'bg-purple-50'
                          : ''
                      } ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {notification.title}
                            </h4>
                            {!notification.is_read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="flex-shrink-0 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                                title="Mark as read"
                              >
                                <Check size={14} className="text-purple-600" />
                              </button>
                            )}
                          </div>
                          {notification.body && (
                            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {notification.body}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                              {new Date(notification.created_at).toLocaleString()}
                            </span>
                            <button
                              onClick={() => handleDelete(notification.id)}
                              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20"
                            >
                              <Trash2 size={12} className="text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className={`p-3 border-t text-center ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    // Navigate to full notifications page if needed
                  }}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
