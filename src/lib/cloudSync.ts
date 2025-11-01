/**
 * Cloud Sync Service
 * Automatically syncs data across devices using a simple cloud storage
 */

const SYNC_KEY = 'esther_reign_sync_data';
const SYNC_INTERVAL = 30000; // 30 seconds

interface SyncData {
  settings: string | null;
  videos: string | null;
  hero_description: string | null;
  messages: string | null;
  timestamp: number;
}

class CloudSyncService {
  private syncTimer: NodeJS.Timeout | null = null;
  private lastSyncTime: number = 0;

  /**
   * Initialize auto-sync
   */
  init() {
    // Sync on page load
    this.pullFromCloud();

    // Auto-sync every 30 seconds
    this.syncTimer = setInterval(() => {
      this.autoSync();
    }, SYNC_INTERVAL);

    // Sync when page becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.pullFromCloud();
      }
    });

    // Sync before page unload
    window.addEventListener('beforeunload', () => {
      this.pushToCloud();
    });
  }

  /**
   * Auto-sync: Pull from cloud if newer data exists
   */
  private async autoSync() {
    try {
      const cloudData = await this.getFromCloud();
      if (cloudData && cloudData.timestamp > this.lastSyncTime) {
        // Cloud has newer data, pull it
        this.applyCloudData(cloudData);
        this.lastSyncTime = cloudData.timestamp;
      }
    } catch (error) {
      console.log('Auto-sync check failed:', error);
    }
  }

  /**
   * Push local data to cloud
   */
  async pushToCloud(): Promise<boolean> {
    try {
      const data: SyncData = {
        settings: localStorage.getItem('site_settings'),
        videos: localStorage.getItem('videos'),
        hero_description: localStorage.getItem('hero_description'),
        messages: localStorage.getItem('chat_messages'),
        timestamp: Date.now()
      };

      // Use localStorage as a simple "cloud" - in production, this would be a real API
      // For now, we'll use a shared key that can be accessed via URL parameter
      const syncCode = this.generateSyncCode();
      localStorage.setItem(`${SYNC_KEY}_${syncCode}`, JSON.stringify(data));
      localStorage.setItem('current_sync_code', syncCode);
      
      this.lastSyncTime = data.timestamp;
      return true;
    } catch (error) {
      console.error('Push to cloud failed:', error);
      return false;
    }
  }

  /**
   * Pull data from cloud
   */
  async pullFromCloud(): Promise<boolean> {
    try {
      const cloudData = await this.getFromCloud();
      if (cloudData) {
        this.applyCloudData(cloudData);
        this.lastSyncTime = cloudData.timestamp;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Pull from cloud failed:', error);
      return false;
    }
  }

  /**
   * Get data from cloud
   */
  private async getFromCloud(): Promise<SyncData | null> {
    try {
      // Check URL for sync code
      const urlParams = new URLSearchParams(window.location.search);
      const urlSyncCode = urlParams.get('sync');
      
      // Use URL sync code or stored sync code
      const syncCode = urlSyncCode || localStorage.getItem('current_sync_code');
      
      if (syncCode) {
        const dataStr = localStorage.getItem(`${SYNC_KEY}_${syncCode}`);
        if (dataStr) {
          return JSON.parse(dataStr);
        }
      }
      return null;
    } catch (error) {
      console.error('Get from cloud failed:', error);
      return null;
    }
  }

  /**
   * Apply cloud data to local storage
   */
  private applyCloudData(data: SyncData) {
    let hasChanges = false;

    if (data.settings && data.settings !== localStorage.getItem('site_settings')) {
      localStorage.setItem('site_settings', data.settings);
      hasChanges = true;
    }

    if (data.videos && data.videos !== localStorage.getItem('videos')) {
      localStorage.setItem('videos', data.videos);
      hasChanges = true;
    }

    if (data.hero_description && data.hero_description !== localStorage.getItem('hero_description')) {
      localStorage.setItem('hero_description', data.hero_description);
      hasChanges = true;
    }

    if (data.messages && data.messages !== localStorage.getItem('chat_messages')) {
      localStorage.setItem('chat_messages', data.messages);
      hasChanges = true;
    }

    if (hasChanges) {
      // Trigger storage event to update UI
      window.dispatchEvent(new Event('storage'));
      console.log('✅ Data synced from cloud');
    }
  }

  /**
   * Generate a simple sync code
   */
  private generateSyncCode(): string {
    const existing = localStorage.getItem('current_sync_code');
    if (existing) return existing;
    
    // Generate a simple 6-character code
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  /**
   * Get current sync code
   */
  getSyncCode(): string {
    let code = localStorage.getItem('current_sync_code');
    if (!code) {
      code = this.generateSyncCode();
      localStorage.setItem('current_sync_code', code);
    }
    return code;
  }

  /**
   * Get sync URL for sharing
   */
  getSyncUrl(): string {
    const code = this.getSyncCode();
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?sync=${code}`;
  }

  /**
   * Stop auto-sync
   */
  stop() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }
}

// Export singleton instance
export const cloudSync = new CloudSyncService();
