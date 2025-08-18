#!/usr/bin/env tsx

// Script to create the additional 33 missing items in JIRA

import fs from 'fs';
import { jiraApiService } from '../client/src/services/jiraApiService.js';

// JIRA configuration
const jiraDomain = 'mundotango-team.atlassian.net';
const jiraEmail = 'sboddye@gmail.com';
const jiraApiToken = process.env.JIRA_API_TOKEN;

if (!jiraApiToken) {
  console.error('❌ Error: JIRA_API_TOKEN environment variable not set');
  console.log('Please set your JIRA API token:');
  console.log('export JIRA_API_TOKEN="your-api-token-here"');
  process.exit(1);
}

// Read the missing items
const missingItemsData = JSON.parse(
  fs.readFileSync('scripts/missing-jira-items.json', 'utf-8')
);

// Map internal types to JIRA issue types (based on successful migration)
function mapToJiraIssueType(type: string): string {
  switch (type) {
    case 'Platform':
      return 'Epic';
    case 'Section':
      return 'Epic'; // Sections are also epics in JIRA
    case 'Feature':
      return 'Task'; // Features are mapped to Task in JIRA (not Story)
    case 'Project':
      return 'Task'; // Projects are also tasks
    case 'Task':
      return 'Task'; // Tasks map to Task (not Sub-task)
    case 'Sub-task':
      return 'Task'; // Sub-tasks also map to Task
    default:
      return 'Task';
  }
}

// Determine layer for an item based on its context
function determineLayer(item: any): number {
  const title = item.title.toLowerCase();
  const path = item.parentPath.toLowerCase();
  
  if (title.includes('agent') || title.includes('ai')) return 18; // AI
  if (title.includes('api') && title.includes('doc')) return 20; // Documentation
  if (title.includes('test') || title.includes('qa')) return 10; // Testing
  if (title.includes('performance')) return 11; // Performance
  if (title.includes('security') || title.includes('compliance')) return 22; // Security
  if (title.includes('search')) return 7; // Frontend
  if (title.includes('community') || title.includes('social')) return 7; // Frontend
  if (title.includes('dashboard') || title.includes('ui')) return 7; // Frontend
  if (title.includes('database') || title.includes('storage')) return 5; // Data
  if (title.includes('infrastructure')) return 4; // Infrastructure
  
  // Default based on type
  if (item.type === 'Section') return 2; // Architecture
  if (item.type === 'Feature') return 7; // Frontend
  return 8; // Backend
}

// Generate acceptance criteria based on item
function generateAcceptanceCriteria(item: any): string[] {
  const criteria: string[] = [];
  
  if (item.completion === 100) {
    criteria.push('Feature is fully implemented and tested');
    criteria.push('Documentation is complete');
    criteria.push('No known bugs or issues');
  } else if (item.status === 'In Progress') {
    criteria.push(`Complete implementation to ${item.completion}% → 100%`);
    criteria.push('All tests passing');
    criteria.push('Code reviewed and approved');
  } else if (item.status === 'Blocked') {
    criteria.push('Unblock the issue by resolving dependencies');
    criteria.push('Complete implementation');
    criteria.push('Verify functionality works as expected');
  } else {
    criteria.push('Implementation complete according to requirements');
    criteria.push('Unit tests written and passing');
    criteria.push('Integration tested with related features');
  }
  
  return criteria;
}

// Main function to create items
async function createMissingItems() {
  console.log('🚀 Creating additional JIRA items from gap analysis\n');
  
  const items = missingItemsData.missingItems;
  let successCount = 0;
  let failureCount = 0;
  
  // Initialize service with credentials
  jiraApiService.setCredentials({
    instanceUrl: `https://${jiraDomain}`,
    email: jiraEmail,
    apiToken: jiraApiToken,
    projectKey: 'KAN'
  });
  
  // Skip connection test - proceed directly to creation
  console.log('✅ Using JIRA configuration:');
  console.log(`   Instance: https://${jiraDomain}`);
  console.log(`   Project: KAN`);
  console.log(`   Email: ${jiraEmail}`);
  
  // Starting issue key (after KAN-100)
  let currentKey = 101;
  
  for (const item of items) {
    const issueType = mapToJiraIssueType(item.type);
    const layer = determineLayer(item);
    const acceptanceCriteria = generateAcceptanceCriteria(item);
    
    const issueData = {
      fields: {
        project: {
          key: 'KAN'
        },
        summary: `[Gap Analysis] ${item.title}`,
        description: `${item.description}\n\n` +
          `**Status:** ${item.status}\n` +
          `**Completion:** ${item.completion}%\n` +
          `**Path:** ${item.parentPath}\n` +
          `**Team:** ${item.team.join(', ')}\n` +
          `**Priority:** ${item.priority}\n\n` +
          `**40x20s Framework:**\n` +
          `- Layer: ${layer}\n` +
          `- Type: ${item.type}`,
        issuetype: {
          name: issueType
        },
        labels: [
          '40x20s',
          `Layer-${layer}`,
          `Status-${item.status}`,
          'GapAnalysis',
          item.type
        ]
        // Priority field removed based on successful migration config
      }
    };
    
    // Add acceptance criteria if it's not an epic
    if (issueType !== 'Epic') {
      (issueData.fields as any).customfield_10011 = acceptanceCriteria.join('\n');
    }
    
    try {
      console.log(`Creating ${issueType}: ${item.title}...`);
      const result = await jiraApiService.createIssue(issueData);
      
      if (result.key) {
        console.log(`✅ Created ${result.key}: ${item.title}`);
        successCount++;
      } else {
        console.log(`❌ Failed to create: ${item.title}`);
        failureCount++;
      }
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Error creating ${item.title}:`, error);
      failureCount++;
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`✅ Successfully created: ${successCount} items`);
  console.log(`❌ Failed: ${failureCount} items`);
  console.log(`📊 Total gap items processed: ${items.length}`);
  console.log('\n🎉 Gap analysis items migration complete!');
}

// Run the script
createMissingItems().catch(console.error);