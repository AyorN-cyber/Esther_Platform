import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './mobile-fix.css';
import { initPWA } from './lib/pwa';
import { ThemeProvider } from './contexts/ThemeContext';

// FORCE MOBILE FIXES - JavaScript approach
const forceMobileFixes = () => {
  const isMobile = window.innerWidth <= 640;
  
  if (isMobile) {
    // Force viewport constraints
    document.documentElement.style.fontSize = '13px';
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.overflowX = 'hidden';
    document.body.style.maxWidth = '100vw';
    document.body.style.width = '100%';
    
    // Force button styles
    const styleButtons = () => {
      document.querySelectorAll('button').forEach(btn => {
        if (!btn.classList.contains('no-mobile-fix')) {
          btn.style.fontSize = '10px';
          btn.style.padding = '4px 8px';
          btn.style.minHeight = '28px';
          btn.style.maxWidth = '100%';
        }
      });
    };
    
    // Run immediately and on DOM changes
    styleButtons();
    const observer = new MutationObserver(styleButtons);
    observer.observe(document.body, { childList: true, subtree: true });
  }
  
  // FORCE Z-INDEX FIXES - Always run
  const forceZIndex = () => {
    // Chat widgets to top
    document.querySelectorAll('[class*="Chat"], [class*="chat"]').forEach(el => {
      (el as HTMLElement).style.zIndex = '999999';
      (el as HTMLElement).style.position = 'fixed';
    });
    
    // Admin nav below chat
    document.querySelectorAll('nav').forEach((el, index) => {
      if (el.textContent?.includes('Admin') || el.textContent?.includes('Esther Reign Admin')) {
        (el as HTMLElement).style.zIndex = '90';
      } else if (index === 0) {
        (el as HTMLElement).style.zIndex = '100';
      }
    });
  };
  
  // Run z-index fixes repeatedly to ensure they stick
  forceZIndex();
  setTimeout(forceZIndex, 500);
  setTimeout(forceZIndex, 1000);
  setTimeout(forceZIndex, 2000);
  
  // Watch for new elements
  const zIndexObserver = new MutationObserver(forceZIndex);
  zIndexObserver.observe(document.body, { childList: true, subtree: true });
};

// Run fixes immediately
forceMobileFixes();

// Run fixes after DOM is ready
document.addEventListener('DOMContentLoaded', forceMobileFixes);

// Run fixes after React renders
setTimeout(forceMobileFixes, 100);
setTimeout(forceMobileFixes, 500);
setTimeout(forceMobileFixes, 1000);

// Initialize PWA features
initPWA().then(() => {
  console.log('PWA initialized successfully');
  forceMobileFixes();
}).catch((error) => {
  console.error('PWA initialization failed:', error);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);
