#!/usr/bin/env tsx

// Script to identify additional items to migrate to JIRA

import fetch from 'node-fetch';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

interface AdditionalJiraItem {
  type: 'Bug' | 'Technical Debt' | 'Security Finding' | 'Performance Issue' | 'Learning' | 'Daily Activity';
  summary: string;
  description: string;
  labels: string[];
  priority: 'High' | 'Medium' | 'Low';
  source: string;
}

const additionalItems: AdditionalJiraItem[] = [];

// 1. Check for technical debt in markdown files
function scanMarkdownFiles() {
  console.log('🔍 Scanning markdown files for technical debt...');
  
  const mdFiles = readdirSync('.').filter(f => f.endsWith('.md'));
  
  mdFiles.forEach(file => {
    try {
      const content = readFileSync(file, 'utf-8');
      
      // Look for technical debt sections
      if (content.includes('Technical Debt') || content.includes('TODO') || content.includes('FIXME')) {
        const lines = content.split('\n');
        lines.forEach(line => {
          if (line.includes('TODO:') || line.includes('FIXME:') || line.includes('Technical Debt:')) {
            additionalItems.push({
              type: 'Technical Debt',
              summary: line.replace(/^.*?(TODO:|FIXME:|Technical Debt:)\s*/, '').substring(0, 100),
              description: `Found in ${file}: ${line}`,
              labels: ['40x20s', 'technical-debt', 'from-documentation'],
              priority: line.includes('CRITICAL') ? 'High' : 'Medium',
              source: file
            });
          }
        });
      }
    } catch (error) {
      // Skip files that can't be read
    }
  });
}

// 2. Check for security findings from compliance reports
function scanSecurityFindings() {
  console.log('🔍 Scanning for security findings...');
  
  // From the compliance audit logs, we know these issues exist
  const securityFindings = [
    {
      summary: 'SOC 2 Type II readiness below 75%',
      description: 'Enterprise data handling below acceptable threshold. Current compliance score: 74%',
      priority: 'High' as const
    },
    {
      summary: 'Enable Redis for production caching',
      description: 'Redis connection errors present, falling back to in-memory cache which affects performance',
      priority: 'Medium' as const
    },
    {
      summary: 'Implement proper error tracking with Sentry',
      description: 'Sentry integration exists but needs proper configuration and error monitoring setup',
      priority: 'Medium' as const
    }
  ];
  
  securityFindings.forEach(finding => {
    additionalItems.push({
      type: 'Security Finding',
      ...finding,
      labels: ['40x20s', 'security', 'compliance'],
      source: 'compliance-audit'
    });
  });
}

// 3. Check for performance issues
function scanPerformanceIssues() {
  console.log('🔍 Scanning for performance issues...');
  
  // Known performance issues from the logs
  const performanceIssues = [
    {
      summary: 'Render time exceeds 3s target (currently ~13s)',
      description: 'Despite optimizations, initial render time is 13.17s. Target is <3s. Need further optimization.',
      priority: 'High' as const
    },
    {
      summary: 'Long tasks detected (>50ms)',
      description: 'Multiple long tasks detected: 134ms, 97ms, 74ms, 52ms. These block main thread.',
      priority: 'Medium' as const
    },
    {
      summary: 'Google Maps loaded without async',
      description: 'Google Maps JavaScript API loaded directly without loading=async, causing suboptimal performance',
      priority: 'Low' as const
    },
    {
      summary: 'Bundle size optimization needed',
      description: 'Profile page bundle is 31MB. Need code splitting and lazy loading improvements.',
      priority: 'Medium' as const
    }
  ];
  
  performanceIssues.forEach(issue => {
    additionalItems.push({
      type: 'Performance Issue',
      ...issue,
      labels: ['40x20s', 'performance', 'optimization'],
      source: 'performance-monitoring'
    });
  });
}

// 4. Check for bugs from recent issues
function scanKnownBugs() {
  console.log('🔍 Scanning for known bugs...');
  
  const knownBugs = [
    {
      summary: 'Elasticsearch connection refused errors',
      description: 'Elasticsearch not available: connect ECONNREFUSED 127.0.0.1:9200',
      priority: 'Low' as const
    },
    {
      summary: 'Browser cache causing stale UI issues',
      description: 'Service worker aggressive caching sometimes shows old UI despite updates',
      priority: 'Medium' as const
    },
    {
      summary: 'Memory leak in performance monitoring',
      description: 'Memory cleanup runs every 30s but some components may still leak memory',
      priority: 'Medium' as const
    }
  ];
  
  knownBugs.forEach(bug => {
    additionalItems.push({
      type: 'Bug',
      ...bug,
      labels: ['40x20s', 'bug', 'needs-fix'],
      source: 'error-logs'
    });
  });
}

// 5. Extract Life CEO learnings for improvement tickets
function extractLifeCEOLearnings() {
  console.log('🔍 Extracting Life CEO learnings for improvements...');
  
  const learnings = [
    {
      summary: 'Implement automatic field mapping validation',
      description: 'Life CEO learned to auto-detect client-server field mismatches. This should be built into the system.',
      priority: 'Medium' as const
    },
    {
      summary: 'Add resilient service patterns',
      description: 'Implement automatic Redis fallback to in-memory caching pattern across all services',
      priority: 'Medium' as const
    },
    {
      summary: 'Create design consistency checker',
      description: 'Maintain MT ocean theme automatically during debugging and development',
      priority: 'Low' as const
    }
  ];
  
  learnings.forEach(learning => {
    additionalItems.push({
      type: 'Learning',
      ...learning,
      labels: ['40x20s', 'life-ceo', 'improvement'],
      source: 'life-ceo-learnings'
    });
  });
}

// Run all scanners
async function main() {
  console.log('🚀 Identifying additional items for JIRA migration...\n');
  
  scanMarkdownFiles();
  scanSecurityFindings();
  scanPerformanceIssues();
  scanKnownBugs();
  extractLifeCEOLearnings();
  
  console.log(`\n📊 Summary of additional items found:`);
  console.log(`  - Bugs: ${additionalItems.filter(i => i.type === 'Bug').length}`);
  console.log(`  - Technical Debt: ${additionalItems.filter(i => i.type === 'Technical Debt').length}`);
  console.log(`  - Security Findings: ${additionalItems.filter(i => i.type === 'Security Finding').length}`);
  console.log(`  - Performance Issues: ${additionalItems.filter(i => i.type === 'Performance Issue').length}`);
  console.log(`  - Life CEO Learnings: ${additionalItems.filter(i => i.type === 'Learning').length}`);
  console.log(`  - Total: ${additionalItems.length}\n`);
  
  // Display all items
  console.log('📋 Detailed list of additional items:\n');
  additionalItems.forEach((item, index) => {
    console.log(`${index + 1}. [${item.type}] ${item.summary}`);
    console.log(`   Priority: ${item.priority}`);
    console.log(`   Labels: ${item.labels.join(', ')}`);
    console.log(`   Source: ${item.source}`);
    console.log(`   Description: ${item.description.substring(0, 100)}...`);
    console.log('');
  });
  
  // Ask if user wants to create these in JIRA
  console.log('\n💡 These items can be created in JIRA as additional tasks.');
  console.log('   Run `npx tsx scripts/create-additional-jira-items.ts` to create them.');
}

main();