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
 * @param revenue - Optional revenue data for conversion tracking
 */
export function trackEvent(
  eventName: string, 
  props?: Record<string, string | number | boolean>,
  revenue?: { amount: number; currency: string }
): void {
  if (typeof window !== 'undefined' && window.plausible) {
    const options: any = {};
    if (props) options.props = props;
    if (revenue) options.revenue = revenue;
    window.plausible(eventName, options);
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
 * Now includes enhanced tracking with revenue and tagged events
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

  // Event management with revenue tracking
  eventCreate: () => trackEvent('Event Create'),
  eventRSVP: (status: string) => trackEvent('Event RSVP', { status }),
  eventView: () => trackEvent('Event View'),
  eventPayment: (amount: number, currency = 'USD') => 
    trackEvent('Event Payment', { amount }, { amount, currency }),

  // Social features
  userFollow: () => trackEvent('User Follow'),
  messageStart: () => trackEvent('Message Start'),
  groupJoin: () => trackEvent('Group Join'),

  // Navigation (enhanced with pageview props)
  pageView: (pageName: string, props?: Record<string, string>) => 
    trackEvent('Page View', { page: pageName, ...props }),
  
  // Search and discovery
  searchPerform: (query: string) => trackEvent('Search', { query: query.substring(0, 50) }),
  filterApply: (type: string) => trackEvent('Filter Apply', { type }),

  // File downloads (automatically tracked by enhanced script)
  downloadResource: (filename: string, type: string) => 
    trackEvent('Download', { filename, type }),

  // Outbound link tracking (automatically tracked by enhanced script)
  externalLink: (url: string) => trackEvent('External Link', { url }),

  // Engagement with tagged events
  timeSpent: (section: string, seconds: number) => trackEvent('Time Spent', { section, seconds }),
  featureUse: (feature: string) => trackEvent('Feature Use', { feature }),

  // Revenue tracking for premium features
  premiumUpgrade: (plan: string, amount: number) => 
    trackEvent('Premium Upgrade', { plan }, { amount, currency: 'USD' }),
  
  // Tagged events for A/B testing and feature flags
  experimentView: (experiment: string, variant: string) => 
    trackEvent('Experiment View', { experiment, variant }),

  // Hash navigation tracking (automatically tracked by enhanced script)
  hashNavigation: (hash: string) => trackEvent('Hash Navigation', { hash })
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