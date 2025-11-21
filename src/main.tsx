import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './mobile-fix.css';
import { initPWA } from './lib/pwa';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProfilePictureProvider } from './contexts/ProfilePictureContext';
import ErrorBoundary from './ErrorBoundary';

// Initialize PWA features (non-blocking) - TEMPORARILY DISABLED FOR MOBILE TESTING
/*
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    initPWA().catch((error) => {
      console.error('PWA initialization failed:', error);
    });
  });
}
*/
console.log('[DEBUG] PWA initialization disabled for mobile testing');


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <ProfilePictureProvider>
          <App />
        </ProfilePictureProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
);
