import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

// Life CEO 40x20s OpenAPI Configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mundo Tango Life CEO API',
      version: '4.0.0',
      description: 'High-performance API built with 40x20s methodology',
      contact: {
        name: 'Life CEO Support',
        email: 'support@mundotango.life'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        sessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            statusCode: { type: 'number' }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            message: { type: 'string' }
          }
        },
        PerformanceMetric: {
          type: 'object',
          properties: {
            metric: { type: 'string' },
            value: { type: 'number' },
            timestamp: { type: 'string', format: 'date-time' },
            phase: { type: 'string' }
          }
        },
        CacheStats: {
          type: 'object',
          properties: {
            hitRate: { type: 'number' },
            totalHits: { type: 'number' },
            totalMisses: { type: 'number' },
            avgGetTime: { type: 'number' },
            avgSetTime: { type: 'number' }
          }
        }
      }
    },
    tags: [
      { name: 'Authentication', description: 'User authentication endpoints' },
      { name: 'Posts', description: 'Social posts and memories' },
      { name: 'Groups', description: 'Community groups management' },
      { name: 'Events', description: 'Event management' },
      { name: 'Performance', description: 'Performance monitoring' },
      { name: 'Life CEO', description: 'Life CEO AI features' },
      { name: 'Cache', description: 'Cache management' },
      { name: 'Health', description: 'System health checks' }
    ]
  },
  apis: ['./server/routes.ts', './server/routes/*.ts'] // Path to files with JSDoc comments
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Custom UI options with 40x20s branding
export const swaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { 
      background-color: #38b2ac; 
      border-bottom: 3px solid #06b6d4;
    }
    .swagger-ui .topbar .download-url-wrapper { display: none; }
    .swagger-ui .scheme-container { background: #f0fdfa; }
    .swagger-ui .btn.authorize { background-color: #38b2ac; }
    .swagger-ui .btn.authorize:hover { background-color: #2c7a7b; }
  `,
  customSiteTitle: 'Mundo Tango Life CEO API Documentation',
  customfavIcon: '/favicon.ico'
};

// Function to set up Swagger UI
export const setupSwagger = (app: Express) => {
  // Serve API documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
  
  // Serve OpenAPI spec as JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};