import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

/**
 * ESA Life CEO 53x21s - Layer 51 Automation
 * Automatically creates n8n workflows via API
 */

class N8NWorkflowCreator {
  constructor(apiKey, baseUrl) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || 'https://mundotango.app.n8n.cloud';
    this.headers = {
      'X-N8N-API-KEY': apiKey,
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Create a workflow in n8n - trying multiple API endpoints
   */
  async createWorkflow(workflowData) {
    const endpoints = [
      '/api/v1/workflows',
      '/rest/workflows',
      '/webhook/workflows',
      '/api/workflows'
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`🔍 Trying endpoint: ${this.baseUrl}${endpoint}`);
        
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify(workflowData)
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Created workflow: ${workflowData.name} via ${endpoint}`);
          return result;
        } else {
          console.log(`❌ ${endpoint} failed: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint} error: ${error.message}`);
      }
    }
    
    // If all endpoints fail, try the import method
    console.log('🔄 All direct creation methods failed, checking for import endpoint...');
    return await this.importWorkflow(workflowData);
  }

  /**
   * Import workflow via different method
   */
  async importWorkflow(workflowData) {
    const importEndpoints = [
      '/api/v1/workflows/import',
      '/rest/workflows/import',
      '/webhook/import',
      '/api/import'
    ];

    for (const endpoint of importEndpoints) {
      try {
        console.log(`🔍 Trying import endpoint: ${this.baseUrl}${endpoint}`);
        
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({ workflows: [workflowData] })
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Imported workflow: ${workflowData.name} via ${endpoint}`);
          return result;
        }
      } catch (error) {
        console.log(`❌ Import ${endpoint} error: ${error.message}`);
      }
    }

    throw new Error(`All API methods failed for workflow: ${workflowData.name}`);
  }

  /**
   * Activate a workflow
   */
  async activateWorkflow(workflowId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/workflows/${workflowId}/activate`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify({ active: true })
      });

      if (!response.ok) {
        throw new Error(`Failed to activate workflow ${workflowId}`);
      }

      console.log(`✅ Activated workflow: ${workflowId}`);
      return true;
    } catch (error) {
      console.error(`❌ Error activating workflow: ${error.message}`);
      return false;
    }
  }

  /**
   * Create all workflows from JSON files
   */
  async createAllWorkflows() {
    const workflows = [
      {
        file: 'user-registration-hubspot.json',
        name: 'User Registration to HubSpot',
        needsCredentials: ['hubspot', 'email', 'slack', 'googleSheets']
      },
      {
        file: 'testsprite-results-processor.json',
        name: 'TestSprite Results Processor',
        needsCredentials: ['postgres', 'jira', 'slack', 'email']
      },
      {
        file: 'daily-analytics-report.json',
        name: 'Daily Analytics Report',
        needsCredentials: ['postgres', 'googleSheets', 'email', 'slack', 'hubspot']
      },
      {
        file: 'payment-processing.json',
        name: 'Payment Processing',
        needsCredentials: ['stripe', 'postgres', 'hubspot', 'email', 'slack']
      }
    ];

    const results = [];
    
    for (const workflow of workflows) {
      console.log(`\n📋 Processing: ${workflow.name}`);
      
      try {
        // Read workflow JSON
        const filePath = path.join(process.cwd(), 'n8n-workflows', workflow.file);
        const workflowJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Create workflow
        const result = await this.createWorkflow(workflowJson);
        
        results.push({
          name: workflow.name,
          id: result.id,
          status: 'created',
          needsCredentials: workflow.needsCredentials
        });
        
        // Wait to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        results.push({
          name: workflow.name,
          status: 'failed',
          error: error.message
        });
      }
    }
    
    return results;
  }
}

/**
 * ESA Action: Auto-create workflows
 */
export async function autoCreateN8NWorkflows(apiKey) {
  console.log('🚀 ESA Life CEO - n8n Workflow Auto-Creation');
  console.log('===========================================');
  
  if (!apiKey) {
    console.error('❌ n8n API Key required!');
    console.log('\nTo get your API key:');
    console.log('1. Go to: https://mundotango.app.n8n.cloud/settings/api');
    console.log('2. Create an API key');
    console.log('3. Add to your environment: N8N_API_KEY=your-key');
    return null;
  }

  const creator = new N8NWorkflowCreator(apiKey);
  
  console.log('\n📊 ESA Analysis: Found 4 workflows to create');
  console.log('📋 ESA Solution: Creating via n8n API');
  console.log('🎯 ESA Action: Starting auto-creation...\n');
  
  const results = await creator.createAllWorkflows();
  
  console.log('\n===========================================');
  console.log('📊 Results Summary:');
  console.log('===========================================');
  
  results.forEach(result => {
    if (result.status === 'created') {
      console.log(`✅ ${result.name}`);
      console.log(`   ID: ${result.id}`);
      console.log(`   Needs: ${result.needsCredentials.join(', ')}`);
    } else {
      console.log(`❌ ${result.name}: ${result.error}`);
    }
  });
  
  console.log('\n📝 Next Steps:');
  console.log('1. Go to: https://mundotango.app.n8n.cloud/workflows');
  console.log('2. Configure credentials for each workflow');
  console.log('3. Test each workflow');
  console.log('4. Activate when ready');
  
  return results;
}

// Export for use in other modules
export default N8NWorkflowCreator;