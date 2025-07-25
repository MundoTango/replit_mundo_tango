#!/usr/bin/env npx tsx
/**
 * JIRA Parent and Team Update Script
 * Updates parent and team fields for all issues created today using 40x20s framework
 */

import fetch from 'node-fetch';

// JIRA Configuration
const JIRA_CONFIG = {
  instanceUrl: 'https://mundotango-team.atlassian.net',
  email: 'admin@mundotango.life',
  apiToken: 'ATATT3xFfGF0Nb_1iigWiEviNSi-kFvP965nAMjH9z8Vs9nGCu87drxemBvCdolRWcSuyDezhWll2jYjakMNp3k60H5J_eR_4uzXIb4ElbG04zEpMc2v1H7-ng_3huq3Ao41EE9VMVHWLKDFKY59whw24pQjc9Xr43lpoKTG2YLknL0o_iRHvQ8=517ED328',
  projectKey: 'MT'
};

// Team mappings based on 40x20s framework layers
const LAYER_TO_TEAM_MAPPING: Record<string, string> = {
  // Foundation layers (1-5)
  'layer-1': 'Backend Team',
  'layer-2': 'Database Team',
  'layer-3': 'Architecture Team',
  'layer-4': 'API Team',
  'layer-5': 'Infrastructure Team',
  
  // Business & Frontend layers (6-10)
  'layer-6': 'Business Logic Team',
  'layer-7': 'Frontend Team',
  'layer-8': 'Product Team',
  'layer-9': 'Media Team',
  'layer-10': 'DevOps Team',
  
  // Analytics & Testing layers (11-15)
  'layer-11': 'Analytics Team',
  'layer-12': 'Documentation Team',
  'layer-13': 'QA Team',
  'layer-14': 'Security Team',
  'layer-15': 'Platform Team',
  
  // Performance & AI layers (16-20)
  'layer-16': 'Performance Team',
  'layer-17': 'AI Team',
  'layer-18': 'Integration Team',
  'layer-19': 'Monitoring Team',
  'layer-20': 'Business Team',
  
  // Advanced layers (21-40)
  'layer-21': 'Production Team',
  'layer-22': 'Safety Team',
  'layer-23': 'Business Continuity Team',
  'layer-24': 'AI/ML Team',
  'layer-25': 'Debug Team',
  'layer-26': 'Data Team',
  'layer-27': 'Cloud Team',
  'layer-28': 'Enterprise Team',
  'layer-29': 'Compliance Team',
  'layer-30': 'Innovation Team'
};

// Epic to parent mapping
const EPIC_PARENT_MAPPING: Record<string, string> = {
  'MT-2': 'MT-1',   // Life CEO AI Platform
  'MT-3': 'MT-1',   // Mundo Tango Social Platform
  'MT-11': 'MT-3',  // Mundo Tango Social Platform (sub-epic)
  'MT-12': 'MT-1',  // Frontend & UI/UX Systems
  'MT-13': 'MT-1',  // Backend API & Services
  'MT-14': 'MT-1',  // AI & Machine Learning Systems
  'MT-15': 'MT-1',  // Infrastructure & DevOps
  'MT-21': 'MT-1',  // Mobile App Development
};

// Helper function to get auth header
function getAuthHeader() {
  return `Basic ${Buffer.from(`${JIRA_CONFIG.email}:${JIRA_CONFIG.apiToken}`).toString('base64')}`;
}

