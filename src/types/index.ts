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
