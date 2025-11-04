/**
 * Supabase Data Layer
 * All data operations go through Supabase - NO localStorage
 */

import { supabase } from './supabase';
import type { Video } from '../types';

// ==================== VIDEOS ====================

export const getVideos = async (): Promise<Video[]> => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
};

export const getCompletedVideos = async (): Promise<Video[]> => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('status', 'completed')
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching completed videos:', error);
    return [];
  }
};

export const addVideo = async (video: Omit<Video, 'id' | 'created_at' | 'updated_at'>): Promise<Video | null> => {
  try {
    const newVideo = {
      id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...video,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('videos')
      .insert([newVideo])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding video:', error);
    return null;
  }
};

export const updateVideo = async (id: string, updates: Partial<Video>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('videos')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating video:', error);
    return false;
  }
};

export const deleteVideo = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting video:', error);
    return false;
  }
};

export const reorderVideos = async (videos: Video[]): Promise<boolean> => {
  try {
    const updates = videos.map((video, index) => ({
      id: video.id,
      order_index: index,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('videos')
      .upsert(updates);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error reordering videos:', error);
    return false;
  }
};

// ==================== SITE SETTINGS ====================

export interface SiteSettings {
  id: string;
  hero_image?: string;
  hero_description?: string;
  about_image?: string;
  about_text?: string;
  contact_email?: string;
  contact_phone?: string;
  social_links?: {
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    facebook?: string;
  };
  updated_at?: string;
}

export const getSettings = async (): Promise<SiteSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'main')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
};

export const updateSettings = async (settings: Partial<SiteSettings>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('site_settings')
      .update({ ...settings, updated_at: new Date().toISOString() })
      .eq('id', 'main');

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating settings:', error);
    return false;
  }
};

// ==================== ANALYTICS ====================

export const trackVisit = async (): Promise<void> => {
  try {
    // Get current visit count
    const settings = await getSettings();
    const currentVisits = (settings as any)?.total_visits || 0;
    
    // Increment and update
    await supabase
      .from('site_settings')
      .update({ 
        total_visits: currentVisits + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', 'main');
  } catch (error) {
    console.error('Error tracking visit:', error);
  }
};

// ==================== REAL-TIME SUBSCRIPTIONS ====================

export const subscribeToVideos = (callback: (videos: Video[]) => void) => {
  const channel = supabase
    .channel('videos_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'videos'
      },
      async () => {
        const videos = await getVideos();
        callback(videos);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const subscribeToSettings = (callback: (settings: SiteSettings | null) => void) => {
  const channel = supabase
    .channel('settings_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'site_settings'
      },
      async () => {
        const settings = await getSettings();
        callback(settings);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
