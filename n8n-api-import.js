const fs = require('fs');
const https = require('https');

const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzOWU1MzM0My1jNjFjLTQwNDgtYjk3Yy0xYjlhMmY5YWE3NTAiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NTY3NTA5fQ.lM4vlCf-Wtk02zTCvJaIh3ioDco12-ui7P2lfrHwOGo";
const BASE_URL = "mundotango.app.n8n.cloud";

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      path: `/api/v1${path}`,
      method: method,
      headers: {
        'X-N8N-API-KEY': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function importWorkflows() {
  console.log('🚀 ESA: Advanced n8n Import Process');
  console.log('=====================================\n');

  const workflows = [
    'n8n-workflows/complete/user-registration-hubspot.json',
    'n8n-workflows/complete/payment-processing-stripe.json',
    'n8n-workflows/complete/testsprite-results-processor.json',
    'n8n-workflows/complete/daily-analytics-report.json'
  ];

  for (const file of workflows) {
    try {
      console.log(`📦 Processing: ${file}`);
      const workflow = JSON.parse(fs.readFileSync(file, 'utf8'));
      
      // Clean up the workflow for API
      const cleanWorkflow = {
        name: workflow.name,
        nodes: workflow.nodes || [],
        connections: workflow.connections || {},
        settings: workflow.settings || {},
        active: false
      };
      
      // Try to create the workflow
      const response = await makeRequest('POST', '/workflows', cleanWorkflow);
      
      if (response.id) {
        console.log(`✅ Created: ${workflow.name}`);
        console.log(`   ID: ${response.id}`);
        console.log(`   URL: https://${BASE_URL}/workflow/${response.id}\n`);
      } else {
        console.log(`❌ Failed: ${JSON.stringify(response)}\n`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}\n`);
    }
  }
  
  console.log('=====================================');
  console.log('✅ ESA Import Process Complete!');
}

importWorkflows();
