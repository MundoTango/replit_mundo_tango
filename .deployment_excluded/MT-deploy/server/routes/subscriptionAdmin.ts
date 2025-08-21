import { Request, Response } from 'express';
import { isFeatureEnabled, featureFlags, getClientFeatureFlags } from '../lib/feature-flags';
import { db } from '../db';
import { subscriptions, users, paymentMethods, transactions } from '../../shared/schema';
import { sql } from 'drizzle-orm';
import { storage } from '../storage';

// Feature flag to tier mapping
const featureTierMappings: Record<string, string[]> = {
  'subscription-free-tier': ['free'],
  'subscription-basic-tier': ['basic'],
  'subscription-enthusiast-tier': ['enthusiast'],
  'subscription-professional-tier': ['professional'],
  'subscription-enterprise-tier': ['enterprise'],
  'life-ceo-performance': ['basic', 'enthusiast', 'professional', 'enterprise'],
  'predictive-caching': ['enthusiast', 'professional', 'enterprise'],
  'smart-resource-loading': ['basic', 'enthusiast', 'professional', 'enterprise'],
  'virtual-scrolling': ['free', 'basic', 'enthusiast', 'professional', 'enterprise'],
  'cdn-optimization': ['basic', 'enthusiast', 'professional', 'enterprise'],
  'advanced-monitoring': ['professional', 'enterprise'],
};

export function registerSubscriptionAdminRoutes(app: any) {
  // Get feature flags with tier mappings
  app.get('/api/admin/subscription/feature-flags', async (req: Request, res: Response) => {
    try {
      const mappings = [];
      
      // Get all feature flags and their mappings
      for (const [key, flag] of featureFlags.entries()) {
        if (!key.startsWith('subscription-')) {
          mappings.push({
            flag: key,
            description: flag.description,
            tiers: featureTierMappings[key] || []
          });
        }
      }
      
      res.json({
        mappings,
        tiers: {
          free: { name: 'Free Tier', price: 0 },
          basic: { name: 'Basic ($5/mo)', price: 5 },
          enthusiast: { name: 'Enthusiast ($9.99/mo)', price: 9.99 },
          professional: { name: 'Professional ($24.99/mo)', price: 24.99 },
          enterprise: { name: 'Enterprise ($99.99/mo)', price: 99.99 }
        }
      });
    } catch (error) {
      console.error('Error fetching feature flags:', error);
      res.status(500).json({ error: 'Failed to fetch feature flags' });
    }
  });

  // Update feature flag tier mapping
  app.put('/api/admin/subscription/feature-mapping', async (req: Request, res: Response) => {
    try {
      const { flag, tiers } = req.body;
      
      // Update the mapping
      featureTierMappings[flag] = tiers;
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating feature mapping:', error);
      res.status(500).json({ error: 'Failed to update feature mapping' });
    }
  });

  // Get subscription analytics
  app.get('/api/admin/subscription/analytics', async (req: Request, res: Response) => {
    try {
      // Get total subscribers by tier
      const subscribers = await db
        .select({
          tier: subscriptions.planId,
          count: sql<number>`count(*)::int`
        })
        .from(subscriptions)
        .where(sql`status = 'active'`)
        .groupBy(subscriptions.planId);

      // Calculate totals
      const totalSubscribers = subscribers.reduce((sum, s) => sum + s.count, 0);
      const tierDistribution: Record<string, number> = {};
      
      subscribers.forEach(s => {
        tierDistribution[s.tier] = s.count;
      });

      // Calculate monthly revenue
      const monthlyRevenue = 
        (tierDistribution['basic'] || 0) * 5 +
        (tierDistribution['enthusiast'] || 0) * 9.99 +
        (tierDistribution['professional'] || 0) * 24.99 +
        (tierDistribution['enterprise'] || 0) * 99.99;

      // Get recent activity (mock data for now)
      const recentActivity = [
        {
          userName: 'Maria Rodriguez',
          type: 'upgrade',
          toTier: 'Basic',
          timestamp: new Date(Date.now() - 3600000).toLocaleString()
        },
        {
          userName: 'Carlos Mendez',
          type: 'new',
          tier: 'Basic',
          timestamp: new Date(Date.now() - 7200000).toLocaleString()
        },
        {
          userName: 'Ana Silva',
          type: 'cancel',
          fromTier: 'Basic',
          timestamp: new Date(Date.now() - 10800000).toLocaleString()
        }
      ];

      res.json({
        totalSubscribers,
        monthlyRevenue: monthlyRevenue.toFixed(2),
        conversionRate: 12.5, // Mock data
        churnRate: 2.3, // Mock data
        tierDistribution,
        recentActivity
      });
    } catch (error) {
      console.error('Error fetching subscription analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  // Check user's subscription features
  app.get('/api/user/subscription-features', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Get user's subscription tier
      const userSubscription = await db
        .select()
        .from(subscriptions)
        .where(sql`user_id = ${userId} AND status = 'active'`)
        .limit(1);

      const tier = userSubscription[0]?.planId || 'free';
      
      // Get all features available for this tier
      const availableFeatures: Record<string, boolean> = {};
      
      for (const [feature, tiers] of Object.entries(featureTierMappings)) {
        availableFeatures[feature] = tiers.includes(tier);
      }

      res.json({
        tier,
        features: availableFeatures
      });
    } catch (error) {
      console.error('Error fetching user subscription features:', error);
      res.status(500).json({ error: 'Failed to fetch subscription features' });
    }
  });
}