#!/usr/bin/env tsx
// JIRA Team Setup Script - 40x20s Framework
// Run with: npx tsx scripts/jira-team-setup.ts

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const JIRA_DOMAIN = process.env.JIRA_DOMAIN || 'mundotango-team.atlassian.net';
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const PROJECT_KEY = 'MT';

if (!JIRA_EMAIL || !JIRA_API_TOKEN) {
  console.error('❌ Missing JIRA credentials. Please set JIRA_EMAIL and JIRA_API_TOKEN in .env');
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

// 40x20s Framework Teams Definition
const teams = [
  {
    name: 'Frontend Team',
    description: 'UI/UX, React components, user interfaces (Layers 7-8)',
    layers: [7, 8],
    color: '#3498db' // Blue
  },
  {
    name: 'Backend Team',
    description: 'APIs, services, business logic implementation (Layers 5-6)',
    layers: [5, 6],
    color: '#2ecc71' // Green
  },
  {
    name: 'Database Team',
    description: 'Schema design, migrations, query optimization (Layers 2-4)',
    layers: [2, 3, 4],
    color: '#e74c3c' // Red
  },
  {
    name: 'API Team',
    description: 'REST endpoints, GraphQL, third-party integrations (Layer 6)',
    layers: [6],
    color: '#f39c12' // Orange
  },
  {
    name: 'Infrastructure Team',
    description: 'Deployment, scaling, server management (Layers 9-10)',
    layers: [9, 10],
    color: '#9b59b6' // Purple
  },
  {
    name: 'Business Logic Team',
    description: 'Domain logic, business rules, workflow automation (Layer 6)',
    layers: [6],
    color: '#1abc9c' // Turquoise
  },
  {
    name: 'Product Team',
    description: 'Requirements, user stories, product roadmap (Layer 1)',
    layers: [1],
    color: '#34495e' // Dark Gray
  },
  {
    name: 'Media Team',
    description: 'Image/video processing, CDN, media optimization (Layer 8)',
    layers: [8],
    color: '#e67e22' // Carrot
  },
  {
    name: 'DevOps Team',
    description: 'CI/CD pipelines, automation, deployment (Layers 9-10)',
    layers: [9, 10],
    color: '#95a5a6' // Silver
  },
  {
    name: 'Analytics Team',
    description: 'Metrics, reporting, business insights (Layer 11)',
    layers: [11],
    color: '#d35400' // Pumpkin
  },
  {
    name: 'QA Team',
    description: 'Testing, quality assurance, test automation (Layer 12)',
    layers: [12],
    color: '#c0392b' // Pomegranate
  },
  {
    name: 'Security Team',
    description: 'Authentication, encryption, compliance (Layers 13-14)',
    layers: [13, 14],
    color: '#8e44ad' // Wisteria
  },
  {
    name: 'Performance Team',
    description: 'Optimization, caching, load testing (Layer 15)',
    layers: [15],
    color: '#27ae60' // Nephritis
  },
  {
    name: 'AI Team',
    description: 'Life CEO AI, machine learning features (Layers 16-20)',
    layers: [16, 17, 18, 19, 20],
    color: '#2980b9' // Belize Hole
  }
];

async function createComponent(team: any) {
  try {
    const response = await jiraClient.post('/component', {
      name: team.name,
      description: team.description,
      project: PROJECT_KEY,
      leadAccountId: null // Will be set manually
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400 && error.response?.data?.errors?.name) {
      console.log(`⚠️  Component "${team.name}" already exists`);
      return null;
    }
    throw error;
  }
}

async function createLabel(layerNumber: number) {
  const labelName = `layer-${layerNumber}`;
  try {
    // JIRA doesn't have a direct API to create labels
    // Labels are created when first used on an issue
    return labelName;
  } catch (error) {
    console.error(`Error with label ${labelName}:`, error);
    return null;
  }
}

async function createCustomField(name: string, description: string) {
  try {
    // Note: Creating custom fields requires JIRA admin permissions
    // This is typically done through UI, not API
    console.log(`ℹ️  Custom field "${name}" should be created manually in JIRA admin`);
  } catch (error) {
    console.error(`Error creating custom field ${name}:`, error);
  }
}

async function setupJiraTeams() {
  console.log('🚀 Starting JIRA 40x20s Team Setup...\n');

  // Step 1: Create Components (Teams)
  console.log('📦 Creating Team Components...');
  for (const team of teams) {
    const component = await createComponent(team);
    if (component) {
      console.log(`✅ Created component: ${team.name}`);
    }
  }

  // Step 2: Create Labels for Layers
  console.log('\n🏷️  Setting up Layer Labels...');
  const uniqueLayers = [...new Set(teams.flatMap(t => t.layers))].sort((a, b) => a - b);
  for (const layer of uniqueLayers) {
    const label = await createLabel(layer);
    if (label) {
      console.log(`✅ Layer ${layer} label ready: ${label}`);
    }
  }

  // Step 3: Create Sample Issues for Testing
  console.log('\n📝 Creating Sample Issues...');
  const sampleIssues = [
    {
      summary: 'Setup Redis lazy initialization pattern',
      description: 'Implement lazy initialization for Redis connections based on Life CEO learnings',
      component: 'Backend Team',
      labels: ['layer-5', 'performance', 'redis']
    },
    {
      summary: 'Create JIRA integration dashboard',
      description: 'Build React dashboard for JIRA integration in Admin Center',
      component: 'Frontend Team',
      labels: ['layer-7', 'integration', 'admin']
    },
    {
      summary: 'Optimize database connection pooling',
      description: 'Implement connection pooling optimizations from 40x20s framework',
      component: 'Database Team',
      labels: ['layer-3', 'performance', 'optimization']
    }
  ];

  for (const issue of sampleIssues) {
    try {
      const response = await jiraClient.post('/issue', {
        fields: {
          project: { key: PROJECT_KEY },
          summary: issue.summary,
          description: {
            type: 'doc',
            version: 1,
            content: [{
              type: 'paragraph',
              content: [{
                type: 'text',
                text: issue.description
              }]
            }]
          },
          issuetype: { name: 'Task' },
          components: [{ name: issue.component }],
          labels: issue.labels
        }
      });
      console.log(`✅ Created issue: ${response.data.key} - ${issue.summary}`);
    } catch (error: any) {
      console.error(`❌ Failed to create issue: ${issue.summary}`, error.response?.data || error.message);
    }
  }

  // Step 4: Create Automation Rules (via API is limited, provide instructions)
  console.log('\n🤖 Automation Setup Instructions:');
  console.log('1. Go to Project Settings → Automation');
  console.log('2. Create rule: "Auto-assign Frontend issues to Frontend Team"');
  console.log('3. Create rule: "Move to In Progress on commit"');
  console.log('4. Create rule: "Move to Review on PR creation"');

  // Step 5: GitHub Integration Instructions
  console.log('\n🔗 GitHub Integration Instructions:');
  console.log('1. Install GitHub for JIRA: https://marketplace.atlassian.com/apps/1219592/github-for-jira');
  console.log('2. Connect your GitHub organization');
  console.log('3. Select the mundo-tango repository');
  console.log('4. Test with commit: git commit -m "MT-1 Test integration"');

  console.log('\n✨ JIRA 40x20s Team Setup Complete!');
  console.log('\n📊 Next Steps:');
  console.log('- Assign team leads to each component');
  console.log('- Create team-specific dashboards');
  console.log('- Configure team notifications');
  console.log('- Set up team velocity tracking');
}

// Run the setup
setupJiraTeams().catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});