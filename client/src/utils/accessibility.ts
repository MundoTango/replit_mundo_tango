/**
 * Accessibility Utilities
 * Phase 9: Accessibility & Internationalization (35L Framework Layers 4, 17, 22)
 */

// ARIA live region announcer
class AriaAnnouncer {
  private announcer: HTMLElement | null = null;
  
  constructor() {
    this.createAnnouncer();
  }
  
  private createAnnouncer() {
    if (typeof document === 'undefined') return;
    
    this.announcer = document.createElement('div');
    this.announcer.setAttribute('role', 'status');
    this.announcer.setAttribute('aria-live', 'polite');
    this.announcer.setAttribute('aria-atomic', 'true');
    this.announcer.className = 'sr-only';
    document.body.appendChild(this.announcer);
  }
  
  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (!this.announcer) return;
    
    this.announcer.setAttribute('aria-live', priority);
    this.announcer.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      if (this.announcer) {
        this.announcer.textContent = '';
      }
    }, 1000);
  }
}

export const ariaAnnouncer = new AriaAnnouncer();

// Focus management utilities
export const focusManagement = {
  // Trap focus within a container
  trapFocus(container: HTMLElement) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    firstFocusable?.focus();
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  },
  
  // Restore focus after modal close
  restoreFocus(previousElement: HTMLElement | null) {
    if (previousElement && document.body.contains(previousElement)) {
      previousElement.focus();
    }
  }
};

// Keyboard navigation helpers
export const keyboardNavigation = {
  // Handle arrow key navigation
  handleArrowNavigation(
    e: KeyboardEvent,
    currentIndex: number,
    totalItems: number,
    onNavigate: (index: number) => void
  ) {
    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : totalItems - 1;
        onNavigate(prevIndex);
        break;
        
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        const nextIndex = currentIndex < totalItems - 1 ? currentIndex + 1 : 0;
        onNavigate(nextIndex);
        break;
        
      case 'Home':
        e.preventDefault();
        onNavigate(0);
        break;
        
      case 'End':
        e.preventDefault();
        onNavigate(totalItems - 1);
        break;
    }
  },
  
  // Create keyboard shortcut handler
  createShortcutHandler(shortcuts: Record<string, () => void>) {
    return (e: KeyboardEvent) => {
      const key = `${e.ctrlKey ? 'ctrl+' : ''}${e.altKey ? 'alt+' : ''}${e.key.toLowerCase()}`;
      
      if (shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
      }
    };
  }
};

// Screen reader utilities
export const screenReaderUtils = {
  // Generate descriptive label for complex elements
  generateLabel(base: string, context?: Record<string, any>): string {
    let label = base;
    
    if (context) {
      if (context.count !== undefined) {
        label += `, ${context.count} items`;
      }
      if (context.selected) {
        label += ', selected';
      }
      if (context.expanded !== undefined) {
        label += context.expanded ? ', expanded' : ', collapsed';
      }
    }
    
    return label;
  },
  
  // Create live region text for dynamic content
  getLiveRegionText(action: string, details?: string): string {
    const messages = {
      added: `${details || 'Item'} added`,
      removed: `${details || 'Item'} removed`,
      updated: `${details || 'Content'} updated`,
      loading: 'Loading content',
      loaded: 'Content loaded',
      error: `Error: ${details || 'Operation failed'}`
    };
    
    return messages[action as keyof typeof messages] || action;
  }
};

// Color contrast checker
export function checkColorContrast(
  foreground: string,
  background: string
): { ratio: number; passesAA: boolean; passesAAA: boolean } {
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };
  
  // Calculate relative luminance
  const getLuminance = (rgb: { r: number; g: number; b: number }) => {
    const { r, g, b } = rgb;
    const sRGB = [r, g, b].map(val => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };
  
  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);
  
  if (!fgRgb || !bgRgb) {
    return { ratio: 0, passesAA: false, passesAAA: false };
  }
  
  const fgLuminance = getLuminance(fgRgb);
  const bgLuminance = getLuminance(bgRgb);
  
  const ratio = (Math.max(fgLuminance, bgLuminance) + 0.05) /
                (Math.min(fgLuminance, bgLuminance) + 0.05);
  
  return {
    ratio: Math.round(ratio * 100) / 100,
    passesAA: ratio >= 4.5,
    passesAAA: ratio >= 7
  };
}

// Reduced motion preference
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// High contrast mode detection
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-contrast: high)').matches;
}