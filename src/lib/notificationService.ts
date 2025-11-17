// Notification Service with Sound and Badge Support

class NotificationService {
  private audio: HTMLAudioElement | null = null;
  private notificationCount = 0;

  constructor() {
    // Initialize audio for notifications
    this.initializeAudio();
    // Request notification permission
    this.requestPermission();
  }

  private initializeAudio() {
    // Create a simple notification sound using Web Audio API
    // This works without needing an external file
  }

  private async requestPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }

  // Play notification sound
  playSound() {
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // Frequency in Hz
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }

  // Show browser notification
  async showNotification(title: string, options?: NotificationOptions) {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new Notification(title, {
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          ...options
        });

        // Auto-close after 5 seconds
        setTimeout(() => notification.close(), 5000);

        return notification;
      } catch (error) {
        console.error('Error showing notification:', error);
      }
    }
  }

  // Update PWA badge
  async updateBadge(count: number) {
    this.notificationCount = count;
    console.log('🔔 Updating badge to:', count);

    // Method 1: Try navigator.setAppBadge (Chrome/Edge)
    if ('setAppBadge' in navigator) {
      try {
        if (count > 0) {
          await (navigator as any).setAppBadge(count);
          console.log('✅ Badge set via navigator.setAppBadge');
        } else {
          await (navigator as any).clearAppBadge();
          console.log('✅ Badge cleared via navigator.clearAppBadge');
        }
      } catch (error) {
        console.error('❌ navigator.setAppBadge error:', error);
      }
    }

    // Method 2: Send message to service worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        navigator.serviceWorker.controller.postMessage({
          type: 'UPDATE_BADGE',
          count: count
        });
        console.log('✅ Badge update message sent to service worker');
      } catch (error) {
        console.error('❌ Service worker message error:', error);
      }
    }

    // Method 3: Always update favicon as fallback
    this.updateFaviconBadge(count);
    console.log('✅ Favicon badge updated');
  }

  // Update favicon with notification count
  private updateFaviconBadge(count: number) {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Draw purple circle
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.arc(16, 16, 16, 0, 2 * Math.PI);
    ctx.fill();

    // Draw count if > 0
    if (count > 0) {
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(24, 8, 8, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(count > 99 ? '99+' : count.toString(), 24, 8);
    }

    // Update favicon
    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = canvas.toDataURL();
    document.getElementsByTagName('head')[0].appendChild(link);
  }

  // Clear badge
  async clearBadge() {
    await this.updateBadge(0);
  }

  // Notify about new message
  async notifyNewMessage(from: string, preview: string) {
    this.playSound();
    await this.showNotification('New Message', {
      body: `From ${from}: ${preview}`,
      tag: 'new-message'
    });
  }

  // Notify about new song request
  async notifyNewSongRequest(songTitle: string, requestedBy: string) {
    this.playSound();
    await this.showNotification('New Song Request', {
      body: `${requestedBy} requested: ${songTitle}`,
      tag: 'new-song-request'
    });
  }

  // Notify about user login
  async notifyUserLogin(userName: string, userRole: string) {
    this.playSound();
    await this.showNotification('User Logged In', {
      body: `${userName} (${userRole}) has logged in`,
      tag: 'user-login'
    });
  }

  // Notify about new fan message
  async notifyNewFanMessage(messageType: string, from: string) {
    this.playSound();
    await this.showNotification('New Fan Message', {
      body: `${messageType} from ${from}`,
      tag: 'new-fan-message'
    });
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
