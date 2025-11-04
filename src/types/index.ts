export interface Video {
  id: string;
  title: string;
  status: 'pending' | 'completed';
  template_type?: string;
  video_link?: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
  order_index: number;
}

export interface User {
  id: string;
  email: string;
  role: 'artist' | 'editor';
  phone: string;
  name: string;
}

export interface Analytics {
  total_visitors: number;
  page_visits: Record<string, number>;
  artist_logins: number;
  last_updated: string;
}

export interface Notification {
  id: string;
  recipient_phone: string;
  message: string;
  sent_at: string;
  type: 'video_update' | 'artist_login';
}

export interface SiteSettings {
  hero_image: string;
  hero_description?: string;
  about_image: string;
  about_text: string;
  phone: string;
  email: string;
  location: string;
  social_links: {
    instagram: string;
    youtube: string;
    tiktok: string;
    facebook: string;
    twitter: string;
  };
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'artist' | 'editor';
  message: string;
  video_reference?: string;
  reply_to?: string;
  timestamp: string;
  deletedFor?: string[];
  isApprovalRequest?: boolean;
  edited?: boolean;
}

// ==========================================
// PHASE 1 - ENHANCED TYPES
// ==========================================

export interface Goal {
  id: string;
  title: string;
  category: 'content' | 'growth' | 'ministry' | 'financial' | 'engagement' | 'learning' | 'personal';
  target_value: number;
  current_value: number;
  unit?: string;
  start_date: string;
  target_date?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'cancelled' | 'paused';
  notes?: string;
  milestones?: any[];
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface RevenueExpense {
  id: string;
  transaction_date: string;
  type: 'revenue' | 'expense';
  category: string;
  amount: number;
  currency: string;
  description?: string;
  payment_method?: string;
  receipt_url?: string;
  related_video_id?: string;
  is_recurring: boolean;
  recurring_frequency?: string;
  tags?: string[];
  created_by?: string;
  created_at: string;
}

export interface Milestone {
  id: string;
  milestone_type: 'subscribers' | 'views' | 'videos' | 'engagement' | 'financial' | 'ministry' | 'custom';
  title: string;
  description?: string;
  target_value: number;
  current_value: number;
  is_achieved: boolean;
  achieved_at?: string;
  icon?: string;
  celebration_message?: string;
  created_at: string;
}

export interface AnalyticsVisitor {
  id: string;
  visitor_date: string;
  visitor_count: number;
  unique_visitors: number;
  page_views: number;
  country?: string;
  city?: string;
  device_type?: 'mobile' | 'tablet' | 'desktop';
  browser?: string;
  referrer_source?: string;
  created_at: string;
}

export interface EnhancedNotification {
  id: string;
  user_id: string;
  type: 'message' | 'video_upload' | 'milestone' | 'deadline' | 'system' | 'prayer_request' | 'achievement';
  title: string;
  body?: string;
  icon_url?: string;
  action_url?: string;
  is_read: boolean;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface FanMessage {
  id: string;
  from_name: string;
  from_email?: string;
  message_type: 'prayer_request' | 'testimony' | 'song_request' | 'general' | 'booking_inquiry';
  subject?: string;
  message: string;
  status: 'unread' | 'read' | 'responded' | 'archived' | 'flagged';
  is_anonymous: boolean;
  is_prayed_for: boolean;
  is_featured: boolean;
  response?: string;
  responded_at?: string;
  responded_by?: string;
  follow_up_date?: string;
  tags?: string[];
  created_at: string;
}

export interface AnalyticsSummary {
  totalVisitors: number;
  totalViews: number;
  totalVideos: number;
  completedVideos: number;
  pendingVideos: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  activeGoals: number;
  completedGoals: number;
  unreadNotifications: number;
  unreadMessages: number;
  growthRate: number;
  avgEngagement: number;
}
