#!/usr/bin/env tsx
/**
 * ESA Admin Center Comprehensive Testing Script
 * Tests all endpoints, features, and functionality
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

interface TestResult {
  endpoint: string;
  status: number;
  success: boolean;
  error?: string;
  data?: any;
}

const testResults: TestResult[] = [];

async function testEndpoint(endpoint: string, options: any = {}): Promise<void> {
  try {
    console.log(`Testing: ${endpoint}`);
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    const text = await response.text();
    let data: any;
    
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    
    testResults.push({
      endpoint,
      status: response.status,
      success: response.ok,
      data: response.ok ? 'Data received' : data,
      error: !response.ok ? `HTTP ${response.status}` : undefined
    });
    
    console.log(`  Status: ${response.status} ${response.ok ? '✅' : '❌'}`);
  } catch (error: any) {
    testResults.push({
      endpoint,
      status: 0,
      success: false,
      error: error.message
    });
    console.log(`  Error: ${error.message} ❌`);
  }
}

async function runAllTests() {
  console.log('🧪 ESA Admin Center Comprehensive Testing\n');
  console.log('Layer 1-5: Core Admin APIs\n');
  
  // Core Admin endpoints
  await testEndpoint('/api/admin/stats');
  await testEndpoint('/api/admin/compliance');
  await testEndpoint('/api/admin/system/health');
  await testEndpoint('/api/admin/settings');
  
  console.log('\nLayer 6-10: User & Content Management\n');
  
  // User management
  await testEndpoint('/api/admin/users?limit=5');
  await testEndpoint('/api/admin/users/1'); // Test specific user
  
  // Content moderation
  await testEndpoint('/api/admin/content/flagged');
  await testEndpoint('/api/admin/reports');
  
  console.log('\nLayer 11-15: Analytics & Events\n');
  
  // Analytics
  await testEndpoint('/api/admin/analytics');
  await testEndpoint('/api/admin/analytics/engagement');
  
  // Events
  await testEndpoint('/api/admin/events');
  await testEndpoint('/api/admin/events/featured');
  
  console.log('\nLayer 16-20: RBAC & Logs\n');
  
  // RBAC
  await testEndpoint('/api/admin/rbac/analytics');
  await testEndpoint('/api/admin/rbac/roles');
  
  // Logs
  await testEndpoint('/api/admin/logs?type=error&limit=10');
  await testEndpoint('/api/admin/logs/security');
  
  console.log('\nLayer 21-25: Subscription Management\n');
  
  // Subscription features
  await testEndpoint('/api/admin/subscription/feature-flags');
  await testEndpoint('/api/admin/subscription/analytics');
  await testEndpoint('/api/admin/subscription/tiers');
  
  console.log('\nLayer 26-30: Life CEO & Platform Features\n');
  
  // Life CEO
  await testEndpoint('/api/life-ceo/status');
  await testEndpoint('/api/life-ceo/learnings');
  
  // Global statistics
  await testEndpoint('/api/platform/statistics/live');
  
  // Project management
  await testEndpoint('/api/admin/project-data');
  await testEndpoint('/api/admin/daily-activities');
  
  // JIRA Export
  await testEndpoint('/api/admin/jira-export/stats');
  
  // Feature flags
  await testEndpoint('/api/admin/feature-flags');
  
  // Generate summary report
  console.log('\n📊 ESA Test Summary Report\n');
  
  const successCount = testResults.filter(r => r.success).length;
  const failureCount = testResults.filter(r => !r.success).length;
  const successRate = Math.round((successCount / testResults.length) * 100);
  
  console.log(`Total Endpoints Tested: ${testResults.length}`);
  console.log(`Successful: ${successCount} ✅`);
  console.log(`Failed: ${failureCount} ❌`);
  console.log(`Success Rate: ${successRate}%`);
  
  console.log('\n🔴 Failed Endpoints:\n');
  testResults
    .filter(r => !r.success)
    .forEach(r => {
      console.log(`- ${r.endpoint}: ${r.error || r.data}`);
    });
  
  console.log('\n✅ Successful Endpoints:\n');
  testResults
    .filter(r => r.success)
    .forEach(r => {
      console.log(`- ${r.endpoint}: HTTP ${r.status}`);
    });
    
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: testResults.length,
      successful: successCount,
      failed: failureCount,
      successRate: `${successRate}%`
    },
    results: testResults
  };
  
  require('fs').writeFileSync(
    'docs/ESA_ADMIN_TEST_RESULTS.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n📄 Detailed report saved to: docs/ESA_ADMIN_TEST_RESULTS.json');
}

// Run the tests
runAllTests().catch(console.error);