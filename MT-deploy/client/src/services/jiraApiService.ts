import { apiRequest } from '@/lib/queryClient';

export interface JiraCredentials {
  instanceUrl: string;
  email: string;
  apiToken: string;
  projectKey: string;
}

export interface JiraIssue {
  fields: {
    summary: string;
    description: string;
    issuetype: { name: string };
    project: { key: string };
    priority?: { name: string };
    labels?: string[];
    customfield_10001?: string; // Epic link
    parent?: { key: string };
    customfield_10026?: number; // Story points
    components?: { name: string }[];
  };
}

export interface JiraCreateResult {
  id: string;
  key: string;
  self: string;
}

export interface JiraBulkCreateResult {
  issues: JiraCreateResult[];
  errors: any[];
}

class JiraApiService {
  private credentials: JiraCredentials | null = null;

  setCredentials(credentials: JiraCredentials) {
    this.credentials = credentials;
  }

  getCredentials(): JiraCredentials | null {
    return this.credentials;
  }

  private getAuthHeader(): string {
    if (!this.credentials) {
      throw new Error('JIRA credentials not set');
    }
    const auth = btoa(`${this.credentials.email}:${this.credentials.apiToken}`);
    return `Basic ${auth}`;
  }

  async testConnection(): Promise<{ success: boolean; message: string; project?: any }> {
    if (!this.credentials) {
      return { success: false, message: 'No credentials provided' };
    }

    try {
      const response = await fetch(`${this.credentials.instanceUrl}/rest/api/3/project/${this.credentials.projectKey}`, {
        headers: {
          'Authorization': this.getAuthHeader(),
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const project = await response.json();
        return { 
          success: true, 
          message: `Connected to project: ${project.name}`,
          project 
        };
      } else {
        const error = await response.text();
        return { 
          success: false, 
          message: `Failed to connect: ${response.status} - ${error}` 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  async createIssue(issue: JiraIssue): Promise<JiraCreateResult> {
    if (!this.credentials) {
      throw new Error('JIRA credentials not set');
    }

    const response = await fetch(`${this.credentials.instanceUrl}/rest/api/3/issue`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(issue)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create issue: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async createBulkIssues(issues: JiraIssue[]): Promise<JiraBulkCreateResult> {
    if (!this.credentials) {
      throw new Error('JIRA credentials not set');
    }

    const response = await fetch(`${this.credentials.instanceUrl}/rest/api/3/issue/bulk`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ issueUpdates: issues })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create bulk issues: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async getIssueTypes(): Promise<any[]> {
    if (!this.credentials) {
      throw new Error('JIRA credentials not set');
    }

    const response = await fetch(
      `${this.credentials.instanceUrl}/rest/api/3/issuetype/project?projectId=${this.credentials.projectKey}`,
      {
        headers: {
          'Authorization': this.getAuthHeader(),
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch issue types');
    }

    return response.json();
  }

  async getCustomFields(): Promise<any[]> {
    if (!this.credentials) {
      throw new Error('JIRA credentials not set');
    }

    const response = await fetch(`${this.credentials.instanceUrl}/rest/api/3/field`, {
      headers: {
        'Authorization': this.getAuthHeader(),
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch custom fields');
    }

    const fields = await response.json();
    return fields.filter((field: any) => field.custom);
  }

  convertExportToJiraIssues(exportData: any): JiraIssue[] {
    if (!this.credentials) {
      throw new Error('JIRA credentials not set');
    }

    const issues: JiraIssue[] = [];
    
    // Create epics first
    exportData.epics.forEach((epic: any) => {
      issues.push({
        fields: {
          summary: epic.summary,
          description: epic.description,
          issuetype: { name: 'Epic' },
          project: { key: this.credentials!.projectKey },
          priority: { name: epic.priority },
          labels: epic.labels,
          components: epic.components?.map((c: string) => ({ name: c }))
        }
      });
    });

    // Then stories
    exportData.stories.forEach((story: any) => {
      issues.push({
        fields: {
          summary: story.summary,
          description: story.description,
          issuetype: { name: 'Story' },
          project: { key: this.credentials!.projectKey },
          priority: { name: story.priority },
          labels: story.labels,
          customfield_10001: story.epicLink, // Epic link
          customfield_10026: story.storyPoints,
          components: story.components?.map((c: string) => ({ name: c }))
        }
      });
    });

    // Then tasks
    exportData.tasks.forEach((task: any) => {
      issues.push({
        fields: {
          summary: task.summary,
          description: task.description,
          issuetype: { name: 'Task' },
          project: { key: this.credentials!.projectKey },
          priority: { name: task.priority },
          labels: task.labels,
          parent: task.parentKey ? { key: task.parentKey } : undefined,
          components: task.components?.map((c: string) => ({ name: c }))
        }
      });
    });

    // Finally sub-tasks
    exportData.subTasks.forEach((subTask: any) => {
      issues.push({
        fields: {
          summary: subTask.summary,
          description: subTask.description,
          issuetype: { name: 'Sub-task' },
          project: { key: this.credentials!.projectKey },
          priority: { name: subTask.priority },
          labels: subTask.labels,
          parent: { key: subTask.parentKey },
          components: subTask.components?.map((c: string) => ({ name: c }))
        }
      });
    });

    return issues;
  }
}

export const jiraApiService = new JiraApiService();