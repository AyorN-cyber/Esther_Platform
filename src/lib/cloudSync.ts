/**
 * Cloud Sync Utility
 * Automatically syncs data between devices using Supabase
 */

import { supabase } from './supabase';

const SYNC_KEY = 'esther_reign_data';
const DEVICE_ID = (() => {
  let id = localStorage.getItem('device_id');
  if (!id) {
    id = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('device_id', id);
  }
  return id;
})();

export interface SyncData {
  id?: string;
  device_id: string;
  site_settings: string | null;
  videos: string | null;
  hero_description: string | null;
  chat_messages: string | null;
  updated_at: string;
}

/**
 * Initialize cloud sync
 * Sets up real-time listeners and initial sync
 */
export const initCloudSync = async () => {
  console.log('🔄 Initializing cloud sync...');
  
  try {
    // Create table if it doesn't exist (will be done in Supabase dashboard)
    // First, try to fetch existing data
    await pullFromCloud();
    
    // Set up real-time listener for changes from other devices
    setupRealtimeSync();
    
    // Push local data to cloud initially
    await pushToCloud();
    
    // Poll for changes every 5 seconds for immediate updates
    setInterval(async () => {
      await pullFromCloud();
    }, 5000); // Check every 5 seconds
    
    console.log('✅ Cloud sync initialized successfully');
  } catch (error) {
    console.error('❌ Cloud sync initialization failed:', error);
    // Fallback to localStorage only
  }
};

/**
 * Push local data to cloud
 */
export const pushToCloud = async () => {
  try {
    const data: SyncData = {
      device_id: DEVICE_ID,
      site_settings: localStorage.getItem('site_settings'),
      videos: localStorage.getItem('videos'),
      hero_description: localStorage.getItem('hero_description'),
      chat_messages: localStorage.getItem('chat_messages'),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('sync_data')
      .upsert(data, { onConflict: 'device_id' });

    if (error) throw error;
    
    console.log('☁️ Data pushed to cloud');
  } catch (error) {
    console.error('Failed to push to cloud:', error);
  }
};

/**
 * Pull data from cloud
 */
export const pullFromCloud = async () => {
  try {
    const { data, error } = await supabase
      .from('sync_data')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // Table might not exist yet or no data
      console.log('No cloud data found, using local data');
      return;
    }

    if (data) {
      // Merge chat messages instead of replacing (to prevent data loss)
      if (data.chat_messages) {
        const cloudMessages = JSON.parse(data.chat_messages);
        const localMessages = JSON.parse(localStorage.getItem('chat_messages') || '[]');
        
        // Merge messages by ID, keeping the most recent version
        const messageMap = new Map();
        [...localMessages, ...cloudMessages].forEach(msg => {
          if (!messageMap.has(msg.id) || new Date(msg.timestamp) > new Date(messageMap.get(msg.id).timestamp)) {
            messageMap.set(msg.id, msg);
          }
        });
        
        const mergedMessages = Array.from(messageMap.values()).sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        
        localStorage.setItem('chat_messages', JSON.stringify(mergedMessages));
      }
      
      // Update other data normally
      if (data.site_settings) localStorage.setItem('site_settings', data.site_settings);
      if (data.videos) localStorage.setItem('videos', data.videos);
      if (data.hero_description) localStorage.setItem('hero_description', data.hero_description);
      
      console.log('☁️ Data pulled from cloud and merged');
      
      // Trigger storage event to update UI
      window.dispatchEvent(new Event('storage'));
    }
  } catch (error) {
    console.error('Failed to pull from cloud:', error);
  }
};

/**
 * Set up real-time sync listener
 */
const setupRealtimeSync = () => {
  const channel = supabase
    .channel('sync_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'sync_data'
      },
      (payload) => {
        console.log('🔔 Real-time update received:', payload);
        
        // Only update if change is from another device
        if (payload.new && (payload.new as SyncData).device_id !== DEVICE_ID) {
          const newData = payload.new as SyncData;
          
          // Update local storage
          if (newData.site_settings) localStorage.setItem('site_settings', newData.site_settings);
          if (newData.videos) localStorage.setItem('videos', newData.videos);
          if (newData.hero_description) localStorage.setItem('hero_description', newData.hero_description);
          if (newData.chat_messages) localStorage.setItem('chat_messages', newData.chat_messages);
          
          // Trigger storage event to update UI
          window.dispatchEvent(new Event('storage'));
          
          console.log('✨ Local data updated from another device');
        }
      }
    )
    .subscribe();

  return channel;
};

/**
 * Sync on data change
 * Call this whenever you update localStorage
 */
export const syncOnChange = () => {
  // Debounce to avoid too many requests
  if ((window as any).syncTimeout) {
    clearTimeout((window as any).syncTimeout);
  }
  
  (window as any).syncTimeout = setTimeout(() => {
    pushToCloud();
  }, 1000); // Wait 1 second after last change
};

/**
 * Manual sync trigger
 */
export const manualSync = async () => {
  console.log('🔄 Manual sync triggered');
  await pullFromCloud();
  await pushToCloud();
  console.log('✅ Manual sync complete');
};
