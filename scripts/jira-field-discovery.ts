#!/usr/bin/env npx tsx
/**
 * JIRA Field Discovery Script
 * Discovers available fields and their IDs in JIRA
 */

import fetch from 'node-fetch';

// JIRA Configuration
const JIRA_CONFIG = {
  instanceUrl: 'https://mundotango-team.atlassian.net',
  email: 'admin@mundotango.life',
  apiToken: 'ATATT3xFfGF0Nb_1iigWiEviNSi-kFvP965nAMjH9z8Vs9nGCu87drxemBvCdolRWcSuyDezhWll2jYjakMNp3k60H5J_eR_4uzXIb4ElbG04zEpMc2v1H7-ng_3huq3Ao41EE9VMVHWLKDFKY59whw24pQjc9Xr43lpoKTG2YLknL0o_iRHvQ8=517ED328',
  projectKey: 'MT'
};

// Helper function to get auth header
function getAuthHeader() {
  return `Basic ${Buffer.from(`${JIRA_CONFIG.email}:${JIRA_CONFIG.apiToken}`).toString('base64')}`;
}

// Discover fields
async function discoverFields() {
  console.log('🔍 Discovering JIRA Fields...\n');
  
  try {
    // Get all fields
    const response = await fetch(`${JIRA_CONFIG.instanceUrl}/rest/api/3/field`, {
      headers: {
        'Authorization': getAuthHeader(),
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to get fields: ${response.status}`);
      return;
    }
    
    const fields = await response.json() as any[];
    
    // Find relevant fields
    console.log('📋 Relevant Fields Found:\n');
    
    // Parent field
    const parentField = fields.find(f => f.name === 'Parent' || f.key === 'parent');
    if (parentField) {
      console.log(`✅ Parent Field:`);
      console.log(`   ID: ${parentField.id}`);
      console.log(`   Key: ${parentField.key}`);
      console.log(`   Name: ${parentField.name}`);
      console.log(`   Schema: ${JSON.stringify(parentField.schema)}\n`);
    }
    
    // Team-related fields
    console.log('👥 Team-Related Fields:');
    const teamFields = fields.filter(f => 
      f.name?.toLowerCase().includes('team') || 
      f.key?.toLowerCase().includes('team')
    );
    
    teamFields.forEach(field => {
      console.log(`   - ${field.name} (${field.id}) - ${field.key || 'no key'}`);
    });
    
    // Component field
    const componentField = fields.find(f => f.name === 'Components' || f.key === 'components');
    if (componentField) {
      console.log(`\n📦 Components Field (could be used for teams):`);
      console.log(`   ID: ${componentField.id}`);
      console.log(`   Key: ${componentField.key}`);
      console.log(`   Name: ${componentField.name}\n`);
    }
    
    // Custom fields that might be team
    console.log('🔧 Custom Fields (potential team fields):');
    const customFields = fields.filter(f => f.id.startsWith('customfield_'));
    customFields.forEach(field => {
      if (field.name?.toLowerCase().includes('team') || 
          field.name?.toLowerCase().includes('group') ||
          field.name?.toLowerCase().includes('squad')) {
        console.log(`   - ${field.name} (${field.id})`);
      }
    });
    
    // Check a sample issue to see actual fields
    console.log('\n📊 Checking Sample Issue (MT-119) Fields:\n');
    
    const issueResponse = await fetch(`${JIRA_CONFIG.instanceUrl}/rest/api/3/issue/MT-119?expand=names`, {
      headers: {
        'Authorization': getAuthHeader(),
        'Accept': 'application/json'
      }
    });
    
    if (issueResponse.ok) {
      const issue = await response.json() as any;
      const issueFields = issue.fields || {};
      
      console.log('Available fields on issue:');
      Object.keys(issueFields).forEach(fieldKey => {
        if (fieldKey.includes('team') || fieldKey.includes('parent') || fieldKey.includes('component')) {
          console.log(`   - ${fieldKey}: ${JSON.stringify(issueFields[fieldKey])}`);
        }
      });
    }
    
    // Get project components (often used for teams)
    console.log('\n🏢 Project Components (can be used as teams):\n');
    
    const componentsResponse = await fetch(`${JIRA_CONFIG.instanceUrl}/rest/api/3/project/${JIRA_CONFIG.projectKey}/components`, {
      headers: {
        'Authorization': getAuthHeader(),
        'Accept': 'application/json'
      }
    });
    
    if (componentsResponse.ok) {
      const components = await componentsResponse.json() as any[];
      if (components.length > 0) {
        console.log('Available components:');
        components.forEach((comp: any) => {
          console.log(`   - ${comp.name} (ID: ${comp.id})`);
        });
      } else {
        console.log('   No components found. You may need to create components in JIRA.');
      }
    }
    
  } catch (error) {
    console.error('Error discovering fields:', error);
  }
}

// Execute discovery
discoverFields().catch(console.error);