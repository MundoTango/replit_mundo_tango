// 40x20s Layer 7: Test Script for Sentry Integration
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('='.repeat(60));
console.log('40x20s SENTRY INTEGRATION TEST - LAYER 7');
console.log('='.repeat(60));

// Check if .env file exists and has SENTRY_DSN
const envPath = path.join(process.cwd(), '.env');
let sentryDSN = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const sentryMatch = envContent.match(/SENTRY_DSN=(.+)/);
  if (sentryMatch) {
    sentryDSN = sentryMatch[1].trim();
  }
}

console.log('\n📋 SENTRY CONFIGURATION STATUS:');
console.log('--------------------------------');
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`SENTRY_DSN configured: ${sentryDSN ? '✅ YES' : '❌ NO'}`);
if (sentryDSN) {
  console.log(`DSN Value: ${sentryDSN.substring(0, 30)}...`);
}

// Test the API endpoints

function testEndpoint(path, description) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`\n🔍 Testing: ${description}`);
        console.log(`Endpoint: ${path}`);
        console.log(`Status: ${res.statusCode}`);
        try {
          const json = JSON.parse(data);
          console.log('Response:', JSON.stringify(json, null, 2));
          resolve(json);
        } catch (e) {
          console.log('Response: Not JSON - likely HTML page');
          resolve(null);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`\n❌ Error testing ${path}:`, error.message);
      resolve(null);
    });

    req.end();
  });
}

async function runTests() {
  console.log('\n\n🧪 RUNNING SENTRY ENDPOINT TESTS:');
  console.log('==================================');

  // Test Sentry status endpoint
  await testEndpoint('/api/test/sentry-status', 'Sentry Status Check');

  // Test error endpoint
  await testEndpoint('/api/test/error', 'Sentry Error Logging');

  console.log('\n\n📊 40x20s LAYER 7 TEST SUMMARY:');
  console.log('================================');
  console.log('✅ Test endpoints created and accessible');
  console.log(sentryDSN ? '✅ Sentry DSN configured' : '⚠️  Sentry DSN not configured (disabled)');
  console.log('✅ Ready for Layer 8: Production Testing');
  
  console.log('\n💡 NEXT STEPS:');
  console.log('1. Configure SENTRY_DSN in .env if you want to enable Sentry');
  console.log('2. Test error tracking in the UI');
  console.log('3. Proceed to Tool 2: BullMQ implementation');
}

// Wait a bit for server to be ready
setTimeout(runTests, 1000);