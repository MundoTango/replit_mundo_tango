/**
 * Plausible Analytics Integration for Mundo Tango
 * 
 * Privacy-first web analytics that:
 * - Doesn't use cookies or collect personal data
 * - Is GDPR compliant by default
 * - Provides anonymous visitor insights
 * - Tracks page views and custom events
 */

// Plausible function is available globally when script is loaded
declare global {
  interface Window {
    plausible?: (eventName: string, options?: {
      callback?: () => void;
      props?: Record<string, string | number | boolean>;
    }) => void;
  }
}

/**
 * Track a custom event in Plausible Analytics
 * @param eventName - Name of the event (e.g., 'Sign Up', 'Post Created')
 * @param props - Optional properties to track with the event
 */
export function trackEvent(
  eventName: string, 
  props?: Record<string, string | number | boolean>
): void {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(eventName, { props });
  }
}

/**
 * Track page view (usually automatic, but useful for SPA navigation)
 * @param path - Optional page path override
 */
export function trackPageView(path?: string): void {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible('pageview', {
      props: path ? { path } : undefined
    });
  }
}

/**
 * Common analytics events for Mundo Tango
 */
export const analytics = {
  // User events
  userSignUp: () => trackEvent('User Sign Up'),
  userLogin: () => trackEvent('User Login'),
  userOnboardingComplete: () => trackEvent('Onboarding Complete'),
  userProfileUpdate: () => trackEvent('Profile Update'),

  // Content events
  postCreate: (type?: string) => trackEvent('Post Create', { type }),
  postLike: () => trackEvent('Post Like'),
  postComment: () => trackEvent('Post Comment'),
  postShare: () => trackEvent('Post Share'),

  // Event management
  eventCreate: () => trackEvent('Event Create'),
  eventRSVP: (status: string) => trackEvent('Event RSVP', { status }),
  eventView: () => trackEvent('Event View'),

  // Social features
  userFollow: () => trackEvent('User Follow'),
  messageStart: () => trackEvent('Message Start'),
  groupJoin: () => trackEvent('Group Join'),

  // Navigation
  pageView: (pageName: string) => trackEvent('Page View', { page: pageName }),
  
  // Search and discovery
  searchPerform: (query: string) => trackEvent('Search', { query: query.substring(0, 50) }),
  filterApply: (type: string) => trackEvent('Filter Apply', { type }),

  // Engagement
  timeSpent: (section: string, seconds: number) => trackEvent('Time Spent', { section, seconds }),
  featureUse: (feature: string) => trackEvent('Feature Use', { feature })
};

/**
 * Initialize analytics tracking
 * Call this once when the app starts
 */
export function initAnalytics(): void {
  // Track initial page load
  if (typeof window !== 'undefined') {
    console.log('Plausible Analytics initialized for Mundo Tango');
    
    // Optional: Track that analytics was successfully loaded
    setTimeout(() => {
      if (window.plausible) {
        trackEvent('Analytics Loaded', { version: '1.0' });
        console.log('Analytics tracking active - events will be sent to Plausible');
      } else {
        console.warn('Plausible script not loaded - analytics disabled');
      }
    }, 1000);
  }
}