/**
 * PWA Install Button Component
 * Works on all devices: PC, Mobile, iOS, Android
 */

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, Apple, Chrome } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app was installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) {
      // Show manual instructions for browsers that don't support beforeinstallprompt
      alert('To install this app:\n\n1. Click the menu button (⋮) in your browser\n2. Select "Install App" or "Add to Home Screen"\n3. Follow the prompts');
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setIsInstalled(true);
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  // Don't show button if already installed
  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* Install Button */}
      <button
        onClick={handleInstallClick}
        className="w-full mt-4 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:shadow-lg hover:shadow-green-500/50 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <Download size={18} />
        Install App
      </button>

      {/* iOS Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#2d1b4e] to-[#1a0a2e] rounded-2xl p-6 max-w-md w-full border border-purple-500/30 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Apple size={24} className="text-purple-300" />
                <h3 className="text-xl font-bold text-white">Install on iOS</h3>
              </div>
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
              >
                <X size={20} className="text-purple-300" />
              </button>
            </div>

            <div className="space-y-4 text-purple-200">
              <p className="text-sm">To install this app on your iPhone or iPad:</p>
              
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span>Tap the <strong className="text-white">Share</strong> button at the bottom of Safari</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span>Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span>Tap <strong className="text-white">"Add"</strong> in the top right corner</span>
                </li>
              </ol>

              <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <p className="text-xs text-purple-300">
                  💡 The app icon will appear on your home screen and work like a native app!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSInstructions(false)}
              className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Android/Chrome Instructions (if prompt not available) */}
      {!isIOS && !deferredPrompt && showInstallPrompt && (
        <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <div className="flex items-start gap-2">
            <Chrome size={18} className="text-blue-300 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-200">
              <p className="font-semibold mb-1">Install this app:</p>
              <p>Click the menu (⋮) → "Install App" or "Add to Home Screen"</p>
            </div>
          </div>
        </div>
      )}

      {/* Device-specific hints */}
      <div className="mt-3 flex items-center justify-center gap-4 text-xs text-purple-400">
        <div className="flex items-center gap-1">
          <Smartphone size={14} />
          <span>Mobile</span>
        </div>
        <div className="flex items-center gap-1">
          <Monitor size={14} />
          <span>Desktop</span>
        </div>
        <div className="flex items-center gap-1">
          <Apple size={14} />
          <span>iOS</span>
        </div>
      </div>
    </>
  );
};
