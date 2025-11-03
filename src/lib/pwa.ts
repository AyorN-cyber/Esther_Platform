/**
 * PWA Installation and Update Handler
 * Manages service worker registration, installation prompts, and updates
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let isInstalled = false;

/**
 * Register Service Worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator) {
    try {
      console.log('[PWA] Registering service worker...');
      
      const registration = await navigator.serviceWorker.register('/Esther_Platform/sw.js', {
        scope: '/Esther_Platform/'
      });

      console.log('[PWA] Service worker registered:', registration.scope);

      // Check for updates every hour
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              console.log('[PWA] New version available!');
              showUpdateNotification();
            }
          });
        }
      });

      return registration;
    } catch (error) {
      console.error('[PWA] Service worker registration failed:', error);
      return null;
    }
  } else {
    console.warn('[PWA] Service workers not supported');
    return null;
  }
}

/**
 * Show update notification to user
 */
function showUpdateNotification() {
  const updateBanner = document.createElement('div');
  updateBanner.id = 'pwa-update-banner';
  updateBanner.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 16px;
      max-width: 90%;
      animation: slideUp 0.3s ease-out;
    ">
      <span style="flex: 1; font-size: 14px; font-weight: 500;">
        🎉 New version available!
      </span>
      <button id="pwa-update-btn" style="
        background: white;
        color: #667eea;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        font-size: 14px;
      ">
        Update Now
      </button>
      <button id="pwa-dismiss-btn" style="
        background: transparent;
        color: white;
        border: 1px solid rgba(255,255,255,0.3);
        padding: 8px 16px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        font-size: 14px;
      ">
        Later
      </button>
    </div>
    <style>
      @keyframes slideUp {
        from {
          transform: translateX(-50%) translateY(100px);
          opacity: 0;
        }
        to {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
      }
    </style>
  `;

  document.body.appendChild(updateBanner);

  // Update button click
  document.getElementById('pwa-update-btn')?.addEventListener('click', () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  });

  // Dismiss button click
  document.getElementById('pwa-dismiss-btn')?.addEventListener('click', () => {
    updateBanner.remove();
  });
}

/**
 * Setup install prompt listener
 */
export function setupInstallPrompt() {
  // Check if already installed
  if (window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true) {
    isInstalled = true;
    console.log('[PWA] App is installed');
    return;
  }

  // Listen for install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('[PWA] Install prompt available');
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    
    // Show custom install button
    showInstallButton();
  });

  // Listen for app installed
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed successfully');
    isInstalled = true;
    deferredPrompt = null;
    hideInstallButton();
    
    // Show success message
    showInstallSuccessMessage();
  });
}

/**
 * Show install button in admin panel
 */
function showInstallButton() {
  // Check if button already exists
  if (document.getElementById('pwa-install-btn')) return;

  const installButton = document.createElement('button');
  installButton.id = 'pwa-install-btn';
  installButton.innerHTML = `
    <div style="
      position: fixed;
      bottom: 80px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 20px;
      border-radius: 50px;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      border: none;
      font-weight: 600;
      font-size: 14px;
      animation: pulse 2s infinite;
    ">
      <span style="font-size: 20px;">📱</span>
      <span>Install App</span>
    </div>
    <style>
      @keyframes pulse {
        0%, 100% {
          transform: scale(1);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        50% {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6);
        }
      }
    </style>
  `;

  installButton.addEventListener('click', promptInstall);
  document.body.appendChild(installButton);
}

/**
 * Hide install button
 */
function hideInstallButton() {
  const button = document.getElementById('pwa-install-btn');
  if (button) {
    button.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => button.remove(), 300);
  }
}

/**
 * Prompt user to install app
 */
export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) {
    console.log('[PWA] Install prompt not available');
    showInstallInstructions();
    return false;
  }

  try {
    // Show install prompt
    await deferredPrompt.prompt();
    
    // Wait for user choice
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[PWA] Install prompt outcome:', outcome);
    
    if (outcome === 'accepted') {
      hideInstallButton();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('[PWA] Install prompt error:', error);
    return false;
  }
}

/**
 * Show install instructions for iOS or other browsers
 */
function showInstallInstructions() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  let instructions = '';

  if (isIOS && isSafari) {
    instructions = `
      <div style="text-align: left; line-height: 1.6;">
        <p style="margin-bottom: 12px; font-weight: 600;">To install on iOS:</p>
        <ol style="padding-left: 20px; margin: 0;">
          <li style="margin-bottom: 8px;">Tap the Share button <span style="font-size: 20px;">⎋</span></li>
          <li style="margin-bottom: 8px;">Scroll down and tap "Add to Home Screen"</li>
          <li style="margin-bottom: 8px;">Tap "Add" in the top right</li>
        </ol>
      </div>
    `;
  } else {
    instructions = `
      <div style="text-align: left; line-height: 1.6;">
        <p style="margin-bottom: 12px; font-weight: 600;">To install:</p>
        <ol style="padding-left: 20px; margin: 0;">
          <li style="margin-bottom: 8px;">Open this site in Chrome or Edge</li>
          <li style="margin-bottom: 8px;">Look for the install icon in the address bar</li>
          <li style="margin-bottom: 8px;">Click "Install" when prompted</li>
        </ol>
      </div>
    `;
  }

  const modal = document.createElement('div');
  modal.innerHTML = `
    <div style="
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10001;
      padding: 20px;
      animation: fadeIn 0.2s ease-out;
    " id="install-modal">
      <div style="
        background: white;
        border-radius: 16px;
        padding: 24px;
        max-width: 400px;
        width: 100%;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      ">
        <h3 style="margin: 0 0 16px 0; font-size: 20px; color: #333;">
          Install Esther Reign Admin
        </h3>
        ${instructions}
        <button id="close-install-modal" style="
          margin-top: 20px;
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
        ">
          Got it!
        </button>
      </div>
    </div>
    <style>
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    </style>
  `;

  document.body.appendChild(modal);

  document.getElementById('close-install-modal')?.addEventListener('click', () => {
    modal.remove();
  });

  document.getElementById('install-modal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('install-modal')) {
      modal.remove();
    }
  });
}

/**
 * Show install success message
 */
function showInstallSuccessMessage() {
  const message = document.createElement('div');
  message.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      animation: slideDown 0.3s ease-out;
      font-weight: 500;
    ">
      ✅ App installed successfully!
    </div>
    <style>
      @keyframes slideDown {
        from {
          transform: translateX(-50%) translateY(-100px);
          opacity: 0;
        }
        to {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
      }
    </style>
  `;

  document.body.appendChild(message);

  setTimeout(() => {
    message.style.animation = 'slideDown 0.3s ease-out reverse';
    setTimeout(() => message.remove(), 300);
  }, 3000);
}

/**
 * Check if app is installed
 */
export function isAppInstalled(): boolean {
  return isInstalled || 
         window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
}

/**
 * Get install prompt availability
 */
export function canInstall(): boolean {
  return deferredPrompt !== null;
}

/**
 * Initialize PWA features
 */
export async function initPWA() {
  console.log('[PWA] Initializing PWA features...');
  
  // Register service worker
  await registerServiceWorker();
  
  // Setup install prompt
  setupInstallPrompt();
  
  // Log installation status
  if (isAppInstalled()) {
    console.log('[PWA] Running as installed app');
  } else {
    console.log('[PWA] Running in browser');
  }
}
