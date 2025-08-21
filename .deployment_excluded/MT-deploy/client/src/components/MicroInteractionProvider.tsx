import { useEffect } from 'react';
import { initializeRippleButtons } from '@/utils/microInteractions';

export function MicroInteractionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize ripple effects on all buttons
    initializeRippleButtons();
    
    // Re-initialize when DOM changes
    const observer = new MutationObserver(() => {
      initializeRippleButtons();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    return () => observer.disconnect();
  }, []);
  
  return <>{children}</>;
}