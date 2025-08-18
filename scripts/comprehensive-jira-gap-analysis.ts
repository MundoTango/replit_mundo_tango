#!/usr/bin/env tsx

// Comprehensive script to analyze gap between "The Plan" and JIRA

import { comprehensiveProjectData, ProjectItem } from '../client/src/data/comprehensive-project-data.js';
import fetch from 'node-fetch';
import fs from 'fs';

// Track what we've already created in JIRA
const existingJiraItems = {
  epics: 25, // KAN-1 to KAN-25
  stories: 48, // KAN-26 to KAN-73
  tasks: 14, // KAN-74 to KAN-87
  additionalItems: 13, // KAN-88 to KAN-100
  total: 100
};

interface FlattenedItem {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  completion: number;
  priority: string;
  team: string[];
  level: number;
  parentPath: string;
}

// Flatten the hierarchical structure to analyze all items
function flattenProjectData(items: ProjectItem[], level = 0, parentPath = ''): FlattenedItem[] {
  const flattened: FlattenedItem[] = [];
  
  for (const item of items) {
    const currentPath = parentPath ? `${parentPath} > ${item.title}` : item.title;
    
    flattened.push({
      id: item.id,
      title: item.title,
      description: item.description,
      type: item.type,
      status: item.status,
      completion: item.completion || 0,
      priority: item.priority,
      team: item.team || [],
      level,
      parentPath
    });
    
    if (item.children && item.children.length > 0) {
      flattened.push(...flattenProjectData(item.children, level + 1, currentPath));
    }
  }
  
  return flattened;
}

// Count items by type
function countByType(items: FlattenedItem[]): Record<string, number> {
  const counts: Record<string, number> = {};
  
  for (const item of items) {
    counts[item.type] = (counts[item.type] || 0) + 1;
  }
  
  return counts;
}

// Count items by status
function countByStatus(items: FlattenedItem[]): Record<string, number> {
  const counts: Record<string, number> = {};
  
  for (const item of items) {
    counts[item.status] = (counts[item.status] || 0) + 1;
  }
  
  return counts;
}

// Find recent work items (based on completion and status)
function findRecentWork(items: FlattenedItem[]): FlattenedItem[] {
  return items.filter(item => {
    // Recently completed items
    if (item.status === 'Completed' && item.completion === 100) {
      return true;
    }
    // In progress items
    if (item.status === 'In Progress') {
      return true;
    }
    // Blocked items that need attention
    if (item.status === 'Blocked') {
      return true;
    }
    return false;
  });
}

// Identify items likely missing from JIRA
function identifyMissingItems(items: FlattenedItem[]): FlattenedItem[] {
  // Filter out items that are likely already in JIRA based on our main export
  const potentiallyMissing: FlattenedItem[] = [];
  
  // Look for specific patterns that indicate recent work not in JIRA
  for (const item of items) {
    // Skip platform-level items (these are epics we already created)
    if (item.type === 'Platform' && item.level === 0) continue;
    
    // Look for specific features and tasks that seem recent
    const isRecentWork = 
      item.title.includes('40x20s') ||
      item.title.includes('JIRA') ||
      item.title.includes('Daily Activity') ||
      item.title.includes('Beautiful') ||
      item.title.includes('Micro-Interactions') ||
      item.title.includes('Performance') ||
      item.title.includes('Profile') ||
      item.title.includes('Comprehensive') ||
      item.status === 'In Progress' ||
      item.status === 'Blocked';
    
    if (isRecentWork) {
      potentiallyMissing.push(item);
    }
  }
  
  return potentiallyMissing;
}

// Main analysis
async function main() {
  console.log('🔍 Comprehensive JIRA Gap Analysis\n');
  console.log('📊 Current JIRA Status:');
  console.log(`  - Total items in JIRA: ${existingJiraItems.total}`);
  console.log(`  - Epics: ${existingJiraItems.epics}`);
  console.log(`  - Stories: ${existingJiraItems.stories}`);
  console.log(`  - Tasks: ${existingJiraItems.tasks}`);
  console.log(`  - Additional items: ${existingJiraItems.additionalItems}\n`);
  
  // Flatten all project data
  const allItems = flattenProjectData(comprehensiveProjectData);
  
  console.log('📈 "The Plan" Analysis:');
  console.log(`  - Total items in comprehensive data: ${allItems.length}`);
  
  // Count by type
  const typeCounts = countByType(allItems);
  console.log('\n  By Type:');
  Object.entries(typeCounts).forEach(([type, count]) => {
    console.log(`    - ${type}: ${count}`);
  });
  
  // Count by status
  const statusCounts = countByStatus(allItems);
  console.log('\n  By Status:');
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`    - ${status}: ${count}`);
  });
  
  // Find recent work
  const recentWork = findRecentWork(allItems);
  console.log(`\n  Recent/Active Work: ${recentWork.length} items`);
  
  // Identify potentially missing items
  const missingItems = identifyMissingItems(allItems);
  console.log(`\n🚨 Potentially Missing from JIRA: ${missingItems.length} items`);
  
  // Display missing items grouped by type
  console.log('\n📋 Missing Items by Type:\n');
  
  const missingByType: Record<string, FlattenedItem[]> = {};
  for (const item of missingItems) {
    if (!missingByType[item.type]) {
      missingByType[item.type] = [];
    }
    missingByType[item.type].push(item);
  }
  
  Object.entries(missingByType).forEach(([type, items]) => {
    console.log(`${type} (${items.length} items):`);
    items.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.title}`);
      console.log(`     Status: ${item.status}, Completion: ${item.completion}%`);
      console.log(`     Path: ${item.parentPath}`);
      console.log(`     Description: ${item.description.substring(0, 100)}...`);
      console.log('');
    });
  });
  
  // Summary
  console.log('\n📊 Gap Analysis Summary:');
  console.log(`  - Items in "The Plan": ${allItems.length}`);
  console.log(`  - Items in JIRA: ${existingJiraItems.total}`);
  console.log(`  - Gap: ${allItems.length - existingJiraItems.total} items`);
  console.log(`  - High-priority missing items: ${missingItems.length}`);
  
  // Export missing items to JSON for next step
  fs.writeFileSync(
    'scripts/missing-jira-items.json',
    JSON.stringify({ missingItems, summary: { total: missingItems.length, byType: typeCounts }}, null, 2)
  );
  
  console.log('\n💾 Missing items exported to scripts/missing-jira-items.json');
  console.log('   Run `npx tsx scripts/create-missing-jira-items.ts` to create them in JIRA');
}

main();