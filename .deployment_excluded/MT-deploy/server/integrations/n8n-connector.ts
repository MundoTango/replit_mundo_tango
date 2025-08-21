// n8n API Connector for Mundo Tango
// This connects to your external n8n instance

import fetch from 'node-fetch';

class N8nConnector {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    // Your n8n API key from the email
    this.apiKey = process.env.N8N_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzMzhkMzdlZi0wMTkwLTQ0MDctYmI1ZC1iZWEwNmRmYTIyYmUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDc5MTQ2fQ.vBp5_3hT7UrMNrVISxLgyu3VGD8DRR98IFBZ-jHyNsw';
    // Your n8n instance URL with API path
    this.baseUrl = process.env.N8N_BASE_URL || 'https://mundotango.app.n8n.cloud/api/v1';
    
    // Log configuration for debugging
    console.log('🔧 n8n Connector initialized');
    console.log('   API Key configured:', this.apiKey ? 'Yes' : 'No');
    console.log('   Base URL:', this.baseUrl);
  }

  // Test connection to n8n
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/workflows`, {
        headers: {
          'X-N8N-API-KEY': this.apiKey,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch (error) {
      console.error('n8n connection failed:', error);
      return false;
    }
  }

  // Trigger user onboarding workflow
  async triggerUserOnboarding(userData: {
    email: string;
    name: string;
    role: string;
  }): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/workflows/user-onboarding/activate`, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: userData.email,
          name: userData.name,
          role: userData.role,
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error(`n8n workflow trigger failed: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to trigger onboarding workflow:', error);
      throw error;
    }
  }

  // Sync user to HubSpot via n8n
  async syncToHubSpot(userData: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/workflows/hubspot-sync/activate`, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      return await response.json();
    } catch (error) {
      console.error('HubSpot sync failed:', error);
      throw error;
    }
  }

  // Process TestSprite results via n8n
  async processTestResults(testData: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/workflows/testsprite-process/activate`, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      });
      
      return await response.json();
    } catch (error) {
      console.error('TestSprite processing failed:', error);
      throw error;
    }
  }

  // Get all workflows
  async getWorkflows(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/workflows`, {
        headers: {
          'X-N8N-API-KEY': this.apiKey,
          'Content-Type': 'application/json'
        }
      });
      
      return await response.json();
    } catch (error) {
      console.error('Failed to get workflows:', error);
      throw error;
    }
  }

  // Create a new workflow from template
  async createWorkflowFromTemplate(template: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/workflows`, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(template)
      });
      
      return await response.json();
    } catch (error) {
      console.error('Failed to create workflow:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const n8nConnector = new N8nConnector();

// Helper function to setup n8n integration
export async function setupN8nIntegration(): Promise<{
  connected: boolean;
  workflows: any[];
  message: string;
}> {
  console.log('🔧 Setting up n8n integration...');
  
  const connected = await n8nConnector.testConnection();
  
  if (!connected) {
    return {
      connected: false,
      workflows: [],
      message: 'Failed to connect to n8n. Please check your N8N_BASE_URL and API key.'
    };
  }
  
  const workflows = await n8nConnector.getWorkflows();
  
  return {
    connected: true,
    workflows: workflows.data || [],
    message: `Successfully connected to n8n! Found ${workflows.data?.length || 0} workflows.`
  };
}

// Integration with user registration
export async function onUserRegistration(user: any): Promise<void> {
  try {
    // Trigger onboarding workflow in n8n
    await n8nConnector.triggerUserOnboarding({
      email: user.email,
      name: user.name || user.username,
      role: user.role || 'user'
    });
    
    // Sync to HubSpot
    await n8nConnector.syncToHubSpot(user);
    
    console.log(`✅ User ${user.email} onboarding workflows triggered`);
  } catch (error) {
    console.error('User onboarding automation failed:', error);
    // Don't throw - allow registration to continue even if automation fails
  }
}

// Integration with TestSprite
export async function onTestComplete(testResults: any): Promise<void> {
  try {
    await n8nConnector.processTestResults(testResults);
    console.log('✅ Test results sent to n8n for processing');
  } catch (error) {
    console.error('Test result processing failed:', error);
  }
}