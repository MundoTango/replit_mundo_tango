#!/usr/bin/env npx tsx
/**
 * Life CEO 40x20s JIRA Migration - Tasks Only
 * Creates tasks for existing stories
 */

import fetch from 'node-fetch';

// JIRA Configuration
const JIRA_CONFIG = {
  instanceUrl: 'https://mundotango-team.atlassian.net',
  email: 'admin@mundotango.life',
  apiToken: 'ATATT3xFfGF0Nb_1iigWiEviNSi-kFvP965nAMjH9z8Vs9nGCu87drxemBvCdolRWcSuyDezhWll2jYjakMNp3k60H5J_eR_4uzXIb4ElbG04zEpMc2v1H7-ng_3huq3Ao41EE9VMVHWLKDFKY59whw24pQjc9Xr43lpoKTG2YLknL0o_iRHvQ8=517ED328',
  projectKey: 'MT'
};

// Story to parent key mapping
const STORY_PARENT_MAPPING = {
  'Business Agent Implementation': 'MT-10',
  'Enhanced Timeline V2': 'MT-12',
  'Performance Optimization - 72% Improvement': 'MT-14',
  'Database Architecture with RLS': 'MT-16',
  '16 Agent System Architecture': 'MT-18',
  'Performance Monitoring System': 'MT-20',
  'Mobile Wrapper Strategy': 'MT-22'
};

// Tasks for each story
const STORY_TASKS = {
  'Business Agent Implementation': [
    'Create Business Agent core logic',
    'Implement financial data integration',
    'Add market analysis capabilities',
    'Create agent communication interface',
    'Add voice command support'
  ],
  'Enhanced Timeline V2': [
    'Create timeline component architecture',
    'Implement infinite scroll',
    'Add media upload system',
    'Build real-time update system',
    'Add social interaction features'
  ],
  'Performance Optimization - 72% Improvement': [
    'Implement code splitting',
    'Add lazy loading for routes',
    'Optimize bundle size',
    'Add performance monitoring',
    'Implement caching strategy'
  ],
  'Database Architecture with RLS': [
    'Design database schema',
    'Implement RLS policies',
    'Create audit logging system',
    'Add performance indexes',
    'Build health check functions'
  ],
  '16 Agent System Architecture': [
    'Design agent communication protocol',
    'Create agent base class',
    'Implement inter-agent messaging',
    'Build agent orchestration system',
    'Add agent learning capabilities'
  ],
  'Performance Monitoring System': [
    'Set up metrics collection',
    'Create performance dashboard',
    'Implement alerting system',
    'Add optimization engine'
  ],
  'Mobile Wrapper Strategy': [
    'Evaluate WebToApp.design',
    'Test Capacitor framework',
    'Create native prototypes',
    'Choose final approach',
    'Implement chosen solution'
  ]
};

// Helper function to convert markdown to ADF
function markdownToADF(markdown: string): any {
  const lines = markdown.split('\n');
  const content: any[] = [];
  
  lines.forEach(line => {
    if (line.trim() === '') {
      // Empty line - skip
    } else {
      // Regular paragraph
      content.push({
        type: 'paragraph',
        content: [{
          type: 'text',
          text: line
        }]
      });
    }
  });
  
  return {
    version: 1,
    type: 'doc',
    content: content
  };
}

// Helper function to create JIRA issue
async function createJiraIssue(issueData: any) {
  const authHeader = `Basic ${Buffer.from(`${JIRA_CONFIG.email}:${JIRA_CONFIG.apiToken}`).toString('base64')}`;
  
  try {
    const response = await fetch(`${JIRA_CONFIG.instanceUrl}/rest/api/3/issue`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(issueData)
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create issue: ${response.status} - ${error}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating issue:', error);
    throw error;
  }
}

// Main migration function
async function createTasks() {
  console.log('🚀 Creating Tasks for Existing Stories...');
  console.log('================================================\n');
  
  let totalTasks = 0;
  
  for (const [storyName, parentKey] of Object.entries(STORY_PARENT_MAPPING)) {
    const tasks = STORY_TASKS[storyName as keyof typeof STORY_TASKS] || [];
    
    if (tasks.length > 0) {
      console.log(`📋 Creating tasks for ${storyName} (${parentKey}):`);
      
      for (const task of tasks) {
        try {
          const taskData = {
            fields: {
              project: { key: JIRA_CONFIG.projectKey },
              summary: task,
              description: markdownToADF(`Task for: ${storyName}`),
              issuetype: { name: 'Task' },
              labels: ['40x20s-task', 'implementation'],
              parent: { key: parentKey }
            }
          };
          
          const created = await createJiraIssue(taskData);
          console.log(`  ✅ Created: ${created.key} - ${task}`);
          totalTasks++;
        } catch (error) {
          console.error(`  ❌ Failed to create task: ${task}`, error);
        }
      }
    }
  }
  
  console.log('\n================================================');
  console.log(`📊 Total tasks created: ${totalTasks}`);
  console.log('\n✅ Task creation complete!');
  console.log(`🔗 View your board: ${JIRA_CONFIG.instanceUrl}/jira/software/projects/${JIRA_CONFIG.projectKey}/boards/34`);
}

// Execute task creation
createTasks().catch(console.error);