#!/usr/bin/env tsx
// ESA-44x21 JIRA Synchronization CLI Script
// Execute directly to push all compliance items to JIRA

import { jiraIntegrationService } from '../server/services/jiraIntegrationService';

async function runJiraSync() {
  console.log('=== ESA-44x21 JIRA Synchronization ===');
  console.log('Starting at:', new Date().toISOString());
  console.log('');
  
  try {
    // Check environment variables
    if (!process.env.JIRA_API_TOKEN || !process.env.JIRA_EMAIL || !process.env.JIRA_DOMAIN) {
      console.error('❌ Missing JIRA credentials. Please ensure these environment variables are set:');
      console.error('   - JIRA_API_TOKEN');
      console.error('   - JIRA_EMAIL'); 
      console.error('   - JIRA_DOMAIN');
      process.exit(1);
    }

    console.log('✅ JIRA credentials found');
    console.log(`📌 Target domain: ${process.env.JIRA_DOMAIN}`);
    console.log(`📧 Using email: ${process.env.JIRA_EMAIL}`);
    console.log('');
    
    // Execute the sync
    console.log('🚀 Starting synchronization...');
    console.log('This will create:');
    console.log('- 1 Master Epic');
    console.log('- 44 Layer Epics');
    console.log('- Up to 924 Phase Stories (21 per layer)');
    console.log('');
    
    const result = await jiraIntegrationService.pushESAComplianceToJira();
    
    console.log('');
    console.log('=== Synchronization Complete ===');
    console.log(`✅ Success: ${result.success}`);
    console.log(`📊 Summary:`);
    console.log(`   - Epics Created: ${result.summary.totalEpics}`);
    console.log(`   - Stories Created: ${result.summary.totalStories}`);
    console.log(`   - Epics Failed: ${result.summary.epicsFailed}`);
    console.log(`   - Stories Failed: ${result.summary.storiesFailed}`);
    console.log('');
    console.log('Completed at:', new Date().toISOString());
    
    if (!result.success) {
      console.log('⚠️  Some items failed to sync. Check logs above for details.');
      process.exit(1);
    }
    
    console.log('🎉 All ESA-44x21 compliance items successfully pushed to JIRA!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Visit your JIRA project to view the created items');
    console.log('2. Assign team members to critical P0 tasks');
    console.log('3. Begin Sprint 1 focusing on security fixes');
    
  } catch (error) {
    console.error('');
    console.error('❌ Fatal error during synchronization:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runJiraSync();
}