/**
 * Analytics & Insights Framework
 * Phase 10: Analytics & Insights (35L Framework Layers 11, 13, 35)
 */

interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}

interface UserBehavior {
  sessionId: string;
  userId?: number;
  startTime: number;
  events: AnalyticsEvent[];
  pageViews: string[];
}

// Analytics service for tracking user behavior
class AnalyticsService {
  private currentSession: UserBehavior | null = null;
  private eventQueue: AnalyticsEvent[] = [];
  private flushInterval: number = 30000; // 30 seconds
  private flushTimer: NodeJS.Timeout | null = null;
  
  constructor() {
    this.initSession();
    this.startFlushTimer();
  }
  
  private initSession() {
    this.currentSession = {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      events: [],
      pageViews: []
    };
  }
  
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private startFlushTimer() {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }
  
  // Track custom events
  track(event: AnalyticsEvent) {
    if (!this.currentSession) return;
    
    const enrichedEvent = {
      ...event,
      timestamp: Date.now(),
      sessionId: this.currentSession.sessionId
    };
    
    this.eventQueue.push(enrichedEvent);
    this.currentSession.events.push(enrichedEvent);
    
    // Flush if queue is getting large
    if (this.eventQueue.length >= 50) {
      this.flush();
    }
  }
  
  // Track page views
  trackPageView(path: string, title?: string) {
    if (!this.currentSession) return;
    
    this.currentSession.pageViews.push(path);
    
    this.track({
      category: 'Navigation',
      action: 'Page View',
      label: path,
      metadata: { title }
    });
  }
  
  // Track user interactions
  trackInteraction(element: string, action: string, value?: any) {
    this.track({
      category: 'UI Interaction',
      action,
      label: element,
      value,
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  }
  
  // Track performance metrics
  trackPerformance(metric: string, value: number, metadata?: any) {
    this.track({
      category: 'Performance',
      action: metric,
      value,
      metadata
    });
  }
  
  // Track errors
  trackError(error: Error, context?: any) {
    this.track({
      category: 'Error',
      action: error.name,
      label: error.message,
      metadata: {
        stack: error.stack,
        context
      }
    });
  }
  
  // Flush events to backend
  private async flush() {
    if (this.eventQueue.length === 0) return;
    
    const events = [...this.eventQueue];
    this.eventQueue = [];
    
    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events })
      });
    } catch (error) {
      // Re-queue events on failure
      this.eventQueue.unshift(...events);
    }
  }
  
  // Clean up
  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

export const analytics = new AnalyticsService();

// Profile-specific analytics
export const profileAnalytics = {
  // Track profile view
  viewProfile(username: string, isOwnProfile: boolean) {
    analytics.track({
      category: 'Profile',
      action: 'View',
      label: isOwnProfile ? 'Own' : 'Other',
      metadata: { username }
    });
  },
  
  // Track photo upload
  uploadPhoto(type: 'profile' | 'cover', size: number, duration: number) {
    analytics.track({
      category: 'Profile',
      action: 'Photo Upload',
      label: type,
      value: size,
      metadata: { duration }
    });
  },
  
  // Track travel detail actions
  travelDetail(action: 'create' | 'edit' | 'delete', eventType?: string) {
    analytics.track({
      category: 'Travel',
      action: `Detail ${action}`,
      label: eventType,
      metadata: { timestamp: new Date().toISOString() }
    });
  },
  
  // Track memory post creation
  createMemory(wordCount: number, hasMedia: boolean, hasLocation: boolean) {
    analytics.track({
      category: 'Memory',
      action: 'Create',
      value: wordCount,
      metadata: { hasMedia, hasLocation }
    });
  },
  
  // Track autocomplete usage
  useAutocomplete(type: 'event' | 'city', resultsCount: number, selected: boolean) {
    analytics.track({
      category: 'Autocomplete',
      action: 'Search',
      label: type,
      value: resultsCount,
      metadata: { selected }
    });
  }
};

// Performance monitoring
export const performanceMonitor = {
  // Measure component render time
  measureRender(componentName: string, startTime: number) {
    const duration = performance.now() - startTime;
    analytics.trackPerformance('Component Render', duration, {
      component: componentName
    });
  },
  
  // Measure API call duration
  measureApiCall(endpoint: string, startTime: number, success: boolean) {
    const duration = performance.now() - startTime;
    analytics.trackPerformance('API Call', duration, {
      endpoint,
      success
    });
  },
  
  // Measure image load time
  measureImageLoad(src: string, startTime: number) {
    const duration = performance.now() - startTime;
    analytics.trackPerformance('Image Load', duration, {
      src,
      size: src.length
    });
  }
};

// A/B Testing framework
export class ABTest {
  private variants: Record<string, any> = {};
  
  constructor(private testName: string, private userId?: number) {
    this.loadVariants();
  }
  
  private loadVariants() {
    const stored = localStorage.getItem(`ab_test_${this.testName}`);
    if (stored) {
      this.variants = JSON.parse(stored);
    }
  }
  
  private saveVariants() {
    localStorage.setItem(`ab_test_${this.testName}`, JSON.stringify(this.variants));
  }
  
  getVariant(experimentId: string, options: string[]): string {
    if (this.variants[experimentId]) {
      return this.variants[experimentId];
    }
    
    // Assign variant based on user ID or random
    const index = this.userId 
      ? this.userId % options.length
      : Math.floor(Math.random() * options.length);
    
    const variant = options[index];
    this.variants[experimentId] = variant;
    this.saveVariants();
    
    // Track assignment
    analytics.track({
      category: 'AB Test',
      action: 'Assignment',
      label: experimentId,
      metadata: { variant, testName: this.testName }
    });
    
    return variant;
  }
  
  trackConversion(experimentId: string, value?: number) {
    const variant = this.variants[experimentId];
    if (!variant) return;
    
    analytics.track({
      category: 'AB Test',
      action: 'Conversion',
      label: experimentId,
      value,
      metadata: { variant, testName: this.testName }
    });
  }
}

// Business metrics tracking
export const businessMetrics = {
  // Track user engagement
  engagement: {
    postCreated: () => analytics.track({
      category: 'Engagement',
      action: 'Post Created'
    }),
    
    postLiked: () => analytics.track({
      category: 'Engagement',
      action: 'Post Liked'
    }),
    
    commentAdded: () => analytics.track({
      category: 'Engagement',
      action: 'Comment Added'
    }),
    
    userFollowed: () => analytics.track({
      category: 'Engagement',
      action: 'User Followed'
    })
  },
  
  // Track retention metrics
  retention: {
    dailyActive: () => analytics.track({
      category: 'Retention',
      action: 'Daily Active User'
    }),
    
    weeklyActive: () => analytics.track({
      category: 'Retention',
      action: 'Weekly Active User'
    }),
    
    sessionDuration: (duration: number) => analytics.track({
      category: 'Retention',
      action: 'Session Duration',
      value: duration
    })
  }
};