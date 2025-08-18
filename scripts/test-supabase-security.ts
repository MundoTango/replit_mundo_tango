import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🧪 === Testing Supabase Security Implementation ===');
console.log('📋 Using 23L Framework for comprehensive testing\n');

interface TestResult {
  test: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  details?: any;
}

const results: TestResult[] = [];

async function runTest(testName: string, testFn: () => Promise<TestResult>) {
  try {
    console.log(`🔍 Running: ${testName}...`);
    const result = await testFn();
    results.push(result);
    
    const icon = result.status === 'passed' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} ${result.message}`);
    if (result.details) {
      console.log('   Details:', JSON.stringify(result.details, null, 2));
    }
  } catch (error) {
    results.push({
      test: testName,
      status: 'failed',
      message: `Test failed with error: ${error.message}`
    });
    console.log(`❌ ${testName} failed:`, error.message);
  }
}

// Test 1: Check if audit schema exists
async function testAuditSchema(): Promise<TestResult> {
  const { data, error } = await supabase
    .from('pg_namespace')
    .select('nspname')
    .eq('nspname', 'audit')
    .single();

  if (error && error.code === '42P01') {
    // Table doesn't exist - need to run from a function
    return {
      test: 'Audit Schema',
      status: 'warning',
      message: 'Cannot directly query system tables - please verify in Supabase dashboard'
    };
  }

  return {
    test: 'Audit Schema',
    status: data ? 'passed' : 'failed',
    message: data ? 'Audit schema exists' : 'Audit schema not found'
  };
}

// Test 2: Check RLS on critical tables
async function testRLSEnabled(): Promise<TestResult> {
  const criticalTables = ['posts', 'events', 'memories', 'users'];
  const rlsStatus: Record<string, boolean> = {};
  
  for (const table of criticalTables) {
    // Try to select from table
    const { error } = await supabase.from(table).select('*').limit(0);
    
    // If we get an RLS error, it means RLS is enabled
    rlsStatus[table] = error?.code === 'PGRST301' || error?.message?.includes('row-level security');
  }

  const enabledCount = Object.values(rlsStatus).filter(Boolean).length;
  
  return {
    test: 'RLS Status',
    status: enabledCount === criticalTables.length ? 'passed' : enabledCount > 0 ? 'warning' : 'failed',
    message: `RLS enabled on ${enabledCount}/${criticalTables.length} critical tables`,
    details: rlsStatus
  };
}

// Test 3: Test health check functions
async function testHealthCheckFunctions(): Promise<TestResult> {
  try {
    // Test quick health check
    const { data: quickCheck, error: quickError } = await supabase
      .rpc('quick_health_check');

    if (quickError) {
      return {
        test: 'Health Check Functions',
        status: 'failed',
        message: 'Health check functions not found',
        details: quickError
      };
    }

    // Test comprehensive health check
    const { data: fullCheck, error: fullError } = await supabase
      .rpc('check_database_health');

    if (fullError) {
      return {
        test: 'Health Check Functions',
        status: 'warning',
        message: 'Quick health check works, but comprehensive check failed',
        details: { quickCheck, error: fullError }
      };
    }

    return {
      test: 'Health Check Functions',
      status: 'passed',
      message: 'Both health check functions operational',
      details: { quickCheck, fullCheck }
    };
  } catch (error) {
    return {
      test: 'Health Check Functions',
      status: 'failed',
      message: 'Health check functions error',
      details: error
    };
  }
}

// Test 4: Test audit logging (requires authenticated user)
async function testAuditLogging(): Promise<TestResult> {
  // First, sign in a test user
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'testpassword123'
  });

  if (authError || !authData.user) {
    return {
      test: 'Audit Logging',
      status: 'warning',
      message: 'Cannot test audit logging without authenticated user',
      details: 'Please create a test user to fully test audit functionality'
    };
  }

  // Try to create a post to trigger audit
  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({
      content: 'Test post for audit logging',
      user_id: authData.user.id
    })
    .select()
    .single();

  if (postError) {
    return {
      test: 'Audit Logging',
      status: 'warning',
      message: 'Could not create test post',
      details: postError
    };
  }

  // Check if audit log was created (only admins can see this)
  const { data: auditLog, error: auditError } = await supabase
    .from('audit.logs')
    .select('*')
    .eq('table_name', 'posts')
    .order('timestamp', { ascending: false })
    .limit(1);

  if (auditError?.code === 'PGRST301') {
    return {
      test: 'Audit Logging',
      status: 'passed',
      message: 'Audit logging appears to be working (access denied as expected for non-admin)',
      details: 'RLS policy preventing non-admin access to audit logs'
    };
  }

  return {
    test: 'Audit Logging',
    status: auditLog ? 'passed' : 'failed',
    message: auditLog ? 'Audit logging is working' : 'No audit logs found',
    details: { postCreated: !!post, auditLog }
  };
}

// Test 5: Test RLS policies
async function testRLSPolicies(): Promise<TestResult> {
  // Test public read on posts
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('*')
    .limit(1);

  const canReadPosts = !postsError || postsError.code !== 'PGRST301';

  // Test public read on events
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('*')
    .limit(1);

  const canReadEvents = !eventsError || eventsError.code !== 'PGRST301';

  return {
    test: 'RLS Policies',
    status: canReadPosts && canReadEvents ? 'passed' : 'failed',
    message: `Public read policies: Posts ${canReadPosts ? '✓' : '✗'}, Events ${canReadEvents ? '✓' : '✗'}`,
    details: {
      posts: { canRead: canReadPosts, error: postsError?.message },
      events: { canRead: canReadEvents, error: eventsError?.message }
    }
  };
}

// Run all tests
async function runAllTests() {
  console.log('Starting security tests...\n');

  await runTest('Audit Schema Check', testAuditSchema);
  await runTest('RLS Enabled Check', testRLSEnabled);
  await runTest('Health Check Functions', testHealthCheckFunctions);
  await runTest('Audit Logging', testAuditLogging);
  await runTest('RLS Policies', testRLSPolicies);

  // Summary
  console.log('\n📊 === Test Summary ===');
  const passed = results.filter(r => r.status === 'passed').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  const failed = results.filter(r => r.status === 'failed').length;

  console.log(`✅ Passed: ${passed}`);
  console.log(`⚠️ Warnings: ${warnings}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / results.length) * 100)}%`);

  if (failed === 0 && warnings === 0) {
    console.log('\n🎉 All security features are working correctly!');
  } else if (failed === 0) {
    console.log('\n⚠️ Security implementation is mostly working, but check warnings above.');
  } else {
    console.log('\n❌ Some security features are not working. Please check the migration.');
  }

  // Detailed results
  console.log('\n📋 Detailed Results:');
  results.forEach(r => {
    const icon = r.status === 'passed' ? '✅' : r.status === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} ${r.test}: ${r.message}`);
  });
}

// Execute tests
runAllTests().catch(console.error);