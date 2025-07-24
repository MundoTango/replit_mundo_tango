#!/usr/bin/env tsx

// Test script to check available issue types in JIRA

import fetch from 'node-fetch';

const JIRA_CREDENTIALS = {
  instanceUrl: 'https://mundotango-team.atlassian.net',
  email: 'admin@mundotango.life',
  apiToken: 'ATATT3xFfGF0Nb_1iigWiEviNSi-kFvP965nAMjH9z8Vs9nGCu87drxemBvCdolRWcSuyDezhWll2jYjakMNp3k60H5J_eR_4uzXIb4ElbG04zEpMc2v1H7-ng_3huq3Ao41EE9VMVHWLKDFKY59whw24pQjc9Xr43lpoKTG2YLknL0o_iRHvQ8=517ED328',
  projectKey: 'KAN'
};

async function checkJiraTypes() {
  const authHeader = `Basic ${Buffer.from(`${JIRA_CREDENTIALS.email}:${JIRA_CREDENTIALS.apiToken}`).toString('base64')}`;
  
  // Get project details including issue types
  console.log('🔍 Fetching project details and issue types...\n');
  try {
    const projectResponse = await fetch(`${JIRA_CREDENTIALS.instanceUrl}/rest/api/3/project/${JIRA_CREDENTIALS.projectKey}`, {
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json'
      }
    });
    
    if (!projectResponse.ok) {
      throw new Error(`Failed to fetch project: ${projectResponse.status} ${projectResponse.statusText}`);
    }
    
    const project = await projectResponse.json();
    
    console.log('📋 Available Issue Types:');
    project.issueTypes.forEach((type: any) => {
      console.log(`  - ${type.name} (${type.description || 'No description'})`);
    });
    
    // Check if priority field is available
    console.log('\n🔍 Checking create screen fields...');
    const createMetaResponse = await fetch(
      `${JIRA_CREDENTIALS.instanceUrl}/rest/api/3/issue/createmeta?projectKeys=${JIRA_CREDENTIALS.projectKey}&expand=projects.issuetypes.fields`,
      {
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json'
        }
      }
    );
    
    if (createMetaResponse.ok) {
      const createMeta = await createMetaResponse.json();
      const project = createMeta.projects[0];
      const epicType = project.issuetypes.find((t: any) => t.name === 'Epic');
      
      if (epicType && epicType.fields) {
        console.log('\n📋 Available fields for Epic:');
        Object.keys(epicType.fields).forEach(field => {
          console.log(`  - ${field}`);
        });
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkJiraTypes();