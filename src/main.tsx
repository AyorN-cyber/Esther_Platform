import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initPWA } from './lib/pwa';

// Initialize PWA features
initPWA().then(() => {
  console.log('PWA initialized successfully');
}).catch((error) => {
  console.error('PWA initialization failed:', error);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
