#!/usr/bin/env tsx

// Life CEO 40x20s JIRA Creation Script
// This script executes the JIRA creation process using the configured credentials

import fetch from 'node-fetch';
import { comprehensiveProjectData } from '../client/src/data/comprehensive-project-data';

const JIRA_CREDENTIALS = {
  instanceUrl: 'https://mundotango-team.atlassian.net',
  email: 'admin@mundotango.life',
  apiToken: 'ATATT3xFfGF0Nb_1iigWiEviNSi-kFvP965nAMjH9z8Vs9nGCu87drxemBvCdolRWcSuyDezhWll2jYjakMNp3k60H5J_eR_4uzXIb4ElbG04zEpMc2v1H7-ng_3huq3Ao41EE9VMVHWLKDFKY59whw24pQjc9Xr43lpoKTG2YLknL0o_iRHvQ8=517ED328',
  projectKey: 'MT'
};

async function executeJiraCreation() {
  console.log('🚀 Life CEO 40x20s: Starting JIRA creation process...');
  console.log('📍 Instance:', JIRA_CREDENTIALS.instanceUrl);
  console.log('📧 Email:', JIRA_CREDENTIALS.email);
  console.log('🔑 Project Key:', JIRA_CREDENTIALS.projectKey);
  
  const authHeader = `Basic ${Buffer.from(`${JIRA_CREDENTIALS.email}:${JIRA_CREDENTIALS.apiToken}`).toString('base64')}`;
  
  // Test connection first
  console.log('\n🔍 Testing JIRA connection...');
  try {
    const testResponse = await fetch(`${JIRA_CREDENTIALS.instanceUrl}/rest/api/3/myself`, {
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json'
      }
    });
    
    if (!testResponse.ok) {
      throw new Error(`Connection failed: ${testResponse.status} ${testResponse.statusText}`);
    }
    
    const userInfo = await testResponse.json();
    console.log('✅ Connection successful! Connected as:', userInfo.displayName);
  } catch (error) {
    console.error('❌ JIRA connection failed:', error);
    process.exit(1);
  }
  
  // Generate export data
  console.log('\n📊 Generating 40x20s framework data...');
  const { epics, stories, tasks } = generateJiraExportData();
  const totalItems = epics.length + stories.length + tasks.length;
  
  console.log(`\n📋 Total items to create: ${totalItems}`);
  console.log(`  - Epics: ${epics.length}`);
  console.log(`  - Stories: ${stories.length}`);
  console.log(`  - Tasks: ${tasks.length}`);
  
  let createdCount = 0;
  const errors: any[] = [];
  
  // Create epics first
  console.log('\n🏛️ Creating epics...');
  for (const epic of epics) {
    try {
      const response = await fetch(`${JIRA_CREDENTIALS.instanceUrl}/rest/api/3/issue`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            summary: epic.summary,
            description: {
              type: 'doc',
              version: 1,
              content: [{
                type: 'paragraph',
                content: [{
                  type: 'text',
                  text: epic.description
                }]
              }]
            },
            issuetype: { name: 'Epic' },
            project: { key: JIRA_CREDENTIALS.projectKey },
            labels: epic.labels
          }
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        createdCount++;
        console.log(`✅ Created epic ${createdCount}/${totalItems}: ${epic.summary} (${result.key})`);
      } else {
        const error = await response.text();
        throw new Error(error);
      }
      
      // Rate limiting - wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error: any) {
      console.error(`❌ Failed to create epic: ${epic.summary}`);
      console.error('   Error:', error.message);
      errors.push({ type: 'epic', item: epic, error: error.message });
    }
  }
  
  // Create stories
  console.log('\n📖 Creating stories...');
  for (const story of stories) {
    try {
      const response = await fetch(`${JIRA_CREDENTIALS.instanceUrl}/rest/api/3/issue`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            summary: story.summary,
            description: {
              type: 'doc',
              version: 1,
              content: [{
                type: 'paragraph',
                content: [{
                  type: 'text',
                  text: story.description
                }]
              }]
            },
            issuetype: { name: 'Task' },
            project: { key: JIRA_CREDENTIALS.projectKey },
            labels: story.labels
          }
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        createdCount++;
        console.log(`✅ Created story ${createdCount}/${totalItems}: ${story.summary} (${result.key})`);
      } else {
        const error = await response.text();
        throw new Error(error);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error: any) {
      console.error(`❌ Failed to create story: ${story.summary}`);
      console.error('   Error:', error.message);
      errors.push({ type: 'story', item: story, error: error.message });
    }
  }
  
  // Create tasks
  console.log('\n📋 Creating tasks...');
  for (const task of tasks) {
    try {
      const response = await fetch(`${JIRA_CREDENTIALS.instanceUrl}/rest/api/3/issue`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            summary: task.summary,
            description: {
              type: 'doc',
              version: 1,
              content: [{
                type: 'paragraph',
                content: [{
                  type: 'text',
                  text: task.description
                }]
              }]
            },
            issuetype: { name: 'Task' },
            project: { key: JIRA_CREDENTIALS.projectKey },
            labels: task.labels
          }
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        createdCount++;
        console.log(`✅ Created task ${createdCount}/${totalItems}: ${task.summary} (${result.key})`);
      } else {
        const error = await response.text();
        throw new Error(error);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error: any) {
      console.error(`❌ Failed to create task: ${task.summary}`);
      console.error('   Error:', error.message);
      errors.push({ type: 'task', item: task, error: error.message });
    }
  }
  
  // Final report
  console.log('\n📊 40x20s JIRA Creation Summary:');
  console.log(`✅ Successfully created: ${createdCount} items`);
  console.log(`❌ Failed: ${errors.length} items`);
  console.log(`📊 Success rate: ${((createdCount / totalItems) * 100).toFixed(1)}%`);
  
  if (errors.length > 0) {
    console.log('\n❌ Failed items:');
    errors.forEach((error, i) => {
      console.log(`${i + 1}. ${error.type}: ${error.item.summary}`);
      console.log(`   Error: ${error.error}`);
    });
  }
  
  console.log('\n🎉 Life CEO 40x20s JIRA creation process complete!');
}

