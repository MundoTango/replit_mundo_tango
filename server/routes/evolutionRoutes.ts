import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import EvolutionService from '../../evolution/services/evolutionService.js';
import HierarchyAnalyzer from '../../evolution/services/hierarchyAnalyzer.js';

const router = express.Router();

// Initialize services
const rootPath = process.cwd();
const evolutionService = new EvolutionService(rootPath);
const hierarchyAnalyzer = new HierarchyAnalyzer();

// Disabled evolution service startup initialization for performance
// The service will be initialized on-demand when first requested
// (async () => {
//   try {
//     await evolutionService.initialize();
//     console.log('✅ Evolution service initialized');
//   } catch (error) {
//     console.error('Failed to initialize evolution service:', error);
//   }
// })();

// Get latest metrics
router.get('/metrics/latest', async (req, res) => {
  try {
    const metricsDir = path.join(rootPath, 'evolution/metrics');
    const files = await fs.readdir(metricsDir);
    
    if (files.length === 0) {
      // Run analysis if no metrics exist
      const metrics = await evolutionService.analyze();
      return res.json(metrics);
    }

    // Get the most recent metrics file
    const sortedFiles = files.sort().reverse();
    const latestFile = sortedFiles[0];
    const content = await fs.readFile(path.join(metricsDir, latestFile), 'utf-8');
    
    res.json(JSON.parse(content));
  } catch (error) {
    console.error('Failed to get metrics:', error);
    res.status(500).json({ error: 'Failed to retrieve metrics' });
  }
});

// Get all metrics history
router.get('/metrics/history', async (req, res) => {
  try {
    const metricsDir = path.join(rootPath, 'evolution/metrics');
    const files = await fs.readdir(metricsDir);
    
    const metrics = await Promise.all(
      files.map(async (file) => {
        const content = await fs.readFile(path.join(metricsDir, file), 'utf-8');
        return JSON.parse(content);
      })
    );
    
    res.json(metrics.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ));
  } catch (error) {
    console.error('Failed to get metrics history:', error);
    res.status(500).json({ error: 'Failed to retrieve metrics history' });
  }
});

// Trigger manual analysis
router.post('/analyze', async (req, res) => {
  try {
    const metrics = await evolutionService.analyze();
    res.json(metrics);
  } catch (error) {
    console.error('Failed to run analysis:', error);
    res.status(500).json({ error: 'Failed to run analysis' });
  }
});

// Get import graph
router.get('/import-graph', async (req, res) => {
  try {
    const graph = await hierarchyAnalyzer.buildImportGraph(rootPath);
    
    // Convert Map to object for JSON serialization
    const graphObject: Record<string, string[]> = {};
    for (const [key, value] of graph) {
      graphObject[key] = Array.from(value);
    }
    
    res.json(graphObject);
  } catch (error) {
    console.error('Failed to build import graph:', error);
    res.status(500).json({ error: 'Failed to build import graph' });
  }
});

// Get circular dependencies
router.get('/circular-dependencies', async (req, res) => {
  try {
    const graph = await hierarchyAnalyzer.buildImportGraph(rootPath);
    const cycles = hierarchyAnalyzer.findCircularDependencies(graph);
    
    res.json({ cycles });
  } catch (error) {
    console.error('Failed to find circular dependencies:', error);
    res.status(500).json({ error: 'Failed to find circular dependencies' });
  }
});

// Get file analysis
router.get('/analyze-file', async (req, res) => {
  const { path: filePath } = req.query;
  
  if (!filePath || typeof filePath !== 'string') {
    return res.status(400).json({ error: 'File path is required' });
  }

  try {
    const absolutePath = path.join(rootPath, filePath);
    const analysis = await hierarchyAnalyzer.analyzeFile(absolutePath);
    
    res.json(analysis);
  } catch (error) {
    console.error('Failed to analyze file:', error);
    res.status(500).json({ error: 'Failed to analyze file' });
  }
});

// Evolution service event stream
router.get('/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  const sendEvent = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Listen for evolution service events
  evolutionService.on('suggestion', (suggestion) => {
    sendEvent({ type: 'suggestion', data: suggestion });
  });

  // Send heartbeat every 30 seconds
  const heartbeat = setInterval(() => {
    res.write(':heartbeat\n\n');
  }, 30000);

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
    evolutionService.removeAllListeners('suggestion');
  });
});

export default router;