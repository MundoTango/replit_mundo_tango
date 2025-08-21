/**
 * Analytics Testing Utilities
 * Used to verify Plausible Analytics integration is working correctly
 */

import { analytics } from './analytics';

export function testAnalyticsIntegration() {
  console.log('Testing Plausible Analytics integration...');
  
  // Test basic event tracking
  setTimeout(() => {
    analytics.featureUse('Analytics Test');
    console.log('✅ Analytics test event sent');
  }, 2000);

  // Test page view tracking
  analytics.pageView('Analytics Test Page');
  console.log('✅ Page view tracking tested');

  // Verify Plausible script is loaded
  if (typeof window !== 'undefined' && window.plausible) {
    console.log('✅ Plausible script loaded successfully');
    return true;
  } else {
    console.warn('⚠️ Plausible script not detected');
    return false;
  }
}

export function trackAnalyticsDemo() {
  // Demonstrate various tracking capabilities
  analytics.userLogin();
  analytics.postCreate('demo');
  analytics.eventView();
  analytics.searchPerform('test query');
  
  console.log('📊 Analytics demo events sent');
}