// Helper function to get team ID by name
async function getTeamIdByName(teamName: string): Promise<number | null> {
  try {
    // First, try to get the team from the field configuration
    const response = await fetch(`${JIRA_CONFIG.instanceUrl}/rest/api/3/field`, {
      headers: {
        'Authorization': getAuthHeader(),
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to get fields: ${response.status}`);
      return null;
    }
    
    const fields = await response.json() as any[];
    const teamField = fields.find((f: any) => f.name === 'Team' || f.key === 'team');
    
    if (!teamField) {
      console.error('Team field not found');
      return null;
    }
    
    // For now, return the team name as a string ID (JIRA might use names directly)
    return teamName as any;
  } catch (error) {
    console.error('Error getting team ID:', error);
    return null;
  }
}

// Helper function to get issue details
async function getIssue(issueKey: string) {
  try {
    const response = await fetch(`${JIRA_CONFIG.instanceUrl}/rest/api/3/issue/${issueKey}`, {
      headers: {
        'Authorization': getAuthHeader(),
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to get issue ${issueKey}: ${response.status}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error getting issue ${issueKey}:`, error);
    return null;
  }
}

// Helper function to update issue
async function updateIssue(issueKey: string, updateData: any) {
  try {
    const response = await fetch(`${JIRA_CONFIG.instanceUrl}/rest/api/3/issue/${issueKey}`, {
      method: 'PUT',
      headers: {
        'Authorization': getAuthHeader(),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error(`Failed to update issue ${issueKey}: ${response.status} - ${error}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error updating issue ${issueKey}:`, error);
    return false;
  }
}

// Helper function to get all issues created today
async function getIssuesToUpdate() {
  const jql = `project = ${JIRA_CONFIG.projectKey} AND created >= startOfDay() ORDER BY created DESC`;
  const allIssues: any[] = [];
  let startAt = 0;
  const maxResults = 100;
  
  while (true) {
    try {
      const response = await fetch(
        `${JIRA_CONFIG.instanceUrl}/rest/api/3/search?jql=${encodeURIComponent(jql)}&startAt=${startAt}&maxResults=${maxResults}`,
        {
          headers: {
            'Authorization': getAuthHeader(),
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        console.error(`Failed to search issues: ${response.status}`);
        break;
      }
      
      const data = await response.json() as any;
      allIssues.push(...data.issues);
      
      if (data.issues.length < maxResults) {
        break;
      }
      
      startAt += maxResults;
    } catch (error) {
      console.error('Error searching issues:', error);
      break;
    }
  }
  
  return allIssues;
}

// Helper function to determine team based on labels
function determineTeamFromLabels(labels: string[]): string {
  // Find layer label
  const layerLabel = labels.find(label => label.startsWith('layer-'));
  if (layerLabel && LAYER_TO_TEAM_MAPPING[layerLabel]) {
    return LAYER_TO_TEAM_MAPPING[layerLabel];
  }
  
  // Fallback based on other labels
  if (labels.includes('frontend')) return 'Frontend Team';
  if (labels.includes('backend')) return 'Backend Team';
  if (labels.includes('database')) return 'Database Team';
  if (labels.includes('ai') || labels.includes('ml')) return 'AI Team';
  if (labels.includes('infrastructure')) return 'Infrastructure Team';
  if (labels.includes('mobile')) return 'Mobile Team';
  if (labels.includes('security')) return 'Security Team';
  if (labels.includes('performance')) return 'Performance Team';
  if (labels.includes('testing') || labels.includes('qa')) return 'QA Team';
  
  return 'Product Team'; // Default team
}

// Helper function to link GitHub repository
async function linkGitHubRepository() {
  console.log('\n🔗 Verifying GitHub Integration...');
  
  // Check if development panel is enabled
  try {
    const response = await fetch(`${JIRA_CONFIG.instanceUrl}/rest/dev-status/1.0/issue/detail?issueId=MT-1&applicationType=GitHub&dataType=repository`, {
      headers: {
        'Authorization': getAuthHeader(),
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json() as any;
      console.log('✅ GitHub integration is active');
      console.log(`   Connected repositories: ${data.detail?.repositories?.length || 0}`);
    } else {
      console.log('⚠️  GitHub integration may need configuration in JIRA settings');
      console.log('   Go to Project Settings → Apps → GitHub for Jira');
    }
  } catch (error) {
    console.log('⚠️  Could not verify GitHub integration status');
  }
}

// Main update function
async function updateParentAndTeamFields() {
  console.log('🚀 Updating Parent and Team fields for all issues created today...');
  console.log('================================================\n');
  console.log('📋 Using 40x20s Framework for team assignment');
  
  // Get all issues created today
  const issues = await getIssuesToUpdate();
  console.log(`\n📊 Found ${issues.length} issues to update\n`);
  
  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;
  
  for (const issue of issues) {
    const issueKey = issue.key;
    const issueType = issue.fields.issuetype.name;
    const labels = issue.fields.labels || [];
    const currentParent = issue.fields.parent?.key;
    const summary = issue.fields.summary;
    
    console.log(`\n🔍 Processing ${issueKey}: ${summary.substring(0, 50)}...`);
    
    // Determine updates needed
    const updates: any = { fields: {} };
    let needsUpdate = false;
    
    // Update parent if needed
    if (!currentParent && issueType !== 'Epic') {
      // Determine parent based on issue key ranges
      let parentKey: string | null = null;
      const issueNumber = parseInt(issueKey.replace('MT-', ''));
      
      if (issueNumber >= 44 && issueNumber <= 48) parentKey = 'MT-2';  // Life CEO AI Platform
      else if (issueNumber >= 49 && issueNumber <= 53) parentKey = 'MT-11'; // Mundo Tango Platform
      else if (issueNumber >= 54 && issueNumber <= 58) parentKey = 'MT-12'; // Frontend Systems
      else if (issueNumber >= 59 && issueNumber <= 63) parentKey = 'MT-13'; // Backend Services
      else if (issueNumber >= 64 && issueNumber <= 68) parentKey = 'MT-14'; // AI/ML Systems
      else if (issueNumber >= 69 && issueNumber <= 73) parentKey = 'MT-15'; // Infrastructure
      else if (issueNumber >= 74 && issueNumber <= 78) parentKey = 'MT-21'; // Mobile Development
      else if (issueNumber >= 79 && issueNumber <= 168) parentKey = 'MT-11'; // MT-11 comprehensive coverage
      
      if (parentKey) {
        updates.fields.parent = { key: parentKey };
        needsUpdate = true;
        console.log(`   📌 Setting parent: ${parentKey}`);
      }
    }
    
    // Update team based on labels
    const team = determineTeamFromLabels(labels);
    if (team) {
      // Try different field names for team
      updates.fields['customfield_10001'] = { value: team }; // Common team field ID
      updates.fields.team = team; // Alternative field name
      needsUpdate = true;
      console.log(`   👥 Setting team: ${team}`);
    }
    
    // Apply updates if needed
    if (needsUpdate) {
      const success = await updateIssue(issueKey, updates);
      if (success) {
        console.log(`   ✅ Updated successfully`);
        successCount++;
      } else {
        console.log(`   ❌ Failed to update`);
        failCount++;
      }
    } else {
      console.log(`   ⏭️  Skipped (already has parent/team)`);
      skipCount++;
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  // Link GitHub repository
  await linkGitHubRepository();
  
  console.log('\n================================================');
  console.log(`📊 Update Summary:`);
  console.log(`  Total issues processed: ${issues.length}`);
  console.log(`  Successfully updated: ${successCount}`);
  console.log(`  Skipped (already set): ${skipCount}`);
  console.log(`  Failed: ${failCount}`);
  console.log('\n✅ Parent and Team field update complete!');
  console.log(`🔗 View updated issues: ${JIRA_CONFIG.instanceUrl}/browse/${JIRA_CONFIG.projectKey}`);
}

// Execute update
updateParentAndTeamFields().catch(console.error);