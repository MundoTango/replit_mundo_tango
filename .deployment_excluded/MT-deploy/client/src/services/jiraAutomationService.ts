// Life CEO 40x20s JIRA Automation Service
// Automated configuration and creation of JIRA issues

import { jiraApiService } from './jiraApiService';
import { comprehensiveProjectData } from '../data/comprehensive-project-data';

export class JiraAutomationService {
  private credentials = {
    instanceUrl: 'https://mundotango-team.atlassian.net',
    email: 'admin@mundotango.life',
    apiToken: 'ATATT3xFfGF0Nb_1iigWiEviNSi-kFvP965nAMjH9z8Vs9nGCu87drxemBvCdolRWcSuyDezhWll2jYjakMNp3k60H5J_eR_4uzXIb4ElbG04zEpMc2v1H7-ng_3huq3Ao41EE9VMVHWLKDFKY59whw24pQjc9Xr43lpoKTG2YLknL0o_iRHvQ8=517ED328',
    projectKey: 'KAN'
  };

  private generateJiraExportData() {
    const epics: any[] = [];
    const stories: any[] = [];
    const tasks: any[] = [];
    const subTasks: any[] = [];
    
    const processItem = (item: any, parentKey?: string) => {
      const priority = item.priority || 'Medium';
      const labels = ['40x20s', `Layer-${item.layer || 1}`, `Phase-${item.phase || 1}`];
      
      if (item.type === 'Platform' || item.type === 'Section') {
        epics.push({
          summary: item.title,
          description: item.description || '',
          priority,
          labels,
          key: `MT-EPIC-${epics.length + 1}`
        });
      } else if (item.type === 'Feature' || item.type === 'Project') {
        stories.push({
          summary: item.title,
          description: item.description || '',
          priority,
          labels,
          epicLink: parentKey,
          storyPoints: Math.ceil((item.actualHours || 40) / 8)
        });
      } else if (item.type === 'Task') {
        tasks.push({
          summary: item.title,
          description: item.description || '',
          priority,
          labels,
          parentKey
        });
      }
      
      if (item.children) {
        item.children.forEach((child: any) => 
          processItem(child, `MT-${item.type.toUpperCase()}-${epics.length || stories.length || tasks.length}`)
        );
      }
    };
    
    comprehensiveProjectData.forEach(item => processItem(item));
    
    return { epics, stories, tasks, subTasks };
  }

  async configureAndCreateIssues() {
    console.log('🚀 Life CEO 40x20s: Starting automated JIRA creation process...');
    
    // Step 1: Configure credentials
    console.log('🔧 Configuring JIRA credentials...');
    jiraApiService.setCredentials(this.credentials);
    
    // Step 2: Test connection
    console.log('🔍 Testing JIRA connection...');
    try {
      const connectionTest = await jiraApiService.testConnection();
      if (!connectionTest) {
        throw new Error('Failed to connect to JIRA');
      }
      console.log('✅ JIRA connection successful!');
    } catch (error) {
      console.error('❌ JIRA connection failed:', error);
      return { success: false, error: error.message };
    }

    // Step 3: Generate export data
    console.log('📊 Generating 40x20s framework data...');
    const exportData = this.generateJiraExportData();
    const totalItems = 
      exportData.epics.length + 
      exportData.stories.length + 
      exportData.tasks.length + 
      exportData.subTasks.length;
    
    console.log(`📋 Total items to create: ${totalItems}`);
    console.log(`  - Epics: ${exportData.epics.length}`);
    console.log(`  - Stories: ${exportData.stories.length}`);
    console.log(`  - Tasks: ${exportData.tasks.length}`);
    console.log(`  - Sub-tasks: ${exportData.subTasks.length}`);

    let createdCount = 0;
    const results = {
      epics: [],
      stories: [],
      tasks: [],
      subTasks: [],
      errors: []
    };

    // Step 4: Create epics
    console.log('\n🏛️ Creating epics...');
    for (const epic of exportData.epics) {
      try {
        const result = await jiraApiService.createIssue({
          fields: {
            summary: epic.summary,
            description: epic.description,
            issuetype: { name: 'Epic' },
            project: { key: this.credentials.projectKey },
            priority: { name: epic.priority },
            labels: epic.labels
          }
        });
        results.epics.push(result);
        createdCount++;
        console.log(`✅ Created epic ${createdCount}/${totalItems}: ${epic.summary}`);
      } catch (error) {
        console.error(`❌ Failed to create epic: ${epic.summary}`, error);
        results.errors.push({ type: 'epic', item: epic, error: error.message });
      }
    }

    // Step 5: Create stories
    console.log('\n📖 Creating stories...');
    for (const story of exportData.stories) {
      try {
        const result = await jiraApiService.createIssue({
          fields: {
            summary: story.summary,
            description: story.description,
            issuetype: { name: 'Story' },
            project: { key: this.credentials.projectKey },
            priority: { name: story.priority },
            labels: story.labels
          }
        });
        results.stories.push(result);
        createdCount++;
        console.log(`✅ Created story ${createdCount}/${totalItems}: ${story.summary}`);
      } catch (error) {
        console.error(`❌ Failed to create story: ${story.summary}`, error);
        results.errors.push({ type: 'story', item: story, error: error.message });
      }
    }

    // Step 6: Create tasks
    console.log('\n📋 Creating tasks...');
    for (const task of exportData.tasks) {
      try {
        const result = await jiraApiService.createIssue({
          fields: {
            summary: task.summary,
            description: task.description,
            issuetype: { name: 'Task' },
            project: { key: this.credentials.projectKey },
            priority: { name: task.priority },
            labels: task.labels
          }
        });
        results.tasks.push(result);
        createdCount++;
        console.log(`✅ Created task ${createdCount}/${totalItems}: ${task.summary}`);
      } catch (error) {
        console.error(`❌ Failed to create task: ${task.summary}`, error);
        results.errors.push({ type: 'task', item: task, error: error.message });
      }
    }

    // Final report
    console.log('\n📊 40x20s JIRA Creation Summary:');
    console.log(`✅ Successfully created: ${createdCount} items`);
    console.log(`❌ Failed: ${results.errors.length} items`);
    console.log(`📊 Success rate: ${((createdCount / totalItems) * 100).toFixed(1)}%`);

    return {
      success: true,
      created: createdCount,
      failed: results.errors.length,
      totalItems,
      results
    };
  }
}

export const jiraAutomationService = new JiraAutomationService();