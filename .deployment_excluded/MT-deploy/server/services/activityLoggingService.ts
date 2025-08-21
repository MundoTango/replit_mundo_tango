// Activity Logging Service - Automatically tracks all project work
import { db } from '../db';
import { dailyActivities } from '../../shared/schema';
import type { InsertDailyActivity } from '../../shared/schema';

export class ActivityLoggingService {
  // Log when a feature is implemented
  static async logFeatureImplementation(
    userId: number,
    projectId: string,
    projectTitle: string,
    description: string,
    changes: string[],
    team: string[] = [],
    completionBefore: number = 0,
    completionAfter: number = 0
  ) {
    const activity: InsertDailyActivity = {
      user_id: userId,
      project_id: projectId,
      project_title: projectTitle,
      activity_type: 'updated',
      description,
      changes,
      team,
      completion_before: completionBefore,
      completion_after: completionAfter,
      metadata: {
        source: 'automatic',
        framework: '30L',
        timestamp: new Date().toISOString()
      }
    };

    return await db.insert(dailyActivities).values(activity).returning();
  }

  // Log when a project is completed
  static async logProjectCompletion(
    userId: number,
    projectId: string,
    projectTitle: string,
    description: string,
    team: string[] = []
  ) {
    const activity: InsertDailyActivity = {
      user_id: userId,
      project_id: projectId,
      project_title: projectTitle,
      activity_type: 'completed',
      description,
      changes: [`Marked as 100% complete`],
      team,
      completion_before: 90,
      completion_after: 100,
      metadata: {
        source: 'automatic',
        framework: '30L',
        completedAt: new Date().toISOString()
      }
    };

    return await db.insert(dailyActivities).values(activity).returning();
  }

  // Log when a new feature is created
  static async logFeatureCreation(
    userId: number,
    projectId: string,
    projectTitle: string,
    description: string,
    team: string[] = []
  ) {
    const activity: InsertDailyActivity = {
      user_id: userId,
      project_id: projectId,
      project_title: projectTitle,
      activity_type: 'created',
      description,
      changes: [],
      team,
      completion_before: 0,
      completion_after: 0,
      metadata: {
        source: 'automatic',
        framework: '30L',
        createdAt: new Date().toISOString()
      }
    };

    return await db.insert(dailyActivities).values(activity).returning();
  }

  // Log recent work from the past 2 weeks
  static async logRecentWork() {
    const userId = 7; // Scott Boddye
    
    // Yesterday's work (January 16, 2025)
    const yesterday = new Date('2025-01-16T10:00:00Z');
    
    const recentActivities: InsertDailyActivity[] = [
      {
        user_id: userId,
        project_id: 'onboarding-automation',
        project_title: 'Guest Onboarding System',
        activity_type: 'completed',
        description: 'Achieved 100% production readiness for all onboarding automations',
        changes: [
          'Fixed city group auto-assignment with 157,251 cities validation',
          'Implemented professional group mapping for all 23 roles',
          'Added transaction rollback mechanisms',
          'Created friend suggestion algorithm with multi-factor scoring',
          'Built role-based content personalization system',
          'Added smart notification preferences by role'
        ],
        team: ['Backend', 'Frontend'],
        completion_before: 78,
        completion_after: 100,
        timestamp: yesterday,
        metadata: {
          framework: '30L',
          layers: [1, 5, 6, 7, 9, 21, 22, 23],
          production: true
        }
      },
      {
        user_id: userId,
        project_id: 'friend-suggestions',
        project_title: 'Friend Suggestion System',
        activity_type: 'created',
        description: 'Built comprehensive multi-factor friend matching algorithm',
        changes: [
          'Same city: 40 points scoring',
          'Mutual friends: up to 30 points',
          'Common groups: up to 20 points',
          'Similar roles: up to 10 points',
          'Created /api/friends/suggestions endpoint'
        ],
        team: ['Backend'],
        completion_before: 0,
        completion_after: 100,
        timestamp: new Date('2025-01-16T14:00:00Z'),
        metadata: {
          framework: '30L',
          api: true
        }
      },
      {
        user_id: userId,
        project_id: 'project-tracker-update',
        project_title: '30L Project Tracker System',
        activity_type: 'updated',
        description: 'Updated project tracker from 11L to 30L with dynamic layer counting',
        changes: [
          'Changed title from "11L" to "30L Project Tracker System"',
          'Made layer count dynamic for future updates',
          'Added FRAMEWORK_LAYERS constant',
          'Created documentation for future layer additions'
        ],
        team: ['Frontend'],
        completion_before: 95,
        completion_after: 100,
        timestamp: new Date('2025-01-17T11:00:00Z'),
        metadata: {
          framework: '30L',
          dynamicUpdate: true
        }
      }
    ];

    // Insert all activities
    for (const activity of recentActivities) {
      await db.insert(dailyActivities).values(activity);
    }

    console.log(`✅ Logged ${recentActivities.length} recent activities`);
  }
}