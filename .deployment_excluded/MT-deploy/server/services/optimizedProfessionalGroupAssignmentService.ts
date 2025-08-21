// 40x20s Framework - Optimized Professional Group Assignment Service
// Layer 8: API Services & Layer 21: Performance Optimization

import { db } from '../db';
import * as schema from '@shared/schema';
import { eq, and, inArray, sql } from 'drizzle-orm';
import { enhancedCache } from './enhancedCacheService';

interface GroupCache {
  [slug: string]: {
    id: number;
    name: string;
  };
}

export class OptimizedProfessionalGroupAssignmentService {
  private static roleToGroupMap: Record<string, string> = {
    'teacher': 'teachers-network',
    'dj': 'djs-united',
    'musician': 'musicians-guild',
    'organizer': 'organizers-hub',
    'host': 'hosts-alliance',
    'guide': 'guides-network',
    'photographer': 'photographers-circle',
    'content_creator': 'content-creators',
    'tango_traveler': 'tango-travelers',
    'tour_operator': 'tour-operators',
    'volunteer': 'volunteers-united',
    'historian': 'historians-society',
    'singer': 'singers-association',
    'taxi_dancer': 'taxi-dancers-network',
    'dancer_leader': 'dance-leaders-forum',
    'dancer_follower': 'dance-followers-forum',
    'dancer_switch': 'switch-dancers-group',
    'tango_school': 'tango-schools-network',
    'tango_house': 'tango-houses-association',
    'performer': 'performers-guild',
    'dancer': 'dancers-community'
  };

  private static groupCacheKey = 'professional-groups-cache';
  private static groupCacheTTL = 3600; // 1 hour

  /**
   * Get all professional groups with caching
   */
  private static async getCachedProfessionalGroups(): Promise<GroupCache> {
    // Try to get from cache first
    const cached = await enhancedCache.get<GroupCache>(this.groupCacheKey);
    if (cached) {
      return cached;
    }

    // Fetch all professional groups in one query
    const groups = await db
      .select({
        id: schema.groups.id,
        name: schema.groups.name,
        slug: schema.groups.slug
      })
      .from(schema.groups)
      .where(eq(schema.groups.type, 'professional'));

    // Build cache object
    const groupCache: GroupCache = {};
    groups.forEach(group => {
      groupCache[group.slug] = {
        id: group.id,
        name: group.name
      };
    });

    // Cache for future use
    await enhancedCache.set(this.groupCacheKey, groupCache, this.groupCacheTTL);
    
    return groupCache;
  }

  /**
   * Optimized batch assignment of user to professional groups
   */
  static async assignByRoles(userId: number, roles: string[]): Promise<{
    success: boolean;
    assignedGroups: string[];
    errors: string[];
    performanceMs: number;
  }> {
    const startTime = Date.now();
    console.log(`🚀 Optimized assignment for user ${userId} with roles:`, roles);
    
    const assignedGroups: string[] = [];
    const errors: string[] = [];

    if (!roles || roles.length === 0) {
      return { 
        success: true, 
        assignedGroups: [], 
        errors: [],
        performanceMs: Date.now() - startTime
      };
    }

    try {
      // Get all professional groups from cache
      const groupCache = await this.getCachedProfessionalGroups();
      
      // Map roles to group IDs
      const groupsToJoin: { id: number; name: string }[] = [];
      const groupIds: number[] = [];
      
      for (const role of roles) {
        const groupSlug = this.roleToGroupMap[role];
        if (groupSlug && groupCache[groupSlug]) {
          groupsToJoin.push(groupCache[groupSlug]);
          groupIds.push(groupCache[groupSlug].id);
        }
      }

      if (groupIds.length === 0) {
        return { 
          success: true, 
          assignedGroups: [], 
          errors: [],
          performanceMs: Date.now() - startTime
        };
      }

      // Check existing memberships in one query
      const existingMemberships = await db
        .select({
          groupId: schema.groupMembers.groupId
        })
        .from(schema.groupMembers)
        .where(
          and(
            eq(schema.groupMembers.userId, userId),
            inArray(schema.groupMembers.groupId, groupIds)
          )
        );

      const existingGroupIds = new Set(existingMemberships.map(m => m.groupId));
      const newGroupsToJoin = groupsToJoin.filter(g => !existingGroupIds.has(g.id));

      if (newGroupsToJoin.length > 0) {
        // Use transaction for batch insert
        await db.transaction(async (tx) => {
          // Batch insert new memberships
          const membershipsToInsert = newGroupsToJoin.map(group => ({
            groupId: group.id,
            userId: userId,
            role: 'member',
            joinedAt: new Date()
          }));

          await tx.insert(schema.groupMembers).values(membershipsToInsert);

          // Update member counts in batch
          for (const group of newGroupsToJoin) {
            await tx
              .update(schema.groups)
              .set({ 
                memberCount: sql`${schema.groups.memberCount} + 1` 
              })
              .where(eq(schema.groups.id, group.id));
          }
        });

        // Add newly joined groups to result
        assignedGroups.push(...newGroupsToJoin.map(g => g.name));
      }

      // Add already existing groups to result
      const existingGroups = groupsToJoin.filter(g => existingGroupIds.has(g.id));
      assignedGroups.push(...existingGroups.map(g => g.name));

      const performanceMs = Date.now() - startTime;
      console.log(`✅ Optimized assignment completed in ${performanceMs}ms`);

      return {
        success: true,
        assignedGroups,
        errors,
        performanceMs
      };
    } catch (error) {
      const performanceMs = Date.now() - startTime;
      console.error(`❌ Optimized assignment failed after ${performanceMs}ms:`, error);
      errors.push(error instanceof Error ? error.message : String(error));
      
      return {
        success: false,
        assignedGroups,
        errors,
        performanceMs
      };
    }
  }

  /**
   * Handle professional group assignment during registration
   */
  static async handleRegistration(userId: number, tangoRoles?: string[]): Promise<void> {
    if (!tangoRoles || tangoRoles.length === 0) {
      console.log(`No tango roles provided for user ${userId}, skipping professional group assignment`);
      return;
    }

    try {
      const result = await this.assignByRoles(userId, tangoRoles);
      
      if (result.success) {
        console.log(`🎉 Successfully assigned user ${userId} to ${result.assignedGroups.length} professional groups in ${result.performanceMs}ms`);
      } else {
        console.warn(`⚠️ Professional group assignment completed with errors after ${result.performanceMs}ms:`, result.errors);
      }
    } catch (error) {
      console.error('Failed to handle professional group assignment:', error);
      // Don't throw - we don't want to fail registration if group assignment fails
    }
  }

  /**
   * Clear the professional groups cache
   */
  static async clearCache(): Promise<void> {
    await enhancedCache.del(this.groupCacheKey);
    console.log('🧹 Professional groups cache cleared');
  }

  /**
   * Warm up the cache by pre-loading professional groups
   */
  static async warmCache(): Promise<void> {
    const start = Date.now();
    await this.getCachedProfessionalGroups();
    console.log(`🔥 Professional groups cache warmed in ${Date.now() - start}ms`);
  }
}

// Warm the cache on startup
OptimizedProfessionalGroupAssignmentService.warmCache().catch(console.error);