// Generate JIRA export data
function generateJiraExportData() {
  const epics: any[] = [];
  const stories: any[] = [];
  const tasks: any[] = [];
  
  const processItem = (item: any, parentKey?: string, level = 0) => {
    const labels = ['40x20s', `Layer-${item.layer || 1}`, `Phase-${item.phase || 1}`];
    
    if (item.type === 'Platform' || item.type === 'Section') {
      epics.push({
        summary: item.title,
        description: item.description || `${item.title} implementation using 40x20s framework`,
        labels,
        key: `MT-EPIC-${epics.length + 1}`
      });
    } else if (item.type === 'Feature' || item.type === 'Project') {
      // Limit summary length to 255 characters (JIRA limit)
      const summary = item.title.length > 255 ? item.title.substring(0, 252) + '...' : item.title;
      stories.push({
        summary,
        description: item.description || `${item.title} feature implementation`,
        labels,
        epicLink: parentKey,
        storyPoints: Math.ceil((item.actualHours || 40) / 8)
      });
    } else if (item.type === 'Task' && level < 3) { // Limit depth to avoid too many sub-tasks
      const summary = item.title.length > 255 ? item.title.substring(0, 252) + '...' : item.title;
      tasks.push({
        summary,
        description: item.description || `${item.title} task implementation`,
        labels,
        parentKey
      });
    }
    
    if (item.children && level < 2) { // Limit recursion depth
      item.children.forEach((child: any) => 
        processItem(child, `MT-${item.type.toUpperCase()}-${epics.length || stories.length || tasks.length}`, level + 1)
      );
    }
  };
  
  comprehensiveProjectData.forEach((item: any) => processItem(item));
  
  return { epics, stories, tasks };
}

// Execute the script
executeJiraCreation().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});