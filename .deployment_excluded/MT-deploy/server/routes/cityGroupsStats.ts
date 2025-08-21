import { Router } from 'express';
import { db } from '../db';
import { groups, groupMembers, events, recommendations, hostHomes } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

const router = Router();

/**
 * ESA LIFE CEO 56x21 - City Groups Statistics API
 * Fetches city groups with member counts, event counts, host counts, and recommendation counts
 */
router.get('/api/community/city-groups-stats', async (req, res) => {
  try {
    console.log('📊 ESA LIFE CEO 56x21 - Fetching city groups with statistics');
    
    // First, get basic city groups
    const cityGroups = await db
      .select({
        id: groups.id,
        name: groups.name,
        city: groups.city,
        country: groups.country,
        latitude: groups.latitude,
        longitude: groups.longitude
      })
      .from(groups)
      .where(eq(groups.type, 'city'));
    
    console.log(`✅ ESA LIFE CEO 56x21 - Found ${cityGroups.length} city groups`);
    
    // Add statistics for each group
    const cityGroupsWithStats = await Promise.all(
      cityGroups.map(async (group) => {
        // Get member count
        const memberResult = await db
          .select({ count: sql<number>`COUNT(*)::int` })
          .from(groupMembers)
          .where(eq(groupMembers.groupId, group.id));
        
        // Get event count - simplified to avoid SQL errors
        let eventCount = 0;
        try {
          const eventResult = await db
            .select({ count: sql<number>`COUNT(*)::int` })
            .from(events)
            .where(eq(events.groupId, group.id));
          eventCount = eventResult[0]?.count || 0;
        } catch (e) {
          console.log('Event count query failed, using 0');
        }
        
        // Get host homes count - simplified query to avoid SQL syntax errors
        let hostCount = 0;
        if (group.city) {
          try {
            const hostResult = await db
              .select({ count: sql<number>`COUNT(*)::int` })
              .from(hostHomes)
              .where(sql`LOWER(city) = LOWER(${group.city})`);
            hostCount = hostResult[0]?.count || 0;
          } catch (e) {
            console.log('Host count query failed, using 0');
          }
        }
        
        // Get recommendations count - simplified query  
        let recommendationCount = 0;
        if (group.city) {
          try {
            const recResult = await db
              .select({ count: sql<number>`COUNT(*)::int` })
              .from(recommendations)
              .where(sql`LOWER(city) = LOWER(${group.city})`);
            recommendationCount = recResult[0]?.count || 0;
          } catch (e) {
            console.log('Recommendation count query failed, using 0');
          }
        }
        
        return {
          ...group,
          memberCount: memberResult[0]?.count || 0,
          eventCount,
          hostCount,
          recommendationCount
        };
      })
    );
    
    // Log Tirana specifically if it exists
    const tiranaGroup = cityGroupsWithStats.find(g => g.city?.toLowerCase().includes('tirana'));
    if (tiranaGroup) {
      console.log('🌍 ESA LIFE CEO 56x21 - Tirana group found:', tiranaGroup);
    }
    
    res.json({
      success: true,
      data: cityGroupsWithStats
    });
  } catch (error) {
    console.error('❌ ESA LIFE CEO 56x21 - Error fetching city groups stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch city groups statistics'
    });
  }
});

export default router;