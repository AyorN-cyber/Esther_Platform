/**
 * Main App Router - Switches between Mobile and Desktop layouts
 */

import { useIsMobile } from './hooks/useIsMobile';
import { MobileLayout } from './components/MobileLayout';
import DesktopApp from './DesktopApp';

export default function App() {
  const isMobile = useIsMobile();

  // Use mobile-specific layout for mobile devices
  if (isMobile) {
    return <MobileLayout />;
  }

  // Use desktop layout for larger screens
  return <DesktopApp />;
}
