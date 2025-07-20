import * as fs from 'fs';
import * as path from 'path';
import { db } from '../server/db.js';
import { dailyActivities } from '../shared/schema.js';

const PROJECT_DATA_PATH = path.join(process.cwd(), 'client/src/data/comprehensive-project-data.ts');

interface ProjectSnapshot {
  [key: string]: {
    completion: number;
    status: string;
    title: string;
    team?: string[];
  };
}

class ProjectDataWatcher {
  private lastSnapshot: ProjectSnapshot = {};
  private watchInterval: NodeJS.Timeout | null = null;

  async start() {
    console.log('🔍 Starting project data watcher...');
    
    // Take initial snapshot
    await this.takeSnapshot();
    
    // Watch for changes every 5 minutes
    this.watchInterval = setInterval(async () => {
      await this.checkForChanges();
    }, 5 * 60 * 1000);

    // Also watch file changes
    fs.watchFile(PROJECT_DATA_PATH, async (curr, prev) => {
      if (curr.mtime !== prev.mtime) {
        console.log('📝 Project data file changed, checking for updates...');
        await this.checkForChanges();
      }
    });
  }

  stop() {
    if (this.watchInterval) {
      clearInterval(this.watchInterval);
      fs.unwatchFile(PROJECT_DATA_PATH);
      console.log('🛑 Project data watcher stopped');
    }
  }

  private async takeSnapshot(): Promise<ProjectSnapshot> {
    try {
      // Dynamically import to get fresh data
      delete require.cache[require.resolve(PROJECT_DATA_PATH)];
      const module = await import(PROJECT_DATA_PATH);
      const projectData = module.comprehensiveProjectData;

      const snapshot: ProjectSnapshot = {};
      this.extractProjects(projectData, snapshot);
      
      return snapshot;
    } catch (error) {
      console.error('❌ Failed to take snapshot:', error);
      return {};
    }
  }

  private extractProjects(data: any, snapshot: ProjectSnapshot, path: string = '') {
    if (data.id) {
      snapshot[data.id] = {
        completion: data.completion || 0,
        status: data.status || 'Unknown',
        title: data.title || 'Untitled',
        team: data.team || []
      };
    }

    if (data.children && Array.isArray(data.children)) {
      data.children.forEach((child: any) => {
        this.extractProjects(child, snapshot, path ? `${path}/${data.title}` : data.title);
      });
    }
  }

  private async checkForChanges() {
    const newSnapshot = await this.takeSnapshot();
    const changes: any[] = [];

    // Compare snapshots
    for (const [projectId, newData] of Object.entries(newSnapshot)) {
      const oldData = this.lastSnapshot[projectId];

      if (!oldData) {
        // New project created
        changes.push({
          projectId,
          projectTitle: newData.title,
          activityType: 'created',
          description: `New project: ${newData.title}`,
          completionAfter: newData.completion,
          team: newData.team
        });
      } else if (
        oldData.completion !== newData.completion ||
        oldData.status !== newData.status
      ) {
        // Project updated
        const activityType = newData.completion === 100 && oldData.completion < 100 
          ? 'completed' 
          : 'updated';

        changes.push({
          projectId,
          projectTitle: newData.title,
          activityType,
          description: this.generateDescription(oldData, newData),
          completionBefore: oldData.completion,
          completionAfter: newData.completion,
          team: newData.team,
          changes: JSON.stringify({
            status: { from: oldData.status, to: newData.status },
            completion: { from: oldData.completion, to: newData.completion }
          })
        });
      }
    }

    // Log all changes
    if (changes.length > 0) {
      console.log(`📊 Detected ${changes.length} project changes`);
      
      for (const change of changes) {
        try {
          await db.insert(dailyActivities).values({
            user_id: 7, // Scott Boddye
            project_id: change.projectId,
            project_title: change.projectTitle,
            activity_type: change.activityType as any,
            description: change.description,
            changes: change.changes,
            team: change.team || [],
            tags: ['auto-tracked', '35L'],
            completion_before: change.completionBefore,
            completion_after: change.completionAfter,
            timestamp: new Date(),
            metadata: {
              source: 'file_watcher',
              framework: '35L',
              capturedDate: new Date().toISOString()
            }
          });
          
          console.log(`✅ Logged: ${change.projectTitle} - ${change.activityType}`);
        } catch (error) {
          console.error(`❌ Failed to log activity for ${change.projectTitle}:`, error);
        }
      }
    }

    // Update snapshot
    this.lastSnapshot = newSnapshot;
  }

  private generateDescription(oldData: any, newData: any): string {
    const parts = [];

    if (oldData.completion !== newData.completion) {
      parts.push(`Progress: ${oldData.completion}% → ${newData.completion}%`);
    }

    if (oldData.status !== newData.status) {
      parts.push(`Status: ${oldData.status} → ${newData.status}`);
    }

    return parts.join(', ') || 'Project updated';
  }
}

// Create a default instance for server import
const defaultWatcher = new ProjectDataWatcher();

export { ProjectDataWatcher, defaultWatcher };