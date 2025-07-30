// Life CEO: Feature Flags System
import { lifeCeoMetrics } from './prometheus-metrics.js';

// Feature flag definitions
export interface FeatureFlag {
  key: string;
  description: string;
  enabled: boolean;
  rolloutPercentage?: number;
  userGroups?: string[];
  startDate?: Date;
  endDate?: Date;
  dependencies?: string[];
}

// Feature flags storage (in production, use a service like LaunchDarkly or Unleash)
const featureFlags: Map<string, FeatureFlag> = new Map([
  ['life-ceo-performance', {
    key: 'life-ceo-performance',
    description: 'Life CEO performance optimization features',
    enabled: true,
    rolloutPercentage: 100,
  }],
  ['predictive-caching', {
    key: 'predictive-caching',
    description: 'AI-powered predictive content caching',
    enabled: true,
    rolloutPercentage: 80,
  }],
  ['smart-resource-loading', {
    key: 'smart-resource-loading',
    description: 'Intelligent resource prioritization',
    enabled: true,
    rolloutPercentage: 100,
  }],
  ['elasticsearch-search', {
    key: 'elasticsearch-search',
    description: 'Full-text search with Elasticsearch',
    enabled: false,
    rolloutPercentage: 0,
  }],
  ['bullmq-jobs', {
    key: 'bullmq-jobs',
    description: 'Background job processing with BullMQ',
    enabled: false,
    rolloutPercentage: 0,
  }],
  ['advanced-monitoring', {
    key: 'advanced-monitoring',
    description: 'Prometheus metrics and Grafana dashboards',
    enabled: true,
    rolloutPercentage: 100,
  }],
  ['cdn-optimization', {
    key: 'cdn-optimization',
    description: 'CDN and edge caching',
    enabled: true,
    rolloutPercentage: 100,
  }],
  ['a-b-testing', {
    key: 'a-b-testing',
    description: 'A/B testing framework',
    enabled: false,
    rolloutPercentage: 0,
    userGroups: ['beta'],
  }],
  ['virtual-scrolling', {
    key: 'virtual-scrolling',
    description: 'Virtual scrolling for long lists',
    enabled: true,
    rolloutPercentage: 100,
  }],
  
  // Subscription Feature Flags
  ['subscription-free-tier', {
    key: 'subscription-free-tier',
    description: 'Free tier with basic features',
    enabled: true,
    rolloutPercentage: 100,
  }],
  ['subscription-basic-tier', {
    key: 'subscription-basic-tier', 
    description: 'Basic paid tier at $5/month',
    enabled: true,
    rolloutPercentage: 100,
  }],
  ['subscription-enthusiast-tier', {
    key: 'subscription-enthusiast-tier',
    description: 'Enthusiast tier at $9.99/month (future)',
    enabled: false,
    rolloutPercentage: 0,
  }],
  ['subscription-professional-tier', {
    key: 'subscription-professional-tier',
    description: 'Professional tier at $24.99/month (future)',
    enabled: false,
    rolloutPercentage: 0,
  }],
  ['subscription-enterprise-tier', {
    key: 'subscription-enterprise-tier',
    description: 'Enterprise tier at $99.99/month (future)',
    enabled: false,
    rolloutPercentage: 0,
  }],
  ['subscription-teacher-special', {
    key: 'subscription-teacher-special',
    description: 'Special pricing for dance teachers',
    enabled: false,
    rolloutPercentage: 0,
    userGroups: ['teacher'],
  }],
  ['subscription-organizer-special', {
    key: 'subscription-organizer-special',
    description: 'Special pricing for event organizers',
    enabled: false,
    rolloutPercentage: 0,
    userGroups: ['organizer'],
  }],
  ['subscription-dj-special', {
    key: 'subscription-dj-special',
    description: 'Special pricing for tango DJs',
    enabled: false,
    rolloutPercentage: 0,
    userGroups: ['dj'],
  }],
  ['subscription-trial-period', {
    key: 'subscription-trial-period',
    description: '7-day free trial for paid tiers',
    enabled: true,
    rolloutPercentage: 100,
  }],
  ['websocket-scaling', {
    key: 'websocket-scaling',
    description: 'Horizontal WebSocket scaling',
    enabled: false,
    rolloutPercentage: 0,
  }],
]);

// Check if a feature is enabled for a user
export const isFeatureEnabled = (
  featureKey: string,
  userId?: number,
  userGroups?: string[]
): boolean => {
  const flag = featureFlags.get(featureKey);
  
  if (!flag || !flag.enabled) {
    return false;
  }
  
  // Check date constraints
  const now = new Date();
  if (flag.startDate && now < flag.startDate) {
    return false;
  }
  if (flag.endDate && now > flag.endDate) {
    return false;
  }
  
  // Check user groups
  if (flag.userGroups && flag.userGroups.length > 0) {
    if (!userGroups || !flag.userGroups.some(group => userGroups.includes(group))) {
      return false;
    }
  }
  
  // Check rollout percentage
  if (flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100) {
    const userHash = userId ? hashUserId(userId) : Math.random() * 100;
    if (userHash > flag.rolloutPercentage) {
      return false;
    }
  }
  
  // Check dependencies
  if (flag.dependencies) {
    for (const dep of flag.dependencies) {
      if (!isFeatureEnabled(dep, userId, userGroups)) {
        return false;
      }
    }
  }
  
  // Track feature usage
  lifeCeoMetrics.performanceOptimizations.inc({ 
    optimization_type: `feature_${featureKey}` 
  });
  
  return true;
};

// Hash user ID to consistent percentage
const hashUserId = (userId: number): number => {
  let hash = 0;
  const str = userId.toString();
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % 100;
};

// Get all feature flags
export const getAllFeatureFlags = (): FeatureFlag[] => {
  return Array.from(featureFlags.values());
};

// Update feature flag
export const updateFeatureFlag = (
  featureKey: string,
  updates: Partial<FeatureFlag>
): boolean => {
  const flag = featureFlags.get(featureKey);
  if (!flag) {
    return false;
  }
  
  featureFlags.set(featureKey, { ...flag, ...updates });
  
  console.log(`🚩 Life CEO: Feature flag '${featureKey}' updated`);
  return true;
};

// Create new feature flag
export const createFeatureFlag = (flag: FeatureFlag): boolean => {
  if (featureFlags.has(flag.key)) {
    return false;
  }
  
  featureFlags.set(flag.key, flag);
  console.log(`🚩 Life CEO: Feature flag '${flag.key}' created`);
  return true;
};

// Feature flag middleware
export const featureFlagMiddleware = (featureKey: string) => {
  return (req: any, res: any, next: any) => {
    const userId = req.user?.id;
    const userGroups = req.user?.groups || [];
    
    if (isFeatureEnabled(featureKey, userId, userGroups)) {
      next();
    } else {
      res.status(403).json({
        error: 'Feature not available',
        feature: featureKey,
      });
    }
  };
};

// Client-side feature flags endpoint
export const getClientFeatureFlags = (userId?: number, userGroups?: string[]) => {
  const clientFlags: Record<string, boolean> = {};
  
  for (const [key, flag] of featureFlags) {
    // Only send flags that don't contain sensitive info
    if (!flag.description.toLowerCase().includes('internal')) {
      clientFlags[key] = isFeatureEnabled(key, userId, userGroups);
    }
  }
  
  return clientFlags;
};

// Initialize feature flags
export const initializeFeatureFlags = async () => {
  console.log('🚩 Life CEO: Initializing feature flags...');
  // Feature flags are already initialized on import
  return true;
};

console.log('🚩 Life CEO: Feature flags system initialized');