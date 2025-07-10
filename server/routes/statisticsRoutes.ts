import { Express } from 'express';
import { db } from '../db';
import { users, events, posts, groups, eventRsvps, groupMembers, follows, tenants, tenantUsers } from '@shared/schema';
import { sql, eq, count, countDistinct, and, isNotNull, gte } from 'drizzle-orm';
import { flexibleAuth } from '../utils/authHelper';

export function registerStatisticsRoutes(app: Express) {
  // Global statistics across all tenants (super admin only)
  app.get('/api/statistics/global', flexibleAuth, async (req: any, res) => {
    try {
      const tenantId = req.headers['x-tenant-id'];
      
      // If no tenant selected, show global stats (super admin only)
      if (!tenantId && req.isSuperAdmin) {
        // Total users across all tenants
        const totalUsers = await db.select({ count: count() }).from(users);
        
        // Active cities
        const activeCities = await db
          .select({ count: countDistinct(users.city) })
          .from(users)
          .where(and(isNotNull(users.city), isNotNull(users.country)));
        
        // Total events
        const totalEvents = await db.select({ count: count() }).from(events);
        
        // Total connections
        const totalConnections = await db.select({ count: count() }).from(follows);
        
        // Total groups
        const totalGroups = await db.select({ count: count() }).from(groups);
        
        // Total memories/posts
        const totalMemories = await db.select({ count: count() }).from(posts);
        
        // Active tenants
        const activeTenants = await db
          .select({ count: count() })
          .from(tenants)
          .where(eq(tenants.isActive, true));
        
        // Top cities by user count
        const topCities = await db
          .select({
            city: users.city,
            country: users.country,
            userCount: count(users.id)
          })
          .from(users)
          .where(and(isNotNull(users.city), isNotNull(users.country)))
          .groupBy(users.city, users.country)
          .orderBy(sql`count(${users.id}) DESC`)
          .limit(10);
        
        res.json({
          success: true,
          data: {
            global: {
              totalUsers: totalUsers[0]?.count || 0,
              activeCities: activeCities[0]?.count || 0,
              totalEvents: totalEvents[0]?.count || 0,
              totalConnections: totalConnections[0]?.count || 0,
              totalGroups: totalGroups[0]?.count || 0,
              totalMemories: totalMemories[0]?.count || 0,
              activeTenants: activeTenants[0]?.count || 0
            },
            topCities: topCities.map(city => ({
              name: city.city,
              country: city.country,
              userCount: Number(city.userCount)
            }))
          }
        });
      } else if (tenantId) {
        // Tenant-specific statistics
        const tenantUserIds = await db
          .select({ userId: tenantUsers.userId })
          .from(tenantUsers)
          .where(eq(tenantUsers.tenantId, tenantId as string));
        
        const userIds = tenantUserIds.map(tu => tu.userId);
        
        if (userIds.length === 0) {
          return res.json({
            success: true,
            data: {
              tenant: {
                totalUsers: 0,
                activeCities: 0,
                totalEvents: 0,
                totalConnections: 0,
                totalGroups: 0,
                totalMemories: 0
              },
              topCities: []
            }
          });
        }
        
        // Tenant users
        const tenantUserCount = userIds.length;
        
        // Active cities in tenant
        const tenantCities = await db
          .select({ count: countDistinct(users.city) })
          .from(users)
          .where(and(
            sql`${users.id} = ANY(${userIds})`,
            isNotNull(users.city)
          ));
        
        // Events created by tenant users
        const tenantEvents = await db
          .select({ count: count() })
          .from(events)
          .where(sql`${events.createdBy} = ANY(${userIds})`);
        
        // Connections between tenant users
        const tenantConnections = await db
          .select({ count: count() })
          .from(follows)
          .where(and(
            sql`${follows.followerId} = ANY(${userIds})`,
            sql`${follows.followingId} = ANY(${userIds})`
          ));
        
        // Groups created by tenant users
        const tenantGroups = await db
          .select({ count: count() })
          .from(groups)
          .where(sql`${groups.createdBy} = ANY(${userIds})`);
        
        // Memories by tenant users
        const tenantMemories = await db
          .select({ count: count() })
          .from(posts)
          .where(sql`${posts.userId} = ANY(${userIds})`);
        
        // Top cities in tenant
        const tenantTopCities = await db
          .select({
            city: users.city,
            country: users.country,
            userCount: count(users.id)
          })
          .from(users)
          .where(and(
            sql`${users.id} = ANY(${userIds})`,
            isNotNull(users.city)
          ))
          .groupBy(users.city, users.country)
          .orderBy(sql`count(${users.id}) DESC`)
          .limit(10);
        
        res.json({
          success: true,
          data: {
            tenant: {
              totalUsers: tenantUserCount,
              activeCities: tenantCities[0]?.count || 0,
              totalEvents: tenantEvents[0]?.count || 0,
              totalConnections: tenantConnections[0]?.count || 0,
              totalGroups: tenantGroups[0]?.count || 0,
              totalMemories: tenantMemories[0]?.count || 0
            },
            topCities: tenantTopCities.map(city => ({
              name: city.city,
              country: city.country,
              userCount: Number(city.userCount)
            }))
          }
        });
      } else {
        res.status(403).json({
          success: false,
          error: 'Unauthorized to view global statistics'
        });
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch statistics'
      });
    }
  });
  
  // Real-time statistics updates endpoint
  app.get('/api/statistics/realtime', flexibleAuth, async (req: any, res) => {
    try {
      // Get statistics from last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      // New users in last 24h
      const newUsers = await db
        .select({ count: count() })
        .from(users)
        .where(gte(users.createdAt, yesterday));
      
      // New events in last 24h
      const newEvents = await db
        .select({ count: count() })
        .from(events)
        .where(gte(events.createdAt, yesterday));
      
      // New posts in last 24h
      const newPosts = await db
        .select({ count: count() })
        .from(posts)
        .where(gte(posts.createdAt, yesterday));
      
      // Active users (posted in last 24h)
      const activeUsers = await db
        .select({ count: countDistinct(posts.userId) })
        .from(posts)
        .where(gte(posts.createdAt, yesterday));
      
      res.json({
        success: true,
        data: {
          last24Hours: {
            newUsers: newUsers[0]?.count || 0,
            newEvents: newEvents[0]?.count || 0,
            newPosts: newPosts[0]?.count || 0,
            activeUsers: activeUsers[0]?.count || 0
          },
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error fetching realtime statistics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch realtime statistics'
      });
    }
  });
}