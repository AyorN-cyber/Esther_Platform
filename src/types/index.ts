export interface Video {
  id: number;
  title: string;
  status: string;
  template: string;
  notes: string;
  drive_link: string;
  thumbnail_url: string;
  added_by: string;
  comments?: Comment[];
  public_comments?: PublicComment[];
}

export interface Comment {
  id: string;
  video_id?: number;
  author: string;
  role: string;
  text: string;
  created_at: string;
  parent_comment_id?: string;
  replies?: CommentReply[];
}

export interface CommentReply {
  id: string;
  comment_id: string;
  author: string;
  role: string;
  text: string;
  created_at: string;
}

export interface PublicComment {
  id: string;
  video_id: number;
  author_name: string;
  author_email: string;
  text: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_role: string;
  title: string;
  message: string;
  type: string;
  reference_id: number;
  is_read: boolean;
  created_at: string;
}

export interface User {
  username: string;
  role: string;
  name: string;
}

export interface SiteSettings {
  id?: string;
  profile_image: string;
  about_image: string;
  about_text: string;
  social_tiktok: string;
  social_facebook: string;
  social_youtube: string;
  social_twitter: string;
  social_instagram: string;
  social_email: string;
  social_other: Array<{ name: string; url: string; icon: string }>;
}
