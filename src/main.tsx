import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
// Removed mobile-fix.css - it was affecting desktop
import { initPWA } from './lib/pwa';
import { ThemeProvider } from './contexts/ThemeContext';

// FORCE Z-INDEX FIXES ONLY - Don't affect desktop sizing
const forceZIndexFixes = () => {
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

// Run z-index fixes only
setTimeout(forceZIndexFixes, 500);
setTimeout(forceZIndexFixes, 1000);

// Initialize PWA features
initPWA().then(() => {
  console.log('PWA initialized successfully');
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
