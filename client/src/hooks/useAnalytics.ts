/**
 * React hook for Plausible Analytics integration
 * Provides easy-to-use analytics tracking throughout the app
 */

import { useCallback } from 'react';
import { analytics, trackEvent, trackPageView } from '@/lib/analytics';

export function useAnalytics() {
  // Page tracking
  const trackPage = useCallback((pageName: string) => {
    analytics.pageView(pageName);
  }, []);

  // User action tracking
  const trackUserAction = useCallback((action: string, properties?: Record<string, string | number | boolean>) => {
    trackEvent(action, properties);
  }, []);

  // Content interaction tracking
  const trackContentInteraction = useCallback((type: 'like' | 'comment' | 'share' | 'create', contentType?: string) => {
    switch (type) {
      case 'like':
        analytics.postLike();
        break;
      case 'comment':
        analytics.postComment();
        break;
      case 'share':
        analytics.postShare();
        break;
      case 'create':
        analytics.postCreate(contentType);
        break;
    }
  }, []);

  // Event interaction tracking
  const trackEventInteraction = useCallback((action: 'create' | 'view' | 'rsvp', status?: string) => {
    switch (action) {
      case 'create':
        analytics.eventCreate();
        break;
      case 'view':
        analytics.eventView();
        break;
      case 'rsvp':
        if (status) analytics.eventRSVP(status);
        break;
    }
  }, []);

  // Social interaction tracking
  const trackSocialInteraction = useCallback((action: 'follow' | 'message' | 'join_group') => {
    switch (action) {
      case 'follow':
        analytics.userFollow();
        break;
      case 'message':
        analytics.messageStart();
        break;
      case 'join_group':
        analytics.groupJoin();
        break;
    }
  }, []);

  // Search and discovery tracking
  const trackSearch = useCallback((query: string) => {
    analytics.searchPerform(query);
  }, []);

  const trackFilter = useCallback((filterType: string) => {
    analytics.filterApply(filterType);
  }, []);

  // Feature usage tracking
  const trackFeature = useCallback((featureName: string) => {
    analytics.featureUse(featureName);
  }, []);

  // Time tracking for engagement
  const trackTimeSpent = useCallback((section: string, seconds: number) => {
    analytics.timeSpent(section, seconds);
  }, []);

  return {
    trackPage,
    trackUserAction,
    trackContentInteraction,
    trackEventInteraction,
    trackSocialInteraction,
    trackSearch,
    trackFilter,
    trackFeature,
    trackTimeSpent,
    // Direct access to analytics for custom events
    analytics
  };
}