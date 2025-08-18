#!/usr/bin/env tsx
// Verify JIRA 40x20s Setup
// Run with: JIRA_EMAIL=admin@mundotango.life npx tsx scripts/verify-jira-setup.ts

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const JIRA_DOMAIN = process.env.JIRA_DOMAIN || 'mundotango-team.atlassian.net';
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const PROJECT_KEY = 'MT';

if (!JIRA_EMAIL || !JIRA_API_TOKEN) {
  console.error('❌ Missing JIRA credentials');
  process.exit(1);
}

const jiraClient = axios.create({
  baseURL: `https://${JIRA_DOMAIN}/rest/api/3`,
  auth: {
    username: JIRA_EMAIL,
    password: JIRA_API_TOKEN
  },
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

async function verifySetup() {
  console.log('🔍 Verifying JIRA 40x20s Setup...\n');

  // Check Components
  try {
    const response = await jiraClient.get(`/project/${PROJECT_KEY}/components`);
    const components = response.data;
    
    console.log(`✅ Found ${components.length} team components:`);
    components.forEach((comp: any) => {
      console.log(`   - ${comp.name}`);
    });
  } catch (error) {
    console.error('❌ Failed to fetch components:', error);
  }

  // Check if GitHub app is installed
  console.log('\n🔗 GitHub Integration Status:');
  console.log('   Manual check required - visit Project Settings → Apps');
  
  // Provide direct links
  console.log('\n📋 Direct Links:');
  console.log(`   Components: https://${JIRA_DOMAIN}/jira/settings/projects/${PROJECT_KEY}/components`);
  console.log(`   Apps: https://${JIRA_DOMAIN}/plugins/servlet/ac/com.github.integration.production/github-select-prorg-page`);
  console.log(`   Create Issue: https://${JIRA_DOMAIN}/jira/projects/${PROJECT_KEY}/issues/create`);
}

verifySetup().catch(console.error);