import { Router } from 'express';
import { lifeCeoLearningAbsorption } from '../services/lifeCeoLearningAbsorptionService';

const router = Router();

// Get all absorbed learnings
router.get('/api/life-ceo/learnings/absorbed', async (req, res) => {
  try {
    const metrics = lifeCeoLearningAbsorption.getMetrics();
    
    res.json({
      success: true,
      metrics,
      lastUpdated: new Date(),
      message: 'Life CEO has absorbed learnings from 24-hour debugging session'
    });
  } catch (error) {
    console.error('Error fetching absorbed learnings:', error);
    res.status(500).json({ error: 'Failed to fetch learnings' });
  }
});

// Apply learned patterns to code
router.post('/api/life-ceo/learnings/apply', async (req, res) => {
  try {
    const { code, context } = req.body;
    
    if (!code || !context) {
      return res.status(400).json({ error: 'Code and context are required' });
    }
    
    const improvedCode = lifeCeoLearningAbsorption.applyPattern(code, context);
    const predictions = lifeCeoLearningAbsorption.predictIssues(context, code);
    const recommendations = lifeCeoLearningAbsorption.getRecommendations(context);
    
    res.json({
      success: true,
      improvedCode,
      predictions,
      recommendations,
      codeChanged: improvedCode !== code
    });
  } catch (error) {
    console.error('Error applying patterns:', error);
    res.status(500).json({ error: 'Failed to apply patterns' });
  }
});

// Get recommendations for a context
router.post('/api/life-ceo/learnings/recommend', async (req, res) => {
  try {
    const { context } = req.body;
    
    if (!context) {
      return res.status(400).json({ error: 'Context is required' });
    }
    
    const recommendations = lifeCeoLearningAbsorption.getRecommendations(context);
    
    res.json({
      success: true,
      recommendations,
      context
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

export default router;