import { db } from '../db.js';
import { dailyActivities } from '../../shared/schema.js';
import { comprehensiveProjectData } from '../../client/src/data/comprehensive-project-data.js';

interface ProjectUpdate {
  projectId: string;
  projectTitle: string;
  activityType: 'created' | 'updated' | 'completed';
  description: string;
  changes?: string;
  team?: string[];
  tags?: string[];
  completionBefore?: number;
  completionAfter?: number;
  metadata?: any;
}

class AutoActivityTracker {
  private static instance: AutoActivityTracker;
  private lastKnownState: Map<string, any> = new Map();

  private constructor() {
    this.initializeState();
  }

  static getInstance(): AutoActivityTracker {
    if (!AutoActivityTracker.instance) {
      AutoActivityTracker.instance = new AutoActivityTracker();
    }
    return AutoActivityTracker.instance;
  }

  private initializeState() {
    // Initialize with current project data
    this.traverseProjects(comprehensiveProjectData);
  }

  private traverseProjects(data: any, path: string = '') {
    if (data.id) {
      this.lastKnownState.set(data.id, {
        completion: data.completion,
        status: data.status,
        title: data.title,
        team: data.team,
        path
      });
    }

    if (data.children) {
      data.children.forEach((child: any) => {
        this.traverseProjects(child, path ? `${path}/${data.title}` : data.title);
      });
    }
  }

  async trackProjectUpdate(update: ProjectUpdate) {
    try {
      // Log the activity
      await db.insert(dailyActivities).values({
        user_id: 7, // Scott Boddye
        project_id: update.projectId,
        project_title: update.projectTitle,
        activity_type: update.activityType,
        description: update.description,
        changes: update.changes,
        team: update.team || [],
        tags: update.tags || [],
        completion_before: update.completionBefore,
        completion_after: update.completionAfter,
        timestamp: new Date(),
        metadata: {
          ...update.metadata,
          source: 'automatic_tracking',
          framework: '35L'
        }
      });

      console.log(`✅ Auto-tracked activity: ${update.projectTitle} - ${update.activityType}`);
    } catch (error) {
      console.error('❌ Failed to auto-track activity:', error);
    }
  }

  async detectChanges(newData: any) {
    const changes: ProjectUpdate[] = [];
    this.detectChangesRecursive(newData, changes);

    // Process all detected changes
    for (const change of changes) {
      await this.trackProjectUpdate(change);
    }

    // Update state for next comparison
    this.lastKnownState.clear();
    this.traverseProjects(newData);
  }

  private detectChangesRecursive(data: any, changes: ProjectUpdate[], path: string = '') {
    if (data.id) {
      const lastState = this.lastKnownState.get(data.id);
      
      if (!lastState) {
        // New project
        changes.push({
          projectId: data.id,
          projectTitle: data.title,
          activityType: 'created',
          description: `New ${data.type}: ${data.description}`,
          team: data.team,
          tags: [data.type?.toLowerCase()],
          completionAfter: data.completion
        });
      } else {
        // Check for updates
        const hasChanges = 
          lastState.completion !== data.completion ||
          lastState.status !== data.status;

        if (hasChanges) {
          const activityType = data.completion === 100 && lastState.completion < 100 
            ? 'completed' 
            : 'updated';

          changes.push({
            projectId: data.id,
            projectTitle: data.title,
            activityType,
            description: this.generateChangeDescription(lastState, data),
            changes: this.generateChangeSummary(lastState, data),
            team: data.team,
            tags: [data.type?.toLowerCase()],
            completionBefore: lastState.completion,
            completionAfter: data.completion
          });
        }
      }
    }

    if (data.children) {
      data.children.forEach((child: any) => {
        this.detectChangesRecursive(child, changes, path ? `${path}/${data.title}` : data.title);
      });
    }
  }

  private generateChangeDescription(oldState: any, newState: any): string {
    const changes = [];
    
    if (oldState.completion !== newState.completion) {
      changes.push(`Progress: ${oldState.completion}% → ${newState.completion}%`);
    }
    
    if (oldState.status !== newState.status) {
      changes.push(`Status: ${oldState.status} → ${newState.status}`);
    }

    return changes.join(', ') || 'Updated project details';
  }

  private generateChangeSummary(oldState: any, newState: any): string {
    const summary = {
      completion: {
        from: oldState.completion,
        to: newState.completion
      },
      status: {
        from: oldState.status,
        to: newState.status
      }
    };

    return JSON.stringify(summary);
  }
}

export const autoActivityTracker = AutoActivityTracker.getInstance();