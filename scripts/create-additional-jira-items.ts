#!/usr/bin/env tsx

// Script to create additional JIRA items (bugs, tech debt, performance, etc.)

import fetch from 'node-fetch';

const JIRA_CREDENTIALS = {
  instanceUrl: 'https://mundotango-team.atlassian.net',
  email: 'admin@mundotango.life',
  apiToken: 'ATATT3xFfGF0Nb_1iigWiEviNSi-kFvP965nAMjH9z8Vs9nGCu87drxemBvCdolRWcSuyDezhWll2jYjakMNp3k60H5J_eR_4uzXIb4ElbG04zEpMc2v1H7-ng_3huq3Ao41EE9VMVHWLKDFKY59whw24pQjc9Xr43lpoKTG2YLknL0o_iRHvQ8=517ED328',
  projectKey: 'KAN'
};

interface AdditionalItem {
  type: 'Bug' | 'Technical Debt' | 'Security Finding' | 'Performance Issue' | 'Learning';
  summary: string;
  description: string;
  labels: string[];
  priority: 'High' | 'Medium' | 'Low';
}

const additionalItems: AdditionalItem[] = [
  // Security Findings
  {
    type: 'Security Finding',
    summary: 'SOC 2 Type II readiness below 75%',
    description: 'Enterprise data handling below acceptable threshold. Current compliance score: 74%. Need to improve security controls and documentation.',
    labels: ['40x20s', 'security', 'compliance', 'Layer-22'],
    priority: 'High'
  },
  {
    type: 'Security Finding',
    summary: 'Enable Redis for production caching',
    description: 'Redis connection errors present, falling back to in-memory cache which affects performance and scalability. Need proper Redis setup.',
    labels: ['40x20s', 'security', 'infrastructure', 'Layer-18'],
    priority: 'Medium'
  },
  {
    type: 'Security Finding',
    summary: 'Implement proper error tracking with Sentry',
    description: 'Sentry integration exists but needs proper configuration and error monitoring setup for production environment.',
    labels: ['40x20s', 'security', 'monitoring', 'Layer-11'],
    priority: 'Medium'
  },
  
  // Performance Issues
  {
    type: 'Performance Issue',
    summary: 'Render time exceeds 3s target (currently ~13s)',
    description: 'Despite optimizations, initial render time is 13.17s. Target is <3s. Need further optimization including code splitting, lazy loading, and server-side rendering.',
    labels: ['40x20s', 'performance', 'optimization', 'Layer-10'],
    priority: 'High'
  },
  {
    type: 'Performance Issue',
    summary: 'Long tasks detected (>50ms)',
    description: 'Multiple long tasks detected: 134ms, 97ms, 74ms, 52ms. These block main thread and affect user interaction responsiveness.',
    labels: ['40x20s', 'performance', 'optimization', 'Layer-10'],
    priority: 'Medium'
  },
  {
    type: 'Performance Issue',
    summary: 'Google Maps loaded without async',
    description: 'Google Maps JavaScript API loaded directly without loading=async, causing suboptimal performance and blocking page render.',
    labels: ['40x20s', 'performance', 'optimization', 'Layer-7'],
    priority: 'Low'
  },
  {
    type: 'Performance Issue',
    summary: 'Bundle size optimization needed',
    description: 'Profile page bundle is 31MB. Need code splitting and lazy loading improvements. Target should be <5MB per route.',
    labels: ['40x20s', 'performance', 'optimization', 'Layer-7'],
    priority: 'Medium'
  },
  
  // Bugs
  {
    type: 'Bug',
    summary: 'Elasticsearch connection refused errors',
    description: 'Elasticsearch not available: connect ECONNREFUSED 127.0.0.1:9200. Service is not running or misconfigured.',
    labels: ['40x20s', 'bug', 'infrastructure', 'Layer-18'],
    priority: 'Low'
  },
  {
    type: 'Bug',
    summary: 'Browser cache causing stale UI issues',
    description: 'Service worker aggressive caching sometimes shows old UI despite updates. Need cache versioning and update strategy.',
    labels: ['40x20s', 'bug', 'caching', 'Layer-7'],
    priority: 'Medium'
  },
  {
    type: 'Bug',
    summary: 'Memory leak in performance monitoring',
    description: 'Memory cleanup runs every 30s but some components may still leak memory. Need proper cleanup in useEffect hooks.',
    labels: ['40x20s', 'bug', 'memory', 'Layer-10'],
    priority: 'Medium'
  },
  
  // Life CEO Learnings
  {
    type: 'Learning',
    summary: 'Implement automatic field mapping validation',
    description: 'Life CEO learned to auto-detect client-server field mismatches. This should be built into the system as a development tool.',
    labels: ['40x20s', 'life-ceo', 'improvement', 'Layer-32'],
    priority: 'Medium'
  },
  {
    type: 'Learning',
    summary: 'Add resilient service patterns',
    description: 'Implement automatic Redis fallback to in-memory caching pattern across all services for better resilience.',
    labels: ['40x20s', 'life-ceo', 'improvement', 'Layer-34'],
    priority: 'Medium'
  },
  {
    type: 'Learning',
    summary: 'Create design consistency checker',
    description: 'Maintain MT ocean theme automatically during debugging and development. Build a visual regression testing system.',
    labels: ['40x20s', 'life-ceo', 'improvement', 'Layer-31'],
    priority: 'Low'
  }
];

async function createJiraIssue(item: AdditionalItem, index: number): Promise<string | null> {
  const authHeader = `Basic ${Buffer.from(`${JIRA_CREDENTIALS.email}:${JIRA_CREDENTIALS.apiToken}`).toString('base64')}`;
  
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
          summary: item.summary,
          description: {
            type: 'doc',
            version: 1,
            content: [{
              type: 'paragraph',
              content: [{
                type: 'text',
                text: item.description
              }]
            }]
          },
          issuetype: { name: 'Task' }, // Using Task since Story doesn't exist
          project: { key: JIRA_CREDENTIALS.projectKey },
          labels: item.labels
        }
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error(`Failed to create issue: ${error}`);
      return null;
    }
    
    const result = await response.json();
    return result.key;
  } catch (error) {
    console.error(`Error creating issue:`, error);
    return null;
  }
}

async function main() {
  console.log('🚀 Creating additional JIRA items...');
  console.log(`📍 Instance: ${JIRA_CREDENTIALS.instanceUrl}`);
  console.log(`📧 Email: ${JIRA_CREDENTIALS.email}`);
  console.log(`🔑 Project Key: ${JIRA_CREDENTIALS.projectKey}\n`);
  
  const results = { success: 0, failed: 0 };
  
  for (let i = 0; i < additionalItems.length; i++) {
    const item = additionalItems[i];
    const issueKey = await createJiraIssue(item, i);
    
    if (issueKey) {
      console.log(`✅ Created ${i + 1}/${additionalItems.length}: [${item.type}] ${item.summary} (${issueKey})`);
      results.success++;
    } else {
      console.log(`❌ Failed ${i + 1}/${additionalItems.length}: [${item.type}] ${item.summary}`);
      results.failed++;
    }
  }
  
  console.log(`\n📊 Additional JIRA Items Summary:`);
  console.log(`✅ Successfully created: ${results.success} items`);
  console.log(`❌ Failed: ${results.failed} items`);
  console.log(`📊 Success rate: ${((results.success / additionalItems.length) * 100).toFixed(1)}%`);
  
  console.log(`\n🎉 Additional JIRA items creation complete!`);
  console.log(`📌 Total items in JIRA: ${87 + results.success} (${87} from main export + ${results.success} additional)`);
}

main();