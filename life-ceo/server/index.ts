// Life CEO Backend Server
import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import { BusinessAgent } from '../agents/business-agent';

const app = express();
const port = process.env.LIFE_CEO_PORT || 4001;

// Database connection
const pool = new Pool({
  connectionString: process.env.LIFE_CEO_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors());
app.use(express.json());

// Agent instances
const agents = {
  business: new BusinessAgent()
};

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'life-ceo',
    agents: Object.keys(agents).length,
    timestamp: new Date().toISOString()
  });
});

// Process voice command
app.post('/api/process-command', async (req, res) => {
  try {
    const { command, context } = req.body;
    const userContext = req.headers['x-user-context'] 
      ? JSON.parse(req.headers['x-user-context'] as string) 
      : null;

    if (!userContext) {
      return res.status(401).json({ error: 'User context required' });
    }

    // Store voice command
    await pool.query(
      `INSERT INTO life_ceo.voice_commands 
       (user_id, transcript, language, context, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [userContext.userId, command, context.language || 'es-AR', context]
    );

    // Process with appropriate agent (simplified for now)
    const response = await processCommand(command, context, userContext);

    res.json(response);
  } catch (error) {
    console.error('Error processing command:', error);
    res.status(500).json({ error: 'Failed to process command' });
  }
});

// Get agent status
app.get('/api/agents/status', async (req, res) => {
  try {
    const userContext = req.headers['x-user-context'] 
      ? JSON.parse(req.headers['x-user-context'] as string) 
      : null;

    if (!userContext) {
      return res.status(401).json({ error: 'User context required' });
    }

    // Get agent statuses
    const statuses = Object.entries(agents).map(([type, agent]) => ({
      type,
      name: agent.getConfig().name,
      status: 'active', // Simplified
      taskCount: agent.getActiveTaskCount()
    }));

    res.json({ agents: statuses });
  } catch (error) {
    console.error('Error getting agent status:', error);
    res.status(500).json({ error: 'Failed to get agent status' });
  }
});

// Get user tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const userContext = req.headers['x-user-context'] 
      ? JSON.parse(req.headers['x-user-context'] as string) 
      : null;

    if (!userContext) {
      return res.status(401).json({ error: 'User context required' });
    }

    const result = await pool.query(
      `SELECT * FROM life_ceo.tasks 
       WHERE user_id = $1 
       ORDER BY due_date ASC NULLS LAST, created_at DESC`,
      [userContext.userId]
    );

    res.json({ tasks: result.rows });
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({ error: 'Failed to get tasks' });
  }
});

// Get insights
app.get('/api/insights', async (req, res) => {
  try {
    const userContext = req.headers['x-user-context'] 
      ? JSON.parse(req.headers['x-user-context'] as string) 
      : null;

    if (!userContext) {
      return res.status(401).json({ error: 'User context required' });
    }

    const result = await pool.query(
      `SELECT * FROM life_ceo.insights 
       WHERE user_id = $1 AND (expires_at IS NULL OR expires_at > NOW())
       ORDER BY created_at DESC
       LIMIT 10`,
      [userContext.userId]
    );

    res.json({ insights: result.rows });
  } catch (error) {
    console.error('Error getting insights:', error);
    res.status(500).json({ error: 'Failed to get insights' });
  }
});

// Handle life events from communities
app.post('/api/life-events', async (req, res) => {
  try {
    const userContext = req.headers['x-user-context'] 
      ? JSON.parse(req.headers['x-user-context'] as string) 
      : null;

    if (!userContext) {
      return res.status(401).json({ error: 'User context required' });
    }

    const { event } = req.body;

    // Process event with relevant agents
    // This would trigger appropriate agent responses
    console.log('Received life event:', event);

    res.json({ success: true });
  } catch (error) {
    console.error('Error handling life event:', error);
    res.status(500).json({ error: 'Failed to handle life event' });
  }
});

// Simple command processor (would use AI in production)
async function processCommand(command: string, context: any, userContext: any) {
  const lowerCommand = command.toLowerCase();
  
  // Simple pattern matching for demo
  if (lowerCommand.includes('meeting') || lowerCommand.includes('schedule')) {
    return {
      response: 'I\'ll help you schedule that meeting. When would you like to have it?',
      agent: 'business',
      followUp: true
    };
  } else if (lowerCommand.includes('task') || lowerCommand.includes('todo')) {
    return {
      response: 'I\'ve added that to your task list. Would you like to set a deadline?',
      agent: 'workflow',
      followUp: true
    };
  } else if (lowerCommand.includes('finance') || lowerCommand.includes('money')) {
    return {
      response: 'I can help you with financial planning. What specific aspect would you like to discuss?',
      agent: 'finance',
      followUp: true
    };
  } else {
    return {
      response: 'I understand. Let me process that request for you.',
      agent: 'general',
      followUp: false
    };
  }
}

// Start server
app.listen(port, () => {
  console.log(`Life CEO server running on port ${port}`);
  console.log(`Buenos Aires timezone configured`);
  
  // Initialize agents
  Object.entries(agents).forEach(([type, agent]) => {
    agent.initialize({
      userId: 'system',
      location: {
        city: 'Buenos Aires',
        country: 'Argentina',
        timezone: 'America/Argentina/Buenos_Aires'
      },
      language: 'es-AR',
      preferences: {},
      currentTime: new Date()
    });
  });
});