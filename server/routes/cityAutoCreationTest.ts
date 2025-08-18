import { Router } from 'express';
import { CityAutoCreationService } from '../services/cityAutoCreationService';
import { CityNormalizationService } from '../services/cityNormalizationService';
import { db } from '../db';
import { groups } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

// Test endpoint for city normalization
router.post('/api/test/city-normalization', async (req, res) => {
  try {
    const { city, country, state } = req.body;
    
    if (!city || !country) {
      return res.status(400).json({ error: 'City and country are required' });
    }
    
    const result = await CityNormalizationService.normalizeCity(city, country, state);
    
    res.json({
      success: true,
      input: { city, country, state },
      result
    });
  } catch (error: any) {
    console.error('City normalization test failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint for city auto-creation
router.post('/api/test/city-auto-creation', async (req, res) => {
  try {
    const { city, country, userId, triggerType } = req.body;
    
    if (!city || !country || !userId) {
      return res.status(400).json({ error: 'City, country, and userId are required' });
    }
    
    let result;
    
    switch (triggerType) {
      case 'registration':
        result = await CityAutoCreationService.handleUserRegistration(
          userId,
          city,
          country
        );
        break;
      case 'recommendation':
        result = await CityAutoCreationService.handleRecommendation(
          1, // dummy recommendation ID
          city,
          country,
          userId
        );
        break;
      case 'event':
        result = await CityAutoCreationService.handleEvent(
          1, // dummy event ID
          city,
          country,
          userId
        );
        break;
      default:
        return res.status(400).json({ error: 'Invalid trigger type' });
    }
    
    res.json({
      success: true,
      result
    });
  } catch (error: any) {
    console.error('City auto-creation test failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get city creation statistics
router.get('/api/test/city-creation-stats', async (req, res) => {
  try {
    const stats = await CityAutoCreationService.getCreationStats();
    
    // Also get total city groups
    const cityGroups = await db
      .select()
      .from(groups)
      .where(eq(groups.type, 'city'));
    
    res.json({
      success: true,
      stats,
      totalCityGroups: cityGroups.length,
      cityGroups: cityGroups.map(g => ({
        id: g.id,
        name: g.name,
        city: g.city,
        country: g.country,
        memberCount: 0 // You could join with group_members to get real count
      }))
    });
  } catch (error: any) {
    console.error('Failed to get city creation stats:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;