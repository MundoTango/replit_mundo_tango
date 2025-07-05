// API Gateway for Inter-System Communication
import express, { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { ClientRequest } from 'http';

const app = express();

// Extend Express Request type to include userContext
interface AuthenticatedRequest extends Request {
  userContext?: any;
}

// Service Registry
const services: Record<string, string> = {
  lifeCeo: process.env.LIFE_CEO_URL || 'http://localhost:4001',
  mundoTango: process.env.MUNDO_TANGO_URL || 'http://localhost:4002',
  // Future communities can be added here
};

// Authentication Bridge Middleware
const authBridge = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Extract authentication from request
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No authentication token' });
    }

    // Validate token and extract user context
    // This would integrate with your SSO provider
    const userContext = await validateToken(token);
    
    // Add user context to request
    req.userContext = userContext;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid authentication' });
  }
};

// Cross-System Data Contract Validation
const validateDataContract = (systemFrom: string, systemTo: string) => {
  return (req: any, res: any, next: any) => {
    // Validate that data conforms to agreed contract
    // This ensures systems remain independent
    const isValid = validateContract(req.body, systemFrom, systemTo);
    
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid data contract' });
    }
    
    next();
  };
};

// Route to Life CEO System
app.use('/api/life-ceo', authBridge, createProxyMiddleware({
  target: services.lifeCeo,
  changeOrigin: true,
  pathRewrite: { '^/api/life-ceo': '/api' },
  on: {
    proxyReq: (proxyReq: ClientRequest, req: any) => {
      // Add user context to proxied request
      if (req.userContext) {
        proxyReq.setHeader('X-User-Context', JSON.stringify(req.userContext));
      }
    }
  }
} as unknown as Options));

// Route to Mundo Tango
app.use('/api/mundo-tango', authBridge, createProxyMiddleware({
  target: services.mundoTango,
  changeOrigin: true,
  pathRewrite: { '^/api/mundo-tango': '/api' },
  on: {
    proxyReq: (proxyReq: ClientRequest, req: any) => {
      // Add user context to proxied request
      if (req.userContext) {
        proxyReq.setHeader('X-User-Context', JSON.stringify(req.userContext));
      }
    }
  }
} as unknown as Options));

// Cross-System Communication Endpoints
app.post('/api/cross-system/life-event', 
  authBridge, 
  validateDataContract('life-ceo', 'community'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Life CEO notifying communities about life events
      const { event, targetCommunities } = req.body;
      
      // Route to appropriate communities
      const results = await Promise.all(
        targetCommunities.map((community: string) => 
          notifyCommunity(community, event, req.userContext)
        )
      );
      
      res.json({ success: true, results });
    } catch (error) {
      res.status(500).json({ error: 'Failed to notify communities' });
    }
  }
);

app.post('/api/cross-system/community-activity',
  authBridge,
  validateDataContract('community', 'life-ceo'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Community notifying Life CEO about user activity
      const { activity, community } = req.body;
      
      // Send to Life CEO for processing
      const result = await notifyLifeCeo(activity, community, req.userContext);
      
      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ error: 'Failed to notify Life CEO' });
    }
  }
);

// System Health Check
app.get('/api/health', async (req, res) => {
  const health: {
    gateway: string;
    services: Record<string, string>;
  } = {
    gateway: 'healthy',
    services: {}
  };
  
  // Check each service
  for (const [name, url] of Object.entries(services)) {
    try {
      const response = await fetch(`${url}/health`);
      health.services[name] = response.ok ? 'healthy' : 'unhealthy';
    } catch {
      health.services[name] = 'unreachable';
    }
  }
  
  res.json(health);
});

// Helper Functions
async function validateToken(token: string): Promise<any> {
  // Implement token validation with your SSO provider
  // Return user context including ID and authorized systems
  return {
    userId: 'user-123',
    authorizedSystems: ['life-ceo', 'mundo-tango'],
    preferences: {
      unifiedView: false // User preference for viewing mode
    }
  };
}

function validateContract(data: any, from: string, to: string): boolean {
  // Implement contract validation based on agreed schemas
  return true;
}

async function notifyCommunity(community: string, event: any, userContext: any) {
  // Send event to specific community
  const url = services[community] || services.mundoTango;
  const response = await fetch(`${url}/api/life-events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Context': JSON.stringify(userContext)
    },
    body: JSON.stringify({ event })
  });
  return response.json();
}

async function notifyLifeCeo(activity: any, community: string, userContext: any) {
  // Send activity to Life CEO
  const response = await fetch(`${services.lifeCeo}/api/community-activity`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Context': JSON.stringify(userContext)
    },
    body: JSON.stringify({ activity, community })
  });
  return response.json();
}

// Start Gateway
const PORT = process.env.GATEWAY_PORT || 4000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log('Registered services:', Object.keys(services));
});