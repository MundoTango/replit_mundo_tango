import fetch from 'node-fetch';
import fs from 'fs';

/**
 * ESA Life CEO - Direct n8n Import via REST API
 * Alternative approach using n8n's REST API
 */

const apiKey = process.env.N8N_API_KEY;
const baseUrl = process.env.N8N_BASE_URL || 'https://mundotango.app.n8n.cloud';

console.log('🚀 ESA Direct n8n Import');
console.log('========================');
console.log(`Base URL: ${baseUrl}`);
console.log(`API Key: ${apiKey ? 'Present ✅' : 'Missing ❌'}`);

async function testAPIConnection() {
  try {
    console.log('\n📋 ESA Analysis: Testing API connection...');
    
    const response = await fetch(`${baseUrl}/rest/me`, {
      headers: {
        'X-N8N-API-KEY': apiKey,
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const user = await response.json();
      console.log('✅ API Connection successful');
      console.log('User:', user.email || user.id || 'Connected');
      return true;
    } else {
      console.log(`❌ API Connection failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ API Connection error: ${error.message}`);
    return false;
  }
}

async function importWorkflowDirect(workflowData) {
  try {
    console.log(`\n📥 Importing: ${workflowData.name}`);
    
    // Try the REST endpoint
    const response = await fetch(`${baseUrl}/rest/workflows`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(workflowData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Created workflow: ${result.name} (ID: ${result.id})`);
      return result;
    } else {
      const error = await response.text();
      console.log(`❌ Failed: ${response.status} - ${error}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return null;
  }
}

async function importAllWorkflows() {
  const workflows = [
    'user-registration-hubspot.json',
    'testsprite-results-processor.json', 
    'daily-analytics-report.json',
    'payment-processing.json'
  ];

  if (!await testAPIConnection()) {
    console.log('\n❌ Cannot connect to n8n API. Please check:');
    console.log('1. n8n instance is running');
    console.log('2. API key is correct');
    console.log('3. API access is enabled');
    return;
  }

  console.log('\n🎯 ESA Action: Starting workflow import...');
  
  const results = [];
  
  for (const workflowFile of workflows) {
    try {
      const filePath = `n8n-workflows/${workflowFile}`;
      
      if (!fs.existsSync(filePath)) {
        console.log(`❌ File not found: ${filePath}`);
        continue;
      }
      
      const workflowJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const result = await importWorkflowDirect(workflowJson);
      
      if (result) {
        results.push({
          name: result.name,
          id: result.id,
          status: 'success'
        });
      } else {
        results.push({
          name: workflowFile,
          status: 'failed'
        });
      }
      
      // Pause between imports
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`❌ Error processing ${workflowFile}: ${error.message}`);
      results.push({
        name: workflowFile,
        status: 'error',
        error: error.message
      });
    }
  }
  
  console.log('\n========================================');
  console.log('📊 Import Results Summary:');
  console.log('========================================');
  
  results.forEach(result => {
    if (result.status === 'success') {
      console.log(`✅ ${result.name} (ID: ${result.id})`);
    } else {
      console.log(`❌ ${result.name}: ${result.status}`);
    }
  });
  
  const successful = results.filter(r => r.status === 'success').length;
  console.log(`\n📈 Success Rate: ${successful}/${results.length} workflows`);
  
  if (successful > 0) {
    console.log('\n📝 Next Steps:');
    console.log('1. Go to: https://mundotango.app.n8n.cloud/workflows');
    console.log('2. Configure credentials for each imported workflow');
    console.log('3. Test the workflows');
    console.log('4. Activate when ready');
  }
}

// Run the import
importAllWorkflows().catch(console.error);