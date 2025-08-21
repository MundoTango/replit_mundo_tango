import { apiRequest } from '@/lib/queryClient';

interface ActivityLog {
  type: 'feature_update' | 'bug_fix' | 'performance' | 'ui_enhancement' | 'framework_progress' | 'system_optimization';
  title: string;
  description: string;
  featureId?: string;
  team?: string[];
  frameworkLayers?: number[];
  impact?: 'Critical' | 'High' | 'Medium' | 'Low';
  metadata?: Record<string, any>;
  timestamp?: string;
  date?: string;
  time?: string;
}

class ActivityLoggingService {
  private static instance: ActivityLoggingService;
  private pendingActivities: ActivityLog[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  private constructor() {
    // Start auto-flush every 5 minutes
    this.flushInterval = setInterval(() => {
      this.flushPendingActivities();
    }, 5 * 60 * 1000);
  }

  static getInstance(): ActivityLoggingService {
    if (!ActivityLoggingService.instance) {
      ActivityLoggingService.instance = new ActivityLoggingService();
    }
    return ActivityLoggingService.instance;
  }

  // Get timezone offset for Buenos Aires
  private getBuenosAiresTime(): Date {
    const now = new Date();
    // Buenos Aires is UTC-3
    const buenosAiresOffset = -3 * 60; // -3 hours in minutes
    const localOffset = now.getTimezoneOffset();
    const offsetDiff = buenosAiresOffset - localOffset;
    
    return new Date(now.getTime() + offsetDiff * 60 * 1000);
  }

  async logActivity(activity: ActivityLog): Promise<void> {
    try {
      const timestamp = this.getBuenosAiresTime();
      
      const fullActivity = {
        ...activity,
        timestamp: timestamp.toISOString(),
        date: timestamp.toISOString().split('T')[0], // YYYY-MM-DD
        time: timestamp.toTimeString().split(' ')[0], // HH:MM:SS
      };

      // Add to pending queue
      this.pendingActivities.push(fullActivity);

      // If critical, flush immediately
      if (activity.impact === 'Critical') {
        await this.flushPendingActivities();
      }
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  async flushPendingActivities(): Promise<void> {
    if (this.pendingActivities.length === 0) return;

    const activitiesToFlush = [...this.pendingActivities];
    this.pendingActivities = [];

    try {
      for (const activity of activitiesToFlush) {
        await apiRequest('/api/daily-activities', 'POST', {
          date: activity.date,
          activity: activity.title,
          description: activity.description,
          type: activity.type,
          projectId: activity.featureId || 'life-ceo-system',
          projectName: activity.title,
          team: activity.team,
          frameworkLayers: activity.frameworkLayers,
          impact: activity.impact,
          metadata: activity.metadata,
          timestamp: activity.timestamp,
        });
      }
    } catch (error) {
      console.error('Failed to flush activities:', error);
      // Re-add failed activities to the queue
      this.pendingActivities = [...activitiesToFlush, ...this.pendingActivities];
    }
  }

  // Log feature update
  async logFeatureUpdate(
    featureId: string,
    title: string,
    description: string,
    completion?: number,
    team?: string[]
  ): Promise<void> {
    await this.logActivity({
      type: 'feature_update',
      title,
      description: `${description}${completion ? ` (${completion}% complete)` : ''}`,
      featureId,
      team,
      impact: completion === 100 ? 'High' : 'Medium',
      metadata: { completion },
    });
  }

  // Log bug fix
  async logBugFix(
    title: string,
    description: string,
    affectedComponents: string[],
    impact: 'Critical' | 'High' | 'Medium' | 'Low' = 'Medium'
  ): Promise<void> {
    await this.logActivity({
      type: 'bug_fix',
      title: `Bug Fix: ${title}`,
      description,
      impact,
      metadata: { affectedComponents },
    });
  }

  // Log UI enhancement
  async logUIEnhancement(
    component: string,
    description: string,
    team?: string[]
  ): Promise<void> {
    await this.logActivity({
      type: 'ui_enhancement',
      title: `UI: Enhanced ${component}`,
      description,
      team: team || ['Frontend'],
      impact: 'Medium',
    });
  }

  // Log framework progress
  async logFrameworkProgress(
    framework: '40L' | '40x20s',
    layer: number,
    description: string,
    phase?: number
  ): Promise<void> {
    await this.logActivity({
      type: 'framework_progress',
      title: `${framework} Progress: Layer ${layer}${phase ? ` Phase ${phase}` : ''}`,
      description,
      frameworkLayers: [layer],
      impact: 'High',
      metadata: { framework, layer, phase },
    });
  }

  // Log system optimization
  async logSystemOptimization(
    area: string,
    improvement: string,
    metrics?: Record<string, any>
  ): Promise<void> {
    await this.logActivity({
      type: 'system_optimization',
      title: `Optimization: ${area}`,
      description: improvement,
      impact: 'High',
      metadata: metrics,
    });
  }

  // Clean up on service destruction
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    // Flush any remaining activities
    this.flushPendingActivities();
  }
}

// Export singleton instance
export const activityLogger = ActivityLoggingService.getInstance();

// Auto-log current session
activityLogger.logBugFix(
  'Life CEO Command Center UI',
  'Fixed Active Projects display showing text instead of count, connected to real data sources',
  ['LifeCEOCommandCenter.tsx'],
  'High'
);

activityLogger.logSystemOptimization(
  'Work Capture System',
  'Implemented automatic activity logging with Buenos Aires timezone support',
  { 
    features: ['Auto-flush every 5 minutes', 'Critical items flush immediately', 'Timezone-aware timestamps'],
    completion: 100 
  }
);