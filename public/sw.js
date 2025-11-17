/**
 * Service Worker for Esther Reign Admin PWA
 * Handles offline functionality, caching, and background sync
 */

// Cache version - increment this when you want to force cache update
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `esther-reign-admin-${CACHE_VERSION}`;

// Cache names for different strategies
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`;
const IMAGE_CACHE = `${CACHE_NAME}-images`;

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/Esther_Platform/',
  '/Esther_Platform/index.html',
  '/Esther_Platform/#admin',
  '/Esther_Platform/manifest.json',
  '/Esther_Platform/offline.html', // Fallback page for offline
];

// Routes that should always fetch from network first
const NETWORK_FIRST_ROUTES = [
  '/api/',
  'supabase.co',
  'chat_messages',
  'videos',
  'site_settings'
];

// Maximum cache size for dynamic content
const MAX_DYNAMIC_CACHE_SIZE = 50;
const MAX_IMAGE_CACHE_SIZE = 100;

/**
 * Install Event - Cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...', CACHE_VERSION);
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Error caching static assets:', error);
      })
  );
});

/**
 * Activate Event - Clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Delete old caches that don't match current version
              return cacheName.startsWith('esther-reign-admin-') && 
                     cacheName !== STATIC_CACHE && 
                     cacheName !== DYNAMIC_CACHE && 
                     cacheName !== IMAGE_CACHE;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        // Take control of all pages immediately
        return self.clients.claim();
      })
  );
});

/**
 * Fetch Event - Handle requests with appropriate caching strategy
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Determine caching strategy based on request
  if (isStaticAsset(url)) {
    // Cache-first for static assets
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (isImage(url)) {
    // Cache-first for images with size limit
    event.respondWith(cacheFirst(request, IMAGE_CACHE, MAX_IMAGE_CACHE_SIZE));
  } else if (isNetworkFirst(url)) {
    // Network-first for dynamic content (admin data, chat, Supabase)
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  } else {
    // Default: Network-first with cache fallback
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  }
});

/**
 * Cache-First Strategy
 * Try cache first, fallback to network, then cache the response
 */
async function cacheFirst(request, cacheName, maxSize = null) {
  try {
    // Try to get from cache
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[SW] Cache hit:', request.url);
      return cachedResponse;
    }

    // Not in cache, fetch from network
    console.log('[SW] Cache miss, fetching:', request.url);
    const networkResponse = await fetch(request);

    // Cache the response if successful
    if (networkResponse && networkResponse.status === 200) {
      const responseToCache = networkResponse.clone();
      
      // Limit cache size if specified
      if (maxSize) {
        await limitCacheSize(cacheName, maxSize);
      }
      
      cache.put(request, responseToCache);
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache-first error:', error);
    
    // Try to return offline page for navigation requests
    if (request.mode === 'navigate') {
      const cache = await caches.open(STATIC_CACHE);
      return cache.match('/Esther_Platform/offline.html');
    }
    
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

/**
 * Network-First Strategy
 * Try network first, fallback to cache if offline
 */
async function networkFirst(request, cacheName) {
  try {
    // Try network first
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      const responseToCache = networkResponse.clone();
      
      // Limit cache size
      await limitCacheSize(cacheName, MAX_DYNAMIC_CACHE_SIZE);
      
      cache.put(request, responseToCache);
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    // Network failed, try cache
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[SW] Serving from cache:', request.url);
      return cachedResponse;
    }

    // No cache available, return offline page for navigation
    if (request.mode === 'navigate') {
      const staticCache = await caches.open(STATIC_CACHE);
      return staticCache.match('/Esther_Platform/offline.html');
    }

    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

/**
 * Limit cache size by removing oldest entries
 */
async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxSize) {
    // Delete oldest entries (first in the array)
    const deleteCount = keys.length - maxSize;
    for (let i = 0; i < deleteCount; i++) {
      await cache.delete(keys[i]);
    }
    console.log(`[SW] Trimmed ${deleteCount} items from ${cacheName}`);
  }
}

/**
 * Check if URL is a static asset
 */
function isStaticAsset(url) {
  const staticExtensions = ['.js', '.css', '.woff', '.woff2', '.ttf', '.eot'];
  return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

/**
 * Check if URL is an image
 */
function isImage(url) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico'];
  return imageExtensions.some(ext => url.pathname.endsWith(ext));
}

/**
 * Check if URL should use network-first strategy
 */
function isNetworkFirst(url) {
  return NETWORK_FIRST_ROUTES.some(route => url.href.includes(route));
}

/**
 * Background Sync - Handle offline form submissions
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);
  
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  } else if (event.tag === 'sync-videos') {
    event.waitUntil(syncVideos());
  }
});

/**
 * Sync pending messages when back online
 */
async function syncMessages() {
  try {
    console.log('[SW] Syncing pending messages...');
    
    // Get pending messages from IndexedDB or localStorage
    const pendingMessages = await getPendingMessages();
    
    if (pendingMessages && pendingMessages.length > 0) {
      for (const message of pendingMessages) {
        try {
          // Send message to server
          await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message)
          });
          
          // Remove from pending queue
          await removePendingMessage(message.id);
        } catch (error) {
          console.error('[SW] Failed to sync message:', error);
        }
      }
    }
    
    console.log('[SW] Message sync complete');
  } catch (error) {
    console.error('[SW] Background sync error:', error);
  }
}

/**
 * Sync pending video updates when back online
 */
async function syncVideos() {
  try {
    console.log('[SW] Syncing pending video updates...');
    // Implementation similar to syncMessages
  } catch (error) {
    console.error('[SW] Video sync error:', error);
  }
}

/**
 * Helper functions for background sync
 * These would interact with IndexedDB in a real implementation
 */
async function getPendingMessages() {
  // Placeholder - implement with IndexedDB
  return [];
}

async function removePendingMessage(id) {
  // Placeholder - implement with IndexedDB
  console.log('[SW] Removed pending message:', id);
}

/**
 * Push Notification Handler (for future use)
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'esther-reign-notification',
    requireInteraction: false,
    actions: [
      { action: 'open', title: 'Open Admin' },
      { action: 'close', title: 'Close' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Esther Reign Admin', options)
  );
});

/**
 * Notification Click Handler
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/#admin')
    );
  }
});

/**
 * Message Handler - Communication with main app
 */
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE)
        .then((cache) => cache.addAll(event.data.urls))
    );
  }
  
  // Handle badge updates
  if (event.data && event.data.type === 'UPDATE_BADGE') {
    const count = event.data.count || 0;
    console.log('[SW] Updating badge to:', count);
    
    // Update badge using Badge API
    if (self.registration && 'setAppBadge' in self.registration) {
      if (count > 0) {
        self.registration.setAppBadge(count).catch(err => {
          console.error('[SW] Badge update failed:', err);
        });
      } else {
        self.registration.clearAppBadge().catch(err => {
          console.error('[SW] Badge clear failed:', err);
        });
      }
    }
  }
});

console.log('[SW] Service worker script loaded', CACHE_VERSION);
