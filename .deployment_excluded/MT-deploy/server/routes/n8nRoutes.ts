import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';

// Type-safe import for n8n auto-create
const autoCreateN8NWorkflows = async (apiKey: string) => {
  const { autoCreateN8NWorkflows: createFn } = await import('../n8n-auto-create.js');
  return createFn(apiKey);
};

const router = Router();

/**
 * ESA Life CEO 53x21s - Layer 51 Routes
 * n8n Workflow Management API
 */

// Auto-create all n8n workflows
router.post('/create-workflows', isAuthenticated, async (req, res) => {
  try {
    // Auto-creating n8n workflows
    
    const apiKey = process.env.N8N_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'N8N_API_KEY not configured'
      });
    }

    const results = await autoCreateN8NWorkflows(apiKey);
    
    res.json({
      success: true,
      message: 'n8n workflows created successfully',
      workflows: results
    });

  } catch (error) {
    console.error('❌ Error creating n8n workflows:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get workflow status
router.get('/workflow-status', isAuthenticated, async (req, res) => {
  try {
    const apiKey = process.env.N8N_API_KEY;
    const baseUrl = process.env.N8N_BASE_URL || 'https://mundotango.app.n8n.cloud';
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'N8N_API_KEY not configured'
      });
    }

    // Fetch workflows from n8n
    const response = await fetch(`${baseUrl}/api/v1/workflows`, {
      headers: {
        'X-N8N-API-KEY': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`n8n API error: ${response.statusText}`);
    }

    const workflows = await response.json();
    
    res.json({
      success: true,
      workflows: workflows.data || workflows
    });

  } catch (error) {
    console.error('❌ Error fetching workflow status:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;